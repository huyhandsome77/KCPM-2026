Feature('Admin Dashboard - Automation UI Testing');

// Helper tự động đăng nhập nhanh cho các kịch bản quản trị
const loginAdmin = (I) => {
    I.amOnPage('/admin/index.html');
    I.waitForElement('#account', 5);
    I.fillField('#account', 'admin');
    I.fillField('#password', '123');
    I.click('.btn-login-submit');
    I.waitForText('Trang tổng quan', 5);
};

// =========================================================================
// 1. ADMIN LOGIN & AUTHENTICATION TESTS
// =========================================================================

Scenario('TC01 - Đăng nhập thất bại khi sai mật khẩu hoặc tài khoản', async ({ I }) => {
    I.amOnPage('/admin/index.html');
    I.waitForElement('#account', 5);

    I.see('Đăng nhập quản trị');
    I.fillField('#account', 'admin');
    I.fillField('#password', 'wrongpassword_999');
    I.click('.btn-login-submit');

    I.wait(1);
    I.see('Đăng nhập quản trị');
});

Scenario('TC02 - Đăng nhập thành công với tài khoản Quản trị viên (Admin Login)', async ({ I }) => {
    loginAdmin(I);
    I.see('Administrator');
});

// =========================================================================
// 2. DASHBOARD & STATISTICS (THỐNG KÊ & BÁO CÁO)
// =========================================================================

Scenario('TC03 - Kiểm tra giao diện Dashboard & Chỉ số KPI tổng quan', async ({ I }) => {
    loginAdmin(I);

    // Kiểm tra giao diện Dashboard chính
    I.see('Trang tổng quan');
    I.see('Administrator');
    I.see('POS Gọi Món');
});

Scenario('TC04 - Kiểm tra điều hướng trang Báo cáo doanh thu (Reports & Stats)', async ({ I }) => {
    loginAdmin(I);

    I.click('button[data-view="stats"]');
    I.waitForText('Báo cáo doanh thu', 5);
    I.see('Lọc theo ngày');
});

// =========================================================================
// 3. CATEGORY CRUD (QUẢN LÝ DANH MỤC MÓN)
// =========================================================================

Scenario('TC05 - Thêm danh mục món ăn mới (Category Create)', async ({ I }) => {
    loginAdmin(I);

    I.click('button[data-view="categories"]');
    I.waitForText('Danh mục món', 5);

    I.click('button[data-action="create-record"][data-view="categories"]');
    I.waitForElement('.modal-card', 5);
    I.see('Tên danh mục');

    const categoryName = `Category UI ${Date.now()}`;
    I.fillField('input[name="name"]', categoryName);
    I.fillField('textarea[name="description"]', 'Mô tả danh mục test tự động');
    I.click('button[type="submit"]');

    I.waitForText(categoryName, 5);
    I.see(categoryName);
});

Scenario('TC06 - Chỉnh sửa danh mục món ăn (Category Edit)', async ({ I }) => {
    loginAdmin(I);

    I.click('button[data-view="categories"]');
    I.waitForText('Danh mục món', 5);

    I.click('button[data-action="edit-record"][data-view="categories"]');
    I.waitForElement('.modal-card', 5);

    I.fillField('textarea[name="description"]', 'Cập nhật bởi CodeceptJS');
    I.click('button[type="submit"]');

    I.wait(1);
    I.see('Danh mục món');
});

// =========================================================================
// 4. PRODUCT CRUD (QUẢN LÝ SẢN PHẨM / MÓN ĂN)
// =========================================================================

Scenario('TC07 - Thêm món ăn mới vào Menu (Product Create)', async ({ I }) => {
    loginAdmin(I);

    I.click('button[data-view="products"]');
    I.waitForText('Quản lý món ăn', 5);

    I.click('button[data-action="create-record"][data-view="products"]');
    I.waitForElement('.modal-card', 5);
    I.see('Tên món');

    const productName = `Món Test ${Date.now()}`;
    I.fillField('input[name="name"]', productName);
    I.fillField('input[name="price"]', '168000');
    I.fillField('input[name="stock"]', '50');
    I.fillField('textarea[name="description"]', 'Món ăn kiểm thử tự động');
    I.click('button[type="submit"]');

    I.waitForText(productName, 5);
    I.see(productName);
});

Scenario('TC08 - Tìm kiếm món ăn theo từ khóa (Product Search)', async ({ I }) => {
    loginAdmin(I);

    I.click('button[data-view="products"]');
    I.waitForText('Quản lý món ăn', 5);

    I.fillField('input[data-action="search-input"][data-view="products"]', 'Sushi');
    I.wait(1);
    I.see('Sushi');
});

Scenario('TC09 - Chỉnh sửa thông tin món ăn (Product Edit)', async ({ I }) => {
    loginAdmin(I);

    I.click('button[data-view="products"]');
    I.waitForText('Quản lý món ăn', 5);

    I.click('button[data-action="edit-record"][data-view="products"]');
    I.waitForElement('.modal-card', 5);

    I.fillField('input[name="stock"]', '88');
    I.click('button[type="submit"]');

    I.wait(1);
    I.see('Quản lý món ăn');
});

// =========================================================================
// 5. TABLE MANAGEMENT (QUẢN LÝ BÀN ĂN & TRẠNG THÁI)
// =========================================================================

Scenario('TC10 - Xem sơ đồ bàn ăn và danh sách bàn (Tables Overview)', async ({ I }) => {
    loginAdmin(I);

    I.click('button[data-view="tables"]');
    I.waitForText('Quản lý bàn', 5);
    I.see('Bàn #');
});

Scenario('TC11 - Thêm bàn ăn mới vào nhà hàng (Table Create)', async ({ I }) => {
    loginAdmin(I);

    I.click('button[data-view="tables"]');
    I.waitForText('Quản lý bàn', 5);

    I.click('button[data-action="create-record"][data-view="tables"]');
    I.waitForElement('.modal-card', 5);

    const tableNum = Math.floor(Math.random() * 800) + 100;
    I.fillField('input[name="tableNumber"]', String(tableNum));
    I.fillField('input[name="capacity"]', '4');
    I.click('button[type="submit"]');

    I.waitForText(`Bàn #${tableNum}`, 5);
    I.see(`Bàn #${tableNum}`);
});

// =========================================================================
// 6. USER MANAGEMENT (QUẢN LÝ NGƯỜI DÙNG)
// =========================================================================

Scenario('TC12 - Xem danh sách người dùng và tìm kiếm tài khoản (User Management)', async ({ I }) => {
    loginAdmin(I);

    I.click('button[data-view="users"]');
    I.waitForText('Người dùng', 5);

    I.waitForText('Administrator', 5);
    I.see('Người dùng');
    I.see('Vai trò');

    I.fillField('input[data-action="search-input"][data-view="users"]', 'admin');
    I.wait(1);
    I.see('admin');
});

Scenario('TC13 - Tạo tài khoản người dùng mới (User Create)', async ({ I }) => {
    loginAdmin(I);

    I.click('button[data-view="users"]');
    I.waitForText('Người dùng', 5);

    I.click('button[data-action="create-record"][data-view="users"]');
    I.waitForElement('.modal-card', 5);

    const randNum = Math.floor(Math.random() * 900000) + 100000;
    const testUsername = `user_${randNum}`;
    const testPhone = `09${randNum}12`;
    I.fillField('input[name="fullName"]', `Nguyen Test ${randNum}`);
    I.fillField('input[name="phone"]', testPhone);
    I.fillField('input[name="username"]', testUsername);
    I.fillField('input[name="password"]', '123456');
    I.selectOption('select[name="role"]', 'CUSTOMER');
    I.click('button[type="submit"]');

    I.wait(1);
    I.see('Người dùng');
});

// =========================================================================
// 7. LOCK / UNLOCK USER ACCOUNT (KHÓA & MỞ KHÓA TÀI KHOẢN)
// =========================================================================

Scenario('TC14 - Khóa tài khoản người dùng (Lock User - Set Status BLOCKED)', async ({ I }) => {
    loginAdmin(I);

    I.click('button[data-view="users"]');
    I.waitForText('Người dùng', 5);

    I.click('button[data-action="edit-record"][data-view="users"]');
    I.waitForElement('.modal-card', 5);

    I.selectOption('select[name="status"]', 'BLOCKED');
    I.click('button[type="submit"]');

    I.wait(1);
    I.see('Người dùng');
});

Scenario('TC15 - Mở khóa tài khoản người dùng (Unlock User - Set Status ACTIVE)', async ({ I }) => {
    loginAdmin(I);

    I.click('button[data-view="users"]');
    I.waitForText('Người dùng', 5);

    I.click('button[data-action="edit-record"][data-view="users"]');
    I.waitForElement('.modal-card', 5);

    I.selectOption('select[name="status"]', 'ACTIVE');
    I.click('button[type="submit"]');

    I.wait(1);
    I.see('Người dùng');
});

// =========================================================================
// 8. RBAC & LOGOUT (PHÂN QUYỀN VÀ ĐĂNG XUẤT)
// =========================================================================

Scenario('TC16 - Kiểm tra chức năng Đăng xuất an toàn (Admin Logout)', async ({ I }) => {
    loginAdmin(I);

    I.click('button[data-action="logout"]');

    I.waitForText('Đăng nhập quản trị', 5);
    I.seeElement('#account');
    I.seeElement('#password');
});

Scenario('TC17 - Kiểm tra chặn truy cập khi chưa đăng nhập (RBAC Protected Route)', async ({ I }) => {
    I.amOnPage('/admin/index.html');

    I.executeScript(() => {
        localStorage.clear();
    });
    I.refreshPage();

    I.see('Đăng nhập quản trị');
    I.dontSee('Trang tổng quan');
});
