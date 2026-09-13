# Bộ Kiểm thử Tự động Giao diện (UI Automated Testing Suite)

Tài liệu hướng dẫn và cấu trúc toàn diện của bộ kiểm thử tự động giao diện (End-to-End UI Testing) cho hệ thống **FutureSushi** sử dụng **CodeceptJS** và **Playwright**.

---

## 1. Cấu trúc thư mục thống nhất (`docs/testing/test-ui/`)

```text
docs/testing/test-ui/
├── Customer_UI_Report/                      # Báo cáo chi tiết các chức năng Customer UI
│   ├── Booking.md                          # Báo cáo đặt bàn trực tuyến
│   ├── Login-Logout.md                     # Báo cáo đăng nhập & đăng xuất
│   ├── Scanqr-Datmon.md                    # Báo cáo quét QR & đặt món
│   ├── cart.md                             # Báo cáo giỏ hàng & tăng giảm số lượng
│   ├── login-register.md                   # Báo cáo đăng ký tài khoản
│   ├── menu_search_fliter.md               # Báo cáo tìm kiếm & lọc thực đơn
│   ├── oder_history.md                     # Báo cáo xem lịch sử đơn hàng
│   └── reservation-review-test.md          # Báo cáo kiểm thử đặt bàn & đánh giá
├── tests/                                   # Kịch bản kiểm thử E2E
│   ├── auth/                               # Kiểm thử luồng xác thực
│   │   ├── login_test.js                   # Đăng nhập hệ thống & quét mã QR
│   │   └── register_test.js                # Đăng ký tài khoản khách hàng
│   ├── customer/                           # Kiểm thử toàn diện luồng khách hàng
│   │   ├── booking_test.js                 # Đặt bàn khách hàng
│   │   ├── cart_test.js                    # Thao tác giỏ hàng & voucher
│   │   ├── login_logout_test.js            # Đăng nhập & đăng xuất
│   │   ├── menu_search_filter_test.js      # Tìm kiếm & phân loại món ăn
│   │   ├── oder_history.js                 # Xem lịch sử đơn hàng
│   │   ├── order_test.js                   # Luồng đặt món
│   │   └── scan_qr_test.js                 # Quét QR code bàn ăn
│   ├── kitchen/                            # Kiểm thử luồng Bộ phận Bếp
│   │   ├── kitchen_test.js                 # 20 TCs: Kanban board, chế biến món, lọc ngày
│   │   └── Kitchen_UI_Report.md            # Báo cáo kiểm thử bộ phận Bếp
│   ├── reservation/                        # Kiểm thử Đặt bàn độc lập
│   │   └── reservation_test.js             # 13 TCs: Giao diện, validation, chọn khách, giờ
│   ├── review/                             # Kiểm thử Đánh giá món ăn
│   │   └── review_test.js                  # 16 TCs: Chọn 1-5 sao, tiêu đề, nội dung, thống kê
│   └── staff/                              # Kiểm thử luồng Nhân viên Phục vụ
│       ├── staff_test.js                   # 36 TCs: Quản lý đơn, bàn, check-in, thu tiền
│       └── Staff_UI_Report.md              # Báo cáo kiểm thử nhân viên Phục vụ
├── Scrum-31.md                             # Báo cáo kiểm thử Scrum Sprint
├── reservation-review-test.md              # Báo cáo tổng hợp Đặt bàn & Đánh giá
├── codecept.conf.js                        # Cấu hình Playwright Helper & đường dẫn URL
├── package.json                            # Scripts & dependencies
├── steps_file.js                           # Custom steps cho CodeceptJS
├── steps.d.ts                              # TypeScript definitions cho auto-complete
└── jsconfig.json                           # Cấu hình IDE editor
```

---

## 2. Hướng dẫn Cài đặt & Chạy kiểm thử

### Bước 1: Cài đặt thư viện dependencies
Mở terminal tại thư mục `docs/testing/test-ui`:
```bash
cd docs/testing/test-ui
npm install
```

### Bước 2: Chạy ứng dụng web phục vụ kiểm thử
Đảm bảo backend hoặc Live Server đang chạy tại cổng mặc định (`http://127.0.0.1:5500` hoặc `http://localhost:3000`):
```bash
# Tại thư mục backend:
npm start
```

### Bước 3: Thực thi các kịch bản kiểm thử (Test Execution)

| Chức năng / Phân hệ | Lệnh thực thi npm | Lệnh thực thi npx CodeceptJS |
|---|---|---|
| **Chạy toàn bộ UI Tests** | `npm test` | `npx codeceptjs run` |
| **Chạy và hiển thị từng bước** | `npm run test:steps` | `npx codeceptjs run --steps` |
| **Kiểm thử Xác thực (Auth)** | `npm run test:auth` | `npx codeceptjs run tests/auth/ --steps` |
| **Kiểm thử Khách hàng (Customer)** | `npm run test:customer` | `npx codeceptjs run tests/customer/ --steps` |
| **Kiểm thử Bộ phận Bếp (Kitchen)** | `npm run test:kitchen` | `npx codeceptjs run tests/kitchen/ --steps` |
| **Kiểm thử Phục vụ (Staff)** | `npm run test:staff` | `npx codeceptjs run tests/staff/ --steps` |
| **Kiểm thử Đặt bàn (Reservation)** | `npm run test:reservation` | `npx codeceptjs run tests/reservation/ --steps` |
| **Kiểm thử Đánh giá (Review)** | `npm run test:review` | `npx codeceptjs run tests/review/ --steps` |

---

## 3. Tổng hợp Báo cáo & Kết quả Kiểm thử

- **Giao diện Khách hàng (Customer UI)**: Đạt 100% tỷ lệ đỗ trên các luồng Đăng ký, Đăng nhập, Xem menu, Tìm kiếm món ăn, Giỏ hàng, Đặt món, Đặt bàn, và Đánh giá (29/29 TCs).
- **Bộ phận Bếp (Kitchen UI)**: Đạt 100% tỷ lệ đỗ (20/20 TCs) trên giao diện Kanban 3 cột, cập nhật tiến độ `CONFIRMED` $\rightarrow$ `PREPARING` $\rightarrow$ `READY`, bộ lọc thời gian hôm nay / tất cả ngày, tìm kiếm món ăn live search.
- **Nhân viên Phục vụ (Staff UI)**: Đạt 100% tỷ lệ đỗ (36/36 TCs) trên 4 phân hệ chính:
  1. Quản lý đơn hàng & xác nhận / hủy đơn.
  2. Thu tiền & thanh toán tiền mặt (tính tiền thừa tự động) hoặc PayOS QR.
  3. Quản lý trạng thái bàn ăn (`AVAILABLE`, `OCCUPIED`, `BOOKED`, `CLEANING`) & in mã QR bàn.
  4. Quản lý đặt bàn & Check-in nhận bàn trực tiếp cho khách.
