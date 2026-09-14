# BÁO CÁO KẾT QUẢ KIỂM THỬ GIÁ TRỊ BIÊN (BVA)
## MODULE: ORDER & PAYMENT (ĐẶT MÓN & THANH TOÁN)
**Kỹ thuật áp dụng:** Standard Boundary Value Analysis (Công thức $4n + 1$)  
**Dự án:** Hệ thống Quản lý Đặt món Nhà hàng FutureSushi (Backend AppDatMon)

---

## 1. THÔNG TIN CHUNG
* **Tên dự án:** Hệ thống Quản lý Đặt món Nhà hàng (FutureSushi)
* **Module phụ trách:** Đặt món & Thanh toán (`/api/orders`, `/api/payos`)
* **Phương pháp kiểm thử:** Kiểm thử hộp đen - Phân tích giá trị biên chuẩn (Standard BVA)
* **Quy tắc sinh test case:** Áp dụng giả định lỗi đơn (Single-Fault Assumption) theo công thức $4n + 1 = 13$ BVA Test Cases + 1 Auth Setup = **14 Test Cases**.
* **Công cụ thực thi kiểm thử:** Postman Collection v11+, Newman CLI, Node.js v20+
* **Thời gian thực hiện:** Tháng 09/2026
* **Kết quả thực thi tổng quan:**
  * **Tổng số ca kiểm thử:** 14 Test Cases
  * **Passed:** 12 / 14 Test Cases (85.71%)
  * **Failed (Phát hiện Defect):** 2 / 14 Test Cases (14.29% - `TC_BVA_S_03`, `TC_BVA_S_04` do lỗi tràn số Database)

---

## 2. XÁC ĐỊNH BIẾN ĐẦU VÀO ($n = 3$) & ĐIỂM BIÊN THEO ĐẶC TẢ SRS

Hàm kiểm thử trọng tâm: `createOrder` (`POST /api/orders`) gồm $n = 3$ biến đầu vào chính:

1. **Biến $X_1$ - Số lượng mỗi món (`quantity`):** Theo SRS Mục 2.6.1 (5. Đặt món qua QR), số lượng mỗi món là số nguyên từ 1 đến 99 phần/món $\rightarrow$ Miền giá trị $[1, 99]$.
2. **Biến $X_2$ - Điểm tích lũy sử dụng (`used_points`):** Theo SRS Mục 2.6.1 (8. Tích điểm thành viên), số dư điểm thuộc miền $[0, 10.000.000]$ điểm. Mức điểm tối đa giảm trừ cho đơn hàng danh định 50 suất $\times$ 150.000đ = 7.500.000đ.
3. **Biến $X_3$ - Đơn giá món ăn (`price`):** Theo SRS Mục 2.6.1 (1. Quản lý món ăn), đơn giá món là số thập phân có giá trị từ 1.000 VNĐ đến 100.000.000 VNĐ $\rightarrow$ Miền giá trị $[1.000, 100.000.000]$ VNĐ.

### Bảng xác định 5 điểm giá trị biên (Standard BVA):

| Tên biến | Ký hiệu | Miền giá trị SRS $[Min, Max]$ | Min | Min+ | Nom (Danh định) | Max- | Max |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Số lượng món (`quantity`)** | $X_1$ | $[1, 99]$ | **1** | **2** | **50** | **98** | **99** |
| **Điểm tích lũy (`used_points`)** | $X_2$ | $[0, 10.000.000]$ | **0** | **1** | **500** | **7.499.999** | **7.500.000** |
| **Đơn giá món (`price`)** | $X_3$ | $[1.000, 100.000.000]$đ | **1.000** | **2.000** | **150.000** | **99.999.000** | **100.000.000** |

---

## 3. THIẾT LẬP DỮ LIỆU KIỂM THỬ (PRE-CONDITION SETUP)

Để đảm bảo tính độc lập và thỏa mãn điều kiện tiền đề (Pre-condition) của từng ca kiểm thử theo đúng tài liệu đặc tả SRS:

1. **Pre-request Scripts tự động trong Postman:**
   * **Nạp điểm tài khoản:** Tự động gọi `PUT /api/users/1` khôi phục số dư tài khoản về `10.000.000 điểm` trước các ca trừ điểm lớn (`TC_BVA_P_03`, `TC_BVA_P_04`).
   * **Cập nhật đơn giá món ăn:** Tự động gọi `PUT /api/products/1` thiết lập đơn giá đúng theo từng điểm biên ($1.000$, $2.000$, $99.999.000$, $100.000.000$ VNĐ) trước khi gửi yêu cầu tạo đơn hàng.
   

---

## 4. MA TRẬN KẾT QUẢ THỰC THI KIỂM THỬ (14 TEST CASES)

| Test Case ID* | Module | Mô tả tóm tắt | Điểm biên BVA | Method | Endpoint | Inputs (Test Data / Request)* | Expected Result* | Actual Result (Kết quả thực tế)* | Trạng thái |
| :--- | :--- | :--- | :--- | :---: | :--- | :--- | :--- | :--- | :---: |
| **TC_AUTH_001** | Authentication | Đăng nhập Admin lấy JWT Token | Hợp lệ (admin/123) | POST | `/api/auth/login` | `{"account": "admin", "password": "123"}` | HTTP 200 OK; Cấp JWT token và role 'ADMIN' | HTTP 200 OK. Cấp token thành công và lưu vào biến `admin_token` | **PASS** |
| **TC_BVA_BASE** | Order & Payment | Tất cả biến ở giá trị danh định Nominal | Nominal: (50, 500, 150.000đ) | POST | `/api/orders` | `{"table_id": 1, "used_points": 500, "items": [{"product_id": 1, "quantity": 50}]}` | HTTP 201 Created; total=7.500.000đ, discount=500đ, final=7.499.500đ | HTTP 201 Created; totalPrice="7500000.00", discountAmount="500.00", finalPrice="7499500.00" | **PASS** |
| **TC_BVA_Q_01** | Order & Payment | Số lượng món biên tối thiểu Min | $B_1$ (quantity: Min = 1) | POST | `/api/orders` | `used_points: 500, quantity: 1, price: 150.000` | HTTP 201 Created; total=150.000đ, discount=500đ, final=149.500đ | HTTP 201 Created; totalPrice="150000.00", discountAmount="500.00", finalPrice="149500.00" | **PASS** |
| **TC_BVA_Q_02** | Order & Payment | Số lượng món lân cận tối thiểu Min+ | $B_2$ (quantity: Min+ = 2) | POST | `/api/orders` | `used_points: 500, quantity: 2, price: 150.000` | HTTP 201 Created; total=300.000đ, discount=500đ, final=299.500đ | HTTP 201 Created; totalPrice="300000.00", discountAmount="500.00", finalPrice="299500.00" | **PASS** |
| **TC_BVA_Q_03** | Order & Payment | Số lượng món lân cận tối đa Max- | $B_4$ (quantity: Max- = 98) | POST | `/api/orders` | `used_points: 500, quantity: 98, price: 150.000` | HTTP 201 Created; total=14.700.000đ, discount=500đ, final=14.699.500đ | HTTP 201 Created; totalPrice="14700000.00", discountAmount="500.00", finalPrice="14699500.00" | **PASS** |
| **TC_BVA_Q_04** | Order & Payment | Số lượng món biên tối đa Max | $B_5$ (quantity: Max = 99) | POST | `/api/orders` | `used_points: 500, quantity: 99, price: 150.000` | HTTP 201 Created; total=14.850.000đ, discount=500đ, final=14.849.500đ | HTTP 201 Created; totalPrice="14850000.00", discountAmount="500.00", finalPrice="14849500.00" | **PASS** |
| **TC_BVA_P_01** | Order & Payment | Điểm tích lũy biên tối thiểu Min | $B_6$ (used_points: Min = 0) | POST | `/api/orders` | `used_points: 0, quantity: 50, price: 150.000` | HTTP 201 Created; total=7.500.000đ, discount=0đ, final=7.500.000đ | HTTP 201 Created; totalPrice="7500000.00", discountAmount="0.00", finalPrice="7500000.00" | **PASS** |
| **TC_BVA_P_02** | Order & Payment | Điểm tích lũy lân cận tối thiểu Min+ | $B_7$ (used_points: Min+ = 1) | POST | `/api/orders` | `used_points: 1, quantity: 50, price: 150.000` | HTTP 201 Created; total=7.500.000đ, discount=1đ, final=7.499.999đ | HTTP 201 Created; totalPrice="7500000.00", discountAmount="1.00", finalPrice="7499999.00" | **PASS** |
| **TC_BVA_P_03** | Order & Payment | Điểm tích lũy lân cận tối đa Max- | $B_9$ (used_points: Max- = 7.499.999) | POST | `/api/orders` | `used_points: 7.499.999, quantity: 50, price: 150.000` | HTTP 201 Created; total=7.500.000đ, discount=7.499.999đ, final=1đ | HTTP 201 Created; totalPrice="7500000.00", discountAmount="7499999.00", finalPrice="1.00" | **PASS** |
| **TC_BVA_P_04** | Order & Payment | Điểm tích lũy biên tối đa Max (100%) | $B_{10}$ (used_points: Max = 7.500.000) | POST | `/api/orders` | `used_points: 7.500.000, quantity: 50, price: 150.000` | HTTP 201 Created; total=7.500.000đ, discount=7.500.000đ, final=0đ | HTTP 201 Created; totalPrice="7500000.00", discountAmount="7500000.00", finalPrice="0.00" | **PASS** |
| **TC_BVA_S_01** | Order & Payment | Đơn giá món biên tối thiểu Min | $B_{11}$ (price: Min = 1.000đ) | POST | `/api/orders` | `used_points: 500, quantity: 50, price: 1.000` | HTTP 201 Created; total=50.000đ, discount=500đ, final=49.500đ | HTTP 201 Created; totalPrice="50000.00", discountAmount="500.00", finalPrice="49500.00" | **PASS** |
| **TC_BVA_S_02** | Order & Payment | Đơn giá món lân cận tối thiểu Min+ | $B_{12}$ (price: Min+ = 2.000đ) | POST | `/api/orders` | `used_points: 500, quantity: 50, price: 2.000` | HTTP 201 Created; total=100.000đ, discount=500đ, final=99.500đ | HTTP 201 Created; totalPrice="100000.00", discountAmount="500.00", finalPrice="99500.00" | **PASS** |
| **TC_BVA_S_03** | Order & Payment | Đơn giá món lân cận tối đa Max- | $B_{14}$ (price: Max- = 99.999.000đ) | POST | `/api/orders` | `used_points: 500, quantity: 50, price: 99.999.000` | HTTP 201 Created; total=4.999.950.000đ, discount=500đ, final=4.999.949.500đ | **HTTP 400 Bad Request**; `{"message": "numeric field overflow"}` (Lỗi tràn số cột `DECIMAL(10,2)`) |  **FAIL (Defect)** |
| **TC_BVA_S_04** | Order & Payment | Đơn giá món biên tối đa Max | $B_{15}$ (price: Max = 100.000.000đ) | POST | `/api/orders` | `used_points: 500, quantity: 50, price: 100.000.000` | HTTP 201 Created; total=5.000.000.000đ, discount=500đ, final=4.999.999.500đ | **HTTP 400 Bad Request**; `{"message": "numeric field overflow"}` (Lỗi tràn số cột `DECIMAL(10,2)`) |  **FAIL (Defect)** |

---

## 5. PHÂN TÍCH DEFECT PHÁT HIỆN TỪ KIỂM THỬ BVA

### 5.1. Mô tả lỗi (Defect Report):
* **Mã Defect:** `DEFECT-BVA-ORDER-001`
* **Ca kiểm thử phát hiện:** `TC_BVA_S_03`, `TC_BVA_S_04`
* **Mô tả hiện tượng:** Khi khách hàng đặt đơn hàng với các món ăn có đơn giá chạm biên tối đa theo đặc tả SRS (đơn giá từ $99.999.000đ$ đến $100.000.000đ$) với số lượng danh định 50 phần, tổng tiền đơn hàng phát sinh đạt mức **$4.999.950.000đ$ đến $5.000.000.000đ$** ($\approx 5$ Tỷ VNĐ). Hệ thống trả về lỗi:
  ```json
  {
    "message": "numeric field overflow"
  }
  ```

### 5.2. Nguyên nhân (Root Cause):
1. Theo đặc tả SRS Mục 2.6.1, đơn giá món ăn cho phép tối đa $100.000.000đ$ và số lượng đặt tối đa 99 phần.
2. Tuy nhiên, trong Cơ sở dữ liệu và Model Sequelize (`Order.js`, `OrderItem.js`), các trường `totalPrice`, `finalPrice`, `unitPrice` được cấu hình kiểu dữ liệu **`DECIMAL(10, 2)`**.
3. Kiểu `DECIMAL(10, 2)` có tổng cộng 10 chữ số với 2 chữ số phần thập phân, do đó phần nguyên chỉ lưu được tối đa **$10 - 2 = 8$ chữ số** (tương đương giá trị tối đa là **$99.999.999,99$ VNĐ** $\approx 99,9$ triệu đồng).
4. Khi tổng tiền đơn hàng đạt 5 Tỷ đồng (10 chữ số phần nguyên), Database PostgreSQL/MySQL bị tràn số và chặn lưu trữ.



---

## 6. TỔNG KẾT & ĐÁNH GIÁ
* **Tổng số ca kiểm thử:** 14 Test Cases
* **Passed:** 12 / 14 (85.71%)
* **Failed:** 2 / 14 (14.29%) 
* **Đánh giá chung:** Phương pháp kiểm thử giá trị biên Standard BVA đã phát huy hiệu quả xuất sắc khi xác minh chính xác các logic nghiệp vụ tính toán (số lượng món, chiết khấu điểm tích lũy) và phát hiện thành công lỗ hổng tràn số tiềm ẩn trong thiết kế Cơ sở dữ liệu của hệ thống.
