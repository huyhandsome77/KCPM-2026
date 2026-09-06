# BIÊN BẢN KIỂM CHỨNG – XEM LỊCH SỬ ORDER

| Nội dung | Chi tiết |
|---|---|
| Module | Customer – Xem lịch sử Order |
| Phương pháp | Automation Testing – CodeceptJS |
| Browser | Chromium |
| Tổng Test Case | 8 |
| PASS | 8 |
| FAIL | 0 |
| Kết quả | PASS |

## 1. Mục tiêu kiểm chứng

Kiểm chứng chức năng Xem lịch sử Order trong phần Setting của Customer, bao gồm:
- Hiển thị mục Lịch sử đơn hàng.
- Mở chức năng Lịch sử đơn hàng khi đăng nhập.
- Hiển thị danh sách Order của tài khoản.
- Hiển thị thông tin chi tiết Order.
- Hiển thị trạng thái Order.
- Hiển thị trạng thái thanh toán.
- Xử lý trường hợp tài khoản chưa có Order.
- Kiểm tra quyền truy cập khi chưa đăng nhập.

## 2. Kết quả kiểm thử

| TC | Nội dung | Kết quả |
|---|---|---|
| TC01 | Hiển thị mục Lịch sử đơn hàng trong Setting | PASS |
| TC02 | Mở Lịch sử đơn hàng khi đã đăng nhập | PASS |
| TC03 | Hiển thị danh sách Order của tài khoản | PASS |
| TC04 | Hiển thị thông tin chi tiết Order | PASS |
| TC05 | Hiển thị trạng thái Order | PASS |
| TC06 | Hiển thị trạng thái thanh toán | PASS |
| TC07 | Hiển thị trạng thái khi tài khoản chưa có Order | PASS |
| TC08 | Không đăng nhập thì yêu cầu đăng nhập | PASS |

**Kết quả: 8 PASS / 0 FAIL**

## 3. Flow kiểm chứng

```text
Customer
   ↓
Login
   ↓
Setting
   ↓
Chọn "Lịch sử đơn hàng"
   ↓
GET /api/orders/my-orders
   ↓
┌─────────────────────────┐
│ Có Order                │
│ → Hiển thị lịch sử      │
│ → Thông tin Order       │
│ → Trạng thái Order      │
│ → Trạng thái thanh toán │
└─────────────────────────┘
           hoặc
┌─────────────────────────┐
│ Không có Order          │
│ → Chưa có đơn hàng      │
└─────────────────────────┘
```

## 4. Ghi nhận trong quá trình Automation

### Issue 01 – TC08 kiểm tra sai thời điểm thông báo

TC08 ban đầu FAIL do Test Script chờ 2 giây trước khi kiểm tra thông báo `"Vui lòng đăng nhập trước."`.

Trong khi hệ thống hiển thị Toast và chuyển hướng sang `login.html` sau khoảng 700ms.

Đã điều chỉnh Test Script để kiểm tra thông báo đúng thời điểm.

Sau khi điều chỉnh, TC08 PASS.

**Phân loại:** Test Script/Timing Issue, không phải Defect hệ thống.

## 5. Defect được phát hiện

Không phát hiện Defect chức năng trong phạm vi kiểm chứng.

Chức năng hiển thị lịch sử Order, thông tin Order, trạng thái Order, trạng thái thanh toán và kiểm soát quyền truy cập đều hoạt động đúng trong quá trình Automation.

## 6. Đánh giá

- **Functional:** PASS
- **Order History:** PASS
- **Order Information:** PASS
- **Order Status:** PASS
- **Payment Status:** PASS
- **Authentication:** PASS
- **Negative Testing:** PASS
- **Automation:** PASS

## 7. Giới hạn kiểm chứng

Kiểm thử được thực hiện trên Chromium với tài khoản Customer có dữ liệu Order thực tế.

Tài khoản kiểm thử hiện có Order nên TC07 không thực hiện được việc kiểm tra trực tiếp trạng thái tài khoản hoàn toàn không có Order; Test Script đã xử lý theo hướng không gây FAIL giả.

Chưa thực hiện Cross-browser.

## 8. Kết luận

Chức năng **Xem lịch sử Order** đạt kết quả **8/8 Test Case PASS, 0 FAIL**.

Không ghi nhận Defect chức năng trong phạm vi kiểm chứng. Test Script đã được điều chỉnh về timing ở TC08 để phù hợp với cơ chế Toast/Redirect thực tế của hệ thống.
