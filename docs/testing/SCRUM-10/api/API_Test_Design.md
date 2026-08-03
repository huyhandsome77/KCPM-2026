# API Test Design

## 1. Giới thiệu

### 1.1 Mục đích

Tài liệu này mô tả phạm vi kiểm thử các REST API của hệ thống Website đặt món nhà hàng.

Mục tiêu là đảm bảo:

* API hoạt động đúng theo tài liệu thiết kế và thực tế triển khai.
* Dữ liệu Request và Response chính xác.
* Kiểm tra xác thực (Authentication) và phân quyền (Authorization).
* API xử lý đầy đủ các trường hợp hợp lệ và không hợp lệ.
* API trả về đúng HTTP Status Code.
* API đảm bảo tính bảo mật và tính toàn vẹn dữ liệu.

---

## 2. Phạm vi kiểm thử

Bao gồm các nhóm API:

* Authentication API (`/api/auth`)
* User API (`/api/users`)
* Category API (`/api/categories`)
* Product API (`/api/products`)
* Restaurant Table API (`/api/tables`)
* Reservation API (`/api/reservations`)
* Cart API (`/api/cart`)
* Order API (`/api/orders`)
* Payment API (`/api/payments`, `/api/momo`, `/api/payos`)
* Review API (`/api/reviews`)
* Point API (`/api/points`)
* Statistics API (`/api/stats`)
* Upload API (`/api/upload`)

Không bao gồm:

* Hiệu năng (Performance Testing)
* Kiểm thử chịu tải (Load Testing)
* Kiểm thử Database trực tiếp

---

## 3. Môi trường kiểm thử

### Backend

* Node.js + Express + Sequelize ORM

### Database

* MySQL Server

### Authentication

* JWT (JSON Web Token)

### Công cụ

* Postman / Bruno / Swagger UI (`/api-docs`)

---

## 4. Tiêu chuẩn kiểm thử

Mỗi API cần kiểm tra các nội dung sau:

### 4.1 Request Validation

* Thiếu dữ liệu bắt buộc
* Sai kiểu dữ liệu
* Dữ liệu vượt giới hạn
* Giá trị không hợp lệ

---

### 4.2 Response Validation

Kiểm tra:

* Status Code
* Response Message
* Response Body
* Response Structure

---

### 4.3 Authentication

* Có JWT hợp lệ
* Không có JWT Token (Header Authorization)
* JWT hết hạn
* JWT sai chữ ký
* JWT bị biến đổi / không hợp lệ

---

### 4.4 Authorization

Kiểm tra theo từng Role:

* Customer
* Staff
* Kitchen
* Admin

---

### 4.5 Error Handling

Kiểm tra:

* 400 Bad Request
* 401 Unauthorized
* 403 Forbidden
* 404 Not Found
* 409 Conflict
* 500 Internal Server Error

---

## 5. Danh sách API cần kiểm thử

### 5.1 Authentication API

#### POST /api/auth/register

Kiểm tra:

* Đăng ký thành công
* Email trùng
* Username trùng
* Password không hợp lệ (ngắn hơn 6 ký tự)
* Thiếu dữ liệu bắt buộc
* Sai định dạng Email

#### POST /api/auth/login

Kiểm tra:

* Login thành công (trả về Token và User info)
* Sai Username
* Sai Password
* Thiếu Username / Password
* JWT được sinh thành công và có cấu trúc chuẩn

#### GET /api/auth/test

Kiểm tra:

* Endpoint test phản hồi thành công (200 OK)

---

### 5.2 User API

#### GET /api/users

Kiểm tra:

* Admin xem danh sách toàn bộ User thành công
* Customer / Staff / Kitchen truy cập bị từ chối (403 Forbidden)

#### GET /api/users/profile

Kiểm tra:

* Lấy thông tin cá nhân của User đang đăng nhập thành công
* Truy cập không có Token trả về 401 Unauthorized

#### PUT /api/users/profile

Kiểm tra:

* User tự cập nhật thông tin cá nhân thành công
* Đổi email trùng với user khác trả về lỗi

#### GET /api/users/{id}

Kiểm tra:

* Admin xem chi tiết User theo ID thành công
* User ID không tồn tại (404 Not Found)
* Không đủ quyền truy cập (403 Forbidden)

#### POST /api/users

Kiểm tra:

* Admin tạo người dùng mới thành công (gán Role)
* Thiếu dữ liệu bắt buộc / Email trùng

#### PUT /api/users/{id}

Kiểm tra:

* Admin cập nhật thông tin User thành công
* User ID không tồn tại
* Trùng Email / Username với tài khoản khác

#### DELETE /api/users/{id}

Kiểm tra:

* Admin xóa User thành công
* Không đủ quyền (403 Forbidden)
* User ID không tồn tại (404 Not Found)

---

### 5.3 Category API

#### GET /api/categories

Kiểm tra:

* Lấy danh sách danh mục (public / authenticated)
* Trả về danh sách rỗng khi chưa có dữ liệu

#### GET /api/categories/{id}

Kiểm tra:

* Lấy chi tiết danh mục theo ID
* Category ID không tồn tại (404 Not Found)

#### POST /api/categories

Kiểm tra:

* Admin tạo danh mục mới thành công
* Thiếu tên danh mục (Name)
* Tên danh mục bị trùng
* Customer / Staff không có quyền tạo (403 Forbidden)

#### PUT /api/categories/{id}

Kiểm tra:

* Admin cập nhật danh mục thành công
* Category ID không tồn tại
* Thiếu dữ liệu

#### DELETE /api/categories/{id}

Kiểm tra:

* Admin xóa danh mục thành công
* Category ID không tồn tại
* Customer / Staff không có quyền xóa

---

### 5.4 Product API

#### GET /api/products

Kiểm tra:

* Lấy danh sách sản phẩm thành công
* Search sản phẩm theo tên
* Filter sản phẩm theo Category
* Phân trang danh sách sản phẩm

#### GET /api/products/{id}

Kiểm tra:

* Lấy thông tin sản phẩm thành công
* Product ID không tồn tại (404 Not Found)

#### POST /api/products

Kiểm tra:

* Admin thêm sản phẩm thành công
* Thiếu thông tin giá, tên sản phẩm, danh mục
* Giá sản phẩm không hợp lệ (âm hoặc không phải số)
* Không đủ quyền truy cập (403 Forbidden)

#### PUT /api/products/{id}

Kiểm tra:

* Admin cập nhật thông tin sản phẩm
* Product ID không tồn tại
* Không đủ quyền truy cập

#### DELETE /api/products/{id}

Kiểm tra:

* Admin xóa sản phẩm thành công
* Product ID không tồn tại
* Không đủ quyền truy cập

---

### 5.5 Restaurant Table API

#### GET /api/tables

Kiểm tra:

* Xem danh sách tất cả các bàn ăn
* Lọc/kiểm tra trạng thái bàn (Trống, Đang sử dụng, Đã đặt)

#### GET /api/tables/qr/{qrCode}

Kiểm tra:

* Khách hàng quét mã QR lấy thông tin bàn ăn thành công
* Mã QR không hợp lệ / không tồn tại (404 Not Found)

#### POST /api/tables/bulk

Kiểm tra:

* Tạo hàng loạt bàn ăn (Admin/Staff)
* Dữ liệu tạo không hợp lệ

#### PUT /api/tables/{id}/status

Kiểm tra:

* Cập nhật trạng thái bàn ăn (Trống / Đang dùng / Đã đặt)
* Bàn không tồn tại

---

### 5.6 Reservation API

#### POST /api/reservations

Kiểm tra:

* Đặt bàn mới thành công
* Đặt bàn vào khung giờ bàn đã có người đặt
* Thiếu dữ liệu (số điện thoại, ngày giờ, số lượng người)
* Ngày giờ đặt bàn trong quá khứ

#### GET /api/reservations

Kiểm tra:

* Xem danh sách đặt bàn
* Admin / Staff xem tất cả đặt bàn

#### GET /api/reservations/my-reservations

Kiểm tra:

* Customer xem danh sách các lần đặt bàn của mình
* Không có Token trả về 401 Unauthorized

#### PUT /api/reservations/{id}/check-in

Kiểm tra:

* Nhận bàn (Check-in) cho khách đặt trước
* Reservation ID không tồn tại / đã check-in trước đó

#### PUT /api/reservations/{id}/cancel

Kiểm tra:

* Hủy đặt bàn thành công
* Hủy lịch đặt không tồn tại hoặc đã hoàn thành

---

### 5.7 Cart API

#### GET /api/cart

Kiểm tra:

* Lấy danh sách món trong giỏ hàng
* Giỏ hàng rỗng
* Truy cập khi chưa đăng nhập

#### POST /api/cart

Kiểm tra:

* Thêm món ăn vào giỏ
* Thêm món đã có trong giỏ (tăng số lượng)
* Sản phẩm không tồn tại / đã ngừng bán

#### PUT /api/cart/{id}

Kiểm tra:

* Thay đổi số lượng sản phẩm trong giỏ
* Số lượng nhỏ hơn 1 (tự động xóa hoặc báo lỗi)

#### DELETE /api/cart/{id}

Kiểm tra:

* Xóa sản phẩm khỏi giỏ hàng thành công
* Sản phẩm không có trong giỏ

---

### 5.8 Order API

#### POST /api/orders

Kiểm tra:

* Đặt món thành công từ giỏ hàng / bàn ăn
* Đặt món khi chưa chọn bàn
* Đặt món với danh sách rỗng
* Đặt món khi không có Token (Guest order nếu hệ thống cho phép hoặc yêu cầu auth)

#### GET /api/orders

Kiểm tra:

* Staff/Admin lấy danh sách tất cả các đơn hàng
* Lọc đơn hàng theo trạng thái (Pending, Preparing, Completed, Cancelled)

#### GET /api/orders/my-orders

Kiểm tra:

* Customer xem danh sách đơn hàng của chính mình

#### GET /api/orders/{id}

Kiểm tra:

* Xem chi tiết đơn hàng theo ID
* Order ID không tồn tại

#### GET /api/orders/table/{tableId}

Kiểm tra:

* Lấy đơn hàng hiện tại của bàn ăn theo `tableId`

#### PUT /api/orders/{id}/status

Kiểm tra:

* Cập nhật trạng thái đơn hàng (Bếp/Staff chuyển trạng thái)
* Chuyển trạng thái không hợp lệ (vd: Cancelled -> Completed)

#### PUT /api/orders/{id}/pay

Kiểm tra:

* Thanh toán cho 1 đơn hàng cụ thể

#### PUT /api/orders/table/{tableId}/pay-all

Kiểm tra:

* Thanh toán gộp tất cả đơn hàng của bàn

#### DELETE /api/orders/{id}

Kiểm tra:

* Hủy đơn hàng (khi đơn còn ở trạng thái Pending)
* Hủy đơn đã chế biến/hoàn thành (không cho phép)

---

### 5.9 Payment API (MoMo & PayOS Gateway)

#### POST /api/momo/create

Kiểm tra:

* Tạo link thanh toán MoMo thành công
* Số tiền đơn hàng không hợp lệ

#### POST /api/momo/callback

Kiểm tra:

* Xử lý IPN callback từ MoMo khi thanh toán thành công
* Sai chữ ký (Signature) callback

#### POST /api/payos/create-payment-link

Kiểm tra:

* Tạo liên kết thanh toán qua PayOS cho đơn hàng
* Đơn hàng không tồn tại hoặc đã thanh toán

#### GET /api/payos/order-status/{orderId}

Kiểm tra:

* Kiểm tra trạng thái thanh toán đơn hàng PayOS

#### POST /api/payos/webhook

Kiểm tra:

* Webhook từ PayOS cập nhật tự động trạng thái đơn hàng

---

### 5.10 Review API

#### GET /api/reviews

Kiểm tra:

* Lấy danh sách đánh giá của nhà hàng/món ăn

#### POST /api/reviews

Kiểm tra:

* Gửi đánh giá mới thành công (Rating, Comment)
* Thiếu điểm số đánh giá (Rating)
* Đánh giá trùng lặp

#### DELETE /api/reviews/{id}

Kiểm tra:

* Admin xóa đánh giá không phù hợp
* Customer/Staff không đủ quyền xóa đánh giá của người khác

---

### 5.11 Point API

#### POST /api/points/add-points

Kiểm tra:

* Admin / Staff tích điểm cho khách hàng dựa trên hóa đơn thành công
* Khách hàng (Customer) không có quyền tự tích điểm (403 Forbidden)
* Truyền sai ID người dùng hoặc số điểm không hợp lệ

---

### 5.12 Statistics API

#### GET /api/stats

Kiểm tra:

* Admin xem thống kê doanh thu, số lượng đơn hàng, món ăn bán chạy
* Staff / Kitchen / Customer bị từ chối truy cập (403 Forbidden)

---

### 5.13 Upload API

#### POST /api/upload/image

Kiểm tra:

* Upload file hình ảnh hợp lệ (jpg, png, webp) thành công
* Upload file không phải hình ảnh (pdf, txt, exe) bị từ chối
* Kích thước file vượt quá giới hạn cho phép
* Không truyền file ảnh trong Request

---

## 6. Security Testing

Kiểm tra:

* SQL Injection trong tham số query và request body
* Cross Site Scripting (XSS) trong dữ liệu nhập vào
* Broken Authentication & Session Management
* Broken Authorization (Bypass phân quyền)
* IDOR (Insecure Direct Object Reference) trên các endpoint theo ID
* Invalid / Expired / Tampered JWT Token
* Header Authorization thiếu hoặc sai cấu trúc `Bearer <token>`

---

## 7. HTTP Status Code

API phải trả đúng mã lỗi chuẩn RESTful:

* `200 OK`: Truy vấn / cập nhật thành công
* `201 Created`: Tạo mới tài nguyên thành công
* `204 No Content`: Xóa thành công và không trả dữ liệu
* `400 Bad Request`: Request sai định dạng / thiếu trường bắt buộc
* `401 Unauthorized`: Chưa đăng nhập hoặc Token không hợp lệ
* `403 Forbidden`: Đã đăng nhập nhưng không có quyền thực hiện
* `404 Not Found`: Tài nguyên không tồn tại
* `409 Conflict`: Dữ liệu đã tồn tại (vd: trùng Email/Username)
* `500 Internal Server Error`: Lỗi hệ thống server backend

---

## 8. Tiêu chí hoàn thành

Module API được xem là hoàn thành khi:

* 100% Endpoint được thiết kế và thực thi Test Case.
* Tất cả Request Validation được kiểm tra.
* Tất cả Role được kiểm tra phân quyền.
* Các HTTP Status Code đúng theo thiết kế.
* Không còn lỗi Critical hoặc High.

---

## 9. Deliverables

Sau khi hoàn thành cần bàn giao:

* `API_Test_Design.md`
* `API_TestCases.xlsx`
* `Restaurant.postman_collection.json`
* `Test_Data.xlsx`
* `API_TestExecution.xlsx`
* `Bug_Report.xlsx` (nếu có)

### Số lượng Test Case dự kiến

* Authentication API: 20
* User API: 20
* Category API: 15
* Product API: 20
* Restaurant Table API: 15
* Reservation API: 15
* Cart API: 15
* Order API: 25
* Payment API (MoMo & PayOS): 15
* Review API: 10
* Point API: 10
* Statistics API: 10
* Upload API: 10

**Tổng: khoảng 200 Test Case.**
