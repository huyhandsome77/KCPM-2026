# Formal Reservation API Test Cases (Postman Level)

## Module

Quản lý đặt bàn – Reservation API (`/api/reservations`)

## Phạm vi kiểm thử

- Tạo đặt bàn
- Lấy danh sách đặt bàn
- Xem lịch sử đặt bàn của Customer
- Xác nhận đặt bàn
- Cập nhật trạng thái
- Check-in
- Hủy đặt bàn
- Authentication / Authorization
- Validation dữ liệu
- Business Rule
- Boundary / Negative Test

## Quy chuẩn

Mỗi Test Case gồm:

- Test Case ID
- Test Summary / Description
- Pre-condition
- Test Steps
- Inputs
- Expected Result
- Pass / Fail

> Trạng thái ban đầu của toàn bộ Test Case: `Not Executed`.
> HTTP Status Code và Actual Result sẽ được cập nhật sau khi chạy Postman.

---

# 1. CREATE RESERVATION

## RSV-API-001 – Create reservation with valid data

**Test Summary / Description:**  
Kiểm tra khả năng tạo đặt bàn với dữ liệu hợp lệ.

**Pre-condition:**
- Backend đang hoạt động.
- Có ít nhất một bàn phù hợp.
- `reservationTime` là thời gian hợp lệ.
- `numberOfGuests` phù hợp với sức chứa bàn.

**Test Steps:**
1. Gửi `POST /api/reservations`.
2. Nhập đầy đủ dữ liệu hợp lệ.
3. Kiểm tra HTTP Status Code.
4. Kiểm tra Response Body.

**Inputs:**

```http
POST /api/reservations
Content-Type: application/json
````

```json
{
  "guestName": "Nguyen Van A",
  "guestPhone": "0901234567",
  "reservationTime": "2026-08-18T18:00:00",
  "numberOfGuests": 2,
  "note": "Bàn gần cửa sổ"
}
```

**Expected Result:**

* HTTP `201 Created`.
* Message là `Đặt bàn thành công`.
* Response có trường `data`.
* Reservation được tạo thành công.
* Status ban đầu là `PENDING`.
* Bàn được chọn có capacity >= `numberOfGuests`.

**Pass / Fail:** `Not Executed`

---

## RSV-API-002 – Missing guestName

**Test Summary / Description:**
Kiểm tra tạo Reservation khi thiếu `guestName`.

**Pre-condition:**

* Backend hoạt động.
* Có bàn phù hợp.

**Test Steps:**

1. Gửi POST `/api/reservations`.
2. Không truyền `guestName`.
3. Kiểm tra response.

**Inputs:**

```json
{
  "guestPhone": "0901234567",
  "reservationTime": "2026-08-18T18:00:00",
  "numberOfGuests": 2
}
```

**Expected Result:**

* API không tạo Reservation hợp lệ.
* Trả lỗi validation/database phù hợp.
* Không phát sinh dữ liệu sai.

**Pass / Fail:** `Not Executed`

---

## RSV-API-003 – Missing guestPhone

**Test Summary / Description:**
Kiểm tra tạo Reservation khi thiếu `guestPhone`.

**Pre-condition:**

* Backend hoạt động.
* Có bàn phù hợp.

**Test Steps:**

1. Gửi POST `/api/reservations`.
2. Không truyền `guestPhone`.
3. Kiểm tra response.

**Inputs:**

```json
{
  "guestName": "Nguyen Van A",
  "reservationTime": "2026-08-18T18:00:00",
  "numberOfGuests": 2
}
```

**Expected Result:**

* API không tạo Reservation hợp lệ.
* Trả lỗi phù hợp.
* Không phát sinh dữ liệu sai.

**Pass / Fail:** `Not Executed`

---

## RSV-API-004 – Missing reservationTime

**Test Summary / Description:**
Kiểm tra tạo Reservation khi thiếu `reservationTime`.

**Pre-condition:**

* Backend hoạt động.
* Có bàn phù hợp.

**Test Steps:**

1. Gửi POST `/api/reservations`.
2. Không truyền `reservationTime`.
3. Kiểm tra response.

**Inputs:**

```json
{
  "guestName": "Nguyen Van A",
  "guestPhone": "0901234567",
  "numberOfGuests": 2
}
```

**Expected Result:**

* API không tạo Reservation hợp lệ.
* Trả lỗi phù hợp.
* Không phát sinh dữ liệu sai.

**Pass / Fail:** `Not Executed`

---

## RSV-API-005 – numberOfGuests = 0

**Test Summary / Description:**
Kiểm tra số lượng khách bằng 0.

**Pre-condition:**

* Backend hoạt động.
* Có bàn.

**Test Steps:**

1. Gửi POST Reservation.
2. Đặt `numberOfGuests = 0`.
3. Kiểm tra response.

**Inputs:**

```json
{
  "guestName": "Nguyen Van A",
  "guestPhone": "0901234567",
  "reservationTime": "2026-08-18T18:00:00",
  "numberOfGuests": 0
}
```

**Expected Result:**

* Hệ thống phải xử lý giá trị không hợp lệ theo business rule.
* Ghi nhận HTTP Status và Response thực tế khi chạy.

**Pass / Fail:** `Not Executed`

---

## RSV-API-006 – Negative numberOfGuests

**Test Summary / Description:**
Kiểm tra số lượng khách là số âm.

**Test Steps:**

1. Gửi POST Reservation.
2. Đặt `numberOfGuests = -1`.
3. Kiểm tra response.

**Inputs:**

```json
{
  "guestName": "Nguyen Van A",
  "guestPhone": "0901234567",
  "reservationTime": "2026-08-18T18:00:00",
  "numberOfGuests": -1
}
```

**Expected Result:**

* Hệ thống không được tạo Reservation sai nghiệp vụ.
* Ghi nhận kết quả validation thực tế.

**Pass / Fail:** `Not Executed`

---

## RSV-API-007 – Reservation time in the past

**Test Summary / Description:**
Kiểm tra đặt bàn với thời gian trong quá khứ.

**Test Steps:**

1. Gửi POST Reservation.
2. Nhập `reservationTime` trong quá khứ.
3. Kiểm tra response.

**Inputs:**

```json
{
  "guestName": "Nguyen Van A",
  "guestPhone": "0901234567",
  "reservationTime": "2020-01-01T18:00:00",
  "numberOfGuests": 2
}
```

**Expected Result:**

* Hệ thống phải xử lý thời gian không hợp lệ theo business rule.
* Không tạo Reservation sai nghiệp vụ.

**Pass / Fail:** `Not Executed`

---

## RSV-API-008 – Empty guestName

**Test Summary / Description:**
Kiểm tra `guestName` là chuỗi rỗng.

**Test Steps:**

1. Gửi POST Reservation.
2. Truyền `"guestName": ""`.
3. Kiểm tra response.

**Inputs:**

```json
{
  "guestName": "",
  "guestPhone": "0901234567",
  "reservationTime": "2026-08-18T18:00:00",
  "numberOfGuests": 2
}
```

**Expected Result:**

* Hệ thống xử lý dữ liệu không hợp lệ.
* Không tạo dữ liệu sai nghiệp vụ.

**Pass / Fail:** `Not Executed`

---

## RSV-API-009 – Invalid guestPhone

**Test Summary / Description:**
Kiểm tra số điện thoại không hợp lệ.

**Test Steps:**

1. Gửi POST Reservation.
2. Truyền số điện thoại sai định dạng.
3. Kiểm tra response.

**Inputs:**

```json
{
  "guestName": "Nguyen Van A",
  "guestPhone": "abcxyz",
  "reservationTime": "2026-08-18T18:00:00",
  "numberOfGuests": 2
}
```

**Expected Result:**

* API xử lý dữ liệu không hợp lệ.
* Ghi nhận validation thực tế.

**Pass / Fail:** `Not Executed`

---

## RSV-API-010 – No suitable table

**Test Summary / Description:**
Kiểm tra khi không có bàn đủ sức chứa.

**Pre-condition:**

* Không có bàn có `capacity >= numberOfGuests`.

**Test Steps:**

1. Gửi POST Reservation với số lượng khách lớn.
2. Kiểm tra response.

**Inputs:**

```json
{
  "guestName": "Nguyen Van A",
  "guestPhone": "0901234567",
  "reservationTime": "2026-08-18T18:00:00",
  "numberOfGuests": 1000
}
```

**Expected Result:**

* HTTP `400`.
* Message thông báo không còn bàn phù hợp.
* Không tạo Reservation.

**Pass / Fail:** `Not Executed`

---

## RSV-API-011 – Conflict with CONFIRMED reservation

**Test Summary / Description:**
Kiểm tra xung đột với Reservation đã `CONFIRMED`.

**Pre-condition:**

* Có Reservation `CONFIRMED`.
* Reservation đó chiếm một bàn trong khoảng thời gian kiểm thử.

**Test Steps:**

1. Xác định thời gian Reservation `CONFIRMED`.
2. Tạo Reservation mới cùng khoảng thời gian.
3. Kiểm tra bàn được cấp.
4. Kiểm tra response.

**Expected Result:**

* Không cấp lại cùng bàn cho Reservation bị xung đột.
* Hệ thống chọn bàn khác nếu còn bàn phù hợp.
* Nếu không còn bàn thì trả HTTP `400`.

**Pass / Fail:** `Not Executed`

---

## RSV-API-012 – Conflict with CHECKED_IN reservation

**Test Summary / Description:**
Kiểm tra xung đột với Reservation `CHECKED_IN`.

**Pre-condition:**

* Có Reservation `CHECKED_IN`.

**Test Steps:**

1. Tạo Reservation mới cùng khoảng thời gian.
2. Kiểm tra bàn được chọn.

**Expected Result:**

* Bàn đang được sử dụng bởi Reservation `CHECKED_IN` không được cấp lại.
* Không tạo xung đột bàn.

**Pass / Fail:** `Not Executed`

---

# 2. GET RESERVATION

## RSV-API-013 – Get all reservations

**Test Summary / Description:**
Kiểm tra lấy toàn bộ Reservation.

**Test Steps:**

1. Gửi `GET /api/reservations`.
2. Kiểm tra response.

**Inputs:**

```http
GET /api/reservations
```

**Expected Result:**

* HTTP request thành công.
* Response trả danh sách Reservation.
* Dữ liệu có cấu trúc hợp lệ.

**Pass / Fail:** `Not Executed`

---

## RSV-API-014 – Customer gets own reservations

**Test Summary / Description:**
Kiểm tra Customer lấy lịch sử đặt bàn của mình.

**Pre-condition:**

* Customer đã đăng nhập.
* Có JWT.
* Customer có Reservation.

**Test Steps:**

1. Login Customer.
2. Lấy JWT.
3. Gửi GET `/api/reservations/my-reservations`.
4. Kiểm tra response.

**Inputs:**

```http
GET /api/reservations/my-reservations
Authorization: Bearer <JWT>
```

**Expected Result:**

* API trả danh sách Reservation của Customer hiện tại.
* Không trả Reservation của User khác.

**Pass / Fail:** `Not Executed`

---

## RSV-API-015 – Customer has no reservation

**Test Summary / Description:**
Kiểm tra Customer chưa có Reservation.

**Pre-condition:**

* Customer hợp lệ.
* Customer chưa có Reservation.

**Test Steps:**

1. Login Customer.
2. Gửi GET `/api/reservations/my-reservations`.
3. Kiểm tra response.

**Expected Result:**

* API trả danh sách rỗng.
* Không lỗi Server.

**Pass / Fail:** `Not Executed`

---

## RSV-API-016 – Get own reservations without JWT

**Test Summary / Description:**
Kiểm tra truy cập `/my-reservations` không có JWT.

**Test Steps:**

1. Gửi GET `/api/reservations/my-reservations`.
2. Không gửi Authorization.

**Expected Result:**

* Request bị middleware `verifyToken` từ chối.
* Không trả dữ liệu Reservation cá nhân.

**Pass / Fail:** `Not Executed`

---

# 3. CONFIRM RESERVATION

## RSV-API-017 – Confirm PENDING reservation

**Test Summary / Description:**
Kiểm tra xác nhận Reservation đang `PENDING`.

**Pre-condition:**

* Reservation tồn tại.
* Status = `PENDING`.

**Test Steps:**

1. Gửi `PUT /api/reservations/:id/confirm`.
2. Kiểm tra response.
3. Kiểm tra status.

**Expected Result:**

* HTTP `200`.
* Message: `Xác nhận đặt bàn thành công`.
* Status chuyển thành `CONFIRMED`.

**Pass / Fail:** `Not Executed`

---

## RSV-API-018 – Confirm already CONFIRMED reservation

**Test Summary / Description:**
Kiểm tra Confirm Reservation đã `CONFIRMED`.

**Pre-condition:**

* Reservation status = `CONFIRMED`.

**Test Steps:**

1. Gửi Confirm lần thứ hai.
2. Kiểm tra response.

**Expected Result:**

* HTTP `400`.
* Message thông báo chỉ được xác nhận Reservation `PENDING`.
* Status không thay đổi.

**Pass / Fail:** `Not Executed`

---

## RSV-API-019 – Confirm non-existent reservation

**Test Summary / Description:**
Kiểm tra Confirm Reservation không tồn tại.

**Test Steps:**

1. Gửi Confirm với ID không tồn tại.
2. Kiểm tra response.

**Expected Result:**

* HTTP `404`.
* Message: `Không tìm thấy thông tin đặt bàn`.
* Không thay đổi database.

**Pass / Fail:** `Not Executed`

---

# 4. CHECK-IN

## RSV-API-020 – Check-in CONFIRMED reservation within allowed time

**Test Summary / Description:**
Kiểm tra Check-in Reservation `CONFIRMED` trong khoảng thời gian cho phép.

**Pre-condition:**

* Reservation = `CONFIRMED`.
* Thời gian hiện tại nằm trong khoảng 30 phút trước hoặc sau `reservationTime`.

**Test Steps:**

1. Gửi `PUT /api/reservations/:id/check-in`.
2. Kiểm tra response.
3. Kiểm tra Reservation.
4. Kiểm tra RestaurantTable.

**Expected Result:**

* Check-in thành công.
* Reservation → `CHECKED_IN`.
* Table → `OCCUPIED`.
* Message: `Xác nhận nhận bàn thành công`.

**Pass / Fail:** `Not Executed`

---

## RSV-API-021 – Check-in PENDING reservation

**Test Summary / Description:**
Kiểm tra Check-in Reservation đang `PENDING`.

**Pre-condition:**

* Reservation = `PENDING`.
* Thời gian nằm trong khoảng ±30 phút.

**Test Steps:**

1. Gửi Check-in.
2. Kiểm tra response.
3. Kiểm tra status.

**Expected Result:**

* Theo Controller hiện tại, `PENDING` được phép Check-in.
* Reservation → `CHECKED_IN`.
* Ghi nhận kết quả để đối chiếu với nghiệp vụ/SRS.

**Pass / Fail:** `Not Executed`

---

## RSV-API-022 – Check-in more than 30 minutes early

**Test Summary / Description:**
Kiểm tra Check-in sớm hơn 30 phút.

**Pre-condition:**

* Reservation tồn tại.
* Thời điểm hiện tại sớm hơn `reservationTime` trên 30 phút.

**Test Steps:**

1. Gửi Check-in.
2. Kiểm tra response.

**Expected Result:**

* HTTP `400`.
* Message thông báo chỉ Check-in trong khoảng ±30 phút.
* Status không đổi.

**Pass / Fail:** `Not Executed`

---

## RSV-API-023 – Check-in more than 30 minutes late

**Test Summary / Description:**
Kiểm tra Check-in trễ hơn 30 phút.

**Pre-condition:**

* Reservation tồn tại.
* Thời điểm hiện tại trễ hơn `reservationTime` trên 30 phút.

**Test Steps:**

1. Gửi Check-in.
2. Kiểm tra response.

**Expected Result:**

* HTTP `400`.
* Status không đổi.

**Pass / Fail:** `Not Executed`

---

## RSV-API-024 – Check-in non-existent reservation

**Test Summary / Description:**
Kiểm tra Check-in Reservation không tồn tại.

**Test Steps:**

1. Gửi Check-in với ID không tồn tại.
2. Kiểm tra response.

**Expected Result:**

* HTTP `404`.
* Message: `Không tìm thấy thông tin đặt bàn`.
* Không thay đổi dữ liệu.

**Pass / Fail:** `Not Executed`

---

# 5. CANCEL RESERVATION

## RSV-API-025 – Cancel PENDING reservation

**Test Summary / Description:**
Kiểm tra hủy Reservation `PENDING`.

**Pre-condition:**

* Reservation = `PENDING`.

**Test Steps:**

1. Gửi `PUT /api/reservations/:id/cancel`.
2. Kiểm tra response.
3. Kiểm tra status.

**Expected Result:**

* Request thành công.
* Status → `CANCELLED`.
* Message: `Đã hủy đặt bàn thành công`.

**Pass / Fail:** `Not Executed`

---

## RSV-API-026 – Cancel CONFIRMED reservation

**Test Summary / Description:**
Kiểm tra hủy Reservation `CONFIRMED`.

**Pre-condition:**

* Reservation = `CONFIRMED`.

**Test Steps:**

1. Gửi Cancel.
2. Kiểm tra response.
3. Kiểm tra status.

**Expected Result:**

* Request thành công.
* Status → `CANCELLED`.

**Pass / Fail:** `Not Executed`

---

## RSV-API-027 – Cancel CHECKED_IN reservation

**Test Summary / Description:**
Kiểm tra hủy Reservation `CHECKED_IN`.

**Pre-condition:**

* Reservation = `CHECKED_IN`.

**Test Steps:**

1. Gửi Cancel.
2. Kiểm tra response.

**Expected Result:**

* HTTP `400`.
* Reservation không chuyển sang `CANCELLED`.
* Message chỉ cho phép hủy `PENDING` hoặc `CONFIRMED`.

**Pass / Fail:** `Not Executed`

---

## RSV-API-028 – Cancel non-existent reservation

**Test Summary / Description:**
Kiểm tra hủy Reservation không tồn tại.

**Test Steps:**

1. Gửi Cancel với ID không tồn tại.

**Expected Result:**

* HTTP `404`.
* Không thay đổi database.

**Pass / Fail:** `Not Executed`

---

# 6. UPDATE RESERVATION STATUS

## RSV-API-029 – Update status with valid value

**Test Summary / Description:**
Kiểm tra cập nhật status bằng giá trị hợp lệ.

**Pre-condition:**

* Reservation tồn tại.

**Test Steps:**

1. Gửi PUT `/api/reservations/:id/status`.
2. Truyền status hợp lệ.
3. Kiểm tra response.

**Inputs:**

```json
{
  "status": "CONFIRMED"
}
```

**Expected Result:**

* API cập nhật status.
* Response trả Reservation sau cập nhật.

**Pass / Fail:** `Not Executed`

---

## RSV-API-030 – Update status with invalid value

**Test Summary / Description:**
Kiểm tra cập nhật status bằng giá trị không thuộc ENUM.

**Test Steps:**

1. Gửi Update Status.
2. Truyền `"ABC"`.

**Inputs:**

```json
{
  "status": "ABC"
}
```

**Expected Result:**

* API không được lưu status ngoài ENUM.
* Request bị từ chối hoặc Database trả lỗi.
* Không tạo trạng thái không hợp lệ.

**Pass / Fail:** `Not Executed`

---

## RSV-API-031 – Update status without status field

**Test Summary / Description:**
Kiểm tra Update Status không có field `status`.

**Test Steps:**

1. Gửi PUT Status.
2. Body là `{}`.
3. Kiểm tra response.

**Inputs:**

```json
{}
```

**Expected Result:**

* API xử lý lỗi.
* Không cập nhật status thành giá trị không hợp lệ.
* Không gây lỗi Server ngoài dự kiến.

**Pass / Fail:** `Not Executed`

---

## RSV-API-032 – Update status for non-existent reservation

**Test Summary / Description:**
Kiểm tra Update Status Reservation không tồn tại.

**Test Steps:**

1. Gửi PUT Status với ID không tồn tại.
2. Kiểm tra response.

**Expected Result:**

* HTTP `404`.
* Không thay đổi dữ liệu.

**Pass / Fail:** `Not Executed`

---

# 7. AUTHENTICATION / AUTHORIZATION

## RSV-API-033 – Create reservation without JWT

**Test Summary / Description:**
Kiểm tra tạo Reservation khi không có JWT.

**Pre-condition:**

* Không đăng nhập.
* Có dữ liệu Reservation hợp lệ.

**Test Steps:**

1. Không gửi Authorization.
2. Gửi POST `/api/reservations`.
3. Kiểm tra response.

**Expected Result:**

* Ghi nhận hành vi thực tế.
* Nếu nghiệp vụ yêu cầu Customer đăng nhập thì request không được phép tạo Reservation trái phép.

**Pass / Fail:** `Not Executed`

---

## RSV-API-034 – Create reservation using another user's user_id

**Test Summary / Description:**
Kiểm tra Customer có thể tự gán Reservation cho User khác hay không.

**Pre-condition:**

* Có User A.
* Có User B.
* Có ID của User B.

**Test Steps:**

1. Gửi POST Reservation.
2. Truyền `user_id` của User B.
3. Kiểm tra Reservation được tạo thuộc User nào.

**Inputs:**

```json
{
  "guestName": "Nguyen Van A",
  "guestPhone": "0901234567",
  "reservationTime": "2026-08-18T18:00:00",
  "numberOfGuests": 2,
  "user_id": "<user-B-id>"
}
```

**Expected Result:**

* User không được phép tự ý tạo Reservation thuộc User khác nếu nghiệp vụ yêu cầu ownership.
* Ghi nhận kết quả thực tế.

**Pass / Fail:** `Not Executed`

---

## RSV-API-035 – Get all reservations without JWT

**Test Summary / Description:**
Kiểm tra quyền truy cập API lấy toàn bộ Reservation.

**Test Steps:**

1. Không gửi Authorization.
2. Gửi `GET /api/reservations`.

**Expected Result:**

* Ghi nhận hành vi thực tế.
* Nếu API yêu cầu Staff/Admin thì request phải bị từ chối.

**Pass / Fail:** `Not Executed`

---

## RSV-API-036 – Confirm without JWT

**Test Summary / Description:**
Kiểm tra Confirm không có JWT.

**Test Steps:**

1. Không gửi Authorization.
2. Gửi `PUT /api/reservations/:id/confirm`.
3. Kiểm tra response.

**Expected Result:**

* Nếu Confirm yêu cầu Staff/Admin thì request phải bị từ chối.
* Không thay đổi Reservation trái phép.

**Pass / Fail:** `Not Executed`

---

## RSV-API-037 – Cancel / Check-in without JWT

**Test Summary / Description:**
Kiểm tra Cancel hoặc Check-in không có JWT.

**Test Steps:**

1. Không gửi Authorization.
2. Gửi Cancel hoặc Check-in.
3. Kiểm tra response.

**Expected Result:**

* Nếu chức năng yêu cầu Authentication/Authorization thì request phải bị từ chối.
* Không thay đổi dữ liệu trái phép.

**Pass / Fail:** `Not Executed`

---

# Tổng số Test Case

**37 Test Cases**

## Người thực hiện

**Trần Minh Trí**

## Jira Ticket

**SCRUM-33**

## Trạng thái

**Test Design – Not Executed**

## Ghi chú

* Các Test Case chưa được thực thi.
* Sau khi chạy Postman, cập nhật Actual Result và Pass/Fail.
* Nếu phát hiện lỗi, tạo Bug Log và liên kết Bug ID.
* Sau khi Developer sửa lỗi, thực hiện Retest.
* Không đánh dấu Fail chỉ dựa trên suy đoán; phải dựa trên kết quả chạy thực tế và yêu cầu nghiệp vụ.