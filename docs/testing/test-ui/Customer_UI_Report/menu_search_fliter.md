# BIÊN BẢN KIỂM CHỨNG – TÌM KIẾM & LỌC MENU

**Học phần:** Kiểm chứng và Đảm bảo Chất lượng Phần mềm (KCPM)  
**Module:** Customer – Tìm kiếm & Lọc Menu  
**Phương pháp:** Black-box Testing + UI Testing + Automation Testing (CodeceptJS)  
**Công cụ:** CodeceptJS v4.1.0 + Playwright/Chromium  
**Reviewer:** Thịnh  
**Kết quả:** PASS – 5/5 Test Case

---

## 1. Mục tiêu kiểm chứng

Kiểm tra chức năng **Tìm kiếm và Lọc Menu** trên phía Customer, bao gồm:

- Hiển thị Search và Filter.
- Tìm kiếm món ăn theo tên.
- Xử lý khi không có món phù hợp.
- Lọc món theo danh mục.
- Kết hợp Search và Filter.
- Kiểm tra flow nghiệp vụ từ **Quét QR → Menu → Search/Filter**.

---

## 2. Kết quả kiểm thử

| Test Case | Nội dung | Kết quả |
|---|---|---|
| TC01 | Hiển thị tìm kiếm và lọc Menu | PASS |
| TC02 | Tìm kiếm món ăn theo tên | PASS |
| TC03 | Tìm kiếm món không tồn tại | PASS |
| TC04 | Lọc món theo danh mục | PASS |
| TC05 | Kết hợp tìm kiếm và lọc danh mục | PASS |

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
Tìm kiếm / Lọc danh mục
   ↓
Kiểm tra kết quả hiển thị
```

Flow trên thực hiện thành công.

---

## 4. Ghi nhận trong quá trình Automation

### Issue 01 – Không thể truy cập trực tiếp Menu nếu chưa xác thực QR

**Hiện tượng:**  
Khi Automation truy cập trực tiếp `menu.html` mà chưa có QR hợp lệ, các thành phần:

- `#searchInput`
- `#categorySelect`
- `#productGrid`

không được hiển thị.

**Nguyên nhân:**  
Trang Menu có cơ chế kiểm tra QR trước khi cho phép truy cập.

**Xử lý:**  
Điều chỉnh Test Case để thực hiện đúng flow nghiệp vụ:

`Index → Quét QR → QR hợp lệ → Menu → Search/Filter`

**Đánh giá:**  
Đây **không phải Defect**. Đây là hành vi đúng theo thiết kế nghiệp vụ.

---

### Issue 02 – TC05 ban đầu lấy sai dữ liệu Category

**Hiện tượng:**  
TC05 ban đầu FAIL với thông báo:

```text
Không có dữ liệu món ăn có danh mục để kiểm thử Search + Filter.
```

**Nguyên nhân:**  
Test Script cố lấy dữ liệu thông qua `window.products`, trong khi biến dữ liệu sản phẩm không được expose trực tiếp trên `window`.

**Xử lý:**  
Thay đổi cách kiểm thử, lấy một Category trên UI → chọn Category → lấy món đang hiển thị → thực hiện Search theo tên món.

**Kết quả sau khi sửa:**  
PASS.

**Đánh giá:**  
Đây là **Issue của Test Script/Automation**, không phải Defect của hệ thống.

---

## 5. Defect được phát hiện

| ID | Defect | Mức độ | Trạng thái |
|---|---|---|---|
| DEF-01 | Không phát hiện Defect chức năng trong Search/Filter | - | - |

Qua 5 Test Case thực hiện, **chưa ghi nhận Defect chức năng** đối với module Tìm kiếm & Lọc Menu.

---

## 6. Đánh giá

### Functional

- Search theo tên hoạt động đúng.
- Search với từ khóa không tồn tại hiển thị trạng thái không có món.
- Filter theo Category hoạt động đúng.
- Search + Filter hoạt động đúng.
- QR → Menu → Search/Filter hoạt động đúng.

### UI

- Search Box hiển thị đúng.
- Category Filter hiển thị đúng.
- Khu vực danh sách món (`productGrid`) hiển thị đúng.
- Trạng thái không có kết quả được hiển thị rõ ràng.

### Automation

- Các Test Case chạy thành công trên Chromium.
- Tổng cộng **5/5 PASS**.
- Một số lỗi ban đầu thuộc về cách thiết kế Test Script và không được xác định là Defect sản phẩm.

---

## 7. Kết luận

Module **Tìm kiếm & Lọc Menu** đạt kết quả kiểm chứng:

> **PASS – 5/5 Test Case**

Chức năng Search, Filter và kết hợp Search + Filter hoạt động đúng theo flow kiểm thử.

Không phát hiện Defect chức năng trong phạm vi kiểm chứng.

Các lỗi phát sinh trong quá trình Automation đã được xác định là **vấn đề của Test Script/Environment hoặc do chưa thực hiện flow QR**, không phải lỗi chức năng của hệ thống.

**Đề nghị:** Có thể chuyển module sang bước Regression Testing sau khi các thay đổi liên quan được tích hợp.
