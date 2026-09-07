Feature('Kitchen - Vận hành Bếp & Quản lý Chế biến Món ăn (UC18, UC19, Core Spec 6)');

// Mock Data Generator chuẩn SRS cho Kitchen
const getFreshKitchenOrders = () => [
  {
    id: 301,
    status: 'CONFIRMED',
    paymentStatus: 'UNPAID',
    totalPrice: 280000,
    finalPrice: 280000,
    note: 'Ít cay, không hành tây',
    createdAt: new Date().toISOString(),
    User: { id: 1, fullName: 'Nguyễn Văn An', phone: '0901234567' },
    RestaurantTable: { id: 1, tableNumber: 1, capacity: 4 },
    OrderItems: [
      { id: 1, product_id: 1, quantity: 2, totalPrice: 180000, Product: { name: 'Sashimi Cá Hồi' } },
      { id: 2, product_id: 2, quantity: 1, totalPrice: 100000, Product: { name: 'Canh Rong Biển' } }
    ]
  },
  {
    id: 302,
    status: 'PENDING',
    paymentStatus: 'UNPAID',
    totalPrice: 420000,
    finalPrice: 420000,
    note: 'Làm nóng giúp khách',
    createdAt: new Date().toISOString(),
    User: { id: 2, fullName: 'Trần Thị Bình', phone: '0912345678' },
    RestaurantTable: { id: 2, tableNumber: 2, capacity: 6 },
    OrderItems: [
      { id: 3, product_id: 3, quantity: 2, totalPrice: 420000, Product: { name: 'Sushi Set Đặc Biệt' } }
    ]
  },
  {
    id: 303,
    status: 'PREPARING',
    paymentStatus: 'UNPAID',
    totalPrice: 350000,
    finalPrice: 350000,
    note: 'Bàn VIP - Ưu tiên làm trước',
    createdAt: new Date().toISOString(),
    User: { id: 3, fullName: 'Lê Hoàng Cường', phone: '0923456789' },
    RestaurantTable: { id: 3, tableNumber: 3, capacity: 2 },
    OrderItems: [
      { id: 4, product_id: 4, quantity: 1, totalPrice: 250000, Product: { name: 'Mì Ramen Bò Wagyu' } },
      { id: 5, product_id: 5, quantity: 2, totalPrice: 100000, Product: { name: 'Trà Xanh Nhật Bản' } }
    ]
  },
  {
    id: 304,
    status: 'READY',
    paymentStatus: 'UNPAID',
    totalPrice: 190000,
    finalPrice: 190000,
    note: 'Món ăn kèm gừng hồng',
    createdAt: new Date().toISOString(),
    User: { id: 4, fullName: 'Phạm Minh Đức', phone: '0934567890' },
    RestaurantTable: { id: 4, tableNumber: 4, capacity: 4 },
    OrderItems: [
      { id: 6, product_id: 6, quantity: 1, totalPrice: 190000, Product: { name: 'Cơm Lươn Nhật Unagi' } }
    ]
  },
  {
    id: 305,
    status: 'COMPLETED',
    paymentStatus: 'PAID',
    totalPrice: 500000,
    finalPrice: 500000,
    note: 'Đã thanh toán',
    createdAt: new Date().toISOString(),
    User: { id: 5, fullName: 'Hoàng Thùy Linh', phone: '0945678901' },
    RestaurantTable: { id: 5, tableNumber: 5, capacity: 4 },
    OrderItems: [
      { id: 7, product_id: 7, quantity: 2, totalPrice: 500000, Product: { name: 'Lẩu Sukiyaki' } }
    ]
  },
  {
    id: 306,
    status: 'CANCELLED',
    paymentStatus: 'UNPAID',
    totalPrice: 120000,
    finalPrice: 120000,
    note: 'Khách đổi ý hủy món',
    createdAt: new Date().toISOString(),
    User: { id: 6, fullName: 'Vũ Quốc Huy', phone: '0956789012' },
    RestaurantTable: { id: 6, tableNumber: 6, capacity: 2 },
    OrderItems: [
      { id: 8, product_id: 8, quantity: 1, totalPrice: 120000, Product: { name: 'Bánh Xèo Nhật Okonomiyaki' } }
    ]
  }
];

// Helper để nạp Mock Data vào State giao diện Kitchen
const setupKitchenState = (I, customOrders, options = {}) => {
  const orders = customOrders || getFreshKitchenOrders();

  I.executeScript(({ orders, options }) => {
    window.__KITCHEN_MOCK_ACTIVE = true;
    try {
      localStorage.setItem('KITCHEN_MOCK_ACTIVE', 'true');
      localStorage.setItem('KITCHEN_MOCK_ORDERS', JSON.stringify(orders || []));
    } catch (e) {}

    window.alert = () => {};
    window.confirm = () => true;

    window.kitchenOrders = orders || [];

    const state = window.kitchenState || (window.kitchenState = {});
    state.searchQuery = options.searchQuery || '';
    if (options.dateFilter !== undefined) {
      state.dateFilter = options.dateFilter;
    } else {
      const d = new Date();
      state.dateFilter = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    }

    const searchInput = document.querySelector('#kitchen-search-input');
    if (searchInput) searchInput.value = state.searchQuery;

    const datePicker = document.querySelector('#kitchen-date-picker');
    if (datePicker) datePicker.value = state.dateFilter;

    if (typeof window.renderBoard === 'function') {
      window.renderBoard(window.kitchenOrders);
    }
  }, { orders, options });
  I.wait(0.3);
};

// ============================================================================
// 1. GIAO DIỆN & KANBAN BOARD BỘ PHẬN BẾP (KITCHEN UI & OVERVIEW)
// ============================================================================

Scenario('TC01 - Kiểm tra giao diện Quản lý món ăn của Kitchen', async ({ I }) => {
  I.amOnPage('/admin/kitchen.html');

  // Kiểm tra thương hiệu & vai trò
  I.see('FutureSushi');
  I.see('Bộ phận Bếp');
  I.see('Trực bộ phận bếp');

  // Breadcrumb & Profile
  I.see('Quản lý món ăn');
  I.see('Đầu Bếp Trưởng');
  I.see('KITCHEN');

  // Panel mô tả nghiệp vụ bếp
  I.see('Quản lý món ăn & Cập nhật trạng thái chế biến');
  I.seeElement('#kitchen-search-input');
  I.seeElement('#kitchen-date-picker');
  I.seeElement('#btn-kitchen-today');
  I.seeElement('#btn-kitchen-all-dates');
});

Scenario('TC02 - Kiểm tra hiển thị 3 cột Kanban và số lượng đếm', async ({ I }) => {
  I.amOnPage('/admin/kitchen.html');
  setupKitchenState(I);

  // Kiểm tra 3 cột Kanban
  I.see('Chờ chế biến');
  I.see('Đang làm');
  I.see('Hoàn thành');

  I.seeElement('#board-todo');
  I.seeElement('#board-doing');
  I.seeElement('#board-done');

  // Kiểm tra badge số lượng: 2 chờ chế biến (301, 302), 1 đang làm (303), 1 hoàn thành (304)
  I.see('2', '#todo-count');
  I.see('1', '#doing-count');
  I.see('1', '#done-count');
});

// ============================================================================
// 2. XEM ĐƠN & CHI TIẾT MÓN ĂN CẦN CHẾ BIẾN (UC18 - GET /api/orders)
// ============================================================================

Scenario('TC03 - Kiểm tra hiển thị danh sách đơn ở cột Chờ chế biến (UC18)', async ({ I }) => {
  I.amOnPage('/admin/kitchen.html');
  setupKitchenState(I);

  // Đơn #301 (CONFIRMED) & Đơn #302 (PENDING) nằm ở cột Chờ chế biến
  I.see('Đơn #301', '#board-todo');
  I.see('Bàn #1', '#board-todo');
  I.see('Sashimi Cá Hồi', '#board-todo');
  I.see('x2', '#board-todo');
  I.see('Canh Rong Biển', '#board-todo');
  I.see('x1', '#board-todo');

  I.see('Đơn #302', '#board-todo');
  I.see('Bàn #2', '#board-todo');
  I.see('Sushi Set Đặc Biệt', '#board-todo');
});

Scenario('TC04 - Kiểm tra thông tin chi tiết trên thẻ món ăn (Số bàn, Khách, Ghi chú)', async ({ I }) => {
  I.amOnPage('/admin/kitchen.html');
  setupKitchenState(I);

  // Đơn #301: Kiểm tra khách hàng và ghi chú món
  I.see('Nguyễn Văn An', '#board-todo');
  I.see('Ít cay, không hành tây', '#board-todo');

  // Đơn #302: Ghi chú
  I.see('Trần Thị Bình', '#board-todo');
  I.see('Làm nóng giúp khách', '#board-todo');

  // Đơn #303: Ghi chú VIP
  I.see('Bàn VIP - Ưu tiên làm trước', '#board-doing');
});

Scenario('TC05 - Kiểm tra hiển thị đơn hàng ở cột Đang làm (PREPARING)', async ({ I }) => {
  I.amOnPage('/admin/kitchen.html');
  setupKitchenState(I);

  // Đơn #303 ở cột Đang làm
  I.see('Đơn #303', '#board-doing');
  I.see('Bàn #3', '#board-doing');
  I.see('Mì Ramen Bò Wagyu', '#board-doing');
  I.see('Trà Xanh Nhật Bản', '#board-doing');
  I.see('Lê Hoàng Cường', '#board-doing');
});

Scenario('TC06 - Kiểm tra hiển thị đơn hàng ở cột Hoàn thành (READY)', async ({ I }) => {
  I.amOnPage('/admin/kitchen.html');
  setupKitchenState(I);

  // Đơn #304 ở cột Hoàn thành
  I.see('Đơn #304', '#board-done');
  I.see('Bàn #4', '#board-done');
  I.see('Cơm Lươn Nhật Unagi', '#board-done');
  I.see('Phạm Minh Đức', '#board-done');
});

// ============================================================================
// 3. CẬP NHẬT TIẾN ĐỘ CHẾ BIẾN (UC19 - PUT /api/orders/:id/status)
// ============================================================================

Scenario('TC07 - Kiểm tra chuyển trạng thái từ Chờ chế biến sang Đang làm (UC19)', async ({ I }) => {
  I.amOnPage('/admin/kitchen.html');
  setupKitchenState(I);

  // Kiểm tra nút "Bắt đầu làm món" trên đơn #301
  I.seeElement('[data-action="update-kitchen-status"][data-id="301"][data-target="PREPARING"]');
  I.see('Bắt đầu làm món', '#board-todo');

  // Nhấp nút Bắt đầu làm món
  I.click('[data-action="update-kitchen-status"][data-id="301"][data-target="PREPARING"]');
  I.wait(0.3);

  // Đơn #301 phải chuyển sang cột Đang làm
  I.see('Đơn #301', '#board-doing');
  I.see('Báo Hoàn thành (READY)', '#board-doing');
  I.see('1', '#todo-count');
  I.see('2', '#doing-count');
});

Scenario('TC08 - Kiểm tra chuyển trạng thái từ Đang làm sang Hoàn thành (UC19)', async ({ I }) => {
  I.amOnPage('/admin/kitchen.html');
  setupKitchenState(I);

  // Kiểm tra nút "Báo Hoàn thành (READY)" trên đơn #303
  I.seeElement('[data-action="update-kitchen-status"][data-id="303"][data-target="READY"]');
  I.see('Báo Hoàn thành (READY)', '#board-doing');

  // Nhấp nút Báo Hoàn thành
  I.click('[data-action="update-kitchen-status"][data-id="303"][data-target="READY"]');
  I.wait(0.3);

  // Đơn #303 phải chuyển sang cột Hoàn thành
  I.see('Đơn #303', '#board-done');
  I.see('Đã nấu xong • Sẵn sàng phục vụ', '#board-done');
  I.see('0', '#doing-count');
  I.see('2', '#done-count');
});

Scenario('TC09 - Kiểm tra đơn ở cột Hoàn thành không còn nút thao tác', async ({ I }) => {
  I.amOnPage('/admin/kitchen.html');
  setupKitchenState(I);

  // Kiểm tra đơn #304 ở cột Hoàn thành
  I.see('Đã nấu xong • Sẵn sàng phục vụ', '#board-done');
  I.dontSeeElement('#board-done button[data-action="update-kitchen-status"]');
});

// ============================================================================
// 4. KIỂM TRA STATE TRANSITION & RÀNG BUỘC NGHIỆP VỤ (CORE SPEC 6)
// ============================================================================

Scenario('TC10 - Kiểm tra đơn COMPLETED và CANCELLED tự động ẩn khỏi Kanban Bếp (Spec 6)', async ({ I }) => {
  I.amOnPage('/admin/kitchen.html');
  setupKitchenState(I);

  // Đơn #305 (COMPLETED) và #306 (CANCELLED) không được xuất hiện trên bất kỳ cột nào của Bếp
  I.dontSee('Đơn #305');
  I.dontSee('Lẩu Sukiyaki');
  I.dontSee('Đơn #306');
  I.dontSee('Bánh Xèo Nhật Okonomiyaki');
});

Scenario('TC11 - Kiểm tra quy trình State Transition tuần tự (CONFIRMED -> PREPARING -> READY)', async ({ I }) => {
  I.amOnPage('/admin/kitchen.html');

  // Khởi tạo đơn mới ở trạng thái CONFIRMED
  const singleOrder = [
    {
      id: 399,
      status: 'CONFIRMED',
      paymentStatus: 'UNPAID',
      totalPrice: 150000,
      finalPrice: 150000,
      note: 'Test State Transition tuần tự',
      createdAt: new Date().toISOString(),
      User: { id: 9, fullName: 'Khách Test Transition' },
      RestaurantTable: { id: 9, tableNumber: 9 },
      OrderItems: [{ id: 9, product_id: 1, quantity: 1, Product: { name: 'Món Test 399' } }]
    }
  ];

  setupKitchenState(I, singleOrder);

  // Bước 1: Khởi đầu ở Chờ chế biến (todo)
  I.see('Đơn #399', '#board-todo');
  I.see('1', '#todo-count');
  I.see('0', '#doing-count');
  I.see('0', '#done-count');

  // Bước 2: Chuyển sang PREPARING (Đang làm)
  I.click('[data-action="update-kitchen-status"][data-id="399"][data-target="PREPARING"]');
  I.wait(0.3);
  I.see('Đơn #399', '#board-doing');
  I.dontSee('Đơn #399', '#board-todo');
  I.see('0', '#todo-count');
  I.see('1', '#doing-count');

  // Bước 3: Chuyển sang READY (Hoàn thành)
  I.click('[data-action="update-kitchen-status"][data-id="399"][data-target="READY"]');
  I.wait(0.3);
  I.see('Đơn #399', '#board-done');
  I.dontSee('Đơn #399', '#board-doing');
  I.see('0', '#doing-count');
  I.see('1', '#done-count');
  I.see('Đã nấu xong • Sẵn sàng phục vụ', '#board-done');
});

// ============================================================================
// 5. BỘ LỌC THEO NGÀY CHẾ BIẾN (DATE FILTERING)
// ============================================================================

Scenario('TC12 - Kiểm tra lọc đơn theo ngày Hôm nay', async ({ I }) => {
  I.amOnPage('/admin/kitchen.html');
  setupKitchenState(I);

  // Nhấp nút Hôm nay
  I.click('#btn-kitchen-today');
  I.wait(0.2);

  // Các đơn tạo hôm nay vẫn hiển thị
  I.see('Đơn #301');
  I.see('Đơn #303');
  I.see('Đơn #304');
});

Scenario('TC13 - Kiểm tra lọc đơn theo Tất cả ngày', async ({ I }) => {
  I.amOnPage('/admin/kitchen.html');

  // Đơn cũ của hôm qua
  const yesterday = new Date(Date.now() - 86400000).toISOString();
  const mixedOrders = [
    ...getFreshKitchenOrders(),
    {
      id: 388,
      status: 'CONFIRMED',
      paymentStatus: 'UNPAID',
      totalPrice: 100000,
      finalPrice: 100000,
      note: 'Đơn từ hôm qua',
      createdAt: yesterday,
      User: { id: 8, fullName: 'Khách Hôm Qua' },
      RestaurantTable: { id: 8, tableNumber: 8 },
      OrderItems: [{ id: 8, product_id: 1, quantity: 1, Product: { name: 'Món Hôm Qua' } }]
    }
  ];

  setupKitchenState(I, mixedOrders);

  // Ban đầu bộ lọc là hôm nay nên không thấy đơn #388
  I.dontSee('Đơn #388');

  // Nhấp nút Tất cả ngày
  I.click('#btn-kitchen-all-dates');
  I.wait(0.3);

  // Đơn #388 của hôm qua phải hiển thị
  I.see('Đơn #388');
  I.see('Khách Hôm Qua');
});

Scenario('TC14 - Kiểm tra chọn ngày cụ thể bằng Date Picker', async ({ I }) => {
  I.amOnPage('/admin/kitchen.html');

  const specificDate = '2026-09-01';
  const specificOrders = [
    {
      id: 377,
      status: 'CONFIRMED',
      paymentStatus: 'UNPAID',
      totalPrice: 200000,
      finalPrice: 200000,
      note: 'Đơn ngày 01-09',
      createdAt: '2026-09-01T10:00:00.000Z',
      User: { id: 7, fullName: 'Khách Ngày 1 Tháng 9' },
      RestaurantTable: { id: 7, tableNumber: 7 },
      OrderItems: [{ id: 7, product_id: 1, quantity: 1, Product: { name: 'Món Đầu Tháng' } }]
    }
  ];

  setupKitchenState(I, specificOrders, { dateFilter: specificDate });

  I.see('Đơn #377');
  I.see('Khách Ngày 1 Tháng 9');
  I.see('Món Đầu Tháng');
});

// ============================================================================
// 6. TÌM KIẾM MÓN ĂN LIVE SEARCH
// ============================================================================

Scenario('TC15 - Kiểm tra tìm kiếm món ăn theo Tên món', async ({ I }) => {
  I.amOnPage('/admin/kitchen.html');
  setupKitchenState(I);

  // Nhập tên món vào ô tìm kiếm
  I.fillField('#kitchen-search-input', 'Sashimi');
  I.wait(0.2);

  // Chỉ thấy đơn chứa Sashimi (#301)
  I.see('Đơn #301');
  I.see('Sashimi Cá Hồi');
  I.dontSee('Đơn #302');
  I.dontSee('Đơn #303');
  I.dontSee('Đơn #304');
});

Scenario('TC16 - Kiểm tra tìm kiếm món ăn theo Số bàn', async ({ I }) => {
  I.amOnPage('/admin/kitchen.html');
  setupKitchenState(I);

  // Nhập số bàn vào ô tìm kiếm
  I.fillField('#kitchen-search-input', 'Bàn #3');
  I.wait(0.2);

  // Chỉ thấy đơn ở Bàn #3 (#303)
  I.see('Đơn #303');
  I.see('Bàn #3');
  I.dontSee('Đơn #301');
  I.dontSee('Đơn #302');
});

Scenario('TC17 - Kiểm tra tìm kiếm món ăn theo Ghi chú khách hàng', async ({ I }) => {
  I.amOnPage('/admin/kitchen.html');
  setupKitchenState(I);

  // Nhập từ khóa ghi chú
  I.fillField('#kitchen-search-input', 'VIP');
  I.wait(0.2);

  // Thấy đơn có ghi chú VIP (#303)
  I.see('Đơn #303');
  I.see('Bàn VIP - Ưu tiên làm trước');
  I.dontSee('Đơn #301');
});

Scenario('TC18 - Kiểm tra tìm kiếm món ăn theo Tên khách hàng', async ({ I }) => {
  I.amOnPage('/admin/kitchen.html');
  setupKitchenState(I);

  // Nhập tên khách
  I.fillField('#kitchen-search-input', 'Trần Thị Bình');
  I.wait(0.2);

  // Thấy đơn của Trần Thị Bình (#302)
  I.see('Đơn #302');
  I.see('Trần Thị Bình');
  I.dontSee('Đơn #301');
  I.dontSee('Đơn #303');
});

Scenario('TC19 - Kiểm tra tìm kiếm không có kết quả hiển thị thông báo rỗng', async ({ I }) => {
  I.amOnPage('/admin/kitchen.html');
  setupKitchenState(I);

  // Nhập từ khóa không tồn tại
  I.fillField('#kitchen-search-input', 'MonAnKhongTonTai9999');
  I.wait(0.2);

  // Kiểm tra hiển thị empty state
  I.see('Chưa có món trong danh mục này');
  I.dontSee('Đơn #301');
  I.dontSee('Đơn #302');
  I.dontSee('Đơn #303');
  I.dontSee('Đơn #304');
});

Scenario('TC20 - Kiểm tra cập nhật số lượng đếm trên Header các cột khi chuyển trạng thái', async ({ I }) => {
  I.amOnPage('/admin/kitchen.html');
  setupKitchenState(I);

  // Ban đầu: Todo = 2, Doing = 1, Done = 1
  I.see('2', '#todo-count');
  I.see('1', '#doing-count');
  I.see('1', '#done-count');

  // Chuyển đơn #301 từ Todo -> Doing
  I.click('[data-action="update-kitchen-status"][data-id="301"][data-target="PREPARING"]');
  I.wait(0.3);

  // Cập nhật: Todo = 1, Doing = 2, Done = 1
  I.see('1', '#todo-count');
  I.see('2', '#doing-count');
  I.see('1', '#done-count');

  // Chuyển đơn #301 từ Doing -> Done
  I.click('[data-action="update-kitchen-status"][data-id="301"][data-target="READY"]');
  I.wait(0.3);

  // Cập nhật: Todo = 1, Doing = 1, Done = 2
  I.see('1', '#todo-count');
  I.see('1', '#doing-count');
  I.see('2', '#done-count');
});
