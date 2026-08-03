# Authentication Test Design

## 1. Giới thiệu

### 1.1 Mục đích

Tài liệu này mô tả phạm vi kiểm thử và các kịch bản kiểm thử (Test Scenario) cho chức năng **Authentication** của hệ thống Website đặt món nhà hàng.

Mục tiêu là đảm bảo:

* Người dùng có thể đăng ký tài khoản.
* Người dùng có thể đăng nhập vào hệ thống.
* Hệ thống xác thực đúng thông tin đăng nhập.
* JWT Token được tạo và sử dụng đúng.
* Người dùng có thể đăng xuất an toàn.
* Các lỗi xác thực được xử lý đúng theo yêu cầu.

---

## 2. Phạm vi kiểm thử

Bao gồm các chức năng:

* Đăng ký tài khoản
* Đăng nhập
* Đăng xuất
* JWT Authentication
* Session Management

Không bao gồm:

* Phân quyền (Authorization)
* Kiểm thử API CRUD
* Kiểm thử hiệu năng

---

## 3. Điều kiện tiên quyết

* Website hoạt động bình thường.
* Database đã có dữ liệu mẫu.
* Server Backend đang chạy.
* Có kết nối Internet.

Các tài khoản kiểm thử mặc định:

| Role     | Username             | Password |
| -------- | -------------------- | -------- |
| Customer | `customer@gmail.com` | `123456` |
| Staff    | `staff@gmail.com`    | `123456` |
| Kitchen  | `kitchen@gmail.com`  | `123456` |
| Admin    | `admin@gmail.com`    | `123456` |

---

## 4. Yêu cầu chức năng

### 4.1 Đăng ký

Hệ thống cho phép người dùng tạo tài khoản mới.

Thông tin bắt buộc:

* Họ tên
* Email
* Username
* Password
* Xác nhận Password

Quy tắc:

* Email không được trùng.
* Username không được trùng.
* Password từ 6 đến 10 ký tự.

---

### 4.2 Đăng nhập

Username:

* Không được để trống.
* Độ dài từ 3 đến 30 ký tự.

Password:

* Không được để trống.
* Độ dài từ 6 đến 10 ký tự.
* Phân biệt chữ hoa và chữ thường.

Khi đăng nhập thành công:

* Sinh JWT Token.
* Chuyển đến đúng Dashboard theo Role.
* Lưu phiên đăng nhập.

---

### 4.3 Đăng xuất

Khi Logout:

* JWT Token bị hủy phía Client.
* Người dùng quay về trang Login.
* Không thể truy cập các API yêu cầu xác thực.

---

### 4.4 JWT Validation

Sau khi Login thành công:

* Server trả JWT.
* JWT được gửi trong Header `Authorization: Bearer <token>`.
* JWT phải hợp lệ.
* JWT hết hạn phải trả về 401 Unauthorized.

---

## 5. Test Scenarios

### 5.1 UI Testing

#### Login Screen

* Kiểm tra logo hiển thị đúng.
* Kiểm tra tiêu đề Login.
* Kiểm tra Placeholder Username.
* Kiểm tra Placeholder Password.
* Kiểm tra Password hiển thị dạng ký tự ẩn.
* Kiểm tra Button Login.
* Kiểm tra Button đổi màu khi Hover.
* Kiểm tra Button đổi màu khi Click.
* Kiểm tra Tab Order.
* Kiểm tra Enter thực hiện Login.
* Kiểm tra Responsive trên Desktop.
* Kiểm tra Responsive trên Mobile.

---

### 5.2 Functional Testing

#### Register

* Đăng ký thành công.
* Email đã tồn tại.
* Username đã tồn tại.
* Password nhỏ hơn 6 ký tự.
* Password lớn hơn 10 ký tự.
* Password và Confirm Password không khớp.
* Thiếu Email.
* Thiếu Username.
* Thiếu Password.
* Thiếu Họ tên.

#### Login

* Login thành công.
* Sai Username.
* Sai Password.
* Sai Username và Password.
* Username rỗng.
* Password rỗng.
* Username nhỏ hơn 3 ký tự.
* Username lớn hơn 30 ký tự.
* Password nhỏ hơn 6 ký tự.
* Password lớn hơn 10 ký tự.
* Username chứa khoảng trắng đầu hoặc cuối.
* Password chứa khoảng trắng đầu hoặc cuối.
* Username chứa ký tự đặc biệt.
* Password chứa ký tự đặc biệt.

#### Logout

* Logout thành công.
* Logout khi Session hết hạn.
* Logout nhiều lần.
* Truy cập lại bằng nút Back sau Logout.

---

### 5.3 JWT Testing

* JWT được tạo sau Login.
* JWT có cấu trúc hợp lệ.
* JWT gửi đúng Authorization Header.
* Không gửi JWT.
* JWT hết hạn.
* JWT bị chỉnh sửa.
* JWT sai chữ ký.
* JWT của tài khoản khác.
* JWT sau khi Logout.

---

### 5.4 Security Testing

* SQL Injection tại Username.
* SQL Injection tại Password.
* XSS tại Username.
* XSS tại Password.
* Password không xuất hiện trên URL.
* Password không lưu dưới dạng Plain Text.
* Password không lưu trong Cookie bỏ ngỏ.
* Chặn Brute Force Login.

---

### 5.5 Session Testing

* Login trên nhiều Tab.
* Login trên nhiều Browser.
* Login hai tài khoản trên cùng Browser.
* Refresh trình duyệt.
* Session Timeout.
* Logout tại một Tab.
* Kiểm tra thời gian hết hạn JWT.

---

## 6. Tiêu chí hoàn thành

Authentication được xem là đạt khi:

* Tất cả Test Case được thực thi.
* Không còn lỗi mức Critical hoặc High.
* JWT hoạt động đúng.
* Session hoạt động đúng.
* Không có lỗi phân quyền liên quan đến Authentication.
* Không phát hiện lỗ hổng bảo mật nghiêm trọng trong quá trình kiểm thử.

---

## 7. Deliverables

Sau khi hoàn thành module Authentication cần bàn giao:

* `Authentication_Test_Design.md`
* `Authentication_TestCases.xlsx`
* `Authentication_TestExecution.xlsx`
* `Bug_Report.xlsx` (nếu phát hiện lỗi)

### Số lượng Test Case dự kiến

* UI: 12
* Functional: 24
* JWT: 9
* Security: 8
* Session: 7

**Tổng: khoảng 60 Test Case.**
