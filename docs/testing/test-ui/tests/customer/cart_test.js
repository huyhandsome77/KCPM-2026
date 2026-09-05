Feature("Customer - Thêm / Sửa / Xóa Cart");

const INDEX_URL =
  "http://127.0.0.1:5500/customer/index.html";

Before(({ I }) => {
  // ============================================
  // 1. Vào trang Customer
  // ============================================
  I.amOnPage(INDEX_URL);
  I.wait(2);

  // ============================================
  // 2. Mở chức năng QR
  // ============================================
  I.click("#qrNavLink");

  I.waitForElement("#qrLinkInput", 5);

  // ============================================
  // 3. Nhập QR hợp lệ
  // ============================================
  I.fillField(
    "#qrLinkInput",
    "http://127.0.0.1:5500/KCPM-2026/customer/table/T5"
  );

  I.click("#qrLinkBtn");

  // ============================================
  // 4. Chờ Menu load
  // ============================================
  I.wait(5);
});


/* ==================================================
   TC01 - THÊM MÓN VÀO CART
================================================== */

Scenario("TC01 - Thêm món vào Cart", async ({ I }) => {

  I.seeInCurrentUrl("menu.html");

  // Kiểm tra có sản phẩm
  I.waitForElement(".product-card", 5);

  // Kiểm tra nút thêm Cart
  I.seeElement(".add-cart");

  // Lấy tên món đầu tiên
  const productName = await I.executeScript(() => {

    const card =
      document.querySelector(".product-card");

    const name =
      card?.querySelector("h3");

    return name
      ? name.textContent.trim()
      : "";
  });

  if (!productName) {
    throw new Error(
      "Không có món ăn để thực hiện kiểm thử."
    );
  }

  // Thêm món
  I.click(".add-cart");

  I.wait(1);

  // Kiểm tra món xuất hiện trong Cart
  const cartItem = await I.executeScript(() => {

    const item =
      document.querySelector(".cart-item");

    const name =
      item?.querySelector("h4");

    return name
      ? name.textContent.trim()
      : "";
  });

  if (cartItem !== productName) {
    throw new Error(
      `Món chưa được thêm đúng vào Cart.
Expected: ${productName}
Actual: ${cartItem}`
    );
  }

  // Kiểm tra số lượng = 1
  const quantity = await I.executeScript(() => {

    const item =
      document.querySelector(".cart-item");

    const element =
      item?.querySelector(".quantity span");

    return element
      ? element.textContent.trim()
      : "";
  });

  if (quantity !== "1") {
    throw new Error(
      `Số lượng ban đầu không đúng.
Expected: 1
Actual: ${quantity}`
    );
  }

  // Kiểm tra tổng tiền
  const total = await I.executeScript(() => {

    const element =
      document.querySelector("#totalPrice");

    return element
      ? element.textContent.trim()
      : "";
  });

  if (!total || total === "0đ") {
    throw new Error(
      `Tổng tiền chưa được cập nhật.
Actual: ${total}`
    );
  }
});


/* ==================================================
   TC02 - TĂNG SỐ LƯỢNG
================================================== */

Scenario("TC02 - Tăng số lượng món trong Cart", async ({ I }) => {

  I.seeInCurrentUrl("menu.html");

  I.waitForElement(".product-card", 5);

  // Thêm món đầu tiên
  I.click(".add-cart");

  I.wait(1);

  // Lấy số lượng ban đầu
  const beforeQuantity = await I.executeScript(() => {

    const element =
      document.querySelector(".quantity span");

    return element
      ? Number(element.textContent.trim())
      : 0;
  });

  if (beforeQuantity !== 1) {
    throw new Error(
      `Số lượng ban đầu không đúng.
Expected: 1
Actual: ${beforeQuantity}`
    );
  }

  // Lấy tổng tiền ban đầu
  const beforeTotal = await I.executeScript(() => {

    const element =
      document.querySelector("#totalPrice");

    return element
      ? element.textContent.trim()
      : "";
  });

  // Nhấn +
  I.click(".quantity button:last-child");

  I.wait(1);

  // Kiểm tra số lượng tăng
  const afterQuantity = await I.executeScript(() => {

    const element =
      document.querySelector(".quantity span");

    return element
      ? Number(element.textContent.trim())
      : 0;
  });

  if (afterQuantity !== 2) {
    throw new Error(
      `Số lượng không tăng đúng.
Expected: 2
Actual: ${afterQuantity}`
    );
  }

  // Kiểm tra tổng tiền thay đổi
  const afterTotal = await I.executeScript(() => {

    const element =
      document.querySelector("#totalPrice");

    return element
      ? element.textContent.trim()
      : "";
  });

  if (afterTotal === beforeTotal) {
    throw new Error(
      `Tổng tiền không được cập nhật sau khi tăng số lượng.
Before: ${beforeTotal}
After: ${afterTotal}`
    );
  }
});


/* ==================================================
   TC03 - GIẢM SỐ LƯỢNG
================================================== */

Scenario("TC03 - Giảm số lượng món trong Cart", async ({ I }) => {

  I.seeInCurrentUrl("menu.html");

  I.waitForElement(".product-card", 5);

  // Thêm món
  I.click(".add-cart");

  I.wait(1);

  // Tăng lên 2 trước
  I.click(".quantity button:last-child");

  I.wait(1);

  // Kiểm tra đang có 2 món
  const beforeQuantity = await I.executeScript(() => {

    const element =
      document.querySelector(".quantity span");

    return element
      ? Number(element.textContent.trim())
      : 0;
  });

  if (beforeQuantity !== 2) {
    throw new Error(
      `Không tạo được số lượng = 2.
Actual: ${beforeQuantity}`
    );
  }

  // Lấy tổng tiền trước khi giảm
  const beforeTotal = await I.executeScript(() => {

    const element =
      document.querySelector("#totalPrice");

    return element
      ? element.textContent.trim()
      : "";
  });

  // Nhấn -
  I.click(".quantity button:first-child");

  I.wait(1);

  // Kiểm tra số lượng giảm về 1
  const afterQuantity = await I.executeScript(() => {

    const element =
      document.querySelector(".quantity span");

    return element
      ? Number(element.textContent.trim())
      : 0;
  });

  if (afterQuantity !== 1) {
    throw new Error(
      `Số lượng không giảm đúng.
Expected: 1
Actual: ${afterQuantity}`
    );
  }

  // Kiểm tra tổng tiền cập nhật
  const afterTotal = await I.executeScript(() => {

    const element =
      document.querySelector("#totalPrice");

    return element
      ? element.textContent.trim()
      : "";
  });

  if (afterTotal === beforeTotal) {
    throw new Error(
      `Tổng tiền không được cập nhật sau khi giảm số lượng.
Before: ${beforeTotal}
After: ${afterTotal}`
    );
  }
});


/* ==================================================
   TC04 - XÓA MÓN
================================================== */

Scenario("TC04 - Xóa món khỏi Cart", async ({ I }) => {

  I.seeInCurrentUrl("menu.html");

  I.waitForElement(".product-card", 5);

  // Thêm món
  I.click(".add-cart");

  I.wait(1);

  // Kiểm tra Cart có món
  I.seeElement(".cart-item");

  // Xóa món
  I.click(".cart-delete-btn");

  I.wait(1);

  // Kiểm tra món không còn
  const cartCount = await I.executeScript(() => {

    return document.querySelectorAll(
      ".cart-item"
    ).length;
  });

  if (Number(cartCount) !== 0) {
    throw new Error(
      `Món vẫn còn trong Cart sau khi xóa.
Actual: ${cartCount} món`
    );
  }

  // Kiểm tra tổng tiền = 0
  const total = await I.executeScript(() => {

    const element =
      document.querySelector("#totalPrice");

    return element
      ? element.textContent.trim()
      : "";
  });

  if (total !== "0đ") {
    throw new Error(
      `Tổng tiền không về 0 sau khi xóa món.
Actual: ${total}`
    );
  }
});



Scenario("TC05 - Thêm nhiều món vào Cart", async ({ I }) => {

  I.seeInCurrentUrl("menu.html");

  I.waitForElement(".product-card", 5);

  const result = await I.executeScript(() => {
    const buttons = Array.from(
      document.querySelectorAll(".product-card .add-cart")
    );

    const available = buttons
      .map((button, index) => ({
        index,
        disabled: button.disabled
      }))
      .filter(item => !item.disabled);

    return available.slice(0, 2);
  });

  if (result.length < 2) {
    throw new Error(
      `Không đủ 2 món đang khả dụng để kiểm thử. Có ${result.length} món.`
    );
  }

  // Click món khả dụng thứ nhất
  const firstSelector =
    `.product-card:nth-child(${result[0].index + 1}) .add-cart:not([disabled])`;

  I.click(firstSelector);
  I.wait(1);

  // Click món khả dụng thứ hai
  const secondSelector =
    `.product-card:nth-child(${result[1].index + 1}) .add-cart:not([disabled])`;

  I.click(secondSelector);
  I.wait(1);

  // Kiểm tra Cart có 2 loại món
  const cartCount = await I.executeScript(() => {
    return document.querySelectorAll(".cart-item").length;
  });

  if (Number(cartCount) !== 2) {
    throw new Error(
      `Số loại món trong Cart không đúng.
Expected: 2
Actual: ${cartCount}`
    );
  }

  // Kiểm tra tổng tiền
  const total = await I.executeScript(() => {
    const element = document.querySelector("#totalPrice");
    return element ? element.textContent.trim() : "";
  });

  if (!total || total === "0đ") {
    throw new Error(
      `Tổng tiền không được cập nhật.
Actual: ${total}`
    );
  }
});