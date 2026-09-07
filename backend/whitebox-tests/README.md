# HƯỚNG DẪN THỰC THI KIỂM THỬ HỘP TRẮNG & ĐO ĐỘ BAO PHỦ (WHITE-BOX TESTING & COVERAGE GUIDE)

> **Dự án:** FutureSushi - Hệ thống Đặt món & Quản lý Nhà hàng Sushi  
> **Bộ kiểm thử:** White-box Testing & Boundary Value Analysis (BVA)  
> **Framework:** Jest v30, Supertest  
> **Vị trí:** `backend/whitebox-tests/`

---

## ⚡ HƯỚNG DẪN NHANH (QUICK START)

Mở **PowerShell / Terminal** tại thư mục `backend/`:

```bash
cd backend
```

| Mục đích | Lệnh thực thi | Mô tả |
|---|---|---|
| **Chạy Whitebox Tests** | `npm run test:whitebox` | Chạy toàn bộ 17 Test Suites (293 Test Cases) |
| **Đo độ bao phủ Whitebox (Coverage)** | `npx jest whitebox-tests --coverage` | Chạy Whitebox và xuất bảng báo cáo % độ phủ |
| **Đo độ bao phủ Toàn bộ hệ thống** | `npm run test:coverage` | Chạy toàn bộ test suites và xuất độ phủ tất cả controller |
| **Mở báo cáo giao diện HTML Web** | `Start-Process .\coverage\lcov-report\index.html` | Mở trực quan trên trình duyệt Chrome/Edge |

---

## 1. TỔNG QUAN VỀ ĐỘ BAO PHỦ (COVERAGE) TRONG DỰ ÁN

Bộ kiểm thử hộp trắng được thiết kế để đạt độ bao phủ tối đa trên mã nguồn backend:
- **Statement Coverage (% Stmts):** Đảm bảo mọi dòng lệnh trong controller/middleware đều được chạy qua ($\ge 90\% - 100\%$).
- **Branch Coverage (% Branch):** Kiểm thử tất cả các nhánh rẽ điều kiện `if/else`, toán tử 3 ngôi `? :`, `||`, `&&` cả 2 chiều `true`/`false` ($\ge 85\% - 100\%$).
- **Function Coverage (% Funcs):** Kiểm thử tất cả các hàm và phương thức xử lý API ($100\%$).
- **Line Coverage (% Lines):** Tỷ lệ dòng code thực thi thực tế ($\ge 90\% - 100\%$).
- **Path Coverage & Rollback:** Kiểm thử đầy đủ các luồng thành công, luồng dữ liệu lỗi, luồng ngoại lệ Database và Rollback Transaction.

---

## 2. CẤU TRÚC THƯ MỤC BỘ TEST

```text
backend/
├── jest.config.js                         # Cấu hình Jest & nạp biến môi trường mock
├── jest.setup.js                          # Mock PAYOS_CLIENT_ID, JWT_SECRET, etc.
├── whitebox-tests/                        # THƯ MỤC KIỂM THỬ HỘP TRẮNG
│   ├── README.md                          # Tài liệu hướng dẫn này
│   ├── authController.whitebox.test.js    # 20 TCs - Đăng ký, Đăng nhập (100% Lines)
│   ├── authMiddleware.test.js             # 17 TCs - Xác thực JWT & Phân quyền (100% Lines)
│   ├── categoryController.test.js         # 26 TCs - Quản lý Danh mục (100% Lines)
│   ├── productController.test.js          # 31 TCs - Quản lý Món ăn & Tồn kho (95.9% Lines)
│   ├── orderController.test.js            # 69 TCs - Đơn hàng, Tính tiền & BVA (95.2% Lines)
│   ├── paymentController.test.js          #  1 TC  - Kiểm tra liên kết Method thanh toán
│   ├── payosController.test.js            # 18 TCs - Cổng thanh toán PayOS & Webhook (91.8% Lines)
│   ├── reservationController.test.js      # 40 TCs - Đặt bàn, Check-in & BVA (100% Lines)
│   ├── userController.whitebox.test.js    # 31 TCs - Quản lý Người dùng & Profile (100% Lines)
│   └── Table_Point/                       # 40 TCs - Quản lý Bàn ăn & Tích điểm thưởng
│       ├── Point/pointController.test.js  #  7 TCs - Tích điểm & Transaction Rollback (96.7%)
│       ├── Table/createTable.test.js      #  7 TCs - Tạo bàn ăn đơn lẻ
│       ├── Table/getAllTables.test.js     #  5 TCs - Danh sách bàn & Live Timer
│       ├── Table/getTableByQRCode.test.js #  2 TCs - Tra cứu bàn qua QR / Số bàn
│       ├── Table/updateTable.test.js      #  7 TCs - Cập nhật bàn ăn
│       ├── Table/updateTableStatus.test.js#  4 TCs - Cập nhật trạng thái bàn ăn
│       ├── Table/deleteTable.test.js      #  4 TCs - Xóa bàn ăn
│       ├── Table/bulkCreateTables.test.js #  3 TCs - Nạp bàn ăn hàng loạt
│       ├── helpers/testHelpers.js         # Tiện ích Mock Response/Next
│       └── mocks/                         # Mock Models Sequelize
├── bva-tests/                             # Bộ kiểm thử Biên độc lập (Reservation)
│   └── reservationBVA.test.js
└── stateTransition-tests/                # Bộ kiểm thử Chuyển đổi trạng thái (State Machine)
    └── stateTransition.test.js
```

---

## 3. BẢNG THỐNG KÊ KẾT QUẢ ĐỘ BAO PHỦ CHI TIẾT

| STT | Module / Controller | File Test Suite | Số Test Cases | % Stmts | % Branch | % Funcs | % Lines | Đánh giá |
|:---:|---|---|:---:|:---:|:---:|:---:|:---:|:---:|
| 1 | **Auth Controller** | `authController.whitebox.test.js` | 20 | **100%** | **100%** | **100%** | **100%** | Xuất sắc |
| 2 | **Auth Middleware** | `authMiddleware.test.js` | 17 | **100%** | **100%** | **100%** | **100%** | Xuất sắc |
| 3 | **Category Controller** | `categoryController.test.js` | 26 | **100%** | **100%** | **100%** | **100%** | Xuất sắc |
| 4 | **Reservation Controller** | `reservationController.test.js` | 40 | **100%** | **100%** | **100%** | **100%** | Xuất sắc |
| 5 | **User Controller** | `userController.whitebox.test.js` | 31 | **100%** | **100%** | **100%** | **100%** | Xuất sắc |
| 6 | **Point Controller** | `Table_Point/Point/pointController.test.js` | 7 | **96.8%** | **80.0%** | **100%** | **96.7%** | Rất cao |
| 7 | **Product Controller** | `productController.test.js` | 31 | **96.0%** | **96.5%** | **100%** | **95.9%** | Rất cao |
| 8 | **Order Controller** | `orderController.test.js` | 69 | **95.4%** | **79.3%** | **100%** | **95.2%** | Rất cao |
| 9 | **PayOS Controller** | `payosController.test.js` | 18 | **92.2%** | **79.7%** | **100%** | **91.8%** | Rất cao |
| 10 | **Table Controller** | `Table_Point/Table/*.test.js` (7 files) | 33 | **89.4%** | **84.6%** | **100%** | **89.4%** | Rất cao |
| 11 | **Payment Controller** | `paymentController.test.js` | 1 | Binding | Binding | Binding | Binding | Đạt |
| | **TỔNG KẾT TOÀN BỘ** | **17 Test Suites** | **293 Test Cases** | **88.8%** | **86.1%** | **89.7%** | **88.6%** | **100% PASS** |

---

## 4. HƯỚNG DẪN CÀI ĐẶT & CHUẨN BỊ MÔI TRƯỜNG

1. Đảm bảo máy tính đã cài **Node.js** (Khuyên dùng v18+ hoặc v20+).
2. Di chuyển vào thư mục backend và cài đặt thư viện:
   ```bash
   cd backend
   npm install
   ```

---

## 5. HƯỚNG DẪN CHI TIẾT CÁC LỆNH CHẠY KIỂM THỬ ĐỘ PHỦ

### 5.1. Chạy đo độ phủ chỉ riêng cho thư mục `whitebox-tests` (Khuyên dùng khi báo cáo Whitebox)
```bash
npx jest whitebox-tests --coverage
```
*hoặc:*
```bash
npm run test:coverage -- whitebox-tests
```

### 5.2. Chạy đo độ phủ cho toàn bộ hệ thống Backend
```bash
npm run test:coverage
```

### 5.3. Chạy đo độ phủ cho từng Module / File kiểm thử riêng biệt

- **1. Module Xác thực (Auth Controller):**
  ```bash
  npx jest whitebox-tests/authController.whitebox.test.js --coverage
  ```
- **2. Module Middleware Bảo vệ & Phân quyền (Auth Middleware):**
  ```bash
  npx jest whitebox-tests/authMiddleware.test.js --coverage
  ```
- **3. Module Quản lý Người dùng (User Controller):**
  ```bash
  npx jest whitebox-tests/userController.whitebox.test.js --coverage
  ```
- **4. Module Danh mục món ăn (Category Controller):**
  ```bash
  npx jest whitebox-tests/categoryController.test.js --coverage
  ```
- **5. Module Món ăn & Tồn kho (Product Controller):**
  ```bash
  npx jest whitebox-tests/productController.test.js --coverage
  ```
- **6. Module Đơn hàng & Thanh toán (Order Controller):**
  ```bash
  npx jest whitebox-tests/orderController.test.js --coverage
  ```
- **7. Module Cổng thanh toán trực tuyến (PayOS Controller):**
  ```bash
  npx jest whitebox-tests/payosController.test.js --coverage
  ```
- **8. Module Đặt bàn & Check-in (Reservation Controller):**
  ```bash
  npx jest whitebox-tests/reservationController.test.js --coverage
  ```
- **9. Module Quản lý Bàn ăn & Tích điểm (Table & Point Controller):**
  ```bash
  npx jest whitebox-tests/Table_Point --coverage
  ```

### 5.4. Chạy kiểm thử thông thường (Không xuất bảng Coverage)
```bash
# Chạy 17 Test Suites White-box:
npm run test:whitebox

# Chạy toàn bộ 19 Test Suites (White-box + BVA + State Transition):
npm test

# Chạy chế độ tự động theo dõi file thay đổi (Watch Mode):
npm run test:watch
```

---

## 6. HƯỚNG DẪN XEM & ĐỌC BÁO CÁO GIAO DIỆN WEB (HTML REPORT)

Khi chạy bất kỳ lệnh nào có cờ `--coverage`, Jest sẽ tự động tạo báo cáo HTML chi tiết tại đường dẫn:
```text
backend/coverage/lcov-report/index.html
```

### 6.1. Cách mở báo cáo trên Windows PowerShell
```powershell
Start-Process .\coverage\lcov-report\index.html
```
*(Hoặc vào thư mục `backend/coverage/lcov-report/` và double click vào file `index.html` để mở trong trình duyệt Chrome / Edge / Firefox).*

### 6.2. Cách đọc và phân tích giao diện báo cáo HTML
Khi mở `index.html` trên trình duyệt:
1. **Bảng tổng hợp:** Hiển thị danh sách tất cả các file controller và middleware cùng tỷ lệ % bao phủ 4 chỉ số (Statements, Branches, Functions, Lines).
2. **Xem chi tiết từng file mã nguồn:** Nhấp chuột vào tên file (ví dụ: `authController.js` hoặc `orderController.js`):
   - 🟩 **Vùng màu xanh lá:** Dòng code đã được thực thi và kiểm thử đầy đủ.
   - 🟨 **Biểu tượng màu vàng (`I` / `E`):** Nhánh điều kiện `if` chỉ mới được chạy một chiều (chỉ `true` hoặc chỉ `false`).
   - 🟥 **Vùng màu đỏ:** Dòng code chưa có test case nào chạy tới.
   - 🔢 **Cột số bên trái:** Hiển thị số lần dòng code đó được test case gọi trong quá trình kiểm thử (ví dụ: `20x`, `5x`).

---

## 7. QUY ƯỚC MÃ ĐỊNH DANH TEST CASE

| Tiền tố mã định danh | Ý nghĩa |
|---|---|
| `[WB-AUTH-REG-xx]` | Kiểm thử các nhánh & đường đi của hàm `register` |
| `[WB-AUTH-LOG-xx]` | Kiểm thử các nhánh & đường đi của hàm `login` |
| `[WB-AUTH-xx]` | Kiểm thử Middleware `verifyToken`, `isAdmin`, `isStaffOrAdmin` |
| `[WB-USR-xxx]` | Kiểm thử các nhánh phân quyền & CRUD người dùng |
| `[WB-CAT-xx]` | Kiểm thử các nhánh danh mục món ăn |
| `[WB-PRD-xx]` | Kiểm thử các nhánh món ăn & ràng buộc toàn vẹn dữ liệu |
| `[WB-ORD-xx]` | Kiểm thử các nhánh xử lý đơn hàng & thanh toán |
| `[WB-PAYOS-xx]` | Kiểm thử đối soát cổng thanh toán PayOS & Webhook |
| `[WB-RES-xx]` | Kiểm thử luồng đặt bàn, check-in, hủy bàn, xác nhận |
| `[BVA-xxx]` & `[RBVA-xxx]` | Kiểm thử giá trị biên chuẩn ($4n+1$) và biên mở rộng ($6n+1$) |
| `[TB-WB-xxx]` & `[TB-BVA-xxx]` | Kiểm thử nhánh & biên cho quản lý Bàn ăn |
| `[WB-POINT-xxx]` | Kiểm thử tính điểm & Rollback Transaction |
