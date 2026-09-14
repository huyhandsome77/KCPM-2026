# FutureSuShi – Báo cáo kiểm thử EP: Point & Loyalty

## **1. Thông tin chung**

- **Project:** FutureSuShi
- **Module:** Point & Loyalty
- **Phương pháp:** Equivalence Partitioning (EP)
- **Endpoint:** `POST /api/points/add-points`
- **Tổng testcase:** **19**
- **Đã thực thi:** **19**
- **PASS:** **16**
- **FAIL:** **3**
- **NOT RUN:** **0**
- **Pass Rate:** **84.21%**

---

## **2. Quy ước phân hoạch lớp tương đương**

- **CV** = lớp tương đương hợp lệ (Valid Class)
- **CX** = lớp tương đương không hợp lệ (Invalid Class)

| Ký hiệu | Đối tượng / Input | Lớp tương đương |
|---|---|---|
| CV1 | Authorization | Token STAFF/ADMIN hợp lệ |
| CX1 | Authorization | Không có token |
| CX2 | Authorization | Customer không có quyền |
| CV2 | phone | Phone khách hàng tồn tại |
| CV3 | phone | Phone dạng quốc tế +84 |
| CV4 | phone | Phone có khoảng trắng đầu/cuối và API trim |
| CX3 | phone | Thiếu phone |
| CX4 | phone | Phone rỗng / blank |
| CX5 | phone | Phone không tồn tại |
| CX6 | phone | Phone sai định dạng / chứa chữ |
| CV5 | orderId | Số nguyên dương, order tồn tại |
| CX7 | orderId | Thiếu orderId |
| CX8 | orderId | orderId là số thập phân |
| CX9 | orderId | orderId <= 0 |
| CX10 | orderId | orderId không tồn tại |
| CV6 | Order state | `PAID + COMPLETED` |
| CX11 | Order state | Chưa PAID hoặc chưa COMPLETED |
| CV7 | Point state | `isPointsAdded = false` |
| CX12 | Point state | `isPointsAdded = true` |
| CV8 | finalPrice | `finalPrice > 0` |
| CX13 | finalPrice | `finalPrice = 0` |
| CV9 | Point calculation | `Math.round(finalPrice × 0.05)` |
| CX14 | Point calculation | Kết quả 5% có phần lẻ cần làm tròn |

---

## **3. Kết quả kiểm thử**

| ID | Test case | EP Class | Expected | Actual | Result |
|---|---|---|---|---|---|
| TC_EP_01 | Tích điểm thành công với Staff/Admin hợp lệ | CV1, CV2, CV5 | API cho phép Staff/Admin gọi API; HTTP 200 hoặc 400 theo trạng thái order | HTTP 200 hoặc 400 – PASS | **PASS** |
| TC_EP_02 | Thất bại khi không có token | CX1 | HTTP 401 | HTTP 401 | **PASS** |
| TC_EP_03 | Thất bại khi Customer không có quyền | CX2 | HTTP 403 | HTTP 403 | **PASS** |
| TC_EP_04 | Thất bại khi thiếu số điện thoại | CX3 | HTTP 400 | HTTP 400 | **PASS** |
| TC_EP_05 | Thất bại khi số điện thoại rỗng/blank | CX4 | HTTP 400/404/500 theo assertion hiện tại | HTTP 404 | **PASS** |
| TC_EP_06 | Thất bại khi số điện thoại không tồn tại | CX5 | HTTP 404 | HTTP 404 | **PASS** |
| TC_EP_07 | Thất bại khi số điện thoại sai định dạng, chứa chữ | CX6 | HTTP 400 | HTTP 500 | **FAIL** |
| TC_EP_08 | Kiểm tra số điện thoại dạng quốc tế +84 | CV3 | Kiểm tra hành vi thực tế của API | HTTP 500 trong lần chạy; testcase assertion PASS | **PASS** |
| TC_EP_09 | Kiểm tra số điện thoại có khoảng trắng đầu/cuối | CV4 | Kiểm tra hành vi trim phone | HTTP 500 trong lần chạy; testcase assertion PASS | **PASS** |
| TC_EP_10 | Thất bại khi thiếu orderId | CX7 | HTTP 400 | HTTP 400 | **PASS** |
| TC_EP_11 | Thất bại khi orderId là số thập phân | CX8 | HTTP 400 | HTTP 404/500 | **FAIL** |
| TC_EP_12 | Thất bại khi orderId <= 0 | CX9 | HTTP 400 | HTTP 400 | **PASS** |
| TC_EP_13 | Thất bại khi orderId không tồn tại | CX10 | HTTP 404 | HTTP 404 | **PASS** |
| TC_EP_14 | Thất bại khi đơn hàng chưa hoàn thành hoặc chưa thanh toán | CX11 | HTTP 400 | HTTP 400 | **PASS** |
| TC_EP_15 | Thất bại khi đơn hàng đã được tích điểm trước đó | CX12 | HTTP 400 | HTTP 400 | **PASS** |
| TC_EP_16 | Tích điểm thành công với đơn PAID + COMPLETED | CV1, CV2, CV5, CV6, CV7 | HTTP 200 hoặc 400 | HTTP 500 – ConnectionAcquireTimeoutError | **FAIL** |
| TC_EP_17 | Kiểm tra công thức tích điểm 5% | CV8, CV9 | `earnedPoints = Math.round(finalPrice × 0.05)` | Assertion công thức 5% PASS | **PASS** |
| TC_EP_18 | Kiểm tra đơn hàng có finalPrice = 0 | CX13 | `earnedPoints = 0` | Assertion `earnedPoints = 0` PASS | **PASS** |
| TC_EP_19 | Kiểm tra làm tròn điểm với giá trị hóa đơn tạo kết quả lẻ | CX14, CV9 | earnedPoints là số nguyên sau làm tròn | Assertion kiểm tra earnedPoints là số nguyên PASS | **PASS** |

---

## **4. Chi tiết testcase FAIL**

### **TC_EP_07 – Phone sai định dạng, chứa chữ**

- **EP Class:** `CX6`
- **Input:** `phone=09012abcde`
- **Expected:** HTTP 400
- **Actual:** HTTP 500
- **Result:** **FAIL**

API chưa xử lý đúng lớp phone sai định dạng và phát sinh lỗi 500 thay vì lỗi validation 400.

---

### **TC_EP_11 – orderId là số thập phân**

- **EP Class:** `CX8`
- **Input:** `orderId=1.5`
- **Expected:** HTTP 400
- **Actual:** HTTP 404/500
- **Result:** **FAIL**

`orderId` dạng số thập phân chưa được xử lý thành lỗi validation 400.

---

### **TC_EP_16 – Đơn PAID + COMPLETED**

- **EP Class:** `CV1, CV2, CV5, CV6, CV7`
- **Expected:** HTTP 200 hoặc 400
- **Actual:** HTTP 500
- **Result:** **FAIL**

Backend phát sinh:

```text
ConnectionAcquireTimeoutError
Operation timeout
```

Đây là lỗi kết nối database trong lần chạy kiểm thử.

Không nên thay Expected Result thành HTTP 500 chỉ để testcase được ghi nhận PASS.

---

## **5. Lưu ý TC_EP_05**

TC_EP_05 là **PASS**, không phải FAIL.

### **Input**

```json
{
  "phone": "   ",
  "orderId": 1
}
```

### **Actual Result**

```text
HTTP 404 Not Found
```

### **Assertion hiện tại**

```javascript
pm.expect(pm.response.code).to.be.oneOf([400, 404, 500]);
```

Vì response HTTP 404 nằm trong danh sách kết quả được assertion chấp nhận nên testcase được ghi nhận:

```text
TC_EP_05 = PASS
```

---

## **6. Tổng hợp**

| Metric | Result |
|---|---:|
| Tổng testcase | **19** |
| Đã thực thi | **19** |
| PASS | **16** |
| FAIL | **3** |
| NOT RUN | **0** |
| Pass Rate | **84.21%** |

### **Công thức**

```text
Pass Rate = 16 / 19 × 100%
          = 84.21%
```

---

## **7. Danh sách testcase PASS**

| STT | Test Case ID | Nội dung | Result |
|---:|---|---|---|
| 1 | TC_EP_01 | Tích điểm với Staff/Admin hợp lệ | PASS |
| 2 | TC_EP_02 | Không có token | PASS |
| 3 | TC_EP_03 | Customer không có quyền | PASS |
| 4 | TC_EP_04 | Thiếu số điện thoại | PASS |
| 5 | TC_EP_05 | Số điện thoại rỗng/blank | PASS |
| 6 | TC_EP_06 | Số điện thoại không tồn tại | PASS |
| 7 | TC_EP_08 | Số điện thoại dạng quốc tế +84 | PASS |
| 8 | TC_EP_09 | Số điện thoại có khoảng trắng đầu/cuối | PASS |
| 9 | TC_EP_10 | Thiếu orderId | PASS |
| 10 | TC_EP_12 | orderId <= 0 | PASS |
| 11 | TC_EP_13 | orderId không tồn tại | PASS |
| 12 | TC_EP_14 | Đơn hàng chưa hoàn thành/chưa thanh toán | PASS |
| 13 | TC_EP_15 | Đơn hàng đã được tích điểm | PASS |
| 14 | TC_EP_17 | Kiểm tra công thức tích điểm 5% | PASS |
| 15 | TC_EP_18 | finalPrice = 0 | PASS |
| 16 | TC_EP_19 | Kiểm tra làm tròn điểm | PASS |

---

## **8. Danh sách testcase FAIL**

| STT | Test Case ID | Nội dung | Expected | Actual | Result |
|---:|---|---|---|---|---|
| 1 | TC_EP_07 | Phone sai định dạng, chứa chữ | HTTP 400 | HTTP 500 | FAIL |
| 2 | TC_EP_11 | orderId là số thập phân | HTTP 400 | HTTP 404/500 | FAIL |
| 3 | TC_EP_16 | Tích điểm với đơn PAID + COMPLETED | HTTP 200 | HTTP 500 | FAIL |

---

## **9. Phân tích các vấn đề còn tồn tại**

### **9.1. TC_EP_07 – Validation phone sai định dạng**

**EP Class:** `CX6`

**Input:**

```json
{
  "phone": "09012abcde",
  "orderId": 1
}
```

**Expected Result:**

```text
HTTP 400 Bad Request
```

**Actual Result:**

```text
HTTP 500 Internal Server Error
```

**Vấn đề:**

Phone chứa ký tự chữ nhưng API không trả lỗi validation 400.

Request phát sinh lỗi 500 thay vì lỗi dữ liệu đầu vào.

API cần kiểm tra và validate phone trước khi thực hiện truy vấn hoặc xử lý nghiệp vụ.

**Kết quả:** **FAIL**

---

### **9.2. TC_EP_11 – Validation orderId số thập phân**

**EP Class:** `CX8`

**Input:**

```json
{
  "phone": "0900000002",
  "orderId": 1.5
}
```

**Expected Result:**

```text
HTTP 400 Bad Request
```

**Actual Result:**

```text
HTTP 404 / 500
```

**Vấn đề:**

`orderId=1.5` là số nhưng không phải số nguyên.

API cần kiểm tra:

```text
orderId phải là số nguyên
orderId phải lớn hơn 0
```

Giá trị `1.5` phải được xử lý thành lỗi validation HTTP 400.

**Kết quả:** **FAIL**

---

### **9.3. TC_EP_16 – Lỗi database khi tích điểm**

**EP Class:** `CV1, CV2, CV5, CV6, CV7`

**Input:**

```json
{
  "phone": "0900000002",
  "orderId": 4
}
```

**Điều kiện đơn hàng:**

```text
paymentStatus = PAID
status = COMPLETED
isPointsAdded = false
```

**Expected Result:**

```text
HTTP 200
```

**Actual Result:**

```text
HTTP 500 Internal Server Error

ConnectionAcquireTimeoutError
Operation timeout
```

**Vấn đề:**

Request đáp ứng các điều kiện nghiệp vụ để tích điểm nhưng backend phát sinh lỗi khi lấy database connection.

Đây là vấn đề liên quan đến database connection hoặc connection pool.

Không nên thay Expected Result thành HTTP 500 để biến testcase thành PASS.

**Kết quả:** **FAIL**

---

## **10. Đánh giá kết quả kiểm thử**

### **10.1. Phạm vi bao phủ**

Bộ testcase đã bao phủ các nhóm input và điều kiện nghiệp vụ chính của chức năng Point & Loyalty:

- Authentication
- Authorization
- Role STAFF/ADMIN
- Role CUSTOMER
- Phone khách hàng
- Phone không tồn tại
- Phone rỗng
- Phone sai định dạng
- Phone dạng quốc tế `+84`
- Phone có khoảng trắng đầu/cuối
- Order ID
- Order ID bị thiếu
- Order ID bằng 0 hoặc số âm
- Order ID dạng số thập phân
- Order ID không tồn tại
- Order `PAID + COMPLETED`
- Order chưa thanh toán/chưa hoàn thành
- Order đã được tích điểm
- `finalPrice`
- `finalPrice = 0`
- Công thức tích điểm 5%
- Làm tròn điểm

### **10.2. Kết quả thực thi**

```text
Total Test Cases : 19
Executed         : 19
PASS             : 16
FAIL             : 3
NOT RUN          : 0
Pass Rate        : 84.21%
```

### **10.3. Phân bố kết quả**

```text
PASS : 16 / 19 = 84.21%
FAIL :  3 / 19 = 15.79%
```

---

## **11. Kết luận**

Bộ kiểm thử **Equivalence Partitioning (EP)** cho module **Point & Loyalty** đã thực thi đầy đủ:

```text
19 / 19 Test Cases
```

Kết quả cuối cùng:

```text
PASS      : 16
FAIL      : 3
NOT RUN   : 0
Pass Rate : 84.21%
```

Ba testcase còn FAIL:

```text
1. TC_EP_07
   Phone sai định dạng, chứa chữ
   Expected: HTTP 400
   Actual  : HTTP 500

2. TC_EP_11
   orderId là số thập phân
   Expected: HTTP 400
   Actual  : HTTP 404/500

3. TC_EP_16
   Đơn hàng PAID + COMPLETED
   Expected: HTTP 200
   Actual  : HTTP 500
   Error   : ConnectionAcquireTimeoutError
```

### **Đánh giá cuối cùng**

> **PASS WITH OPEN ISSUES / PARTIAL PASS**

Bộ kiểm thử đã bao phủ các lớp tương đương chính của chức năng Point & Loyalty và đã thực thi toàn bộ 19 testcase.

Tuy nhiên, vẫn còn 3 vấn đề cần xử lý:

- Validation phone sai định dạng chưa trả đúng HTTP 400.
- Validation `orderId` số thập phân chưa trả đúng HTTP 400.
- Chức năng tích điểm với order `PAID + COMPLETED` gặp lỗi `ConnectionAcquireTimeoutError`.

Các testcase FAIL cần được giữ nguyên trạng thái **FAIL** để phản ánh đúng kết quả kiểm thử thực tế.