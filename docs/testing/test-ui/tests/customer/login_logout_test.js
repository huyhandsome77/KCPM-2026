Feature("Customer - Login / Logout");

// ==================================================
// TC01 - Đăng nhập thành công bằng Username
// ==================================================
Scenario("TC01 - Đăng nhập thành công bằng Username", async ({ I }) => {

    I.amOnPage(
        "http://127.0.0.1:5500/KCPM-2026/customer/login.html"
    );

    I.fillField("#account", "thinh");
    I.fillField("#password", "123");

    I.click('#loginForm button[type="submit"]');

    I.wait(2);

    I.seeInCurrentUrl("index.html");

});


// ==================================================
// TC02 - Đăng nhập bằng Email
// ==================================================
Scenario("TC02 - Đăng nhập bằng Email", async ({ I }) => {

    I.amOnPage(
        "http://127.0.0.1:5500/KCPM-2026/customer/login.html"
    );

    I.fillField("#account", "thinh@gmail.com");
    I.fillField("#password", "123");

    I.click('#loginForm button[type="submit"]');

    I.wait(2);

    I.seeInCurrentUrl("index.html");

});


// ==================================================
// TC03 - Đăng nhập bằng số điện thoại
// ==================================================
Scenario("TC03 - Đăng nhập bằng số điện thoại", async ({ I }) => {

    I.amOnPage(
        "http://127.0.0.1:5500/KCPM-2026/customer/login.html"
    );

    I.fillField("#account", "01231231222");
    I.fillField("#password", "123");

    I.click('#loginForm button[type="submit"]');

    I.wait(2);

    I.seeInCurrentUrl("index.html");

});


// ==================================================
// TC04 - Đăng nhập với mật khẩu sai
// ==================================================
Scenario("TC04 - Đăng nhập với mật khẩu sai", async ({ I }) => {

    I.amOnPage(
        "http://127.0.0.1:5500/KCPM-2026/customer/login.html"
    );

    I.fillField("#account", "thinh");
    I.fillField("#password", "sai123");

    I.click('#loginForm button[type="submit"]');

    I.wait(2);

    I.dontSeeInCurrentUrl("index.html");

});


// ==================================================
// TC05 - Bỏ trống tài khoản
// ==================================================
Scenario('TC05 - Bỏ trống tài khoản', async ({ I }) => {

    I.amOnPage(
        'http://127.0.0.1:5500/KCPM-2026/customer/login.html'
    );

    I.fillField('#password', '123');

    I.click('#loginForm button[type="submit"]');

    I.wait(1);

    I.seeElement('#account:invalid');

});


// ==================================================
// TC06 - Bỏ trống mật khẩu
// ==================================================
Scenario('TC06 - Bỏ trống mật khẩu', async ({ I }) => {

    I.amOnPage(
        'http://127.0.0.1:5500/KCPM-2026/customer/login.html'
    );

    I.fillField('#account', 'thinh');

    I.click('#loginForm button[type="submit"]');

    I.wait(1);

    I.seeElement('#password:invalid');

});


// ==================================================
// TC07 - Bỏ trống toàn bộ thông tin
// ==================================================
Scenario('TC07 - Bỏ trống toàn bộ thông tin', async ({ I }) => {

    I.amOnPage(
        'http://127.0.0.1:5500/KCPM-2026/customer/login.html'
    );

    I.click('#loginForm button[type="submit"]');

    I.wait(1);

    I.seeElement('#account:invalid');
    I.seeElement('#password:invalid');

});


// ==================================================
// TC08 - Đăng xuất
// ==================================================
Scenario('TC08 - Đăng xuất thành công', async ({ I }) => {

    I.amOnPage(
        'http://127.0.0.1:5500/KCPM-2026/customer/login.html'
    );

    I.fillField('#account', 'thinh');
    I.fillField('#password', '123');

    I.click('#loginForm button[type="submit"]');

    I.wait(2);

    I.seeInCurrentUrl('index.html');

    I.click('#loginBtn');

    I.wait(2);

    I.seeInCurrentUrl('login.html');

});