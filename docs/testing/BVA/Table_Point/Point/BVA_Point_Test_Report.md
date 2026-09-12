# BÁO CÁO KIỂM THỬ BVA – POINT MODULE

## 1. Thông tin chung

* Dự án: FutureSuShi
* Module: Point / Tích điểm khách hàng
* Phương pháp: Boundary Value Analysis (BVA)
* Thiết kế: 4n+1
* Số biến được thiết kế: 1 (`current_balance`)
* Tổng số testcase thiết kế: 5
* Môi trường: Local (`http://localhost:3000`)
* Công cụ: Postman
* Endpoint: `POST /api/points/add-points`

## 2. Tình trạng thực thi

**Trạng thái: FULLY EXECUTED**

Đã thực thi toàn bộ 5/5 testcase BVA theo bộ testcase mới. Kết quả PASS/FAIL được ghi nhận theo execution thực tế.

## 3. Kết quả thực tế

| Test Case | Nội dung | HTTP | Kết quả |
|---|---|---:|---|
| BVA-POINT-001 | Baseline – `current_balance = 5,000,000` | 200 | **PASS** |
| BVA-POINT-002 | `current_balance` Min = 0 | 200 | **PASS** |
| BVA-POINT-003 | `current_balance` Min+1 = 1 | 200 | **PASS** |
| BVA-POINT-004 | `current_balance` Max-1 = 9,999,999 | 200 | **FAIL** |
| BVA-POINT-005 | `current_balance` Max = 10,000,000 | 200 | **FAIL** |

## 4. Chi tiết BVA-POINT-001

### Input

```json
{
  "phone": "0363046054",
  "orderId": "29",
  "current_balance": 5000000,
  "finalPrice": 50000
}
```

### Actual Response

```json
{
  "message": "Tích điểm thành công cho khách hàng Nguyễn Phước Thịnh",
  "earnedPoints": 2500,
  "totalPoints": 5002500
}
```

* HTTP Status: `200 OK`
* Kết quả testcase: **PASS**

### Nhận xét

Tích điểm thành công. Với `finalPrice = 50,000 VNĐ`, số điểm nhận được là:

`50,000 / 100 × 5 = 2,500 điểm`

Số dư mới là `5,002,500`, vẫn nằm trong miền `[0, 10,000,000]`.

## 5. Chi tiết BVA-POINT-002

### Input

`current_balance = 0`, `finalPrice = 50,000 VNĐ`

### Actual Response

```json
{
  "message": "Tích điểm thành công cho khách hàng Nguyễn Phước Thịnh",
  "earnedPoints": 2500,
  "totalPoints": 2500
}
```

* HTTP Status: `200 OK`
* Kết quả testcase: **PASS**

### Nhận xét

Giá trị biên dưới được xử lý đúng; số dư sau tích điểm là `2,500`.

## 6. Chi tiết BVA-POINT-003

### Input

`current_balance = 1`, `finalPrice = 50,000 VNĐ`

### Actual Response

```json
{
  "message": "Tích điểm thành công cho khách hàng Nguyễn Phước Thịnh",
  "earnedPoints": 2500,
  "totalPoints": 2501
}
```

* HTTP Status: `200 OK`
* Kết quả testcase: **PASS**

### Nhận xét

Giá trị ngay trên biên dưới được xử lý đúng; số dư sau tích điểm là `2,501`.

## 7. Chi tiết BVA-POINT-004

### Input

`current_balance = 9,999,999`, `finalPrice = 50,000 VNĐ`

### Actual Response

```json
{
  "message": "Tích điểm thành công cho khách hàng Nguyễn Phước Thịnh",
  "earnedPoints": 2500,
  "totalPoints": 10002499
}
```

* HTTP Status: `200 OK`
* Kết quả testcase: **FAIL**

### Nhận xét

Số dư sau tích điểm là `10,002,499`, vượt Max `10,000,000`.

`9,999,999 + 2,500 = 10,002,499`

API vẫn cho phép cộng điểm và không chặn overflow.

## 8. Chi tiết BVA-POINT-005

### Input

`current_balance = 10,000,000`, `finalPrice = 50,000 VNĐ`

### Actual Response

```json
{
  "message": "Tích điểm thành công cho khách hàng Nguyễn Phước Thịnh",
  "earnedPoints": 2500,
  "totalPoints": 10002500
}
```

* HTTP Status: `200 OK`
* Kết quả testcase: **FAIL**

### Nhận xét

Số dư sau tích điểm là `10,002,500`, vượt Max `10,000,000`.

`10,000,000 + 2,500 = 10,002,500`

API vẫn cho phép cộng điểm và không chặn overflow tại giá trị Max.

## 9. Authentication

* `POST /api/auth/login`
* Account: `admin`
* Password: `123`
* HTTP Status: `200 OK`
* Postman Test Results: `4/4 PASS`
* Authentication: **PASS**

## 10. Tổng hợp

* Tổng testcase thiết kế: **5**
* Đã thực thi: **5**
* PASS testcase: **3**
* FAIL testcase: **2**
* NOT RUN: **0**
* Pass rate: **60%**
* Fail rate: **40%**

## 11. Phát hiện / Defect

* **Defect chính:** API không đảm bảo `current_balance` sau tích điểm không vượt quá `10,000,000`.
* **BVA-POINT-004:** `9,999,999 + 2,500 = 10,002,499 > 10,000,000` → **FAIL**.
* **BVA-POINT-005:** `10,000,000 + 2,500 = 10,002,500 > 10,000,000` → **FAIL**.
* **SRS gap:** SRS quy định miền `current_balance [0, 10,000,000]` nhưng chưa nêu rõ khi cộng điểm vượt Max phải reject, cap hay xử lý theo cách khác.

## 12. Kết luận

Bộ BVA Point đã được thiết kế và thực thi đầy đủ 5 testcase theo cấu trúc 4n+1 với biến `current_balance`.

Kết quả cho thấy chức năng hoạt động đúng tại Baseline, Min và Min+1. Hai testcase tại vùng biên trên **FAIL** do API vẫn cho phép số dư vượt quá `10,000,000`.

### Đề xuất

Bổ sung xử lý overflow và quy định rõ expected behavior trong SRS; sau đó retest `BVA-POINT-004` và `BVA-POINT-005`.

**Ghi chú:** Kết quả báo cáo sử dụng execution thực tế của bộ test mới, thay thế hoàn toàn phần test sớm 13 testcase trước đó.
