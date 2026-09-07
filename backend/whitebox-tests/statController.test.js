const { Order } = require('../src/models');
const statController = require('../src/controllers/statController');
const { Op } = require('sequelize');

jest.mock('../src/models', () => ({
  Order: {
    findOne: jest.fn(),
  }
}));

describe('White-Box Testing: Stat Controller', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      query: {}
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
  // getStats
  // =========================================================================
  describe('getStats', () => {
    test('[WB-STAT-01] Thống kê mặc định theo ngày (type="day", không truyền date)', async () => {
      const mockOrderStats = {
        getDataValue: jest.fn((key) => {
          if (key === 'totalOrders') return '15';
          if (key === 'totalRevenue') return '2500000';
          return null;
        })
      };
      Order.findOne.mockResolvedValue(mockOrderStats);

      await statController.getStats(req, res, next);

      expect(Order.findOne).toHaveBeenCalledWith(expect.objectContaining({
        where: expect.objectContaining({
          status: 'COMPLETED',
          paymentStatus: 'PAID',
          created_at: expect.objectContaining({
            [Op.between]: expect.any(Array)
          })
        })
      }));
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        type: 'day',
        totalOrders: 15,
        totalRevenue: 2500000
      }));
      expect(next).not.toHaveBeenCalled();
    });

    test('[WB-STAT-02] Thống kê theo tháng với ngày hợp lệ (type="month", date="2026-09-08")', async () => {
      req.query = { type: 'month', date: '2026-09-08' };
      const mockOrderStats = {
        getDataValue: jest.fn((key) => {
          if (key === 'totalOrders') return '50';
          if (key === 'totalRevenue') return '12000000';
          return null;
        })
      };
      Order.findOne.mockResolvedValue(mockOrderStats);

      await statController.getStats(req, res, next);

      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        type: 'month',
        totalOrders: 50,
        totalRevenue: 12000000
      }));
    });

    test('[WB-STAT-03] Thống kê theo năm với ngày hợp lệ (type="year", date="2026-01-15")', async () => {
      req.query = { type: 'year', date: '2026-01-15' };
      const mockOrderStats = {
        getDataValue: jest.fn((key) => {
          if (key === 'totalOrders') return null;
          if (key === 'totalRevenue') return null;
          return null;
        })
      };
      Order.findOne.mockResolvedValue(mockOrderStats);

      await statController.getStats(req, res, next);

      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        type: 'year',
        totalOrders: 0,
        totalRevenue: 0
      }));
    });

    test('[WB-STAT-04] Xử lý tham số type không hợp lệ (fallback về "day") và date sai định dạng', async () => {
      req.query = { type: 'invalid_type', date: 'invalid_date_string' };
      const mockOrderStats = {
        getDataValue: jest.fn(() => 0)
      };
      Order.findOne.mockResolvedValue(mockOrderStats);

      await statController.getStats(req, res, next);

      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        type: 'day',
        totalOrders: 0,
        totalRevenue: 0
      }));
    });

    test('[WB-STAT-05] Ngoại lệ Database trong getStats -> gọi next(error)', async () => {
      const error = new Error('Database connection failed');
      Order.findOne.mockRejectedValue(error);

      await statController.getStats(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
