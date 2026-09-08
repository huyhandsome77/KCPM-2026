# HƯỚNG DẪN TỔNG HỢP CHẠY KIỂM THỬ DỰ ÁN (TESTING SUITE GUIDE)

Tài liệu hướng dẫn tổng quan cách thực thi tất cả các cấp độ kiểm thử trong dự án **FutureSushi / AppDatMon**, bao gồm **Backend Unit/White-box Testing**, **Kiểm thử Giá trị biên (BVA)**, **Kiểm thử Chuyển đổi trạng thái (State Transition)**, và **Kiểm thử Tự động Giao diện (UI E2E Testing)**.

---

## 1. Bản đồ Các Bộ Kiểm thử (Testing Sitemap)

```text
KCPM-2026/
├── backend/
│   ├── whitebox-tests/                      # Kiểm thử Hộp trắng toàn diện (22 Suites / 381 TCs) -> 100% Lines
│   ├── bva-tests/                           # Kiểm thử Giá trị biên (BVA) cho Đặt bàn & Đơn hàng
│   ├── stateTransition-tests/               # Kiểm thử Chuyển đổi trạng thái Đơn hàng & Bàn ăn
│   └── README.md                            # Hướng dẫn chạy test Backend
│
└── docs/testing/
    ├── test-ui/                             # Kiểm thử Tự động Giao diện (CodeceptJS + Playwright)
    │   ├── tests/                           # Kịch bản E2E: Auth, Customer, Kitchen, Staff, Reservation, Review
    │   ├── Customer_UI_Report/              # Báo cáo chi tiết các chức năng Customer UI
    │   ├── HUONG_DAN_CHAY.md                # Hướng dẫn chạy chi tiết UI Test
    │   └── README.md                        # Giới thiệu phân hệ UI Test
    ├── API/                                 # Tài liệu kiểm thử API Postman/Swagger
    ├── BVA/                                 # Tài liệu phân tích thiết kế ca kiểm thử Giá trị biên
    ├── WhiteBox/                            # Tài liệu phân tích Luồng điều khiển & Độ bao phủ
    └── SCRUM-14/                            # Báo cáo kiểm thử Sprint
```

---

## 2. Phần I: Hướng dẫn Chạy Kiểm thử Backend (Jest)

Di chuyển vào thư mục `backend`:
```bash
cd backend
npm install
```

### Các lệnh thực thi:

| Mục tiêu kiểm thử | Lệnh thực thi | Mô tả |
|---|---|---|
| **Chạy toàn bộ kiểm thử Backend** | `npm test` | Chạy 22 Test Suites (381 Test Cases PASS 100%) |
| **Xuất báo cáo Độ bao phủ (Coverage)** | `npm run test:coverage` | Đo lường % Lines, % Branch, % Stmts (**Đạt 100% Lines**) |
| **Chạy kiểm thử Hộp trắng (White-box)** | `npm run test:whitebox` | Kiểm thử Branch Coverage & Path Coverage các Controller |
| **Chạy kiểm thử Giá trị biên (BVA)** | `npm run test:bva` | Kiểm thử biên cho Đặt bàn, Tồn kho, Giảm giá |
| **Chạy kiểm thử Chuyển trạng thái** | `npm run test:state` | Kiểm thử luồng trạng thái Đơn hàng & Bàn ăn |
| **Chạy chế độ Watch (tự động rerun)** | `npm run test:watch` | Tự động chạy lại khi lưu code |

---

## 3. Phần II: Hướng dẫn Chạy Kiểm thử Giao diện (CodeceptJS & Playwright)

Di chuyển vào thư mục `docs/testing/test-ui`:
```bash
cd "docs/testing/test-ui"
npm install
```

### Các lệnh thực thi:

| Phân hệ giao diện | Lệnh thực thi | Mục tiêu kiểm thử |
|---|---|---|
| **Chạy tất cả UI Tests** | `npm test` | Chạy toàn bộ các kịch bản UI |
| **Chạy kèm chi tiết từng bước** | `npm run test:steps` | Hiển thị từng bước thao tác click/fill/see |
| **Khách hàng (Customer UI)** | `npm run test:customer` | Đăng ký, đăng nhập, menu, giỏ hàng, đặt món, lịch sử |
| **Bộ phận Bếp (Kitchen UI)** | `npm run test:kitchen` | Bảng Kanban 3 cột, chế biến món, lọc theo ngày |
| **Phục vụ (Staff UI)** | `npm run test:staff` | Quản lý đơn, thu tiền mặt/PayOS, quản lý bàn, check-in |
| **Đặt bàn (Reservation)** | `npm run test:reservation` | Form đặt bàn trực tuyến, validation dữ liệu |
| **Đánh giá (Review)** | `npm run test:review` | Đánh giá sao (1-5 sao), tiêu đề, nội dung, thống kê |
| **Xác thực (Auth & QR)** | `npm run test:auth` | Đăng ký, đăng nhập và quét mã QR |

---

## 4. Bảng Kết quả Đạt được (Test Results Summary)

1. **Backend Testing (Jest)**:
   - **Tỷ lệ đỗ**: 381/381 Test Cases (**100% PASS** trên 22 Suites).
   - **Độ bao phủ câu lệnh (Statements)**: **100%** (1028/1028).
   - **Độ bao phủ dòng code (Lines)**: **100%** (987/987).
   - **Độ bao phủ hàm (Functions)**: **100%** (68/68).
   - **Độ bao phủ nhánh (Branches)**: **95.55%** (666/697).

2. **Frontend UI E2E Testing (CodeceptJS & Playwright)**:
   - **Giao diện Khách hàng**: Đạt 100% PASS trên toàn bộ các luồng thao tác.
   - **Giao diện Bếp (Kitchen)**: 20/20 Test Cases PASS 100%.
   - **Giao diện Phục vụ (Staff)**: 36/36 Test Cases PASS 100%.
   - **Đặt bàn & Đánh giá**: 29/29 Test Cases PASS 100%.
