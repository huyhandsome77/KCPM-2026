## Customer – Login / Logout

### 1. Mục tiêu
Kiểm chứng các luồng đăng nhập và đăng xuất của Customer, bao gồm dữ liệu hợp lệ, dữ liệu không hợp lệ và trường hợp bỏ trống thông tin.

### 2. Môi trường kiểm thử
- **Công cụ:** CodeceptJS v4.1.0 + Playwright
- **Browser:** Chromium
- **Module:** Customer
- **Test file:** `tests/customer/login_logout_test.js`

### 3. Các Test Case đã thực hiện

| ID | Trường hợp kiểm thử | Kết quả |
|---|---|---|
| TC01 | Đăng nhập thành công bằng Username | **PASS** |
| TC02 | Đăng nhập bằng Email | **PASS** |
| TC03 | Đăng nhập bằng số điện thoại | **PASS** |
| TC04 | Đăng nhập với mật khẩu sai | **PASS** |
| TC05 | Bỏ trống tài khoản | **PASS** |
| TC06 | Bỏ trống mật khẩu | **PASS** |
| TC07 | Bỏ trống toàn bộ thông tin | **PASS** |
| TC08 | Đăng xuất thành công | **PASS** |

### 4. Tổng hợp kết quả

| Tổng TC | PASS | FAIL | Tỷ lệ PASS |
|---:|---:|---:|---:|
| 8 | 8 | 0 | **100%** |

### 5. Vấn đề phát hiện trong quá trình kiểm thử
- Lần chạy đầu bị **FAIL do Web Server chưa khởi động** (`ERR_CONNECTION_REFUSED`). Sau khi khởi động server, test chạy bình thường.
- TC08 ban đầu không tìm thấy nút Logout do **selector không đúng**; đã điều chỉnh selector theo giao diện thực tế.
- TC05–TC07 ban đầu kiểm tra thông báo JavaScript không phù hợp với cơ chế **HTML5 `required` validation**; đã điều chỉnh testcase để kiểm tra trạng thái `invalid`.

### 6. Kết luận
- 8/8 Test Case đạt yêu cầu.
- Không phát hiện **bug chức năng Login/Logout** trong phạm vi kiểm thử.
- Các vấn đề phát hiện chủ yếu liên quan đến **môi trường và Test Case**, đã được khắc phục/điều chỉnh.
- Có thể tiếp tục kiểm thử mở rộng về dữ liệu biên, dữ liệu không hợp lệ, Session và bảo mật để tăng khả năng phát hiện lỗi.

