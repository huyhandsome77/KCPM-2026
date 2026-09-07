const productController = require('../src/controllers/productController');
const { Product } = require('../src/models');
const { Op } = require('sequelize');

jest.mock('../src/models', () => ({
  Product: {
    findAll: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn(),
  }
}));

describe('White-Box Testing: Product Controller (Kiểm thử Hộp trắng Module Món Ăn & Khớp BVA)', () => {
  let req, res;

  beforeEach(() => {
    req = {
      query: {},
      params: {},
      body: {}
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis()
    };
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    console.error.mockRestore();
  });

  // =========================================================================
  // 1. getAllProducts
  // =========================================================================
  describe('getAllProducts (Lấy danh sách món ăn & Bộ lọc)', () => {
    test('[WB-PRD-01] Nhánh không truyền query filter (where = {})', async () => {
      const mockProducts = [{ id: 1, name: 'Salmon Sushi', price: 50000 }];
      Product.findAll.mockResolvedValue(mockProducts);

      await productController.getAllProducts(req, res);

      expect(Product.findAll).toHaveBeenCalledWith({ where: {} });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockProducts);
    });

    test('[WB-PRD-02] Nhánh lọc theo category_id', async () => {
      req.query.category_id = '2';
      Product.findAll.mockResolvedValue([]);

      await productController.getAllProducts(req, res);

      expect(Product.findAll).toHaveBeenCalledWith({ where: { category_id: '2' } });
      expect(res.status).toHaveBeenCalledWith(200);
    });

    test('[WB-PRD-03] Nhánh tìm kiếm theo từ khóa search (hợp lệ)', async () => {
      req.query.search = 'salmon';
      Product.findAll.mockResolvedValue([]);

      await productController.getAllProducts(req, res);

      expect(Product.findAll).toHaveBeenCalledWith({
        where: { name: { [Op.like]: '%salmon%' } }
      });
      expect(res.status).toHaveBeenCalledWith(200);
    });

    test('[WB-PRD-04] Nhánh kết hợp cả category_id và search', async () => {
      req.query = { category_id: '1', search: 'maki' };
      Product.findAll.mockResolvedValue([]);

      await productController.getAllProducts(req, res);

      expect(Product.findAll).toHaveBeenCalledWith({
        where: {
          category_id: '1',
          name: { [Op.like]: '%maki%' }
        }
      });
      expect(res.status).toHaveBeenCalledWith(200);
    });

    test('[WB-PRD-05] Nhánh search rỗng hoặc whitespace -> không thêm name like vào where', async () => {
      req.query.search = '   ';
      Product.findAll.mockResolvedValue([]);

      await productController.getAllProducts(req, res);

      expect(Product.findAll).toHaveBeenCalledWith({ where: {} });
    });

    test('[WB-PRD-06] Khối catch ngoại lệ lỗi DB trong getAllProducts (500)', async () => {
      Product.findAll.mockRejectedValue(new Error('DB Query Failed'));

      await productController.getAllProducts(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'DB Query Failed' });
    });
  });

  // =========================================================================
  // 2. getProductById
  // =========================================================================
  describe('getProductById (Lấy chi tiết món ăn theo ID)', () => {
    test('[WB-PRD-07] Nhánh tìm thấy món ăn theo ID hợp lệ (200)', async () => {
      req.params.id = '1';
      const mockProduct = { id: 1, name: 'Tuna Sushi', price: 60000 };
      Product.findByPk.mockResolvedValue(mockProduct);

      await productController.getProductById(req, res);

      expect(Product.findByPk).toHaveBeenCalledWith(1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockProduct);
    });

    test('[WB-PRD-08] [BVA] ID không hợp lệ: Số 0, số âm (-1), chuỗi chữ "abc", số thực 1.5 -> 400', async () => {
      // ID = 0
      req.params.id = '0';
      await productController.getProductById(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Invalid product ID' });

      // ID = -1
      req.params.id = '-1';
      await productController.getProductById(req, res);
      expect(res.status).toHaveBeenCalledWith(400);

      // ID = 'abc'
      req.params.id = 'abc';
      await productController.getProductById(req, res);
      expect(res.status).toHaveBeenCalledWith(400);

      // ID = '1.5'
      req.params.id = '1.5';
      await productController.getProductById(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    test('[WB-PRD-09] Nhánh không tìm thấy món ăn (404)', async () => {
      req.params.id = '999';
      Product.findByPk.mockResolvedValue(null);

      await productController.getProductById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Product not found' });
    });

    test('[WB-PRD-10] Khối catch ngoại lệ lỗi DB khi getProductById (500)', async () => {
      req.params.id = '1';
      Product.findByPk.mockRejectedValue(new Error('Connection lost'));

      await productController.getProductById(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Connection lost' });
    });
  });

  // =========================================================================
  // 3. createProduct (BVA Input Boundaries)
  // =========================================================================
  describe('createProduct (Tạo món ăn & Kiểm thử toàn bộ giá trị biên BVA)', () => {
    test('[WB-PRD-11] [BVA-PRD-001 & 007 & 013] Hợp lệ: Name 1 ký tự, Price 0.01 VNĐ, Stock 0, Category ID 1', async () => {
      req.body = {
        name: 'P',
        price: 0.01,
        stock: 0,
        category_id: 1,
        description: 'Min test',
        image: 'http://img.jpg',
        isAvailable: true
      };
      const created = { id: 1, ...req.body };
      Product.create.mockResolvedValue(created);

      await productController.createProduct(req, res);

      expect(Product.create).toHaveBeenCalledWith({
        name: 'P',
        price: 0.01,
        stock: 0,
        category_id: 1,
        description: 'Min test',
        image: 'http://img.jpg',
        isAvailable: true
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(created);
    });

    test('[WB-PRD-12] [BVA-PRD-004 & 010 & 016] Hợp lệ Max: Name 150 ký tự, Price 99,999,999.99, Stock 2,147,483,647', async () => {
      const name150 = 'P'.repeat(150);
      req.body = {
        name: name150,
        price: 99999999.99,
        stock: 2147483647,
        category_id: 5
      };
      const created = { id: 2, ...req.body, isAvailable: true, description: null, image: null };
      Product.create.mockResolvedValue(created);

      await productController.createProduct(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(created);
    });

    test('[WB-PRD-13] [BVA-PRD-005] Name: Max + 1 (151 ký tự - Vượt biên -> 400)', async () => {
      req.body = {
        name: 'P'.repeat(151),
        price: 50000,
        category_id: 1
      };

      await productController.createProduct(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Product name cannot exceed 150 characters' });
    });

    test('[WB-PRD-14] [BVA-PRD-006] Name: Chuỗi rỗng "" / Whitespace / Null / Thiếu -> 400', async () => {
      // Empty string
      req.body = { name: '', price: 50000, category_id: 1 };
      await productController.createProduct(req, res);
      expect(res.status).toHaveBeenCalledWith(400);

      // Null
      req.body = { name: null, price: 50000, category_id: 1 };
      await productController.createProduct(req, res);
      expect(res.status).toHaveBeenCalledWith(400);

      // Undefined
      req.body = { price: 50000, category_id: 1 };
      await productController.createProduct(req, res);
      expect(res.status).toHaveBeenCalledWith(400);

      // req.body is undefined
      req.body = undefined;
      await productController.createProduct(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    test('[WB-PRD-15] [BVA-PRD-009 & 011 & 012] Price: Số âm (-0.01), Tràn số (> 99999999.99), Chuỗi rác ("mot-tram-k") -> 400', async () => {
      // Price negative
      req.body = { name: 'Sushi', price: -0.01, category_id: 1 };
      await productController.createProduct(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Price must be between 0 and 99,999,999.99' });

      // Price overflow
      req.body = { name: 'Sushi', price: 100000000.00, category_id: 1 };
      await productController.createProduct(req, res);
      expect(res.status).toHaveBeenCalledWith(400);

      // Price string invalid
      req.body = { name: 'Sushi', price: 'mot-tram-k', category_id: 1 };
      await productController.createProduct(req, res);
      expect(res.status).toHaveBeenCalledWith(400);

      // Price missing
      req.body = { name: 'Sushi', category_id: 1 };
      await productController.createProduct(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    test('[WB-PRD-16] [BVA-PRD-015 & 017 & 018] Stock: Số âm (-1), Tràn số (2,147,483,648), Số thực (10.5), Chuỗi rác -> 400', async () => {
      // Negative
      req.body = { name: 'Sushi', price: 50000, stock: -1, category_id: 1 };
      await productController.createProduct(req, res);
      expect(res.status).toHaveBeenCalledWith(400);

      // Overflow
      req.body = { name: 'Sushi', price: 50000, stock: 2147483648, category_id: 1 };
      await productController.createProduct(req, res);
      expect(res.status).toHaveBeenCalledWith(400);

      // Float 10.5
      req.body = { name: 'Sushi', price: 50000, stock: 10.5, category_id: 1 };
      await productController.createProduct(req, res);
      expect(res.status).toHaveBeenCalledWith(400);

      // Non-numeric
      req.body = { name: 'Sushi', price: 50000, stock: 'invalid', category_id: 1 };
      await productController.createProduct(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    test('[WB-PRD-17] [BVA-PRD-021 & 022 & 024] Category ID: Số 0, Số âm (-1), Null, Chuỗi rác, Float -> 400', async () => {
      // ID = 0
      req.body = { name: 'Sushi', price: 50000, category_id: 0 };
      await productController.createProduct(req, res);
      expect(res.status).toHaveBeenCalledWith(400);

      // ID = -1
      req.body = { name: 'Sushi', price: 50000, category_id: -1 };
      await productController.createProduct(req, res);
      expect(res.status).toHaveBeenCalledWith(400);

      // ID = null / missing
      req.body = { name: 'Sushi', price: 50000 };
      await productController.createProduct(req, res);
      expect(res.status).toHaveBeenCalledWith(400);

      // ID = 'abc'
      req.body = { name: 'Sushi', price: 50000, category_id: 'abc' };
      await productController.createProduct(req, res);
      expect(res.status).toHaveBeenCalledWith(400);

      // ID = 1.5
      req.body = { name: 'Sushi', price: 50000, category_id: 1.5 };
      await productController.createProduct(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    test('[WB-PRD-18] Khối catch lỗi khi Product.create ném ngoại lệ (400)', async () => {
      req.body = { name: 'Valid Sushi', price: 50000, category_id: 1 };
      Product.create.mockRejectedValue(new Error('Validation DB error'));

      await productController.createProduct(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Validation DB error' });
    });
  });

  // =========================================================================
  // 4. updateProduct
  // =========================================================================
  describe('updateProduct (Cập nhật món ăn & Kiểm thử giá trị biên BVA)', () => {
    test('[WB-PRD-19] Cập nhật thành công đầy đủ các trường hợp lệ (200)', async () => {
      req.params.id = '1';
      req.body = {
        name: 'Updated Sushi',
        price: 75000,
        stock: 50,
        category_id: 2,
        description: 'New desc',
        image: 'http://new.jpg',
        isAvailable: false
      };
      const updatedProduct = { id: 1, ...req.body };

      Product.update.mockResolvedValue([1]);
      Product.findByPk.mockResolvedValue(updatedProduct);

      await productController.updateProduct(req, res);

      expect(Product.update).toHaveBeenCalledWith(req.body, { where: { id: 1 } });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(updatedProduct);
    });

    test('[WB-PRD-20] [BVA] Cập nhật với ID không hợp lệ (0, -1, "abc") -> 400', async () => {
      req.params.id = '0';
      req.body = { price: 60000 };

      await productController.updateProduct(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Invalid product ID' });
    });

    test('[WB-PRD-21] [BVA] Cập nhật Name không hợp lệ (rỗng, null, > 150 ký tự) -> 400', async () => {
      req.params.id = '1';

      // Empty string
      req.body = { name: '' };
      await productController.updateProduct(req, res);
      expect(res.status).toHaveBeenCalledWith(400);

      // Null
      req.body = { name: null };
      await productController.updateProduct(req, res);
      expect(res.status).toHaveBeenCalledWith(400);

      // > 150 chars
      req.body = { name: 'P'.repeat(151) };
      await productController.updateProduct(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    test('[WB-PRD-22] [BVA] Cập nhật Price không hợp lệ (rỗng, null, âm, tràn số, chuỗi chữ) -> 400', async () => {
      req.params.id = '1';

      // Negative
      req.body = { price: -10000 };
      await productController.updateProduct(req, res);
      expect(res.status).toHaveBeenCalledWith(400);

      // Overflow
      req.body = { price: 100000000.00 };
      await productController.updateProduct(req, res);
      expect(res.status).toHaveBeenCalledWith(400);

      // String invalid
      req.body = { price: 'abc' };
      await productController.updateProduct(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    test('[WB-PRD-23] [BVA] Cập nhật Stock không hợp lệ (null, âm, tràn số, float, chuỗi) -> 400', async () => {
      req.params.id = '1';

      // Negative
      req.body = { stock: -5 };
      await productController.updateProduct(req, res);
      expect(res.status).toHaveBeenCalledWith(400);

      // Float
      req.body = { stock: 12.5 };
      await productController.updateProduct(req, res);
      expect(res.status).toHaveBeenCalledWith(400);

      // Overflow
      req.body = { stock: 2147483648 };
      await productController.updateProduct(req, res);
      expect(res.status).toHaveBeenCalledWith(400);

      // Null / Non-numeric
      req.body = { stock: 'not-a-number' };
      await productController.updateProduct(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    test('[WB-PRD-24] [BVA] Cập nhật Category ID không hợp lệ (null, 0, âm, float) -> 400', async () => {
      req.params.id = '1';

      // ID = 0
      req.body = { category_id: 0 };
      await productController.updateProduct(req, res);
      expect(res.status).toHaveBeenCalledWith(400);

      // Float
      req.body = { category_id: 2.5 };
      await productController.updateProduct(req, res);
      expect(res.status).toHaveBeenCalledWith(400);

      // Non-numeric
      req.body = { category_id: 'abc' };
      await productController.updateProduct(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    test('[WB-PRD-25] Cập nhật với req.body là undefined', async () => {
      req.params.id = '1';
      req.body = undefined;
      Product.update.mockResolvedValue([1]);
      Product.findByPk.mockResolvedValue({ id: 1, name: 'Existing Product' });

      await productController.updateProduct(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ id: 1, name: 'Existing Product' });
    });

    test('[WB-PRD-26] Nhánh cập nhật món ăn không tồn tại (updated = 0 -> 404)', async () => {
      req.params.id = '999';
      req.body = { price: 50000 };

      Product.update.mockResolvedValue([0]);

      await productController.updateProduct(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Product not found' });
    });

    test('[WB-PRD-27] Khối catch lỗi khi cập nhật món ăn (400)', async () => {
      req.params.id = '1';
      req.body = { price: 50000 };

      Product.update.mockRejectedValue(new Error('Update DB error'));

      await productController.updateProduct(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Update DB error' });
    });
  });

  // =========================================================================
  // 5. deleteProduct
  // =========================================================================
  describe('deleteProduct (Xóa món ăn)', () => {
    test('[WB-PRD-27] Nhánh xóa món ăn thành công (deleted = 1 -> 204)', async () => {
      req.params.id = '1';
      Product.destroy.mockResolvedValue(1);

      await productController.deleteProduct(req, res);

      expect(Product.destroy).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.send).toHaveBeenCalled();
    });

    test('[WB-PRD-28] [BVA] Xóa với ID không hợp lệ (0, -1, "abc") -> 400', async () => {
      req.params.id = '0';
      await productController.deleteProduct(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    test('[WB-PRD-29] Nhánh xóa món ăn không tồn tại (deleted = 0 -> 404)', async () => {
      req.params.id = '999';
      Product.destroy.mockResolvedValue(0);

      await productController.deleteProduct(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Product not found' });
    });

    test('[WB-PRD-30] Khối catch ngoại lệ lỗi DB khi xóa món ăn (500)', async () => {
      req.params.id = '1';
      Product.destroy.mockRejectedValue(new Error('Foreign key error'));

      await productController.deleteProduct(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Foreign key error' });
    });
  });
});
