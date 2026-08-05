# Authorization Test Design

## 1. Giới thiệu

### 1.1 Mục đích

Tài liệu này mô tả phạm vi kiểm thử phân quyền (Authorization) của hệ thống Website đặt món nhà hàng.

Mục tiêu là đảm bảo mỗi người dùng chỉ được phép truy cập các chức năng và API đúng với vai trò (Role) được cấp, đồng thời hệ thống ngăn chặn mọi truy cập trái phép.

---

## 2. Phạm vi kiểm thử

Bao gồm:

* Phân quyền giao diện (UI Authorization)
* Phân quyền API (API Authorization)
* Phân quyền theo Role (Customer, Staff, Kitchen, Admin)
* Truy cập trực tiếp bằng URL (URL Authorization)
* Truy cập tài nguyên sau khi đăng nhập
* Kiểm tra mã lỗi HTTP (401 Unauthorized, 403 Forbidden)

Không bao gồm:

* Authentication (Đăng nhập, JWT Validation)
* Hiệu năng
* Kiểm thử cơ sở dữ liệu

---

## 3. Danh sách Role

Hệ thống gồm 4 vai trò:

| Role     | Mô tả                                             |
| -------- | ------------------------------------------------- |
| Customer | Khách hàng sử dụng website để đặt món và đặt bàn  |
| Staff    | Nhân viên phục vụ, quản lý đơn hàng và thanh toán |
| Kitchen  | Nhân viên bếp, tiếp nhận và xử lý món ăn          |
| Admin    | Quản trị viên, quản lý toàn bộ hệ thống           |

---

## 4. Ma trận phân quyền

| Chức năng               | Customer | Staff | Kitchen | Admin |
| ----------------------- | :------: | :---: | :-----: | :---: |
| Đăng nhập               |    ✓     |   ✓   |    ✓    |   ✓   |
| Xem thực đơn / Sản phẩm |    ✓     |   ✓   |    ✓    |   ✓   |
| Quét QR Bàn             |    ✓     |   ✓   |    ✗    |   ✓   |
| Đặt món                 |    ✓     |   ✓   |    ✗    |   ✓   |
| Đặt bàn / Lịch hẹn      |    ✓     |   ✓   |    ✗    |   ✓   |
| Đánh giá món ăn         |    ✓     |   ✗   |    ✗    |   ✓   |
| Quản lý đơn hàng        |    ✗     |   ✓   |    ✗    |   ✓   |
| Xác nhận thanh toán     |    ✗     |   ✓   |    ✗    |   ✓   |
| Quản lý bàn             |    ✗     |   ✓   |    ✗    |   ✓   |
| Quản lý tích điểm       |    ✗     |   ✓   |    ✗    |   ✓   |
| Danh sách món cần làm   |    ✗     |   ✗   |    ✓    |   ✓   |
| Cập nhật trạng thái món |    ✗     |   ✗   |    ✓    |   ✓   |
| Quản lý sản phẩm        |    ✗     |   ✗   |    ✗    |   ✓   |
| Quản lý danh mục        |    ✗     |   ✗   |    ✗    |   ✓   |
| Quản lý người dùng      |    ✗     |   ✗   |    ✗    |   ✓   |
| Upload hình ảnh         |    ✗     |   ✗   |    ✗    |   ✓   |
| Xem thống kê doanh thu  |    ✗     |   ✗   |    ✗    |   ✓   |

---

## 5. Test Scenarios

### 5.1 Customer

#### Cho phép

* Truy cập Trang chủ khách hàng.
* Xem danh sách món ăn & danh mục.
* Quét mã QR tại bàn.
* Tạo đơn đặt món / thêm vào giỏ hàng.
* Đặt bàn.
* Gửi đánh giá món ăn.
* Xem lịch sử đơn hàng & lịch sử đặt bàn cá nhân.

#### Không cho phép

* Truy cập Dashboard Admin (`/admin`).
* Truy cập Dashboard Staff.
* Truy cập Dashboard Kitchen.
* CRUD Product, Category, User, Restaurant Table.
* Upload hình ảnh qua `/api/upload/image`.
* Xem thống kê doanh thu.

---

### 5.2 Staff

#### Cho phép

* Xem danh sách tất cả đơn hàng.
* Cập nhật trạng thái đơn hàng & xác nhận thanh toán.
* Quản lý trạng thái bàn ăn (Trống / Đang dùng / Đã đặt).
* Thực hiện tích điểm thủ công cho khách hàng.

#### Không cho phép

* CRUD User, Product, Category.
* Xem thống kê doanh thu hệ thống.
* Xóa hoặc quản lý đánh giá của khách hàng.
* Upload ảnh hệ thống (nếu giới hạn cho Admin).

---

### 5.3 Kitchen

#### Cho phép

* Xem danh sách món cần chế biến theo đơn hàng.
* Cập nhật trạng thái món (Đang chuẩn bị / Hoàn thành).
* Xem chi tiết đơn hàng chế biến.

#### Không cho phép

* Nhận thanh toán đơn hàng.
* Quản lý người dùng, sản phẩm, danh mục.
* Xem thống kê báo cáo.
* Quản lý tích điểm hoặc đặt bàn.

---

### 5.4 Admin

Admin có toàn quyền:

* Quản lý danh mục & sản phẩm (CRUD).
* Quản lý tài khoản người dùng và phân quyền (CRUD).
* Quản lý bàn ăn & lịch đặt bàn.
* Quản lý đơn hàng & thanh toán.
* Upload hình ảnh sản phẩm.
* Xem thống kê báo cáo doanh thu & hiệu suất.
* Access tất cả REST API endpoints.

---

## 6. UI Authorization Testing

Kiểm tra hiển thị giao diện theo từng Role:

### Customer

* Không hiển thị menu Admin, Staff, Kitchen.

### Staff

* Không hiển thị menu Admin.
* Không hiển thị giao diện Kitchen.

### Kitchen

* Không hiển thị menu Admin và Staff.

### Admin

* Hiển thị đầy đủ tất cả menu và bảng điều khiển quản trị.

---

## 7. API Authorization Testing

Kiểm tra truy cập API theo từng Role:

### Customer

* Không gọi được API Admin (`/api/users`, `/api/stats`, `POST /api/products`).
* Không gọi được API Staff/Kitchen quản lý.

**Kết quả mong đợi:** HTTP 403 Forbidden.

### Staff

* Không gọi được API Admin (`/api/users`, `/api/stats`).
* Không thực hiện được POST/PUT/DELETE trên Product và Category.

**Kết quả mong đợi:** HTTP 403 Forbidden.

### Kitchen

* Không gọi được API Admin hoặc API thanh toán/tích điểm.

**Kết quả mong đợi:** HTTP 403 Forbidden.

### Admin

* Gọi được tất cả các API thành công.

**Kết quả mong đợi:** HTTP 200 OK / 201 Created / 204 No Content.

---

## 8. URL Authorization Testing

Kiểm tra truy cập trực tiếp bằng cách gõ URL trình duyệt:

* `/admin`
* `/admin/users.html`
* `/admin/products.html`
* `/staff/orders`
* `/kitchen/orders`

Nếu người dùng không đủ quyền hoặc chưa đăng nhập:

* Tự động chuyển hướng về trang Login hoặc 403 Access Denied.
* Trả về thông báo không có quyền truy cập.

---

## 9. Security Authorization Testing

Kiểm tra các kịch bản an ninh mạng:

* Thử đổi URL để truy cập đường dẫn quản trị.
* Thay đổi Claim Role trong JWT Token.
* Sử dụng Token của người dùng này để truy cập tài nguyên của người dùng khác (IDOR).
* Truy cập API khi Token đã hết hạn.
* Truy cập API không truyền Header Authorization.

**Kết quả mong đợi:**

* Hệ thống từ chối truy cập.
* Không lộ thông tin nhạy cảm.
* Trả về mã lỗi HTTP 401 Unauthorized hoặc 403 Forbidden.

---

## 10. Tiêu chí hoàn thành

Module Authorization được xem là đạt khi:

* 100% Role được phân quyền chính xác theo ma trận.
* Không có tài khoản nào truy cập được chức năng vượt thẩm quyền.
* Không còn lỗi mức Critical hoặc High liên quan đến Authorization.
* Tất cả API trả đúng mã lỗi 401/403 khi truy cập trái phép.

---

## 11. Deliverables

Sau khi hoàn thành module Authorization cần bàn giao:

* `Authorization_Test_Design.md`
* `Authorization_TestCases.xlsx`
* `Authorization_TestExecution.xlsx`
* `Bug_Report.xlsx` (nếu phát hiện lỗi)

### Số lượng Test Case dự kiến

* UI Authorization: 10
* Functional Authorization: 20
* API Authorization: 20
* Security Authorization: 10

**Tổng: khoảng 60 Test Case.**
