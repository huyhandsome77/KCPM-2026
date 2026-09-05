const request = require('supertest');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Mock models
jest.mock('../src/models', () => ({
  User: {
    findOne: jest.fn(),
    create: jest.fn(),
    findByPk: jest.fn(),
    findAll: jest.fn(),
  },
  sequelize: {
    sync: jest.fn(),
    authenticate: jest.fn(),
  },
  connectDB: jest.fn(),
}));

const { User } = require('../src/models');
const app = require('../src/app');
const authController = require('../src/controllers/authController');

describe('White-box Testing: authController (Branch, Statement & Path Coverage)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // =========================================================================
  // 1. White-box Tests for register()
  // =========================================================================
  describe('authController.register Branches & Paths', () => {
    test('[WB-AUTH-REG-01] Branch: Missing or invalid fullName (!fullName)', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          fullName: '',
          phone: '0912345678',
          username: 'newUser',
          password: 'Password123@'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('Vui lòng nhập Họ và tên đầy đủ!');
    });

    test('[WB-AUTH-REG-02] Branch: Missing or invalid phone (!phone)', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          fullName: 'Test User',
          phone: '',
          username: 'newUser',
          password: 'Password123@'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('Vui lòng nhập Số điện thoại hợp lệ!');
    });

    test('[WB-AUTH-REG-03] Branch: Missing or invalid username (!username)', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          fullName: 'Test User',
          phone: '0912345678',
          username: '',
          password: 'Password123@'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('Vui lòng nhập Tên đăng nhập!');
    });

    test('[WB-AUTH-REG-04] Branch: Missing or invalid password (!password)', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          fullName: 'Test User',
          phone: '0912345678',
          username: 'newUser',
          password: ''
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('Vui lòng nhập Mật khẩu!');
    });

    test('[WB-AUTH-REG-05] Branch: Phone number already exists (userExists.phone === phone)', async () => {
      User.findOne.mockResolvedValue({
        id: 10,
        phone: '0912345678',
        username: 'existingUser'
      });

      const res = await request(app)
        .post('/api/auth/register')
        .send({
          fullName: 'Test User',
          email: 'test@example.com',
          phone: '0912345678',
          username: 'newUser',
          password: 'Password123@'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('Số điện thoại này đã được đăng ký!');
    });

    test('[WB-AUTH-REG-06] Branch: Email already exists (email && userExists.email === email)', async () => {
      User.findOne.mockResolvedValue({
        id: 11,
        phone: '0988888888',
        username: 'otherUser',
        email: 'test@example.com'
      });

      const res = await request(app)
        .post('/api/auth/register')
        .send({
          fullName: 'Test User',
          email: 'test@example.com',
          phone: '0912345679',
          username: 'newUser2',
          password: 'Password123@'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('Email này đã tồn tại trong hệ thống!');
    });

    test('[WB-AUTH-REG-07] Branch: Username already exists (default duplicate)', async () => {
      User.findOne.mockResolvedValue({
        id: 12,
        phone: '0988888888',
        username: 'duplicateUser',
        email: 'other@example.com'
      });

      const res = await request(app)
        .post('/api/auth/register')
        .send({
          fullName: 'Test User',
          email: 'test2@example.com',
          phone: '0912345679',
          username: 'duplicateUser',
          password: 'Password123@'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('Tên đăng nhập này đã tồn tại!');
    });

    test('[WB-AUTH-REG-08] Branch: User does not exist -> Successful registration with email (201)', async () => {
      User.findOne.mockResolvedValue(null);
      User.create.mockResolvedValue({
        id: 13,
        fullName: 'New User',
        username: 'newuser12',
        phone: '0911223344',
        email: 'newuser@example.com',
        role: 'CUSTOMER'
      });

      const res = await request(app)
        .post('/api/auth/register')
        .send({
          fullName: 'New User',
          email: 'newuser@example.com',
          phone: '0911223344',
          username: 'newuser12',
          password: 'Password123@'
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.message).toBe('Đăng ký thành công!');
      expect(res.body.user).toEqual({
        id: 13,
        fullName: 'New User',
        username: 'newuser12',
        phone: '0911223344',
        role: 'CUSTOMER'
      });
    });

    test('[WB-AUTH-REG-09] Branch: Successful registration without email (email is optional) (201)', async () => {
      User.findOne.mockResolvedValue(null);
      User.create.mockResolvedValue({
        id: 14,
        fullName: 'New User No Email',
        username: 'newusernoemail',
        phone: '0911223355',
        email: null,
        role: 'CUSTOMER'
      });

      const res = await request(app)
        .post('/api/auth/register')
        .send({
          fullName: 'New User No Email',
          phone: '0911223355',
          username: 'newusernoemail',
          password: 'Password123@'
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.message).toBe('Đăng ký thành công!');
      expect(res.body.user).toEqual({
        id: 14,
        fullName: 'New User No Email',
        username: 'newusernoemail',
        phone: '0911223355',
        role: 'CUSTOMER'
      });
    });

    test('[WB-AUTH-REG-10] Branch: Exception catch block (400 Error Handler)', async () => {
      User.findOne.mockRejectedValue(new Error('Database connection failed'));

      const res = await request(app)
        .post('/api/auth/register')
        .send({
          fullName: 'Error Test',
          phone: '0912345678',
          username: 'errortest',
          password: 'Password123@'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('Lỗi đăng ký tài khoản');
      expect(res.body.error).toBe('Database connection failed');
    });

    test('[WB-AUTH-REG-11] Branch: Direct controller invocation with undefined req.body', async () => {
      const req = { body: undefined };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      };

      await authController.register(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Vui lòng nhập Họ và tên đầy đủ!' });
    });
  });

  // =========================================================================
  // 2. White-box Tests for login()
  // =========================================================================
  describe('authController.login Branches & Paths', () => {
    test('[WB-AUTH-LOG-01] Branch: Missing account field (!account)', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ account: '', password: 'Password123@' });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('Vui lòng nhập đầy đủ thông tin!');
    });

    test('[WB-AUTH-LOG-02] Branch: Missing password field (!password)', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ account: 'admin', password: '' });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('Vui lòng nhập đầy đủ thông tin!');
    });

    test('[WB-AUTH-LOG-03] Branch: User not found in database (!user)', async () => {
      User.findOne.mockResolvedValue(null);

      const res = await request(app)
        .post('/api/auth/login')
        .send({ account: 'nonexistent_account', password: 'Password123@' });

      expect(res.statusCode).toBe(404);
      expect(res.body.message).toBe('Tài khoản không tồn tại!');
    });

    test('[WB-AUTH-LOG-04] Branch: User account is BLOCKED (user.status === "BLOCKED")', async () => {
      User.findOne.mockResolvedValue({
        id: 99,
        username: 'blockedUser',
        status: 'BLOCKED',
        password: 'HashedPassword'
      });

      const res = await request(app)
        .post('/api/auth/login')
        .send({ account: 'blockedUser', password: 'Password123@' });

      expect(res.statusCode).toBe(403);
      expect(res.body.message).toBe('Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên!');
    });

    test('[WB-AUTH-LOG-05] Branch: Password mismatch (!isMatch)', async () => {
      const hashedPassword = await bcrypt.hash('CorrectPassword123', 10);
      User.findOne.mockResolvedValue({
        id: 1,
        username: 'admin',
        password: hashedPassword,
        role: 'ADMIN',
        status: 'ACTIVE'
      });

      const res = await request(app)
        .post('/api/auth/login')
        .send({ account: 'admin', password: 'WrongPassword456' });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('Mật khẩu không chính xác!');
    });

    test('[WB-AUTH-LOG-06] Branch: Successful login with valid credentials (200 & JWT)', async () => {
      const rawPassword = 'ValidPassword123@';
      const hashedPassword = await bcrypt.hash(rawPassword, 10);
      User.findOne.mockResolvedValue({
        id: 1,
        fullName: 'Admin User',
        username: 'admin',
        phone: '0912345678',
        role: 'ADMIN',
        status: 'ACTIVE',
        password: hashedPassword
      });

      const res = await request(app)
        .post('/api/auth/login')
        .send({ account: 'admin', password: rawPassword });

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe('Đăng nhập thành công!');
      expect(res.body.token).toBeDefined();
      expect(res.body.user).toEqual({
        id: 1,
        fullName: 'Admin User',
        username: 'admin',
        phone: '0912345678',
        role: 'ADMIN'
      });
    });

    test('[WB-AUTH-LOG-07] Branch: Fallback default JWT_SECRET when process.env.JWT_SECRET is empty', async () => {
      const oldSecret = process.env.JWT_SECRET;
      delete process.env.JWT_SECRET;

      const rawPassword = 'ValidPassword123@';
      const hashedPassword = await bcrypt.hash(rawPassword, 10);
      User.findOne.mockResolvedValue({
        id: 2,
        fullName: 'Customer User',
        username: 'customer2',
        phone: '0912345679',
        role: 'CUSTOMER',
        status: 'ACTIVE',
        password: hashedPassword
      });

      const res = await request(app)
        .post('/api/auth/login')
        .send({ account: 'customer2', password: rawPassword });

      expect(res.statusCode).toBe(200);
      expect(res.body.token).toBeDefined();

      process.env.JWT_SECRET = oldSecret;
    });

    test('[WB-AUTH-LOG-08] Branch: Exception catch block during login (500 Error Handler)', async () => {
      User.findOne.mockRejectedValue(new Error('Fatal DB failure'));

      const res = await request(app)
        .post('/api/auth/login')
        .send({ account: 'admin', password: 'password123' });

      expect(res.statusCode).toBe(500);
      expect(res.body.message).toBe('Lỗi server');
      expect(res.body.error).toBe('Fatal DB failure');
    });

    test('[WB-AUTH-LOG-09] Branch: Direct controller invocation with undefined req.body', async () => {
      const req = { body: undefined };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      };

      await authController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Vui lòng nhập đầy đủ thông tin!' });
    });
  });
});
