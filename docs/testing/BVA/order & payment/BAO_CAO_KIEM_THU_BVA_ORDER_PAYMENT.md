# BÁO CÁO KẾT QUẢ KIỂM THỬ GIÁ TRỊ BIÊN (BVA)
## MODULE: ORDER & PAYMENT (ĐẶT MÓN & THANH TOÁN)
**Kỹ thuật áp dụng:** Standard Boundary Value Analysis (Công thức 4n + 1)  

---

## 1. THÔNG TIN CHUNG
* **Tên dự án:** Hệ thống Quản lý Đặt món Nhà hàng (Backend AppDatMon)
* **Module phụ trách:** Quản lý Đơn hàng & Thanh toán (Order)
* **Phương pháp kiểm thử:** Kiểm thử hộp đen - Phân tích giá trị biên chuẩn (Standard BVA)
* **Quy tắc sinh test case:** Áp dụng giả định lỗi đơn (Single-Fault Assumption) theo công thức 4n + 1 = 13 Test Cases.
* **Công cụ thực thi kiểm thử:** Postman Collection v11+, Node.js v20+
* **Thời gian thực hiện:** Tháng 08/2026
* **Trạng thái:** Hoàn thành (**100% PASS**)

---

## 2. THIẾT LẬP DỮ LIỆU KIỂM THỬ (PRE-CONDITION SETUP)

Để đảm bảo tính độc lập và thỏa mãn điều kiện tiền đề (Pre-condition) của từng ca kiểm thử theo đúng tài liệu đặc tả SRS Mục 2.6.1 trên môi trường Cơ sở dữ liệu dùng chung (AWS Cloud Database):

### 2.1. Lệnh thực thi nạp dữ liệu môi trường (Terminal / PowerShell):
Mở terminal và thực thi câu lệnh sau để tự động kết nối và cập nhật điểm trong Database trước khi chạy Postman:

```powershell
cd D:\KCPM-2026\backend; node -e "const { Product, User, RestaurantTable } = require('./src/models'); (async () => { await Product.update({ stock: 10000, isAvailable: true }, { where: {} }); await User.update({ points: 10000000 }, { where: { username: 'admin' } }); await RestaurantTable.update({ status: 'AVAILABLE' }, { where: {} }); console.log('✅ ĐÃ NẠP XONG DB AWS: stock = 10,000 | points = 10,000,000 | tables = AVAILABLE'); process.exit(0); })();"
```

*(Hoặc sử dụng câu lệnh SQL tương đương nếu thao tác trực tiếp qua công cụ quản lý DB như DBeaver/pgAdmin):*
```sql
UPDATE Users SET points = 10000000 WHERE username = 'admin';
UPDATE Products SET stock = 10000, isAvailable = 1;
UPDATE RestaurantTables SET status = 'AVAILABLE';
```

### 2.2. Ý nghĩa các tham số thiết lập theo SRS Mục 2.6.1:
* **Số dư điểm tài khoản (`admin`):** `10.000.000 điểm` (Mức trần tối đa theo SRS Mục 2.6.1.8 & 2.6.1.11).
* **Tồn kho sản phẩm:** `10.000 đơn vị` (Mức trần tối đa theo SRS Mục 2.6.1.1).
* **Trạng thái bàn ăn:** `AVAILABLE` (Bàn trống sẵn sàng phục vụ).

### 2.3. Cơ chế khôi phục tiền đề tự động trong Postman (Pre-condition Self-healing):
* Trong chuỗi chạy tự động liên tiếp (Collection Runner), ca kiểm thử `TC_BVA_P_03` sử dụng và trừ `7.499.999 điểm` vào cơ sở dữ liệu thực tế trên AWS.
* Để đảm bảo ca kiểm thử tiếp theo `TC_BVA_P_04` (kiểm tra biên điểm tối đa `7.500.000 điểm`) đạt đúng điều kiện tiền đề ban đầu mà **không vượt quá giới hạn 10.000.000 điểm của SRS**, Postman được tích hợp **Pre-request Script** tự động gọi API khôi phục số dư tài khoản về đúng **10.000.000 điểm** trước khi `TC_BVA_P_04` gửi yêu cầu.

---

## 3. XÁC ĐỊNH BIẾN ĐẦU VÀO (n = 3) & ĐIỂM BIÊN THEO ĐẶC TẢ SRS

Hàm kiểm thử trọng tâm: createOrder (POST /api/orders) gồm n = 3 biến đầu vào chính:

* **Biến X_1 - Số lượng mỗi món (quantity):** Theo SRS Mục 2.6.1 (5. Đặt món qua QR), số lượng mỗi món là số nguyên từ 1 đến 99 phần/món -> Miền giá trị [1, 99].
* **Biến X_2 - Điểm tích lũy sử dụng (used_points):** Theo SRS Mục 2.6.1 (8. Tích điểm thành viên), số dư điểm thuộc miền [0, 10.000.000] điểm. Mức điểm tối đa giảm trừ cho đơn hàng danh định 50 suất x 150.000đ = 7.500.000đ.
* **Biến X_3 - Đơn giá món ăn (price):** Theo SRS Mục 2.6.1 (1. Quản lý món ăn), đơn giá món là số thập phân có giá trị từ 1.000 VNĐ đến 100.000.000 VNĐ -> Miền giá trị [1.000, 100.000.000] VNĐ.

| Tên biến | Ký hiệu | Miền giá trị SRS [Min, Max] | Min | Min+ | Nom (Danh định) | Max- | Max |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Số lượng món (quantity)** | X_1 | [1, 99] | **1** | **2** | **50** | **98** | **99** |
| **Điểm tích lũy (used_points)** | X_2 | [0, 10.000.000] | **0** | **1** | **500** | **7.499.999** | **7.500.000** |
| **Đơn giá món (price)** | X_3 | [1.000, 100.000.000]đ | **1.000** | **2.000** | **150.000** | **99.999.000** | **100.000.000** |

Tổng số Test Case BVA chuẩn: **4n + 1 = 4(3) + 1 = 13 Test Cases**

---

## 4. BẢNG MA TRẬN TEST CASE BVA 4n + 1 = 13 TEST CASES (CHUẨN SRS)

| Test Case ID* | Module | Mô tả tóm tắt | Trường test / Điểm biên BVA | Method | Endpoint | Inputs (Test Data / Request)* | Expected Result* | Actual Result* | Pass/Fail* |
| :--- | :--- | :--- | :--- | :---: | :--- | :--- | :--- | :--- | :---: |
| **TC_BVA_BASE** | Order | Tất cả biến ở giá trị danh định | Nominal: (50, 500, 150000) | POST | /api/orders | used_points: 500, quantity: 50, price: 150.000 | HTTP 201; 	otal=7.500.000đ, discount=500đ, final=7.499.500đ | HTTP 201 Created (15ms) | **PASS** |
| **TC_BVA_Q_01** | Order | Số lượng món biên tối thiểu | quantity: Min = 1 | POST | /api/orders | used_points: 500, quantity: 1, price: 150.000 | HTTP 201; 	otal=150.000đ, discount=500đ, final=149.500đ | HTTP 201 Created (12ms) | **PASS** |
| **TC_BVA_Q_02** | Order | Số lượng món lân cận tối thiểu | quantity: Min+ = 2 | POST | /api/orders | used_points: 500, quantity: 2, price: 150.000 | HTTP 201; 	otal=300.000đ, discount=500đ, final=299.500đ | HTTP 201 Created (11ms) | **PASS** |
| **TC_BVA_Q_03** | Order | Số lượng món lân cận tối đa | quantity: Max- = 98 | POST | /api/orders | used_points: 500, quantity: 98, price: 150.000 | HTTP 201; 	otal=14.700.000đ, discount=500đ, final=14.699.500đ | HTTP 201 Created (13ms) | **PASS** |
| **TC_BVA_Q_04** | Order | Số lượng món biên tối đa | quantity: Max = 99 | POST | /api/orders | used_points: 500, quantity: 99, price: 150.000 | HTTP 201; 	otal=14.850.000đ, discount=500đ, final=14.849.500đ | HTTP 201 Created (14ms) | **PASS** |
| **TC_BVA_P_01** | Order | Điểm tích lũy biên tối thiểu | used_points: Min = 0 | POST | /api/orders | used_points: 0, quantity: 50, price: 150.000 | HTTP 201; 	otal=7.500.000đ, discount=0đ, final=7.500.000đ | HTTP 201 Created (14ms) | **PASS** |
| **TC_BVA_P_02** | Order | Điểm tích lũy lân cận tối thiểu | used_points: Min+ = 1 | POST | /api/orders | used_points: 1, quantity: 50, price: 150.000 | HTTP 201; 	otal=7.500.000đ, discount=1đ, final=7.499.999đ | HTTP 201 Created (13ms) | **PASS** |
| **TC_BVA_P_03** | Order | Điểm tích lũy lân cận tối đa | used_points: Max- = 7.499.999 | POST | /api/orders | used_points: 7.499.999, quantity: 50, price: 150.000 | HTTP 201; 	otal=7.500.000đ, discount=7.499.999đ, final=1đ | HTTP 201 Created (14ms) | **PASS** |
| **TC_BVA_P_04** | Order | Điểm tích lũy biên tối đa | used_points: Max = 7.500.000 | POST | /api/orders | used_points: 7.500.000, quantity: 50, price: 150.000 | HTTP 201; 	otal=7.500.000đ, discount=7.500.000đ, final=0đ | HTTP 201 Created (14ms) | **PASS** |
| **TC_BVA_S_01** | Order | Đơn giá món biên tối thiểu | price: Min = 1.000đ | POST | /api/orders | used_points: 500, quantity: 50, price: 1.000 | HTTP 201; 	otal=50.000đ, discount=500đ, final=49.500đ | HTTP 201 Created (12ms) | **PASS** |
| **TC_BVA_S_02** | Order | Đơn giá món lân cận tối thiểu | price: Min+ = 2.000đ | POST | /api/orders | used_points: 500, quantity: 50, price: 2.000 | HTTP 201; 	otal=100.000đ, discount=500đ, final=99.500đ | HTTP 201 Created (11ms) | **PASS** |
| **TC_BVA_S_03** | Order | Đơn giá món lân cận tối đa | price: Max- = 99.999.000đ | POST | /api/orders | used_points: 500, quantity: 50, price: 99.999.000 | HTTP 201; 	otal=4.999.950.000đ, discount=500đ, final=4.999.949.500đ | HTTP 201 Created (13ms) | **PASS** |
| **TC_BVA_S_04** | Order | Đơn giá món biên tối đa | price: Max = 100.000.000đ | POST | /api/orders | used_points: 500, quantity: 50, price: 100.000.000 | HTTP 201; 	otal=5.000.000.000đ, discount=500đ, final=4.999.999.500đ | HTTP 201 Created (12ms) | **PASS** |

---

## 5. TỔNG KẾT KẾT QUẢ
* **Số lượng Test Case thiết kế (4n + 1):** 13
* **Số lượng Test Case Passed:** 13 / 13 (100%)
* **Đánh giá:** Module xử lý hoàn toàn chuẩn xác các giá trị tại tất cả các điểm biên Min, Min+, Max-, Max của từng biến đầu vào theo đúng tài liệu đặc tả SRS Mục 2.6.
