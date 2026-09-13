# BÁO CÁO KIỂM THỬ BVA – POINT MODULE

## 1. Thông tin chung

* Dự án: FutureSuShi
* Module: Point / Tích điểm khách hàng
* Phương pháp: Boundary Value Analysis (BVA)
* Thiết kế: 4n+1
* Số biến được thiết kế: 3 (`phone`, `finalPrice`, `orderId`)
* Tổng số testcase thiết kế: 13
* Môi trường: Local (`http://localhost:3000`)
* Tài khoản test: `admin`
* Mật khẩu test: `123`

## 2. Tình trạng thực thi

**Trạng thái: PARTIALLY EXECUTED**

Chỉ có testcase `BVA-POINT-001` được ghi nhận kết quả thực tế từ ảnh Postman đã cung cấp. 12 testcase còn lại chưa có bằng chứng thực thi nên được giữ `NOT RUN`, không tự quy đổi thành PASS hoặc FAIL.

## 3. Kết quả thực tế

| Test Case | Nội dung | HTTP | Assertion | Kết quả |
|---|---|---:|---:|---|
| BVA-POINT-001 | Baseline – phone `0363046054`, orderId `1` | 400 | 4/9 PASS | **FAIL** |
| BVA-POINT-002 | Phone Min | — | Chưa chạy | NOT RUN |
| BVA-POINT-003 | Phone Min+1 | — | Chưa chạy | NOT RUN |
| BVA-POINT-004 | Phone Max-1 | — | Chưa chạy | NOT RUN |
| BVA-POINT-005 | Phone Max | — | Chưa chạy | NOT RUN |
| BVA-POINT-006 | finalPrice Min | — | Chưa chạy | NOT RUN |
| BVA-POINT-007 | finalPrice Min+1 | — | Chưa chạy | NOT RUN |
| BVA-POINT-008 | finalPrice Max-1 | — | Chưa chạy | NOT RUN |
| BVA-POINT-009 | finalPrice Max | — | Chưa chạy | NOT RUN |
| BVA-POINT-010 | orderId Min | — | Chưa chạy | NOT RUN |
| BVA-POINT-011 | orderId Min+1 | — | Chưa chạy | NOT RUN |
| BVA-POINT-012 | orderId Max-1 | — | Chưa chạy | NOT RUN |
| BVA-POINT-013 | orderId Max | — | Chưa chạy | NOT RUN |

## 4. Chi tiết BVA-POINT-001

### Input

```json
{
  "phone": "0363046054",
  "orderId": "1"
}
```

### Actual Response

```json
{
  "message": "Đơn hàng này chưa hoàn thành hoặc chưa thanh toán"
}
```

* HTTP Status: `400 Bad Request`
* Postman Test Results: `4/9` assertions PASS
* Kết quả testcase: **FAIL**

### Nhận xét

Order ID `1` không đáp ứng điều kiện để tích điểm theo phản hồi thực tế của API: đơn hàng chưa hoàn thành hoặc chưa thanh toán. Đây là kết quả kiểm thử thực tế, không sửa testcase để ép PASS.

## 5. Authentication

* `POST /api/auth/login`
* Account: `admin`
* Password: `123`
* HTTP Status: `200 OK`
* Postman Test Results: `4/4 PASS`
* Authentication: **PASS**

## 6. Tổng hợp

* Tổng testcase thiết kế: **13**
* Đã thực thi: **1**
* PASS testcase: **0**
* FAIL testcase: **1**
* NOT RUN: **12**
* Pass rate trên testcase đã thực thi: **0%**
* Không tính 12 testcase NOT RUN vào pass rate.

## 7. Kết luận

Bộ BVA Point đã được thiết kế đủ 13 testcase theo cấu trúc 4n+1. Tuy nhiên, tại thời điểm lập báo cáo, dữ liệu Order phục vụ các boundary chưa được tạo/chuẩn bị đầy đủ nên chưa thể thực thi toàn bộ bộ test.

Kết quả hiện tại được ghi nhận trung thực: `BVA-POINT-001` FAIL do Order ID `1` chưa thỏa điều kiện PAID + COMPLETED; 12 testcase còn lại là `NOT RUN`.

**Không sử dụng kết quả giả định cho các testcase chưa chạy.**
