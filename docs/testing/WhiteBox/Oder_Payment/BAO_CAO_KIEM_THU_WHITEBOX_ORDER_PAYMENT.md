# BÁO CÁO KẾT QUẢ KIỂM THỬ HỘP TRẮNG (WHITE-BOX TESTING)
## MODULE: ORDER & PAYMENT (QUẢN LÝ ĐƠN HÀNG & THANH TOÁN)

---

## 1. THÔNG TIN CHUNG
* **Tên dự án:** Hệ thống Đặt món & Quản lý Nhà hàng (Backend AppDatMon)
* **Module phụ trách:** Quản lý Đơn hàng & Thanh toán (`Order & Payment`)
* **Kỹ thuật kiểm thử:** Kiểm thử hộp trắng (White-box Testing) kết hợp:
  * **Statement Coverage (C0):** Đạt 85.40%
  * **Branch Coverage (C1):** Đạt 80.00%
  * **Functions Coverage:** Đạt 95.00%
  * **Lines Coverage:** Đạt 86.87%
* **Công cụ thực thi:** Jest Framework v30, Node.js v20+
* **Kết quả:** **100% PASS (35 / 35 Test Cases)**

---

## 2. KẾT QUẢ ĐO LƯỜNG ĐỘ BAO PHỦ MÃ NGUỒN (CODE COVERAGE)

```text
--------------------|---------|----------|---------|---------|
File                | % Stmts | % Branch | % Funcs | % Lines |
--------------------|---------|----------|---------|---------|
All files           |   85.40 |    80.00 |   95.00 |   86.87 |
 orderController.js |   83.10 |    87.87 |   92.30 |   83.68 |
 payosController.js |   89.41 |    68.18 |  100.00 |   92.50 |
--------------------|---------|----------|---------|---------|

=============================== Coverage summary ===============================
Statements   : 85.40% ( 199/233 )
Branches     : 80.00% ( 88/110 )
Functions    : 95.00% ( 19/20 )
Lines        : 86.87% ( 192/221 )
================================================================================

Test Suites: 3 passed, 3 total
Tests:       49 passed, 49 total (13 BVA + 35 White-box + 1 Integration)
Time:        1.446 s
```

---

## 3. DANH SÁCH 35 TEST CASE WHITE-BOX CHI TIẾT (KHỚP 1-1 VỚI FILE EXCEL & CODE)

### A. Order Controller (`orderController.js` - 25 Test Cases):
* **`TC_WB_01`**: Tạo đơn hàng khi mảng món ăn rỗng `[]` HTTP 400.
* **`TC_WB_02`**: Tạo đơn hàng khi trường `items` bị null hoặc undefined HTTP 400.
* **`TC_WB_03`**: Tạo đơn khi Product không tồn tại HTTP 400.
* **`TC_WB_04`**: Xử lý món có ghi chú và món không có ghi chú HTTP 201.
* **`TC_WB_05`**: Khách đủ điểm thưởng, trừ điểm thành công Giảm giá, HTTP 201.
* **`TC_WB_06`**: Khách không đủ điểm thưởng để áp dụng Báo lỗi, HTTP 400.
* **`TC_WB_07`**: Không tìm thấy User trong DB khi dùng điểm  Bỏ qua giảm giá, HTTP 201.
* **`TC_WB_08`**: Giảm giá lớn hơn tổng tiền  Chặn không âm (`finalPrice = 0`), HTTP 201.
* **`TC_WB_09`**: Tạo đơn có bàn  Cập nhật bàn sang `OCCUPIED`, HTTP 201.
* **`TC_WB_10`**: Tạo đơn mang về không có bàn  Không cập nhật bàn, HTTP 201.
* **`TC_WB_11`**: Thanh toán đơn lẻ khi đơn đã trả trước đó $ Chặn thanh toán lại, HTTP 400.
* **`TC_WB_12`**: Thanh toán đơn lẻ khi món đang nấu (`PREPARING`)  Chặn thanh toán, HTTP 400.
* **`TC_WB_13`**: Thanh toán đơn lẻ có bàn  Giải phóng bàn `AVAILABLE`, hoàn tất đặt chỗ, HTTP 200.
* **`TC_WB_14`**: Thanh toán đơn lẻ mang về  Cập nhật `PAID`, HTTP 200.
* **`TC_WB_15`**: Thanh toán tất cả đơn của bàn ăn thành công  Giải phóng bàn, HTTP 200.
* **`TC_WB_16`**: Lấy danh sách tất cả đơn hàng không có query filter  HTTP 200.
* **`TC_WB_17`**: Lấy danh sách đơn hàng có lọc đồng thời `status` và `paymentStatus`  HTTP 200.
* **`TC_WB_18`**: Lấy chi tiết đơn hàng theo ID hợp lệ HTTP 200.
* **`TC_WB_19`**: Lấy chi tiết đơn hàng khi ID không tồn tại  HTTP 404.
* **`TC_WB_20`**: Cập nhật trạng thái chế biến của đơn hàng thành công  HTTP 200.
* **`TC_WB_21`**: Cập nhật trạng thái đơn hàng khi ID không tồn tại  HTTP 404.
* **`TC_WB_22`**: Xóa đơn hàng thành công khi đơn ở trạng thái hợp lệ HTTP 200.
* **`TC_WB_23`**: Xóa đơn hàng khi ID không tồn tại  HTTP 404.
* **`TC_WB_24`**: Lấy danh sách đơn hàng hiện tại theo bàn ăn  HTTP 200.
* **`TC_WB_25`**: Lấy lịch sử đơn hàng của người dùng đăng nhập  HTTP 200.

### B. PayOS Controller (`payosController.js` - 10 Test Cases):
* **`TC_WB_26`**: Tạo link thanh toán khi thiếu cả orderId lẫn tableId  HTTP 400.
* **`TC_WB_27`**: Tạo link PayOS cho đơn lẻ và lưu mã `[PAYOS:xxx]` vào ghi chú  HTTP 200.
* **`TC_WB_28`**: Tạo link PayOS gộp cho nhiều đơn theo bàn ăn  HTTP 200.
* **`TC_WB_29`**: Xử lý ngoại lệ khi cổng PayOS SDK gặp sự cố kết nối  HTTP 500.
* **`TC_WB_30`**: Kiểm tra trạng thái khi orderId không tồn tại  HTTP 404.
* **`TC_WB_31`**: Kiểm tra trạng thái khi đơn đã thanh toán trong DB  Trả về `PAID` ngay (HTTP 200).
* **`TC_WB_32`**: Đồng bộ trạng thái `PAID` từ PayOS và giải phóng bàn ăn  HTTP 200.
* **`TC_WB_33`**: Webhook nhận callback code 00 cập nhật đơn `PAID` và giải phóng bàn  HTTP 200.
* **`TC_WB_34`**: Webhook nhận thông báo giao dịch thất bại code != 00  HTTP 200 an toàn.
* **`TC_WB_35`**: Kiểm tra các route tiện ích `debugPayOS`, `paymentSuccess`, `paymentCancel`  HTTP 200.

---

## 4. TỔNG KẾT
Toàn bộ 35 Test Case White-box đã được kiểm chứng tự động bằng Jest Framework, kết quả 100% PASS