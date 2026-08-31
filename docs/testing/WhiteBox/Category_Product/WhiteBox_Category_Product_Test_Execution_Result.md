# KẾT QUẢ THỰC THI KIỂM THỬ HỘP TRẮNG & CODE COVERAGE (TEST EXECUTION RESULT)
## ĐỒNG BỘ VÀ BAO PHỦ TOÀN DIỆN GIÁ TRỊ BIÊN BVA (CATEGORY & PRODUCT)

**Dự án:** FutureSushi - Hệ thống Đặt món & Quản lý Nhà hàng Sushi  
**Module kiểm thử:** Category & Product Management (kèm Auth Guard Middleware)  
**Thư mục chứa Test Suite:** `backend/whitebox-tests/`  
**Môi trường kiểm thử:** Node.js v20+, Jest Test Runner v30+, Istanbul Engine  
**Thời gian thực thi:** 26/08/2026  
**Người thực hiện / Tester:** Nguyễn Anh Huy  

---

## 1. TỔNG KẾT KẾT QUẢ THỰC THI (EXECUTIVE TEST SUMMARY)

| Chỉ số tổng quan | Giá trị thực tế | Tỷ lệ đạt được | Đánh giá |
| :--- | :---: | :---: | :---: |
| **Tổng số Test Suites** | **3 / 3 Suites** | **100% PASS** | Đạt yêu cầu |
| **Tổng số Test Cases** | **74 / 74 Cases** | **100% PASS** | Hoàn hảo |
| **Số Test Case thất bại (Failed)** | **0 Cases** | **0%** | Không có lỗi |
| **Thời gian thực thi (Runtime)** | **~1.24 giây** | Nhanh / Hiệu quả | Đạt chuẩn |
| **Statements Coverage** | **212 / 212 Statements** | **100.00%** | Xuất sắc |
| **Branches Coverage** | **202 / 202 Branches** | **100.00%** | Xuất sắc |
| **Functions Coverage** | **15 / 15 Functions** | **100.00%** | Xuất sắc |
| **Lines Coverage** | **203 / 203 Lines** | **100.00%** | Xuất sắc |

---

## 2. KẾT QUẢ CHI TIẾT THEO TỪNG TEST SUITE

### 2.1 Test Suite 1: `categoryController.test.js` (26/26 PASS)

- **File kiểm thử:** [`backend/whitebox-tests/categoryController.test.js`](file:///c:/Users/ADMIN/OneDrive%20-%20ut.edu.vn/Backup/Desktop/Clone%20CNPM/ngay26/KCPM-2026/backend/whitebox-tests/categoryController.test.js)
- **Đối tượng kiểm thử:** `backend/src/controllers/categoryController.js`
- **Kết quả Coverage:** Statements: 100% (71/71) | Branches: 100% (61/61) | Functions: 100% (6/6) | Lines: 100% (69/69)

| Test Case ID | Tên Kịch Bản Kiểm Thử | Assertion / Kỳ vọng kiểm tra | Kết quả thực tế | Trạng thái |
| :--- | :--- | :--- | :--- | :---: |
| **WB-CAT-01** | `getAllCategories` không có search & có products | Trả về mảng danh mục kèm `productCount` đúng | Trả về mảng đối tượng chuẩn | **PASS** |
| **WB-CAT-02** | `getAllCategories` danh mục plain object (không có toJSON) | Fallback xử lý an toàn không lỗi | Trả về đối tượng plain object | **PASS** |
| **WB-CAT-03** | `getAllCategories` có từ khóa search hợp lệ | Gọi `findAll` với `Op.or` theo name và description | Đúng cú pháp query Sequelize | **PASS** |
| **WB-CAT-04** | `getAllCategories` từ khóa search rỗng hoặc whitespace | Bỏ qua search, query `where = {}` | `where = {}` | **PASS** |
| **WB-CAT-05** | `getAllCategories` Database exception | `res.status(500)` và trả về `{ message }` | HTTP 500 Server Error | **PASS** |
| **WB-CAT-06** | `getCategoryById` ID hợp lệ (Min ID = 1) | `res.json` trả về đối tượng Category | HTTP 200 OK | **PASS** |
| **WB-CAT-07** | `getCategoryById` ID sai biên (0, -1, 'abc', 1.5) | Chặn ID không hợp lệ: `Invalid category ID` | HTTP 400 Bad Request | **PASS** |
| **WB-CAT-08** | `getCategoryById` ID không tồn tại | `res.status(404)` kèm `{ message: "Not found" }` | HTTP 404 Not Found | **PASS** |
| **WB-CAT-09** | `getCategoryById` DB exception | `res.status(500)` | HTTP 500 Server Error | **PASS** |
| **WB-CAT-10** | `createCategory` Name Min (1 ký tự "A") | `res.status(201)` và trả về category mới | HTTP 201 Created | **PASS** |
| **WB-CAT-11** | `createCategory` Name Min+1 (2 ký tự "AB") | Tạo thành công với desc/img null | HTTP 201 Created | **PASS** |
| **WB-CAT-12** | `createCategory` Name Max (100 ký tự) | Tạo thành công category độ dài 100 | HTTP 201 Created | **PASS** |
| **WB-CAT-13** | `createCategory` Name Max+1 (101 ký tự) | Báo lỗi vượt quá 100 ký tự | HTTP 400 Bad Request | **PASS** |
| **WB-CAT-14** | `createCategory` Name rỗng `""`, whitespace, null, thiếu, số | Báo lỗi tên bắt buộc và không rỗng | HTTP 400 Bad Request | **PASS** |
| **WB-CAT-15** | `createCategory` Ngoại lệ Database Error | `res.status(400)` | HTTP 400 Bad Request | **PASS** |
| **WB-CAT-16** | `updateCategory` thành công đầy đủ trường | `res.json` trả về đối tượng sau cập nhật | HTTP 200 OK | **PASS** |
| **WB-CAT-17** | `updateCategory` chỉ cập nhật description | Giữ nguyên name, cập nhật desc | HTTP 200 OK | **PASS** |
| **WB-CAT-18** | `updateCategory` ID không hợp lệ (0, -1, 'abc') | Báo lỗi `Invalid category ID` | HTTP 400 Bad Request | **PASS** |
| **WB-CAT-19** | `updateCategory` Name rỗng, null, > 100 ký tự | Chặn cập nhật tên vi phạm biên | HTTP 400 Bad Request | **PASS** |
| **WB-CAT-20** | `updateCategory` req.body là undefined | Xử lý an toàn không crash | HTTP 200 OK | **PASS** |
| **WB-CAT-21** | `updateCategory` ID không tồn tại (`updated = 0`) | `res.status(404)` | HTTP 404 Not Found | **PASS** |
| **WB-CAT-22** | `updateCategory` Ngoại lệ khi cập nhật DB | `res.status(400)` | HTTP 400 Bad Request | **PASS** |
| **WB-CAT-23** | `deleteCategory` thành công (`deleted = 1`) | `res.status(204).send()` | HTTP 204 No Content | **PASS** |
| **WB-CAT-24** | `deleteCategory` ID không hợp lệ (0, -1) | Báo lỗi `Invalid category ID` | HTTP 400 Bad Request | **PASS** |
| **WB-CAT-25** | `deleteCategory` ID không tồn tại (`deleted = 0`) | `res.status(404)` | HTTP 404 Not Found | **PASS** |
| **WB-CAT-26** | `deleteCategory` Ngoại lệ Database (Khóa ngoại) | `res.status(500)` | HTTP 500 Server Error | **PASS** |

---

### 2.2 Test Suite 2: `productController.test.js` (31/31 PASS)

- **File kiểm thử:** [`backend/whitebox-tests/productController.test.js`](file:///c:/Users/ADMIN/OneDrive%20-%20ut.edu.vn/Backup/Desktop/Clone%20CNPM/ngay26/KCPM-2026/backend/whitebox-tests/productController.test.js)
- **Đối tượng kiểm thử:** `backend/src/controllers/productController.js`
- **Kết quả Coverage:** Statements: 100% (113/113) | Branches: 100% (123/123) | Functions: 100% (5/5) | Lines: 100% (106/106)

| Test Case ID | Tên Kịch Bản Kiểm Thử | Assertion / Kỳ vọng kiểm tra | Kết quả thực tế | Trạng thái |
| :--- | :--- | :--- | :--- | :---: |
| **WB-PRD-01** | `getAllProducts` không truyền filter | `findAll({ where: {} })`, `status(200)` | Trả về toàn bộ danh sách | **PASS** |
| **WB-PRD-02** | `getAllProducts` lọc theo `category_id` | `where = { category_id: '2' }`, `status(200)` | Lọc chính xác category_id | **PASS** |
| **WB-PRD-03** | `getAllProducts` tìm theo `search` | `where = { name: { [Op.like]: '%salmon%' } }` | Tìm đúng tên món ăn | **PASS** |
| **WB-PRD-04** | `getAllProducts` kết hợp cả `category_id` & `search` | `where` chứa cả 2 điều kiện lọc | Query kết hợp 2 trường | **PASS** |
| **WB-PRD-05** | `getAllProducts` search rỗng hoặc whitespace | Bỏ qua search rỗng, `where = {}` | `where = {}` | **PASS** |
| **WB-PRD-06** | `getAllProducts` Database exception | `res.status(500)` | HTTP 500 Server Error | **PASS** |
| **WB-PRD-07** | `getProductById` món ăn tồn tại (Min ID = 1) | `res.status(200)` kèm đối tượng món ăn | HTTP 200 OK | **PASS** |
| **WB-PRD-08** | `getProductById` ID sai biên (0, -1, 'abc', 1.5) | Chặn ID: `Invalid product ID` | HTTP 400 Bad Request | **PASS** |
| **WB-PRD-09** | `getProductById` món ăn không tồn tại | `res.status(404)` kèm `{ message: "Product not found" }` | HTTP 404 Not Found | **PASS** |
| **WB-PRD-10** | `getProductById` DB exception | `res.status(500)` | HTTP 500 Server Error | **PASS** |
| **WB-PRD-11** | `createProduct` các biên Min (Name 1, Price 0.01, Stock 0, Cat 1) | Tạo thành công món ăn tại các biên Min | HTTP 201 Created | **PASS** |
| **WB-PRD-12** | `createProduct` các biên Max (Name 150, Price Max, Stock Max) | Tạo thành công món ăn tại các biên Max | HTTP 201 Created | **PASS** |
| **WB-PRD-13** | `createProduct` Name Max+1 (151 ký tự) | Báo lỗi vượt quá 150 ký tự | HTTP 400 Bad Request | **PASS** |
| **WB-PRD-14** | `createProduct` Name rỗng `""`, whitespace, null, thiếu | Báo lỗi tên bắt buộc và không rỗng | HTTP 400 Bad Request | **PASS** |
| **WB-PRD-15** | `createProduct` Price âm, tràn số, sai kiểu chuỗi | Chặn price không hợp lệ | HTTP 400 Bad Request | **PASS** |
| **WB-PRD-16** | `createProduct` Stock âm, tràn số, số thực 10.5, chuỗi | Chặn stock không hợp lệ | HTTP 400 Bad Request | **PASS** |
| **WB-PRD-17** | `createProduct` Category ID 0, âm, null, float, chuỗi | Chặn category_id không hợp lệ | HTTP 400 Bad Request | **PASS** |
| **WB-PRD-18** | `createProduct` Ngoại lệ Database Error | `res.status(400)` | HTTP 400 Bad Request | **PASS** |
| **WB-PRD-19** | `updateProduct` cập nhật thành công đầy đủ trường | `res.status(200)` kèm product cập nhật | HTTP 200 OK | **PASS** |
| **WB-PRD-20** | `updateProduct` ID không hợp lệ (0, -1, 'abc') | Báo lỗi `Invalid product ID` | HTTP 400 Bad Request | **PASS** |
| **WB-PRD-21** | `updateProduct` Name rỗng, null, > 150 ký tự | Chặn name không hợp lệ | HTTP 400 Bad Request | **PASS** |
| **WB-PRD-22** | `updateProduct` Price rỗng, null, âm, tràn số, chuỗi | Chặn price vi phạm miền | HTTP 400 Bad Request | **PASS** |
| **WB-PRD-23** | `updateProduct` Stock null, âm, tràn số, float, chuỗi | Chặn stock không hợp lệ | HTTP 400 Bad Request | **PASS** |
| **WB-PRD-24** | `updateProduct` Category ID null, 0, âm, float, chuỗi | Chặn category_id không hợp lệ | HTTP 400 Bad Request | **PASS** |
| **WB-PRD-25** | `updateProduct` req.body là undefined | Xử lý an toàn không crash | HTTP 200 OK | **PASS** |
| **WB-PRD-26** | `updateProduct` không tìm thấy ID (`updated = 0`) | `res.status(404)` | HTTP 404 Not Found | **PASS** |
| **WB-PRD-27** | `updateProduct` Ngoại lệ DB Error khi cập nhật | `res.status(400)` | HTTP 400 Bad Request | **PASS** |
| **WB-PRD-28** | `deleteProduct` xóa thành công (`deleted = 1`) | `res.status(204).send()` | HTTP 204 No Content | **PASS** |
| **WB-PRD-29** | `deleteProduct` ID không hợp lệ (0, -1, 'abc') | Báo lỗi `Invalid product ID` | HTTP 400 Bad Request | **PASS** |
| **WB-PRD-30** | `deleteProduct` không tìm thấy ID (`deleted = 0`) | `res.status(404)` | HTTP 404 Not Found | **PASS** |
| **WB-PRD-31** | `deleteProduct` Ngoại lệ DB Error khi xóa | `res.status(500)` | HTTP 500 Server Error | **PASS** |

---

### 2.3 Test Suite 3: `authMiddleware.test.js` (17/17 PASS)

- **File kiểm thử:** [`backend/whitebox-tests/authMiddleware.test.js`](file:///c:/Users/ADMIN/OneDrive%20-%20ut.edu.vn/Backup/Desktop/Clone%20CNPM/ngay26/KCPM-2026/backend/whitebox-tests/authMiddleware.test.js)
- **Đối tượng kiểm thử:** `backend/src/middlewares/authMiddleware.js`
- **Kết quả Coverage:** Statements: 100% (28/28) | Branches: 100% (18/18) | Functions: 100% (4/4) | Lines: 100% (28/28)

| Test Case ID | Tên Kịch Bản Kiểm Thử | Assertion / Kỳ vọng kiểm tra | Kết quả thực tế | Trạng thái |
| :--- | :--- | :--- | :--- | :---: |
| **WB-AUTH-01** | `verifyToken` thiếu header | `res.status(401)` | HTTP 401 "No token" | **PASS** |
| **WB-AUTH-02** | `verifyToken` hợp lệ với `JWT_SECRET` | `req.user = decoded`, gọi `next()` | Gán user & gọi next() | **PASS** |
| **WB-AUTH-03** | `verifyToken` hợp lệ với default fallback | `req.user = decoded`, gọi `next()` | Fallback secret hoạt động | **PASS** |
| **WB-AUTH-04** | `verifyToken` token hỏng / hết hạn | `res.status(401)` | HTTP 401 "Invalid token" | **PASS** |
| **WB-AUTH-05** | `optionalVerifyToken` không gửi header | `req.user = null`, gọi `next()` | `user = null`, gọi next() | **PASS** |
| **WB-AUTH-06** | `optionalVerifyToken` token hợp lệ với `JWT_SECRET` | `req.user = decoded`, gọi `next()` | Gán decoded user | **PASS** |
| **WB-AUTH-07** | `optionalVerifyToken` token hợp lệ với fallback | `req.user = decoded`, gọi `next()` | Gán decoded user | **PASS** |
| **WB-AUTH-08** | `optionalVerifyToken` token lỗi | `req.user = null`, gọi `next()` | Không chặn, gán user=null | **PASS** |
| **WB-AUTH-09** | `isAdmin` user có role 'ADMIN' | Gọi `next()` | `next()` được gọi | **PASS** |
| **WB-AUTH-10** | `isAdmin` user có role 'admin' (thường) | Gọi `next()` | `next()` được gọi | **PASS** |
| **WB-AUTH-11** | `isAdmin` user role 'CUSTOMER' | `res.status(403)` | HTTP 403 Access denied | **PASS** |
| **WB-AUTH-12** | `isAdmin` user thiếu thuộc tính role | `res.status(403)` | HTTP 403 Forbidden | **PASS** |
| **WB-AUTH-13** | `isAdmin` user là undefined/null | `res.status(403)` | HTTP 403 Forbidden | **PASS** |
| **WB-AUTH-14** | `isStaffOrAdmin` user role 'ADMIN' | Gọi `next()` | `next()` được gọi | **PASS** |
| **WB-AUTH-15** | `isStaffOrAdmin` user role 'STAFF' | Gọi `next()` | `next()` được gọi | **PASS** |
| **WB-AUTH-16** | `isStaffOrAdmin` user role 'CUSTOMER' | `res.status(403)` | HTTP 403 Forbidden | **PASS** |
| **WB-AUTH-17** | `isStaffOrAdmin` user là undefined | `res.status(403)` | HTTP 403 Forbidden | **PASS** |

---

## 3. LOG MÁY THỰC THI (RAW TEST EXECUTION LOG)

```text
> backend-app-dat-mon@1.0.0 test
> jest whitebox-tests/categoryController.test.js whitebox-tests/productController.test.js whitebox-tests/authMiddleware.test.js --coverage

PASS whitebox-tests/authMiddleware.test.js
PASS whitebox-tests/categoryController.test.js
PASS whitebox-tests/productController.test.js

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

=============================== Coverage summary ===============================
Statements   : 100% ( 212/212 )
Branches     : 100% ( 202/202 )
Functions    : 100% ( 15/15 )
Lines        : 100% ( 203/203 )
================================================================================

Test Suites: 3 passed, 3 total
Tests:       74 passed, 74 total
Snapshots:   0 total
Time:        1.237 s
Ran all test suites matching whitebox-tests/categoryController.test.js|whitebox-tests/productController.test.js|whitebox-tests/authMiddleware.test.js.
```

---

## 4. TÀI NGUYÊN BÀN GIAO KÈM THEO

- **Thư mục mã nguồn Test:** [`backend/whitebox-tests/`](file:///c:/Users/ADMIN/OneDrive%20-%20ut.edu.vn/Backup/Desktop/Clone%20CNPM/ngay26/KCPM-2026/backend/whitebox-tests)
- **File Test Case Excel:** [`docs/testing/WhiteBox/Category_Product/WhiteBox_Category_Product_TestCases.xlsx`](file:///c:/Users/ADMIN/OneDrive%20-%20ut.edu.vn/Backup/Desktop/Clone%20CNPM/ngay26/KCPM-2026/docs/testing/WhiteBox/Category_Product/WhiteBox_Category_Product_TestCases.xlsx)
- **Báo cáo Kiểm thử Markdown:** [`docs/testing/WhiteBox/Category_Product/WhiteBox_Category_Product_Test_Report.md`](file:///c:/Users/ADMIN/OneDrive%20-%20ut.edu.vn/Backup/Desktop/Clone%20CNPM/ngay26/KCPM-2026/docs/testing/WhiteBox/Category_Product/WhiteBox_Category_Product_Test_Report.md)
- **Báo cáo Coverage tự sinh Istanbul:** [`backend/coverage/lcov-report/index.html`](file:///c:/Users/ADMIN/OneDrive%20-%20ut.edu.vn/Backup/Desktop/Clone%20CNPM/ngay26/KCPM-2026/backend/coverage/lcov-report/index.html)
