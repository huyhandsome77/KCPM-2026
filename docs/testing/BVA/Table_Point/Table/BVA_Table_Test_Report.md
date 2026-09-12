# FutureSuShi – Báo cáo kiểm thử BVA Table

## 1. Thông tin chung

- **Module:** Table (Bàn)
- **Chức năng:** Tạo bàn mới
- **Phương thức:** `POST`
- **Endpoint:** `http://localhost:3000/api/tables`
- **Kỹ thuật kiểm thử:** Phân tích giá trị biên (Boundary Value Analysis – BVA)
- **Phương pháp:** BVA 4n+1
- **Tổng số biến có miền giá trị biên:** 3
- **Tổng số testcase BVA:** 13

---

## 2. Yêu cầu SRS

| Trường | Kiểu dữ liệu / Miền giá trị | Ràng buộc |
|---|---|---|
| `tableNumber` | Số nguyên dương, [1, 500] | Phải là duy nhất trong hệ thống |
| `capacity` | Số nguyên dương, [1, 50] | Giá trị từ 1 đến 50 |
| `status` | Giá trị phân loại | `AVAILABLE`, `OCCUPIED`, `RESERVED` |
| `qrCode` | Chuỗi ký tự, độ dài [10, 255] | Phải là duy nhất trong hệ thống |

### Phân loại trường để áp dụng BVA

- `tableNumber`: áp dụng BVA.
- `capacity`: áp dụng BVA.
- `qrCode`: áp dụng BVA theo **độ dài chuỗi**.
- `status`: không áp dụng BVA vì đây là trường phân loại; trường này phù hợp với kỹ thuật Phân hoạch tương đương (EP).
- Tính **duy nhất** của `tableNumber` và `qrCode` là ràng buộc nghiệp vụ riêng, cần kiểm thử bằng testcase riêng nếu cần.

---

## 3. Xác định các giá trị biên

Với BVA 4n+1:

- Có 3 biến cần kiểm thử BVA.
- Mỗi biến có 4 giá trị biên: **Min, Min+1, Max-1, Max**.
- Có 1 testcase Baseline/Nominal.
- Tổng số testcase:

**4 × 3 + 1 = 13 testcase**

### Bảng giá trị biên

| Trường | Min | Min+1 | Max-1 | Max |
|---|---:|---:|---:|---:|
| `tableNumber` | 1 | 2 | 499 | 500 |
| `capacity` | 1 | 2 | 49 | 50 |
| `qrCode` (độ dài) | 10 | 11 | 254 | 255 |

### Giá trị Baseline/Nominal

- `tableNumber = 250`
- `capacity = 25`
- `qrCode` có độ dài 100 ký tự
- `status = AVAILABLE`

---

## 4. Kết quả kiểm thử

| STT | Test Case ID | Nội dung | Kết quả |
|---:|---|---|---|
| 1 | BVA-TB-001 | Baseline / Nominal | **PASS** |
| 2 | BVA-TB-002 | `tableNumber` = Min = 1 | **FAIL** |
| 3 | BVA-TB-003 | `tableNumber` = Min+1 = 2 | **FAIL** |
| 4 | BVA-TB-004 | `tableNumber` = Max-1 = 499 | **PASS** |
| 5 | BVA-TB-005 | `tableNumber` = Max = 500 | **PASS** |
| 6 | BVA-TB-006 | `capacity` = Min = 1 | **PASS** |
| 7 | BVA-TB-007 | `capacity` = Min+1 = 2 | **PASS** |
| 8 | BVA-TB-008 | `capacity` = Max-1 = 49 | **PASS** |
| 9 | BVA-TB-009 | `capacity` = Max = 50 | **PASS** |
| 10 | BVA-TB-010 | `qrCode` length = Min = 10 | **PASS** |
| 11 | BVA-TB-011 | `qrCode` length = Min+1 = 11 | **PASS** |
| 12 | BVA-TB-012 | `qrCode` length = Max-1 = 254 | **FAIL** |
| 13 | BVA-TB-013 | `qrCode` length = Max = 255 | **FAIL** |

### Tổng hợp

- **Tổng testcase:** 13
- **PASS:** 9
- **FAIL:** 4
- **Tỷ lệ PASS:** 69,23%
- **Tỷ lệ FAIL:** 30,77%

---

## 5. Các vấn đề cần lưu ý sau khi kiểm thử

### 5.1. tableNumber = 1 và 2

Hai testcase sử dụng đúng giá trị biên theo SRS nhưng bị lỗi do:

- Bàn #1 đã tồn tại.
- Bàn #2 đã tồn tại.

Do đó kết quả FAIL hiện tại phản ánh **xung đột dữ liệu test**, chưa phải bằng chứng rằng API không chấp nhận Min/Min+1.

### 5.2. qrCode = 254 và 255

Hai testcase trả HTTP 201 nhưng không thể PASS vì:

- `{{qr_254}}` chưa được thay thế thành 254 ký tự.
- `{{qr_255}}` chưa được thay thế thành 255 ký tự.

Cần chạy lại sau khi cấu hình đúng biến Postman.

### 5.3. Tính duy nhất

SRS yêu cầu:

- `tableNumber` phải unique.
- `qrCode` phải unique.

Trong bộ BVA này, các testcase chủ yếu kiểm tra **giá trị biên của miền dữ liệu**. Tính unique là một ràng buộc nghiệp vụ riêng và nên có testcase riêng nếu phạm vi kiểm thử yêu cầu.

---

## 6. Kết luận

Bộ kiểm thử đã được chuẩn hóa theo SRS và phương pháp BVA 4n+1:

- `tableNumber`: kiểm tra 1, 2, 499, 500.
- `capacity`: kiểm tra 1, 2, 49, 50.
- `qrCode`: kiểm tra độ dài 10, 11, 254, 255.
- `status`: không đưa vào BVA vì là trường phân loại.
- Tổng cộng **13 testcase**.

Kết quả thực thi hiện tại:

**9 PASS / 4 FAIL – Tỷ lệ PASS 69,23%.**

Trong 4 testcase FAIL:

- **BVA-TB-002:** dữ liệu bàn #1 đã tồn tại.
- **BVA-TB-003:** dữ liệu bàn #2 đã tồn tại.
- **BVA-TB-012:** chưa gửi thực tế chuỗi 254 ký tự.
- **BVA-TB-013:** chưa gửi thực tế chuỗi 255 ký tự.
