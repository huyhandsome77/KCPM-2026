Feature("Login");

Scenario("Đăng nhập thành công bằng tên đăng nhập", async ({ I }) => {
  I.amOnPage("/login.html");

  I.fillField("#account", "thinh");

  I.fillField("#password", "123");

  I.click("#loginForm button");

  I.wait(3);

  I.seeInCurrentUrl("index.html");
});

Scenario("Đăng nhập với mật khẩu sai", async ({ I }) => {
  I.amOnPage("/login.html");

  I.fillField("#account", "thinh");

  I.fillField("#password", "123456");

  I.click("#loginForm button");

  I.wait(2);

  I.see("Đăng nhập");
});

Scenario("Bỏ trống tài khoản", async ({ I }) => {
  I.amOnPage("/login.html");

  I.fillField("#password", "123");

  I.click("#loginForm button");

  I.wait(2);

  I.see("Đăng nhập");
});

Scenario("Bỏ trống mật khẩu", async ({ I }) => {
  I.amOnPage("/login.html");

  I.fillField("#account", "thinh");

  I.click("#loginForm button");

  I.wait(2);

  I.see("Đăng nhập");
});

Scenario("Bỏ trống toàn bộ thông tin", async ({ I }) => {
  I.amOnPage("/login.html");

  I.click("#loginForm button");

  I.wait(2);

  I.see("Đăng nhập");
});

Scenario("Đăng nhập với tài khoản không tồn tại", async ({ I }) => {
  I.amOnPage("/login.html");

  I.fillField("#account", "abcxyz123");

  I.fillField("#password", "123");

  I.click("#loginForm button");

  I.wait(2);

  I.see("Đăng nhập");
});

Scenario("Đăng nhập bằng số điện thoại", async ({ I }) => {
  I.amOnPage("/login.html");

  I.fillField("#account", "0363046054");

  I.fillField("#password", "123");

  I.click("#loginForm button");

  I.wait(3);

  I.seeInCurrentUrl("index.html");
});

Scenario("Đăng nhập bằng email", async ({ I }) => {
  I.amOnPage("/login.html");

  I.fillField("#account", "thinh@gmail.com");

  I.fillField("#password", "123");

  I.click("#loginForm button");

  I.wait(3);

  I.seeInCurrentUrl("index.html");
});