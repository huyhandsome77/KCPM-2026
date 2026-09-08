Feature("Customer - Đặt món qua QR");

const INDEX_URL = "/customer/index.html";
const QR_LINK = "http://127.0.0.1:5500/customer/table/T5";

Before(({ I }) => {
  I.amOnPage(INDEX_URL);

  I.waitForElement("#qrNavLink", 5);
  I.click("#qrNavLink");

  I.waitForElement("#qrLinkInput", 5);
});


// ======================================================
// TC01 - Quét QR thành công và chuyển đến Menu
// ======================================================
Scenario("TC01 - Quét QR thành công và chuyển đến Menu", async ({ I }) => {

  I.fillField("#qrLinkInput", QR_LINK);
  I.click("#qrLinkBtn");

  I.wait(3);

  I.seeInCurrentUrl("menu.html");
});


// ======================================================
// TC02 - Nhập đường dẫn QR không hợp lệ
// ======================================================
Scenario("TC02 - Nhập đường dẫn QR không hợp lệ", async ({ I }) => {

  I.fillField(
    "#qrLinkInput",
    "http://127.0.0.1:5500/customer/table/ABC"
  );

  I.click("#qrLinkBtn");

  I.wait(2);

  I.see("Không tìm thấy");
});


// ======================================================
// TC03 - Không nhập đường dẫn QR
// ======================================================
Scenario("TC03 - Không nhập đường dẫn QR", async ({ I }) => {

  I.click("#qrLinkBtn");

  I.wait(2);

  I.see("Vui lòng nhập mã bàn hoặc link QR.");
});


// ======================================================
// TC04 - Quét QR và thêm món vào Cart
// ======================================================
Scenario("TC04 - Quét QR và thêm món vào Cart", async ({ I }) => {

  // Quét QR
  I.fillField("#qrLinkInput", QR_LINK);
  I.click("#qrLinkBtn");

  I.wait(4);

  I.seeInCurrentUrl("menu.html");

  // Đảm bảo Menu đã load
  I.waitForElement("#productGrid", 5);

  // Tìm một món đang khả dụng
  I.waitForElement(".add-cart:not([disabled])", 5);

  I.click(".add-cart:not([disabled])");

  I.wait(1);

  // Kiểm tra Cart có món
  I.waitForElement(".cart-item", 5);

  I.seeElement(".cart-item");
});


// ======================================================
// TC05 - Tăng số lượng món trong Cart
// ======================================================
Scenario("TC05 - Tăng số lượng món trong Cart", async ({ I }) => {

  // Quét QR
  I.fillField("#qrLinkInput", QR_LINK);
  I.click("#qrLinkBtn");

  I.wait(4);

  I.waitForElement("#productGrid", 5);
  I.waitForElement(".add-cart:not([disabled])", 5);

  // Thêm món
  I.click(".add-cart:not([disabled])");

  I.wait(1);

  I.waitForElement(".cart-item", 5);

  // Lấy số lượng ban đầu
  const before = await I.grabTextFrom(
    ".cart-item .quantity span"
  );

  // Tăng số lượng
  I.click(".cart-item .quantity button:last-child");

  I.wait(1);

  const after = await I.grabTextFrom(
    ".cart-item .quantity span"
  );

  console.log(`Số lượng trước: ${before}`);
  console.log(`Số lượng sau: ${after}`);

  I.see("2", ".cart-item .quantity span");
});


// ======================================================
// TC06 - Xóa món khỏi Cart
// ======================================================
Scenario("TC06 - Xóa món khỏi Cart", async ({ I }) => {

  // Quét QR
  I.fillField("#qrLinkInput", QR_LINK);
  I.click("#qrLinkBtn");

  I.wait(4);

  I.waitForElement("#productGrid", 5);
  I.waitForElement(".add-cart:not([disabled])", 5);

  // Thêm món
  I.click(".add-cart:not([disabled])");

  I.wait(1);

  I.waitForElement(".cart-item", 5);

  // Xóa món
  I.click(".cart-delete-btn");

  I.wait(1);

  // Cart rỗng
  I.see("Giỏ hàng đang trống");
});


// ======================================================
// TC07 - Đặt món thành công qua QR
// ======================================================
Scenario("TC07 - Đặt món thành công qua QR", async ({ I }) => {

  // Quét QR
  I.fillField("#qrLinkInput", QR_LINK);
  I.click("#qrLinkBtn");

  I.wait(4);

  I.seeInCurrentUrl("menu.html");

  // Đảm bảo Menu đã load
  I.waitForElement("#productGrid", 5);

  // Chọn một món đang khả dụng
  I.waitForElement(".add-cart:not([disabled])", 5);
  I.click(".add-cart:not([disabled])");

  I.wait(1);

  // Kiểm tra Cart có món
  I.waitForElement(".cart-item", 5);

  // Kiểm tra nút Đặt món
  I.seeElement("#checkoutBtn");

  // Đặt món
  I.click("#checkoutBtn");

  // Chờ API xử lý
  I.wait(3);

  // Sau khi đặt món thành công, Cart phải được reset
  I.see("Giỏ hàng đang trống");

  // Kiểm tra tổng tiền được reset
  I.see("0đ", "#totalPrice");
});