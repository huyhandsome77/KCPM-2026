# BIÊN BẢN KIỂM CHỨNG – THÊM / SỬA / XÓA CART

**Học phần:** Kiểm chứng và Đảm bảo Chất lượng Phần mềm (KCPM)  
**Module:** Customer – Thêm / Sửa / Xóa Cart  
**Phương pháp:** Black-box Testing + UI Testing + Automation Testing (CodeceptJS)  
**Công cụ:** CodeceptJS v4.1.0 + Playwright/Chromium  
**Reviewer:** Thịnh  
**Kết quả:** PASS – 5/5 Test Case

---

## 1. Mục tiêu kiểm chứng

Kiểm tra chức năng **Thêm / Sửa / Xóa Cart** trên phía Customer, bao gồm:

- Thêm món ăn vào Cart.
- Tăng số lượng món trong Cart.
- Giảm số lượng món trong Cart.
- Xóa món khỏi Cart.
- Thêm nhiều món vào Cart và kiểm tra tổng tiền.
- Kiểm tra flow nghiệp vụ từ **Quét QR → Menu → Cart**.

---

## 2. Kết quả kiểm thử

| Test Case | Nội dung | Kết quả |
|---|---|---|
| TC01 | Thêm món vào Cart | PASS |
| TC02 | Tăng số lượng món trong Cart | PASS |
| TC03 | Giảm số lượng món trong Cart | PASS |
| TC04 | Xóa món khỏi Cart | PASS |
| TC05 | Thêm nhiều món vào Cart | PASS |

**Tổng kết: 5 PASS / 0 FAIL**

---

## 3. Flow kiểm chứng

```text
Customer
   ↓
Trang Index
   ↓
Mở chức năng Quét QR
   ↓
Nhập QR hợp lệ (T5)
   ↓
Chuyển đến Menu
   ↓
Chọn món
   ↓
Thêm vào Cart
   ↓
Tăng / Giảm số lượng
   ↓
Xóa món
   ↓
Kiểm tra tổng tiền
```

Flow trên thực hiện thành công.

---

## 4. Ghi nhận trong quá trình Automation


### Issue 01 – TC05 chọn nhầm món hết hàng

**Hiện tượng:**  
TC05 FAIL khi Automation cố click món thứ 2. Button của món được chọn có trạng thái `disabled` và `title="Tạm hết món"`.

**Nguyên nhân:**  
Test Script mặc định chọn `.product-card:nth-child(2)`, trong khi món thứ 2 trên dữ liệu kiểm thử đang hết hàng.

**Xử lý:**  
Sửa Test Script để tìm và chọn **2 món đang khả dụng**, không chọn cố định theo vị trí Card.

**Kết quả sau khi sửa:**  
PASS.

**Đánh giá:**  
Đây là **Issue của Test Script/Test Data**, không phải Defect chức năng Cart.

---

## 5. Defect được phát hiện

| ID | Defect | Mức độ | Trạng thái |
|---|---|---|---|
| DEF-01 | Không phát hiện Defect chức năng trong Cart | - | - |

Qua 5 Test Case thực hiện, **chưa ghi nhận Defect chức năng** đối với module Thêm / Sửa / Xóa Cart.

---

## 6. Đánh giá

### Functional

- Thêm món vào Cart hoạt động đúng.
- Tăng số lượng món hoạt động đúng.
- Giảm số lượng món hoạt động đúng.
- Xóa món khỏi Cart hoạt động đúng.
- Thêm nhiều món hoạt động đúng.
- Tổng tiền được cập nhật theo thay đổi của Cart.

### UI

- Khu vực Cart hiển thị đúng.
- Tên món và giá món hiển thị trong Cart.
- Nút tăng / giảm số lượng hoạt động đúng.
- Nút xóa món hiển thị và thực hiện đúng thao tác.
- Tổng tiền được cập nhật sau khi thay đổi Cart.

### Automation

- Các Test Case chạy thành công trên Chromium.
- Tổng cộng **5/5 PASS**.
- Các lỗi ban đầu được xác định là Environment Issue hoặc Test Script/Test Data Issue, không phải Defect sản phẩm.

---

## 7. Kết luận

Module **Thêm / Sửa / Xóa Cart** đạt kết quả kiểm chứng:

> **PASS – 5/5 Test Case**

Các chức năng thêm món, tăng/giảm số lượng, xóa món và thêm nhiều món vào Cart hoạt động đúng trong phạm vi kiểm chứng.

Không phát hiện Defect chức năng trong phạm vi kiểm thử.

Các vấn đề phát sinh trong quá trình Automation đã được xử lý và được phân loại là **Environment Issue hoặc Test Script/Test Data Issue**, không phải lỗi chức năng của hệ thống.

**Đề nghị:** Có thể chuyển module sang bước Regression Testing sau khi các thay đổi liên quan được tích hợp.
