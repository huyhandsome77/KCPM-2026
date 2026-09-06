# Báo Cáo Kiểm Thử Tự Động UI - Bộ Phận Bếp (Kitchen)
**Hệ thống:** FutureSushi Web Application  
**Phân hệ:** Quản lý Món ăn & Vận hành Chế biến (Kitchen Studio)  
**Công cụ kiểm thử:** CodeceptJS (Playwright Helper, Chromium Headless)  
**Tệp kịch bản kiểm thử:** `test-ui/tests/kitchen/kitchen_test.js`  
**Ngày thực hiện:** 06/09/2026  

---

## 1. Mục tiêu & Phạm vi kiểm thử

### 1.1. Mục tiêu
Tự động hóa toàn diện quy trình kiểm thử giao diện (UI Automation Test) và quy trình xử lý đơn hàng theo thời gian thực dành cho **Bộ phận Bếp (Kitchen)** theo đúng đặc tả SRS:
- **Use Case UC18:** Role Kitchen xem danh sách đơn chế biến (`GET /api/orders?status=CONFIRMED`).
- **Use Case UC19:** Role Kitchen cập nhật tiến độ chế biến (`PUT /api/orders/:id/status` chuyển sang `PREPARING` / `READY`).
- **Chức năng cốt lõi 6 (Order Management):** Ràng buộc tuần tự trạng thái đơn hàng (`PENDING` $\rightarrow$ `CONFIRMED` $\rightarrow$ `PREPARING` $\rightarrow$ `READY` $\rightarrow$ `COMPLETED` / `CANCELLED`).

### 1.2. Phạm vi kiểm thử (Scope)
1. **Xem Order & Danh mục món cần chế biến (UC18):**
   - Xem mã đơn hàng (`order_id \ge 1`), vị trí số bàn phục vụ (`RestaurantTable`), tên khách hàng, thời gian đặt món.
   - Xem chi tiết từng món ăn trong đơn, số lượng ($xN$), ghi chú đặc biệt từ khách hàng (ví dụ: *"Ít cay, không hành tây"*, *"Bàn VIP"*).
2. **Cập nhật trạng thái món/đơn hàng (UC19):**
   - Chuyển tiến độ từ *Chờ chế biến* sang *Đang làm* (`CONFIRMED`/`PENDING` $\rightarrow$ `PREPARING`).
   - Chuyển tiến độ từ *Đang làm* sang *Hoàn thành* (`PREPARING` $\rightarrow$ `READY`).
3. **Kiểm tra State Transition hợp lệ & không hợp lệ (Spec 6):**
   - Quy trình tuần tự 1 chiều: `CONFIRMED` $\rightarrow$ `PREPARING` $\rightarrow$ `READY`.
   - Đơn ở trạng thái `READY` hiển thị nhãn "Đã nấu xong • Sẵn sàng phục vụ" và không cung cấp nút thao tác lặp lại.
   - Các đơn hàng đã hoàn tất thanh toán (`COMPLETED`) hoặc đã hủy (`CANCELLED`) tự động ẩn khỏi bảng Kanban của Bếp.
4. **Bộ lọc ngày chế biến & Tìm kiếm Live Search:**
   - Lọc đơn theo *Hôm nay*, *Tất cả các ngày*, hoặc chọn theo Date Picker.
   - Tìm kiếm trực tiếp theo Tên món ăn, Số bàn, Ghi chú và Tên khách hàng.

---

## 2. Ma trận kiểm thử & Đặc tả 20 Test Case (Traceability Matrix)

### 2.1. Nhóm 1: Giao diện & Tổng quan Bếp (Kitchen Overview)

| STT | Mã TC | Tên trường hợp kiểm thử | Use Case / Quy tắc | Kết quả |
| :---: | :---: | :--- | :---: | :---: |
| 1 | **TC01** | Kiểm tra giao diện Quản lý món ăn của Kitchen (`/admin/kitchen.html`, Header, Breadcrumb, Live Clock) | UI & Layout | **Pass** |
| 2 | **TC02** | Kiểm tra hiển thị 3 cột Kanban (Chờ chế biến, Đang làm, Hoàn thành) và số lượng badge ban đầu | Kanban Board | **Pass** |

---

### 2.2. Nhóm 2: Xem đơn & Chi tiết món cần chế biến (UC18)

| STT | Mã TC | Tên trường hợp kiểm thử | Use Case / Quy tắc | Kết quả |
| :---: | :---: | :--- | :---: | :---: |
| 3 | **TC03** | Kiểm tra hiển thị danh sách đơn ở cột "Chờ chế biến" (`CONFIRMED`/`PENDING`) | **UC18** | **Pass** |
| 4 | **TC04** | Kiểm tra thông tin chi tiết trên thẻ món ăn (Số đơn, Số bàn, Tên khách, Món ăn xSố lượng, Ghi chú) | **UC18** | **Pass** |
| 5 | **TC05** | Kiểm tra hiển thị đơn hàng ở cột "Đang làm" (`PREPARING`) | **UC18** | **Pass** |
| 6 | **TC06** | Kiểm tra hiển thị đơn hàng ở cột "Hoàn thành" (`READY`) | **UC18** | **Pass** |

---

### 2.3. Nhóm 3: Cập nhật tiến độ chế biến (UC19)

| STT | Mã TC | Tên trường hợp kiểm thử | Use Case / Quy tắc | Kết quả |
| :---: | :---: | :--- | :---: | :---: |
| 7 | **TC07** | Kiểm tra chuyển trạng thái từ Chờ chế biến sang Đang làm (`CONFIRMED` $\rightarrow$ `PREPARING`) | **UC19** | **Pass** |
| 8 | **TC08** | Kiểm tra chuyển trạng thái từ Đang làm sang Hoàn thành (`PREPARING` $\rightarrow$ `READY`) | **UC19** | **Pass** |
| 9 | **TC09** | Kiểm tra đơn ở cột Hoàn thành không còn nút thao tác và hiển thị nhãn "Đã nấu xong • Sẵn sàng phục vụ" | UI Constraint | **Pass** |

---

### 2.4. Nhóm 4: Kiểm tra State Transition & Ràng buộc nghiệp vụ (Spec 6)

| STT | Mã TC | Tên trường hợp kiểm thử | Use Case / Quy tắc | Kết quả |
| :---: | :---: | :--- | :---: | :---: |
| 10 | **TC10** | Kiểm tra đơn `COMPLETED` và `CANCELLED` tự động ẩn khỏi Kanban Bếp | **Core Spec 6** | **Pass** |
| 11 | **TC11** | Kiểm tra quy trình chuyển trạng thái tuần tự hợp lệ (`CONFIRMED` $\rightarrow$ `PREPARING` $\rightarrow$ `READY`) | **Core Spec 6** | **Pass** |

---

### 2.5. Nhóm 5: Bộ lọc ngày chế biến & Tìm kiếm Live Search

| STT | Mã TC | Tên trường hợp kiểm thử | Use Case / Quy tắc | Kết quả |
| :---: | :---: | :--- | :---: | :---: |
| 12 | **TC12** | Kiểm tra lọc đơn theo ngày Hôm nay (`#btn-kitchen-today`) | Date Filter | **Pass** |
| 13 | **TC13** | Kiểm tra lọc đơn theo Tất cả ngày (`#btn-kitchen-all-dates`) | Date Filter | **Pass** |
| 14 | **TC14** | Kiểm tra chọn ngày cụ thể bằng Date Picker (`#kitchen-date-picker`) | Date Filter | **Pass** |
| 15 | **TC15** | Kiểm tra tìm kiếm món ăn theo Tên món ăn trên thanh Live Search | Search Logic | **Pass** |
| 16 | **TC16** | Kiểm tra tìm kiếm món ăn theo Số bàn trên thanh Live Search | Search Logic | **Pass** |
| 17 | **TC17** | Kiểm tra tìm kiếm món ăn theo Ghi chú khách hàng | Search Logic | **Pass** |
| 18 | **TC18** | Kiểm tra tìm kiếm món ăn theo Tên khách hàng | Search Logic | **Pass** |
| 19 | **TC19** | Kiểm tra tìm kiếm không có kết quả hiển thị thông báo rỗng ("Chưa có món trong danh mục này") | Empty State | **Pass** |
| 20 | **TC20** | Kiểm tra cập nhật số lượng đếm trên Header các cột khi chuyển trạng thái | Live Metrics | **Pass** |

---

## 3. Thống kê kết quả kiểm thử

| Nhóm chức năng | Số lượng Test Case | Đạt (Pass) | Thất bại (Fail) | Tỷ lệ thành công |
| :--- | :---: | :---: | :---: | :---: |
| **Giao diện & Kanban Board Bếp** | 2 | 2 | 0 | 100% |
| **Xem đơn & Món cần chế biến (UC18)** | 4 | 4 | 0 | 100% |
| **Cập nhật tiến độ chế biến (UC19)** | 3 | 3 | 0 | 100% |
| **State Transition & Ràng buộc (Spec 6)** | 2 | 2 | 0 | 100% |
| **Bộ lọc ngày & Tìm kiếm Live Search** | 9 | 9 | 0 | 100% |
| **TỔNG CỘNG** | **20** | **20** | **0** | **100%** |

---

## 4. Hướng dẫn thực thi kiểm thử tự động

```bash
cd test-ui
npx codeceptjs run tests/kitchen/kitchen_test.js --steps
```
