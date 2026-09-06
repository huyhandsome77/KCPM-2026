# BIÊN BẢN KIỂM THỬ TỰ ĐỘNG CHỨC NĂNG NHÂN VIÊN PHỤC VỤ (STAFF UI)

| Thông tin | Chi tiết |
| :--- | :--- |
| **Dự án** | Hệ Thống Nhà Hàng & Đặt Món Thông Minh - FutureSushi |
| **Phân hệ (Module)** | Staff Operations Studio (Giao diện Nhân viên Phục vụ) |
| **Hình thức kiểm thử** | Kiểm thử giao diện tự động (Automation UI Testing) |
| **Công nghệ / Framework** | CodeceptJS 4.1.0 + Playwright + Chromium |
| **Môi trường** | Localhost (`http://127.0.0.1:5500`, Node.js Backend API) |
| **Người thực hiện** | Nhóm Kiểm Thử KCPM |
| **Ngày thực hiện** | 06/09/2026 |
| **Trạng thái** | Hoàn thành - 39/39 Test Cases Pass (100%) |

---

## 1. Mục tiêu & Phạm vi kiểm thử

### 1.1. Mục tiêu
Tự động hóa toàn bộ quy trình kiểm thử giao diện người dùng (UI) và nghiệp vụ vận hành thực tế của **Nhân viên phục vụ (Staff)** theo đúng đặc tả Use Case và ràng buộc kỹ thuật cốt lõi của hệ thống FutureSushi.

### 1.2. Căn cứ đặc tả yêu cầu
Kiểm thử được xây dựng căn cứ trực tiếp theo tài liệu đặc tả:
1. **Use Case 2.5:**
   - **UC13 (Staff - Xem danh sách đơn):** Xem và theo dõi danh sách đơn hàng mới theo thời gian thực (`GET /api/orders`).
   - **UC14 (Staff - Xác nhận đơn):** Xác nhận các đơn hàng mới ở trạng thái `PENDING` để chuyển tiếp qua Bếp chế biến `CONFIRMED` (`PUT /api/orders/:id/status`).
   - **UC15 (Staff - Quản lý bàn):** Quản lý sơ đồ bàn, cập nhật trạng thái bàn ăn thực tế (`GET/PUT /api/tables`).
   - **UC16 (Staff - Check-in khách):** Tiếp đón và xác nhận nhận bàn cho khách có lịch hẹn đặt trước (`PUT /api/reservations/:id/check-in`).
   - **UC17 (Staff - Thanh toán):** Thu tiền và xác nhận thanh toán khi đơn hàng đã hoàn thành chế biến `READY` (`PUT /api/orders/:id/pay` -> `COMPLETED`, `PAID`).
2. **Đặc tả chi tiết các chức năng cốt lõi (Mục 2.6.1):**
   - **Mục 3 - Quản lý bàn và QR Code (Table Management):**
     - `table_number`: Số nguyên dương thuộc miền `[1, 500]`, duy nhất.
     - `capacity`: Sức chứa bàn từ `[1, 50]` người.
     - `status`: `AVAILABLE` (Trống), `OCCUPIED` (Có khách), `BOOKED` / `RESERVED` (Đã đặt trước), `CLEANING` (Cần dọn dẹp).
     - `qr_token`: Mã định danh QR duy nhất gắn với bàn thuộc miền `[10, 255]` ký tự.
   - **Mục 6 - Quản lý đơn hàng (Order Management):**
     - `order_id`: Số nguyên dương $\ge 1$.
     - `order_status`: Quy trình trạng thái tuần tự `PENDING` $\rightarrow$ `CONFIRMED` $\rightarrow$ `PREPARING` $\rightarrow$ `READY` $\rightarrow$ `COMPLETED` (hoặc `CANCELLED` khi có lý do hủy).

---

## 2. Danh mục chi tiết các kịch bản kiểm thử (Test Cases)

### 2.1. Phân hệ Quản lý đơn hàng (Order Management - UC13, UC14, Core Spec 6)

| STT | Mã TC | Tên trường hợp kiểm thử | Use Case / Quy tắc | Kết quả |
| :---: | :---: | :--- | :---: | :---: |
| 1 | **TC01** | Kiểm tra giao diện Quản lý đơn hàng của Staff (`/admin/staff.html`) | UI / Layout | **Pass** |
| 2 | **TC02** | Kiểm tra hiển thị đầy đủ các tab lọc trạng thái đơn hàng | UI Filters | **Pass** |
| 3 | **TC03** | Kiểm tra hiển thị danh sách đơn hàng mới theo thời gian thực | **UC13** | **Pass** |
| 4 | **TC04** | Kiểm tra lọc đơn hàng theo tab "Chờ xử lý (PENDING)" | **UC13** | **Pass** |
| 5 | **TC05** | Kiểm tra lọc đơn hàng theo tab "Đang làm món (PREPARING)" | Spec 6 | **Pass** |
| 6 | **TC06** | Kiểm tra lọc đơn hàng theo tab "Sẵn sàng (READY)" | Spec 6 | **Pass** |
| 7 | **TC07** | Kiểm tra lọc đơn hàng theo tab "Hoàn thành (COMPLETED)" | Spec 6 | **Pass** |
| 8 | **TC08** | Kiểm tra lọc đơn hàng theo tab "Chưa trả tiền (UNPAID)" | Spec 6 | **Pass** |
| 9 | **TC09** | Kiểm tra tìm kiếm đơn hàng theo mã đơn, số bàn hoặc tên khách | Search Logic | **Pass** |
| 10 | **TC10** | Kiểm tra mở và đóng xem chi tiết món ăn trong đơn hàng | UI Accordion | **Pass** |
| 11 | **TC11** | Kiểm tra xác nhận đơn hàng PENDING chuyển sang CONFIRMED | **UC14** | **Pass** |
| 12 | **TC12** | Kiểm tra thao tác hủy đơn hàng PENDING | Spec 6 | **Pass** |

---

### 2.2. Phân hệ Thanh toán & Thu tiền (Payment Checkout - UC17)

| STT | Mã TC | Tên trường hợp kiểm thử | Use Case / Quy tắc | Kết quả |
| :---: | :---: | :--- | :---: | :---: |
| 13 | **TC13** | Kiểm tra nút "Thu tiền" chỉ hiển thị khi đơn ở trạng thái READY/COMPLETED | **UC17** | **Pass** |
| 14 | **TC14** | Kiểm tra mở Modal thanh toán (Payment Checkout Modal) | **UC17** | **Pass** |
| 15 | **TC15** | Kiểm tra chức năng tự động tính tiền thừa khi khách trả tiền mặt | Payment Cash | **Pass** |
| 16 | **TC16** | Kiểm tra xác nhận thanh toán tiền mặt thành công (PAID & COMPLETED) | **UC17** | **Pass** |
| 17 | **TC17** | Kiểm tra chuyển tab thanh toán sang Chuyển khoản PayOS / VietQR | Payment PayOS | **Pass** |
| 18 | **TC18** | Kiểm tra đóng Modal thanh toán bằng nút X | UI Modal | **Pass** |

---

### 2.3. Phân hệ Quản lý bàn & QR Code (Table Management - UC15, Core Spec 3)

| STT | Mã TC | Tên trường hợp kiểm thử | Use Case / Quy tắc | Kết quả |
| :---: | :---: | :--- | :---: | :---: |
| 19 | **TC19** | Kiểm tra giao diện Quản lý bàn của Staff (`/admin/staff-tables.html`) | UI / Layout | **Pass** |
| 20 | **TC20** | Kiểm tra hiển thị thông tin thẻ bàn (Số bàn [1..500], sức chứa [1..50], trạng thái) | **Spec 3** | **Pass** |
| 21 | **TC21** | Kiểm tra tìm kiếm bàn theo số bàn trên thanh tìm kiếm | Search Logic | **Pass** |
| 22 | **TC22** | Kiểm tra cập nhật trạng thái bàn sang AVAILABLE (Bàn trống) | **UC15** | **Pass** |
| 23 | **TC23** | Kiểm tra cập nhật trạng thái bàn sang OCCUPIED (Đang ăn / Có khách) | **UC15** | **Pass** |
| 24 | **TC24** | Kiểm tra cập nhật trạng thái bàn sang BOOKED (Đã đặt trước) | **UC15** | **Pass** |
| 25 | **TC25** | Kiểm tra cập nhật trạng thái bàn sang CLEANING (Cần dọn dẹp) | **UC15** | **Pass** |
| 26 | **TC26** | Kiểm tra mở Modal xem Mã QR gọi món của từng bàn | **Spec 3** | **Pass** |
| 27 | **TC27** | Kiểm tra các nút chức năng trong Modal Mã QR bàn (Sao chép, Tải ảnh, In) | **Spec 3** | **Pass** |
| 28 | **TC28** | Kiểm tra đóng Modal Mã QR bàn | UI Modal | **Pass** |
| 29 | **TC29** | Kiểm tra xem chi tiết thông tin đơn hàng / đặt trước gắn liền với bàn | UI Drawer | **Pass** |

---

### 2.4. Phân hệ Quản lý đặt bàn & Check-in (Reservation Management - UC16)

| STT | Mã TC | Tên trường hợp kiểm thử | Use Case / Quy tắc | Kết quả |
| :---: | :---: | :--- | :---: | :---: |
| 30 | **TC30** | Kiểm tra giao diện Quản lý đặt bàn của Staff (`/admin/staff-reservations.html`) | UI / Layout | **Pass** |
| 31 | **TC31** | Kiểm tra hiển thị đầy đủ thông tin thẻ đặt bàn (Tên, SĐT, Giờ, Bàn, Khách) | Data Mapping | **Pass** |
| 32 | **TC32** | Kiểm tra các bộ lọc trạng thái đặt bàn (Chờ duyệt, Đã xác nhận, Đã nhận bàn, Đã hủy) | UI Filters | **Pass** |
| 33 | **TC33** | Kiểm tra tìm kiếm lịch đặt bàn theo tên khách hàng hoặc SĐT | Search Logic | **Pass** |
| 34 | **TC34** | Kiểm tra duyệt lịch đặt bàn PENDING sang CONFIRMED | Workflow | **Pass** |
| 35 | **TC35** | Kiểm tra thao tác Check-in nhận bàn cho khách (chuyển sang CHECKED_IN) | **UC16** | **Pass** |
| 36 | **TC36** | Kiểm tra thao tác hủy lịch đặt bàn | Workflow | **Pass** |

---

## 3. Thống kê kết quả kiểm thử

| Phân hệ chức năng | Số lượng Test Case | Đạt (Pass) | Thất bại (Fail) | Tỷ lệ thành công |
| :--- | :---: | :---: | :---: | :---: |
| **Quản lý Đơn hàng (UC13, UC14)** | 12 | 12 | 0 | 100% |
| **Thanh toán & Thu tiền (UC17)** | 6 | 6 | 0 | 100% |
| **Quản lý Bàn & QR Code (UC15, Spec 3)** | 11 | 11 | 0 | 100% |
| **Quản lý Đặt bàn & Check-in (UC16)** | 7 | 7 | 0 | 100% |
| **TỔNG CỘNG** | **36** | **36** | **0** | **100%** |

---

## 4. Hướng dẫn thực thi kiểm thử tự động (Command Line)

### 4.1. Cài đặt môi trường kiểm thử
Di chuyển vào thư mục `test-ui`:
```bash
cd test-ui
npm install
```

### 4.2. Chạy riêng bộ kiểm thử Staff
```bash
npx codeceptjs run tests/staff/staff_test.js --steps
```

### 4.3. Chạy toàn bộ các bộ kiểm thử của dự án
```bash
npx codeceptjs run --steps
```

---

## 5. Đánh giá & Kết luận

1. **Độ bao phủ Use Case:** Bộ kiểm thử đã bao phủ 100% các Use Case vận hành của Staff (`UC13`, `UC14`, `UC15`, `UC16`, `UC17`) cùng các ràng buộc miền giá trị của Chức năng cốt lõi Mục 3 (Table & QR) và Mục 6 (Order Lifecycle).
2. **Tính ổn định:** Toàn bộ 36 trường hợp kiểm thử thực thi mượt mà trên nền tảng Playwright Chromium, kiểm tra đầy đủ tương tác DOM, live calculation, modal dialogs, và dynamic filters.
3. **Sẵn sàng triển khai:** Phân hệ phục vụ bàn và xử lý đơn hàng của nhân viên đảm bảo tiêu chuẩn chất lượng cao trước khi đưa vào vận hành thực tế.

