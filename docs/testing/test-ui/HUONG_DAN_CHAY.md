# HƯỚNG DẪN CHẠY TEST ĐƠN GIẢN

### 1. Chuẩn bị (Chỉ cần làm 1 lần đầu)
Mở terminal tại `docs/testing/test-ui` và chạy:
```bash
npm install
npx playwright install chromium
```

---

### 2. Khởi động Web Server (Mở Terminal 1)
```bash
cd backend
npm start
```

---

### 3. Chạy Test UI (Mở Terminal 2 tại `docs/testing/test-ui`)

```bash
npm test                 # Chạy toàn bộ UI Test
npm run test:steps       # Chạy xem từng bước (click, fill)

# Chạy theo từng chức năng:
npm run test:customer    # Khách hàng (Menu, Giỏ hàng, Đặt món)
npm run test:kitchen     # Bếp (Kanban chế biến món)
npm run test:staff       # Phục vụ (Đơn hàng, Bàn ăn, Thu tiền)
npm run test:reservation # Đặt bàn
npm run test:review      # Đánh giá
npm run test:auth        # Đăng ký / Đăng nhập / Quét QR
```
