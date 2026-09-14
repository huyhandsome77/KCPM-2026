const { User, Order, sequelize } = require('../models');

exports.addPointsFromOrder = async (req, res, next) => {
    let t;
    try {
        const { phone, orderId } = req.body || {};

        if (!phone || typeof phone !== 'string' || phone.trim() === '') {
            return res.status(400).json({ message: "Vui lòng nhập Số điện thoại hợp lệ" });
        }

        if (orderId === undefined || orderId === null || isNaN(orderId) || Number(orderId) <= 0 || !Number.isInteger(Number(orderId))) {
            return res.status(400).json({ message: "Mã hóa đơn không hợp lệ (phải là số nguyên dương)" });
        }

        const user = await User.findOne({ where: { phone: phone.trim() } });
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

        t = await sequelize.transaction();

        const MAX_POINTS = 10000000;
        const pointRate = 0.05;
        const finalPrice = parseFloat(order.finalPrice || order.totalPrice || 0);
        const earnedPoints = Math.round(finalPrice * pointRate);
        const previousPoints = user.points || 0;
        const currentPoints = Math.min(MAX_POINTS, previousPoints + earnedPoints);
        const actualPointsToAdd = Math.max(0, currentPoints - previousPoints);

        if (actualPointsToAdd > 0) {
            await user.increment('points', { by: actualPointsToAdd, transaction: t });
        }
        await order.update({ isPointsAdded: true }, { transaction: t });

        await t.commit();

        return res.status(200).json({
            message: `Tích điểm thành công cho khách hàng ${user.fullName}`,
            earnedPoints,
            totalPoints: currentPoints
        });

    } catch (error) {
        if (t) await t.rollback();
        console.error("Add Points Error:", error);
        return res.status(500).json({ message: "Lỗi hệ thống khi tích điểm", error: error.message });
    }
};
