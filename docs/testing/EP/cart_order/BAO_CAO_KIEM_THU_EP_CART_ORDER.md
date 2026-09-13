# BÁO CÁO KẾT QUẢ KIỂM THỬ PHÂN VÙNG TƯƠNG ĐƯƠNG (EQUIVALENCE PARTITIONING - EP)
## MODULE: CART & ORDER MANAGEMENT (STOCK / POINTS) - DEFECT & TEST RUN REPORT

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
  * `EQ_CRT1` (Valid): 1 <= items.length <= 50 -> Cho phép đặt hàng thành công (HTTP 201).
  * `EQ_CRT2` (Invalid): items = [] (Giỏ hàng rỗng) -> Báo lỗi HTTP 400: "Đơn hàng phải có ít nhất một món ăn".
  * `EQ_CRT3` (Invalid): items.length > 50 loại món -> Báo lỗi HTTP 400: "Số loại món không được vượt quá 50".
* **Ghi chú món ăn (note từ 0 đến 200 ký tự):**
  * `EQ_NOT1` (Valid): 0 <= length(note) <= 200 -> Lưu ghi chú thành công.
  * `EQ_NOT2` (Invalid): length(note) > 200 ký tự -> Báo lỗi HTTP 400: "Ghi chú món ăn không được vượt quá 200 ký tự".
* **Trạng thái món trong giỏ (isAvailable):**
  * `EQ_AV1` (Valid): isAvailable = true -> Món còn phục vụ.
  * `EQ_AV2` (Invalid): isAvailable = false -> Báo lỗi HTTP 400: "Món hiện đang tạm ngưng phục vụ".

### 2.2. Phân vùng Đơn hàng & Tồn kho (Order & Stock Management)
* **Số lượng mỗi món (quantity từ 1 đến 99 phần):**
  * `EQ_Q1` (Valid): 1 <= quantity <= 99 và quantity <= stock -> Trừ tồn kho và đặt món thành công (HTTP 201).
  * `EQ_Q2` (Invalid): quantity <= 0 -> Báo lỗi số lượng không hợp lệ (HTTP 400).
  * `EQ_Q3` (Invalid): quantity > 99 -> Báo lỗi số lượng vượt quá 99 phần (HTTP 400).
  * `EQ_Q4` (Invalid): quantity > stock -> Báo lỗi không đủ tồn kho phục vụ (HTTP 400).
* **Tồn kho sau khi đặt (stock_new):**
  * `EQ_STK1` (Valid): stock_new = 0 -> Tự động chuyển isAvailable = false.

### 2.3. Phân vùng Điểm tích lũy & Đơn giá (Points & Price)
* **Điểm sử dụng (used_points từ 0 đến số dư user.points):**
  * `EQ_P1` (Valid): 0 <= used_points <= user.points -> Giảm trừ tiền hóa đơn thành công.
  * `EQ_P2` (Invalid): used_points < 0 -> Báo lỗi điểm không hợp lệ (HTTP 400).
  * `EQ_P3` (Invalid): used_points > user.points -> Rollback và báo lỗi không đủ điểm (HTTP 400).
* **Đơn giá món (price từ 1.000 đến 100.000.000 VNĐ):**
  * `EQ_S1` (Valid): 1.000 <= price <= 100.000.000 -> Tính tiền chính xác.
  * `EQ_S2` (Invalid): price < 1.000 -> Báo lỗi đơn giá dưới mức tối thiểu (HTTP 400).
  * `EQ_S3` (Invalid): price > 100.000.000 -> Báo lỗi đơn giá vượt trần (HTTP 400).

---

## 3. BẢNG KẾT QUẢ KIỂM THỬ THỰC TẾ (POSTMAN COLLECTION RUNNER)

| Test Case ID* | Module | Test Summary / Description* | Lớp tương đương kiểm thử (EP Class) | HTTP Method | Endpoint | Pre-condition | Test Steps* | Inputs (Test Data / Request)* | Expected Result* | Actual Result (Kết quả Postman Runner)* | Trạng thái (Pass/Fail)* |
| :--- | :--- | :--- | :--- | :--- | :---: | :--- | :--- | :--- | :--- | :--- | :---: |
| **TC_EP_01** | Cart & Order | Tạo đơn hàng thành công với giỏ hàng hợp lệ đầy đủ tham số | EQ_CRT1, EQ_Q1, EQ_P1, EQ_NOT1, EQ_S1 (Valid) | POST | /api/orders | User có 1.000 điểm; Product 1 có giá 150.000đ, stock 100 | 1. Đảm bảo user đủ điểm, món đủ tồn kho<br>2. Nhập ghi chú, dùng 500 điểm<br>3. Gửi POST /api/orders<br>4. Kiểm tra status 201 | Headers: Bearer {token}<br>Body: `{"table_id": 1, "used_points": 500, "note": "ít cay", "items": [{"product_id": 1, "quantity": 5}]}` | Status: 201 Created<br>totalPrice = 750.000đ, discountAmount = 500đ, finalPrice = 749.500đ, trừ 5 tồn kho & trừ 500 điểm. | HTTP 201 Created. Tính đúng tổng tiền và chiết khấu điểm tích lũy. | **PASS** |
| **TC_EP_02** | Cart | Đặt hàng thất bại khi giỏ hàng rỗng không có món (items = []) | EQ_CRT2 (Invalid) | POST | /api/orders | Có auth token hợp lệ | 1. Không chọn món nào vào giỏ<br>2. Gửi POST /api/orders với items = []<br>3. Kiểm tra bắt lỗi validation | Headers: Bearer {token}<br>Body: `{"table_id": 1, "items": []}` | Status: 400 Bad Request<br>Báo lỗi: "Đơn hàng phải có ít nhất một món ăn". | HTTP 400 Bad Request. Bắt đúng thông báo lỗi giỏ hàng rỗng. | **PASS** |
| **TC_EP_03** | Cart | Đặt hàng thất bại khi món trong giỏ bị tạm ngưng phục vụ (isAvailable = false) | EQ_AV2 (Invalid) | POST | /api/orders | Pre-request set Product 2 có isAvailable = false | 1. Pre-request cập nhật Product 2 tạm ngưng<br>2. Gửi POST /api/orders đặt món Product 2<br>3. Kiểm tra bắt lỗi nghiệp vụ | Headers: Bearer {token}<br>Body: `{"table_id": 1, "items": [{"product_id": 2, "quantity": 1}]}` | Status: 400 Bad Request<br>Báo lỗi: "tạm ngưng phục vụ". | HTTP 400 Bad Request. Chặn đặt món ngưng kinh doanh thành công. | **PASS** |
| **TC_EP_04** | Cart | Đặt hàng thất bại khi ghi chú dài hơn mức cho phép (> 200 ký tự) | EQ_NOT2 (Invalid) | POST | /api/orders | Có auth token hợp lệ | 1. Nhập ghi chú dài 270 ký tự trong giỏ<br>2. Gửi POST /api/orders<br>3. Kiểm tra bắt lỗi validation | Headers: Bearer {token}<br>Body: `{"table_id": 1, "note": "A*270", "items": [{"product_id": 1, "quantity": 1}]}` | Status: 400 Bad Request<br>Báo lỗi ghi chú không được vượt quá 200 ký tự. | **HTTP 201 Created** (API chưa validate độ dài note, vẫn lưu thành công chuỗi 270 ký tự vào DB). | **FAIL (Bug)** |
| **TC_EP_05** | Order & Stock | Đặt hàng thất bại khi số lượng món vượt quá tồn kho (quantity: 10 > stock: 3) | EQ_Q4 (Invalid) | POST | /api/orders | Pre-request set Product 3 chỉ còn stock = 3 | 1. Pre-request cập nhật tồn kho Product 3 là 3 suất<br>2. Gửi POST /api/orders với quantity = 10<br>3. Kiểm tra rollback và báo lỗi tồn kho | Headers: Bearer {token}<br>Body: `{"table_id": 1, "items": [{"product_id": 3, "quantity": 10}]}` | Status: 400 Bad Request<br>Báo lỗi: "không đủ phục vụ". | HTTP 400 Bad Request. Rollback và báo không đủ tồn kho. | **PASS** |
| **TC_EP_06** | Order & Stock | Đặt hàng thất bại khi số lượng món dưới mức tối thiểu (quantity = 0) | EQ_Q2 (Invalid) | POST | /api/orders | Có auth token hợp lệ | 1. Chọn quantity = 0 trong request<br>2. Gửi POST /api/orders<br>3. Kiểm tra bắt lỗi số lượng | Headers: Bearer {token}<br>Body: `{"table_id": 1, "items": [{"product_id": 1, "quantity": 0}]}` | Status: 400 Bad Request<br>Báo lỗi số lượng món không hợp lệ (phải lớn hơn 0). | **HTTP 201 Created** (API chưa validate quantity > 0, tạo đơn thành công với totalPrice = 0đ). | **FAIL (Bug)** |
| **TC_EP_07** | Order & Points | Đặt hàng thất bại khi điểm sử dụng vượt quá số dư tài khoản (used_points: 500 > balance: 100) | EQ_P3 (Invalid) | POST | /api/orders | Pre-request set User điểm = 100 | 1. Pre-request thiết lập điểm user = 100<br>2. Gửi POST /api/orders với used_points = 500<br>3. Kiểm tra rollback và thông báo lỗi | Headers: Bearer {token}<br>Body: `{"table_id": 1, "used_points": 500, "items": [{"product_id": 1, "quantity": 2}]}` | Status: 400 Bad Request<br>Báo lỗi: "không đủ để áp dụng". | HTTP 400 Bad Request. Bắt lỗi thiếu điểm và rollback an toàn. | **PASS** |
| **TC_EP_08** | Cart | Đặt hàng thất bại khi số loại món vượt quá giới hạn giỏ hàng (> 50 món) | EQ_CRT3 (Invalid) | POST | /api/orders | Có auth token hợp lệ | 1. Gửi request có 55 loại món<br>2. Kiểm tra bắt lỗi số loại món | Headers: Bearer {token}<br>Body: `{"table_id": 1, "items": [55 items]}` | Status: 400 Bad Request<br>Báo lỗi số loại món vượt trần 50 món. | **HTTP 201 Created** (API chưa kiểm tra giới hạn 50 loại món, vẫn duyệt và tạo đơn). | **FAIL (Bug)** |
| **TC_EP_09** | Order & Stock | Đặt hàng thất bại khi số lượng món vượt mức tối đa cho phép (> 99 phần) | EQ_Q3 (Invalid) | POST | /api/orders | Có auth token hợp lệ | 1. Gửi request với quantity = 150<br>2. Kiểm tra bắt lỗi số lượng vượt trần | Headers: Bearer {token}<br>Body: `{"table_id": 1, "items": [{"product_id": 1, "quantity": 150}]}` | Status: 400 Bad Request<br>Báo lỗi số lượng món vượt quá 99 phần. | HTTP 400 Bad Request. Chặn đặt hàng do vượt số lượng cho phép. | **PASS** |
| **TC_EP_10** | Order & Points | Đặt hàng thất bại khi điểm sử dụng là số âm (used_points < 0) | EQ_P2 (Invalid) | POST | /api/orders | Có auth token hợp lệ | 1. Gửi request với used_points = -100<br>2. Kiểm tra bắt lỗi điểm âm | Headers: Bearer {token}<br>Body: `{"table_id": 1, "used_points": -100, "items": [{"product_id": 1, "quantity": 1}]}` | Status: 400 Bad Request<br>Báo lỗi điểm sử dụng không hợp lệ. | **HTTP 201 Created** (API bỏ qua used_points âm, coi như 0đ và tạo đơn thành công). | **FAIL (Bug)** |

---

## 4. BÁO CÁO KHIẾM KHUYẾT HỆ THỐNG (DEFECT / BUG REPORT)

Bộ kịch bản kiểm thử Postman với Assertions nghiêm ngặt đã phát hiện **04 Lỗi Validation nghiệp vụ** trong mã nguồn Backend hiện tại:

###  Defect #1: Chưa kiểm tra độ dài tối đa của Ghi chú (Note > 200 ký tự)
* **Mã Test Case:** `TC_EP_04` (Lớp tương đương `EQ_NOT2`).
* **Vị trí mã nguồn:** `backend/src/controllers/orderController.js` (Dòng 6, 91) & `backend/src/models/order.js` (Dòng 23).
* **Mô tả:** Request gửi ghi chú dài 270 ký tự nhưng API không kiểm tra `note.length > 200`, lưu thẳng vào trường `TEXT` của DB và trả về `201 Created`.
* **Mức độ nghiêm trọng:** Medium (Dữ liệu không toàn vẹn, rủi ro tràn giao diện hiển thị).
* **Giải pháp khuyến nghị:** Thêm kiểm tra validation:
 

---

###  Defect #2: Chưa kiểm tra số lượng món tối thiểu (Quantity = 0 hoặc âm)
* **Mã Test Case:** `TC_EP_06` (Lớp tương đương `EQ_Q2`).
* **Vị trí mã nguồn:** `backend/src/controllers/orderController.js` (Dòng 20 - 47).
* **Mô tả:** Vòng lặp duyệt món chỉ kiểm tra tồn kho `stock < quantity` mà không kiểm tra `quantity <= 0`. Request gửi `quantity = 0` được tính `totalPrice = 0` và tạo đơn thành công `201 Created`.
* **Mức độ nghiêm trọng:** High (Gây sai lệch logic kinh doanh, tạo đơn rác 0đ).
* **Giải pháp khuyến nghị:** Thêm kiểm tra trong vòng lặp món:
 

---

###  Defect #3: Chưa kiểm tra số loại món tối đa trong giỏ hàng (> 50 món)
* **Mã Test Case:** `TC_EP_08` (Lớp tương đương `EQ_CRT3`).
* **Vị trí mã nguồn:** `backend/src/controllers/orderController.js` (Dòng 12 - 14).
* **Mô tả:** API chỉ kiểm tra mảng rỗng `if (!items || !items.length)` mà không kiểm tra cận trên `items.length > 50`.
* **Mức độ nghiêm trọng:** Low (Rủi ro tải hệ thống khi giỏ hàng quá lớn).
* **Giải pháp khuyến nghị:**
  

---

###  Defect #4: Bỏ qua kiểm tra điểm tích lũy là số âm (used_points < 0)
* **Mã Test Case:** `TC_EP_10` (Lớp tương đương `EQ_P2`).
* **Vị trí mã nguồn:** `backend/src/controllers/orderController.js` (Dòng 65 - 80).
* **Mô tả:** Điều kiện `if (user_id && pointsToUse > 0)` bỏ qua trường hợp `pointsToUse < 0`, khiến hệ thống ngầm hiểu là 0đ và vẫn tạo đơn `201 Created` thay vì từ chối request không hợp lệ.
* **Mức độ nghiêm trọng:** Medium (Sai chuẩn REST API validation).
* **Giải pháp khuyến nghị:**
 

---

## 5. TỔNG KẾT & ĐÁNH GIÁ
* **Tổng số test cases:** 10
* **Số test case ĐẠT (PASS):** 6 / 10 (60%)
* **Số test case KHÔNG ĐẠT (FAIL - Phát hiện Defect):** 4 / 10 (40%)
* **Kết luận:** Bộ Test Collection Phân hoạch tương đương (EP) đã hoạt động chuẩn xác theo nguyên tắc kiểm thử hộp đen, bảo đảm tính nghiêm ngặt của các Assertions và phát hiện đầy đủ các thiếu sót trong tầng validation của hệ thống theo đúng yêu cầu đề tài.
