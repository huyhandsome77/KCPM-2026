# FutureSuShi – EP Test Report: Restaurant Table & QR Code

## 1. Thông tin chung

- **Project:** FutureSuShi
- **Module:** Restaurant Table & QR Code
- **Phương pháp:** Equivalence Partitioning (EP) – Phân hoạch lớp tương đương
- **Environment:** `FutureSushi - Local Environment`
- **Base URL:** `http://localhost:3000`
- **Tổng testcase:** 15
- **PASS:** 9
- **FAIL:** 6

---

## 2. Phạm vi phân hoạch lớp tương đương

- `tableNumber`: hợp lệ `[1,500]`, đã tồn tại/trùng, không phải số.
- `capacity`: hợp lệ `[1,50]`, không phải số, dưới Min.
- `qrCode / qr_token`: hợp lệ `[10,255]`, bị trùng.
- `status`: hợp lệ `AVAILABLE`, `OCCUPIED`, `RESERVED`; không hợp lệ `BOOKED`.
- `table_id`: tồn tại, không tồn tại, không hợp lệ.
- QR Code: tồn tại và không tồn tại.

---

## 3. Kết quả thực thi

| ID | Test case | Method | Expected Result | Actual Result | Assertions | Result | Note |
|---|---|---|---|---|---|---|---|
| **EP-SRS-TB-001** | `tableNumber = 250` valid | POST | 201 Created | 201 Created | 7/7 PASS | **PASS** | Tạo bàn thành công, dữ liệu trả về đúng. |
| **EP-SRS-TB-002** | `tableNumber = 1` duplicate | POST | 4xx | 400 Bad Request | 4/4 PASS | **PASS** | Hệ thống phát hiện bàn #1 đã tồn tại. |
| **EP-SRS-TB-003** | `tableNumber = "ABC"` non-number | POST | 4xx validation | 500 Internal Server Error | 2/3 PASS | **FAIL** | Backend không validate input; phát sinh `Unknown column 'NaN' in 'where clause'`. |
| **EP-SRS-TB-004** | `tableNumber = 251` valid | POST | 201 Created | 201 Created | 2/2 PASS | **PASS** | Giá trị hợp lệ được tạo thành công. |
| **EP-SRS-TB-005** | `capacity = "ABC"` non-number | POST | 4xx validation | 201 Created, `capacity = null` | 2/3 PASS | **FAIL** | Backend chưa validate kiểu dữ liệu `capacity`. |
| **EP-SRS-TB-006** | `capacity = 0` below Min | POST | 4xx | 201 Created, `capacity = 4` | 2/3 PASS | **FAIL** | `0` bị xem là falsy và bị thay bằng giá trị mặc định `4`; không đúng SRS `[1,50]`. |
| **EP-SRS-TB-007** | `qr_token` valid, length = 10 | POST | 201 Created | 201 Created | 3/3 PASS | **PASS** | QR hợp lệ được tạo thành công. |
| **EP-SRS-TB-008** | `qr_token` duplicate | POST | 4xx | 201 Created | 2/3 PASS | **FAIL** | QR đã tồn tại vẫn được phép tạo; chưa đảm bảo unique theo SRS. |
| **EP-SRS-TB-009** | `status = AVAILABLE` valid | POST | 201 Created | 201 Created | PASS | **PASS** | `AVAILABLE` thuộc tập status SRS. |
| **EP-SRS-TB-010** | `status = BOOKED` invalid per SRS | POST | 4xx | 201 Created | 2/3 PASS | **FAIL** | Implementation vẫn chấp nhận `BOOKED`, trong khi SRS không cho phép. |
| **EP-SRS-TB-011** | Existing `table_id` | PUT | 200 OK | 200 OK | 3/3 PASS | **PASS** | Cập nhật bàn tồn tại thành `OCCUPIED` thành công. |
| **EP-SRS-TB-012** | Non-existing `table_id` | PUT | 4xx/404 | 404 Not Found | 3/3 PASS | **PASS** | ID không tồn tại được xử lý đúng. |
| **EP-SRS-TB-013** | Invalid `table_id = ABC` | PUT | 4xx/404 | 404 Not Found | 3/3 PASS | **PASS** | Request đúng URL `/api/tables/ABC`, hệ thống trả 404. |
| **EP-SRS-TB-014** | Existing QR Code | GET | 200 + response hợp lệ | 200 OK | 2/4 PASS | **FAIL** | API tìm thấy bàn nhưng assertion chưa khớp response; QR thực tế `"2"` dài 1, không đạt SRS `[10,255]`. |
| **EP-SRS-TB-015** | Non-existing QR Code | GET | 404 Not Found | 404 Not Found | 3/3 PASS | **PASS** | QR không tồn tại được xử lý đúng. |

---

## 4. Chi tiết testcase FAIL

### EP-SRS-TB-003 – tableNumber non-number

- **Input:** `tableNumber = "ABC"`
- **Expected:** 4xx validation error, không tạo bản ghi.
- **Actual:** `500 Internal Server Error`.
- **Message:** `Unknown column 'NaN' in 'where clause'`.
- **Assertions:** `2/3 PASS`.
- **Result:** **FAIL**.
- **Nhận xét:** Backend cần kiểm tra kiểu dữ liệu trước khi chuyển đổi/truy vấn database.

### EP-SRS-TB-005 – capacity non-number

- **Input:** `capacity = "ABC"`.
- **Expected:** 4xx validation error.
- **Actual:** `201 Created`, response có `capacity = null`.
- **Assertions:** `2/3 PASS`.
- **Result:** **FAIL**.
- **Nhận xét:** Backend chưa kiểm tra `capacity` có phải số nguyên hợp lệ hay không.

### EP-SRS-TB-006 – capacity below Min

- **Input:** `capacity = 0`.
- **Expected:** 4xx vì SRS quy định `capacity ∈ [1,50]`.
- **Actual:** `201 Created`, response trả `capacity = 4`.
- **Assertions:** `2/3 PASS`.
- **Result:** **FAIL**.
- **Nhận xét:** Code đang xử lý `0` như giá trị falsy và áp dụng default `4`.

### EP-SRS-TB-008 – qr_token duplicate

- **Input:** sử dụng `{{existingQrCode}}`.
- **Expected:** 4xx vì QR phải unique.
- **Actual:** `201 Created`.
- **Assertions:** `2/3 PASS`.
- **Result:** **FAIL**.
- **Nhận xét:** Chưa có kiểm tra uniqueness của QR trước khi tạo bàn.

### EP-SRS-TB-010 – status invalid per SRS

- **Input:** `status = BOOKED`.
- **Expected:** 4xx vì SRS chỉ cho `AVAILABLE`, `OCCUPIED`, `RESERVED`.
- **Actual:** `201 Created`, hệ thống lưu `BOOKED`.
- **Assertions:** `2/3 PASS`.
- **Result:** **FAIL**.
- **Nhận xét:** Tập status của implementation không khớp yêu cầu SRS.

### EP-SRS-TB-014 – Existing QR Code

- **Input:** QR tồn tại thực tế là `2`.
- **Expected:** 200 và response đáp ứng các kiểm tra của test/SRS.
- **Actual:** `200 OK`.
- **Response:** bàn `id = 2`, `tableNumber = 2`, `qrCode = "2"`, `capacity = 8`, `status = OCCUPIED`.
- **Assertions:** `2/4 PASS`.
- **Result:** **FAIL**.
- **Nhận xét:** API hoạt động về HTTP nhưng assertion đang kiểm tra cấu trúc `d.table`, trong khi response trả object bàn trực tiếp. Ngoài ra `qrCode = "2"` chỉ dài 1 ký tự, không đạt SRS `[10,255]`.

---

## 5. Các vấn đề chất lượng cần lưu ý

### 5.1. Validation `tableNumber`

`tableNumber = "ABC"` gây HTTP 500 thay vì lỗi validation 4xx. Đây là vấn đề xử lý input và cần được sửa ở backend.

### 5.2. Validation `capacity`

`capacity = "ABC"` vẫn được tạo với `capacity = null`, trong khi SRS yêu cầu số nguyên từ 1 đến 50.

### 5.3. Giá trị Min của `capacity`

`capacity = 0` bị đổi thành `4` thay vì bị từ chối. Điều này không đúng với miền dữ liệu SRS.

### 5.4. Unique QR

QR bị trùng vẫn tạo được bàn mới. Cần bổ sung kiểm tra unique cho `qrCode`.

### 5.5. Status không khớp SRS

Implementation đang chấp nhận `BOOKED`, trong khi SRS quy định tập giá trị là:

`AVAILABLE`, `OCCUPIED`, `RESERVED`.

### 5.6. Response GET QR và Postman assertion

Response thực tế của GET QR là object bàn trực tiếp, nhưng test script kiểm tra `d.table`. Cần thống nhất contract API và assertion.

### 5.7. Dữ liệu QR hiện tại

QR `"2"` trong database có độ dài 1, không đáp ứng ràng buộc `10–255` của SRS. Đây là vấn đề dữ liệu test/fixture cần lưu ý khi đánh giá theo SRS.

---

## 6. Kết luận

- Đã thực thi **15/15 testcase**.
- **9 PASS / 6 FAIL**.
- Các lỗi chính nằm ở validation `tableNumber`, `capacity`, uniqueness của `qrCode`, tập giá trị `status` và sự không thống nhất giữa response GET QR với assertion.
- Các testcase được đánh giá theo **Expected của SRS** và Actual thực tế trên Postman.
- Chạy TB-005 bị nhập nhầm URL `/api/tables/ABC` không được dùng làm kết quả; kết quả TB-005 trong bảng là lần chạy đúng `POST /api/tables`.
