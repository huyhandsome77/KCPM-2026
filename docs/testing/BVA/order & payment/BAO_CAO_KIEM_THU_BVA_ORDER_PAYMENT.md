# BÁO CÁO KẾT QUẢ KIỂM THỬ GIÁ TRỊ BIÊN (BVA)
## MODULE: ORDER (ĐẶT MÓN)
**Kỹ thuật áp dụng:** Standard Boundary Value Analysis (Công thức 4n + 1)

---

## 1. THÔNG TIN CHUNG
* **Tên dự án:** Hệ thống Quản lý Đặt món Nhà hàng (Backend AppDatMon)
* **Module phụ trách:** Quản lý Đơn hàng & Thanh toán (`Order`)
* **Phương pháp kiểm thử:** Kiểm thử hộp đen - Phân tích giá trị biên chuẩn (Standard BVA)
* **Quy tắc sinh test case:** Áp dụng giả định lỗi đơn (Single-Fault Assumption) theo công thức 4n + 1.
* **Công cụ thực thi kiểm thử:** Jest Framework v30, Node.js v20+
* **Trạng thái:** Hoàn thành (**100% PASS**)

---

## 2. XÁC ĐỊNH BIẾN ĐẦU VÀO ($n = 3$) & ĐIỂM BIÊN

Hàm kiểm thử trọng tâm: `createOrder` (`POST /api/orders`) gồm n = 3 biến định lượng:

| Tên biến | Ký hiệu | Miền giá trị [Min, Max] | Min | Min+ | Nom  | Max- | Max |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Số lượng món (`quantity`)** | X_1 | [1, 10] | 1 | 2 | 5 | 9 | 10 |
| **Điểm tích lũy (`used_points`)** | X_2 | [0, 100] | 0 | 1 | 50 | 99 | 100 |
| **Đơn giá món (`price`)** | X_3 | [10, 1000]đ| 10 | 20 | 100 | 900 | 1000 |

Tổng số Test Case BVA chuẩn = 4n + 1 = 4(3) + 1 = 13 Test Case

---

## 3. BẢNG MA TRẬN TEST CASE BVA 4n + 1 = 13 TEST CASES

| Test Case ID| Module | Mô tả tóm tắt | Trường test / Điểm biên BVA | Method | Endpoint | Inputs (Test Data / Request)| Expected Result | Actual Result | Pass/Fail |
| :--- | :--- | :--- | :--- | :---: | :--- | :--- | :--- | :--- | :---: |
| **TC_BVA_BASE** | Order | Tất cả biến ở giá trị danh định | `Nominal: (5, 50, 100)` | POST | `/api/orders` | `used_points: 50, quantity: 5, price: 100` | HTTP 201; `totalPrice=500, discount=50, finalPrice=450` | HTTP 201 Created (15ms) | **PASS** |
| **TC_BVA_Q_01** | Order | Số lượng món biên tối thiểu | `quantity: Min = 1` | POST | `/api/orders` | `used_points: 50, quantity: 1, price: 100` | HTTP 201; `totalPrice=100, discount=50, finalPrice=50` | HTTP 201 Created (12ms) | **PASS** |
| **TC_BVA_Q_02** | Order | Số lượng món lân cận tối thiểu | `quantity: Min+ = 2` | POST | `/api/orders` | `used_points: 50, quantity: 2, price: 100` | HTTP 201; `totalPrice=200, discount=50, finalPrice=150` | HTTP 201 Created (11ms) | **PASS** |
| **TC_BVA_Q_03** | Order | Số lượng món lân cận tối đa | `quantity: Max- = 9` | POST | `/api/orders` | `used_points: 50, quantity: 9, price: 100` | HTTP 201; `totalPrice=900, discount=50, finalPrice=850` | HTTP 201 Created (13ms) | **PASS** |
| **TC_BVA_Q_04** | Order | Số lượng món biên tối đa | `quantity: Max = 10` | POST | `/api/orders` | `used_points: 50, quantity: 10, price: 100` | HTTP 201; `totalPrice=1000, discount=50, finalPrice=950` | HTTP 201 Created (14ms) | **PASS** |
| **TC_BVA_P_01** | Order | Điểm tích lũy biên tối thiểu | `used_points: Min = 0` | POST | `/api/orders` | `used_points: 0, quantity: 5, price: 100` | HTTP 201; `totalPrice=500, discount=0, finalPrice=500` | HTTP 201 Created (14ms) | **PASS** |
| **TC_BVA_P_02** | Order | Điểm tích lũy lân cận tối thiểu | `used_points: Min+ = 1` | POST | `/api/orders` | `used_points: 1, quantity: 5, price: 100` | HTTP 201; `totalPrice=500, discount=1, finalPrice=499` | HTTP 201 Created (13ms) | **PASS** |
| **TC_BVA_P_03** | Order | Điểm tích lũy lân cận tối đa | `used_points: Max- = 99` | POST | `/api/orders` | `used_points: 99, quantity: 5, price: 100` | HTTP 201; `totalPrice=500, discount=99, finalPrice=401` | HTTP 201 Created (14ms) | **PASS** |
| **TC_BVA_P_04** | Order | Điểm tích lũy biên tối đa | `used_points: Max = 100` | POST | `/api/orders` | `used_points: 100, quantity: 5, price: 100` | HTTP 201; `totalPrice=500, discount=100, finalPrice=400` | HTTP 201 Created (14ms) | **PASS** |
| **TC_BVA_S_01** | Order | Đơn giá món biên tối thiểu | `price: Min = 10` | POST | `/api/orders` | `used_points: 50, quantity: 5, price: 10` | HTTP 201; `totalPrice=50, discount=50, finalPrice=0` | HTTP 201 Created (12ms) | **PASS** |
| **TC_BVA_S_02** | Order | Đơn giá món lân cận tối thiểu | `price: Min+ = 20` | POST | `/api/orders` | `used_points: 50, quantity: 5, price: 20` | HTTP 201; `totalPrice=100, discount=50, finalPrice=50` | HTTP 201 Created (11ms) | **PASS** |
| **TC_BVA_S_03** | Order | Đơn giá món lân cận tối đa | `price: Max- = 900` | POST | `/api/orders` | `used_points: 50, quantity: 5, price: 900` | HTTP 201; `totalPrice=4500, discount=50, finalPrice=4450` | HTTP 201 Created (13ms) | **PASS** |
| **TC_BVA_S_04** | Order | Đơn giá món biên tối đa | `price: Max = 1000` | POST | `/api/orders` | `used_points: 50, quantity: 5, price: 1000` | HTTP 201; `totalPrice=5000, discount=50, finalPrice=4950` | HTTP 201 Created (12ms) | **PASS** |

---


## 4. THIẾT LẬP DỮ LIỆU KIỂM THỬ (PRE-CONDITION SETUP)
Để thực hiện kiểm thử các trường hợp sử dụng điểm tích lũy (`used_points`) trên môi trường cơ sở dữ liệu thật (Integration Test qua Postman), tài khoản kiểm thử cần được nạp sẵn điểm trong Database:
```sql
-- Thiết lập điểm thưởng cho tài khoản kiểm thử (Pre-condition):
ALTER TABLE orders ADD COLUMN paymentMethod ENUM('CASH', 'TRANSFER') NULL; (Bảng orders tạo từ trước (lúc chưa có tính năng chọn phương thức thanh toán).
Thư viện Sequelize trong Node.js khi khởi động mặc định chỉ tạo bảng mới nếu chưa có, nên cần thêm cột `paymentMethod`cho máy đã tạo database trước đó để tránh lỗi khi chạy các test case liên quan đến thanh toán.
))
UPDATE Users SET points = 1000 WHERE username = 'admin';

## 5. KẾT QUẢ KIỂM THỬ BVA
* Số lượng Test Case thiết kế theo công thức 4n+1: 13
* Số lượng Test Case Passed: 13 / 13 (100%)
* Đánh giá: Module xử lý hoàn toàn chuẩn xác các giá trị tại tất cả các điểm biên Min, Min+, Max-, Max của từng biến đầu vào theo đúng lý thuyết BVA.
