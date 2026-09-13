# HƯỚNG DẪN CHẠY TEST DỰ ÁN

## 1. Test Backend (Thư mục `/backend`)

```bash
cd backend
npm install   # Lần đầu

npm test              # Chạy toàn bộ 
npm run test:coverage # Xem độ phủ code 
npm run test:whitebox # Chạy riêng White-box
npm run test:bva      # Chạy riêng BVA (Giá trị biên)
npm run test:state    # Chạy riêng State Transition
```

---

## 2. Test Giao diện UI (Thư mục `/docs/testing/test-ui`)

**Bước 1:** Bật server ở Terminal 1:
```bash
cd backend
npm start
```

**Bước 2:** Chạy test ở Terminal 2:
```bash
cd "docs/testing/test-ui"
npm install   # Lần đầu

npm test                 # Chạy toàn bộ UI Test
npm run test:steps       # Chạy xem từng bước (click, fill)

# Chạy theo từng phân hệ:
npm run test:customer    # Khách hàng (Menu, Giỏ hàng, Đặt món)
npm run test:kitchen     # Bếp (Kanban chế biến món)
npm run test:staff       # Phục vụ (Đơn hàng, Bàn ăn, Thu tiền)
npm run test:reservation # Đặt bàn
npm run test:review      # Đánh giá
npm run test:auth        # Đăng ký / Đăng nhập
```
