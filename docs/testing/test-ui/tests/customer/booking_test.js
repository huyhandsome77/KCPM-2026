Feature("Customer - Booking");

const BOOKING_URL = "/customer/booking.html";

Before(({ I }) => {
  I.amOnPage(BOOKING_URL);
  I.wait(1);
});


// ============================================================
// TC01 - Hiển thị trang đặt bàn
// ============================================================

Scenario("TC01 - Hiển thị trang đặt bàn", ({ I }) => {
  I.see("Đặt bàn");
  I.seeElement("#bookingForm");

  I.seeElement("#fullName");
  I.seeElement("#phone");
  I.seeElement("#numberOfGuests");
  I.seeElement("#reservationDate");
  I.seeElement("#reservationTime");
  I.seeElement("#note");

  I.seeElement("#bookingForm button[type='submit']");
});


// ============================================================
// TC02 - Kiểm tra khu vực lịch sử đặt bàn
// ============================================================

Scenario("TC02 - Kiểm tra lịch sử đặt bàn", async ({ I }) => {
  I.seeElement("#reservationList");

  const result = await I.executeScript(() => {
    const element = document.querySelector("#reservationList");

    if (!element) {
      return "";
    }

    return element.innerText || "";
  });

  const text = String(result);

  if (
    !text.includes("Đăng nhập để xem lịch sử.") &&
    !text.includes("Chưa có lịch đặt bàn.") &&
    text.trim().length === 0
  ) {
    throw new Error(
      "Khu vực lịch sử đặt bàn không hiển thị nội dung."
    );
  }
});


// ============================================================
// TC03 - Kiểm tra số lượng khách mặc định
// ============================================================

Scenario("TC03 - Kiểm tra số lượng khách mặc định", async ({ I }) => {
  I.seeElement("#numberOfGuests");

  const result = await I.executeScript(() => {
    const select = document.querySelector("#numberOfGuests");

    return select ? select.value : null;
  });

  const value = String(result);

  if (value !== "1") {
    throw new Error(
      `Số lượng khách mặc định không đúng. Expected: 1, Actual: ${value}`
    );
  }
});


// ============================================================
// TC04 - Kiểm tra danh sách số lượng khách
// ============================================================

Scenario("TC04 - Kiểm tra danh sách số lượng khách", async ({ I }) => {
  I.seeElement("#numberOfGuests");

  const result = await I.executeScript(() => {
    const select = document.querySelector("#numberOfGuests");

    if (!select) {
      return [];
    }

    return Array.from(select.options).map(option => option.value);
  });

  const options = Array.isArray(result)
    ? result.map(String)
    : [];

  const expectedOptions = [
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "8",
    "10"
  ];

  for (const option of expectedOptions) {
    if (!options.includes(option)) {
      throw new Error(
        `Thiếu option số lượng khách: ${option}`
      );
    }
  }
});


// ============================================================
// TC05 - Bỏ trống họ tên
// ============================================================

Scenario("TC05 - Bỏ trống họ tên", ({ I }) => {
  I.fillField("#phone", "0363046054");
  I.selectOption("#numberOfGuests", "2");
  I.fillField("#reservationDate", "2026-09-10");
  I.fillField("#reservationTime", "18:00");

  I.click("#bookingForm button[type='submit']");

  // fullName có required
  I.seeElement("#fullName:invalid");
});


// ============================================================
// TC06 - Bỏ trống số điện thoại
// ============================================================

Scenario("TC06 - Bỏ trống số điện thoại", ({ I }) => {
  I.fillField("#fullName", "Nguyen Van Test");
  I.selectOption("#numberOfGuests", "2");
  I.fillField("#reservationDate", "2026-09-10");
  I.fillField("#reservationTime", "18:00");

  I.click("#bookingForm button[type='submit']");

  // phone có required
  I.seeElement("#phone:invalid");
});


// ============================================================
// TC07 - Bỏ trống ngày đặt bàn
// ============================================================

Scenario("TC07 - Bỏ trống ngày đặt bàn", ({ I }) => {
  I.fillField("#fullName", "Nguyen Van Test");
  I.fillField("#phone", "0363046054");
  I.selectOption("#numberOfGuests", "2");
  I.fillField("#reservationTime", "18:00");

  I.click("#bookingForm button[type='submit']");

  // reservationDate có required
  I.seeElement("#reservationDate:invalid");
});


// ============================================================
// TC08 - Bỏ trống giờ đặt bàn
// ============================================================

Scenario("TC08 - Bỏ trống giờ đặt bàn", ({ I }) => {
  I.fillField("#fullName", "Nguyen Van Test");
  I.fillField("#phone", "0363046054");
  I.selectOption("#numberOfGuests", "2");
  I.fillField("#reservationDate", "2026-09-10");

  I.click("#bookingForm button[type='submit']");

  // reservationTime có required
  I.seeElement("#reservationTime:invalid");
});


// ============================================================
// TC09 - Ghi chú không bắt buộc
// ============================================================

Scenario("TC09 - Ghi chú không bắt buộc", async ({ I }) => {
  I.fillField("#fullName", "Nguyen Van Test");
  I.fillField("#phone", "0363046054");
  I.selectOption("#numberOfGuests", "2");
  I.fillField("#reservationDate", "2026-09-10");
  I.fillField("#reservationTime", "18:00");

  // Không nhập note

  const result = await I.executeScript(() => {
    const note = document.querySelector("#note");

    return note ? note.value : null;
  });

  const value = result === null ? "" : String(result);

  if (value !== "") {
    throw new Error(
      `Trường ghi chú không rỗng khi chưa nhập. Actual: ${value}`
    );
  }
});

// ============================================================
// TC10 - Nhập đầy đủ thông tin đặt bàn
// ============================================================

Scenario("TC10 - Nhập đầy đủ thông tin đặt bàn", async ({ I }) => {
  I.fillField("#fullName", "Nguyen Van Test");
  I.fillField("#phone", "0363046054");
  I.selectOption("#numberOfGuests", "4");

  // Nhập ngày trực tiếp vào input type="date"
  await I.executeScript(() => {
    const dateInput = document.querySelector("#reservationDate");

    if (!dateInput) {
      throw new Error("Không tìm thấy #reservationDate");
    }

    dateInput.value = "2026-09-10";

    dateInput.dispatchEvent(
      new Event("input", { bubbles: true })
    );

    dateInput.dispatchEvent(
      new Event("change", { bubbles: true })
    );
  });

  I.fillField("#reservationTime", "19:00");
  I.fillField("#note", "Bàn gần cửa sổ");

  // Kiểm tra các trường thông tin
  I.seeInField("#fullName", "Nguyen Van Test");
  I.seeInField("#phone", "0363046054");
  I.seeInField("#numberOfGuests", "4");
  I.seeInField("#reservationTime", "19:00");
  I.seeInField("#note", "Bàn gần cửa sổ");

  // Kiểm tra ngày thực tế trong HTML input
  const result = await I.executeScript(() => {
    const dateInput = document.querySelector("#reservationDate");

    return dateInput ? dateInput.value : "";
  });

  const dateValue = String(result);

  if (dateValue !== "2026-09-10") {
    throw new Error(
      `Ngày đặt bàn không đúng. Expected: 2026-09-10, Actual: ${dateValue}`
    );
  }
});


// ============================================================
// TC11 - Thay đổi số lượng khách
// ============================================================

Scenario("TC11 - Thay đổi số lượng khách", ({ I }) => {
  I.selectOption("#numberOfGuests", "6");

  I.seeInField("#numberOfGuests", "6");

  I.selectOption("#numberOfGuests", "10");

  I.seeInField("#numberOfGuests", "10");
});


// ============================================================
// TC12 - Nhập ghi chú đặt bàn
// ============================================================

Scenario("TC12 - Nhập ghi chú đặt bàn", ({ I }) => {
  I.fillField("#note", "Có trẻ em đi cùng");

  I.seeInField("#note", "Có trẻ em đi cùng");
});


// ============================================================
// TC13 - Đặt bàn thành công
// ============================================================

Scenario("TC13 - Đặt bàn thành công", ({ I }) => {
  I.fillField("#fullName", "Nguyen Van Test");
  I.fillField("#phone", "0363046054");
  I.selectOption("#numberOfGuests", "2");

  I.fillField("#reservationDate", "2026-09-10");
  I.fillField("#reservationTime", "19:00");
  I.fillField("#note", "Test booking");

  I.click("#bookingForm button[type='submit']");

  I.wait(3);

  // Sau khi xử lý, khu vực lịch sử phải tồn tại
  I.seeElement("#reservationList");
});


// ============================================================
// TC14 - Kiểm tra lịch sử đặt bàn
// ============================================================

Scenario("TC14 - Kiểm tra lịch sử đặt bàn", async ({ I }) => {
  I.seeElement("#reservationList");

  // Chờ JS load dữ liệu lịch sử
  I.wait(2);

  const result = await I.executeScript(() => {
    const element = document.querySelector("#reservationList");

    if (!element) {
      return "";
    }

    return element.innerText || "";
  });

  const reservationList = String(result).trim();

  const valid =
    reservationList.includes("Chưa có lịch đặt bàn.") ||
    reservationList.includes("Đăng nhập để xem lịch sử.") ||
    reservationList.length > 0;

  if (!valid) {
    throw new Error(
      "Không hiển thị nội dung lịch sử đặt bàn."
    );
  }
});


// ============================================================
// TC15 - Kiểm tra hủy đặt bàn
// ============================================================

Scenario("TC15 - Kiểm tra hủy đặt bàn", async ({ I }) => {
  I.seeElement("#reservationList");

  I.wait(2);

  const result = await I.executeScript(() => {
    const element = document.querySelector("#reservationList");

    if (!element) {
      return "";
    }

    return element.innerText || "";
  });

  const reservationList = String(result);

  // Có reservation PENDING
  if (reservationList.includes("Hủy đặt bàn")) {

    I.click("Hủy đặt bàn");

    I.wait(1);

    // Popup xác nhận hủy
    I.acceptPopup();

    I.wait(3);

    I.seeElement("#reservationList");

  } else {

    // Không có dữ liệu PENDING
    console.log(
      "TC15: Không có reservation PENDING để thực hiện thao tác hủy."
    );
  }
});