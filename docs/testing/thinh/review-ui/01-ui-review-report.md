# BIÊN BẢN REVIEW GIAO DIỆN

## Thông tin

Dự án: FutureSuShi

Người Review: Nguyễn Phước Thịnh

Ngày Review: 08/08/2026

Phương pháp: Formal Technical Review (FTR)

---

# Mục tiêu Review

Review giao diện nhằm phát hiện các lỗi về thiết kế, đánh giá trải nghiệm người dùng và tính nhất quán của hệ thống.

Ngoài ra, quá trình Review còn giúp nhóm phát hiện các điểm cần cải thiện trước khi tiến hành kiểm thử chức năng.

---

# Phạm vi Review

Các giao diện được kiểm tra gồm:

- Customer
- Admin
- Staff
- Kitchen

Các nội dung được Review:

- Luồng màn hình
- Điều hướng
- Responsive
- UX/UI
- Màu sắc
- Icon
- Component

---

# Kết quả Review

## Customer

### Ưu điểm

- Luồng đặt món đơn giản.
- Giao diện hiện đại.
- Màu sắc phù hợp với thương hiệu.

### Hạn chế

- Button đặt món chưa nổi bật.
- Thiếu trạng thái Loading.
- Chưa có Empty State.
- Khoảng cách giữa các Card chưa đồng đều.

---

## Admin

### Ưu điểm

- Điều hướng đơn giản.
- Các chức năng được phân chia rõ ràng.

### Hạn chế

- Dashboard chưa làm nổi bật các thông tin quan trọng.
- Thiếu Breadcrumb.
- Sidebar chưa hiển thị trang đang được chọn.

---

## Staff

### Ưu điểm

- Quy trình xử lý đơn hàng rõ ràng.

### Hạn chế

- Chưa có bộ lọc đơn hàng.
- Trạng thái đơn hàng chưa nổi bật.
- Icon thao tác còn nhỏ.

---

## Kitchen

### Ưu điểm

- Danh sách món ăn dễ quan sát.

### Hạn chế

- Chưa ưu tiên đơn theo thời gian.
- Thiếu cảnh báo khi có đơn mới.
- Màu trạng thái chưa trực quan.
- Còn thiếu các ảnh minh họa ở giao diện Customer.
---

# Nhận xét chung

Website FutureSuShi có giao diện hiện đại và phù hợp với định hướng của một nhà hàng Nhật.

Các chức năng chính đều hoạt động theo đúng luồng nghiệp vụ.

Tuy nhiên hệ thống vẫn cần cải thiện tính thống nhất của giao diện, khả năng phản hồi khi người dùng thao tác và tối ưu trải nghiệm trên một số màn hình.

Sau khi hoàn thiện các nội dung được đề xuất, giao diện có thể chuyển sang giai đoạn kiểm thử tiếp theo.