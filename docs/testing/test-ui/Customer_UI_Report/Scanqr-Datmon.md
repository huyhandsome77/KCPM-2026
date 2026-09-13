# BIÊN BẢN KIỂM CHỨNG – ĐẶT MÓN QUA QR

| Nội dung | Chi tiết |
|---|---|
| Module | Customer – Đặt món qua QR |
| Phương pháp | Automation Testing – CodeceptJS |
| Browser | Chromium |
| Tổng Test Case | 7 |
| PASS | 7 |
| FAIL | 0 |
| Kết quả | PASS |

## 1. Mục tiêu kiểm chứng

Kiểm chứng chức năng Đặt món qua QR trên phía Customer, bao gồm:
- QR hợp lệ và chuyển đúng đến Menu.
- Xử lý QR không hợp lệ và không nhập QR.
- Thêm món vào Cart sau khi quét QR.
- Tăng số lượng món trong Cart.
- Xóa món khỏi Cart.
- Đặt món thành công và kiểm tra Cart được reset.

## 2. Kết quả kiểm thử

| TC | Nội dung | Kết quả |
|---|---|---|
| TC01 | Quét QR thành công và chuyển đến Menu | PASS |
| TC02 | Nhập đường dẫn QR không hợp lệ | PASS |
| TC03 | Không nhập đường dẫn QR | PASS |
| TC04 | Quét QR và thêm món vào Cart | PASS |
| TC05 | Tăng số lượng món trong Cart | PASS |
| TC06 | Xóa món khỏi Cart | PASS |
| TC07 | Đặt món thành công qua QR | PASS |

**Kết quả: 7 PASS / 0 FAIL**

## 3. Flow kiểm chứng

```text
Customer
   ↓
Quét / nhập QR bàn
   ↓
Xác thực QR
   ├── Không hợp lệ → Thông báo lỗi
   └── Hợp lệ
          ↓
        Menu
          ↓
      Chọn món
          ↓
        Cart
          ↓
   Tăng / giảm / xóa món
          ↓
       Đặt món
          ↓
      Gửi Order
          ↓
   Cart được reset
```

## 4. Ghi nhận trong quá trình Automation

### Issue 01 – TC07 kiểm tra sai thông báo

TC07 ban đầu FAIL do Test Script sử dụng:

```js
I.see("thành công");
```

Trong khi chức năng `checkout()` hiển thị kết quả thành công thông qua Toast/Alert và sau khi đặt món sẽ reset Cart.

Đã điều chỉnh Test Script kiểm tra trạng thái sau khi đặt món:
- Cart hiển thị `"Giỏ hàng đang trống"`.
- Tổng tiền được reset về `0đ`.

Sau khi điều chỉnh, TC07 PASS.

**Phân loại:** Test Script Issue, không phải Defect hệ thống.

## 5. Defect được phát hiện

Không phát hiện Defect chức năng trong phạm vi kiểm chứng.

Các luồng QR, Cart và đặt Order đều thực hiện đúng theo kết quả Automation.

## 6. Đánh giá

- **Functional:** PASS
- **QR Validation:** PASS
- **Cart:** PASS
- **Order:** PASS
- **Negative Testing:** PASS
- **Automation:** PASS

## 7. Giới hạn kiểm chứng

Kiểm thử được thực hiện trên Chromium và sử dụng QR/link bàn T5.

Chưa thực hiện kiểm thử trực tiếp bằng camera QR vật lý trên thiết bị thật và chưa thực hiện Cross-browser.

## 8. Kết luận

Chức năng **Đặt món qua QR** đạt kết quả **7/7 Test Case PASS, 0 FAIL**.

Không ghi nhận Defect chức năng trong phạm vi kiểm chứng. Test Script đã được điều chỉnh để phù hợp với cơ chế Toast/Alert và trạng thái Cart thực tế của hệ thống.
