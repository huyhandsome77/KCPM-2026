Feature("Customer - Xem lịch sử Order");

const LOGIN_URL =
  "http://127.0.0.1:5500/customer/login.html";

const SETTING_URL =
  "http://127.0.0.1:5500/customer/setting.html";

const ACCOUNT = "thinh";
const PASSWORD = "123";


/*==================================================
                    LOGIN FLOW
==================================================*/

async function loginCustomer(I) {

  I.amOnPage(LOGIN_URL);

  I.waitForElement("#account", 5);
  I.fillField("#account", ACCOUNT);

  I.fillField("#password", PASSWORD);

  I.click("#loginForm button[type='submit']");

  I.wait(3);
}


/*==================================================
                    BEFORE
==================================================*/

Before(async ({ I }) => {

  await loginCustomer(I);

});


/*==================================================
                    TC01
==================================================*/

Scenario("TC01 - Hiển thị mục Lịch sử đơn hàng trong Setting", async ({ I }) => {

  I.amOnPage(SETTING_URL);

  I.waitForElement(".setting-item[data-section='orders']", 5);

  I.see("Lịch sử đơn hàng");

  I.see("Xem các đơn hàng đã đặt");

});


/*==================================================
                    TC02
==================================================*/

Scenario("TC02 - Mở Lịch sử đơn hàng khi đã đăng nhập", async ({ I }) => {

  I.amOnPage(SETTING_URL);

  I.waitForElement(
    ".setting-item[data-section='orders']",
    5
  );

  I.click(".setting-item[data-section='orders']");

  I.wait(2);

  I.waitForElement("#settingContent", 5);

  I.see("Lịch sử đơn hàng", "#settingContent");

});


/*==================================================
                    TC03
==================================================*/

Scenario("TC03 - Hiển thị danh sách Order của tài khoản", async ({ I }) => {

  I.amOnPage(SETTING_URL);

  I.waitForElement(
    ".setting-item[data-section='orders']",
    5
  );

  I.click(".setting-item[data-section='orders']");

  I.wait(3);

  I.waitForElement(
    ".orders-history-list, .setting-empty",
    5
  );

  const orderCount =
    await I.grabNumberOfVisibleElements(
      ".order-history-card"
    );

  const emptyCount =
    await I.grabNumberOfVisibleElements(
      ".setting-empty"
    );

  console.log(`Số Order hiển thị: ${orderCount}`);

  /*
   * Tài khoản có Order:
   * phải hiển thị ít nhất một order card.
   *
   * Nếu tài khoản chưa có Order:
   * hệ thống phải hiển thị trạng thái
   * "Chưa có đơn hàng".
   */

  if (orderCount > 0) {

    I.seeElement(".order-history-card");

  } else {

    I.see("Chưa có đơn hàng");

  }

});


/*==================================================
                    TC04
==================================================*/

Scenario("TC04 - Hiển thị thông tin chi tiết Order", async ({ I }) => {

  I.amOnPage(SETTING_URL);

  I.waitForElement(
    ".setting-item[data-section='orders']",
    5
  );

  I.click(".setting-item[data-section='orders']");

  I.wait(3);

  const orderCount =
    await I.grabNumberOfVisibleElements(
      ".order-history-card"
    );

  if (orderCount === 0) {

    console.log(
      "TC04: Không có Order để kiểm tra chi tiết."
    );

    return;

  }

  /*
   * Kiểm tra các thành phần chính
   * của Order Card
   */

  I.seeElement(".order-history-id");
  I.seeElement(".order-history-date");
  I.seeElement(".order-history-info");
  I.seeElement(".order-history-footer");

  I.see("Đơn hàng");
  I.see("Tổng tiền");

});


/*==================================================
                    TC05
==================================================*/

Scenario("TC05 - Hiển thị trạng thái Order", async ({ I }) => {

  I.amOnPage(SETTING_URL);

  I.waitForElement(
    ".setting-item[data-section='orders']",
    5
  );

  I.click(".setting-item[data-section='orders']");

  I.wait(3);

  const orderCount =
    await I.grabNumberOfVisibleElements(
      ".order-history-card"
    );

  if (orderCount === 0) {

    console.log(
      "TC05: Không có Order để kiểm tra trạng thái."
    );

    return;

  }

  I.seeElement(".order-status");

  /*
   * Các trạng thái được hệ thống hỗ trợ:
   *
   * Chờ xác nhận
   * Đã xác nhận
   * Đang chuẩn bị
   * Sẵn sàng
   * Hoàn thành
   * Đã hủy
   */

  const statusText =
    await I.grabTextFrom(
      ".order-status"
    );

  console.log(
    `Trạng thái Order: ${statusText}`
  );

  const validStatuses = [
    "Chờ xác nhận",
    "Đã xác nhận",
    "Đang chuẩn bị",
    "Sẵn sàng",
    "Hoàn thành",
    "Đã hủy"
  ];

  const isValid =
    validStatuses.some(
      status =>
        statusText.includes(status)
    );

  if (!isValid) {

    throw new Error(
      `Trạng thái Order không hợp lệ: ${statusText}`
    );

  }

});


/*==================================================
                    TC06
==================================================*/

Scenario("TC06 - Hiển thị trạng thái thanh toán", async ({ I }) => {

  I.amOnPage(SETTING_URL);

  I.waitForElement(
    ".setting-item[data-section='orders']",
    5
  );

  I.click(".setting-item[data-section='orders']");

  I.wait(3);

  const orderCount =
    await I.grabNumberOfVisibleElements(
      ".order-history-card"
    );

  if (orderCount === 0) {

    console.log(
      "TC06: Không có Order để kiểm tra thanh toán."
    );

    return;

  }

  I.seeElement(".order-history-info");

  const infoText =
    await I.grabTextFrom(
      ".order-history-info"
    );

  console.log(
    `Thông tin Order: ${infoText}`
  );

  const validPaymentStatuses = [
    "Chưa thanh toán",
    "Đã thanh toán",
    "Đã hoàn tiền"
  ];

  const isValid =
    validPaymentStatuses.some(
      status =>
        infoText.includes(status)
    );

  if (!isValid) {

    throw new Error(
      `Không tìm thấy trạng thái thanh toán hợp lệ: ${infoText}`
    );

  }

});


/*==================================================
                    TC07
==================================================*/

Scenario("TC07 - Hiển thị trạng thái khi tài khoản chưa có Order", async ({ I }) => {

  I.amOnPage(SETTING_URL);

  I.waitForElement(
    ".setting-item[data-section='orders']",
    5
  );

  I.click(".setting-item[data-section='orders']");

  I.wait(3);

  const orderCount =
    await I.grabNumberOfVisibleElements(
      ".order-history-card"
    );

  if (orderCount > 0) {

    console.log(
      "TC07: Tài khoản hiện có Order nên không thể kiểm tra trạng thái tài khoản chưa có Order."
    );

    return;

  }

  I.see("Chưa có đơn hàng");
  I.see("Bạn chưa có đơn hàng nào.");

});


// ======================================================
// TC08 - Không đăng nhập thì yêu cầu đăng nhập
// ======================================================
Scenario("TC08 - Không đăng nhập thì yêu cầu đăng nhập", async ({ I }) => {

  // Xóa session đăng nhập
  I.executeScript(() => {

    localStorage.removeItem(
      "appdatmon_customer_token"
    );

    localStorage.removeItem(
      "appdatmon_customer_user"
    );

  });

  I.amOnPage(SETTING_URL);

  I.waitForElement(
    ".setting-item[data-section='orders']",
    5
  );

  // Click Lịch sử đơn hàng
  I.click(
    ".setting-item[data-section='orders']"
  );

  // Toast chỉ hiển thị khoảng 700ms
  I.wait(0.3);

  // Kiểm tra thông báo yêu cầu đăng nhập
  I.see(
    "Vui lòng đăng nhập trước."
  );
});