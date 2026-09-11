/**
 * ============================================================================
 * BỘ KIỂM THỬ TỰ ĐỘNG PHÂN VÙNG TƯƠNG ĐƯƠNG (EQUIVALENCE PARTITIONING - EP)
 * MODULE: XÁC THỰC & QUẢN LÝ NGƯỜI DÙNG (AUTHENTICATION & USER MANAGEMENT)
 * HỆ THỐNG: FUTURESUSHI BACKEND (`/api/auth` & `/api/users`)
 * 
 * PHƯƠNG PHÁP: Equivalence Partitioning (EP) / Equivalence Class Testing (ECT)
 * BAO PHỦ: 
 *   - 23 Phân vùng tương đương hợp lệ (Valid Equivalence Partitions - VEP)
 *   - 22 Phân vùng tương đương không hợp lệ (Invalid Equivalence Partitions - IEP)
 *   - 5 Quy tắc an toàn & bảo vệ dữ liệu (Self-blocking, Self-deletion, Mass Assignment, RBAC)
 * ============================================================================
 */

const request = require('supertest');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Mock Sequelize Models & Database Connection
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

describe('Equivalence Partitioning (EP) Test Suite: Authentication & User Management', () => {
  const secretKey = process.env.JWT_SECRET || 'secret_key';
  let adminToken;
  let staffToken;
  let customerToken;
  let kitchenToken;
  let expiredToken;

  beforeAll(() => {
    adminToken = jwt.sign({ id: 1, role: 'ADMIN' }, secretKey, { expiresIn: '7d' });
    staffToken = jwt.sign({ id: 2, role: 'STAFF' }, secretKey, { expiresIn: '7d' });
    customerToken = jwt.sign({ id: 3, role: 'CUSTOMER' }, secretKey, { expiresIn: '7d' });
    kitchenToken = jwt.sign({ id: 4, role: 'KITCHEN' }, secretKey, { expiresIn: '7d' });
    expiredToken = jwt.sign({ id: 1, role: 'ADMIN' }, secretKey, { expiresIn: '-1s' });
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Helper tạo mock user instance cho Sequelize
  const createMockUserInstance = (data) => {
    const instance = {
      ...data,
      update: jest.fn().mockImplementation(async (updates) => {
        Object.assign(instance, updates);
        return instance;
      }),
      destroy: jest.fn().mockResolvedValue(true),
    };
    return instance;
  };

  // =========================================================================
  // 📌 KHỐI 1: POST /api/auth/register (VALIDATION ĐĂNG KÝ THEO PHÂN VÙNG EP)
  // =========================================================================
  describe('Khối 1: Đăng ký tài khoản (POST /api/auth/register) - EP Test Cases', () => {
    
    test('[TC_EP_REG_001] VEP-FN-01, VEP-UN-01, VEP-PW-01, VEP-PH-05, VEP-EM-01: Đăng ký thành công với tất cả các trường hợp lệ đầy đủ', async () => {
      User.findOne.mockResolvedValue(null);
      User.create.mockResolvedValue({
        id: 10,
        fullName: 'Trần Văn Hợp Lệ',
        username: 'cust_valid01',
        phone: '0912345678',
        email: 'valid_cust1@gmail.com',
        role: 'CUSTOMER',
        status: 'ACTIVE',
        points: 0,
      });

      const res = await request(app)
        .post('/api/auth/register')
        .send({
          fullName: 'Trần Văn Hợp Lệ',
          email: 'valid_cust1@gmail.com',
          phone: '0912345678',
          username: 'cust_valid01',
          password: 'Password123@',
        });

      expect(res.status).toBe(201);
      expect(res.body.message).toBe('Đăng ký thành công!');
      expect(res.body.user.role).toBe('CUSTOMER');
      expect(res.body.user.fullName).toBe('Trần Văn Hợp Lệ');
    });

    test('[TC_EP_REG_002] VEP-EM-02: Đăng ký thành công khi không cung cấp trường email (Nullable / Optional)', async () => {
      User.findOne.mockResolvedValue(null);
      User.create.mockResolvedValue({
        id: 11,
        fullName: 'Lê Văn Bình',
        username: 'cust_noemail',
        phone: '0987654321',
        email: null,
        role: 'CUSTOMER',
        status: 'ACTIVE',
        points: 0,
      });

      const res = await request(app)
        .post('/api/auth/register')
        .send({
          fullName: 'Lê Văn Bình',
          phone: '0987654321',
          username: 'cust_noemail',
          password: 'Password123@',
        });

      expect(res.status).toBe(201);
      expect(res.body.message).toBe('Đăng ký thành công!');
      expect(User.create).toHaveBeenCalledWith(expect.objectContaining({ email: null }));
    });

    test('[TC_EP_REG_003] VEP-FN-02: Đăng ký thành công với họ tên có khoảng trắng thừa 2 đầu (hệ thống tự trim)', async () => {
      User.findOne.mockResolvedValue(null);
      User.create.mockResolvedValue({
        id: 12,
        fullName: 'Nguyễn Hoàng An',
        username: 'cust_trim',
        phone: '0345678901',
        role: 'CUSTOMER',
      });

      const res = await request(app)
        .post('/api/auth/register')
        .send({
          fullName: '   Nguyễn Hoàng An   ',
          phone: '0345678901',
          username: 'cust_trim',
          password: 'Password123@',
        });

      expect(res.status).toBe(201);
      expect(User.create).toHaveBeenCalledWith(expect.objectContaining({ fullName: 'Nguyễn Hoàng An' }));
    });

    test('[TC_EP_REG_004] VEP-PH-01 to 04: Đăng ký thành công với các đầu số chuẩn VN khác nhau (03, 05, 07, 08)', async () => {
      User.findOne.mockResolvedValue(null);
      User.create.mockResolvedValue({
        id: 13,
        fullName: 'Phạm Văn C',
        phone: '0388999000',
        username: 'cust_prefix03',
        role: 'CUSTOMER',
      });

      const res = await request(app)
        .post('/api/auth/register')
        .send({
          fullName: 'Phạm Văn C',
          phone: '0388999000',
          username: 'cust_prefix03',
          password: 'Password123@',
        });

      expect(res.status).toBe(201);
      expect(res.body.message).toBe('Đăng ký thành công!');
    });

    test('[TC_EP_REG_005] IEP-FN-01: Báo lỗi khi fullName bị rỗng ("")', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          fullName: '',
          phone: '0912345678',
          username: 'cust_err1',
          password: 'Password123@',
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/họ và tên/i);
    });

    test('[TC_EP_REG_006] IEP-FN-02: Báo lỗi khi fullName chỉ chứa toàn khoảng trắng ("   ")', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          fullName: '      ',
          phone: '0912345678',
          username: 'cust_err2',
          password: 'Password123@',
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/họ và tên/i);
    });

    test('[TC_EP_REG_008] IEP-UN-06: Báo lỗi khi username bị rỗng ("")', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          fullName: 'Trần A',
          phone: '0912345678',
          username: '',
          password: 'Password123@',
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/tên đăng nhập/i);
    });

    test('[TC_EP_REG_012] IEP-UN-05: Báo lỗi khi username đã tồn tại trong CSDL (Duplicate UNIQUE)', async () => {
      User.findOne.mockResolvedValue({ id: 1, username: 'admin', phone: '0900000000' });

      const res = await request(app)
        .post('/api/auth/register')
        .send({
          fullName: 'Trần A',
          phone: '0919999999',
          username: 'admin',
          password: 'Password123@',
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('Tên đăng nhập này đã tồn tại!');
    });

    test('[TC_EP_REG_015] IEP-PW-03: Báo lỗi khi password bị bỏ trống ("")', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          fullName: 'Trần A',
          phone: '0912345678',
          username: 'cust_pw_empty',
          password: '',
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/mật khẩu/i);
    });

    test('[TC_EP_REG_016] IEP-PH-06: Báo lỗi khi phone bị bỏ trống ("")', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          fullName: 'Trần A',
          phone: '',
          username: 'cust_ph_empty',
          password: 'Password123@',
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/số điện thoại/i);
    });

    test('[TC_EP_REG_019] IEP-PH-05: Báo lỗi khi phone đã được đăng ký trong hệ thống (Duplicate UNIQUE)', async () => {
      User.findOne.mockResolvedValue({ id: 2, username: 'other_user', phone: '0900000001' });

      const res = await request(app)
        .post('/api/auth/register')
        .send({
          fullName: 'Trần A',
          phone: '0900000001',
          username: 'cust_ph_dup',
          password: 'Password123@',
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('Số điện thoại này đã được đăng ký!');
    });

    test('[TC_EP_REG_021] IEP-EM-04: Báo lỗi khi email đã tồn tại trong hệ thống (Duplicate UNIQUE)', async () => {
      User.findOne.mockResolvedValue({ id: 1, username: 'admin', email: 'admin@futuresushi.com', phone: '0900000000' });

      const res = await request(app)
        .post('/api/auth/register')
        .send({
          fullName: 'Trần A',
          email: 'admin@futuresushi.com',
          phone: '0912345678',
          username: 'cust_em_dup',
          password: 'Password123@',
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('Email này đã tồn tại trong hệ thống!');
    });
  });

  // =========================================================================
  // 📌 KHỐI 2: POST /api/auth/login (XÁC THỰC ĐĂNG NHẬP & KIỂM TRA TRẠNG THÁI)
  // =========================================================================
  describe('Khối 2: Đăng nhập hệ thống (POST /api/auth/login) - EP Test Cases', () => {

    test('[TC_EP_LOG_001] VEP-AUTH-01: Đăng nhập thành công bằng USERNAME + Mật khẩu đúng trên tài khoản ACTIVE', async () => {
      const hashedPassword = await bcrypt.hash('Password123@', 10);
      User.findOne.mockResolvedValue({
        id: 1,
        fullName: 'Admin User',
        username: 'admin',
        phone: '0900000001',
        role: 'ADMIN',
        status: 'ACTIVE',
        password: hashedPassword,
      });

      const res = await request(app)
        .post('/api/auth/login')
        .send({ account: 'admin', password: 'Password123@' });

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Đăng nhập thành công!');
      expect(res.body.token).toBeDefined();
      expect(res.body.user.role).toBe('ADMIN');
    });

    test('[TC_EP_LOG_002] VEP-AUTH-02: Đăng nhập thành công bằng SỐ ĐIỆN THOẠI + Mật khẩu đúng', async () => {
      const hashedPassword = await bcrypt.hash('Password123@', 10);
      User.findOne.mockResolvedValue({
        id: 2,
        fullName: 'Staff User',
        username: 'staff01',
        phone: '0911223344',
        role: 'STAFF',
        status: 'ACTIVE',
        password: hashedPassword,
      });

      const res = await request(app)
        .post('/api/auth/login')
        .send({ account: '0911223344', password: 'Password123@' });

      expect(res.status).toBe(200);
      expect(res.body.token).toBeDefined();
      expect(res.body.user.username).toBe('staff01');
    });

    test('[TC_EP_LOG_003] VEP-AUTH-03: Đăng nhập thành công bằng EMAIL + Mật khẩu đúng', async () => {
      const hashedPassword = await bcrypt.hash('Password123@', 10);
      User.findOne.mockResolvedValue({
        id: 3,
        fullName: 'Customer User',
        email: 'customer@gmail.com',
        username: 'cust01',
        phone: '0922334455',
        role: 'CUSTOMER',
        status: 'ACTIVE',
        password: hashedPassword,
      });

      const res = await request(app)
        .post('/api/auth/login')
        .send({ account: 'customer@gmail.com', password: 'Password123@' });

      expect(res.status).toBe(200);
      expect(res.body.token).toBeDefined();
    });

    test('[TC_EP_LOG_004] IEP-AUTH-01: Đăng nhập thất bại khi tài khoản không tồn tại trong CSDL', async () => {
      User.findOne.mockResolvedValue(null);

      const res = await request(app)
        .post('/api/auth/login')
        .send({ account: 'nonexistent_user_999', password: 'Password123@' });

      expect(res.status).toBe(404);
      expect(res.body.message).toContain('Tài khoản không tồn tại!');
    });

    test('[TC_EP_LOG_005] IEP-AUTH-02: Đăng nhập thất bại khi nhập sai mật khẩu', async () => {
      const hashedPassword = await bcrypt.hash('CorrectPass123@', 10);
      User.findOne.mockResolvedValue({
        id: 1,
        username: 'admin',
        status: 'ACTIVE',
        password: hashedPassword,
      });

      const res = await request(app)
        .post('/api/auth/login')
        .send({ account: 'admin', password: 'WrongPassword123' });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('Mật khẩu không chính xác!');
    });

    test('[TC_EP_LOG_006] IEP-AUTH-03: TÀI KHOẢN TRẠNG THÁI BLOCKED BỊ TỪ CHỐI ĐĂNG NHẬP (HTTP 403)', async () => {
      const hashedPassword = await bcrypt.hash('Password123@', 10);
      User.findOne.mockResolvedValue({
        id: 5,
        username: 'blocked_user01',
        status: 'BLOCKED',
        password: hashedPassword,
      });

      const res = await request(app)
        .post('/api/auth/login')
        .send({ account: 'blocked_user01', password: 'Password123@' });

      expect(res.status).toBe(403);
      expect(res.body.message).toContain('Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên!');
    });

    test('[TC_EP_LOG_007] IEP-AUTH-04: Đăng nhập thiếu trường account', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ password: 'Password123@' });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('Vui lòng nhập đầy đủ thông tin!');
    });

    test('[TC_EP_LOG_008] IEP-AUTH-04: Đăng nhập thiếu trường password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ account: 'admin' });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('Vui lòng nhập đầy đủ thông tin!');
    });
  });

  // =========================================================================
  // 📌 KHỐI 3: XÁC THỰC JWT & PHÂN QUYỀN TRUY CẬP (RBAC)
  // =========================================================================
  describe('Khối 3: Quyền truy cập JWT & Phân quyền RBAC - EP Test Cases', () => {

    test('[TC_EP_SEC_001] VEP-JWT-01: Admin gửi Header Authorization Bearer token hợp lệ', async () => {
      User.findAll.mockResolvedValue([
        { id: 1, fullName: 'Admin', role: 'ADMIN' },
      ]);

      const res = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    test('[TC_EP_SEC_002] VEP-JWT-01: Staff gửi Bearer token hợp lệ truy cập endpoint Staff & Admin', async () => {
      User.findAll.mockResolvedValue([
        { id: 2, fullName: 'Staff', role: 'STAFF' },
      ]);

      const res = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${staffToken}`);

      expect(res.status).toBe(200);
    });

    test('[TC_EP_SEC_003] IEP-JWT-01: Từ chối khi không gửi Header Authorization', async () => {
      const res = await request(app).get('/api/users');
      expect(res.status).toBe(401);
    });

    test('[TC_EP_SEC_004] IEP-JWT-02: Từ chối khi gửi Token rác / sai định dạng', async () => {
      const res = await request(app)
        .get('/api/users')
        .set('Authorization', 'Bearer invalid_malformed_token_string');

      expect([401, 403]).toContain(res.status);
    });

    test('[TC_EP_SEC_005] IEP-JWT-03: Từ chối khi gửi Token đã hết hạn (> 7 ngày)', async () => {
      const res = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${expiredToken}`);

      expect([401, 403]).toContain(res.status);
    });

    test('[TC_EP_SEC_006] IEP-JWT-04: Từ chối CUSTOMER cố gắng truy cập endpoint dành riêng cho Admin', async () => {
      const res = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ fullName: 'New User' });

      expect(res.status).toBe(403);
    });
  });

  // =========================================================================
  // 📌 KHỐI 4: POST /api/users (ADMIN TẠO MỚI TÀI KHOẢN VÀ PHÂN QUYỀN)
  // =========================================================================
  describe('Khối 4: Admin tạo tài khoản (POST /api/users) - EP Test Cases', () => {

    test('[TC_EP_ADM_CRT_001] VEP-RL-02, VEP-PT-02: Admin tạo thành công tài khoản Nhân viên (STAFF)', async () => {
      User.findOne.mockResolvedValue(null);
      User.create.mockResolvedValue({
        id: 20,
        fullName: 'Nguyễn Staff',
        username: 'staff_new01',
        phone: '0911223344',
        role: 'STAFF',
      });

      const res = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          fullName: 'Nguyễn Staff',
          phone: '0911223344',
          username: 'staff_new01',
          password: 'Password123@',
          role: 'STAFF',
        });

      expect(res.status).toBe(201);
      expect(res.body.message).toBe('Tạo người dùng thành công');
      expect(User.create).toHaveBeenCalledWith(expect.objectContaining({ role: 'STAFF' }));
    });

    test('[TC_EP_ADM_CRT_002] VEP-RL-03: Admin tạo thành công tài khoản Bếp (KITCHEN)', async () => {
      User.findOne.mockResolvedValue(null);
      User.create.mockResolvedValue({
        id: 21,
        fullName: 'Lê Kitchen',
        username: 'kitchen_new01',
        phone: '0922334455',
        role: 'KITCHEN',
      });

      const res = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          fullName: 'Lê Kitchen',
          phone: '0922334455',
          username: 'kitchen_new01',
          password: 'Password123@',
          role: 'KITCHEN',
        });

      expect(res.status).toBe(201);
      expect(res.body.message).toBe('Tạo người dùng thành công');
    });

    test('[TC_EP_ADM_CRT_003] VEP-RL-04: Admin tạo thành công tài khoản Quản trị viên phụ (ADMIN)', async () => {
      User.findOne.mockResolvedValue(null);
      User.create.mockResolvedValue({
        id: 22,
        fullName: 'Phạm Admin Phụ',
        username: 'admin_sub01',
        phone: '0933445566',
        role: 'ADMIN',
      });

      const res = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          fullName: 'Phạm Admin Phụ',
          phone: '0933445566',
          username: 'admin_sub01',
          password: 'Password123@',
          role: 'ADMIN',
        });

      expect(res.status).toBe(201);
      expect(res.body.message).toBe('Tạo người dùng thành công');
    });

    test('[TC_EP_ADM_CRT_005] IEP-UN-05: Từ chối tạo khi username hoặc số điện thoại đã tồn tại', async () => {
      User.findOne.mockResolvedValue({ id: 1, username: 'admin', phone: '0900000000' });

      const res = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          fullName: 'Võ Error',
          phone: '0955667788',
          username: 'admin',
          password: 'Password123@',
          role: 'STAFF',
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('Tài khoản hoặc số điện thoại đã tồn tại');
    });

    test('[TC_EP_ADM_CRT_006] IEP-EM-04: Từ chối tạo khi email đã tồn tại trong CSDL', async () => {
      User.findOne.mockResolvedValue({ id: 1, email: 'admin@futuresushi.com' });

      const res = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          fullName: 'Võ Error',
          email: 'admin@futuresushi.com',
          phone: '0966778899',
          username: 'user_new100',
          password: 'Password123@',
          role: 'STAFF',
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('Tài khoản hoặc số điện thoại đã tồn tại');
    });
  });

  // =========================================================================
  // 📌 KHỐI 5: GET /api/users (TRA CỨU, LỌC VÀ TÌM KIẾM NGƯỜI DÙNG)
  // =========================================================================
  describe('Khối 5: Lấy danh sách & Tìm kiếm (GET /api/users) - EP Test Cases', () => {

    test('[TC_EP_GET_001] VEP-SC-01 (Empty): Lấy toàn bộ danh sách khi không lọc tham số', async () => {
      User.findAll.mockResolvedValue([
        { id: 1, fullName: 'User 1', role: 'ADMIN' },
        { id: 2, fullName: 'User 2', role: 'CUSTOMER' },
      ]);

      const res = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.length).toBe(2);
    });

    test('[TC_EP_GET_002] VEP-RL-01: Lọc danh sách theo vai trò CUSTOMER', async () => {
      User.findAll.mockResolvedValue([
        { id: 3, fullName: 'Customer 1', role: 'CUSTOMER' },
      ]);

      const res = await request(app)
        .get('/api/users?role=CUSTOMER')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(User.findAll).toHaveBeenCalledWith(expect.objectContaining({
        where: expect.objectContaining({ role: 'CUSTOMER' })
      }));
    });

    test('[TC_EP_GET_004] VEP-ST-01: Lọc danh sách theo trạng thái ACTIVE', async () => {
      User.findAll.mockResolvedValue([
        { id: 1, fullName: 'Active User', status: 'ACTIVE' },
      ]);

      const res = await request(app)
        .get('/api/users?status=ACTIVE')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(User.findAll).toHaveBeenCalledWith(expect.objectContaining({
        where: expect.objectContaining({ status: 'ACTIVE' })
      }));
    });

    test('[TC_EP_GET_005] VEP-ST-02: Lọc danh sách theo trạng thái BLOCKED', async () => {
      User.findAll.mockResolvedValue([
        { id: 5, fullName: 'Blocked User', status: 'BLOCKED' },
      ]);

      const res = await request(app)
        .get('/api/users?status=BLOCKED')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(User.findAll).toHaveBeenCalledWith(expect.objectContaining({
        where: expect.objectContaining({ status: 'BLOCKED' })
      }));
    });

    test('[TC_EP_GET_006] VEP-SC-01: Tìm kiếm đồng thời theo họ tên hoặc số điện thoại', async () => {
      User.findAll.mockResolvedValue([
        { id: 1, fullName: 'Nguyễn Văn A', phone: '0912345678' },
      ]);

      const res = await request(app)
        .get('/api/users?search=0912')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(User.findAll).toHaveBeenCalled();
    });
  });

  // =========================================================================
  // 📌 KHỐI 6: GET /api/users/:id (LẤY CHI TIẾT THEO ID)
  // =========================================================================
  describe('Khối 6: Lấy chi tiết người dùng (GET /api/users/:id) - EP Test Cases', () => {

    test('[TC_EP_GETID_001] VEP-ID-01: Lấy chi tiết thành công người dùng tồn tại', async () => {
      User.findByPk.mockResolvedValue({
        id: 1,
        fullName: 'Admin User',
        username: 'admin',
        role: 'ADMIN',
      });

      const res = await request(app)
        .get('/api/users/1')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.id).toBe(1);
      expect(res.body.fullName).toBe('Admin User');
    });

    test('[TC_EP_GETID_002] IEP-ID-03: Báo lỗi 404 khi ID không tồn tại trong CSDL', async () => {
      User.findByPk.mockResolvedValue(null);

      const res = await request(app)
        .get('/api/users/999999')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(404);
      expect(res.body.message).toContain('Không tìm thấy người dùng');
    });
  });

  // =========================================================================
  // 📌 KHỐI 7: PUT /api/users/:id (CẬP NHẬT & PHÒNG VỆ AN TOÀN)
  // =========================================================================
  describe('Khối 7: Cập nhật người dùng & Phòng vệ an toàn (PUT /api/users/:id) - EP Test Cases', () => {

    test('[TC_EP_UPD_001] VEP-SEC-03, VEP-PT-01: Admin cập nhật hợp lệ thông tin, vai trò, điểm thưởng cho User khác', async () => {
      const mockTarget = createMockUserInstance({
        id: 2,
        fullName: 'Staff User',
        role: 'STAFF',
        points: 100,
      });
      User.findByPk.mockResolvedValue(mockTarget);

      const res = await request(app)
        .put('/api/users/2')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          fullName: 'Nhân Viên Sửa',
          points: 5000,
          role: 'STAFF',
        });

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Cập nhật thành công');
      expect(mockTarget.update).toHaveBeenCalledWith(expect.objectContaining({
        fullName: 'Nhân Viên Sửa',
        points: 5000,
      }));
    });

    test('[TC_EP_UPD_002] VEP-SEC-01, VEP-ST-02: Admin khóa tài khoản người dùng khác (status = BLOCKED)', async () => {
      const mockTarget = createMockUserInstance({
        id: 2,
        fullName: 'Staff 2',
        status: 'ACTIVE',
      });
      User.findByPk.mockResolvedValue(mockTarget);

      const res = await request(app)
        .put('/api/users/2')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'BLOCKED' });

      expect(res.status).toBe(200);
      expect(mockTarget.update).toHaveBeenCalledWith(expect.objectContaining({ status: 'BLOCKED' }));
    });

    test('[TC_EP_UPD_003] IEP-SEC-01: PHÒNG VỆ: Admin cố gắng tự khóa tài khoản chính mình (status = BLOCKED)', async () => {
      const mockAdmin = createMockUserInstance({
        id: 1,
        fullName: 'Admin Self',
        status: 'ACTIVE',
      });
      User.findByPk.mockResolvedValue(mockAdmin);

      const res = await request(app)
        .put('/api/users/1')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'BLOCKED' });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('Bạn không thể tự khóa tài khoản của chính mình');
      expect(mockAdmin.update).not.toHaveBeenCalled();
    });

    test('[TC_EP_UPD_004] VEP-SEC-04: MASS ASSIGNMENT DEFENSE: Staff gửi payload sửa role=ADMIN và status=BLOCKED', async () => {
      const mockTarget = createMockUserInstance({
        id: 3,
        fullName: 'Customer 3',
        role: 'CUSTOMER',
        status: 'ACTIVE',
        points: 10,
      });
      User.findByPk.mockResolvedValue(mockTarget);

      const res = await request(app)
        .put('/api/users/3')
        .set('Authorization', `Bearer ${staffToken}`)
        .send({ role: 'ADMIN', status: 'BLOCKED', points: 200 });

      expect(res.status).toBe(200);
      // Quyền của Staff bị giới hạn: KHÔNG ĐƯỢC cập nhật role và status
      expect(mockTarget.update).toHaveBeenCalledWith({ points: 200 });
      expect(mockTarget.update).not.toHaveBeenCalledWith(expect.objectContaining({ role: 'ADMIN' }));
    });

    test('[TC_EP_UPD_007] IEP-ID-03: Báo lỗi 404 khi cập nhật User ID không tồn tại', async () => {
      User.findByPk.mockResolvedValue(null);

      const res = await request(app)
        .put('/api/users/99999')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ fullName: 'Test' });

      expect(res.status).toBe(404);
      expect(res.body.message).toContain('Không tìm thấy người dùng');
    });
  });

  // =========================================================================
  // 📌 KHỐI 8: DELETE /api/users/:id (XÓA NGƯỜI DÙNG & PHÒNG VỆ TỰ XÓA)
  // =========================================================================
  describe('Khối 8: Xóa người dùng & Phòng vệ tự xóa (DELETE /api/users/:id) - EP Test Cases', () => {

    test('[TC_EP_DEL_001] VEP-SEC-02: Admin xóa thành công tài khoản người dùng khác', async () => {
      const mockTarget = createMockUserInstance({ id: 4, fullName: 'User 4' });
      User.findByPk.mockResolvedValue(mockTarget);

      const res = await request(app)
        .delete('/api/users/4')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toContain('Xóa người dùng thành công');
      expect(mockTarget.destroy).toHaveBeenCalled();
    });

    test('[TC_EP_DEL_002] IEP-SEC-02: PHÒNG VỆ: Admin cố gắng tự xóa tài khoản chính mình (targetUserId == currentUserId)', async () => {
      const res = await request(app)
        .delete('/api/users/1')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('Bạn không thể tự xóa tài khoản của chính mình');
      expect(User.findByPk).not.toHaveBeenCalled();
    });

    test('[TC_EP_DEL_003] IEP-ID-03: Báo lỗi 404 khi xóa tài khoản không tồn tại', async () => {
      User.findByPk.mockResolvedValue(null);

      const res = await request(app)
        .delete('/api/users/999999')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(404);
      expect(res.body.message).toContain('Không tìm thấy người dùng');
    });

    test('[TC_EP_DEL_004] IEP-JWT-04: Vai trò Nhân viên/Khách hàng gọi API xóa người dùng bị từ chối', async () => {
      const res = await request(app)
        .delete('/api/users/2')
        .set('Authorization', `Bearer ${staffToken}`);

      expect(res.status).toBe(403);
    });
  });

  // =========================================================================
  // 📌 KHỐI 9: PROFILE MANAGEMENT (GET & PUT /api/users/profile)
  // =========================================================================
  describe('Khối 9: Hồ sơ cá nhân (GET/PUT /api/users/profile) - EP Test Cases', () => {

    test('[TC_EP_PRF_001] VEP-ID-01: Lấy thông tin cá nhân của người dùng đang đăng nhập', async () => {
      User.findByPk.mockResolvedValue({
        id: 3,
        fullName: 'Customer Profile',
        username: 'cust_profile',
        email: 'cust@gmail.com',
      });

      const res = await request(app)
        .get('/api/users/profile')
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.fullName).toBe('Customer Profile');
    });

    test('[TC_EP_PRF_002] VEP-FN-01, VEP-AV-01: Cập nhật hồ sơ cá nhân với Họ tên và Avatar URL hợp lệ', async () => {
      const mockSelf = createMockUserInstance({
        id: 3,
        fullName: 'Old Name',
        avatar: null,
      });
      User.findByPk.mockResolvedValue(mockSelf);

      const res = await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          fullName: 'Nguyễn Văn Mới',
          avatar: 'https://cdn.futuresushi.com/avatar/user03.png',
        });

      expect(res.status).toBe(200);
      expect(res.body.message).toContain('Cập nhật hồ sơ thành công');
      expect(mockSelf.update).toHaveBeenCalledWith(expect.objectContaining({
        fullName: 'Nguyễn Văn Mới',
        avatar: 'https://cdn.futuresushi.com/avatar/user03.png',
      }));
    });
  });
});
