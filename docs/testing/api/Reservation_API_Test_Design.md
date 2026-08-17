# Formal Reservation API Test Cases (Postman Level)

## Module

Quản lý đặt bàn (Reservation API Management - `/api/reservations`)

## Phạm vi kiểm thử

Kiểm thử toàn diện ở mức độ **REST API / Postman**, không bao gồm giao diện UX/UI:

- **POST `/api/reservations`**: Tạo đặt bàn.
- **GET `/api/reservations`**: Lấy danh sách đặt bàn.
- **GET `/api/reservations/my-reservations`**: Lấy lịch sử đặt bàn của Customer.
- **PUT `/api/reservations/:id/confirm`**: Xác nhận đặt bàn.
- **PUT `/api/reservations/:id/status`**: Cập nhật trạng thái đặt bàn.
- **PUT `/api/reservations/:id/check-in`**: Check-in khách.
- **PUT `/api/reservations/:id/cancel`**: Hủy đặt bàn.
- Kiểm thử Authentication / Authorization.
- Kiểm thử Input Validation.
- Kiểm thử Boundary Value.
- Kiểm thử Business Rules.
- Kiểm thử khả năng xử lý dữ liệu đặc biệt.

## Quy chuẩn Formal Test Case

Mỗi Test Case được đặc tả gồm:

- **Test Case ID**
- **Test Summary / Description**
- **Pre-condition**
- **Test Steps**
- **Inputs (Test Data / Method / Headers / Payload)**
- **Expected Result (HTTP Status Code, Response Body, Database State)**
- **Pass / Fail**

> **Lưu ý:** Các Test Case ban đầu có trạng thái `Not Executed`. HTTP Status Code, Response Body và Actual Result sẽ được cập nhật sau khi thực thi bằng Postman.

---

# 1. CREATE RESERVATION – POST

## RSV-API-001 – Create reservation with valid data

### Test Summary / Description

Kiểm tra khả năng tạo đặt bàn với dữ liệu hợp lệ.

### Pre-condition

- Backend đang hoạt động.
- Có tài khoản Customer hợp lệ.
- Có JWT hợp lệ.
- Có dữ liệu đặt bàn hợp lệ.

### Test Steps

1. Đăng nhập bằng tài khoản Customer.
2. Lấy JWT Token.
3. Gửi request `POST /api/reservations`.
4. Truyền đầy đủ dữ liệu đặt bàn hợp lệ.
5. Kiểm tra HTTP Status Code.
6. Kiểm tra Response Body.
7. Kiểm tra dữ liệu Reservation nếu có quyền truy cập Database.

### Inputs

```text
Method:
POST

Endpoint:
/api/reservations

Headers:
Authorization: Bearer <JWT>
Content-Type: application/json