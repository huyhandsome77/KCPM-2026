# BÁO CÁO KIỂM THỬ HỘP TRẮNG (WHITE-BOX TESTING) & ĐỘ BAO PHỦ MÃ NGUỒN (CODE COVERAGE)
## ĐỒNG BỘ VÀ BAO PHỦ TOÀN DIỆN GIÁ TRỊ BIÊN (BOUNDARY VALUE ANALYSIS - BVA)

**Học phần:** Kiểm chứng và Đảm bảo Chất lượng Phần mềm (KCPM)  
**Dự án:** FutureSushi - Hệ thống Đặt món & Quản lý Nhà hàng Sushi  
**Module phụ trách:** Quản lý Danh mục & Món ăn (Category & Product Management)  
**Người thực hiện:** Nguyễn Anh Huy  
**Công cụ kiểm thử:** Jest Framework v30+, Istanbul Code Coverage Reporter, Supertest  
**Ngày thực hiện:** 26/08/2026  

---

## 1. TỔNG QUAN VÀ MỤC TIÊU KIỂM THỬ

### 1.1 Mục tiêu
- Kiểm thử cấu trúc nội bộ mã nguồn (White-Box Testing / Structural Testing) cho toàn bộ các hàm điều khiển và middleware thuộc module **Category & Product**.
- **Đồng bộ hóa trực tiếp với bộ kiểm thử Phân tích Giá trị biên (BVA):** Đảm bảo mã nguồn Controller có tầng kiểm tra ràng buộc (Input Validation) vững chắc và các ca kiểm thử hộp trắng bao phủ toàn bộ các miền giá trị biên (Min, Min+1, Max-1, Max, Max+1, Min-1, Null, Missing, Overflow, Kiểu dữ liệu không hợp lệ) theo đúng chuẩn của file [`BVA_Category_Product_Postman_Collection.json`](file:///c:/Users/ADMIN/OneDrive%20-%20ut.edu.vn/Backup/Desktop/Clone%20CNPM/ngay26/KCPM-2026/docs/testing/BVA/Category_Product/BVA_Category_Product_Postman_Collection.json).
- Đạt **100% Code Coverage** trên tất cả các tiêu chí: Statements (Câu lệnh), Branches (Nhánh rẽ), Functions (Hàm / Phương thức), và Lines (Dòng lệnh).

### 1.2 Phạm vi kiểm thử (Scope)
| Tên File / Thành phần | Đường dẫn | Chức năng chính |
| :--- | :--- | :--- |
| **`categoryController.js`** | `backend/src/controllers/categoryController.js` | Xử lý CRUD danh mục, tìm kiếm, tính productCount, validation biên độ dài tên (1 - 100 ký tự), ID hợp lệ |
| **`productController.js`** | `backend/src/controllers/productController.js` | Xử lý CRUD món ăn, tìm kiếm & lọc, validation biên tên (1 - 150 ký tự), giá bán (0 - 99,999,999.99), tồn kho (0 - 2,147,483,647), category_id |
| **`authMiddleware.js`** | `backend/src/middlewares/authMiddleware.js` | Middleware xác thực JWT & phân quyền Admin/Staff bảo vệ các API quản trị Category & Product |

---

## 2. TỔNG HỢP KẾT QUẢ CODE COVERAGE

| Chỉ số Coverage | Số lượng đạt được | Tổng số | Tỷ lệ (%) | Đánh giá |
| :--- | :---: | :---: | :---: | :---: |
| **Statements (Câu lệnh)** | **212** | **212** | **100.00%** | Xuất sắc |
| **Branches (Nhánh điều kiện)** | **202** | **202** | **100.00%** | Xuất sắc |
| **Functions (Hàm / Phương thức)** | **15** | **15** | **100.00%** | Xuất sắc |
| **Lines (Dòng lệnh)** | **203** | **203** | **100.00%** | Xuất sắc |

### 2.1 Bảng chi tiết độ bao phủ theo từng tệp (File Breakdown)

```text
------------------------|---------|----------|---------|---------|-------------------
File                    | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
------------------------|---------|----------|---------|---------|-------------------
All files               |     100 |      100 |     100 |     100 |                   
 controllers            |     100 |      100 |     100 |     100 |                   
  categoryController.js |     100 |      100 |     100 |     100 |                   
  productController.js  |     100 |      100 |     100 |     100 |                   
 middlewares            |     100 |      100 |     100 |     100 |                   
  authMiddleware.js     |     100 |      100 |     100 |     100 |                   
------------------------|---------|----------|---------|---------|-------------------
```

---

## 3. MA TRẬN ÁNH XẠ ĐỐI CHIẾU (TRACEABILITY MATRIX: BVA VS WHITE-BOX)

| Mã BVA Postman | Tiêu chí Kiểm thử Biên (BVA Target) | Giá trị Biên (Boundary Value) | Mã Test White-Box | Trạng thái |
| :--- | :--- | :--- | :--- | :---: |
| **TC_BVA_CAT_001** | Category Name: Min độ dài (1 ký tự) | `name: "A"` (Length = 1) | **WB-CAT-10** | **PASS (201)** |
| **TC_BVA_CAT_002** | Category Name: Min + 1 (2 ký tự) | `name: "AB"` (Length = 2) | **WB-CAT-11** | **PASS (201)** |
| **TC_BVA_CAT_003** | Category Name: Max - 1 (99 ký tự) | `name: "A"*99` (Length = 99) | **WB-CAT-12** | **PASS (201)** |
| **TC_BVA_CAT_004** | Category Name: Max (100 ký tự) | `name: "A"*100` (Length = 100) | **WB-CAT-12** | **PASS (201)** |
| **TC_BVA_CAT_005** | Category Name: Max + 1 (101 ký tự - Vượt biên) | `name: "A"*101` (Length = 101) | **WB-CAT-13** | **PASS (400)** |
| **TC_BVA_CAT_006** | Category Name: Chuỗi rỗng `""` (Min - 1) | `name: ""` | **WB-CAT-14** | **PASS (400)** |
| **TC_BVA_CAT_007** | Category Name: Giá trị null | `name: null` | **WB-CAT-14** | **PASS (400)** |
| **TC_BVA_CAT_008** | Category Name: Thiếu trường bắt buộc | `name` undefined | **WB-CAT-14** | **PASS (400)** |
| **TC_BVA_CAT_011** | Category ID: Min (1) | `id: 1` | **WB-CAT-06** | **PASS (200)** |
| **TC_BVA_CAT_012** | Category ID: Min - 1 (0) | `id: 0` | **WB-CAT-07** | **PASS (400)** |
| **TC_BVA_CAT_013** | Category ID: Số âm (-1) | `id: -1` | **WB-CAT-07** | **PASS (400)** |
| **TC_BVA_CAT_014** | Category ID: Sai kiểu ('abc') | `id: "abc"` | **WB-CAT-07** | **PASS (400)** |
| **TC_BVA_CAT_015** | Update Category Name: Max (100 ký tự) | `name: "A"*100` | **WB-CAT-16** | **PASS (200)** |
| **TC_BVA_CAT_016** | Update Category Name: Max + 1 (101 ký tự) | `name: "A"*101` | **WB-CAT-19** | **PASS (400)** |
| **TC_BVA_CAT_017** | Update Category Name: Chuỗi rỗng `""` | `name: ""` | **WB-CAT-19** | **PASS (400)** |
| **TC_BVA_PRD_001** | Product Name: Min (1 ký tự) | `name: "P"` | **WB-PRD-11** | **PASS (201)** |
| **TC_BVA_PRD_004** | Product Name: Max (150 ký tự) | `name: "P"*150` | **WB-PRD-12** | **PASS (201)** |
| **TC_BVA_PRD_005** | Product Name: Max + 1 (151 ký tự - Vượt biên) | `name: "P"*151` | **WB-PRD-13** | **PASS (400)** |
| **TC_BVA_PRD_006** | Product Name: Chuỗi rỗng `""` | `name: ""` | **WB-PRD-14** | **PASS (400)** |
| **TC_BVA_PRD_007** | Product Price: Min (0.01 VNĐ) | `price: 0.01` | **WB-PRD-11** | **PASS (201)** |
| **TC_BVA_PRD_009** | Product Price: Số âm (-0.01 VNĐ) | `price: -0.01` | **WB-PRD-15** | **PASS (400)** |
| **TC_BVA_PRD_010** | Product Price: Max DECIMAL (99,999,999.99) | `price: 99999999.99` | **WB-PRD-12** | **PASS (201)** |
| **TC_BVA_PRD_011** | Product Price: Tràn số (100,000,000.00) | `price: 100000000.00` | **WB-PRD-15** | **PASS (400)** |
| **TC_BVA_PRD_012** | Product Price: Sai kiểu chuỗi | `price: "mot-tram-k"` | **WB-PRD-15** | **PASS (400)** |
| **TC_BVA_PRD_013** | Product Stock: Min (0) | `stock: 0` | **WB-PRD-11** | **PASS (201)** |
| **TC_BVA_PRD_015** | Product Stock: Số âm (-1) | `stock: -1` | **WB-PRD-16** | **PASS (400)** |
| **TC_BVA_PRD_016** | Product Stock: Max INT (2,147,483,647) | `stock: 2147483647` | **WB-PRD-12** | **PASS (201)** |
| **TC_BVA_PRD_017** | Product Stock: Tràn số INT (2,147,483,648) | `stock: 2147483648` | **WB-PRD-16** | **PASS (400)** |
| **TC_BVA_PRD_018** | Product Stock: Số thực không nguyên (10.5) | `stock: 10.5` | **WB-PRD-16** | **PASS (400)** |
| **TC_BVA_PRD_021** | Product Category ID: Min - 1 (0) | `category_id: 0` | **WB-PRD-17** | **PASS (400)** |
| **TC_BVA_PRD_022** | Product Category ID: Số âm (-1) | `category_id: -1` | **WB-PRD-17** | **PASS (400)** |
| **TC_BVA_PRD_025** | Update Product Price: Số âm (-10000) | `price: -10000` | **WB-PRD-22** | **PASS (400)** |
| **TC_BVA_PRD_026** | Update Product Name: Chuỗi rỗng `""` | `name: ""` | **WB-PRD-21** | **PASS (400)** |
| **TC_BVA_PRD_028** | Update Product Name: Max + 1 (151 ký tự) | `name: "P"*151` | **WB-PRD-21** | **PASS (400)** |

---

## 4. CHI TIẾT THIẾT KẾ TEST CASES WHITE-BOX

### 4.1 `categoryController.js` (26 Test Cases)

| ID | Hàm kiểm thử | Kịch bản / Nhánh thực thi | Dữ liệu đầu vào (Input) | Kết quả mong đợi | Trạng thái |
| :--- | :--- | :--- | :--- | :--- | :---: |
| **WB-CAT-01** | `getAllCategories` | Danh mục kèm danh sách products | `req.query = {}`, có products | HTTP 200, mảng có `productCount` đúng | **PASS** |
| **WB-CAT-02** | `getAllCategories` | Plain object fallback không có toJSON | `cat.toJSON` undefined | HTTP 200, xử lý an toàn không crash | **PASS** |
| **WB-CAT-03** | `getAllCategories` | Tìm kiếm theo từ khóa hợp lệ | `req.query = { search: 'sashimi' }` | Op.or name/desc like '%sashimi%', HTTP 200 | **PASS** |
| **WB-CAT-04** | `getAllCategories` | Từ khóa search rỗng hoặc khoảng trắng | `req.query = { search: '   ' }` | Bỏ qua search, query where = {}, HTTP 200 | **PASS** |
| **WB-CAT-05** | `getAllCategories` | Ngoại lệ Database Error trong try...catch | `Category.findAll` ném lỗi DB | HTTP 500, `{ message: error.message }` | **PASS** |
| **WB-CAT-06** | `getCategoryById` | Lấy chi tiết với ID hợp lệ (Min = 1) | `req.params.id = '1'` | HTTP 200, trả về đối tượng Category | **PASS** |
| **WB-CAT-07** | `getCategoryById` | Chặn ID sai biên (0, -1, 'abc', 1.5) | `id = '0' / '-1' / 'abc' / '1.5'` | HTTP 400, `{ message: 'Invalid category ID' }` | **PASS** |
| **WB-CAT-08** | `getCategoryById` | Tìm ID không tồn tại trong DB | `req.params.id = '999'` | HTTP 404, `{ message: 'Not found' }` | **PASS** |
| **WB-CAT-09** | `getCategoryById` | Ngoại lệ Database khi tìm theo ID | `Category.findByPk` ném Error | HTTP 500, `{ message: error.message }` | **PASS** |
| **WB-CAT-10** | `createCategory` | Tạo danh mục với Name Min (1 ký tự 'A') | `name: 'A', desc: 'Min', img: 'url'` | HTTP 201 Created | **PASS** |
| **WB-CAT-11** | `createCategory` | Tạo danh mục với Name Min+1 (2 ký tự) | `name: 'AB'` | HTTP 201, desc/img null | **PASS** |
| **WB-CAT-12** | `createCategory` | Tạo danh mục với Name Max (100 ký tự) | `name: 'A'*100` | HTTP 201 Created | **PASS** |
| **WB-CAT-13** | `createCategory` | Chặn Name Max+1 (101 ký tự vượt biên) | `name: 'A'*101` | HTTP 400, 'cannot exceed 100 characters' | **PASS** |
| **WB-CAT-14** | `createCategory` | Chặn Name rỗng `""`, whitespace, null, số | `name: '' / '  ' / null / 123` | HTTP 400, 'required and cannot be empty' | **PASS** |
| **WB-CAT-15** | `createCategory` | Ngoại lệ khi tạo danh mục trong DB | `Category.create` ném Error | HTTP 400, `{ message: error.message }` | **PASS** |
| **WB-CAT-16** | `updateCategory` | Cập nhật đầy đủ các trường hợp lệ | `id: '1', name: 'Sushi Rolls'` | HTTP 200, trả về đối tượng cập nhật | **PASS** |
| **WB-CAT-17** | `updateCategory` | Cập nhật không truyền name (chỉ desc) | `id: '1', description: 'New desc'` | HTTP 200, cập nhật desc giữ nguyên name | **PASS** |
| **WB-CAT-18** | `updateCategory` | Chặn cập nhật với ID không hợp lệ (0, -1) | `id: '0'` | HTTP 400, 'Invalid category ID' | **PASS** |
| **WB-CAT-19** | `updateCategory` | Chặn cập nhật Name rỗng, null, > 100 | `name: '' / null / 'A'*101` | HTTP 400 Bad Request | **PASS** |
| **WB-CAT-20** | `updateCategory` | Cập nhật khi req.body là undefined | `req.body = undefined` | HTTP 200, không crash | **PASS** |
| **WB-CAT-21** | `updateCategory` | Cập nhật danh mục không tồn tại | `id: '999', updated = 0` | HTTP 404, 'Not found' | **PASS** |
| **WB-CAT-22** | `updateCategory` | Ngoại lệ khi cập nhật danh mục | `Category.update` ném Error | HTTP 400, `{ message: error.message }` | **PASS** |
| **WB-CAT-23** | `deleteCategory` | Xóa danh mục tồn tại thành công | `id: '1', deleted = 1` | HTTP 204 No Content | **PASS** |
| **WB-CAT-24** | `deleteCategory` | Chặn xóa với ID không hợp lệ (0, -1) | `id: '0'` | HTTP 400, 'Invalid category ID' | **PASS** |
| **WB-CAT-25** | `deleteCategory` | Xóa danh mục không tồn tại | `id: '999', deleted = 0` | HTTP 404, 'Not found' | **PASS** |
| **WB-CAT-26** | `deleteCategory` | Ngoại lệ Database Error khi xóa (Khóa ngoại) | `Category.destroy` ném Error | HTTP 500, `{ message: error.message }` | **PASS** |

---

### 4.2 `productController.js` (31 Test Cases)

| ID | Hàm kiểm thử | Kịch bản / Nhánh thực thi | Dữ liệu đầu vào (Input) | Kết quả mong đợi | Trạng thái |
| :--- | :--- | :--- | :--- | :--- | :---: |
| **WB-PRD-01** | `getAllProducts` | Lấy tất cả món ăn không filter | `req.query = {}` | Gọi findAll với where = {}, HTTP 200 | **PASS** |
| **WB-PRD-02** | `getAllProducts` | Lọc món ăn theo category_id | `req.query = { category_id: '2' }` | Gọi findAll where = { category_id: '2' }, HTTP 200 | **PASS** |
| **WB-PRD-03** | `getAllProducts` | Tìm kiếm món ăn theo từ khóa search | `req.query = { search: 'salmon' }` | Gọi findAll where = { name: like '%salmon%' }, HTTP 200 | **PASS** |
| **WB-PRD-04** | `getAllProducts` | Kết hợp cả category_id và search | `req.query = { category_id: '1', search: 'maki' }` | Kết hợp cả 2 điều kiện, HTTP 200 | **PASS** |
| **WB-PRD-05** | `getAllProducts` | Từ khóa search rỗng / whitespace | `req.query = { search: '   ' }` | Bỏ qua search, where = {}, HTTP 200 | **PASS** |
| **WB-PRD-06** | `getAllProducts` | Ngoại lệ DB Error trong getAllProducts | `Product.findAll` ném Error | HTTP 500, `{ message: error.message }` | **PASS** |
| **WB-PRD-07** | `getProductById` | Tìm món ăn tồn tại với ID hợp lệ | `req.params.id = '1'` | HTTP 200, trả về đối tượng Product | **PASS** |
| **WB-PRD-08** | `getProductById` | Chặn ID sai biên (0, -1, 'abc', 1.5) | `id = '0' / '-1' / 'abc' / '1.5'` | HTTP 400, 'Invalid product ID' | **PASS** |
| **WB-PRD-09** | `getProductById` | Tìm món ăn không tồn tại | `req.params.id = '999'` | HTTP 404, 'Product not found' | **PASS** |
| **WB-PRD-10** | `getProductById` | Ngoại lệ DB khi lấy chi tiết món ăn | `Product.findByPk` ném Error | HTTP 500, `{ message: error.message }` | **PASS** |
| **WB-PRD-11** | `createProduct` | Tạo món ăn tại các biên Min (Name 1, Price 0.01, Stock 0, Cat 1) | `name: 'P', price: 0.01, stock: 0, cat_id: 1` | HTTP 201 Created | **PASS** |
| **WB-PRD-12** | `createProduct` | Tạo món ăn tại các biên Max (Name 150, Price Max, Stock Max) | `name: 'P'*150, price: 99999999.99, stock: 2.14B` | HTTP 201 Created | **PASS** |
| **WB-PRD-13** | `createProduct` | Chặn Name Max+1 (151 ký tự) | `name: 'P'*151, price: 50000, cat_id: 1` | HTTP 400, 'cannot exceed 150 characters' | **PASS** |
| **WB-PRD-14** | `createProduct` | Chặn Name rỗng `""`, whitespace, null, thiếu | `name: '' / null / undefined` | HTTP 400, 'required and cannot be empty' | **PASS** |
| **WB-PRD-15** | `createProduct` | Chặn Price âm (-0.01), tràn số, chữ | `price: -0.01 / 100000000 / 'mot-tram-k'` | HTTP 400, 'Price must be between 0 and 99.9M' | **PASS** |
| **WB-PRD-16** | `createProduct` | Chặn Stock âm (-1), tràn INT, số thực (10.5) | `stock: -1 / 2147483648 / 10.5` | HTTP 400, 'Stock must be integer 0..2.14B' | **PASS** |
| **WB-PRD-17** | `createProduct` | Chặn Category ID sai biên (0, âm, null, float) | `cat_id: 0 / -1 / null / 'abc' / 1.5` | HTTP 400, 'Category ID must be positive integer' | **PASS** |
| **WB-PRD-18** | `createProduct` | Ngoại lệ DB Error khi tạo món ăn | `Product.create` ném Error | HTTP 400, `{ message: error.message }` | **PASS** |
| **WB-PRD-19** | `updateProduct` | Cập nhật đầy đủ các trường hợp lệ | `id: '1', body = { name, price, stock... }` | HTTP 200, trả về đối tượng cập nhật | **PASS** |
| **WB-PRD-20** | `updateProduct` | Chặn cập nhật với ID không hợp lệ | `id: '0'` | HTTP 400, 'Invalid product ID' | **PASS** |
| **WB-PRD-21** | `updateProduct` | Chặn cập nhật Name rỗng, null, > 150 | `name: '' / null / 'P'*151` | HTTP 400 Bad Request | **PASS** |
| **WB-PRD-22** | `updateProduct` | Chặn cập nhật Price âm, tràn số, chữ | `price: -10000 / 100000000 / 'abc'` | HTTP 400 Bad Request | **PASS** |
| **WB-PRD-23** | `updateProduct` | Chặn cập nhật Stock âm, float, tràn số | `stock: -5 / 12.5 / 2147483648` | HTTP 400 Bad Request | **PASS** |
| **WB-PRD-24** | `updateProduct` | Chặn cập nhật Category ID 0, float, chữ | `cat_id: 0 / 2.5 / 'abc'` | HTTP 400 Bad Request | **PASS** |
| **WB-PRD-25** | `updateProduct` | Cập nhật khi req.body là undefined | `req.body = undefined` | HTTP 200, an toàn không crash | **PASS** |
| **WB-PRD-26** | `updateProduct` | Cập nhật món ăn không tồn tại | `id: '999', updated = 0` | HTTP 404, 'Product not found' | **PASS** |
| **WB-PRD-27** | `updateProduct` | Ngoại lệ DB Error khi cập nhật | `Product.update` ném Error | HTTP 400, `{ message: error.message }` | **PASS** |
| **WB-PRD-28** | `deleteProduct` | Xóa món ăn thành công với ID hợp lệ | `id: '1', deleted = 1` | HTTP 204 No Content | **PASS** |
| **WB-PRD-29** | `deleteProduct` | Chặn xóa với ID không hợp lệ (0, -1) | `id: '0'` | HTTP 400, 'Invalid product ID' | **PASS** |
| **WB-PRD-30** | `deleteProduct` | Xóa món ăn không tồn tại | `id: '999', deleted = 0` | HTTP 404, 'Product not found' | **PASS** |
| **WB-PRD-31** | `deleteProduct` | Ngoại lệ DB Error khi xóa món ăn | `Product.destroy` ném Error | HTTP 500, `{ message: error.message }` | **PASS** |

---

### 4.3 `authMiddleware.js` (17 Test Cases)

| ID | Hàm kiểm thử | Kịch bản / Nhánh thực thi | Dữ liệu đầu vào (Input) | Kết quả mong đợi | Trạng thái |
| :--- | :--- | :--- | :--- | :--- | :---: |
| **WB-AUTH-01** | `verifyToken` | Header Authorization bị thiếu | `req.headers = {}` | HTTP 401, `{ message: "No token" }` | **PASS** |
| **WB-AUTH-02** | `verifyToken` | Token hợp lệ với biến môi trường `JWT_SECRET` | `Authorization: 'Bearer valid_jwt'`, `process.env.JWT_SECRET = 'secret'` | Gán `req.user = decoded`, gọi `next()` | **PASS** |
| **WB-AUTH-03** | `verifyToken` | Token hợp lệ với secret mặc định ('secret_key') | `Authorization: 'Bearer valid_jwt'`, `JWT_SECRET` unset | Sử dụng fallback secret, gọi `next()` | **PASS** |
| **WB-AUTH-04** | `verifyToken` | Token không hợp lệ / hết hạn | `Authorization: 'Bearer invalid'`, `jwt.verify` ném Error | HTTP 401, `{ message: "Invalid token" }` | **PASS** |
| **WB-AUTH-05** | `optionalVerifyToken` | Không có header Authorization | `req.headers = {}` | Gán `req.user = null`, gọi `next()` | **PASS** |
| **WB-AUTH-06** | `optionalVerifyToken` | Token hợp lệ kèm biến `JWT_SECRET` | `Authorization: 'Bearer valid'`, `JWT_SECRET` defined | Gán `req.user = decoded`, gọi `next()` | **PASS** |
| **WB-AUTH-07** | `optionalVerifyToken` | Token hợp lệ với fallback secret | `Authorization: 'Bearer valid'`, `JWT_SECRET` unset | Gán `req.user = decoded`, gọi `next()` | **PASS** |
| **WB-AUTH-08** | `optionalVerifyToken` | Token lỗi trong optional auth | `Authorization: 'Bearer corrupted'`, `jwt.verify` ném Error | Không chặn mà gán `req.user = null`, gọi `next()` | **PASS** |
| **WB-AUTH-09** | `isAdmin` | Người dùng có role `ADMIN` (chữ hoa) | `req.user = { role: 'ADMIN' }` | Cho phép đi tiếp, gọi `next()` | **PASS** |
| **WB-AUTH-10** | `isAdmin` | Người dùng có role `admin` (chữ thường) | `req.user = { role: 'admin' }` | Cho phép đi tiếp, gọi `next()` | **PASS** |
| **WB-AUTH-11** | `isAdmin` | Người dùng có role `CUSTOMER` | `req.user = { role: 'CUSTOMER' }` | HTTP 403, `{ message: "Access denied. Admin only." }` | **PASS** |
| **WB-AUTH-12** | `isAdmin` | Người dùng không có trường `role` | `req.user = { id: 3 }` | HTTP 403, `{ message: "Access denied. Admin only." }` | **PASS** |
| **WB-AUTH-13** | `isAdmin` | Đối tượng `req.user` là null/undefined | `req.user = undefined` | HTTP 403, `{ message: "Access denied. Admin only." }` | **PASS** |
| **WB-AUTH-14** | `isStaffOrAdmin` | Người dùng có role `ADMIN` | `req.user = { role: 'ADMIN' }` | Cho phép đi tiếp, gọi `next()` | **PASS** |
| **WB-AUTH-15** | `isStaffOrAdmin` | Người dùng có role `STAFF` | `req.user = { role: 'staff' }` | Cho phép đi tiếp, gọi `next()` | **PASS** |
| **WB-AUTH-16** | `isStaffOrAdmin` | Người dùng là `CUSTOMER` | `req.user = { role: 'CUSTOMER' }` | HTTP 403, `{ message: "Access denied. Staff or Admin only." }` | **PASS** |
| **WB-AUTH-17** | `isStaffOrAdmin` | Đối tượng `req.user` bị undefined | `req.user = undefined` | HTTP 403, `{ message: "Access denied. Staff or Admin only." }` | **PASS** |

---

## 5. HƯỚNG DẪN TÁI HIỆN VÀ CHẠY TEST TỰ ĐỘNG

Chuyển vào thư mục backend và chạy lệnh:

```bash
cd backend

# Chạy toàn bộ test suites White-box Category, Product & Auth Middleware
npm test -- whitebox-tests/categoryController.test.js whitebox-tests/productController.test.js whitebox-tests/authMiddleware.test.js

# Chạy test suite và xuất báo cáo Code Coverage chi tiết
npm test -- whitebox-tests/categoryController.test.js whitebox-tests/productController.test.js whitebox-tests/authMiddleware.test.js --coverage
```

Báo cáo coverage chi tiết dưới dạng web HTML sẽ được tự động tạo tại: `backend/coverage/lcov-report/index.html`.

---

## 6. KẾT LUẬN VÀ TÀI NGUYÊN BÀN GIAO

1. **Đồng bộ hoàn hảo giữa White-Box và BVA:** Toàn bộ logic nghiệp vụ, các miền giá trị biên và luồng xử lý lỗi trong module Category & Product đã được kiểm thử chặt chẽ với **100% độ bao phủ (Coverage)** trên mọi tiêu chí (Statements: 212/212, Branches: 202/202, Functions: 15/15, Lines: 203/203).
2. **Đóng gói tài liệu và báo cáo:**
   - File Test Cases Excel: [`docs/testing/WhiteBox/Category_Product/WhiteBox_Category_Product_TestCases.xlsx`](file:///c:/Users/ADMIN/OneDrive%20-%20ut.edu.vn/Backup/Desktop/Clone%20CNPM/ngay26/KCPM-2026/docs/testing/WhiteBox/Category_Product/WhiteBox_Category_Product_TestCases.xlsx) (Bao gồm Dashboard, Category Cases, Product Cases, Traceability Matrix).
   - Báo cáo kết quả thực thi Markdown: [`docs/testing/WhiteBox/Category_Product/WhiteBox_Category_Product_Test_Execution_Result.md`](file:///c:/Users/ADMIN/OneDrive%20-%20ut.edu.vn/Backup/Desktop/Clone%20CNPM/ngay26/KCPM-2026/docs/testing/WhiteBox/Category_Product/WhiteBox_Category_Product_Test_Execution_Result.md).
