# FutureSuShi – EP Test Report: Point & Loyalty

## 1. Thông tin chung

- **Project:** FutureSuShi
- **Module:** Point & Loyalty
- **Phương pháp EP:** Equivalence Partitioning (EP)
- **Environment:** Local / Backend `http://localhost:3000`
- **Tổng testcase EP thiết kế:** 16
- **Đã thực thi:** 16
- **PASS:** 14
- **FAIL:** 2
- **NOT RUN:** 0
- **Tỷ lệ PASS:** **87.5%**

> **Evidence:** Bộ Point API hiện có đã được chạy live bằng Newman với backend đang hoạt động: 18 requests, 0 failed requests, 17/17 assertions PASS. White-box Point: 8/8 PASS. Hai lớp EP bổ sung (phone sai định dạng và orderId thập phân) đã được chạy live trong collection EP bổ sung; cả hai assertion đều FAIL vì thực tế trả HTTP 404 thay vì HTTP 400.

## 2. Phạm vi phân hoạch lớp tương đương

| Biến / điều kiện | Lớp hợp lệ | Lớp không hợp lệ |
|---|---|---|
| Quyền truy cập | STAFF / ADMIN | CUSTOMER / không token / token không hợp lệ |
| Phone | Chuỗi không rỗng, khách hàng tồn tại | Thiếu, rỗng/whitespace, không tồn tại, sai định dạng |
| orderId | Số nguyên dương, order tồn tại | Thiếu, <= 0, không phải số, số thập phân, không tồn tại |
| Trạng thái Order | `PAID` + `COMPLETED` | Chưa thanh toán / chưa hoàn tất |
| Tích điểm | `isPointsAdded = false` | `isPointsAdded = true` |
| Công thức | `finalPrice * 0.05` và làm tròn | Giá trị không hợp lệ / không xác định |

## 3. Kết quả thực thi

| ID | Test case | Method | Expected Result | Actual Result | Assertions | Result | Note |
|---|---|---|---|---|---|---|---|
| EP-POINT-001 | Staff/Admin có quyền tích điểm | POST /api/points/add-points | Token hợp lệ với role STAFF/ADMIN được phép gọi API. | Login staff và request Point dùng staff token PASS. | Assertion PASS | **PASS** | Live API evidence |
| EP-POINT-002 | Không có token | POST /api/points/add-points | API trả 401 Unauthorized. | 401 Unauthorized. | Assertion PASS | **PASS** | TC_API_PNT_002 |
| EP-POINT-003 | Customer gọi API tích điểm | POST /api/points/add-points | API trả 403 Forbidden. | 403 Forbidden. | Assertion PASS | **PASS** | TC_API_PNT_001 |
| EP-POINT-004 | Phone thiếu | POST /api/points/add-points | API trả 400 Bad Request. | 400 Bad Request. | Assertion PASS | **PASS** | TC_API_PNT_003 |
| EP-POINT-005 | Phone rỗng / whitespace | POST /api/points/add-points | API trả 400 Bad Request. | 400 Bad Request. | Assertion PASS | **PASS** | TC_API_PNT_004 |
| EP-POINT-006 | Phone không tồn tại | POST /api/points/add-points | API trả 404 Not Found. | 404 Not Found. | Assertion PASS | **PASS** | TC_API_PNT_007 |
| EP-POINT-007 | Phone sai định dạng (chứa chữ) | POST /api/points/add-points | API trả 400 Bad Request. | **404 Not Found.** | Assertion expected 400 nhưng nhận 404 → FAIL | **FAIL** | Chưa có validation format phone; request tiếp tục tìm khách hàng. |
| EP-POINT-008 | orderId thiếu | POST /api/points/add-points | API trả 400 Bad Request. | 400 Bad Request. | Assertion PASS | **PASS** | TC_API_PNT_005 |
| EP-POINT-009 | orderId là số thập phân | POST /api/points/add-points | API trả 400 Bad Request. | **404 Not Found.** | Assertion expected 400 nhưng nhận 404 → FAIL | **FAIL** | Validation hiện chưa thể hiện kiểm tra `Number.isInteger()`. Lần chạy dùng phone mặc định nên 404 cần được cô lập lại bằng customer phone tồn tại. |
| EP-POINT-010 | orderId <= 0 / không phải số | POST /api/points/add-points | API trả 400 Bad Request. | 400 Bad Request. | Assertion PASS | **PASS** | TC_API_PNT_006 |
| EP-POINT-011 | orderId không tồn tại | POST /api/points/add-points | API trả 404 Not Found. | 404 Not Found. | Assertion PASS | **PASS** | TC_API_PNT_008 |
| EP-POINT-012 | Order chưa PAID/COMPLETED | POST /api/points/add-points | API trả 400 Bad Request. | 400 Bad Request. | Assertion PASS | **PASS** | TC_API_PNT_010 |
| EP-POINT-013 | Order đã tích điểm | POST /api/points/add-points | API trả 400 Bad Request. | 400 Bad Request. | Assertion PASS | **PASS** | TC_API_PNT_014 |
| EP-POINT-014 | Order PAID + COMPLETED hợp lệ | POST /api/points/add-points | API cho phép tích điểm và trả 200. | 200 OK. | Assertion PASS | **PASS** | TC_API_PNT_013 |
| EP-POINT-015 | Tính điểm 5% | POST /api/points/add-points | `earnedPoints = round(finalPrice * 0.05)`. | Assertion công thức/earnedPoints PASS. | Assertion PASS | **PASS** | TC_API_PNT_013 |
| EP-POINT-016 | Thiếu/invalid token JWT | POST /api/points/add-points | API trả 401 Unauthorized. | Authorization flow của Point API PASS. | Assertion PASS | **PASS** | Live project evidence |

## 4. Chi tiết testcase FAIL

### EP-POINT-007 – Phone sai định dạng

- **Input:** `phone = "09012abcde"`, `orderId = 1`
- **Expected:** HTTP **400 Bad Request**
- **Actual:** HTTP **404 Not Found**
- **Result:** **FAIL**
- **Phân tích:** Controller hiện chỉ kiểm tra phone có tồn tại và không rỗng, chưa thể hiện kiểm tra định dạng/độ dài số điện thoại trước khi truy vấn khách hàng. Vì vậy input chứa chữ không bị chặn ở lớp validation format; request đi tiếp tới bước tìm khách hàng và nhận 404.

### EP-POINT-009 – orderId là số thập phân

- **Input:** `orderId = 1.5`
- **Expected:** HTTP **400 Bad Request**
- **Actual:** HTTP **404 Not Found**
- **Result:** **FAIL**
- **Phân tích:** Điều kiện hiện tại kiểm tra `isNaN(orderId)` và `Number(orderId) <= 0`, nhưng không kiểm tra `Number.isInteger(orderId)`. Do đó `1.5` không bị loại ngay ở bước validation. Trong lần chạy EP bổ sung, phone mặc định không xác định được khách hàng nên request nhận 404; vì vậy kết quả này đủ để đánh dấu testcase FAIL theo expected/actual, nhưng để cô lập defect `orderId` thập phân cần chạy lại với một customer phone tồn tại.

## 5. Các vấn đề chất lượng cần lưu ý

### 5.1. Chưa validate format của phone

Đây là defect rõ ràng từ EP-POINT-007. API đang phân biệt phone rỗng và phone không tồn tại, nhưng chưa có kiểm tra riêng cho lớp “phone sai định dạng”. Điều này có thể khiến dữ liệu đầu vào sai định dạng đi sâu hơn vào luồng xử lý.

**Đề xuất:** thêm validation format phone trước `User.findOne()`, ví dụ kiểm tra chuỗi chỉ gồm chữ số và độ dài theo quy định của hệ thống.

### 5.2. Chưa validate `orderId` là số nguyên

Đây là vấn đề được phát hiện khi thiết kế EP và thể hiện trong code hiện tại: chưa có `Number.isInteger(orderId)`. `orderId = 1.5` không bị loại ở validation.

**Đề xuất:** sau khi kiểm tra `isNaN()` và `> 0`, bổ sung kiểm tra `Number.isInteger(Number(orderId))` trước khi gọi `Order.findByPk()`.

### 5.3. Các luồng chính đang ổn định

- Authorization STAFF/ADMIN: PASS.
- CUSTOMER bị chặn: PASS.
- Thiếu/rỗng phone: PASS.
- Phone không tồn tại: PASS.
- orderId thiếu, <= 0 hoặc không phải số: PASS.
- Order chưa hoàn thành/chưa thanh toán: PASS.
- Chống tích điểm lần 2: PASS.
- Tích điểm thành công và kiểm tra công thức 5%: PASS.

## 6. Kết luận

Kết quả EP của module **Point & Loyalty**:

- **16 testcase được thiết kế**
- **16 testcase đã thực thi**
- **14 PASS**
- **2 FAIL**
- **0 NOT RUN**
- **Tỷ lệ PASS: 87.5%**

Hai testcase FAIL tập trung vào **validation đầu vào**: phone sai định dạng và orderId thập phân. Vì vậy, module chưa nên được kết luận là đạt hoàn toàn về mặt kiểm tra dữ liệu đầu vào.

Đối với báo cáo hiện tại, có thể ghi nhận **2 defect/quality issues cần xử lý** và ưu tiên bổ sung validation trước khi kết luận module Point & Loyalty đạt đầy đủ các lớp tương đương đã thiết kế.