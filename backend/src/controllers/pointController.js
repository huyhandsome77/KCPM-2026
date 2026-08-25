const { User, Order, sequelize } = require('../models');

exports.addPointsFromOrder = async (req, res, next) => {
    const t = await sequelize.transaction();
    try {
        const { phone, orderId } = req.body;

        if (!phone || typeof phone !== 'string' || phone.trim() === '') {
            return res.status(400).json({ message: "Vui lòng nhập Số điện thoại hợp lệ" });
        }

        if (orderId === undefined || orderId === null || isNaN(orderId) || Number(orderId) <= 0) {
            return res.status(400).json({ message: "Mã hóa đơn không hợp lệ (phải là số nguyên dương)" });
        }

        const user = await User.findOne({ where: { phone } });
        if (!user) {
            return res.status(404).json({ message: "Không tìm thấy khách hàng với số điện thoại này" });
        }

        const order = await Order.findByPk(orderId);
        if (!order) {
            return res.status(404).json({ message: "Không tìm thấy mã hóa đơn này trong hệ thống" });
        }

        if (order.paymentStatus !== 'PAID' || order.status !== 'COMPLETED') {
            return res.status(400).json({ message: "Đơn hàng này chưa hoàn thành hoặc chưa thanh toán" });
        }

        if (order.isPointsAdded) {
            return res.status(400).json({ message: "Đơn hàng này đã được tích điểm trước đó" });
        }

        const pointRate = 0.05;
        const earnedPoints = Math.round(parseFloat(order.finalPrice) * pointRate);

        await user.increment('points', { by: earnedPoints, transaction: t });
        await order.update({ isPointsAdded: true }, { transaction: t });

        await t.commit();

        res.json({
            message: `Tích điểm thành công cho khách hàng ${user.fullName}`,
            earnedPoints,
            totalPoints: user.points + earnedPoints
        });

    } catch (error) {
        await t.rollback();
        console.error("Add Points Error:", error);
        res.status(500).json({ message: "Lỗi hệ thống khi tích điểm", error: error.message });
    }
};
