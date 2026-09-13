# KẾT QUẢ THỰC THI KIỂM THỬ BVA (TEST EXECUTION RESULT)

**Dự án:** FutureSushi - Hệ thống Đặt món & Quản lý Nhà hàng Sushi

**Module kiểm thử:** Reservation Management

**Loại kiểm thử:** Boundary Value Analysis (BVA)

**Đối tượng kiểm thử:** `backend/src/controllers/reservationController.js`

**File Test Suite:** `backend/bva-tests/reservationBVA.test.js`

**Môi trường kiểm thử:** Node.js, Jest Test Runner

---

## 1. TỔNG KẾT KẾT QUẢ THỰC THI

| Chỉ số | Kết quả thực tế | Đánh giá |
|---|---:|---|
| Tổng số Test Suites | 1 / 1 | PASS |
| Tổng số Test Cases | 10 | Hoàn thành |
| Passed | 10 | 100% |
| Failed | 0 | 0% |
| Pass Rate | 100% | Đạt yêu cầu |

### Lệnh thực thi

`npx jest bva-tests/reservationBVA.test.js`

---

## 2. PHƯƠNG PHÁP KIỂM THỬ BVA

### 2.1 Standard Boundary Value Analysis – 4n+1

Trong chức năng checkIn, hệ thống kiểm tra thời gian check-in trong khoảng từ 30 phút trước đến 30 phút sau giờ đặt bàn.

Điều kiện kiểm tra trong chương trình:

if (diffMins < -30 || diffMins > 30)

Miền giá trị hợp lệ:

-30 phút ≤ Check-in Offset ≤ +30 phút

Biến đầu vào được kiểm thử theo phương pháp Standard BVA:

n = 1

Theo công thức:

4n + 1 = 4 × 1 + 1 = 5 Test Cases

Các giá trị được kiểm thử:

Min: -30 phút
Min + 1: -29 phút
Nominal: 0 phút
Max - 1: +29 phút
Max: +30 phút

### 2.2 Robust Boundary Value Analysis

Ngoài Standard BVA, kiểm thử thêm các giá trị nằm ngay ngoài miền hợp lệ:

Min - 1: -31 phút
Max + 1: +31 phút

Hai trường hợp này được sử dụng để kiểm tra khả năng hệ thống từ chối check-in ngoài khoảng thời gian cho phép.

### 2.3 Conditional Boundary – Table Capacity

Trong chức năng createReservation, hệ thống lựa chọn bàn dựa trên điều kiện:

capacity >= numberOfGuests

Với bàn có sức chứa:

Capacity = 4

Các giá trị được kiểm thử:

C - 1: 3 khách
C: 4 khách
C + 1: 5 khách

## 3. KẾT QUẢ CHI TIẾT THEO TEST GROUP

### 3.1 STANDARD BVA – CHECK-IN TIME (4n+1)

| Test Case ID | Boundary Type | Test Data | Expected Result | Actual Result | Status |
|---|---|---|---|---|---|
| BVA-RES-01 | Min | -30 phút | Cho phép check-in thành công | PASS | PASS |
| BVA-RES-02 | Min + 1 | -29 phút | Cho phép check-in thành công | PASS | PASS |
| BVA-RES-03 | Nominal | 0 phút | Cho phép check-in thành công | PASS | PASS |
| BVA-RES-04 | Max - 1 | +29 phút | Cho phép check-in thành công | PASS | PASS |
| BVA-RES-05 | Max | +30 phút | Cho phép check-in thành công | PASS | PASS |

**Kết quả:**

- Passed: 5 / 5
- Failed: 0
- Status: **PASS**

---

### 3.2 ROBUST BVA – OUTSIDE CHECK-IN BOUNDARY

| Test Case ID | Boundary Type | Test Data | Expected Result | Actual Result | Status |
|---|---|---|---|---|---|
| BVA-RES-06 | Min - 1 | -31 phút | HTTP 400 – Check-in quá sớm | PASS | PASS |
| BVA-RES-07 | Max + 1 | +31 phút | HTTP 400 – Check-in quá muộn | PASS | PASS |

**Kết quả:**

- Passed: 2 / 2
- Failed: 0
- Status: **PASS**

---

### 3.3 CONDITIONAL BOUNDARY – TABLE CAPACITY

| Test Case ID | Boundary Type | Test Data | Expected Result | Actual Result | Status |
|---|---|---|---|---|---|
| BVA-RES-08 | C - 1 | Capacity = 4, Guests = 3 | Có bàn phù hợp, tạo reservation thành công | PASS | PASS |
| BVA-RES-09 | C | Capacity = 4, Guests = 4 | Có bàn phù hợp, tạo reservation thành công | PASS | PASS |
| BVA-RES-10 | C + 1 | Guests = 5, không có bàn phù hợp | HTTP 400 – Không có bàn phù hợp | PASS | PASS |

**Kết quả:**

- Passed: 3 / 3
- Failed: 0
- Status: **PASS**

## 4. KẾT QUẢ THỰC THI TỔNG HỢP

| Nhóm kiểm thử | Số Test Cases | Passed | Failed | Status |
|---|---:|---:|---:|---|
| Standard BVA – Check-in Time | 5 | 5 | 0 | PASS |
| Robust BVA – Outside Boundary | 2 | 2 | 0 | PASS |
| Conditional Boundary – Table Capacity | 3 | 3 | 0 | PASS |
| **TỔNG CỘNG** | **10** | **10** | **0** | **PASS** |

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
## 6. ĐÁNH GIÁ KẾT QUẢ

Kết quả thực thi cho thấy toàn bộ **10 Test Cases** của Reservation BVA đều thực thi thành công.

### Standard BVA

Standard BVA được áp dụng cho biến **Check-in Offset**.

Với:

- `n = 1`
- `4n + 1 = 5 Test Cases`

Cả 5 giá trị biên đều cho kết quả đúng như mong đợi.

### Robust BVA

Hai trường hợp nằm ngoài miền giá trị hợp lệ:

- `-31 phút`
- `+31 phút`

đều bị hệ thống từ chối và trả về HTTP 400.

### Conditional Boundary Testing

Điều kiện được kiểm thử:

`capacity >= numberOfGuests`

Các giá trị được kiểm thử:

- `C - 1`
- `C`
- `C + 1`

Kết quả cho thấy hệ thống có thể lựa chọn bàn phù hợp với số lượng khách và trả về HTTP 400 khi không có bàn phù hợp.

## 7. GHI CHÚ VỀ SỐ LƯỢNG TEST CASE

> **Lưu ý quan trọng:** Công thức `4n + 1` chỉ được áp dụng cho **Standard Boundary Value Analysis**.

Trong Test Suite này:

### Standard BVA

- `n = 1`
- `4n + 1 = 5 Test Cases`

Ngoài 5 Test Cases của Standard BVA, Test Suite còn bao gồm:

- **Robust BVA:** 2 Test Cases
- **Conditional Boundary Testing:** 3 Test Cases

Do đó:

`Tổng số Test Cases = 5 + 2 + 3 = 10`

Vì vậy, tổng cộng **10 Test Cases không mâu thuẫn với nguyên tắc 4n + 1**.

## 8. TÀI NGUYÊN BÀN GIAO

- **File mã nguồn BVA Test:** `backend/bva-tests/reservationBVA.test.js`
- **File BVA Test Cases:** `docs/testing/BVA/Reservation/BVA_Reservation_TestCases.xlsx`
- **File kết quả thực thi:** `docs/testing/BVA/Reservation/BVA_Reservation_Test_Execution_Result.md`
- **Đối tượng kiểm thử:** `backend/src/controllers/reservationController.js`

## 9. KẾT LUẬN

Module **Reservation Management** đã được kiểm thử bằng phương pháp **Boundary Value Analysis (BVA)**.

Các nội dung được kiểm thử bao gồm:

- Giá trị biên của thời gian Check-in từ `-30` đến `+30 phút`.
- Các giá trị nằm ngay ngoài miền hợp lệ.
- Giá trị biên giữa số lượng khách và sức chứa bàn.
- Điều kiện lựa chọn bàn phù hợp.
- Trường hợp không tồn tại bàn phù hợp.

### KẾT QUẢ CUỐI CÙNG

| Chỉ số | Kết quả |
|---|---|
| Test Suites | 1 / 1 PASS |
| Test Cases | 10 / 10 PASS |
| Passed | 10 |
| Failed | 0 |
| Pass Rate | 100% |

## KẾT QUẢ CUỐI CÙNG: PASS