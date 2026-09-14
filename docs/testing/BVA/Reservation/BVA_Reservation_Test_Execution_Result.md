# KẾT QUẢ THỰC THI KIỂM THỬ BVA (TEST EXECUTION RESULT)

**Dự án:** FutureSushi  
**Module kiểm thử:** Reservation Management  
**Loại kiểm thử:** Boundary Value Analysis (BVA)  
**Đối tượng kiểm thử:** `backend/src/controllers/reservationController.js`  
**Test Suite:** `backend/bva-tests/reservationBVA.test.js`  
**Môi trường:** Node.js, Jest Test Runner

---

## 1. TỔNG KẾT KẾT QUẢ THỰC THI

| Chỉ số | Kết quả | Đánh giá |
|---|---:|---|
| Tổng số Test Suites | 1 / 1 | PASS |
| Tổng số Test Cases | 10 | Hoàn thành |
| Passed | 10 | 100% |
| Failed | 0 | 0% |
| Pass Rate | 100% | Đạt yêu cầu |

### Lệnh thực thi

```bash
npx jest bva-tests/reservationBVA.test.js
```

---

## 2. PHƯƠNG PHÁP KIỂM THỬ BVA

### 2.1. Standard Boundary Value Analysis – 4n+1

Trong chức năng `checkIn`, hệ thống kiểm tra thời gian check-in trong khoảng từ 30 phút trước đến 30 phút sau giờ đặt bàn.

Điều kiện kiểm tra:

```javascript
if (diffMins < -30 || diffMins > 30)
```

Miền giá trị hợp lệ:

```text
-30 phút ≤ Check-in Offset ≤ +30 phút
```

Với phương pháp Standard BVA:

```text
n = 1

4n + 1 = 4 × 1 + 1 = 5 Test Cases
```

Các giá trị được kiểm thử:

- **Min:** -30 phút
- **Min + 1:** -29 phút
- **Nominal:** 0 phút
- **Max - 1:** +29 phút
- **Max:** +30 phút

### 2.2. Robust Boundary Value Analysis

Kiểm thử thêm các giá trị nằm ngay ngoài miền hợp lệ:

- **Min - 1:** -31 phút
- **Max + 1:** +31 phút

Hai trường hợp này dùng để kiểm tra khả năng hệ thống từ chối check-in ngoài khoảng thời gian cho phép.

### 2.3. Conditional Boundary – Table Capacity

Trong chức năng `createReservation`, hệ thống lựa chọn bàn dựa trên điều kiện:

```text
capacity >= numberOfGuests
```

Với sức chứa bàn:

```text
Capacity = 4
```

Các giá trị được kiểm thử:

- **C - 1:** 3 khách
- **C:** 4 khách
- **C + 1:** 5 khách

---

## 3. KẾT QUẢ CHI TIẾT THEO TEST GROUP

### 3.1. STANDARD BVA – CHECK-IN TIME (4n+1)

| Test Case ID | Boundary Type | Test Data | Expected Result | Actual Result | Status |
|---|---|---|---|---|---|
| BVA-RES-01 | Min | -30 phút | Cho phép check-in thành công | PASS | PASS |
| BVA-RES-02 | Min + 1 | -29 phút | Cho phép check-in thành công | PASS | PASS |
| BVA-RES-03 | Nominal | 0 phút | Cho phép check-in thành công | PASS | PASS |
| BVA-RES-04 | Max - 1 | +29 phút | Cho phép check-in thành công | PASS | PASS |
| BVA-RES-05 | Max | +30 phút | Cho phép check-in thành công | PASS | PASS |

**Kết quả:** 5 / 5 Test Cases PASS.

---

### 3.2. ROBUST BVA – OUTSIDE CHECK-IN BOUNDARY

| Test Case ID | Boundary Type | Test Data | Expected Result | Actual Result | Status |
|---|---|---|---|---|---|
| BVA-RES-06 | Min - 1 | -31 phút | HTTP 400 – Check-in quá sớm | PASS | PASS |
| BVA-RES-07 | Max + 1 | +31 phút | HTTP 400 – Check-in quá muộn | PASS | PASS |

**Kết quả:** 2 / 2 Test Cases PASS.

---

### 3.3. CONDITIONAL BOUNDARY – TABLE CAPACITY

| Test Case ID | Boundary Type | Test Data | Expected Result | Actual Result | Status |
|---|---|---|---|---|---|
| BVA-RES-08 | C - 1 | Capacity = 4, Guests = 3 | Có bàn phù hợp, tạo reservation thành công | PASS | PASS |
| BVA-RES-09 | C | Capacity = 4, Guests = 4 | Có bàn phù hợp, tạo reservation thành công | PASS | PASS |
| BVA-RES-10 | C + 1 | Capacity = 4, Guests = 5 | HTTP 400 – Số lượng khách vượt quá sức chứa tối đa | PASS | PASS |

**Kết quả:** 3 / 3 Test Cases PASS.

---

## 4. KẾT QUẢ THỰC THI TỔNG HỢP

| Nhóm kiểm thử | Số Test Cases | Passed | Failed | Status |
|---|---:|---:|---:|---|
| Standard BVA – Check-in Time | 5 | 5 | 0 | PASS |
| Robust BVA – Outside Boundary | 2 | 2 | 0 | PASS |
| Conditional Boundary – Table Capacity | 3 | 3 | 0 | PASS |
| **TỔNG CỘNG** | **10** | **10** | **0** | **PASS** |

---

## 5. RAW TEST EXECUTION LOG

```text
PASS bva-tests/reservationBVA.test.js

RESERVATION BVA TEST SUITE

  STANDARD BVA - CHECK-IN TIME (4n+1)
    √ BVA-01: should allow check-in exactly 30 minutes before reservation time
    √ BVA-02: should allow check-in 29 minutes before reservation time
    √ BVA-03: should allow check-in exactly at reservation time
    √ BVA-04: should allow check-in 29 minutes after reservation time
    √ BVA-05: should allow check-in exactly 30 minutes after reservation time

  ROBUST BVA - OUTSIDE CHECK-IN BOUNDARY
    √ RBVA-01: should reject check-in 31 minutes before reservation time
    √ RBVA-02: should reject check-in 31 minutes after reservation time

  CONDITIONAL BOUNDARY - TABLE CAPACITY
    √ CAP-01: should accept 3 guests for table capacity 4
    √ CAP-02: should accept exactly 4 guests for table capacity 4
    √ CAP-03: should reject 5 guests when no suitable table is available

Test Suites: 1 passed, 1 total
Tests:       10 passed, 10 total
Snapshots:   0 total
```

---

## 6. ĐÁNH GIÁ KẾT QUẢ

Kết quả thực thi cho thấy toàn bộ **10 Test Cases** của Reservation BVA đều thực thi thành công.

### Standard BVA

Standard BVA được áp dụng cho biến **Check-in Offset**.

Với:

```text
n = 1
4n + 1 = 4 × 1 + 1 = 5 Test Cases
```

Cả 5 giá trị biên đều cho kết quả đúng như mong đợi:

- `-30 phút`
- `-29 phút`
- `0 phút`
- `+29 phút`
- `+30 phút`

### Robust BVA

Hai trường hợp nằm ngoài miền giá trị hợp lệ:

- `-31 phút`
- `+31 phút`

đều bị hệ thống từ chối và trả về HTTP 400.

### Conditional Boundary Testing

Điều kiện được kiểm thử:

```text
capacity >= numberOfGuests
```

Với:

```text
Capacity = 4
```

Các giá trị được kiểm thử:

- `C - 1 = 3 khách`
- `C = 4 khách`
- `C + 1 = 5 khách`

Kết quả:

- 3 khách → được chấp nhận.
- 4 khách → được chấp nhận.
- 5 khách → bị từ chối với HTTP 400 do vượt sức chứa tối đa.

---

## 7. GHI CHÚ VỀ SỐ LƯỢNG TEST CASE

**Lưu ý:** Công thức `4n + 1` chỉ được áp dụng cho **Standard Boundary Value Analysis**.

### Standard BVA

```text
n = 1
4n + 1 = 4 × 1 + 1 = 5 Test Cases
```

Gồm:

- `-30 phút`
- `-29 phút`
- `0 phút`
- `+29 phút`
- `+30 phút`

### Robust BVA

```text
2 Test Cases
```

Gồm:

- `-31 phút`
- `+31 phút`

### Conditional Boundary Testing

```text
3 Test Cases
```

Gồm:

- `3 khách`
- `4 khách`
- `5 khách`

### Tổng cộng

```text
Tổng số Test Cases
= Standard BVA + Robust BVA + Conditional Boundary
= 5 + 2 + 3
= 10 Test Cases
```

Vì vậy, tổng cộng **10 Test Cases không mâu thuẫn với nguyên tắc 4n + 1**.

---

## 8. TÀI NGUYÊN BÀN GIAO

- **File mã nguồn BVA Test:** `backend/bva-tests/reservationBVA.test.js`

- **File BVA Test Cases:** `docs/testing/BVA/Reservation/BVA_Reservation_TestCases.xlsx`

- **File kết quả thực thi:** `docs/testing/BVA/Reservation/BVA_Reservation_Test_Execution_Result.md`

- **Postman Collection:** `docs/testing/BVA/Reservation/BVA_Reservation_Postman_Collection.json`

- **Postman Environment:** `docs/testing/BVA/Reservation/BVA_Reservation_Postman_Environment.json`

- **Đối tượng kiểm thử:** `backend/src/controllers/reservationController.js`

---

## 9. KẾT LUẬN

Module **Reservation Management** đã được kiểm thử bằng phương pháp **Boundary Value Analysis (BVA)**.

Các nội dung được kiểm thử bao gồm:

- Giá trị biên của thời gian Check-in từ `-30` đến `+30 phút`.
- Giá trị ngay bên trong boundary: `-29` và `+29 phút`.
- Giá trị nominal: `0 phút`.
- Giá trị ngay ngoài miền hợp lệ: `-31` và `+31 phút`.
- Giá trị biên giữa số lượng khách và sức chứa bàn.
- Trường hợp số khách nhỏ hơn sức chứa.
- Trường hợp số khách bằng sức chứa.
- Trường hợp số khách vượt quá sức chứa.

### KẾT QUẢ CUỐI CÙNG

| Chỉ số | Kết quả |
|---|---:|
| Test Suites | **1 / 1 PASS** |
| Test Cases | **10 / 10 PASS** |
| Passed | **10** |
| Failed | **0** |
| Pass Rate | **100%** |

# KẾT QUẢ CUỐI CÙNG: PASS