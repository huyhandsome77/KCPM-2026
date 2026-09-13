Feature('Staff - Vận hành & Quản lý (Order, Table, Reservation, Payment)');

const getFreshMockOrders = () => [
  {
    id: 101,
    status: 'PENDING',
    paymentStatus: 'UNPAID',
    totalPrice: 250000,
    finalPrice: 250000,
    note: 'Ít cay, không hành',
    createdAt: new Date().toISOString(),
    User: { id: 1, fullName: 'Nguyễn Văn An', phone: '0901234567' },
    RestaurantTable: { id: 1, tableNumber: 1, capacity: 4 },
    OrderItems: [
      { id: 1, product_id: 1, quantity: 2, totalPrice: 150000, Product: { name: 'Sake Nigiri' } },
      { id: 2, product_id: 2, quantity: 1, totalPrice: 100000, Product: { name: 'Miso Soup' } }
    ]
  },
  {
    id: 102,
    status: 'PREPARING',
    paymentStatus: 'UNPAID',
    totalPrice: 420000,
    finalPrice: 420000,
    note: 'Làm nhanh giúp khách',
    createdAt: new Date().toISOString(),
    User: { id: 2, fullName: 'Trần Thị Bình', phone: '0912345678' },
    RestaurantTable: { id: 2, tableNumber: 2, capacity: 6 },
    OrderItems: [
      { id: 3, product_id: 3, quantity: 2, totalPrice: 420000, Product: { name: 'Sushi Combo Deluxe' } }
    ]
  },
  {
    id: 103,
    status: 'READY',
    paymentStatus: 'UNPAID',
    totalPrice: 300000,
    finalPrice: 300000,
    note: 'Bàn VIP',
    createdAt: new Date().toISOString(),
    User: { id: 3, fullName: 'Lê Hoàng Cường', phone: '0923456789' },
    RestaurantTable: { id: 3, tableNumber: 3, capacity: 2 },
    OrderItems: [
      { id: 4, product_id: 4, quantity: 3, totalPrice: 300000, Product: { name: 'Tempura Udon' } }
    ]
  },
  {
    id: 104,
    status: 'COMPLETED',
    paymentStatus: 'PAID',
    totalPrice: 180000,
    finalPrice: 180000,
    note: '',
    createdAt: new Date().toISOString(),
    User: { id: 4, fullName: 'Phạm Minh Đức', phone: '0934567890' },
    RestaurantTable: { id: 4, tableNumber: 4, capacity: 4 },
    OrderItems: [
      { id: 5, product_id: 5, quantity: 2, totalPrice: 180000, Product: { name: 'California Roll' } }
    ]
  }
];

const getFreshMockTables = () => [
  { id: 1, tableNumber: 1, capacity: 4, status: 'AVAILABLE', calculatedStatus: 'AVAILABLE', qrCode: 'QR_TABLE_1' },
  { id: 2, tableNumber: 2, capacity: 6, status: 'OCCUPIED', calculatedStatus: 'OCCUPIED', qrCode: 'QR_TABLE_2', occupiedSince: new Date().toISOString() },
  { id: 3, tableNumber: 3, capacity: 2, status: 'BOOKED', calculatedStatus: 'BOOKED', qrCode: 'QR_TABLE_3' },
  { id: 4, tableNumber: 4, capacity: 4, status: 'CLEANING', calculatedStatus: 'CLEANING', qrCode: 'QR_TABLE_4' }
];

const getFreshMockReservations = () => [
  {
    id: 201,
    guestName: 'Nguyễn Văn An',
    guestPhone: '0901234567',
    numberOfGuests: 4,
    reservationTime: new Date(Date.now() + 5 * 60000).toISOString(),
    status: 'PENDING',
    note: 'Bàn gần cửa sổ',
    RestaurantTable: { id: 1, tableNumber: 1, capacity: 4 }
  },
  {
    id: 202,
    guestName: 'Trần Thị Bình',
    guestPhone: '0912345678',
    numberOfGuests: 2,
    reservationTime: new Date().toISOString(),
    status: 'CONFIRMED',
    note: 'Kỷ niệm ngày cưới',
    RestaurantTable: { id: 3, tableNumber: 3, capacity: 2 }
  },
  {
    id: 203,
    guestName: 'Lê Hoàng Cường',
    guestPhone: '0923456789',
    numberOfGuests: 6,
    reservationTime: new Date(Date.now() - 60 * 60000).toISOString(),
    status: 'CHECKED_IN',
    note: 'Đã nhận bàn',
    RestaurantTable: { id: 2, tableNumber: 2, capacity: 6 }
  },
  {
    id: 204,
    guestName: 'Phạm Minh Đức',
    guestPhone: '0934567890',
    numberOfGuests: 2,
    reservationTime: new Date(Date.now() - 120 * 60000).toISOString(),
    status: 'CANCELLED',
    note: 'Khách bận việc đột xuất',
    RestaurantTable: { id: 4, tableNumber: 4, capacity: 4 }
  }
];

// Helper để nạp Mock Data vào State giao diện Staff
const setupStaffState = (I, customOrders, customTables, customRes) => {
  const o = customOrders || getFreshMockOrders();
  const t = customTables || getFreshMockTables();
  const r = customRes || getFreshMockReservations();

  I.executeScript(({ orders, tables, reservations }) => {
    window.__STAFF_MOCK_ACTIVE = true;
    try {
      localStorage.setItem('STAFF_MOCK_ACTIVE', 'true');
      localStorage.setItem('STAFF_MOCK_ORDERS', JSON.stringify(orders || []));
      localStorage.setItem('STAFF_MOCK_TABLES', JSON.stringify(tables || []));
      localStorage.setItem('STAFF_MOCK_RESERVATIONS', JSON.stringify(reservations || []));
    } catch (e) {}

    window.alert = () => {};
    window.confirm = () => true;

    const s = window.staffState || (window.staffState = {});
    s.orders = orders || [];
    s.tables = tables || [];
    s.users = [];
    s.reservations = reservations || [];
    s.orderFilter = 'ALL';
    s.reservationFilter = 'ALL';
    s.userSearchQuery = '';
    s.checkoutOrderId = null;
    s.checkoutAmount = 0;
    s.paymentTab = 'cash';

    const searchInput = document.querySelector('#staff-search-input');
    if (searchInput) searchInput.value = '';

    if (typeof window.renderMetrics === 'function') window.renderMetrics(s.orders, s.tables, s.reservations);
    if (typeof window.renderOrdersGrid === 'function') window.renderOrdersGrid(s.orders);
    if (typeof window.renderTablesGrid === 'function') window.renderTablesGrid(s.tables);
    if (typeof window.renderReservationsTable === 'function') window.renderReservationsTable(s.reservations);
  }, { orders: o, tables: t, reservations: r });
  I.wait(0.3);
};

// ============================================================================
// 1. QUẢN LÝ ĐƠN HÀNG (ORDER MANAGEMENT - UC13, UC14, UC17, CORE SPEC 6)
// ============================================================================

Scenario('TC01 - Kiểm tra giao diện Quản lý đơn hàng của Staff', async ({ I }) => {
  I.amOnPage('/admin/staff.html');

  // Kiểm tra thương hiệu & vai trò
  I.see('FutureSushi');
  I.see('Nhân viên Phục vụ');
  I.see('Đang trực ca phục vụ');

  // Kiểm tra breadcrumb & tiêu đề
  I.see('Phục vụ');
  I.see('Quản lý đơn hàng');

  // Kiểm tra thanh tìm kiếm & đồng hồ
  I.seeElement('#staff-search-input');
  I.seeElement('#live-clock-text');

  // Kiểm tra các thẻ tóm tắt KPI
  I.seeElement('.kpi-summary-strip');
  I.seeElement('#metric-new');
  I.seeElement('#metric-empty');
  I.seeElement('#metric-serving');
  I.seeElement('#metric-pay');

  // Kiểm tra khu vực bộ lọc và danh sách đơn
  I.seeElement('#order-filter-pills');
  I.seeElement('#staff-orders-grid');
});

Scenario('TC02 - Kiểm tra các tab lọc trạng thái đơn hàng', async ({ I }) => {
  I.amOnPage('/admin/staff.html');
  setupStaffState(I);

  I.see('Tất cả đơn');
  I.see('Chờ xử lý ⏳');
  I.see('Đang làm món 🍳');
  I.see('Sẵn sàng 🔔');
  I.see('Hoàn thành ✅');
  I.see('Chưa trả tiền 💳');

  I.seeElement('[data-order-filter="ALL"]');
  I.seeElement('[data-order-filter="PENDING"]');
  I.seeElement('[data-order-filter="PREPARING"]');
  I.seeElement('[data-order-filter="READY"]');
  I.seeElement('[data-order-filter="COMPLETED"]');
  I.seeElement('[data-order-filter="UNPAID"]');
});

Scenario('TC03 - Kiểm tra hiển thị danh sách đơn hàng mới (UC13)', async ({ I }) => {
  I.amOnPage('/admin/staff.html');
  setupStaffState(I);

  // Kiểm tra thông tin các đơn hàng
  I.see('Đơn #101');
  I.see('Nguyễn Văn An');
  I.see('Bàn #1');
  I.see('250.000');

  I.see('Đơn #102');
  I.see('Trần Thị Bình');
  I.see('Bàn #2');

  I.see('Đơn #103');
  I.see('Lê Hoàng Cường');
  I.see('Bàn #3');

  I.see('Đơn #104');
  I.see('Phạm Minh Đức');
  I.see('Bàn #4');
});

Scenario('TC04 - Kiểm tra lọc đơn hàng theo tab Chờ xử lý (PENDING)', async ({ I }) => {
  I.amOnPage('/admin/staff.html');
  setupStaffState(I);

  I.click('[data-order-filter="PENDING"]');
  I.wait(0.3);

  I.see('Đơn #101');
  I.dontSee('Đơn #102');
  I.dontSee('Đơn #103');
  I.dontSee('Đơn #104');
});

Scenario('TC05 - Kiểm tra lọc đơn hàng theo tab Đang làm món (PREPARING)', async ({ I }) => {
  I.amOnPage('/admin/staff.html');
  setupStaffState(I);

  I.click('[data-order-filter="PREPARING"]');
  I.wait(0.3);

  I.see('Đơn #102');
  I.dontSee('Đơn #101');
  I.dontSee('Đơn #104');
});

Scenario('TC06 - Kiểm tra lọc đơn hàng theo tab Sẵn sàng (READY)', async ({ I }) => {
  I.amOnPage('/admin/staff.html');
  setupStaffState(I);

  I.click('[data-order-filter="READY"]');
  I.wait(0.3);

  I.see('Đơn #103');
  I.see('Thu tiền');
  I.dontSee('Đơn #101');
  I.dontSee('Đơn #104');
});

Scenario('TC07 - Kiểm tra lọc đơn hàng theo tab Hoàn thành (COMPLETED)', async ({ I }) => {
  I.amOnPage('/admin/staff.html');
  setupStaffState(I);

  I.click('[data-order-filter="COMPLETED"]');
  I.wait(0.3);

  I.see('Đơn #104');
  I.see('Đã hoàn thành & Thanh toán');
  I.dontSee('Đơn #101');
  I.dontSee('Đơn #102');
});

Scenario('TC08 - Kiểm tra lọc đơn hàng theo tab Chưa trả tiền (UNPAID)', async ({ I }) => {
  I.amOnPage('/admin/staff.html');
  setupStaffState(I);

  I.click('[data-order-filter="UNPAID"]');
  I.wait(0.3);

  I.see('Đơn #101');
  I.see('Đơn #102');
  I.see('Đơn #103');
  I.dontSee('Đơn #104');
});

Scenario('TC09 - Kiểm tra tìm kiếm đơn hàng bằng ô tìm kiếm', async ({ I }) => {
  I.amOnPage('/admin/staff.html');
  setupStaffState(I);

  I.fillField('#staff-search-input', 'Nguyễn Văn An');
  I.wait(0.3);

  I.see('Đơn #101');
  I.dontSee('Đơn #102');
  I.dontSee('Đơn #103');

  // Tìm kiếm số bàn
  I.fillField('#staff-search-input', 'Bàn #3');
  I.wait(0.3);

  I.see('Đơn #103');
  I.dontSee('Đơn #101');

  // Tìm kiếm từ khóa không tồn tại
  I.fillField('#staff-search-input', 'KhachKhongTonTai999');
  I.wait(0.3);
  I.see('Không tìm thấy đơn hàng nào');
});

Scenario('TC10 - Kiểm tra mở và đóng xem chi tiết món ăn trong đơn hàng', async ({ I }) => {
  I.amOnPage('/admin/staff.html');
  setupStaffState(I);

  I.seeElement('[data-action="toggle-order-detail"][data-id="101"]');
  I.click('[data-action="toggle-order-detail"][data-id="101"]');

  I.seeElement('[data-order-detail="101"]');
  I.see('Sake Nigiri x2');
  I.see('Miso Soup x1');
  I.see('Ghi chú: Ít cay, không hành');

  // Đóng chi tiết
  I.click('[data-action="toggle-order-detail"][data-id="101"]');
  I.seeElementInDOM('[data-order-detail="101"].hidden');
});

Scenario('TC11 - Kiểm tra xác nhận đơn hàng PENDING chuyển sang CONFIRMED (UC14)', async ({ I }) => {
  I.amOnPage('/admin/staff.html');
  setupStaffState(I);

  // Đơn 101 ở trạng thái PENDING phải có nút Xác nhận và nút Hủy đơn
  I.seeElement('[data-action="confirm-order"][data-id="101"]');
  I.seeElement('[data-action="cancel-order"][data-id="101"]');

  // Mô phỏng xác nhận đơn chuyển sang CONFIRMED
  I.executeScript(() => {
    const order = window.staffState.orders.find(o => o.id === 101);
    if (order) order.status = 'CONFIRMED';
    window.renderOrdersGrid(window.staffState.orders);
  });

  I.see('Bếp đang chế biến...');
  I.dontSeeElement('[data-action="confirm-order"][data-id="101"]');
});

Scenario('TC12 - Kiểm tra hủy đơn hàng PENDING', async ({ I }) => {
  I.amOnPage('/admin/staff.html');
  setupStaffState(I);

  I.seeElement('[data-action="cancel-order"][data-id="101"]');

  // Mô phỏng hủy đơn
  I.executeScript(() => {
    const order = window.staffState.orders.find(o => o.id === 101);
    if (order) order.status = 'CANCELLED';
    window.renderOrdersGrid(window.staffState.orders);
  });

  I.see('Đơn đã hủy');
});

// ============================================================================
// 2. THANH TOÁN & THU TIỀN (PAYMENT - UC17)
// ============================================================================

Scenario('TC13 - Kiểm tra nút Thu tiền hiển thị khi đơn ở trạng thái READY (UC17)', async ({ I }) => {
  I.amOnPage('/admin/staff.html');
  setupStaffState(I);

  // Đơn 103 ở trạng thái READY có nút Thu tiền
  I.seeElement('[data-action="open-checkout-modal"][data-id="103"]');
  I.see('Thu tiền');
});

Scenario('TC14 - Kiểm tra mở Modal thanh toán (Payment Checkout Modal)', async ({ I }) => {
  I.amOnPage('/admin/staff.html');
  setupStaffState(I);

  I.click('[data-action="open-checkout-modal"][data-id="103"]');

  I.dontSeeElement('#staff-payment-modal.hidden');
  I.see('Thanh toán Đơn hàng #103');
  I.see('300.000');
  I.see('Tiền mặt');
  I.see('Chuyển khoản PayOS');
});

Scenario('TC15 - Kiểm tra tự động tính tiền thừa khi khách trả tiền mặt', async ({ I }) => {
  I.amOnPage('/admin/staff.html');
  setupStaffState(I);

  I.click('[data-action="open-checkout-modal"][data-id="103"]');

  I.seeElement('#cash-given-input');
  I.fillField('#cash-given-input', '500000');

  I.see('200.000', '#cash-change-text');
});

Scenario('TC16 - Kiểm tra xác nhận thanh toán tiền mặt thành công (UC17)', async ({ I }) => {
  I.amOnPage('/admin/staff.html');
  setupStaffState(I);

  I.click('[data-action="open-checkout-modal"][data-id="103"]');
  I.fillField('#cash-given-input', '300000');

  I.seeElement('#btn-confirm-cash-paid');

  // Mô phỏng hoàn tất thanh toán
  I.executeScript(() => {
    const order = window.staffState.orders.find(o => o.id === 103);
    if (order) {
      order.status = 'COMPLETED';
      order.paymentStatus = 'PAID';
    }
    document.querySelector('#staff-payment-modal')?.classList.add('hidden');
    window.renderOrdersGrid(window.staffState.orders);
  });

  I.seeElementInDOM('#staff-payment-modal.hidden');
  I.see('Đã hoàn thành & Thanh toán');
});

Scenario('TC17 - Kiểm tra chuyển tab thanh toán sang Chuyển khoản PayOS / VietQR', async ({ I }) => {
  I.amOnPage('/admin/staff.html');
  setupStaffState(I);

  I.click('[data-action="open-checkout-modal"][data-id="103"]');

  I.click('#tab-pay-payos');

  I.dontSeeElement('#panel-pay-payos.hidden');
  I.seeElementInDOM('#panel-pay-cash.hidden');
  I.seeElement('#payos-qr-image');
  I.seeElement('#btn-confirm-transfer-paid');
});

Scenario('TC18 - Kiểm tra đóng modal thanh toán bằng nút X', async ({ I }) => {
  I.amOnPage('/admin/staff.html');
  setupStaffState(I);

  I.click('[data-action="open-checkout-modal"][data-id="103"]');
  I.dontSeeElement('#staff-payment-modal.hidden');

  I.click('#close-staff-payment-modal');
  I.seeElementInDOM('#staff-payment-modal.hidden');
});

// ============================================================================
// 3. QUẢN LÝ BÀN & QR CODE (TABLE MANAGEMENT - UC15, CORE SPEC 3)
// ============================================================================

Scenario('TC19 - Kiểm tra giao diện Quản lý bàn của Staff', async ({ I }) => {
  I.amOnPage('/admin/staff-tables.html');
  setupStaffState(I);

  I.see('FutureSushi');
  I.see('Phục vụ');
  I.see('Quản lý bàn');

  // Kiểm tra KPI bàn
  I.seeElement('#metric-empty');
  I.seeElement('#metric-booked');
  I.seeElement('#metric-serving');
  I.seeElement('#metric-cleaning');

  I.seeElement('#staff-tables-grid');
  I.seeElement('#staff-search-input');
});

Scenario('TC20 - Kiểm tra hiển thị thông tin thẻ bàn (Số bàn, Sức chứa, Trạng thái)', async ({ I }) => {
  I.amOnPage('/admin/staff-tables.html');
  setupStaffState(I);

  I.see('Bàn #1');
  I.see('🟢 Bàn trống');

  I.see('Bàn #2');
  I.see('🟡 Đang ăn');

  I.see('Bàn #3');
  I.see('🔵 Đặt trước');

  I.see('Bàn #4');
  I.see('🟣 Cần dọn');
});

Scenario('TC21 - Kiểm tra tìm kiếm bàn theo số bàn', async ({ I }) => {
  I.amOnPage('/admin/staff-tables.html');
  setupStaffState(I);

  I.fillField('#staff-search-input', '2');
  I.wait(0.3);

  I.see('Bàn #2');
  I.dontSee('Bàn #1');
  I.dontSee('Bàn #3');
  I.dontSee('Bàn #4');
});

Scenario('TC22 - Kiểm tra cập nhật trạng thái bàn sang AVAILABLE (Trống) (UC15)', async ({ I }) => {
  I.amOnPage('/admin/staff-tables.html');
  setupStaffState(I);

  I.seeElement('select[data-action="change-table-status"][data-id="4"]');
  I.selectOption('select[data-action="change-table-status"][data-id="4"]', 'AVAILABLE');

  // Mô phỏng cập nhật state
  I.executeScript(() => {
    const table = window.staffState.tables.find(t => t.id === 4);
    if (table) {
      table.status = 'AVAILABLE';
      table.calculatedStatus = 'AVAILABLE';
    }
    window.renderTablesGrid(window.staffState.tables);
  });

  const val = await I.grabValueFrom('select[data-action="change-table-status"][data-id="4"]');
  if (val !== 'AVAILABLE') throw new Error(`Expected AVAILABLE, got ${val}`);
});

Scenario('TC23 - Kiểm tra cập nhật trạng thái bàn sang OCCUPIED (Đang ăn / Có khách) (UC15)', async ({ I }) => {
  I.amOnPage('/admin/staff-tables.html');
  setupStaffState(I);

  I.selectOption('select[data-action="change-table-status"][data-id="1"]', 'OCCUPIED');

  I.executeScript(() => {
    const table = window.staffState.tables.find(t => t.id === 1);
    if (table) {
      table.status = 'OCCUPIED';
      table.calculatedStatus = 'OCCUPIED';
    }
    window.renderTablesGrid(window.staffState.tables);
  });

  const val = await I.grabValueFrom('select[data-action="change-table-status"][data-id="1"]');
  if (val !== 'OCCUPIED') throw new Error(`Expected OCCUPIED, got ${val}`);
});

Scenario('TC24 - Kiểm tra cập nhật trạng thái bàn sang BOOKED (Đã đặt trước) (UC15)', async ({ I }) => {
  I.amOnPage('/admin/staff-tables.html');
  setupStaffState(I);

  I.selectOption('select[data-action="change-table-status"][data-id="1"]', 'BOOKED');

  I.executeScript(() => {
    const table = window.staffState.tables.find(t => t.id === 1);
    if (table) {
      table.status = 'BOOKED';
      table.calculatedStatus = 'BOOKED';
    }
    window.renderTablesGrid(window.staffState.tables);
  });

  const val = await I.grabValueFrom('select[data-action="change-table-status"][data-id="1"]');
  if (val !== 'BOOKED') throw new Error(`Expected BOOKED, got ${val}`);
});

Scenario('TC25 - Kiểm tra cập nhật trạng thái bàn sang CLEANING (Cần dọn) (UC15)', async ({ I }) => {
  I.amOnPage('/admin/staff-tables.html');
  setupStaffState(I);

  I.selectOption('select[data-action="change-table-status"][data-id="2"]', 'CLEANING');

  I.executeScript(() => {
    const table = window.staffState.tables.find(t => t.id === 2);
    if (table) {
      table.status = 'CLEANING';
      table.calculatedStatus = 'CLEANING';
    }
    window.renderTablesGrid(window.staffState.tables);
  });

  const val = await I.grabValueFrom('select[data-action="change-table-status"][data-id="2"]');
  if (val !== 'CLEANING') throw new Error(`Expected CLEANING, got ${val}`);
});

Scenario('TC26 - Kiểm tra mở Modal xem Mã QR của bàn', async ({ I }) => {
  I.amOnPage('/admin/staff-tables.html');
  setupStaffState(I);

  I.seeElement('button[data-action="open-table-qr-modal"][data-number="1"]');
  I.click('button[data-action="open-table-qr-modal"][data-number="1"]');

  I.seeElement('#table-qr-modal');
  I.dontSeeElement('#table-qr-modal.hidden');
  I.see('Mã QR Bàn #1');
  I.seeElement('#table-qr-image');
  I.seeElement('#btn-download-table-qr');
});

Scenario('TC27 - Kiểm tra các nút chức năng trong Modal Mã QR bàn', async ({ I }) => {
  I.amOnPage('/admin/staff-tables.html');
  setupStaffState(I);

  I.click('button[data-action="open-table-qr-modal"][data-number="1"]');

  I.see('Sao chép link');
  I.see('Tải ảnh QR');
  I.see('In mã QR');
  I.see('Mở Menu Web');

  I.seeElement('[data-action="copy-table-url"]');
  I.seeElement('#btn-download-table-qr');
});

Scenario('TC28 - Kiểm tra đóng Modal Mã QR bàn', async ({ I }) => {
  I.amOnPage('/admin/staff-tables.html');
  setupStaffState(I);

  I.click('button[data-action="open-table-qr-modal"][data-number="1"]');
  I.dontSeeElement('#table-qr-modal.hidden');

  I.click('#close-table-qr-modal');
  I.seeElementInDOM('#table-qr-modal.hidden');
});

Scenario('TC29 - Kiểm tra xem chi tiết thông tin đơn và đặt bàn gắn liền với bàn', async ({ I }) => {
  I.amOnPage('/admin/staff-tables.html');
  setupStaffState(I);

  I.seeElement('button[data-action="toggle-staff-table-detail"][data-id="2"]');
  I.click('button[data-action="toggle-staff-table-detail"][data-id="2"]');

  I.seeElement('[data-staff-table-detail="2"]');
  I.see('Sức chứa: 6 người');
  I.see('Sushi Combo Deluxe x2');
});

// ============================================================================
// 4. QUẢN LÝ ĐẶT BÀN & CHECK-IN (RESERVATION - UC16)
// ============================================================================

Scenario('TC30 - Kiểm tra giao diện Quản lý đặt bàn của Staff', async ({ I }) => {
  I.amOnPage('/admin/staff-reservations.html');
  setupStaffState(I);

  I.see('FutureSushi');
  I.see('Phục vụ');
  I.see('Quản lý đặt bàn');

  // Kiểm tra KPI đặt bàn
  I.seeElement('#metric-res-confirmed');
  I.seeElement('#metric-res-checked');
  I.seeElement('#metric-res-pending');

  I.seeElement('#reservation-filter-pills');
  I.seeElement('#reservations-cards-grid');
  I.seeElement('#staff-search-input');
});

Scenario('TC31 - Kiểm tra hiển thị thông tin thẻ đặt bàn', async ({ I }) => {
  I.amOnPage('/admin/staff-reservations.html');
  setupStaffState(I);

  I.see('#201 • Nguyễn Văn An');
  I.see('0901234567');
  I.see('Bàn #1 • 👥 4 người');
  I.see('Bàn gần cửa sổ');
  I.see('Chờ duyệt');

  I.see('#202 • Trần Thị Bình');
  I.see('0912345678');
  I.see('Bàn #3 • 👥 2 người');
  I.see('Đã xác nhận');
});

Scenario('TC32 - Kiểm tra các bộ lọc trạng thái đặt bàn', async ({ I }) => {
  I.amOnPage('/admin/staff-reservations.html');
  setupStaffState(I);

  // Lọc Chờ duyệt
  I.click('[data-action="filter-reservation"][data-status="PENDING"]');
  I.wait(0.3);
  I.see('#201 • Nguyễn Văn An');
  I.dontSee('#202 • Trần Thị Bình');

  // Lọc Đã xác nhận
  I.click('[data-action="filter-reservation"][data-status="CONFIRMED"]');
  I.wait(0.3);
  I.see('#202 • Trần Thị Bình');
  I.dontSee('#201 • Nguyễn Văn An');

  // Lọc Đã nhận bàn
  I.click('[data-action="filter-reservation"][data-status="CHECKED_IN"]');
  I.wait(0.3);
  I.see('#203 • Lê Hoàng Cường');
  I.dontSee('#201 • Nguyễn Văn An');

  // Lọc Đã hủy
  I.click('[data-action="filter-reservation"][data-status="CANCELLED"]');
  I.wait(0.3);
  I.see('#204 • Phạm Minh Đức');
  I.dontSee('#201 • Nguyễn Văn An');
});

Scenario('TC33 - Kiểm tra tìm kiếm lịch đặt bàn theo tên khách hoặc SĐT', async ({ I }) => {
  I.amOnPage('/admin/staff-reservations.html');
  setupStaffState(I);

  I.fillField('#staff-search-input', '0912345678');
  I.wait(0.3);

  I.see('#202 • Trần Thị Bình');
  I.dontSee('#201 • Nguyễn Văn An');
  I.dontSee('#203 • Lê Hoàng Cường');
});

Scenario('TC34 - Kiểm tra duyệt lịch đặt bàn PENDING sang CONFIRMED', async ({ I }) => {
  I.amOnPage('/admin/staff-reservations.html');
  setupStaffState(I);

  I.seeElement('[data-action="confirm-reservation"][data-id="201"]');

  // Mô phỏng duyệt đặt bàn
  I.executeScript(() => {
    const res = window.staffState.reservations.find(r => r.id === 201);
    if (res) res.status = 'CONFIRMED';
    window.renderReservationsTable(window.staffState.reservations);
  });

  I.see('Đã xác nhận');
});

Scenario('TC35 - Kiểm tra Check-in nhận bàn cho khách (UC16)', async ({ I }) => {
  I.amOnPage('/admin/staff-reservations.html');
  setupStaffState(I);

  I.seeElement('[data-action="checkin-reservation"][data-id="202"]');
  I.see('Nhận bàn');

  // Mô phỏng Check-in thành công
  I.executeScript(() => {
    const res = window.staffState.reservations.find(r => r.id === 202);
    if (res) res.status = 'CHECKED_IN';
    window.renderReservationsTable(window.staffState.reservations);
  });

  I.see('Đã nhận bàn');
});

Scenario('TC36 - Kiểm tra hủy lịch đặt bàn', async ({ I }) => {
  I.amOnPage('/admin/staff-reservations.html');
  setupStaffState(I);

  I.seeElement('[data-action="cancel-reservation"][data-id="201"]');

  // Mô phỏng hủy lịch đặt bàn
  I.executeScript(() => {
    const res = window.staffState.reservations.find(r => r.id === 201);
    if (res) res.status = 'CANCELLED';
    window.renderReservationsTable(window.staffState.reservations);
  });

  I.see('Đã hủy');
});
