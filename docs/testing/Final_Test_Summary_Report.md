# [QA/Docs] RTM & Final Test Summary Report

## 1. Giới thiệu

### 1.1. Mục tiêu

Tài liệu này tổng hợp kết quả kiểm thử của dự án **FutureSushi** dựa trên các tài liệu và artifact kiểm thử hiện có.

Mục tiêu của báo cáo:

- Xây dựng **Requirement Traceability Matrix (RTM)**.
- Mapping **SRS → Use Case → Test Case**.
- Tổng hợp kết quả **API Testing**.
- Tổng hợp kết quả **UI Automation Testing**.
- Tổng hợp kết quả **Boundary Value Analysis (BVA)**.
- Tổng hợp kết quả **White-box Testing và Code Coverage**.
- Tổng hợp **Defect Log**.
- Tổng hợp **Retest và Regression Testing**.
- Đưa ra đánh giá chất lượng cuối cùng của hệ thống.

### 1.2. Phạm vi nguồn dữ liệu

Báo cáo được tổng hợp từ:

- Source code và tài liệu trên nhánh `main`.
- Các branch kiểm thử và sửa lỗi đã được cung cấp.
- API Test Cases và Postman Collections.
- BVA Test Cases và Execution Results.
- White-box Test Cases và Code Coverage Reports.
- UI Automation Test Scripts và Test Reports.

---

# 2. Phạm vi kiểm thử

## 2.1. Requirement Traceability Matrix (RTM)

RTM được xây dựng nhằm đảm bảo khả năng truy vết giữa yêu cầu hệ thống và hoạt động kiểm thử.

Luồng truy vết:


SRS Requirement
      ↓
Use Case / Functional Requirement
      ↓
Test Case
      ↓
Test Type
      ↓
Test Result

RTM được xây dựng dựa trên các yêu cầu chức năng trong tài liệu **SRS** của dự án.

Các nhóm chức năng chính được đưa vào RTM bao gồm:

- Authentication và User Management.
- Reservation Management.
- Restaurant Table Management.
- Category Management.
- Product Management.
- Cart và Order Management.
- Payment Management.
- Point Management.
- Review Management.
- Customer Portal.
- Admin Dashboard.
- Staff Portal.
- Kitchen Portal.

File RTM được bàn giao tại:

`docs/testing/RTM_Matrix.xlsx`


## 3. Mapping SRS → Use Case → Test Case

Việc mapping được thực hiện nhằm đảm bảo mỗi yêu cầu chức năng trong tài liệu SRS có thể được truy vết đến các Use Case và Test Case tương ứng.

Cấu trúc mapping:

SRS Requirement → Use Case / Functional Requirement → Test Case → Test Type → Test Result

### 3.1. Bảng mapping tổng quan

| SRS Requirement | Use Case / Chức năng | Loại kiểm thử | Test Artifact | Trạng thái |
|---|---|---|---|---|
| Authentication | Đăng ký, đăng nhập và xác thực người dùng | API, BVA, White-box, UI | Auth/User Test Cases | Theo kết quả thực tế |
| User Management | Quản lý thông tin người dùng | API, BVA, White-box | User Test Cases | Theo kết quả thực tế |
| Reservation Management | Đặt bàn và quản lý đặt bàn | API, BVA, White-box | Reservation Test Cases | PASS |
| Table Management | Quản lý bàn | API, BVA, White-box | Table Test Cases | Theo kết quả thực tế |
| Category Management | Quản lý danh mục | API, BVA, White-box | Category Test Cases | Theo kết quả thực tế |
| Product Management | Quản lý sản phẩm | API, BVA, White-box | Product Test Cases | Theo kết quả thực tế |
| Order Management | Quản lý đơn hàng | API, BVA, White-box | Order Test Cases | Theo kết quả thực tế |
| Payment Management | Thanh toán | API, BVA, White-box | Payment Test Cases | Theo kết quả thực tế |
| Point Management | Quản lý điểm | API, BVA, White-box | Point Test Cases | Theo kết quả thực tế |
| Customer Portal | Thao tác của khách hàng | UI Automation | Customer UI Tests | Theo kết quả thực tế |
| Admin Dashboard | Quản lý hệ thống | UI Automation | Admin UI Tests | Theo kết quả thực tế |
| Staff Portal | Xử lý nghiệp vụ nhân viên | UI Automation | Staff UI Tests | Theo kết quả thực tế |
| Kitchen Portal | Xử lý món ăn | UI Automation | Kitchen UI Tests | Theo kết quả thực tế |

### 3.2. Mục đích của RTM

Requirement Traceability Matrix được sử dụng để:

- Đảm bảo các yêu cầu chức năng được kiểm thử.
- Theo dõi mối liên hệ giữa yêu cầu, Use Case và Test Case.
- Xác định các yêu cầu chưa có Test Case tương ứng.
- Hỗ trợ quá trình Retest và Regression Testing.
- Hỗ trợ đánh giá mức độ bao phủ của hoạt động kiểm thử.

Chi tiết Requirement Traceability Matrix được trình bày trong:

`docs/testing/RTM_Matrix.xlsx`

## 4. Tổng hợp kết quả API Testing

### 4.1. Mục tiêu

API Testing được thực hiện nhằm kiểm tra tính chính xác của các API Backend, bao gồm:

- Kiểm tra HTTP Method và API Endpoint.
- Kiểm tra Request và Response.
- Kiểm tra HTTP Status Code.
- Kiểm tra dữ liệu trả về.
- Kiểm tra các trường hợp dữ liệu hợp lệ và không hợp lệ.
- Kiểm tra xử lý lỗi của hệ thống.
- Kiểm tra các chức năng CRUD đối với các module tương ứng.

Các bộ kiểm thử API được xây dựng và thực hiện bằng Postman.

### 4.2. Các module API được kiểm thử

Dựa trên các tài liệu kiểm thử hiện có trong thư mục `docs/testing/API`, phạm vi API Testing bao gồm các module:

- API Authorization.
- Token JWT.
- Authentication.
- Category.
- Product.

Các tài liệu API Testing bao gồm Test Case, Postman Collection, Test Result và Test Design tương ứng với từng module.

### 4.3. Test Artifact

Các artifact API Testing được tổng hợp từ thư mục:

`docs/testing/API/`

Các loại tài liệu chính bao gồm:

- API Test Cases.
- API Test Case Results.
- Postman Collection.
- Postman Test Run Result.
- API Test Design.
- Test Log.

### 4.4. Kết quả tổng hợp

Kết quả chi tiết của từng API Test Case được lưu trong các file Test Result tương ứng.

| Module | Test Case | Test Result | Postman Collection | Trạng thái |
|---|---|---|---|---|
| API Authorization | Có | Có | Có | Theo Test Result |
| Token JWT | Có | Có | Có | Theo Test Result |
| Authentication | Có | Có | Có | Theo Test Result |
| Category | Có | Có | Có | Theo Test Result |
| Product | Có | Có | Có | Theo Test Result |

Kết quả PASS/FAIL chi tiết được tham chiếu trực tiếp từ các file kết quả kiểm thử API của từng module.

### 4.5. Đánh giá

API Testing giúp xác nhận các chức năng Backend hoạt động theo yêu cầu, đồng thời kiểm tra khả năng xử lý dữ liệu hợp lệ, dữ liệu không hợp lệ và các trường hợp lỗi.

Kết quả API Testing được sử dụng làm đầu vào cho:

- Requirement Traceability Matrix (RTM).
- Defect Log.
- Retest.
- Regression Testing.
- Final Test Summary Report.

## 5. Tổng hợp kết quả UI Automation

### 5.1. Mục tiêu

UI Automation được thực hiện nhằm kiểm tra hoạt động của giao diện người dùng và các luồng chức năng chính của hệ thống.

Mục tiêu kiểm thử bao gồm:

- Kiểm tra các chức năng trên giao diện người dùng.
- Kiểm tra luồng thao tác của người dùng.
- Kiểm tra việc hiển thị dữ liệu trên giao diện.
- Kiểm tra điều hướng giữa các màn hình.
- Kiểm tra các chức năng đăng nhập và đăng ký.
- Kiểm tra các thao tác CRUD thông qua giao diện.
- Kiểm tra tính ổn định của các luồng nghiệp vụ chính.

### 5.2. Công cụ và môi trường kiểm thử

Các kịch bản UI Automation được xây dựng trong thư mục:

`test-ui/`

Các thành phần liên quan đến UI Automation bao gồm:

- Test Scripts.
- Test Scenarios.
- Configuration Files.
- Test Steps.
- Test Reports.

Các file cấu hình và mã nguồn kiểm thử được sử dụng để tự động hóa quá trình kiểm thử giao diện.

### 5.3. Phạm vi UI Automation

Dựa trên cấu trúc tài liệu kiểm thử hiện có, UI Automation được áp dụng cho các luồng chức năng của hệ thống, bao gồm:

- Customer Portal.
- Admin Dashboard.
- Staff Portal.
- Kitchen Portal.
- Authentication và các luồng đăng nhập liên quan.

Các chức năng cụ thể được kiểm thử phụ thuộc vào các Test Scenario và Test Script đã được xây dựng trong thư mục `test-ui/`.

### 5.4. Test Artifact

Các artifact liên quan đến UI Automation được lưu tại:

`test-ui/`

Bao gồm:

- Thư mục `tests/`.
- Test Scenario.
- Test Script.
- File cấu hình kiểm thử.
- File Step Definition.
- Báo cáo kết quả thực thi nếu có.

### 5.5. Kết quả tổng hợp

| Nhóm chức năng | Loại kiểm thử | Test Artifact | Trạng thái |
|---|---|---|---|
| Authentication | UI Automation | Authentication UI Tests | Theo kết quả thực tế |
| Customer Portal | UI Automation | Customer UI Tests | Theo kết quả thực tế |
| Admin Dashboard | UI Automation | Admin UI Tests | Theo kết quả thực tế |
| Staff Portal | UI Automation | Staff UI Tests | Theo kết quả thực tế |
| Kitchen Portal | UI Automation | Kitchen UI Tests | Theo kết quả thực tế |

Kết quả PASS/FAIL chi tiết được xác định dựa trên kết quả thực thi các Test Script UI Automation.

### 5.6. Đánh giá

UI Automation hỗ trợ kiểm tra các luồng thao tác thực tế của người dùng trên hệ thống.

Kết quả kiểm thử UI Automation được sử dụng để:

- Đánh giá chất lượng giao diện và luồng chức năng.
- Phát hiện lỗi trong quá trình thao tác trên giao diện.
- Hỗ trợ Retest sau khi sửa lỗi.
- Hỗ trợ Regression Testing.
- Cập nhật Requirement Traceability Matrix.
- Tổng hợp Final Test Summary Report.

## 6. Tổng hợp kết quả Boundary Value Analysis (BVA)

### 6.1. Mục tiêu

Boundary Value Analysis (BVA) được thực hiện nhằm kiểm tra khả năng xử lý của hệ thống tại các giá trị biên của dữ liệu đầu vào.

Mục tiêu của kiểm thử BVA bao gồm:

- Kiểm tra giá trị nhỏ nhất hợp lệ.
- Kiểm tra giá trị lớn nhất hợp lệ.
- Kiểm tra giá trị ngay dưới giới hạn cho phép.
- Kiểm tra giá trị ngay trên giới hạn cho phép.
- Kiểm tra các trường hợp dữ liệu không hợp lệ tại vùng biên.
- Đánh giá khả năng validation dữ liệu đầu vào của hệ thống.

### 6.2. Phạm vi kiểm thử BVA

Boundary Value Analysis được thực hiện cho các nhóm chức năng chính của hệ thống, bao gồm:

- Authentication và User Management.
- Category và Product Management.
- Reservation Management.
- Restaurant Table Management.
- Point Management.
- Order Management.
- Payment Management.

Các Test Case được xây dựng dựa trên điều kiện validation và giới hạn dữ liệu đầu vào của từng chức năng.

### 6.3. Test Artifact

Các tài liệu và artifact liên quan đến BVA được tổ chức trong thư mục:

`docs/testing/BVA/`

Các artifact bao gồm:

- BVA Test Cases.
- BVA Test Scripts.
- Test Execution Results.
- Test Reports.
- Postman Collections.
- Postman Environments.

### 6.4. Phương pháp kiểm thử

Các Test Case Boundary Value Analysis được xây dựng dựa trên các giá trị:

- Giá trị nhỏ hơn giá trị nhỏ nhất cho phép.
- Giá trị nhỏ nhất hợp lệ.
- Giá trị ngay sau giá trị nhỏ nhất.
- Giá trị hợp lệ thông thường.
- Giá trị ngay trước giá trị lớn nhất.
- Giá trị lớn nhất hợp lệ.
- Giá trị lớn hơn giá trị lớn nhất cho phép.

Phương pháp này giúp phát hiện các lỗi liên quan đến việc kiểm tra và xử lý dữ liệu tại vùng biên.

### 6.5. Các module được kiểm thử

| Module | Nội dung kiểm thử |
|---|---|
| Authentication và User | Kiểm tra các điều kiện biên của thông tin người dùng và dữ liệu xác thực |
| Category và Product | Kiểm tra các giới hạn dữ liệu đầu vào của danh mục và sản phẩm |
| Reservation | Kiểm tra các giá trị biên liên quan đến thông tin và điều kiện đặt bàn |
| Restaurant Table | Kiểm tra dữ liệu và các điều kiện giới hạn của chức năng quản lý bàn |
| Point | Kiểm tra các điều kiện biên liên quan đến điểm tích lũy và sử dụng điểm |
| Order | Kiểm tra các điều kiện biên liên quan đến đơn hàng |
| Payment | Kiểm tra các điều kiện biên liên quan đến thông tin và xử lý thanh toán |

### 6.6. Kết quả kiểm thử

Kết quả thực thi chi tiết của các Test Case BVA được lưu trong các file Test Execution Result và Test Report tương ứng của từng module.

Các kết quả này được sử dụng để:

- Xác định các Test Case PASS và FAIL.
- Phát hiện lỗi liên quan đến validation dữ liệu.
- Ghi nhận Defect nếu phát hiện lỗi.
- Thực hiện Retest sau khi lỗi được sửa.
- Thực hiện Regression Testing đối với các chức năng liên quan.

Số liệu tổng hợp PASS/FAIL chỉ được xác nhận dựa trên các Test Execution Result đã được thực thi và lưu trong repository.

### 6.7. Đánh giá

Boundary Value Analysis là một phần quan trọng trong quá trình kiểm thử hệ thống vì nhiều lỗi thường xảy ra tại các giá trị giới hạn của dữ liệu đầu vào.

Việc thực hiện BVA giúp:

- Phát hiện lỗi validation dữ liệu.
- Kiểm tra giới hạn dữ liệu được hệ thống chấp nhận.
- Kiểm tra khả năng xử lý dữ liệu không hợp lệ.
- Nâng cao mức độ bao phủ của Test Case.
- Hỗ trợ quá trình Retest và Regression Testing.

Kết quả BVA được sử dụng làm đầu vào cho:

- Requirement Traceability Matrix (RTM).
- Defect Log.
- Retest.
- Regression Testing.
- Final Test Summary Report.

## 7. Tổng hợp White-box Testing và Code Coverage

### 7.1. Mục tiêu

White-box Testing được thực hiện nhằm kiểm tra cấu trúc bên trong của mã nguồn và đánh giá mức độ bao phủ của các Test Case đối với các luồng xử lý của chương trình.

Mục tiêu kiểm thử bao gồm:

- Kiểm tra các nhánh xử lý trong mã nguồn.
- Kiểm tra các điều kiện và luồng thực thi.
- Kiểm tra các trường hợp xử lý thành công và xử lý lỗi.
- Kiểm tra mức độ bao phủ Statements.
- Kiểm tra mức độ bao phủ Branches.
- Kiểm tra mức độ bao phủ Functions.
- Kiểm tra mức độ bao phủ Lines.

### 7.2. Phạm vi White-box Testing

Dựa trên các tài liệu và Test Artifact hiện có trong thư mục `docs/testing/WhiteBox`, White-box Testing được thực hiện cho các nhóm chức năng sau:

- Category và Product Management.
- Reservation Management.
- Restaurant Table Management.
- Point Management.
- Order Management.
- Payment Management.
- Authentication và User Management nếu Test Artifact được tích hợp đầy đủ.

### 7.3. Test Artifact

Các tài liệu White-box Testing được lưu tại:

`docs/testing/WhiteBox/`

Các artifact chính bao gồm:

- White-box Test Cases.
- White-box Test Execution Result.
- White-box Test Report.
- White-box Test Scripts.
- Code Coverage Report.

### 7.4. Các module White-box được tổng hợp

| Module | Test Case | Execution Result | Test Report | Trạng thái |
|---|---|---|---|---|
| Category và Product | Có | Có | Có | Theo kết quả thực tế |
| Reservation | Có | Có | Có | PASS |
| Table | Có | Có | Có | Theo kết quả thực tế |
| Point | Có | Có | Có | Theo kết quả thực tế |
| Order và Payment | Có | Theo Test Artifact | Theo Test Artifact | Theo kết quả thực tế |
| Authentication và User | Theo Test Artifact hiện có | Theo Test Artifact hiện có | Theo Test Artifact hiện có | Theo kết quả thực tế |

### 7.5. Code Coverage

Code Coverage được sử dụng để đánh giá mức độ mã nguồn được thực thi bởi các Test Case.

Các chỉ số chính bao gồm:

| Chỉ số | Ý nghĩa |
|---|---|
| Statements | Tỷ lệ số câu lệnh đã được thực thi trong quá trình kiểm thử |
| Branches | Tỷ lệ các nhánh điều kiện đã được kiểm thử |
| Functions | Tỷ lệ các hàm đã được thực thi |
| Lines | Tỷ lệ số dòng mã nguồn đã được thực thi |

Kết quả Code Coverage chi tiết của từng module được tham chiếu từ các file White-box Test Report và Test Execution Result tương ứng.

### 7.6. Phương pháp thực hiện

White-box Test Case được xây dựng dựa trên cấu trúc mã nguồn và các luồng xử lý chính của hệ thống.

Quá trình kiểm thử bao gồm:

1. Xác định Controller hoặc Module cần kiểm thử.
2. Phân tích các luồng xử lý trong mã nguồn.
3. Xác định các điều kiện và nhánh xử lý.
4. Xây dựng White-box Test Case.
5. Thực thi Test Script.
6. Thu thập kết quả kiểm thử.
7. Phân tích Code Coverage.
8. Cập nhật Test Report.

### 7.7. Đánh giá

White-box Testing giúp đánh giá mức độ kiểm thử đối với cấu trúc bên trong của hệ thống.

Kết quả kiểm thử được sử dụng để:

- Đánh giá mức độ Code Coverage.
- Phát hiện các nhánh xử lý chưa được kiểm thử.
- Bổ sung Test Case khi Coverage chưa đạt yêu cầu.
- Hỗ trợ Retest sau khi sửa lỗi.
- Hỗ trợ Regression Testing.
- Cập nhật Requirement Traceability Matrix.
- Tổng hợp Final Test Summary Report.

Kết quả chi tiết được tham chiếu từ:

`docs/testing/WhiteBox/`

## 8. Defect Log

### 8.1. Mục tiêu

Defect Log được sử dụng để ghi nhận, theo dõi và quản lý các lỗi được phát hiện trong quá trình kiểm thử hệ thống.

Mục tiêu của Defect Log bao gồm:

- Ghi nhận các lỗi được phát hiện trong quá trình kiểm thử.
- Xác định module và chức năng xảy ra lỗi.
- Mô tả điều kiện và nguyên nhân phát hiện lỗi.
- Theo dõi trạng thái xử lý lỗi.
- Hỗ trợ quá trình Retest sau khi lỗi được sửa.
- Hỗ trợ Regression Testing đối với các chức năng liên quan.

### 8.2. Nguồn phát hiện Defect

Các lỗi trong hệ thống có thể được phát hiện thông qua các hoạt động kiểm thử:

- API Testing.
- UI Automation Testing.
- Boundary Value Analysis (BVA).
- White-box Testing.
- Manual Testing.
- Regression Testing.

Mỗi lỗi được ghi nhận cần có thông tin và bằng chứng phù hợp từ quá trình kiểm thử.

### 8.3. Thông tin Defect

Mỗi Defect được quản lý với các thông tin cơ bản sau:

| Trường thông tin | Mô tả |
|---|---|
| Defect ID | Mã định danh của lỗi |
| Module | Module hoặc chức năng xảy ra lỗi |
| Summary | Mô tả ngắn gọn về lỗi |
| Description | Mô tả chi tiết về lỗi |
| Severity | Mức độ nghiêm trọng của lỗi |
| Priority | Mức độ ưu tiên xử lý |
| Status | Trạng thái hiện tại của lỗi |
| Detected By | Phương pháp hoặc loại kiểm thử phát hiện lỗi |
| Retest Result | Kết quả kiểm tra lại sau khi sửa lỗi |

### 8.4. Phân loại Severity

Các lỗi được phân loại theo mức độ nghiêm trọng:

| Severity | Ý nghĩa |
|---|---|
| Critical | Lỗi nghiêm trọng làm hệ thống hoặc chức năng chính không thể hoạt động |
| High | Lỗi ảnh hưởng lớn đến chức năng chính của hệ thống |
| Medium | Lỗi ảnh hưởng đến chức năng nhưng vẫn có thể tiếp tục sử dụng hệ thống |
| Low | Lỗi nhỏ, ít ảnh hưởng đến hoạt động của hệ thống |

### 8.5. Phân loại Priority

Mức độ ưu tiên xử lý lỗi được xác định như sau:

| Priority | Ý nghĩa |
|---|---|
| High | Cần được xử lý ngay |
| Medium | Cần được xử lý trong quá trình phát triển |
| Low | Có thể xử lý trong các phiên bản tiếp theo |

### 8.6. Trạng thái Defect

Defect có thể trải qua các trạng thái:

Open → In Progress → Fixed → Retest → Closed

Nếu lỗi vẫn còn tồn tại sau Retest:

Retest → Reopened

### 8.7. Tổng hợp Defect

Thông tin chi tiết về các Defect được tham chiếu từ các tài liệu Defect Database và kết quả kiểm thử của dự án.

Các nguồn Defect bao gồm:

- API Testing Results.
- BVA Test Execution Results.
- White-box Test Execution Results.
- UI Testing Results.
- Defect Database.

Các Defect được phát hiện sẽ được cập nhật vào bảng theo dõi lỗi của dự án.

### 8.8. Quy trình xử lý Defect

Quy trình xử lý lỗi được thực hiện theo các bước:

1. Tester phát hiện lỗi trong quá trình kiểm thử.
2. Tester ghi nhận thông tin lỗi.
3. Defect được tạo và chuyển cho người phụ trách xử lý.
4. Developer phân tích và sửa lỗi.
5. Trạng thái Defect được cập nhật thành `Fixed`.
6. Tester thực hiện Retest.
7. Nếu lỗi đã được sửa, Defect được chuyển sang `Closed`.
8. Nếu lỗi vẫn còn tồn tại, Defect được chuyển sang `Reopened`.

### 8.9. Vai trò của Defect Log

Defect Log hỗ trợ:

- Theo dõi chất lượng hệ thống.
- Quản lý quá trình sửa lỗi.
- Theo dõi tiến độ xử lý lỗi.
- Hỗ trợ Retest.
- Hỗ trợ Regression Testing.
- Cung cấp dữ liệu cho Final Test Summary Report.

## 9. Retest và Regression Testing

### 9.1. Mục tiêu

Retest và Regression Testing được thực hiện nhằm xác nhận các lỗi đã được sửa và đảm bảo việc sửa lỗi không gây ảnh hưởng đến các chức năng khác của hệ thống.

Mục tiêu bao gồm:

- Xác nhận Defect đã được khắc phục.
- Kiểm tra lại các Test Case đã từng FAIL.
- Đảm bảo chức năng hoạt động đúng sau khi sửa lỗi.
- Kiểm tra các chức năng liên quan sau khi thay đổi mã nguồn.
- Phát hiện các lỗi mới phát sinh trong quá trình sửa lỗi.

### 9.2. Retest

Retest được thực hiện đối với các Defect đã được Developer sửa và chuyển trạng thái sang `Fixed`.

Quy trình Retest bao gồm:

1. Xác định Defect đã được sửa.
2. Kiểm tra thay đổi liên quan đến Defect.
3. Thực hiện lại Test Case đã phát hiện lỗi.
4. So sánh kết quả thực tế với Expected Result.
5. Cập nhật kết quả Retest.

Kết quả Retest có thể được xác định như sau:

| Kết quả | Ý nghĩa |
|---|---|
| PASS | Lỗi đã được sửa thành công |
| FAIL | Lỗi vẫn còn tồn tại |
| REOPENED | Lỗi chưa được sửa hoàn toàn và cần xử lý lại |

### 9.3. Regression Testing

Regression Testing được thực hiện sau khi hệ thống có thay đổi hoặc sau khi các lỗi được sửa.

Mục tiêu của Regression Testing là đảm bảo các thay đổi trong mã nguồn không gây ảnh hưởng đến các chức năng đã hoạt động trước đó.

Phạm vi Regression Testing bao gồm:

- Các chức năng liên quan trực tiếp đến lỗi đã sửa.
- Các module có liên quan đến mã nguồn được thay đổi.
- Các API có liên quan.
- Các luồng UI có liên quan.
- Các Test Case BVA.
- Các Test Case White-box.

### 9.4. Nguồn dữ liệu Retest và Regression

Kết quả Retest và Regression Testing được tổng hợp từ:

- API Test Execution Results.
- BVA Test Execution Results.
- White-box Test Execution Results.
- UI Automation Test Results.
- Defect Log.
- Các Commit Fix trên repository.

Các kết quả được sử dụng để xác định trạng thái cuối cùng của các chức năng sau khi sửa lỗi.

### 9.5. Quy trình Retest và Regression Testing

Quy trình được thực hiện theo các bước:

1. Phát hiện Defect trong quá trình kiểm thử.
2. Ghi nhận Defect vào Defect Log.
3. Developer thực hiện sửa lỗi.
4. Thay đổi mã nguồn được Commit vào repository.
5. Tester thực hiện Retest đối với lỗi đã được sửa.
6. Nếu Retest PASS, thực hiện Regression Testing đối với các chức năng liên quan.
7. Cập nhật kết quả kiểm thử.
8. Đóng Defect nếu kết quả kiểm thử đạt yêu cầu.

### 9.6. Đánh giá

Retest giúp xác nhận các lỗi đã được sửa đúng theo yêu cầu.

Regression Testing giúp đảm bảo các thay đổi trong hệ thống không làm ảnh hưởng đến các chức năng đã hoạt động ổn định.

Hai hoạt động này đóng vai trò quan trọng trong việc:

- Đảm bảo chất lượng hệ thống.
- Giảm nguy cơ phát sinh lỗi mới.
- Xác nhận hiệu quả của việc sửa lỗi.
- Cập nhật trạng thái Defect.
- Cung cấp dữ liệu cho Final Test Summary Report.

### 9.7. Kết quả tổng hợp

Kết quả Retest và Regression Testing được xác nhận dựa trên các Test Execution Result và Defect Log hiện có trong repository.

Các Defect chỉ được đánh giá là hoàn thành khi:

- Lỗi đã được sửa.
- Retest đạt kết quả PASS.
- Các chức năng liên quan không phát sinh lỗi nghiêm trọng trong Regression Testing.

## 10. Final Test Summary

### 10.1. Tổng quan

Quá trình kiểm thử hệ thống FutureSushi được thực hiện thông qua nhiều phương pháp kiểm thử khác nhau nhằm đánh giá chất lượng và mức độ đáp ứng yêu cầu của hệ thống.

Các hoạt động kiểm thử được tổng hợp trong báo cáo bao gồm:

- API Testing.
- UI Automation Testing.
- Boundary Value Analysis (BVA).
- White-box Testing.
- Code Coverage.
- Defect Tracking.
- Retest.
- Regression Testing.

### 10.2. Tổng hợp các loại kiểm thử

| Loại kiểm thử | Mục tiêu | Test Artifact |
|---|---|---|
| API Testing | Kiểm tra chức năng API Backend | API Test Cases, Postman Collection, Test Results |
| UI Automation | Kiểm tra các luồng chức năng trên giao diện | UI Test Scripts, Test Scenarios |
| BVA | Kiểm tra dữ liệu tại các giá trị biên | BVA Test Cases, Execution Results |
| White-box Testing | Kiểm tra cấu trúc và luồng xử lý mã nguồn | White-box Test Cases, Test Scripts |
| Code Coverage | Đánh giá mức độ bao phủ mã nguồn | Coverage Reports |
| Retest | Kiểm tra lại các lỗi đã được sửa | Test Execution Results |
| Regression Testing | Kiểm tra ảnh hưởng sau khi sửa lỗi | Regression Test Results |

### 10.3. Tổng hợp phạm vi kiểm thử

Các module chính được đưa vào quá trình kiểm thử bao gồm:

- Authentication và User Management.
- Reservation Management.
- Restaurant Table Management.
- Category Management.
- Product Management.
- Cart và Order Management.
- Payment Management.
- Point Management.
- Review Management.
- Customer Portal.
- Admin Dashboard.
- Staff Portal.
- Kitchen Portal.

### 10.4. Kết quả kiểm thử

Kết quả kiểm thử chi tiết được lưu trong các Test Artifact tương ứng của từng loại kiểm thử.

Việc đánh giá PASS hoặc FAIL của từng Test Case được xác định dựa trên:

- API Test Execution Results.
- UI Automation Test Results.
- BVA Test Execution Results.
- White-box Test Execution Results.
- Code Coverage Reports.
- Defect Log.
- Retest Results.
- Regression Testing Results.

Do các Test Artifact được phân chia theo từng module và loại kiểm thử, số liệu tổng hợp cuối cùng được xác định dựa trên các báo cáo thực thi đã được lưu trong repository.

### 10.5. Đánh giá chất lượng

Dựa trên các hoạt động kiểm thử đã thực hiện, hệ thống được đánh giá dựa trên các tiêu chí:

- Mức độ đáp ứng yêu cầu chức năng.
- Kết quả thực thi Test Case.
- Khả năng xử lý dữ liệu tại vùng biên.
- Mức độ bao phủ mã nguồn.
- Số lượng và mức độ nghiêm trọng của Defect.
- Kết quả Retest.
- Kết quả Regression Testing.

Việc đánh giá cuối cùng được thực hiện dựa trên các Test Execution Result và Defect Log hiện có.

## 11. Rủi ro và hạn chế

### 11.1. Rủi ro trong quá trình kiểm thử

Trong quá trình kiểm thử, một số rủi ro có thể ảnh hưởng đến kết quả kiểm thử bao gồm:

- Một số Test Artifact chưa được tích hợp đầy đủ vào nhánh chính.
- Các Test Execution Result có thể được lưu tại các branch khác nhau.
- Một số module có thể chưa có đầy đủ báo cáo Code Coverage.
- Môi trường kiểm thử có thể ảnh hưởng đến kết quả thực thi.
- Thay đổi mã nguồn có thể làm ảnh hưởng đến các Test Case đã xây dựng trước đó.

### 11.2. Hạn chế

Một số hạn chế của quá trình tổng hợp báo cáo bao gồm:

- Kết quả tổng hợp phụ thuộc vào các Test Artifact hiện có trong repository.
- Số liệu PASS/FAIL chỉ được xác nhận khi có Test Execution Result tương ứng.
- Code Coverage chỉ được xác nhận dựa trên Coverage Report đã được tạo.
- Các Defect chưa được ghi nhận đầy đủ trong Defect Log có thể không được phản ánh trong báo cáo.
- Một số Test Artifact có thể nằm trên các branch chưa được merge vào main.

### 11.3. Biện pháp giảm thiểu

Để giảm thiểu các rủi ro trên, nhóm cần:

- Kiểm tra và tổng hợp đầy đủ Test Artifact từ các branch liên quan.
- Đảm bảo Test Case và Test Result được lưu trữ thống nhất.
- Cập nhật Defect Log thường xuyên.
- Thực hiện Retest sau khi sửa lỗi.
- Thực hiện Regression Testing sau các thay đổi quan trọng.
- Cập nhật RTM khi có thay đổi về Requirement hoặc Test Case.

## 12. Kết luận

Quá trình kiểm thử hệ thống FutureSushi được thực hiện bằng nhiều phương pháp kiểm thử khác nhau nhằm đánh giá chất lượng tổng thể của hệ thống.

Các hoạt động kiểm thử bao gồm:

- API Testing.
- UI Automation Testing.
- Boundary Value Analysis.
- White-box Testing.
- Code Coverage.
- Defect Tracking.
- Retest.
- Regression Testing.

Requirement Traceability Matrix được sử dụng để liên kết các yêu cầu của hệ thống với Use Case và Test Case tương ứng.

Các Test Artifact được tổ chức và lưu trữ trong repository nhằm hỗ trợ việc kiểm tra, truy vết và đánh giá kết quả kiểm thử.

Defect Log được sử dụng để theo dõi các lỗi được phát hiện trong quá trình kiểm thử. Các lỗi sau khi được sửa sẽ được kiểm tra lại thông qua Retest và Regression Testing.

Báo cáo Final Test Summary Report cung cấp cái nhìn tổng quan về:

- Phạm vi kiểm thử.
- Các loại kiểm thử đã thực hiện.
- Các Test Artifact liên quan.
- Kết quả thực thi kiểm thử.
- Defect và quá trình xử lý lỗi.
- Retest và Regression Testing.
- Mức độ sẵn sàng của hệ thống.

Kết quả cuối cùng của hệ thống được đánh giá dựa trên các Test Execution Result, Code Coverage Report và Defect Log được lưu trong repository.

## 13. Deliverables

Các tài liệu bàn giao của hoạt động QA/Testing bao gồm:

### 13.1. Requirement Traceability Matrix

File:

`docs/testing/RTM_Matrix.xlsx`

Nội dung chính:

- Requirement ID.
- SRS Requirement.
- Use Case.
- Test Case.
- Test Type.
- Test Artifact.
- Test Result.
- Traceability Status.

### 13.2. Final Test Summary Report

File:

`docs/testing/Final_Test_Summary_Report.md`

Nội dung bao gồm:

- Mục tiêu kiểm thử.
- Phạm vi kiểm thử.
- Mapping SRS → Use Case → Test Case.
- Tổng hợp API Testing.
- Tổng hợp UI Automation.
- Tổng hợp BVA.
- Tổng hợp White-box Testing và Code Coverage.
- Defect Log.
- Retest.
- Regression Testing.
- Final Test Summary.
- Rủi ro và hạn chế.
- Kết luận.

### 13.3. Các Test Artifact liên quan

Các artifact kiểm thử được tham chiếu từ:

`docs/testing/API/`

`docs/testing/BVA/`

`docs/testing/WhiteBox/`

`docs/testing/`

`test-ui/`

Các artifact bao gồm:

- Test Cases.
- Test Scripts.
- Test Execution Results.
- Test Reports.
- Postman Collections.
- Code Coverage Reports.
- Defect Database.

---

## Trạng thái tài liệu

| Deliverable | Đường dẫn | Trạng thái |
|---|---|---|
| RTM Matrix | `docs/testing/RTM_Matrix.xlsx` | Cần hoàn thiện |
| Final Test Summary Report | `docs/testing/Final_Test_Summary_Report.md` | Hoàn thiện nội dung |
| API Testing Artifacts | `docs/testing/API/` | Theo repository |
| BVA Testing Artifacts | `docs/testing/BVA/` | Theo repository |
| White-box Testing Artifacts | `docs/testing/WhiteBox/` | Theo repository |
| UI Automation Artifacts | `test-ui/` | Theo repository |

---

**End of Final Test Summary Report**

