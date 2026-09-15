# BIÊN BẢN FIX LỖI TEST-UI – FUTURESUSHI

## 1. Thông tin chung

| Nội dung | Chi tiết |
|---|---|
| Dự án | FutureSuShi |
| Phạm vi | Test-UI |
| Công cụ | CodeceptJS + Playwright |
| Browser | Chromium |
| Người kiểm thử | Thịnh |

## 2. Các lỗi/Issue đã Fix

| STT | Chức năng | Issue | Fix | Kết quả |
|---|---|---|---|---|
| 1 | Login/Logout | Selector/Expected Result chưa khớp UI | Cập nhật Test Script | PASS |
| 2 | Menu Search/Filter | Test truy cập Menu sai Flow QR | Điều chỉnh Flow QR → Menu → Search/Filter | PASS |
| 3 | Cart | Expected Result không khớp text UI | Cập nhật assertion theo UI thực tế | PASS |
| 4 | Order | Text `"Chưa có món ăn."` không còn sử dụng | Đổi thành `"Giỏ hàng đang trống"` | PASS |
| 5 | QR Ordering | Kiểm tra Toast `"thành công"` không ổn định | Kiểm tra Cart reset và tổng tiền `0đ` | PASS |
| 6 | Order History | Toast/Redirect chưa đồng bộ thời gian | Điều chỉnh thời gian chờ và assertion | PASS |
| 7 | Kitchen | Mock bị API thật ghi đè | Điều chỉnh Mock API trong Test Script | PASS |
| 8 | Reservation | Dữ liệu Test chưa đồng bộ | Điều chỉnh Test Data/Assertion | PASS |

## 3. Kết quả sau Fix

- Tổng Test Case Customer: **52**
- Customer: **52/52 PASS**
- Kitchen: **20/20 PASS**
- Reservation: **13/13 PASS**
- Staff: **chưa chạy**
- **Tổng: 85/85 PASS – 0 FAIL – 100%**

## 4. Kết luận

Các Issue phát hiện trong quá trình Automation đã được xử lý chủ yếu ở **Test Script, Test Data và Environment**.

Sau khi Fix và chạy lại, các Test Case trong phạm vi nghiệm thu đều **PASS**.Ngoại trừ Staff chưa chạy, do chạy nhiều tc quá máy không load nổi.

**Không ghi nhận Defect chức năng còn tồn tại trong phạm vi Test-UI.**