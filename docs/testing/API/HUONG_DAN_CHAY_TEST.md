# 🍣 HƯỚNG DẪN CHẠY BỘ KIỂM THỬ TỰ ĐỘNG REST API (FUTURESUSHI)

Tài liệu này hướng dẫn chi tiết cách chạy kiểm thử tự động toàn bộ 12 bộ Postman Collections API và xem bảng kết quả trực quan trên **Console Terminal** kèm file JSON báo cáo.

---

## ⚡ CHẠY NHANH (QUICK START)

1. **Khởi động Backend Server** (nếu kiểm thử Live):
   ```bash
   cd backend
   npm run dev
   ```

2. **Chạy Runner Script tổng hợp toàn bộ 12 API Suites**:
   ```bash
   cd backend
   npm run test:api
   ```

3. **Chạy toàn bộ bao gồm cả kiểm thử giá trị biên (17 Suites gồm BVA)**:
   ```bash
   node docs/testing/API/run_all_api_tests.js --bva
   ```

---

## 📊 KẾT QUẢ ĐẦU RA (OUTPUTS)

Khi chạy xong, hệ thống sẽ:
1. **In bảng kết quả trực quan trên Console Terminal**.
2. **Tạo file JSON Báo cáo Chuẩn:**
   - [`docs/testing/API/API_Test_Report.json`](./API_Test_Report.json)
   - [`docs/testing/API/report/API_Test_Report.json`](./report/API_Test_Report.json)

