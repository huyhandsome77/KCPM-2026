const categoryController = require('../src/controllers/categoryController');
const { Category, Product } = require('../src/models');
const { Op } = require('sequelize');

jest.mock('../src/models', () => ({
    Category: {
        findAll: jest.fn(),
        findByPk: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        destroy: jest.fn(),
    },
    Product: {
        count: jest.fn(),
    }
}));

describe('White-Box Testing: Category Controller (Kiểm thử Hộp trắng Module Danh Mục & Khớp BVA)', () => {
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
    // 1. getAllCategories
    // =========================================================================
    describe('getAllCategories (Lấy danh sách danh mục & Tìm kiếm)', () => {
        test('[WB-CAT-01] Nhánh không có search query & danh mục có kèm sản phẩm', async () => {
            const mockCategories = [
                {
                    toJSON: () => ({ id: 1, name: 'Sushi', products: [{ id: 101 }, { id: 102 }] })
                },
                {
                    toJSON: () => ({ id: 2, name: 'Drink', products: null }) // Branch: products is falsy
                }
            ];

            Category.findAll.mockResolvedValue(mockCategories);

            await categoryController.getAllCategories(req, res);

            expect(Category.findAll).toHaveBeenCalledWith({
                where: {},
                include: [{
                    model: Product,
                    as: 'products',
                    attributes: ['id']
                }]
            });
            expect(res.json).toHaveBeenCalledWith([
                { id: 1, name: 'Sushi', productCount: 2 },
                { id: 2, name: 'Drink', productCount: 0 }
            ]);
        });

        test('[WB-CAT-02] Nhánh danh mục là plain object không có toJSON method', async () => {
            const mockCategories = [
                { id: 3, name: 'Sashimi', products: [{ id: 201 }] }
            ];

            Category.findAll.mockResolvedValue(mockCategories);

            await categoryController.getAllCategories(req, res);

            expect(res.json).toHaveBeenCalledWith([
                { id: 3, name: 'Sashimi', productCount: 1 }
            ]);
        });

        test('[WB-CAT-03] Nhánh có từ khóa search hợp lệ (Query Op.or name và description)', async () => {
            req.query.search = 'sashimi';

            Category.findAll.mockResolvedValue([
                {
                    toJSON: () => ({ id: 3, name: 'Sashimi', products: [{ id: 201 }] })
                }
            ]);

            await categoryController.getAllCategories(req, res);

            expect(Category.findAll).toHaveBeenCalledWith(expect.objectContaining({
                where: {
                    [Op.or]: [
                        { name: { [Op.like]: '%sashimi%' } },
                        { description: { [Op.like]: '%sashimi%' } }
                    ]
                }
            }));
            expect(res.json).toHaveBeenCalledWith([
                { id: 3, name: 'Sashimi', productCount: 1 }
            ]);
        });

        test('[WB-CAT-04] Nhánh search là chuỗi rỗng / whitespace / non-string -> không thêm where search', async () => {
            req.query.search = '   ';
            Category.findAll.mockResolvedValue([]);

            await categoryController.getAllCategories(req, res);

            expect(Category.findAll).toHaveBeenCalledWith(expect.objectContaining({ where: {} }));
        });

        test('[WB-CAT-05] Khối catch ngoại lệ khi Database lỗi trong getAllCategories', async () => {
            Category.findAll.mockRejectedValue(new Error('Database query failed'));

            await categoryController.getAllCategories(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ message: 'Database query failed' });
        });
    });

    // =========================================================================
    // 2. getCategoryById
    // =========================================================================
    describe('getCategoryById (Lấy chi tiết danh mục theo ID)', () => {
        test('[WB-CAT-06] Nhánh tìm thấy danh mục theo ID hợp lệ (Min ID = 1)', async () => {
            req.params.id = '1';
            const mockCategory = { id: 1, name: 'Nigiri', description: 'Fresh nigiri' };
            Category.findByPk.mockResolvedValue(mockCategory);

            await categoryController.getCategoryById(req, res);

            expect(Category.findByPk).toHaveBeenCalledWith(1);
            expect(res.json).toHaveBeenCalledWith(mockCategory);
        });

        test('[WB-CAT-07] [BVA Border] ID không hợp lệ: Số 0 (Min - 1), số âm (-1), chuỗi không phải số, số thực', async () => {
            // Case 1: ID = 0
            req.params.id = '0';
            await categoryController.getCategoryById(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: 'Invalid category ID' });

            // Case 2: ID = -1
            req.params.id = '-1';
            await categoryController.getCategoryById(req, res);
            expect(res.status).toHaveBeenCalledWith(400);

            // Case 3: ID = 'abc'
            req.params.id = 'abc';
            await categoryController.getCategoryById(req, res);
            expect(res.status).toHaveBeenCalledWith(400);

            // Case 4: ID = '1.5' (float)
            req.params.id = '1.5';
            await categoryController.getCategoryById(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
        });

        test('[WB-CAT-08] Nhánh không tìm thấy danh mục (ID không tồn tại -> 404)', async () => {
            req.params.id = '999';
            Category.findByPk.mockResolvedValue(null);

            await categoryController.getCategoryById(req, res);

            expect(Category.findByPk).toHaveBeenCalledWith(999);
            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: 'Not found' });
        });

        test('[WB-CAT-09] Khối catch ngoại lệ lỗi DB khi tìm theo ID', async () => {
            req.params.id = '1';
            Category.findByPk.mockRejectedValue(new Error('Connection lost'));

            await categoryController.getCategoryById(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ message: 'Connection lost' });
        });
    });

    // =========================================================================
    // 3. createCategory (BVA Input Boundaries)
    // =========================================================================
    describe('createCategory (Tạo mới danh mục & Kiểm thử giá trị biên BVA)', () => {
        test('[WB-CAT-10] [BVA-CAT-001] Name: Min độ dài (1 ký tự "A")', async () => {
            req.body = { name: 'A', description: 'Min test', image: 'http://img.png' };
            const createdData = { id: 1, ...req.body };
            Category.create.mockResolvedValue(createdData);

            await categoryController.createCategory(req, res);

            expect(Category.create).toHaveBeenCalledWith({
                name: 'A',
                description: 'Min test',
                image: 'http://img.png'
            });
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(createdData);
        });

        test('[WB-CAT-11] [BVA-CAT-002] Name: Min + 1 (2 ký tự "AB")', async () => {
            req.body = { name: 'AB' };
            const createdData = { id: 2, name: 'AB', description: null, image: null };
            Category.create.mockResolvedValue(createdData);

            await categoryController.createCategory(req, res);

            expect(Category.create).toHaveBeenCalledWith({
                name: 'AB',
                description: null,
                image: null
            });
            expect(res.status).toHaveBeenCalledWith(201);
        });

        test('[WB-CAT-12] [BVA-CAT-003 & 004] Name: Max - 1 (99 ký tự) & Max (100 ký tự)', async () => {
            const name100 = 'A'.repeat(100);
            req.body = { name: name100 };
            const createdData = { id: 3, name: name100, description: null, image: null };
            Category.create.mockResolvedValue(createdData);

            await categoryController.createCategory(req, res);

            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(createdData);
        });

        test('[WB-CAT-13] [BVA-CAT-005] Name: Max + 1 (101 ký tự - Vượt biên -> 400)', async () => {
            req.body = { name: 'A'.repeat(101) };

            await categoryController.createCategory(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: 'Category name cannot exceed 100 characters' });
            expect(Category.create).not.toHaveBeenCalled();
        });

        test('[WB-CAT-14] [BVA-CAT-006 & 007 & 008] Name: Chuỗi rỗng "" / Whitespace / Null / Thiếu / Sai kiểu -> 400', async () => {
            // Case 1: Empty string ""
            req.body = { name: '' };
            await categoryController.createCategory(req, res);
            expect(res.status).toHaveBeenCalledWith(400);

            // Case 2: Whitespace only "   "
            req.body = { name: '   ' };
            await categoryController.createCategory(req, res);
            expect(res.status).toHaveBeenCalledWith(400);

            // Case 3: Null
            req.body = { name: null };
            await categoryController.createCategory(req, res);
            expect(res.status).toHaveBeenCalledWith(400);

            // Case 4: Undefined / Missing
            req.body = { description: 'Only desc' };
            await categoryController.createCategory(req, res);
            expect(res.status).toHaveBeenCalledWith(400);

            // Case 5: Non-string type (number)
            req.body = { name: 12345 };
            await categoryController.createCategory(req, res);
            expect(res.status).toHaveBeenCalledWith(400);

            // Case 6: req.body is undefined
            req.body = undefined;
            await categoryController.createCategory(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
        });

        test('[WB-CAT-15] Khối catch lỗi khi Category.create ném ngoại lệ (400)', async () => {
            req.body = { name: 'Valid Name' };
            Category.create.mockRejectedValue(new Error('Sequelize database error'));

            await categoryController.createCategory(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: 'Sequelize database error' });
        });
    });

    // =========================================================================
    // 4. updateCategory
    // =========================================================================
    describe('updateCategory (Cập nhật danh mục & Kiểm thử giá trị biên BVA)', () => {
        test('[WB-CAT-16] Nhánh cập nhật thành công với dữ liệu hợp lệ (updated = 1)', async () => {
            req.params.id = '1';
            req.body = { name: 'Sushi Rolls', description: 'Updated desc', image: 'http://img.jpg' };
            const updatedData = { id: 1, ...req.body };

            Category.update.mockResolvedValue([1]);
            Category.findByPk.mockResolvedValue(updatedData);

            await categoryController.updateCategory(req, res);

            expect(Category.update).toHaveBeenCalledWith({
                name: 'Sushi Rolls',
                description: 'Updated desc',
                image: 'http://img.jpg'
            }, { where: { id: 1 } });
            expect(Category.findByPk).toHaveBeenCalledWith(1);
            expect(res.json).toHaveBeenCalledWith(updatedData);
        });

        test('[WB-CAT-17] Cập nhật không truyền name (chỉ cập nhật description/image)', async () => {
            req.params.id = '1';
            req.body = { description: 'Only desc updated' };
            const updatedData = { id: 1, name: 'Original Name', description: 'Only desc updated' };

            Category.update.mockResolvedValue([1]);
            Category.findByPk.mockResolvedValue(updatedData);

            await categoryController.updateCategory(req, res);

            expect(Category.update).toHaveBeenCalledWith({
                description: 'Only desc updated'
            }, { where: { id: 1 } });
            expect(res.json).toHaveBeenCalledWith(updatedData);
        });

        test('[WB-CAT-18] [BVA] Cập nhật với ID không hợp lệ (0, -1, "abc") -> 400', async () => {
            req.params.id = '0';
            req.body = { name: 'New Name' };

            await categoryController.updateCategory(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: 'Invalid category ID' });
        });

        test('[WB-CAT-19] [BVA] Cập nhật với Name không hợp lệ: Rỗng "", Null, Sai kiểu, Quá 100 ký tự -> 400', async () => {
            req.params.id = '1';

            // Empty string
            req.body = { name: '' };
            await categoryController.updateCategory(req, res);
            expect(res.status).toHaveBeenCalledWith(400);

            // Null
            req.body = { name: null };
            await categoryController.updateCategory(req, res);
            expect(res.status).toHaveBeenCalledWith(400);

            // Length > 100
            req.body = { name: 'A'.repeat(101) };
            await categoryController.updateCategory(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
        });

        test('[WB-CAT-20] Cập nhật với req.body là undefined', async () => {
            req.params.id = '1';
            req.body = undefined;
            Category.update.mockResolvedValue([1]);
            Category.findByPk.mockResolvedValue({ id: 1, name: 'Existing' });

            await categoryController.updateCategory(req, res);

            expect(res.json).toHaveBeenCalledWith({ id: 1, name: 'Existing' });
        });

        test('[WB-CAT-21] Nhánh cập nhật ID không tồn tại trong DB (updated = 0 -> 404)', async () => {
            req.params.id = '999';
            req.body = { name: 'Unknown' };

            Category.update.mockResolvedValue([0]);

            await categoryController.updateCategory(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: 'Not found' });
        });

        test('[WB-CAT-22] Khối catch lỗi khi cập nhật danh mục (400)', async () => {
            req.params.id = '1';
            req.body = { name: 'Valid' };

            Category.update.mockRejectedValue(new Error('Update database failed'));

            await categoryController.updateCategory(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: 'Update database failed' });
        });
    });

    // =========================================================================
    // 5. deleteCategory
    // =========================================================================
    describe('deleteCategory (Xóa danh mục)', () => {
        test('[WB-CAT-22] Nhánh xóa danh mục tồn tại thành công (deleted = 1 -> 204)', async () => {
            req.params.id = '1';
            Category.findByPk.mockResolvedValue({ id: 1, name: 'To delete' });
            Product.count.mockResolvedValue(0);
            Category.destroy.mockResolvedValue(1);

            await categoryController.deleteCategory(req, res);

            expect(Category.destroy).toHaveBeenCalledWith({ where: { id: 1 } });
            expect(res.status).toHaveBeenCalledWith(204);
            expect(res.send).toHaveBeenCalled();
        });

        test('[WB-CAT-23] [BVA] Xóa với ID không hợp lệ (0, -1, "abc") -> 400', async () => {
            req.params.id = '0';
            await categoryController.deleteCategory(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: 'Invalid category ID' });
        });

        test('[WB-CAT-24] Nhánh xóa danh mục không tồn tại (not found -> 404)', async () => {
            req.params.id = '999';
            Category.findByPk.mockResolvedValue(null);

            await categoryController.deleteCategory(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: 'Not found' });
        });

        test('[WB-CAT-25] Nhánh danh mục có sản phẩm liên kết (Foreign key constraint -> 400)', async () => {
            req.params.id = '1';
            Category.findByPk.mockResolvedValue({ id: 1, name: 'Has Products' });
            Product.count.mockResolvedValue(3);

            await categoryController.deleteCategory(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Không thể xóa danh mục đang có sản phẩm liên kết (Ràng buộc khóa ngoại)'
            });
        });

        test('[WB-CAT-26] Khối catch lỗi cơ sở dữ liệu khi xóa danh mục (500)', async () => {
            req.params.id = '1';
            Category.findByPk.mockResolvedValue({ id: 1 });
            Product.count.mockResolvedValue(0);
            Category.destroy.mockRejectedValue(new Error('Database error'));

            await categoryController.deleteCategory(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ message: 'Database error' });
        });
    });
});
