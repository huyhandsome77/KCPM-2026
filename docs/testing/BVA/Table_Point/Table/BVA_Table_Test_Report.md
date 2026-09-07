# BÁO CÁO KẾT QUẢ KIỂM THỬ BVA – TABLE MODULE

**Học phần:** Kiểm chứng và Đảm bảo Chất lượng Phần mềm (KCPM)  
**Dự án:** FutureSushi – Hệ thống Đặt món & Quản lý Nhà hàng Sushi  
**Phương pháp:** Boundary Value Analysis (BVA) – công thức 4n+1  
**Bộ testcase:** BVA Table 4n+1 – EXACTLY 17 TEST CASES  
**Công cụ thực thi:** Postman  
**Môi trường:** FutureSushi – Local Environment  
**Base URL:** `http://localhost:3000`  
**API:** `POST /api/tables`  
**Ngày thực thi:** 04/09/2026

---

# 1. MỤC TIÊU KIỂM THỬ

* Kiểm tra hành vi của API tạo bàn tại `/api/tables`.
* Kiểm tra các giá trị biên của các biến đầu vào trong bộ BVA.
* Kiểm tra cả Status Code và Payload Body của response.
* Ghi nhận kết quả PASS/FAIL theo đúng kết quả thực tế khi chạy Postman.
* Không thay đổi source code hoặc dữ liệu hệ thống để làm thay đổi kết quả kiểm thử.

---

# 2. PHẠM VI KIỂM THỬ

Phạm vi thực thi gồm đúng **17 testcase BVA** trong collection:

* TB-001: Baseline / Nominal.
* TB-002 → TB-005: Biên `tableNumber`.
* TB-006 → TB-009: Biên `capacity`.
* TB-010 → TB-013: Biên độ dài `qrCode`.
* TB-014 → TB-017: Các giá trị biên của `status`.

API được kiểm thử:

```text
POST http://localhost:3000/api/tables
```

Các request được thực hiện trên môi trường:

```text
FutureSushi - Local Environment
```

---

# 3. THIẾT KẾ BVA / 4n+1

Bộ testcase được tổ chức theo công thức:

```text
4n + 1
```

với:

```text
n = 4 biến/nhóm dữ liệu đầu vào được kiểm tra biên
```

Tổng số testcase:

```text
4 × 4 + 1 = 17 testcase
```

Các nhóm testcase được tổ chức:

| Nhóm | Testcase | Nội dung |
|---|---|---|
| Baseline | TB-001 | Giá trị nominal |
| tableNumber | TB-002 → TB-005 | Min, Min+1, Max-1, Max |
| capacity | TB-006 → TB-009 | Min, Min+1, Max-1, Max |
| qrCode | TB-010 → TB-013 | length Min, Min+1, Max-1, Max |
| status | TB-014 → TB-017 | 4 giá trị biên/đại diện |

---

# 4. DANH SÁCH TEST CASE VÀ KẾT QUẢ THỰC THI

## 4.1. Baseline

### BVA-TB-001 – Baseline / Nominal

* Method: `POST`
* Endpoint: `/api/tables`
* Input:
  * `tableNumber = 600`
  * `capacity = 4`
  * `qrCode = BVA-BASE-600`
  * `status = AVAILABLE`
* Expected: `201 Created`, payload có `message` và `table`.
* Actual: `201 Created`.
* Assertions: **9/9 PASS**.
* Kết quả: **PASS**.
* Note: Tạo bàn thành công; response trả đúng các field chính theo input.

---

## 4.2. tableNumber

### BVA-TB-002 – tableNumber Min

* Input: `tableNumber = 1`.
* Expected: `201 Created`.
* Actual: `400 Bad Request`.
* Assertions: **3/9 PASS**.
* Kết quả: **FAIL**.
* Payload thực tế:
```json
{
  "message": "Bàn #1 đã tồn tại trong hệ thống!"
}
```
* Ghi nhận: testcase không đạt do dữ liệu bàn #1 đã tồn tại và đang có Order #3 chưa hoàn tất.
* Không thay đổi dữ liệu hoặc source code để ép testcase PASS.

### BVA-TB-003 – tableNumber Min+1

* Input: `tableNumber = 2`.
* Expected: `201 Created`.
* Actual: `400 Bad Request`.
* Assertions: **3/9 PASS**.
* Payload thực tế:
```json
{
  "message": "Bàn #2 đã tồn tại trong hệ thống!"
}
```
* Ghi nhận: testcase không đạt do bàn #2 đã tồn tại trong hệ thống.
* Không thay đổi dữ liệu hoặc source code để ép testcase PASS.

### BVA-TB-004 – tableNumber Max-1

* Input: `tableNumber = 999`.
* Expected: `201 Created`.
* Actual: `201 Created`.
* Assertions: **9/9 PASS**.
* Kết quả: **PASS**.
* Response trả `tableNumber = 999`.

### BVA-TB-005 – tableNumber Max

* Input: `tableNumber = 1000`.
* Expected: `201 Created`.
* Actual: `201 Created`.
* Assertions: **9/9 PASS**.
* Kết quả: **PASS**.
* Response trả `tableNumber = 1000`.

---

## 4.3. capacity

### BVA-TB-006 – capacity Min

* Input: `capacity = 1`.
* Actual: `201 Created`.
* Assertions: **9/9 PASS**.
* Kết quả: **PASS**.
* Response trả `capacity = 1`.

### BVA-TB-007 – capacity Min+1

* Input: `capacity = 2`.
* Actual: `201 Created`.
* Assertions: **9/9 PASS**.
* Kết quả: **PASS**.
* Response trả `capacity = 2`.

### BVA-TB-008 – capacity Max-1

* Input: `capacity = 19`.
* Actual: `201 Created`.
* Assertions: **9/9 PASS**.
* Kết quả: **PASS**.
* Response trả `capacity = 19`.

### BVA-TB-009 – capacity Max

* Input: `capacity = 20`.
* Actual: `201 Created`.
* Assertions: **9/9 PASS**.
* Kết quả: **PASS**.
* Response trả `capacity = 20`.

---

## 4.4. qrCode length

### BVA-TB-010 – qrCode length Min

* Input: `qrCode = "Q"`.
* Actual: `201 Created`.
* Assertions: **9/9 PASS**.
* Kết quả: **PASS**.

### BVA-TB-011 – qrCode length Min+1

* Input: `qrCode = "QR"`.
* Actual: `201 Created`.
* Assertions: **9/9 PASS**.
* Kết quả: **PASS**.

### BVA-TB-012 – qrCode length Max-1

* Input: qrCode tại giá trị độ dài `Max-1`.
* Actual: `201 Created`.
* Assertions: **9/9 PASS**.
* Kết quả: **PASS**.

### BVA-TB-013 – qrCode length Max

* Input: qrCode tại giá trị độ dài `Max`.
* Actual: `201 Created`.
* Assertions: **9/9 PASS**.
* Kết quả: **PASS**.

---

## 4.5. status

### BVA-TB-014 – status Min

* Input: `status = AVAILABLE`.
* Actual: `201 Created`.
* Assertions: **9/9 PASS**.
* Kết quả: **PASS**.
* Response trả `status = AVAILABLE`.

### BVA-TB-015 – status Min+1

* Input: `status = BOOKED`.
* Actual: `201 Created`.
* Assertions: **9/9 PASS**.
* Kết quả: **PASS**.
* Response trả `status = BOOKED`.

### BVA-TB-016 – status Max-1

* Input: `status = OCCUPIED`.
* Actual: `201 Created`.
* Assertions: **9/9 PASS**.
* Kết quả: **PASS**.
* Response trả `status = OCCUPIED`.

### BVA-TB-017 – status Max

* Input: `status = CLEANING`.
* Actual: `201 Created`.
* Assertions: **9/9 PASS**.
* Kết quả: **PASS**.
* Response trả `status = CLEANING`.

---

# 5. KẾT QUẢ THỰC THI

| Chỉ số | Kết quả |
|---|---:|
| Tổng testcase | **17** |
| PASS | **15** |
| FAIL | **2** |
| Pass Rate | **88.24%** |
| Fail Rate | **11.76%** |

Tình trạng thực thi:

```text
15/17 testcase PASS
2/17 testcase FAIL
```

Các testcase PASS đều ghi nhận response thành công `201 Created` và bộ assertion trong Postman đạt `9/9`.

Hai testcase FAIL:

* **BVA-TB-002:** Expected `201`, Actual `400` – bàn #1 đã tồn tại và đang có Order #3 chưa hoàn tất.
* **BVA-TB-003:** Expected `201`, Actual `400` – bàn #2 đã tồn tại trong hệ thống.

---

# 6. PHÂN TÍCH PAYLOAD VÀ ASSERTION

Bộ test Postman đã kiểm tra nhiều thành phần của response thay vì chỉ kiểm tra Status Code.

Đối với testcase PASS, Postman ghi nhận:

* Status code đúng `201`.
* Response là JSON.
* Response time dưới ngưỡng kiểm tra.
* Payload có `message`.
* Payload có object `table`.
* `tableNumber` trong response khớp input.
* `capacity` trong response khớp input.
* `qrCode` trong response khớp input.
* `status` trong response khớp input.

Tổng số assertion theo testcase PASS được ghi nhận là:

```text
9/9 PASS
```

Đối với TB-002 và TB-003, response thực tế là lỗi nghiệp vụ `400`, vì vậy các assertion yêu cầu payload `table` không đạt. Đây là kết quả đúng với response thực tế và được giữ nguyên trong execution result.

---

# 7. UNCOVERED / FAILED CASES

## BVA-TB-002

**Nguyên nhân thực tế:**

```text
Bàn #1 đã tồn tại trong hệ thống
và đang có Order #3 chưa hoàn tất.
```

API trả:

```text
400 Bad Request
```

## BVA-TB-003

**Nguyên nhân thực tế:**

```text
Bàn #2 đã tồn tại trong hệ thống.
```

API trả:

```text
400 Bad Request
```

Hai trường hợp trên là kết quả phát sinh từ dữ liệu hiện tại của môi trường test. Không chỉnh sửa source code hoặc dữ liệu để loại bỏ FAIL.

---

# 8. ĐÁNH GIÁ CHẤT LƯỢNG BỘ TEST

* Bộ kiểm thử có đúng **17 testcase**, tương ứng với bộ BVA `4n+1` đã thiết kế.
* Các testcase được thực thi trực tiếp trên API `/api/tables` bằng Postman.
* Kết quả có phân biệt rõ PASS và FAIL.
* Payload Body được kiểm tra cùng với Status Code.
* Hai FAIL được ghi nhận theo đúng response thực tế.
* Không sửa source code hoặc dữ liệu hệ thống để làm đẹp kết quả.
* Kết quả hiện tại phản ánh trạng thái thực tế của môi trường Local tại thời điểm test.

---

# 9. KẾT LUẬN

Bộ **BVA Table 4n+1 gồm 17 testcase** đã được thực thi trên Postman.

Kết quả:

```text
PASS = 15/17
FAIL = 2/17
Pass Rate = 88.24%
```

---
