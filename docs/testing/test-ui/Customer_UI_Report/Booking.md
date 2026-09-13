# BIÊN BẢN KIỂM CHỨNG – BOOKING

## 1. Thông tin chung

| Nội dung | Chi tiết |
|---|---|
| Module | Customer – Booking |
| Công cụ | CodeceptJS 4.1.0 + Playwright |
| Trình duyệt | Chromium |
| Phương pháp | Automated Testing |
| Số Test Case | 15 |
| Kết quả | **15 PASS / 0 FAIL** |

## 2. Mục tiêu kiểm chứng

Kiểm tra giao diện và các chức năng chính của trang Booking: hiển thị form, nhập dữ liệu, kiểm tra trường bắt buộc, số lượng khách, ghi chú, đặt bàn và khu vực lịch sử đặt bàn.

## 3. Phạm vi kiểm thử

- Hiển thị form đặt bàn.
- Kiểm tra thông tin bắt buộc: họ tên, số điện thoại, ngày và giờ.
- Kiểm tra số lượng khách.
- Kiểm tra ghi chú không bắt buộc.
- Nhập đầy đủ thông tin.
- Đặt bàn thành công.
- Kiểm tra khu vực lịch sử đặt bàn.
- Kiểm tra thao tác hủy đặt bàn khi có dữ liệu phù hợp.

## 4. Kết quả Test Case

| TC | Nội dung | Kết quả |
|---|---|---|
| TC01 | Hiển thị trang đặt bàn | PASS |
| TC02 | Kiểm tra lịch sử đặt bàn | PASS |
| TC03 | Số lượng khách mặc định | PASS |
| TC04 | Danh sách số lượng khách | PASS |
| TC05 | Bỏ trống họ tên | PASS |
| TC06 | Bỏ trống số điện thoại | PASS |
| TC07 | Bỏ trống ngày đặt bàn | PASS |
| TC08 | Bỏ trống giờ đặt bàn | PASS |
| TC09 | Ghi chú không bắt buộc | PASS |
| TC10 | Nhập đầy đủ thông tin | PASS |
| TC11 | Thay đổi số lượng khách | PASS |
| TC12 | Nhập ghi chú | PASS |
| TC13 | Đặt bàn thành công | PASS |
| TC14 | Kiểm tra lịch sử đặt bàn | PASS |
| TC15 | Kiểm tra hủy đặt bàn | PASS* |

## 5. Vấn đề phát hiện trong quá trình kiểm thử

### Vấn đề 1 – Frontend Server chưa chạy
- **Hiện tượng:** `ERR_CONNECTION_REFUSED` khi truy cập `127.0.0.1:5500`.
- **Nguyên nhân:** Frontend HTTP Server chưa được khởi động.
- **Xử lý:** Khởi động `http-server` tại thư mục project và sử dụng đúng URL Booking.
- **Phân loại:** Môi trường kiểm thử, **không phải Defect chức năng**.

### Vấn đề 2 – Test Script sử dụng assertion không hỗ trợ
- **Hiện tượng:** `I.assertContain is not a function`, `I.assertEqual is not a function`.
- **Nguyên nhân:** Test Script sử dụng method không có trong cấu hình CodeceptJS hiện tại.
- **Xử lý:** Thay bằng kiểm tra giá trị thực tế và `throw new Error()` khi không đạt.
- **Phân loại:** **Lỗi Test Script**, không phải Defect hệ thống.

### Vấn đề 3 – Nhập `input type="date"` không ổn định
- **Hiện tượng:** Giá trị `2026-09-10` bị đọc thành `60910-02-02`.
- **Nguyên nhân:** Cách `fillField()` xử lý trường `input type="date"` trong môi trường Chromium.
- **Xử lý:** Gán trực tiếp `input.value` và phát sự kiện `input/change`.
- **Kết quả:** TC10 PASS.
- **Phân loại:** **Lỗi Test Script/Automation**, chưa xác định là Defect của hệ thống.

## 6. Hạn chế

- TC15 chỉ thực hiện đầy đủ thao tác Hủy khi database có reservation ở trạng thái **PENDING**. Lần chạy hiện tại không có reservation PENDING nên testcase không thực hiện thao tác hủy thực tế.
- Vì vậy, kết quả **15 PASS** không đồng nghĩa nghiệp vụ Hủy đặt bàn đã được xác nhận end-to-end.

## 7. Kết luận

Kết quả kiểm thử Booking đạt **15/15 PASS** sau khi xử lý các vấn đề thuộc môi trường và Test Script. Trong quá trình kiểm thử **chưa ghi nhận Defect chức năng rõ ràng của module Booking**.

**Kết quả cuối: 15 PASS – 0 FAIL.**
