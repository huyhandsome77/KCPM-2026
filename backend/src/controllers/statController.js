const { Order } = require('../models');
const { Op } = require('sequelize');
const sequelize = require('sequelize');

exports.getStats = async (req, res, next) => {
    try {
        const { type = 'day', date } = req.query;
        let startDate, endDate;

        const normalizedType = ['day', 'month', 'year'].includes(type) ? type : 'day';

        let targetDate = new Date();
        if (date) {
            const parsedDate = new Date(date);
            if (!isNaN(parsedDate.getTime())) {
                targetDate = parsedDate;
            }
        }

        if (normalizedType === 'day') {
            startDate = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(), 0, 0, 0, 0);
            endDate = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(), 23, 59, 59, 999);
        } else if (normalizedType === 'month') {
            startDate = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1, 0, 0, 0, 0);
            endDate = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0, 23, 59, 59, 999);
        } else if (normalizedType === 'year') {
            startDate = new Date(targetDate.getFullYear(), 0, 1, 0, 0, 0, 0);
            endDate = new Date(targetDate.getFullYear(), 11, 31, 23, 59, 59, 999);
        }

        const stats = await Order.findOne({
            attributes: [
                [sequelize.fn('COUNT', sequelize.col('id')), 'totalOrders'],
                [sequelize.fn('SUM', sequelize.col('finalPrice')), 'totalRevenue']
            ],
            where: {
                status: 'COMPLETED',
                paymentStatus: 'PAID',
                created_at: {
                    [Op.between]: [startDate, endDate]
                }
            }
        });

        res.json({
            type: normalizedType,
            startDate,
            endDate,
            totalOrders: parseInt(stats.getDataValue('totalOrders')) || 0,
            totalRevenue: parseFloat(stats.getDataValue('totalRevenue')) || 0
        });

    } catch (error) {
        console.error("Get Stats Error:", error);
        next(error);
    }
};
