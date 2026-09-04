const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { verifyToken, isAdmin } = require('../middlewares/authMiddleware');

// Đảm bảo thư mục uploads tồn tại
const uploadDir = path.join(__dirname, '..', '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Cấu hình lưu trữ
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname).toLowerCase());
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const allowedExts = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
        const allowedMimetypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/pjpeg'];
        const ext = path.extname(file.originalname).toLowerCase();
        
        if (allowedExts.includes(ext) && (allowedMimetypes.includes(file.mimetype) || !file.mimetype)) {
            cb(null, true);
        } else {
            const err = new Error("Chỉ chấp nhận file định dạng ảnh (.jpg, .jpeg, .png, .webp, .gif)");
            err.statusCode = 400;
            cb(err);
        }
    }
});

const handleImageUpload = (req, res) => {
    upload.single('image')(req, res, (err) => {
        if (err) {
            if (err instanceof multer.MulterError) {
                if (err.code === 'LIMIT_FILE_SIZE') {
                    return res.status(400).json({ 
                        message: "Kích thước file vượt quá giới hạn cho phép (tối đa 5MB)" 
                    });
                }
                if (err.code === 'LIMIT_UNEXPECTED_FILE') {
                    return res.status(400).json({ 
                        message: "Vui lòng đính kèm file ảnh hợp lệ với key là 'image'" 
                    });
                }
                return res.status(400).json({ message: err.message });
            }
            return res.status(400).json({ message: err.message });
        }
        if (!req.file) {
            return res.status(400).json({ 
                message: "Vui lòng đính kèm file ảnh hợp lệ với key là 'image'" 
            });
        }
        const imageUrl = `/uploads/${req.file.filename}`;
        res.status(200).json({ 
            imageUrl: imageUrl, 
            message: "Upload ảnh thành công" 
        });
    });
};

router.post('/image', verifyToken, isAdmin, handleImageUpload);
router.post('/', verifyToken, isAdmin, handleImageUpload);

module.exports = router;
