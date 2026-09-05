# BÁO CÁO KIỂM THỬ GIAO DIỆN TỰ ĐỘNG (AUTOMATION UI TESTING)
## MODULE: ADMIN DASHBOARD (QUẢN TRỊ VIÊN & PHÂN QUYỀN RBAC)

---

## 1. TỔNG QUAN VÀ MỤC TIÊU
* **Mục tiêu:** Tự động hóa kiểm thử giao diện người dùng (End-to-End UI Automation Test) cho toàn bộ các chức năng quản trị, cấu hình danh mục, quản lý sản phẩm, quản lý bàn ăn, kiểm soát người dùng và cơ chế phân quyền (RBAC) trên hệ thống **FutureSushi Admin Dashboard**.
* **Công cụ & Môi trường thực thi:**
  * **Automation Framework:** CodeceptJS (Playwright Helper)
  * **Trình duyệt kiểm thử:** Chromium / Chrome Headless & UI Mode
  * **Frontend Base URL:** `http://127.0.0.1:5500/admin` (hoặc `http://localhost:3000/admin`)
  * **Backend API Base URL:** `http://localhost:3000/api`

---

## 2. PHẠM VI KIỂM THỬ (SCOPE OF TESTING)

Kiểm thử bao phủ trọn vẹn 8 phân hệ chức năng theo đúng mô tả yêu cầu của Task SCRUM-57:

1. **Admin Login:** Xác thực tài khoản quản trị, kiểm tra bắt lỗi sai mật khẩu, lưu trữ Token/User vào `localStorage`.
2. **Dashboard & Statistics:** Kiểm tra hiển thị KPI tổng quan (Doanh thu, Đơn hàng, Món ăn), chuyển đổi và lọc báo cáo doanh thu theo thời gian.
3. **Category CRUD:** Tạo mới nhóm danh mục món, cập nhật thông tin và kiểm tra hiển thị đồng bộ.
4. **Product CRUD:** Thêm món ăn mới với giá và tồn kho, tìm kiếm nhanh món ăn theo từ khóa, chỉnh sửa thông tin món.
5. **Quản lý Bàn ăn (Table Management):** Xem sơ đồ bàn ăn trực quan, thêm mới bàn ăn vào hệ thống, cập nhật trạng thái bàn.
6. **Quản lý Người dùng (User Management):** Xem danh sách tài khoản, tìm kiếm người dùng theo tên/SĐT, tạo tài khoản mới.
7. **Khóa / Mở khóa tài khoản (Lock / Unlock User):** Chuyển đổi trạng thái tài khoản từ `ACTIVE` sang `BLOCKED` (Khóa) và từ `BLOCKED` về `ACTIVE` (Mở khóa).
8. **Kiểm tra RBAC & Session Security:** Kiểm tra cơ chế bảo vệ Route, chặn người dùng chưa đăng nhập và xác thực luồng đăng xuất an toàn.

---

## 3. DANH SÁCH MA TRẬN 17 TEST CASES CHI TIẾT

| Test Case ID | Phân hệ chức năng | Tên kịch bản kiểm thử (Scenario) | Các bước thực hiện (Steps) | Dữ liệu đầu vào (Test Data) | Kết quả mong đợi (Expected Result) | Trạng thái |
| :--- | :--- | :--- | :--- | :--- | :--- | :---: |
| **TC01** | Admin Login | Đăng nhập thất bại khi sai mật khẩu | 1. Vào trang `/admin`<br>2. Nhập mật khẩu sai<br>3. Bấm Đăng nhập | `account: admin`<br>`password: wrong_999` | Không cho phép vào hệ thống, giữ nguyên màn hình đăng nhập | **PASS** |
| **TC02** | Admin Login | Đăng nhập thành công với tài khoản Admin | 1. Vào trang `/admin`<br>2. Nhập tài khoản admin<br>3. Bấm Đăng nhập | `account: admin`<br>`password: 123` | Điều hướng thành công vào Dashboard, hiển thị tên Administrator | **PASS** |
| **TC03** | Dashboard | Kiểm tra giao diện Dashboard & Chỉ số KPI | 1. Đăng nhập Admin<br>2. Xem màn hình Dashboard | N/A | Hiển thị đầy đủ các thẻ KPI: Tổng doanh thu, Đơn hàng, Sản phẩm | **PASS** |
| **TC04** | Statistics | Kiểm tra điều hướng trang Báo cáo doanh thu | 1. Bấm tab Báo cáo doanh thu<br>2. Kiểm tra bộ lọc | `view: stats` | Hiển thị tiêu đề Báo cáo doanh thu và bộ lọc theo ngày/tháng/năm | **PASS** |
| **TC05** | Category CRUD | Thêm danh mục món ăn mới | 1. Vào tab Danh mục<br>2. Bấm Thêm danh mục<br>3. Nhập form và lưu | `name: Danh mục UI Test`<br>`description: Mô tả test` | Danh mục mới xuất hiện trong bảng danh mục | **PASS** |
| **TC06** | Category CRUD | Chỉnh sửa danh mục món ăn | 1. Bấm nút Sửa danh mục<br>2. Cập nhật mô tả<br>3. Bấm Lưu | `description: Cập nhật mới` | Dữ liệu danh mục được cập nhật thành công | **PASS** |
| **TC07** | Product CRUD | Thêm món ăn mới vào Menu | 1. Vào tab Món ăn<br>2. Bấm Thêm sản phẩm<br>3. Điền tên, giá, kho<br>4. Bấm Lưu | `name: Sushi Test`<br>`price: 150000`<br>`stock: 30` | Món ăn mới hiển thị trong danh sách sản phẩm | **PASS** |
| **TC08** | Product CRUD | Tìm kiếm món ăn theo từ khóa | 1. Vào tab Món ăn<br>2. Nhập từ khóa vào ô tìm kiếm | `search: Sushi` | Danh sách lọc chính xác các món có chứa từ khóa Sushi | **PASS** |
| **TC09** | Product CRUD | Chỉnh sửa thông tin món ăn | 1. Bấm Sửa món ăn<br>2. Cập nhật tồn kho<br>3. Bấm Lưu | `stock: 99` | Thông tin tồn kho món ăn được cập nhật thành công | **PASS** |
| **TC10** | Table Manage | Xem sơ đồ bàn ăn và danh sách bàn | 1. Vào tab Quản lý bàn<br>2. Kiểm tra danh sách bàn | `view: tables` | Hiển thị danh sách các bàn (Bàn #1, Bàn #2, ...) | **PASS** |
| **TC11** | Table Manage | Thêm bàn ăn mới vào nhà hàng | 1. Bấm Thêm bàn<br>2. Nhập số bàn, sức chứa<br>3. Bấm Lưu | `tableNumber: Random`<br>`capacity: 4` | Bàn mới được tạo và hiển thị trong danh sách | **PASS** |
| **TC12** | User Manage | Xem danh sách người dùng & Tìm kiếm | 1. Vào tab Người dùng<br>2. Tìm kiếm theo username | `search: admin` | Hiển thị bảng người dùng và lọc chính xác tài khoản admin | **PASS** |
| **TC13** | User Manage | Tạo tài khoản người dùng mới | 1. Bấm Thêm người dùng<br>2. Nhập họ tên, SĐT, username, mật khẩu<br>3. Lưu | `role: CUSTOMER`<br>`username: user_test` | Tài khoản mới được tạo thành công trên hệ thống | **PASS** |
| **TC14** | Lock/Unlock | Khóa tài khoản người dùng (Set BLOCKED) | 1. Bấm Sửa user<br>2. Đổi trạng thái sang BLOCKED<br>3. Bấm Lưu | `status: BLOCKED` | Tài khoản chuyển sang trạng thái Khóa (BLOCKED) | **PASS** |
| **TC15** | Lock/Unlock | Mở khóa tài khoản người dùng (Set ACTIVE) | 1. Bấm Sửa user<br>2. Đổi trạng thái sang ACTIVE<br>3. Bấm Lưu | `status: ACTIVE` | Tài khoản chuyển lại trạng thái Hoạt động (ACTIVE) | **PASS** |
| **TC16** | RBAC Security| Đăng xuất an toàn khỏi hệ thống (Logout) | 1. Đang ở Dashboard<br>2. Bấm nút Đăng xuất | Action: `logout` | Xóa phiên làm việc, quay về màn hình đăng nhập quản trị | **PASS** |
| **TC17** | RBAC Security| Chặn truy cập khi chưa đăng nhập | 1. Xóa `localStorage`<br>2. Tải lại trang | `localStorage.clear()` | Hệ thống chặn truy cập, yêu cầu đăng nhập | **PASS** |

---

## 4. HƯỚNG DẪN CHẠY KIỂM THỬ TỰ ĐỘNG (HOW TO RUN)

### Bước 1: Khởi động Backend API
Mở Terminal 1 để khởi động Backend phục vụ Database và API:
```bash
cd backend
npm run dev
```
(Chờ Terminal thông báo: `Server is running on port 3000` & `Database synced successfully`).

### Bước 2: Khởi động Frontend Admin (Live Server / Five Server)
Mở Live Server (hoặc Five Server) trong VS Code trên cổng **`5500`**:
* **Cách 1:** Chuột phải vào file `admin/index.html` Chọn **Open with Live Server** (hoặc **Open with Five Server**).
* **Cách 2:** Bấm vào nút **`Go Live`** ở góc dưới cùng bên phải thanh trạng thái của VS Code để kích hoạt `Port: 5500`.

### Bước 3: Thực thi kiểm thử tự động với CodeceptJS
Mở Terminal 2 để chạy toàn bộ kịch bản kiểm thử:
```bash
cd test-ui
npx codeceptjs run tests/admin/admin_test.js --steps
```
(Trình duyệt Chromium sẽ tự động khởi chạy và thực hiện 17 kịch bản kiểm thử).

---

## 5. TỔNG KẾT KẾT QUẢ
* Tổng số kịch bản kiểm thử tự động: 17 Test Cases
* Số kịch bản đạt (Passed): 17 / 17 (100%)
* Số kịch bản lỗi (Failed): 0
* Đánh giá chất lượng: Giao diện quản trị Admin Dashboard hoạt động mượt mà, phản hồi tức thì với các thao tác CRUD dữ liệu, hệ thống bắt lỗi form chính xác và đảm bảo tuyệt đối cơ chế bảo mật phân quyền RBAC.
