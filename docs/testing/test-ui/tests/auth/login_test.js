Feature("QR Test");

Scenario("Quét QR thành công và chuyển đến trang menu", async ({ I }) => {
  I.amOnPage("/customer/index.html");

  I.click("#openQrBtn");
  I.wait(2);

  I.fillField(
    "#qrLinkInput",
    "http://localhost:3000/customer/table/T5"
  );

  I.click("#qrLinkBtn");
  I.wait(3);

  I.seeInCurrentUrl("menu.html");
});

Scenario("Nhập đường dẫn QR không hợp lệ", async ({ I }) => {
  I.amOnPage("/customer/index.html");

  I.click("#openQrBtn");
  I.wait(2);

  I.fillField(
    "#qrLinkInput",
    "http://localhost:3000/customer/table/ABC"
  );

  I.click("#qrLinkBtn");
  I.wait(2);

  I.see("Không tìm thấy");
});

Scenario("Không nhập đường dẫn QR", async ({ I }) => {
  I.amOnPage("/customer/index.html");

  I.click("#openQrBtn");
  I.wait(2);

  I.click("#qrLinkBtn");
  I.wait(2);

  I.see("Vui lòng nhập mã bàn hoặc link QR.");
});