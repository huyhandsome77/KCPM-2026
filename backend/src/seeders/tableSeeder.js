const { RestaurantTable } = require('../models');

const seedTables = async () => {
    try {
        const count = await RestaurantTable.count();
        if (count === 0) {
            const tables = [];
            for (let i = 1; i <= 12; i++) {
                tables.push({
                    tableNumber: i,
                    qrCode: `QR_TABLE_${String(i).padStart(3, '0')}`,
                    capacity: 4,
                    status: 'AVAILABLE'
                });
            }
            await RestaurantTable.bulkCreate(tables);
            console.log('[Seeder] Đã tạo 12 bàn mặc định.');
        }
    } catch (error) {
        console.error('[Seeder] Lỗi khi tạo bàn:', error);
    }
};

module.exports = { seedTables };
