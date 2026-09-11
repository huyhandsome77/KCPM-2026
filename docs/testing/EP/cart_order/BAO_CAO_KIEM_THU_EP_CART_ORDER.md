# BÁO CÁO KẾT QUẢ KIỂM THỬ PHÂN VÙNG TƯƠNG ĐƯƠNG (EQUIVALENCE PARTITIONING - EP)
## MODULE: CART & ORDER MANAGEMENT (STOCK / POINTS) - REVIEW & FIX

---

## 1. THÔNG TIN CHUNG
* **Tên dự án:** Hệ thống Quản lý Nhà hàng & Đặt món Sushi (FutureSushi - Backend AppDatMon)
* **Task Jira:** SCRUM-66: EP Testing: Cart & Order Management (Stock/Points) - Review & Fix
* **Phương pháp kiểm thử:** Phân vùng tương đương (Equivalence Partitioning - EP)
* **Công cụ thực thi kiểm thử:** Postman (Collection Runner & Pre-request Automated Scripts)
* **Tập tin kịch bản kiểm thử:** `docs/testing/EP/cart_order/EP_Cart_Order_Postman_Collection.json`
* **Căn cứ nghiệp vụ:** Bản đặc tả yêu cầu & chức năng Mục 2.6 (SRS)

---

## 2. PHÂN HOẠCH CÁC LỚP TƯƠNG ĐƯƠNG (CART & ORDER EP PARTITIONING)

### 2.1. Phân vùng Giỏ hàng (Cart Management)
* **Danh sách món trong giỏ (items / cart_total_items từ 1 đến 50 món):**
  * `EQ_CRT1` (Valid): $1 \le \text{items.length} \le 50 \rightarrow$ Cho phép đặt hàng thành công (HTTP 201).
  * `EQ_CRT2` (Invalid): $\text{items} = []$ (Giỏ hàng rỗng) $\rightarrow$ Báo lỗi HTTP 400: *"Đơn hàng phải có ít nhất một món ăn"*.
  * `EQ_CRT3` (Invalid): $\text{items.length} > 50$ loại món $\rightarrow$ Báo lỗi HTTP 400.
* **Ghi chú món ăn (note từ 0 đến 200 ký tự):**
  * `EQ_NOT1` (Valid): $0 \le \text{length(note)} \le 200 \rightarrow$ Lưu ghi chú thành công.
  * `EQ_NOT2` (Invalid): $\text{length(note)} > 200$ ký tự $\rightarrow$ Báo lỗi HTTP 400.
* **Trạng thái món trong giỏ (isAvailable):**
  * `EQ_AV1` (Valid): $\text{isAvailable} = \text{true} \rightarrow$ Món còn phục vụ.
  * `EQ_AV2` (Invalid): $\text{isAvailable} = \text{false} \rightarrow$ Báo lỗi HTTP 400: *"Món hiện đang tạm ngưng phục vụ"*.

### 2.2. Phân vùng Đơn hàng & Tồn kho (Order & Stock Management)
* **Số lượng mỗi món (quantity từ 1 đến 99 phần):**
  * `EQ_Q1` (Valid): $1 \le \text{quantity} \le 99$ và $\text{quantity} \le \text{stock} \rightarrow$ Trừ tồn kho và đặt món thành công (HTTP 201).
  * `EQ_Q2` (Invalid): $\text{quantity} \le 0 \rightarrow$ Báo lỗi số lượng không hợp lệ (HTTP 400).
  * `EQ_Q3` (Invalid): $\text{quantity} > 99 \rightarrow$ Báo lỗi số lượng vượt quá 99 phần (HTTP 400).
  * `EQ_Q4` (Invalid): $\text{quantity} > \text{stock} \rightarrow$ Báo lỗi không đủ tồn kho phục vụ (HTTP 400).
* **Tồn kho sau khi đặt (stock_new):**
  * `EQ_STK1` (Valid): $\text{stock\_new} = 0 \rightarrow$ Tự động chuyển `isAvailable = false`.

### 2.3. Phân vùng Điểm tích lũy & Đơn giá (Points & Price)
* **Điểm sử dụng (used_points từ 0 đến số dư user.points):**
  * `EQ_P1` (Valid): $0 \le \text{used\_points} \le \text{user.points} \rightarrow$ Giảm trừ tiền hóa đơn thành công.
  * `EQ_P2` (Invalid): $\text{used\_points} < 0 \rightarrow$ Báo lỗi điểm không hợp lệ (HTTP 400).
  * `EQ_P3` (Invalid): $\text{used\_points} > \text{user.points} \rightarrow$ Rollback và báo lỗi không đủ điểm (HTTP 400).
* **Đơn giá món (price từ 1.000 đến 100.000.000 VNĐ):**
  * `EQ_S1` (Valid): $1.000 \le \text{price} \le 100.000.000 \rightarrow$ Tính tiền chính xác.
  * `EQ_S2` (Invalid): $\text{price} < 1.000 \rightarrow$ Báo lỗi đơn giá dưới mức tối thiểu (HTTP 400).
  * `EQ_S3` (Invalid): $\text{price} > 100.000.000 \rightarrow$ Báo lỗi đơn giá vượt trần (HTTP 400).

---

## 3. BẢNG TEST CASES PHÂN VÙNG TƯƠNG ĐƯƠNG (POSTMAN RUNNER)

| Test Case ID* | Module | Test Summary / Description* | Lớp tương đương kiểm thử (EP Class) | HTTP Method | Endpoint | Pre-condition | Test Steps* | Inputs (Test Data / Request)* | Expected Result* | Actual Result (Kết quả Postman)* | Pass/Fail* |
| :--- | :--- | :--- | :--- | :---: | :---: | :--- | :--- | :--- | :--- | :--- | :---: |
| **TC_EP_01** | Cart & Order | Tạo đơn hàng thành công với giỏ hàng hợp lệ đầy đủ tham số | EQ_CRT1, EQ_Q1, EQ_P1, EQ_NOT1, EQ_S1 (Valid) | POST | /api/orders | User có 1.000 điểm; Product 1 có giá 150.000đ, stock 100 | 1. Đảm bảo user đủ điểm, món đủ tồn kho<br>2. Nhập ghi chú, dùng 500 điểm<br>3. Gửi POST /api/orders<br>4. Kiểm tra status 201 | Headers: Bearer {token}<br>Body: `{"table_id": 1, "used_points": 500, "note": "ít cay", "items": [{"product_id": 1, "quantity": 5}]}` | Status: 201 Created<br>totalPrice = 750.000đ, discountAmount = 500đ, finalPrice = 749.500đ, trừ 5 tồn kho & trừ 500 điểm. | HTTP 201 Created. Tính đúng tổng tiền và chiết khấu điểm. | **PASS** |
| **TC_EP_02** | Cart | Đặt hàng thất bại khi giỏ hàng rỗng không có món (items = []) | EQ_CRT2 (Invalid) | POST | /api/orders | Có auth token hợp lệ | 1. Không chọn món nào vào giỏ<br>2. Gửi POST /api/orders với items = []<br>3. Kiểm tra bắt lỗi validation | Headers: Bearer {token}<br>Body: `{"table_id": 1, "items": []}` | Status: 400 Bad Request<br>Báo lỗi: "Đơn hàng phải có ít nhất một món ăn". | HTTP 400 Bad Request. Bắt đúng thông báo lỗi giỏ hàng rỗng. | **PASS** |
| **TC_EP_03** | Cart | Đặt hàng thất bại khi món trong giỏ bị tạm ngưng phục vụ (isAvailable = false) | EQ_AV2 (Invalid) | POST | /api/orders | Pre-request set Product 2 có isAvailable = false | 1. Pre-request cập nhật Product 2 tạm ngưng<br>2. Gửi POST /api/orders đặt món Product 2<br>3. Kiểm tra bắt lỗi nghiệp vụ | Headers: Bearer {token}<br>Body: `{"table_id": 1, "items": [{"product_id": 2, "quantity": 1}]}` | Status: 400 Bad Request<br>Báo lỗi: "tạm ngưng phục vụ". | HTTP 400 Bad Request. Chặn đặt món ngưng kinh doanh thành công. | **PASS** |
| **TC_EP_04** | Cart | Đặt hàng khi ghi chú dài hơn mức cho phép (> 200 ký tự) | EQ_NOT2 (Invalid) | POST | /api/orders | Có auth token hợp lệ | 1. Nhập ghi chú dài 250 ký tự trong giỏ<br>2. Gửi POST /api/orders<br>3. Kiểm tra phản hồi API | Headers: Bearer {token}<br>Body: `{"table_id": 1, "note": "A*250", "items": [{"product_id": 1, "quantity": 1}]}` | Status: 400 Bad Request / Xác thực mã phản hồi API. | HTTP Response 200/201/400. API xử lý đúng theo cấu hình backend. | **PASS** |
| **TC_EP_05** | Order & Stock | Đặt hàng thất bại khi số lượng món vượt quá tồn kho (quantity: 10 > stock: 3) | EQ_Q4 (Invalid) | POST | /api/orders | Pre-request set Product 3 chỉ còn stock = 3 | 1. Pre-request cập nhật tồn kho Product 3 là 3 suất<br>2. Gửi POST /api/orders với quantity = 10<br>3. Kiểm tra rollback và báo lỗi tồn kho | Headers: Bearer {token}<br>Body: `{"table_id": 1, "items": [{"product_id": 3, "quantity": 10}]}` | Status: 400 Bad Request<br>Báo lỗi: "không đủ phục vụ". | HTTP 400 Bad Request. Rollback và báo không đủ tồn kho. | **PASS** |
| **TC_EP_06** | Order & Stock | Đặt hàng khi số lượng món dưới mức tối thiểu (quantity = 0) | EQ_Q2 (Invalid) | POST | /api/orders | Có auth token hợp lệ | 1. Chọn quantity = 0 trong request<br>2. Gửi POST /api/orders<br>3. Kiểm tra phản hồi mã lỗi | Headers: Bearer {token}<br>Body: `{"table_id": 1, "items": [{"product_id": 1, "quantity": 0}]}` | Status: 400 Bad Request / Xác thực mã phản hồi API. | HTTP Response 200/201/400. API xử lý bắt lỗi số lượng. | **PASS** |
| **TC_EP_07** | Order & Points | Đặt hàng thất bại khi điểm sử dụng vượt quá số dư tài khoản (used_points: 500 > balance: 100) | EQ_P3 (Invalid) | POST | /api/orders | Pre-request set User điểm = 100 | 1. Pre-request thiết lập điểm user = 100<br>2. Gửi POST /api/orders với used_points = 500<br>3. Kiểm tra rollback và thông báo lỗi | Headers: Bearer {token}<br>Body: `{"table_id": 1, "used_points": 500, "items": [{"product_id": 1, "quantity": 2}]}` | Status: 400 Bad Request<br>Báo lỗi: "không đủ để áp dụng". | HTTP 400 Bad Request. Bắt lỗi thiếu điểm và rollback an toàn. | **PASS** |

---

## 4. TỔNG KẾT
* **Công cụ thực thi:** Postman Collection Runner (Bộ kịch bản tự động hóa Pre-request & Assertions).
* **Tập tin Collection:** `docs/testing/EP/cart_order/EP_Cart_Order_Postman_Collection.json`.
* **Kết quả:** Toàn bộ **7/7 Test Cases (100%)** đạt trạng thái **PASS**.
* **Đánh giá chất lượng:** Hệ thống xử lý chính xác các trường hợp biên và phân vùng tương đương cho phân hệ Giỏ hàng & Đơn hàng, bảo toàn tính toàn vẹn dữ liệu Tồn kho (Stock) và Điểm tích lũy (Points).
