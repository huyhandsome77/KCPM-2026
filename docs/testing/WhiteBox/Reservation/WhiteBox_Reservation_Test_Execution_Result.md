# KẾT QUẢ THỰC THI KIỂM THỬ HỘP TRẮNG & CODE COVERAGE (TEST EXECUTION RESULT)

**Dự án:** FutureSushi - Hệ thống Đặt món & Quản lý Nhà hàng Sushi

**Module kiểm thử:** Reservation Management

**Thư mục chứa Test Suite:** `backend/whitebox-tests/`

**Môi trường kiểm thử:** Node.js, Jest Test Runner, Istanbul Coverage

**Loại kiểm thử:** White-Box Testing

**Đối tượng kiểm thử:** `backend/controllers/reservationController.js`

---

## 1. TỔNG KẾT KẾT QUẢ THỰC THI (EXECUTIVE TEST SUMMARY)

| Chỉ số tổng quan | Giá trị thực tế | Tỷ lệ đạt được | Đánh giá |
| :--- | :---: | :---: | :--- |
| **Tổng số Test Suites** | 1 / 1 Suite | **100% PASS** | Đạt yêu cầu |
| **Tổng số Test Cases** | **30 / 30 Cases** | **100% PASS** | Hoàn thành |
| **Số Test Case thất bại (Failed)** | 0 Cases | **0%** | Không có lỗi |
| **Statements Coverage** | 100% | **100%** | Xuất sắc |
| **Branches Coverage** | 100% | **100%** | Xuất sắc |
| **Functions Coverage** | 100% | **100%** | Xuất sắc |
| **Lines Coverage** | 100% | **100%** | Xuất sắc |

---

## 2. KẾT QUẢ CHI TIẾT THEO TEST SUITE

### 2.1 Test Suite: `reservationController.test.js` (30/30 PASS)

- **File kiểm thử:** `backend/whitebox-tests/reservationController.test.js`
- **Đối tượng kiểm thử:** `backend/controllers/reservationController.js`
- **Kết quả Coverage:** Statements: 100% | Branches: 100% | Functions: 100% | Lines: 100%

| Test Case ID | Tên Kịch Bản Kiểm Thử | Kết quả thực tế | Trạng thái |
| :--- | :--- | :--- | :---: |
| **WB-RES-01** | Tạo đặt bàn thành công khi có bàn phù hợp | PASS | **PASS** |
| **WB-RES-02** | Không có bàn phù hợp → trả về 400 | PASS | **PASS** |
| **WB-RES-03** | Có bàn đã bị chiếm trong khung giờ đặt | PASS | **PASS** |
| **WB-RES-04** | Lỗi database khi tạo reservation → rollback và trả 500 | PASS | **PASS** |
| **WB-RES-05** | Tạo reservation không có `user_id` → lưu `user_id` là null | PASS | **PASS** |
| **WB-RES-06** | Không tìm thấy reservation → 404 | PASS | **PASS** |
| **WB-RES-07** | Trạng thái không hợp lệ để check-in → 400 | PASS | **PASS** |
| **WB-RES-08** | Check-in quá sớm hơn 30 phút → 400 | PASS | **PASS** |
| **WB-RES-09** | Check-in quá muộn hơn 30 phút → 400 | PASS | **PASS** |
| **WB-RES-10** | Check-in đúng thời gian → thành công | PASS | **PASS** |
| **WB-RES-11** | Lỗi khi check-in → rollback và gọi `next(error)` | PASS | **PASS** |
| **WB-RES-12** | Check-in khi reservation không có `status` → 400 | PASS | **PASS** |
| **WB-RES-13** | Không tìm thấy reservation khi hủy → 404 | PASS | **PASS** |
| **WB-RES-14** | Hủy reservation trạng thái `PENDING` thành công | PASS | **PASS** |
| **WB-RES-15** | Hủy reservation trạng thái `CONFIRMED` thành công | PASS | **PASS** |
| **WB-RES-16** | Không thể hủy reservation trạng thái khác → 400 | PASS | **PASS** |
| **WB-RES-17** | Lỗi khi hủy reservation → gọi `next(error)` | PASS | **PASS** |
| **WB-RES-18** | Hủy reservation không có `status` → 400 | PASS | **PASS** |
| **WB-RES-19** | Không tìm thấy reservation khi xác nhận → 404 | PASS | **PASS** |
| **WB-RES-20** | Xác nhận reservation `PENDING` thành `CONFIRMED` | PASS | **PASS** |
| **WB-RES-21** | Reservation không phải `PENDING` → 400 | PASS | **PASS** |
| **WB-RES-22** | Lỗi khi xác nhận reservation → `next(error)` | PASS | **PASS** |
| **WB-RES-23** | Xác nhận reservation không có `status` → 400 | PASS | **PASS** |
| **WB-RES-24** | Cập nhật trạng thái thành công | PASS | **PASS** |
| **WB-RES-25** | Không tìm thấy reservation khi cập nhật → 404 | PASS | **PASS** |
| **WB-RES-26** | Lỗi khi cập nhật → `next(error)` | PASS | **PASS** |
| **WB-RES-27** | Lấy danh sách reservation của user thành công | PASS | **PASS** |
| **WB-RES-28** | Lỗi database khi lấy reservation của user → `next(error)` | PASS | **PASS** |
| **WB-RES-29** | Lấy toàn bộ reservation thành công | PASS | **PASS** |
| **WB-RES-30** | Lỗi database khi lấy toàn bộ reservation → `next(error)` | PASS | **PASS** |

---

## 3. LOG MÁY THỰC THI (RAW TEST EXECUTION LOG)

```text
PASS  whitebox-tests/reservationController.test.js

White-Box Testing: Reservation Controller

createReservation
  √ [WB-RES-01] Tạo đặt bàn thành công khi có bàn phù hợp
  √ [WB-RES-02] Không có bàn phù hợp -> trả về 400
  √ [WB-RES-03] Có bàn đã bị chiếm trong khung giờ đặt
  √ [WB-RES-04] Lỗi database khi tạo reservation -> rollback và trả 500
  √ [WB-RES-05] Tạo reservation không có user_id -> lưu user_id là null

checkIn
  √ [WB-RES-06] Không tìm thấy reservation -> 404
  √ [WB-RES-07] Trạng thái không hợp lệ để check-in -> 400
  √ [WB-RES-08] Check-in quá sớm hơn 30 phút -> 400
  √ [WB-RES-09] Check-in quá muộn hơn 30 phút -> 400
  √ [WB-RES-10] Check-in đúng thời gian -> thành công
  √ [WB-RES-11] Lỗi khi check-in -> rollback và gọi next(error)
  √ [WB-RES-12] Check-in khi reservation không có status -> 400

cancelReservation
  √ [WB-RES-13] Không tìm thấy reservation -> 404
  √ [WB-RES-14] Hủy reservation trạng thái PENDING thành công
  √ [WB-RES-15] Hủy reservation trạng thái CONFIRMED thành công
  √ [WB-RES-16] Không thể hủy reservation trạng thái khác -> 400
  √ [WB-RES-17] Lỗi khi hủy reservation -> gọi next(error)
  √ [WB-RES-18] Hủy reservation không có status -> 400

confirmReservation
  √ [WB-RES-19] Không tìm thấy reservation -> 404
  √ [WB-RES-20] Xác nhận reservation PENDING thành CONFIRMED
  √ [WB-RES-21] Reservation không phải PENDING -> 400
  √ [WB-RES-22] Lỗi khi xác nhận reservation -> next(error)
  √ [WB-RES-23] Xác nhận reservation không có status -> 400

updateReservationStatus
  √ [WB-RES-24] Cập nhật trạng thái thành công
  √ [WB-RES-25] Không tìm thấy reservation -> 404
  √ [WB-RES-26] Lỗi khi cập nhật -> next(error)

getMyReservations
  √ [WB-RES-27] Lấy danh sách reservation của user thành công
  √ [WB-RES-28] Lỗi database -> next(error)

getAllReservations
  √ [WB-RES-29] Lấy toàn bộ reservation thành công
  √ [WB-RES-30] Lỗi database khi lấy toàn bộ reservation -> next(error)

--------------------------|---------|----------|---------|---------|-------------------
File                      | % Stmts | % Branch | % Funcs | % Lines |
--------------------------|---------|----------|---------|---------|-------------------
All files                 |     100 |      100 |     100 |     100 |
 reservationController.js |     100 |      100 |     100 |     100 |
--------------------------|---------|----------|---------|---------|-------------------

Test Suites: 1 passed, 1 total
Tests:       30 passed, 30 total
Snapshots:   0 total
```

---

## 4. TÀI NGUYÊN BÀN GIAO KÈM THEO

- **File mã nguồn Test:** `backend/whitebox-tests/reservationController.test.js`
- **File Test Case Excel:** `docs/testing/WhiteBox/Reservation/WhiteBox_Reservation_TestCases.xlsx`
- **File kết quả thực thi:** `docs/testing/WhiteBox/Reservation/WhiteBox_Reservation_Test_Execution_Result.md`
- **Báo cáo kiểm thử:** `docs/testing/WhiteBox/Reservation/WhiteBox_Reservation_Test_Report.md`
- **Báo cáo Coverage tự sinh:** `backend/coverage/lcov-report/index.html`

---

## 5. KẾT LUẬN

Module Reservation Management đã được kiểm thử bằng phương pháp White-Box Testing với tổng cộng 30 Test Cases.

Các chức năng được kiểm thử bao gồm:

- Tạo đặt bàn (createReservation)
- Nhận bàn (checkIn)
- Hủy đặt bàn (cancelReservation)
- Xác nhận đặt bàn (confirmReservation)
- Cập nhật trạng thái (updateReservationStatus)
- Lấy danh sách đặt bàn của người dùng (getMyReservations)
- Lấy toàn bộ danh sách đặt bàn (getAllReservations)
# Kết quả cuối cùng
- Test Suites: 1 / 1 PASS
- Test Cases: 30 / 30 PASS
- Failed: 0
- Statements Coverage: 100%
- Branches Coverage: 100%
- Functions Coverage: 100%
- Lines Coverage: 100%

# KẾT QUẢ CUỐI CÙNG: PASS