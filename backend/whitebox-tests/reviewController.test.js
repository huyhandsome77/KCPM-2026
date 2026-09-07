const { Review, User } = require('../src/models');
const reviewController = require('../src/controllers/reviewController');
const { Op } = require('sequelize');

jest.mock('../src/models', () => ({
  Review: {
    findAndCountAll: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn(),
  },
  User: {}
}));

describe('White-Box Testing: Review Controller', () => {
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
  // 1. getAllReviews
  // =========================================================================
  describe('getAllReviews', () => {
    test('[WB-REV-01] Lấy danh sách đánh giá mặc định (page=1, limit=10, không lọc ngày)', async () => {
      const mockResult = {
        count: 2,
        rows: [
          { id: 1, dish_name: 'Salmon Roll', rating: 5, content: 'Ngon tuyệt' },
          { id: 2, dish_name: 'Tuna Sashimi', rating: 4, content: 'Tươi' }
        ]
      };
      Review.findAndCountAll.mockResolvedValue(mockResult);

      await reviewController.getAllReviews(req, res, next);

      expect(Review.findAndCountAll).toHaveBeenCalledWith(expect.objectContaining({
        where: {},
        limit: 10,
        offset: 0
      }));
      expect(res.json).toHaveBeenCalledWith({
        totalItems: 2,
        totalPages: 1,
        currentPage: 1,
        reviews: mockResult.rows
      });
    });

    test('[WB-REV-02] Lấy danh sách đánh giá có lọc theo ngày (date)', async () => {
      req.query = { page: '2', limit: '5', date: '2026-09-08' };
      Review.findAndCountAll.mockResolvedValue({ count: 12, rows: [] });

      await reviewController.getAllReviews(req, res, next);

      expect(Review.findAndCountAll).toHaveBeenCalledWith(expect.objectContaining({
        where: expect.objectContaining({
          created_at: expect.objectContaining({
            [Op.between]: expect.any(Array)
          })
        }),
        limit: 5,
        offset: 5
      }));
      expect(res.json).toHaveBeenCalledWith({
        totalItems: 12,
        totalPages: 3,
        currentPage: 2,
        reviews: []
      });
    });

    test('[WB-REV-03] Ngoại lệ Database trong getAllReviews -> gọi next(error)', async () => {
      const error = new Error('DB Error');
      Review.findAndCountAll.mockRejectedValue(error);

      await reviewController.getAllReviews(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  // =========================================================================
  // 2. createReview
  // =========================================================================
  describe('createReview', () => {
    test('[WB-REV-04] Từ chối khi rating không hợp lệ (null, 0, hoặc > 5)', async () => {
      // Missing rating
      req.body = { dish_name: 'Sushi', content: 'Good' };
      await reviewController.createReview(req, res, next);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "Số sao không hợp lệ (1-5)" });

      // Rating = 0
      req.body.rating = 0;
      await reviewController.createReview(req, res, next);
      expect(res.status).toHaveBeenCalledWith(400);

      // Rating = 6
      req.body.rating = 6;
      await reviewController.createReview(req, res, next);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    test('[WB-REV-05] Tạo đánh giá thành công khi dữ liệu hợp lệ (rating 1-5)', async () => {
      req.body = {
        user_id: 1,
        phone: '0912345678',
        dish_name: 'Sushi Cá Hồi',
        content: 'Rất tươi ngon',
        rating: 5
      };
      const mockCreatedReview = { id: 10, ...req.body };
      Review.create.mockResolvedValue(mockCreatedReview);

      await reviewController.createReview(req, res, next);

      expect(Review.create).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: "Cảm ơn bạn đã gửi đánh giá!",
        review: mockCreatedReview
      });
    });

    test('[WB-REV-06] Ngoại lệ Database trong createReview -> gọi next(error)', async () => {
      req.body = { rating: 4, dish_name: 'Maki' };
      const error = new Error('DB Create Error');
      Review.create.mockRejectedValue(error);

      await reviewController.createReview(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  // =========================================================================
  // 3. deleteReview
  // =========================================================================
  describe('deleteReview', () => {
    test('[WB-REV-07] Xóa đánh giá thành công khi tìm thấy theo ID', async () => {
      req.params.id = '1';
      const mockReview = {
        id: 1,
        destroy: jest.fn().mockResolvedValue(true)
      };
      Review.findByPk.mockResolvedValue(mockReview);

      await reviewController.deleteReview(req, res, next);

      expect(mockReview.destroy).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({ message: "Đã xóa đánh giá thành công" });
    });

    test('[WB-REV-08] Xóa đánh giá không tìm thấy -> trả về 404', async () => {
      req.params.id = '999';
      Review.findByPk.mockResolvedValue(null);

      await reviewController.deleteReview(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Không tìm thấy đánh giá" });
    });

    test('[WB-REV-09] Ngoại lệ Database trong deleteReview -> gọi next(error)', async () => {
      req.params.id = '1';
      const error = new Error('DB Delete Error');
      Review.findByPk.mockRejectedValue(error);

      await reviewController.deleteReview(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
