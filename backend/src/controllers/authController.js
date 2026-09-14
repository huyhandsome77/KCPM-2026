const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { User } = require("../models");
const { Op } = require("sequelize");
require("dotenv").config();

exports.register = async (req, res) => {
    try {
        const { fullName, email, phone, username, password } = req.body || {};

        if (!fullName || typeof fullName !== 'string' || fullName.trim() === '') {
            return res.status(400).json({ message: "Vui lòng nhập Họ và tên đầy đủ!" });
        }
        if (fullName.trim().length > 100) {
            return res.status(400).json({ message: "Họ và tên không được vượt quá 100 ký tự!" });
        }

        if (!phone || typeof phone !== 'string' || phone.trim() === '') {
            return res.status(400).json({ message: "Vui lòng nhập Số điện thoại hợp lệ!" });
        }
        const phoneTrimmed = phone.trim();
        if (!/^\d+$/.test(phoneTrimmed)) {
            return res.status(400).json({ message: "Số điện thoại chỉ được chứa chữ số!" });
        }
        if (phoneTrimmed.length < 10 || phoneTrimmed.length > 12) {
            return res.status(400).json({ message: "Số điện thoại phải có từ 10 đến 12 chữ số!" });
        }
        if (!phoneTrimmed.startsWith('0')) {
            return res.status(400).json({ message: "Số điện thoại không hợp lệ! Phải bắt đầu bằng chữ số 0." });
        }

        if (!username || typeof username !== 'string' || username.trim() === '') {
            return res.status(400).json({ message: "Vui lòng nhập Tên đăng nhập!" });
        }
        if (username.length < 3 || username.length > 40) {
            return res.status(400).json({ message: "Tên đăng nhập phải có từ 3 đến 40 ký tự!" });
        }
        if (/\s/.test(username)) {
            return res.status(400).json({ message: "Tên đăng nhập không được chứa khoảng trắng!" });
        }
        if (!/^[a-zA-Z0-9_]+$/.test(username)) {
            return res.status(400).json({ message: "Tên đăng nhập không được chứa ký tự đặc biệt!" });
        }

        if (!password || typeof password !== 'string' || password.trim() === '') {
            return res.status(400).json({ message: "Vui lòng nhập Mật khẩu!" });
        }
        if (password.length < 8 || password.length > 16) {
            return res.status(400).json({ message: "Mật khẩu phải có độ dài từ 8 đến 16 ký tự!" });
        }

        if (email !== undefined && email !== null && typeof email === 'string' && email.trim() !== '') {
            const emailTrimmed = email.trim();
            if (emailTrimmed.length > 100) {
                return res.status(400).json({ message: "Email không được vượt quá 100 ký tự!" });
            }
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(emailTrimmed)) {
                return res.status(400).json({ message: "Email không đúng định dạng!" });
            }
        }

        const orConditions = [{ phone: phone.trim() }, { username: username.trim() }];
        if (email && typeof email === 'string' && email.trim() !== '') {
            orConditions.push({ email: email.trim() });
        }

        const userExists = await User.findOne({
            where: {
                [Op.or]: orConditions
            }
        });

        if (userExists) {
            let message = 'Tên đăng nhập này đã tồn tại!';
            if (userExists.phone === phone.trim()) {
                message = 'Số điện thoại này đã được đăng ký!';
            } else if (email && userExists.email === email.trim()) {
                message = 'Email này đã tồn tại trong hệ thống!';
            }
            return res.status(400).json({ message });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await User.create({
            fullName: fullName.trim(),
            email: email ? email.trim() : null,
            phone: phone.trim(),
            username: username.trim(),
            password: hashedPassword,
            role: "CUSTOMER",
            status: "ACTIVE",
            points: 0
        });

        return res.status(201).json({
            message: "Đăng ký thành công!",
            user: {
                id: user.id,
                fullName: user.fullName,
                username: user.username,
                phone: user.phone,
                role: user.role
            }
        });

    } catch (error) {
        return res.status(400).json({
            message: "Lỗi đăng ký tài khoản",
            error: error.message
        });
    }
};

exports.login = async (req, res) => {
    try {
        const { account, password } = req.body || {};

        if (!account || !password) {
            return res.status(400).json({ message: "Vui lòng nhập đầy đủ thông tin!" });
        }

        const user = await User.findOne({
            where: {
                [Op.or]: [
                    { username: account },
                    { phone: account },
                    { email: account }
                ]
            }
        });

        if (!user) {
            return res.status(404).json({ message: "Tài khoản không tồn tại!" });
        }

        if (user.status === 'BLOCKED') {
            return res.status(403).json({ message: "Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên!" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Mật khẩu không chính xác!" });
        }

        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET || 'secret_key',
            { expiresIn: "7d" }
        );

        return res.status(200).json({
            message: "Đăng nhập thành công!",
            token,
            user: {
                id: user.id,
                fullName: user.fullName,
                username: user.username,
                phone: user.phone,
                role: user.role,
            }
        });

    } catch (error) {
        return res.status(500).json({
            message: "Lỗi server",
            error: error.message
        });
    }
};
