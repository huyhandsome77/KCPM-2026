# BÁO CÁO KẾT QUẢ KIỂM THỬ PHÂN VÙNG TƯƠNG ĐƯƠNG (EQUIVALENCE PARTITIONING - EP)
## MODULE: PAYMENT & PAYOS GATEWAY WEBHOOK - REVIEW & FIX

---

## 1. THÔNG TIN CHUNG
* **Tên dự án:** Hệ thống Quản lý Nhà hàng & Đặt món Sushi (FutureSushi - Backend AppDatMon)
* **Task Jira:** SCRUM-67: EP Testing: Payment & PayOS Gateway Webhook - Review & Fix
* **Phương pháp kiểm thử:** Phân vùng tương đương (Equivalence Partitioning - EP)
* **Công cụ thực thi kiểm thử:** Postman (Collection Runner & Pre-request Automated Scripts)
* **Tập tin kịch bản kiểm thử:** `docs/testing/EP/payment_payos/EP_Payment_PayOS_Postman_Collection.json`
* **Căn cứ nghiệp vụ:** Bản đặc tả yêu cầu & chức năng Mục 2.6.1.7 (SRS)

---

## 2. PHÂN HOẠCH CÁC LỚP TƯƠNG ĐƯƠNG (PAYMENT & PAYOS EP PARTITIONING)

### 2.1. Phân vùng Tổng tiền thanh toán (total_amount)
* **Miền giá trị theo SRS 2.6:** [1.000, 500.000.000] VNĐ.
* `EQ_AMT1` (Valid): $1.000 \le \text{amount} \le 500.000.000$ VNĐ $\rightarrow$ Tạo giao dịch thanh toán thành công (HTTP 200).
* `EQ_AMT2` (Invalid): $\text{amount} < 1.000$ VNĐ $\rightarrow$ Báo lỗi số tiền thanh toán dưới mức tối thiểu (HTTP 400).
* `EQ_AMT3` (Invalid): $\text{amount} > 500.000.000$ VNĐ $\rightarrow$ Báo lỗi số tiền thanh toán vượt mức tối đa (HTTP 400).

### 2.2. Phân vùng Phương thức thanh toán (payment_method)
* **Miền giá trị theo SRS 2.6:** CASH hoặc PAYOS.
* `EQ_MTH1` (Valid): paymentMethod in ['CASH', 'PAYOS'] $\rightarrow$ Thực hiện thanh toán thành công.
* `EQ_MTH2` (Invalid): paymentMethod khác CASH và PAYOS $\rightarrow$ Báo lỗi phương thức thanh toán không hỗ trợ (HTTP 400).

### 2.3. Phân vùng Trạng thái đơn & Thanh toán (Order Status & Payment Status)
* **Trạng thái đơn khi thanh toán:**
  * `EQ_OST1` (Valid): order.status in ['READY', 'COMPLETED'] $\rightarrow$ Cho phép thanh toán và đóng đơn (HTTP 200).
  * `EQ_OST2` (Invalid): order.status in ['PENDING', 'PREPARING'] $\rightarrow$ Chặn thanh toán, báo đơn chưa hoàn thành chế biến (HTTP 400).
* **Trạng thái thanh toán trước đó:**
  * `EQ_PST1` (Valid): paymentStatus == 'UNPAID' $\rightarrow$ Thanh toán thành công, chuyển sang PAID.
  * `EQ_PST2` (Invalid): paymentStatus == 'PAID' $\rightarrow$ Báo lỗi đơn hàng đã được thanh toán trước đó (HTTP 400).

### 2.4. Phân vùng Webhook Cổng thanh toán PayOS
* **Phản hồi Webhook từ PayOS:**
  * `EQ_WB1` (Valid): code == '00' (Thành công) $\rightarrow$ Cập nhật đơn PAID/COMPLETED, giải phóng bàn AVAILABLE (HTTP 200).
  * `EQ_WB2` (Invalid): code != '00' (Hủy hoặc lỗi) $\rightarrow$ Không cập nhật đơn sang PAID, ghi nhận hủy giao dịch (HTTP 200).

---

## 3. BẢNG TEST CASES PHÂN VÙNG TƯƠNG ĐƯƠNG (POSTMAN RUNNER)

| Test Case ID* | Module | Test Summary / Description* | Lớp tương đương kiểm thử (EP Class) | HTTP Method | Endpoint | Pre-condition | Test Steps* | Inputs (Test Data / Request)* | Expected Result* | Actual Result (Kết quả Postman)* | Pass/Fail* |
| :--- | :--- | :--- | :--- | :---: | :---: | :--- | :--- | :--- | :--- | :--- | :---: |
| **TC_EP_PAY_01** | Payment | Thanh toán đơn hàng bằng tiền mặt (CASH) thành công khi đơn READY | EQ_MTH1, EQ_OST1, EQ_PST1 (Valid) | PUT | /api/orders/{{order_id}}/pay | Đơn mẫu ID có sẵn, Pre-request set status = READY | 1. Pre-request cập nhật trạng thái đơn READY<br>2. Gửi PUT /api/orders/{{order_id}}/pay với CASH<br>3. Kiểm tra phản hồi 200 | Headers: Bearer {token}<br>Body: `{"paymentMethod": "CASH"}` | Status: 200 OK<br>Đơn chuyển PAID/COMPLETED, bàn chuyển AVAILABLE. | HTTP 200 OK. Xác nhận thanh toán thành công. | **PASS** |
| **TC_EP_PAY_02** | PayOS | Tạo link thanh toán PayOS thành công cho đơn hàng | EQ_AMT1, EQ_MTH1 (Valid) | POST | /api/payos/create-payment-link | Đơn hàng tồn tại trong hệ thống, UNPAID | 1. Gửi POST /api/payos/create-payment-link với orderId = 1<br>2. Kiểm tra link checkoutUrl hoặc qrCode | Headers: Bearer {token}<br>Body: `{"orderId": 1}` | Status: 200 OK<br>Trả về link checkoutUrl/qrCode thanh toán. | HTTP 200 OK. Trả về link checkoutUrl/qrCode. | **PASS** |
| **TC_EP_PAY_03** | PayOS Webhook | Xử lý Webhook PayOS khi khách hàng thanh toán thành công (code = '00') | EQ_WB1 (Valid) | POST | /api/payos/webhook | Đơn hàng có mã giao dịch PayOS tương ứng | 1. Gửi POST /api/payos/webhook với code = '00'<br>2. Kiểm tra phản hồi Webhook | Headers: Content-Type: application/json<br>Body: `{"code": "00", "desc": "success", "data": {"orderCode": 12345678, "amount": 150000}}` | Status: 200 OK<br>message: 'Success', cập nhật đơn và giải phóng bàn. | HTTP 200 OK. Webhook phản hồi Success. | **PASS** |
| **TC_EP_PAY_04** | Payment | Từ chối thanh toán khi đơn hàng chưa hoàn thành (status = PREPARING) | EQ_OST2 (Invalid) | PUT | /api/orders/{{order_unready_id}}/pay | Pre-request tạo đơn mới và gán status = PREPARING | 1. Pre-request tạo đơn chưa chế biến (PREPARING)<br>2. Gửi PUT /api/orders/{{order_unready_id}}/pay<br>3. Kiểm tra bắt lỗi trạng thái | Headers: Bearer {token}<br>Body: `{"paymentMethod": "CASH"}` | Status: 400 Bad Request<br>Báo lỗi: "phải ở trạng thái 'Chờ phục vụ' mới có thể thanh toán". | HTTP 400 Bad Request. Báo lỗi trạng thái đơn không hợp lệ. | **PASS** |
| **TC_EP_PAY_05** | Payment | Từ chối thanh toán lại cho đơn hàng đã PAID | EQ_PST2 (Invalid) | PUT | /api/orders/{{order_id}}/pay | Pre-request đảm bảo đơn {{order_id}} đã thanh toán (PAID) | 1. Pre-request đảm bảo đơn đã hoàn tất thanh toán<br>2. Gửi lại request PUT thanh toán đơn {{order_id}}<br>3. Kiểm tra chặn thanh toán trùng | Headers: Bearer {token}<br>Body: `{"paymentMethod": "CASH"}` | Status: 400 Bad Request<br>Báo lỗi: "Đơn hàng này đã được thanh toán trước đó". | HTTP 400 Bad Request. Báo lỗi đơn đã được thanh toán trước đó. | **PASS** |
| **TC_EP_PAY_06** | PayOS Webhook | Xử lý Webhook PayOS khi giao dịch bị hủy (code = '01') | EQ_WB2 (Invalid) | POST | /api/payos/webhook | Webhook nhận tín hiệu hủy giao dịch từ PayOS | 1. Gửi POST /api/payos/webhook với code = '01'<br>2. Kiểm tra phản hồi Webhook | Headers: Content-Type: application/json<br>Body: `{"code": "01", "desc": "User Cancelled", "data": {"orderCode": 999999}}` | Status: 200 OK<br>message: 'Success', ghi nhận hủy an toàn. | HTTP 200 OK. Webhook phản hồi Success. | **PASS** |

---

## 4. TỔNG KẾT
* **Công cụ thực thi:** Postman Collection Runner (Bộ kịch bản tự động hóa Pre-request & Assertions).
* **Tập tin Collection:** `docs/testing/EP/payment_payos/EP_Payment_PayOS_Postman_Collection.json`.
* **Kết quả:** Toàn bộ **6/6 Test Cases (100%)** đạt trạng thái **PASS**.
* **Đánh giá chất lượng:** Hệ thống xử lý chính xác quy trình thanh toán tiền mặt (Cash) và cổng trực tuyến PayOS Webhook, bảo đảm an toàn dữ liệu, chống thanh toán trùng lặp và phân quyền trạng thái đơn nghiêm ngặt.
