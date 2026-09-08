Feature("Customer - Tìm kiếm và lọc Menu");

const INDEX_URL = "/customer/index.html";

Before(({ I }) => {
  // Vào trang Customer
  I.amOnPage(INDEX_URL);
  I.wait(2);

  // Mở chức năng QR
  I.click("#openQrBtn");
  I.wait(1);

  // Nhập QR hợp lệ
  I.fillField(
    "#qrLinkInput",
    "http://127.0.0.1:5500/customer/table/T5"
  );

  // Xác nhận QR
  I.click("#qrLinkBtn");

  // Chờ chuyển sang Menu và load dữ liệu
  I.wait(5);
});


Scenario("TC01 - Hiển thị tìm kiếm và lọc Menu", ({ I }) => {
  I.seeInCurrentUrl("menu.html");

  I.seeElement("#searchInput");
  I.seeElement("#categorySelect");
  I.seeElement("#productGrid");
});


Scenario("TC02 - Tìm kiếm món ăn theo tên", async ({ I }) => {
  I.seeInCurrentUrl("menu.html");

  const productName = await I.executeScript(() => {
    const element = document.querySelector(".product-card h3");
    return element ? element.textContent.trim() : "";
  });

  if (!productName) {
    throw new Error(
      "Không có món ăn để thực hiện kiểm thử Search."
    );
  }

  // Lấy một phần tên món
  const keyword = productName.substring(
    0,
    Math.min(3, productName.length)
  );

  I.fillField("#searchInput", keyword);
  I.wait(1);

  const products = await I.executeScript(() => {
    return Array.from(
      document.querySelectorAll(".product-card h3")
    ).map(element =>
      element.textContent.trim().toLowerCase()
    );
  });

  const found = products.some(name =>
    name.includes(keyword.toLowerCase())
  );

  if (!found) {
    throw new Error(
      `Không tìm thấy món chứa từ khóa "${keyword}".`
    );
  }
});


Scenario("TC03 - Tìm kiếm món không tồn tại", ({ I }) => {
  I.seeInCurrentUrl("menu.html");

  I.fillField(
    "#searchInput",
    "MON_AN_KHONG_TON_TAI_999999"
  );

  I.wait(1);

  I.see("Không có món ăn.", "#productGrid");
});


Scenario("TC04 - Lọc món theo danh mục", async ({ I }) => {
  I.seeInCurrentUrl("menu.html");

  const category = await I.executeScript(() => {
    const select = document.querySelector("#categorySelect");

    if (!select) return null;

    const option = Array.from(select.options)
      .find(option => option.value !== "");

    if (!option) return null;

    return {
      value: option.value,
      name: option.textContent.trim()
    };
  });

  if (!category) {
    throw new Error(
      "Không có danh mục để kiểm thử Filter."
    );
  }

  I.selectOption("#categorySelect", category.value);
  I.wait(1);

  const selectedValue = await I.executeScript(() => {
    const select = document.querySelector("#categorySelect");
    return select ? select.value : "";
  });

  if (
    String(selectedValue) !== String(category.value)
  ) {
    throw new Error(
      `Không chọn đúng danh mục. Expected: ${category.value}, Actual: ${selectedValue}`
    );
  }

  const count = await I.executeScript(() => {
    return document.querySelectorAll(".product-card").length;
  });

  if (Number(count) === 0) {
    throw new Error(
      `Danh mục "${category.name}" không có món ăn hiển thị.`
    );
  }
});


Scenario("TC05 - Kết hợp tìm kiếm và lọc danh mục", async ({ I }) => {
  I.seeInCurrentUrl("menu.html");

  // Bước 1: Lấy một danh mục
  const category = await I.executeScript(() => {
    const select = document.querySelector("#categorySelect");

    if (!select) return null;

    const options = Array.from(select.options)
      .filter(option => option.value !== "");

    return options.length > 0
      ? {
          value: options[0].value,
          name: optionText(options[0])
        }
      : null;

    function optionText(option) {
      return option.textContent.trim();
    }
  });

  if (!category) {
    throw new Error(
      "Không có danh mục để thực hiện Search + Filter."
    );
  }

  // Bước 2: Chọn danh mục
  I.selectOption("#categorySelect", category.value);
  I.wait(1);

  // Bước 3: Lấy tên một món đang hiển thị
  const productName = await I.executeScript(() => {
    const element = document.querySelector(
      ".product-card h3"
    );

    return element
      ? element.textContent.trim()
      : "";
  });

  if (!productName) {
    throw new Error(
      `Danh mục "${category.name}" không có món ăn hiển thị.`
    );
  }

  // Bước 4: Lấy một phần tên món để Search
  const keyword = productName.substring(
    0,
    Math.min(3, productName.length)
  );

  I.fillField("#searchInput", keyword);
  I.wait(1);

  // Bước 5: Kiểm tra món sau khi kết hợp Filter + Search
  const results = await I.executeScript(() => {
    return Array.from(
      document.querySelectorAll(".product-card h3")
    ).map(element =>
      element.textContent.trim().toLowerCase()
    );
  });

  const found = results.some(name =>
    name.includes(keyword.toLowerCase())
  );

  if (!found) {
    throw new Error(
      `Không tìm thấy món chứa "${keyword}" khi kết hợp Search + Filter trong danh mục "${category.name}".`
    );
  }
});