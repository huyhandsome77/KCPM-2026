const bcrypt = require("bcryptjs");
const { User } = require("../models");

const seedAdmin = async () => {
    try {
        const hashedPassword = await bcrypt.hash("123", 10);

        const defaultUsers = [
            {
                fullName: "Administrator",
                email: "admin@example.com",
                phone: "0900000000",
                username: "admin",
                password: hashedPassword,
                role: "ADMIN",
                status: "ACTIVE",
                points: 100000
            },
            {
                fullName: "Nhân viên Phục vụ",
                email: "staff@example.com",
                phone: "0900000001",
                username: "staff",
                password: hashedPassword,
                role: "STAFF",
                status: "ACTIVE",
                points: 0
            },
            {
                fullName: "Khách hàng Thân thiết",
                email: "customer@example.com",
                phone: "0900000002",
                username: "customer",
                password: hashedPassword,
                role: "CUSTOMER",
                status: "ACTIVE",
                points: 50000
            },
            {
                fullName: "Đầu bếp Kitchen",
                email: "kitchen@example.com",
                phone: "0900000003",
                username: "kitchen",
                password: hashedPassword,
                role: "KITCHEN",
                status: "ACTIVE",
                points: 0
            },
            {
                fullName: "Tài Khoản Bị Khóa",
                email: "blocked@example.com",
                phone: "0900000099",
                username: "blocked_user",
                password: hashedPassword,
                role: "CUSTOMER",
                status: "BLOCKED",
                points: 0
            }
        ];

        for (const u of defaultUsers) {
            const existing = await User.findOne({ where: { username: u.username } });
            if (!existing) {
                await User.create(u);
                console.log(`[AdminSeeder] Đã tạo tài khoản mặc định: ${u.username} (${u.role})`);
            }
        }
    } catch (err) {
        console.error("[AdminSeeder]", err);
    }
};

module.exports = {
    seedAdmin
};