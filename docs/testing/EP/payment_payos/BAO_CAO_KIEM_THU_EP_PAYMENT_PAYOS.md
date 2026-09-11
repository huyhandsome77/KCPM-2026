# BÁO CÁO KẾT QUẢ KIỂM THỬ PHÂN VÙNG TƯƠNG ĐƯƠNG (EQUIVALENCE PARTITIONING - EP)
## MODULE: PAYMENT & PAYOS GATEWAY WEBHOOK - REVIEW & REPORT

---

## 1. THÔNG TIN CHUNG
* **Tên dự án:** Hệ thống Quản lý Nhà hàng & Đặt món Sushi (FutureSushi - Backend AppDatMon)
* **Phương pháp kiểm thử:** Phân vùng tương đương (Equivalence Partitioning - EP)
* **Công cụ thực thi kiểm thử:** Postman (Collection Runner, Pre-request Scripts & Verification Requests)
* **Căn cứ nghiệp vụ:** Bản đặc tả yêu cầu & chức năng Mục 2.6.1.7 (SRS)

---

## 2. PHÂN HOẠCH ĐẦY ĐỦ CÁC LỚP TƯƠNG ĐƯƠNG (PAYMENT & PAYOS EP PARTITIONING - 11 LỚP)

### 2.1. Phân vùng Tổng tiền thanh toán (total_amount)
* **Miền giá trị theo SRS 2.6:** [1.000, 500.000.000] VNĐ.
* `EQ_AMT1` (Valid): 1.000 <= amount <= 500.000.000 VNĐ -> Tạo giao dịch thanh toán thành công (HTTP 200).
* `EQ_AMT2` (Invalid): amount < 1.000 VNĐ -> Báo lỗi số tiền thanh toán dưới mức tối thiểu (HTTP 400).
* `EQ_AMT3` (Invalid): amount > 500.000.000 VNĐ -> Báo lỗi số tiền thanh toán vượt mức tối đa (HTTP 400).

### 2.2. Phân vùng Phương thức thanh toán (payment_method)
* **Miền giá trị theo SRS 2.6:** CASH hoặc PAYOS.
* `EQ_MTH1` (Valid): paymentMethod in ['CASH', 'PAYOS'] -> Thực hiện thanh toán thành công.
* `EQ_MTH2` (Invalid): paymentMethod khác CASH và PAYOS -> Báo lỗi phương thức thanh toán không hỗ trợ (HTTP 400).

### 2.3. Phân vùng Trạng thái đơn & Thanh toán (Order Status & Payment Status)
* **Trạng thái đơn khi thanh toán:**
  * `EQ_OST1` (Valid): order.status in ['READY', 'COMPLETED'] -> Cho phép thanh toán và đóng đơn (HTTP 200).
  * `EQ_OST2` (Invalid): order.status in ['PENDING', 'PREPARING'] -> Chặn thanh toán, báo đơn chưa hoàn thành chế biến (HTTP 400).
* **Trạng thái thanh toán trước đó:**
  * `EQ_PST1` (Valid): paymentStatus == 'UNPAID' -> Thanh toán thành công, chuyển sang PAID.
  * `EQ_PST2` (Invalid): paymentStatus == 'PAID' -> Báo lỗi đơn hàng đã được thanh toán trước đó (HTTP 400).

### 2.4. Phân vùng Webhook Cổng thanh toán PayOS
* **Phản hồi Webhook từ PayOS:**
  * `EQ_WB1` (Valid): code == '00' (Thành công) -> Cập nhật đơn PAID/COMPLETED, giải phóng bàn AVAILABLE (HTTP 200).
  * `EQ_WB2` (Invalid): code != '00' (Hủy hoặc lỗi) -> Không cập nhật đơn sang PAID, giữ nguyên UNPAID (HTTP 200).

---

## 3. BẢNG TEST CASES PHÂN VÙNG TƯƠNG ĐƯƠNG (POSTMAN RUNNER - 9 TEST CASES BAO PHỦ 11 LỚP EP)

| Test Case ID* | Module | Test Summary / Description* | Lớp tương đương kiểm thử (EP Class) | HTTP Method | Endpoint | Pre-condition | Test Steps* | Inputs (Test Data / Request)* | Expected Result* | Actual Result (Kết quả Postman Runner)* | Pass/Fail* |
| :--- | :--- | :--- | :--- | :--- | :---: | :--- | :--- | :--- | :--- | :--- | :---: |
| **TC_EP_PAY_01** | Payment | Thanh toán đơn hàng bằng tiền mặt (CASH) thành công khi đơn READY | EQ_MTH1, EQ_OST1, EQ_PST1 (Valid) | PUT | /api/orders/{{order_id}}/pay | Đơn mẫu ID có sẵn, Pre-request set status = READY | 1. Pre-request đặt trạng thái READY<br>2. Gửi PUT thanh toán đơn với CASH<br>3. Kiểm tra status 200 | Headers: Bearer {token}<br>Body: `{"paymentMethod": "CASH"}` | Status: 200 OK<br>Đơn chuyển PAID/COMPLETED, bàn chuyển AVAILABLE. | HTTP 200 OK. Xác nhận thanh toán thành công. | **PASS** |
| **TC_EP_PAY_02** | PayOS | Tạo link thanh toán PayOS thành công cho đơn hàng hợp lệ | EQ_AMT1 (Valid) | POST | /api/payos/create-payment-link | Đơn hàng tồn tại trong hệ thống, UNPAID | 1. Gửi POST /api/payos/create-payment-link với `orderId: {{order_id}}`<br>2. Kiểm tra link checkoutUrl trả về | Headers: Bearer {token}<br>Body: `{"orderId": {{order_id}}}` | Status: 200 OK<br>Trả về link checkoutUrl/qrCode thanh toán. | HTTP 200 OK. Sinh link thanh toán PayOS thành công. | **PASS** |
| **TC_EP_PAY_03** | PayOS Webhook | Xử lý Webhook PayOS khi thanh toán thành công (code = '00'), kiểm tra đơn chuyển PAID & COMPLETED và bàn AVAILABLE | EQ_WB1 (Valid) | POST | /api/payos/webhook | Đơn hàng có mã giao dịch PayOS tương ứng | 1. Gửi POST /api/payos/webhook với code = '00'<br>2. Kiểm tra phản hồi Webhook 200<br>3. Gửi GET /api/orders/{{order_id}} kiểm tra trạng thái thực tế | Headers: Content-Type: application/json<br>Body: `{"code": "00", "desc": "success", "data": {"orderCode": {{payos_order_code}}, "amount": 150000}}` | Status: 200 OK<br>message: 'Success', đơn hàng thực tế chuyển sang `PAID` và `COMPLETED`, bàn chuyển `AVAILABLE`. | HTTP 200 OK. Webhook thành công & đơn hàng chuyển PAID/COMPLETED, bàn AVAILABLE. | **PASS** |
| **TC_EP_PAY_04** | Payment | Từ chối thanh toán khi đơn hàng chưa hoàn thành (status = PREPARING) | EQ_OST2 (Invalid) | PUT | /api/orders/{{order_unready_id}}/pay | Pre-request tạo đơn mới và gán status = PREPARING | 1. Pre-request tạo đơn chưa chế biến (PREPARING)<br>2. Gửi PUT thanh toán đơn<br>3. Kiểm tra bắt lỗi trạng thái | Headers: Bearer {token}<br>Body: `{"paymentMethod": "CASH"}` | Status: 400 Bad Request<br>Báo lỗi: "phải ở trạng thái 'Chờ phục vụ' mới có thể thanh toán". | HTTP 400 Bad Request. Báo lỗi trạng thái đơn không hợp lệ. | **PASS** |
| **TC_EP_PAY_05** | Payment | Từ chối thanh toán lại cho đơn hàng đã PAID | EQ_PST2 (Invalid) | PUT | /api/orders/{{order_id}}/pay | Pre-request đảm bảo đơn {{order_id}} đã thanh toán (PAID) | 1. Pre-request đảm bảo đơn đã PAID<br>2. Gửi lại request PUT thanh toán<br>3. Kiểm tra chặn thanh toán trùng | Headers: Bearer {token}<br>Body: `{"paymentMethod": "CASH"}` | Status: 400 Bad Request<br>Báo lỗi: "Đơn hàng này đã được thanh toán trước đó". | HTTP 400 Bad Request. Báo lỗi đơn đã được thanh toán trước đó. | **PASS** |
| **TC_EP_PAY_06** | PayOS Webhook | Xử lý Webhook PayOS khi giao dịch bị hủy (code = '01'), kiểm tra đơn giữ UNPAID | EQ_WB2 (Invalid) | POST | /api/payos/webhook | Webhook nhận tín hiệu hủy giao dịch từ PayOS | 1. Gửi POST /api/payos/webhook với code = '01'<br>2. Kiểm tra phản hồi Webhook 200<br>3. Gửi GET kiểm tra đơn giữ UNPAID | Headers: Content-Type: application/json<br>Body: `{"code": "01", "desc": "User Cancelled", "data": {"orderCode": 999999}}` | Status: 200 OK<br>message: 'Success', đơn hàng không bị chuyển sang PAID (vẫn UNPAID). | HTTP 200 OK. Ghi nhận hủy an toàn và đơn giữ UNPAID. | **PASS** |
| **TC_EP_PAY_07** | PayOS | Từ chối tạo link thanh toán khi số tiền dưới mức tối thiểu (amount < 1.000 VNĐ) | EQ_AMT2 (Invalid) | POST | /api/payos/create-payment-link | Có auth token hợp lệ | 1. Gửi POST /api/payos/create-payment-link với amount = 500<br>2. Kiểm tra bắt lỗi hạn mức | Headers: Bearer {token}<br>Body: `{"amount": 500}` | Status: 400 Bad Request<br>Báo lỗi số tiền dưới mức tối thiểu 1.000 VNĐ. | HTTP 400 Bad Request. Chặn giao dịch dưới hạn mức tối thiểu. | **PASS** |
| **TC_EP_PAY_08** | PayOS | Từ chối tạo link thanh toán khi số tiền vượt hạn mức tối đa (amount > 500.000.000 VNĐ) | EQ_AMT3 (Invalid) | POST | /api/payos/create-payment-link | Có auth token hợp lệ | 1. Gửi POST /api/payos/create-payment-link với amount = 600.000.000<br>2. Kiểm tra bắt lỗi hạn mức | Headers: Bearer {token}<br>Body: `{"amount": 600000000}` | Status: 400 Bad Request<br>Báo lỗi số tiền vượt quá hạn mức tối đa 500.000.000 VNĐ. | HTTP 400 Bad Request. Chặn giao dịch vượt hạn mức tối đa. | **PASS** |
| **TC_EP_PAY_09** | Payment | Từ chối thanh toán khi phương thức thanh toán không được hỗ trợ (paymentMethod = 'BITCOIN') | EQ_MTH2 (Invalid) | PUT | /api/orders/{{order_id}}/pay | Có auth token hợp lệ | 1. Gửi PUT thanh toán đơn với phương thức BITCOIN<br>2. Kiểm tra bắt lỗi phương thức | Headers: Bearer {token}<br>Body: `{"paymentMethod": "BITCOIN"}` | Status: 400 Bad Request<br>Báo lỗi phương thức thanh toán không hỗ trợ. | HTTP 400 Bad Request. Từ chối phương thức thanh toán không hợp lệ. | **PASS** |

---

## 4. TỔNG KẾT
* **Công cụ thực thi:** Postman Collection Runner (Bộ kịch bản tự động hóa Pre-request & Assertions).
* **Độ bao phủ:** Bao phủ đầy đủ **11/11 lớp phân hoạch tương đương** với **9 Test Cases**.
* **Đánh giá chất lượng:** Hệ thống kiểm tra chặt chẽ quy trình thanh toán tiền mặt (Cash) và cổng trực tuyến PayOS Webhook, bảo đảm an toàn dữ liệu, chống thanh toán trùng lặp, kiểm soát trạng thái đơn trước/sau thanh toán và bắt lỗi nghiêm ngặt với các trường hợp đầu vào không hợp lệ.
