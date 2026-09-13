const { Payment, Order, User, RestaurantTable, OrderItem, Product } = require('../src/models');
const paymentController = require('../src/controllers/paymentController');
const { Op } = require('sequelize');

jest.mock('../src/models', () => ({
  Payment: {
    findAll: jest.fn(),
    findByPk: jest.fn(),
    destroy: jest.fn(),
  },
  Order: {},
  User: {},
  RestaurantTable: {},
  OrderItem: {},
  Product: {}
}));

describe('White-Box Testing: Payment Controller', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      query: {},
      params: {},
      body: {}
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    next = jest.fn();
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    console.error.mockRestore();
  });

  // =========================================================================
  // 1. getAllPayments
  // =========================================================================
  describe('getAllPayments', () => {
    test('[WB-PAY-01] Lấy toàn bộ danh sách thanh toán không kèm filter', async () => {
      const mockPayments = [
        { id: 1, amount: 150000, status: 'SUCCESS', paymentMethod: 'CASH' },
        { id: 2, amount: 300000, status: 'SUCCESS', paymentMethod: 'PAYOS' }
      ];
      Payment.findAll.mockResolvedValue(mockPayments);

      await paymentController.getAllPayments(req, res, next);

      expect(Payment.findAll).toHaveBeenCalledWith(expect.objectContaining({
        where: {}
      }));
      expect(res.json).toHaveBeenCalledWith(mockPayments);
      expect(next).not.toHaveBeenCalled();
    });

    test('[WB-PAY-02] Lọc theo status và paymentMethod', async () => {
      req.query = { status: 'SUCCESS', paymentMethod: 'TRANSFER' };
      Payment.findAll.mockResolvedValue([]);

      await paymentController.getAllPayments(req, res, next);

      expect(Payment.findAll).toHaveBeenCalledWith(expect.objectContaining({
        where: { status: 'SUCCESS', paymentMethod: 'TRANSFER' }
      }));
      expect(res.json).toHaveBeenCalledWith([]);
    });

    test('[WB-PAY-03] Tìm kiếm theo từ khóa search (transactionCode hoặc paymentMethod)', async () => {
      req.query = { search: 'PAYOS-12345' };
      Payment.findAll.mockResolvedValue([]);

      await paymentController.getAllPayments(req, res, next);

      expect(Payment.findAll).toHaveBeenCalledWith(expect.objectContaining({
        where: expect.objectContaining({
          [Op.or]: [
            { transactionCode: { [Op.like]: '%PAYOS-12345%' } },
            { paymentMethod: { [Op.like]: '%PAYOS-12345%' } }
          ]
        })
      }));
      expect(res.json).toHaveBeenCalledWith([]);
    });

    test('[WB-PAY-04] Ngoại lệ Database trong getAllPayments -> gọi next(error)', async () => {
      const error = new Error('DB Error');
      Payment.findAll.mockRejectedValue(error);

      await paymentController.getAllPayments(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  // =========================================================================
  // 2. getPaymentById
  // =========================================================================
  describe('getPaymentById', () => {
    test('[WB-PAY-05] Tìm thấy chi tiết thanh toán theo ID hợp lệ', async () => {
      req.params.id = '1';
      const mockPayment = { id: 1, amount: 200000, status: 'SUCCESS' };
      Payment.findByPk.mockResolvedValue(mockPayment);

      await paymentController.getPaymentById(req, res, next);

      expect(Payment.findByPk).toHaveBeenCalledWith('1', expect.any(Object));
      expect(res.json).toHaveBeenCalledWith(mockPayment);
    });

    test('[WB-PAY-06] Không tìm thấy thanh toán theo ID -> trả về 404', async () => {
      req.params.id = '999';
      Payment.findByPk.mockResolvedValue(null);

      await paymentController.getPaymentById(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Không tìm thấy giao dịch thanh toán" });
    });

    test('[WB-PAY-07] Ngoại lệ Database trong getPaymentById -> gọi next(error)', async () => {
      req.params.id = '1';
      const error = new Error('DB Error');
      Payment.findByPk.mockRejectedValue(error);

      await paymentController.getPaymentById(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  // =========================================================================
  // 3. deletePayment
  // =========================================================================
  describe('deletePayment', () => {
    test('[WB-PAY-08] Xóa thanh toán thành công khi tìm thấy', async () => {
      req.params.id = '1';
      const mockPayment = {
        id: 1,
        destroy: jest.fn().mockResolvedValue(true)
      };
      Payment.findByPk.mockResolvedValue(mockPayment);

      await paymentController.deletePayment(req, res, next);

      expect(mockPayment.destroy).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({ message: "Xóa thông tin thanh toán thành công" });
    });

    test('[WB-PAY-09] Xóa thanh toán không tìm thấy -> trả về 404', async () => {
      req.params.id = '999';
      Payment.findByPk.mockResolvedValue(null);

      await paymentController.deletePayment(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Không tìm thấy giao dịch thanh toán" });
    });

    test('[WB-PAY-10] Ngoại lệ Database trong deletePayment -> gọi next(error)', async () => {
      req.params.id = '1';
      const error = new Error('DB Delete Error');
      Payment.findByPk.mockRejectedValue(error);

      await paymentController.deletePayment(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
