# BÁO CÁO KIỂM THỬ HỘP TRẮNG (WHITE-BOX TESTING) & ĐỘ BAO PHỦ MÃ NGUỒN (CODE COVERAGE)

Học phần: Kiểm chứng và Đảm bảo Chất lượng Phần mềm (KCPM)

Dự án: FutureSushi - Hệ thống Đặt món & Quản lý Nhà hàng Sushi

Module phụ trách: Quản lý Đặt bàn (Reservation Management)

Người thực hiện: Trần Minh Trí

Công cụ kiểm thử: Jest Framework, Istanbul Code Coverage Reporter

Ngày thực hiện: 24/08/2026

## 1. TỔNG QUAN VÀ MỤC TIÊU KIỂM THỬ

### 1.1 Mục tiêu

Kiểm thử cấu trúc nội bộ mã nguồn theo phương pháp White-Box Testing cho module Reservation Management.

Kiểm tra các câu lệnh, nhánh điều kiện, hàm và dòng lệnh trong file reservationController.js.

Kiểm tra các luồng xử lý thành công và các trường hợp lỗi.

Kiểm tra các chức năng tạo reservation, check-in, hủy reservation, xác nhận reservation, cập nhật trạng thái và lấy danh sách reservation.

Kiểm tra cơ chế transaction bao gồm commit, rollback và xử lý ngoại lệ thông qua next(error).

### 1.2 Phạm vi kiểm thử

Tên File / Thành phần

Đường dẫn

Chức năng chính

reservationController.js

backend/controllers/reservationController.js

Xử lý tạo reservation, check-in, hủy, xác nhận, cập nhật trạng thái và lấy danh sách reservation

reservationController.test.js

backend/whitebox-tests/reservationController.test.js

Kiểm thử White-Box cho Reservation Controller

## 2. TỔNG HỢP KẾT QUẢ CODE COVERAGE

Kết quả chạy lệnh:

npx jest whitebox-tests/reservationController.test.js --coverage

Chỉ số Coverage

Tỷ lệ (%)

Đánh giá

Statements (Câu lệnh)

100%

Xuất sắc

Branches (Nhánh điều kiện)

100%

Xuất sắc

Functions (Hàm / Phương thức)

100%

Xuất sắc

Lines (Dòng lệnh)

100%

Xuất sắc

### 2.1 Bảng chi tiết độ bao phủ

--------------------------|---------|----------|---------|---------|-------------------
File                      | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s
--------------------------|---------|----------|---------|---------|-------------------
All files                 |     100 |      100 |     100 |     100 |
 reservationController.js |     100 |      100 |     100 |     100 |
--------------------------|---------|----------|---------|---------|-------------------

Kết quả cho thấy file reservationController.js đạt:

Statements Coverage: 100%

Branch Coverage: 100%

Function Coverage: 100%

Line Coverage: 100%

Không còn dòng lệnh hoặc nhánh điều kiện nào chưa được kiểm thử.

## 3. THIẾT KẾ TEST CASE WHITE-BOX & PHÂN TÍCH NHÁNH

### 3.1 Tổng số Test Case

Tổng số Test Case được thực thi cho reservationController.js là 30 Test Cases.

### 3.2 Create Reservation

ID

Hàm kiểm thử

Kịch bản / Nhánh thực thi

Dữ liệu đầu vào

Kết quả mong đợi

Trạng thái

WB-RES-01

createReservation

Tạo đặt bàn thành công khi có bàn phù hợp

Dữ liệu reservation hợp lệ

Reservation được tạo thành công

PASS

WB-RES-02

createReservation

Không có bàn phù hợp

Không tìm thấy bàn đáp ứng điều kiện

Trả về HTTP 400

PASS

WB-RES-03

createReservation

Có bàn đã bị chiếm trong khung giờ đặt

Thời gian đặt trùng với reservation khác

Không sử dụng bàn đã bị chiếm

PASS

WB-RES-04

createReservation

Lỗi database khi tạo reservation

Database ném Error

Rollback transaction và trả lỗi

PASS

WB-RES-05

createReservation

Tạo reservation không có user_id

Không có thông tin user

Lưu user_id là null

PASS

### 3.3 Check-In Reservation

ID

Hàm kiểm thử

Kịch bản / Nhánh thực thi

Dữ liệu đầu vào

Kết quả mong đợi

Trạng thái

WB-RES-06

checkIn

Không tìm thấy reservation

ID không tồn tại

Trả về HTTP 404

PASS

WB-RES-07

checkIn

Trạng thái không hợp lệ để check-in

Status không được phép

Trả về HTTP 400

PASS

WB-RES-08

checkIn

Check-in quá sớm hơn giới hạn 30 phút

Thời gian trước giới hạn cho phép

Trả về HTTP 400

PASS

WB-RES-09

checkIn

Check-in quá muộn hơn giới hạn 30 phút

Thời gian sau giới hạn cho phép

Trả về HTTP 400

PASS

WB-RES-10

checkIn

Check-in đúng thời gian

Thời gian trong khoảng cho phép

Check-in thành công

PASS

WB-RES-11

checkIn

Lỗi khi check-in

Database hoặc transaction ném Error

Rollback và gọi next(error)

PASS

WB-RES-12

checkIn

Reservation không có status

status không tồn tại

Trả về HTTP 400

PASS

### 3.4 Cancel Reservation

ID

Hàm kiểm thử

Kịch bản / Nhánh thực thi

Dữ liệu đầu vào

Kết quả mong đợi

Trạng thái

WB-RES-13

cancelReservation

Không tìm thấy reservation

ID không tồn tại

Trả về HTTP 404

PASS

WB-RES-14

cancelReservation

Hủy reservation trạng thái PENDING

status = PENDING

Hủy thành công

PASS

WB-RES-15

cancelReservation

Hủy reservation trạng thái CONFIRMED

status = CONFIRMED

Hủy thành công

PASS

WB-RES-16

cancelReservation

Không thể hủy reservation có trạng thái khác

Ví dụ CHECKED_IN

Trả về HTTP 400

PASS

WB-RES-17

cancelReservation

Lỗi khi hủy reservation

Database ném Error

Gọi next(error)

PASS

WB-RES-18

cancelReservation

Reservation không có status

status không tồn tại

Trả về HTTP 400

PASS

### 3.5 Confirm Reservation

ID

Hàm kiểm thử

Kịch bản / Nhánh thực thi

Dữ liệu đầu vào

Kết quả mong đợi

Trạng thái

WB-RES-19

confirmReservation

Không tìm thấy reservation

ID không tồn tại

Trả về HTTP 404

PASS

WB-RES-20

confirmReservation

Xác nhận reservation PENDING

status = PENDING

Chuyển sang CONFIRMED

PASS

WB-RES-21

confirmReservation

Reservation không ở trạng thái PENDING

Status khác PENDING

Trả về HTTP 400

PASS

WB-RES-22

confirmReservation

Lỗi khi xác nhận reservation

Database ném Error

Gọi next(error)

PASS

WB-RES-23

confirmReservation

Reservation không có status

status không tồn tại

Trả về HTTP 400

PASS

### 3.6 Update Reservation Status

ID

Hàm kiểm thử

Kịch bản / Nhánh thực thi

Dữ liệu đầu vào

Kết quả mong đợi

Trạng thái

WB-RES-24

updateReservationStatus

Cập nhật trạng thái thành công

ID và status hợp lệ

Trả về HTTP 200

PASS

WB-RES-25

updateReservationStatus

Không tìm thấy reservation

ID không tồn tại

Trả về HTTP 404

PASS

WB-RES-26

updateReservationStatus

Lỗi khi cập nhật trạng thái

Database ném Error

Gọi next(error)

PASS

### 3.7 Get My Reservations

ID

Hàm kiểm thử

Kịch bản / Nhánh thực thi

Dữ liệu đầu vào

Kết quả mong đợi

Trạng thái

WB-RES-27

getMyReservations

Lấy danh sách reservation của user thành công

req.user hợp lệ

Trả về danh sách reservation

PASS

WB-RES-28

getMyReservations

Lỗi database khi lấy danh sách

Database ném Error

Gọi next(error)

PASS

### 3.8 Get All Reservations

ID

Hàm kiểm thử

Kịch bản / Nhánh thực thi

Dữ liệu đầu vào

Kết quả mong đợi

Trạng thái

WB-RES-29

getAllReservations

Lấy toàn bộ reservation thành công

Database trả về danh sách

Trả về HTTP 200

PASS

WB-RES-30

getAllReservations

Lỗi database khi lấy toàn bộ reservation

Database ném Error

Gọi next(error)

PASS

## 4. KẾT QUẢ THỰC THI KIỂM THỬ

Kết quả chạy kiểm thử:

Test Suites: 1 passed, 1 total
Tests:       30 passed, 30 total
Snapshots:   0 total
Time:        17.228 s

### 4.1 Tổng hợp kết quả

Test Suite

Total Tests

Passed

Failed

Result

Reservation Controller

30

30

0

PASS

Kết quả: 30/30 Test Case PASSED.

Không có Test Case nào thất bại.

## 5. HƯỚNG DẪN TÁI HIỆN VÀ CHẠY TEST TỰ ĐỘNG

Chuyển vào thư mục backend:

cd backend

Chạy riêng White-Box Test Reservation

npx jest whitebox-tests/reservationController.test.js

Chạy White-Box Test Reservation kèm Code Coverage

npx jest whitebox-tests/reservationController.test.js --coverage

Chạy toàn bộ Test của Backend

npm test

Chạy toàn bộ Test kèm Code Coverage

npm run test:coverage

Báo cáo Coverage chi tiết dạng HTML được tạo tại:

backend/coverage/lcov-report/index.html

## 6. TÀI NGUYÊN KIỂM THỬ

backend/
│
├── controllers/
│   └── reservationController.js
│
├── whitebox-tests/
│   └── reservationController.test.js
│
└── coverage/
    └── lcov-report/
        └── index.html

docs/
└── testing/
    └── WhiteBox/
        └── Reservation/
            ├── WhiteBox_Reservation_TestCases.xlsx
            ├── WhiteBox_Reservation_Test_Execution_Result.md
            └── WhiteBox_Reservation_Test_Report.md

## 7. KẾT LUẬN VÀ BÀN GIAO CHO NHÓM

### 7.1 Chất lượng mã nguồn

Module Reservation Management đã được kiểm thử bằng phương pháp White-Box Testing trên các luồng xử lý chính của reservationController.js.

Các Test Case đã kiểm tra:

Tạo reservation.

Kiểm tra bàn phù hợp.

Kiểm tra bàn bị chiếm trong khung giờ đặt.

Kiểm tra check-in theo điều kiện thời gian.

Kiểm tra trạng thái hợp lệ và không hợp lệ.

Hủy reservation.

Xác nhận reservation.

Cập nhật trạng thái reservation.

Lấy danh sách reservation của user.

Lấy toàn bộ reservation.

Kiểm tra các trường hợp lỗi database.

Kiểm tra xử lý transaction, commit, rollback và next(error).

### 7.2 Kết quả kiểm thử

Toàn bộ 30/30 Test Cases PASSED.

Không có Test Case thất bại.

### 7.3 Code Coverage

Statements Coverage: 100%

Branch Coverage: 100%

Function Coverage: 100%

Line Coverage: 100%

### 7.4 Đóng gói báo cáo

File Test Cases: docs/testing/WhiteBox/Reservation/WhiteBox_Reservation_TestCases.xlsx

File kết quả thực thi: docs/testing/WhiteBox/Reservation/WhiteBox_Reservation_Test_Execution_Result.md

File báo cáo White-Box: docs/testing/WhiteBox/Reservation/WhiteBox_Reservation_Test_Report.md

File mã nguồn kiểm thử: backend/whitebox-tests/reservationController.test.js

### KẾT QUẢ CUỐI CÙNG: PASS

Người thực hiện: Trần Minh Trí

Test Suites: 1/1 PASSED

Test Cases: 30/30 PASSED

Statements Coverage: 100%

Branch Coverage: 100%

Function Coverage: 100%

Line Coverage: 100%