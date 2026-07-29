const TOKEN_KEY = 'appdatmon_admin_token';
const USER_KEY = 'appdatmon_admin_user';
const API_BASE_URL = (window.ADMIN_API_BASE_URL || localStorage.getItem('appdatmon_admin_api_base') || 'http://54.81.9.236:3000').replace(/\/$/, '');

const VIEW_META = {
  overview: {
    title: 'Dashboard',
    description: 'Theo dõi nhanh tình trạng hệ thống, doanh thu và số lượng bản ghi đang quản lý.'
  },
  users: {
    title: 'Người dùng',
    description: 'Quản lý tài khoản, vai trò, điểm tích lũy và trạng thái đăng nhập.'
  },
  categories: {
    title: 'Danh mục món',
    description: 'Tạo, sửa và xóa nhóm món ăn hiển thị trên menu.'
  },
  products: {
    title: 'Sản phẩm',
    description: 'Quản lý món ăn, giá bán, tồn kho, ảnh và liên kết danh mục.'
  },
  tables: {
    title: 'Bàn ăn',
    description: 'Theo dõi trạng thái bàn, nạp danh sách bàn hàng loạt và cập nhật nhanh trạng thái.'
  },
  reservations: {
    title: 'Đặt bàn',
    description: 'Theo dõi lịch đặt, xác nhận nhận bàn và hủy đặt bàn khi cần.'
  },
  orders: {
    title: 'Đơn hàng',
    description: 'Xem đơn chi tiết, đổi trạng thái, thanh toán và xóa đơn không hợp lệ.'
  },
  reviews: {
    title: 'Đánh giá',
    description: 'Duyệt phản hồi khách hàng và xóa đánh giá không phù hợp.'
  },
  stats: {
    title: 'Reports',
    description: 'Lọc theo ngày, tháng hoặc năm để xem tổng đơn và tổng doanh thu.'
  }
};

const NAV_ICONS = {
  overview: 'fa-gauge-high',
  users: 'fa-users',
  categories: 'fa-folder-open',
  products: 'fa-bowl-food',
  tables: 'fa-table',
  reservations: 'fa-calendar-check',
  orders: 'fa-receipt',
  reviews: 'fa-star',
  stats: 'fa-chart-line'
};

const ENTITY_CONFIGS = {
  users: {
    endpoint: '/api/users',
    searchKey: 'search',
    createLabel: 'Thêm người dùng',
    allowCreate: true,
    allowEdit: true,
    allowDelete: true,
    fields: [
      { name: 'fullName', label: 'Họ tên', type: 'text', required: true },
      { name: 'email', label: 'Email', type: 'email' },
      { name: 'phone', label: 'Số điện thoại', type: 'text', required: true },
      { name: 'username', label: 'Tên đăng nhập', type: 'text', required: true },
      { name: 'password', label: 'Mật khẩu', type: 'password', requiredOnCreate: true, helper: 'Bỏ trống khi chỉnh sửa người dùng hiện tại.' },
      { name: 'avatar', label: 'Avatar', type: 'image' },
      { name: 'points', label: 'Điểm tích lũy', type: 'number', min: 0 },
      { name: 'role', label: 'Vai trò', type: 'select', options: ['CUSTOMER', 'STAFF', 'KITCHEN', 'ADMIN'] },
      { name: 'status', label: 'Trạng thái', type: 'select', options: ['ACTIVE', 'BLOCKED'] }
    ],
    columns: [
      { label: 'Họ tên', render: row => row.fullName || '-' },
      { label: 'Tài khoản', render: row => row.username || '-' },
      { label: 'Liên hệ', render: row => [row.phone, row.email].filter(Boolean).join(' • ') || '-' },
      { label: 'Vai trò', render: row => statusChip(row.role, row.role) },
      { label: 'Trạng thái', render: row => statusChip(row.status, row.status) },
      { label: 'Điểm', render: row => formatNumber(row.points ?? 0) }
    ],
    payload: row => ({
      fullName: row.fullName || '',
      email: row.email || '',
      phone: row.phone || '',
      username: row.username || '',
      avatar: row.avatar || '',
      points: row.points ?? 0,
      role: row.role || 'CUSTOMER',
      status: row.status || 'ACTIVE'
    })
  },
  categories: {
    endpoint: '/api/categories',
    searchKey: 'search',
    createLabel: 'Thêm danh mục',
    allowCreate: true,
    allowEdit: true,
    allowDelete: true,
    fields: [
      { name: 'name', label: 'Tên danh mục', type: 'text', required: true },
      { name: 'description', label: 'Mô tả', type: 'textarea' },
      { name: 'image', label: 'Ảnh', type: 'image' }
    ],
    columns: [
      { label: 'Tên', render: row => row.name || '-' },
      { label: 'Mô tả', render: row => row.description || '-' },
      { label: 'Ảnh', render: row => row.image ? `<span class="badge-inline">Có ảnh</span>` : '<span class="muted">Chưa có</span>' },
      { label: 'Số món', render: row => formatNumber(row.productCount ?? 0) }
    ],
    payload: row => ({
      name: row.name || '',
      description: row.description || '',
      image: row.image || ''
    })
  },
  products: {
    endpoint: '/api/products',
    searchKey: 'search',
    createLabel: 'Thêm sản phẩm',
    allowCreate: true,
    allowEdit: true,
    allowDelete: true,
    fields: [
      { name: 'name', label: 'Tên món', type: 'text', required: true },
      { name: 'description', label: 'Mô tả', type: 'textarea' },
      { name: 'price', label: 'Giá bán', type: 'number', required: true, min: 0, step: '0.01' },
      { name: 'stock', label: 'Tồn kho', type: 'number', min: 0 },
      { name: 'isAvailable', label: 'Đang bán', type: 'checkbox' },
      { name: 'category_id', label: 'Danh mục', type: 'select', options: state => (state.data.categories || []).map(category => ({ value: category.id, label: `${category.name} (#${category.id})` })) },
      { name: 'image', label: 'Ảnh', type: 'image' }
    ],
    columns: [
      { label: 'Tên món', render: row => row.name || '-' },
      { label: 'Danh mục', render: row => categoryLabel(row.category_id) },
      { label: 'Giá', render: row => formatCurrency(row.price) },
      { label: 'Kho', render: row => formatNumber(row.stock ?? 0) },
      { label: 'Sẵn sàng', render: row => statusChip(row.isAvailable ? 'AVAILABLE' : 'BLOCKED', row.isAvailable ? 'Có' : 'Không') }
    ],
    payload: row => ({
      name: row.name || '',
      description: row.description || '',
      price: row.price ?? 0,
      stock: row.stock ?? 0,
      isAvailable: row.isAvailable !== false,
      category_id: row.category_id || state.data.categories?.[0]?.id || '',
      image: row.image || ''
    })
  },
  tables: {
    endpoint: '/api/tables',
    searchKey: 'search',
    createLabel: 'Nạp bàn hàng loạt',
    allowCreate: true,
    allowEdit: false,
    allowDelete: false,
    customCreateMode: 'bulk-tables',
    columns: [
      { label: 'Số bàn', render: row => `#${row.tableNumber ?? row.id}` },
      { label: 'QR Code', render: row => row.qrCode || '-' },
      { label: 'Sức chứa', render: row => formatNumber(row.capacity ?? 0) },
      { label: 'Trạng thái', render: row => statusChip(tableStatusClass(row.calculatedStatus || row.status), row.calculatedStatus || row.status) },
      { label: 'Khách', render: row => row.guestCount ? formatNumber(row.guestCount) : '-' },
      { label: 'Thời gian dùng', render: row => row.timeUsed || '-' }
    ]
  },
  reservations: {
    endpoint: '/api/reservations',
    searchKey: 'search',
    createLabel: 'Thêm đặt bàn',
    allowCreate: true,
    allowEdit: false,
    allowDelete: false,
    customCreateMode: 'reservation',
    columns: [
      { label: 'Khách', render: row => row.guestName || '-' },
      { label: 'SĐT', render: row => row.guestPhone || '-' },
      { label: 'Thời gian', render: row => formatDateTime(row.reservationTime) },
      { label: 'Số khách', render: row => formatNumber(row.numberOfGuests ?? 0) },
      { label: 'Bàn', render: row => row.table?.tableNumber ? `#${row.table.tableNumber}` : row.table_id ? `#${row.table_id}` : '-' },
      { label: 'Trạng thái', render: row => statusChip(reservationStatusClass(row.status), row.status) }
    ]
  },
  orders: {
    endpoint: '/api/orders',
    searchKey: 'search',
    createLabel: 'Tạo đơn hàng',
    allowCreate: true,
    allowEdit: true,
    allowDelete: true,
    customCreateMode: 'order',
    columns: [
      { label: 'Mã đơn', render: row => `#${row.id}` },
      { label: 'Khách', render: row => row.User?.fullName || row.user_id ? `${row.User?.fullName || 'Khách'} (#${row.user_id})` : 'Khách vãng lai' },
      { label: 'Bàn', render: row => row.RestaurantTable?.tableNumber ? `#${row.RestaurantTable.tableNumber}` : row.table_id ? `#${row.table_id}` : '-' },
      { label: 'Tổng tiền', render: row => formatCurrency(row.finalPrice ?? row.totalPrice) },
      { label: 'Thanh toán', render: row => statusChip(paymentStatusClass(row.paymentStatus), row.paymentStatus) },
      { label: 'Trạng thái', render: row => statusChip(orderStatusClass(row.status), row.status) }
    ]
  },
  reviews: {
    endpoint: '/api/reviews?page=1&limit=200',
    searchKey: 'search',
    createLabel: 'Làm mới danh sách',
    allowCreate: false,
    allowEdit: false,
    allowDelete: true,
    columns: [
      { label: 'Người đánh giá', render: row => row.user?.fullName || row.phone || '-' },
      { label: 'Món', render: row => row.dish_name || '-' },
      { label: 'Nội dung', render: row => row.content || '-' },
      { label: 'Số sao', render: row => '★'.repeat(row.rating || 0) },
      { label: 'Ngày tạo', render: row => formatDateTime(row.created_at || row.createdAt) }
    ]
  }
};

const app = document.getElementById('app');
const state = {
  token: localStorage.getItem(TOKEN_KEY) || '',
  user: readJson(USER_KEY),
  activeView: 'overview',
  loading: false,
  modal: null,
  toast: [],
  data: {
    users: [],
    categories: [],
    products: [],
    tables: [],
    reservations: [],
    orders: [],
    reviews: [],
    stats: null
  },
  filters: {
    users: '',
    categories: '',
    products: '',
    tables: '',
    reservations: '',
    orders: '',
    reviews: ''
  },
  statsQuery: {
    type: 'day',
    date: ''
  }
};

function readJson(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    return null;
  }
}

function formatNumber(value) {
  const numeric = Number(value ?? 0);
  return Number.isFinite(numeric) ? numeric.toLocaleString('vi-VN') : '0';
}

function formatCurrency(value) {
  const numeric = Number(value ?? 0);
  return Number.isFinite(numeric)
    ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(numeric)
    : '0 đ';
}

function formatDateTime(value) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(date);
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function statusChip(status, label) {
  const safe = String(status || 'muted').toLowerCase();
  return `<span class="status-chip status-${safe}">${escapeHtml(label ?? status ?? '-')}</span>`;
}

function userInitials(user) {
  const source = user?.fullName || user?.username || 'A';
  return source
    .split(/\s+/)
    .map(part => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

function categoryLabel(categoryId) {
  const category = (state.data.categories || []).find(item => String(item.id) === String(categoryId));
  return category ? `${category.name} (#${category.id})` : categoryId ? `#${categoryId}` : '-';
}

function tableStatusClass(status) {
  const value = String(status || '').toUpperCase();
  if (value === 'AVAILABLE') return 'available';
  if (value === 'BOOKED') return 'booked';
  if (value === 'OCCUPIED') return 'warning';
  if (value === 'CLEANING') return 'cleaning';
  return 'muted';
}

function reservationStatusClass(status) {
  const value = String(status || '').toUpperCase();
  if (value === 'CONFIRMED' || value === 'ARRIVED' || value === 'CHECKED_IN' || value === 'COMPLETED') return 'success';
  if (value === 'PENDING') return 'pending';
  if (value === 'CANCELLED' || value === 'EXPIRED') return 'danger';
  return 'muted';
}

function orderStatusClass(status) {
  const value = String(status || '').toUpperCase();
  if (value === 'COMPLETED') return 'completed';
  if (value === 'PENDING') return 'pending';
  if (value === 'CONFIRMED' || value === 'PREPARING' || value === 'READY') return 'warning';
  if (value === 'CANCELLED') return 'danger';
  return 'muted';
}

function paymentStatusClass(status) {
  const value = String(status || '').toUpperCase();
  if (value === 'PAID' || value === 'SUCCESS') return 'success';
  if (value === 'UNPAID' || value === 'PENDING') return 'pending';
  if (value === 'FAILED' || value === 'REFUNDED') return 'danger';
  return 'muted';
}

function toast(type, title, text) {
  state.toast.push({ id: crypto.randomUUID(), type, title, text });
  render();
  window.clearTimeout(state.toastTimer);
  state.toastTimer = window.setTimeout(() => {
    state.toast.shift();
    render();
  }, 3200);
}

async function api(path, options = {}) {
  const headers = { ...(options.headers || {}) };
  if (state.token) {
    headers.Authorization = `Bearer ${state.token}`;
  }
  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });
  const raw = await response.text();
  const body = raw ? safeParseJson(raw) : null;

  if (!response.ok) {
    const error = new Error(body?.message || body?.error || raw || `Request failed with status ${response.status}`);
    error.status = response.status;
    error.body = body;
    throw error;
  }

  return body;
}

function safeParseJson(text) {
  try {
    return JSON.parse(text);
  } catch (error) {
    return null;
  }
}

async function uploadImage(file) {
  const formData = new FormData();
  formData.append('image', file);
  const result = await api('/api/upload/image', { method: 'POST', body: formData });
  return result.imageUrl;
}

async function boot() {
  if (!state.token) {
    render();
    return;
  }

  state.loading = true;
  render();

  try {
    await loadAllData();
    if (state.user?.role !== 'ADMIN') {
      toast('danger', 'Tài khoản không đủ quyền', 'Vui lòng đăng nhập bằng tài khoản ADMIN để sử dụng trang quản trị.');
      clearAuth();
      render();
      return;
    }
    render();
  } catch (error) {
    handleAuthError(error);
  } finally {
    state.loading = false;
    render();
  }
}

async function loadAllData() {
  const statsQuery = new URLSearchParams();
  statsQuery.set('type', state.statsQuery.type);
  if (state.statsQuery.date) {
    statsQuery.set('date', state.statsQuery.date);
  }

  const requests = {
    users: api('/api/users'),
    categories: api('/api/categories'),
    products: api('/api/products'),
    tables: api('/api/tables'),
    reservations: api('/api/reservations'),
    orders: api('/api/orders'),
    reviews: api('/api/reviews?page=1&limit=200'),
    stats: api(`/api/stats?${statsQuery.toString()}`)
  };

  const entries = await Promise.all(
    Object.entries(requests).map(async ([key, promise]) => {
      try {
        return [key, await promise];
      } catch (error) {
        return [key, { __error: error.message }];
      }
    })
  );

  for (const [key, value] of entries) {
    state.data[key] = value;
  }
}

function clearAuth() {
  state.token = '';
  state.user = null;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

function persistAuth(token, user) {
  state.token = token;
  state.user = user;
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

function handleAuthError(error) {
  if (error?.status === 401 || error?.status === 403) {
    clearAuth();
    toast('danger', 'Phiên đăng nhập hết hạn', 'Vui lòng đăng nhập lại bằng tài khoản quản trị.');
    render();
    return;
  }
  toast('danger', 'Lỗi tải dữ liệu', error.message || 'Không thể tải dữ liệu quản trị.');
}

function render() {
  if (!state.token) {
    app.innerHTML = renderLogin();
    bindLogin();
    renderToasts();
    return;
  }

  if (state.user?.role !== 'ADMIN') {
    app.innerHTML = renderNonAdmin();
    renderToasts();
    return;
  }

  app.innerHTML = `
    <div class="layout">
      <aside class="sidebar">
        <div class="brand-area">
          <div class="brand-badge"><span class="brand-mark"></span> AppDatMon AdminLTE</div>
          <h1 class="brand-title">Admin Dashboard</h1>
        </div>

        <div class="admin-brand-card">
          <div class="avatar avatar-lg">${escapeHtml(userInitials(state.user))}</div>
          <div>
            <div class="user-name">${escapeHtml(state.user?.fullName || state.user?.username || 'Admin')}</div>
            <div class="user-role">${escapeHtml(state.user?.role || 'ADMIN')}</div>
          </div>
        </div>

        <nav class="nav-list" aria-label="Navigation">
          ${navItem('overview')}
          ${navItem('users')}
          ${navItem('categories')}
          ${navItem('products')}
          ${navItem('tables')}
          ${navItem('reservations')}
          ${navItem('orders')}
          ${navItem('reviews')}
          ${navItem('stats')}
        </nav>

        <div class="sidebar-footer">
          <div class="user-chip">
            <div class="avatar">${state.user?.avatar ? `<img src="${escapeHtml(state.user.avatar)}" alt="avatar" />` : escapeHtml(userInitials(state.user))}</div>
            <div>
              <div class="user-name">${escapeHtml(state.user?.fullName || state.user?.username || 'Admin')}</div>
              <div class="user-role">${escapeHtml(state.user?.role || 'ADMIN')}</div>
            </div>
          </div>
          <button class="btn btn-ghost" data-action="logout">Đăng xuất</button>
        </div>
      </aside>

      <main class="main">
        <header class="topbar">
          <div class="page-copy">
            <h2 class="page-title">${escapeHtml(VIEW_META[state.activeView].title)}</h2>
            <div class="page-subtitle">${escapeHtml(VIEW_META[state.activeView].description)}</div>
          </div>
          <div class="topbar-meta">
            <div class="breadcrumb-lite">
              <span>AdminLTE</span>
              <i class="fa-solid fa-angle-right"></i>
              <span>${escapeHtml(VIEW_META[state.activeView].title)}</span>
            </div>
            <button class="btn btn-secondary btn-small" data-action="refresh-all">Làm mới dữ liệu</button>
            <div class="badge-inline">JWT • ${escapeHtml(state.user?.username || 'admin')}</div>
          </div>
        </header>

        ${renderActiveView()}
      </main>
    </div>
    ${renderModal()}
    <div class="toast-stack">${state.toast.map(renderToast).join('')}</div>
  `;

  bindGlobalEvents();
}

function renderNonAdmin() {
  return `
    <div class="auth-screen">
      <div class="auth-card" style="text-align:center">
        <div class="brand-badge"><span class="brand-mark"></span> AppDatMon AdminLTE</div>
        <h1 class="auth-title">Tài khoản không đủ quyền</h1>
        <p class="auth-copy">Trang này chỉ mở cho tài khoản có vai trò ADMIN. Hãy đăng nhập lại bằng tài khoản quản trị được seed sẵn.</p>
        <button class="btn btn-primary" data-action="logout">Đăng xuất</button>
      </div>
    </div>
  `;
}

function renderLogin() {
  return `
    <div class="auth-screen">
      <section class="auth-card">
        <div class="brand-badge"><span class="brand-mark"></span> AppDatMon AdminLTE</div>
        <h1 class="auth-title">Quản trị backend qua web</h1>
        <p class="auth-copy">Đăng nhập bằng tài khoản admin để quản lý người dùng, menu, bàn, đặt bàn, đơn hàng và đánh giá ngay trên cùng API.</p>
        <p class="form-hint">Đang kết nối tới ${escapeHtml(API_BASE_URL)}</p>
        <form class="auth-form" data-form="login">
          <div class="field">
            <label for="account">Tên đăng nhập hoặc số điện thoại</label>
            <input id="account" name="account" type="text" autocomplete="username" required placeholder="admin" />
          </div>
          <div class="field">
            <label for="password">Mật khẩu</label>
            <input id="password" name="password" type="password" autocomplete="current-password" required placeholder="123" />
          </div>
          <div class="auth-actions">
            <button type="submit" class="btn btn-primary">Đăng nhập</button>
            <span class="helper">Seed mặc định: admin / 123</span>
          </div>
        </form>
      </section>
    </div>
  `;
}

function navItem(view) {
  const active = state.activeView === view ? 'active' : '';
  const labelMap = {
    overview: 'Dashboard',
    users: 'Users',
    categories: 'Categories',
    products: 'Products',
    tables: 'Tables',
    reservations: 'Reservations',
    orders: 'Orders',
    reviews: 'Reviews',
    stats: 'Reports'
  };
  return `<button class="nav-item ${active}" data-action="switch-view" data-view="${view}"><span><i class="fa-solid ${NAV_ICONS[view]}"></i> ${labelMap[view]}</span><small>${view}</small></button>`;
}

function renderActiveView() {
  if (state.loading) {
    return `
      <section class="panel loading-state">
        <div class="spinner"></div>
        <p>Đang tải dữ liệu quản trị...</p>
      </section>
    `;
  }

  if (state.activeView === 'overview') {
    return renderOverview();
  }

  if (state.activeView === 'stats') {
    return renderStats();
  }

  return renderEntityView(state.activeView);
}

function renderOverview() {
  const cards = [
    { label: 'Người dùng', value: state.data.users?.length || 0, note: 'Tài khoản trong hệ thống' },
    { label: 'Danh mục', value: state.data.categories?.length || 0, note: 'Nhóm món đang hiển thị' },
    { label: 'Sản phẩm', value: state.data.products?.length || 0, note: 'Món ăn và đồ uống' },
    { label: 'Đơn hàng', value: state.data.orders?.length || 0, note: 'Lịch sử bán hàng' }
  ];

  const stats = state.data.stats;

  return `
    <section class="metric-grid">
      ${cards.map(card => `
        <article class="metric-card">
          <div class="metric-note">${escapeHtml(card.label)}</div>
          <h3 class="metric-value">${formatNumber(card.value)}</h3>
          <div class="metric-note">${escapeHtml(card.note)}</div>
        </article>
      `).join('')}
    </section>

    <section class="grid-2">
      <article class="panel overview-grid">
        <div class="section-head">
          <div>
            <h3 class="section-title">Tình trạng hệ thống</h3>
            <p class="section-description">Tổng hợp nhanh các điểm quản trị chính để theo dõi mỗi ngày.</p>
          </div>
        </div>
        <div class="stats-line">
          <div class="stat-box"><span>Khách đang đánh giá</span><strong>${formatNumber(state.data.reviews?.reviews?.length || state.data.reviews?.length || 0)}</strong></div>
          <div class="stat-box"><span>Bàn trong hệ thống</span><strong>${formatNumber(state.data.tables?.length || 0)}</strong></div>
          <div class="stat-box"><span>Lịch đặt bàn</span><strong>${formatNumber(state.data.reservations?.length || 0)}</strong></div>
          <div class="stat-box"><span>Doanh thu hôm nay</span><strong>${formatCurrency(stats?.totalRevenue || 0)}</strong></div>
        </div>
      </article>

      <article class="panel">
        <div class="section-head">
          <div>
            <h3 class="section-title">Lối tắt nhanh</h3>
            <p class="section-description">Đi vào từng khu vực dữ liệu để thực hiện CRUD.</p>
          </div>
        </div>
        <div class="card-list">
          ${['users', 'categories', 'products', 'tables', 'reservations', 'orders', 'reviews', 'stats'].map(view => `
            <button class="info-row btn btn-ghost" data-action="switch-view" data-view="${view}">
              <strong>${escapeHtml(VIEW_META[view].title)}</strong>
              <span>Mở</span>
            </button>
          `).join('')}
        </div>
      </article>
    </section>

    <section class="panel">
      <div class="section-head">
        <div>
          <h3 class="section-title">Thống kê nhanh</h3>
          <p class="section-description">Dữ liệu được lấy từ endpoint thống kê hiện có.</p>
        </div>
      </div>
      <div class="kpi-stack">
        <div class="metric-card">
          <div class="metric-note">Tổng đơn hoàn thành</div>
          <h3 class="metric-value">${formatNumber(stats?.totalOrders || 0)}</h3>
        </div>
        <div class="metric-card">
          <div class="metric-note">Tổng doanh thu</div>
          <h3 class="metric-value">${formatCurrency(stats?.totalRevenue || 0)}</h3>
        </div>
      </div>
    </section>
  `;
}

function renderStats() {
  const stats = state.data.stats || {};
  return `
    <section class="panel view-grid">
      <div class="section-head">
        <div>
          <h3 class="section-title">Bộ lọc thời gian</h3>
          <p class="section-description">Chọn ngày, tháng hoặc năm để xem báo cáo doanh thu.</p>
        </div>
      </div>

      <form class="stats-filters" data-form="stats-filter">
        <div class="field" style="min-width: 160px">
          <label for="statsType">Kiểu thống kê</label>
          <select id="statsType" name="type">
            <option value="day" ${state.statsQuery.type === 'day' ? 'selected' : ''}>Theo ngày</option>
            <option value="month" ${state.statsQuery.type === 'month' ? 'selected' : ''}>Theo tháng</option>
            <option value="year" ${state.statsQuery.type === 'year' ? 'selected' : ''}>Theo năm</option>
          </select>
        </div>
        <div class="field" style="min-width: 220px">
          <label for="statsDate">Ngày tham chiếu</label>
          <input id="statsDate" name="date" type="date" value="${escapeHtml(state.statsQuery.date)}" />
        </div>
        <div class="view-actions" style="align-self:end">
          <button type="submit" class="btn btn-primary">Áp dụng</button>
          <button type="button" class="btn btn-secondary" data-action="stats-reset">Reset</button>
        </div>
      </form>
    </section>

    <section class="metric-grid">
      <article class="metric-card">
        <div class="metric-note">Loại thống kê</div>
        <h3 class="metric-value" style="font-size:1.6rem">${escapeHtml(stats.type || state.statsQuery.type)}</h3>
      </article>
      <article class="metric-card">
        <div class="metric-note">Tổng đơn</div>
        <h3 class="metric-value">${formatNumber(stats.totalOrders || 0)}</h3>
      </article>
      <article class="metric-card">
        <div class="metric-note">Tổng doanh thu</div>
        <h3 class="metric-value">${formatCurrency(stats.totalRevenue || 0)}</h3>
      </article>
      <article class="metric-card">
        <div class="metric-note">Khoảng thời gian</div>
        <h3 class="metric-value" style="font-size:1.1rem; line-height:1.5">${escapeHtml(formatDateTime(stats.startDate || ''))} - ${escapeHtml(formatDateTime(stats.endDate || ''))}</h3>
      </article>
    </section>

    <section class="panel">
      <div class="section-head">
        <div>
          <h3 class="section-title">Kết quả</h3>
          <p class="section-description">Thông tin thống kê lấy từ backend theo ngày/tháng/năm đã chọn.</p>
        </div>
      </div>
      <div class="info-list">
        <div class="info-row"><strong>Tổng số đơn hoàn thành</strong><span>${formatNumber(stats.totalOrders || 0)}</span></div>
        <div class="info-row"><strong>Tổng doanh thu</strong><span>${formatCurrency(stats.totalRevenue || 0)}</span></div>
        <div class="info-row"><strong>Từ ngày</strong><span>${escapeHtml(formatDateTime(stats.startDate || ''))}</span></div>
        <div class="info-row"><strong>Đến ngày</strong><span>${escapeHtml(formatDateTime(stats.endDate || ''))}</span></div>
      </div>
    </section>
  `;
}

function renderEntityView(view) {
  const config = ENTITY_CONFIGS[view];
  const records = getFilteredRecords(view, state.data[view]);
  const counts = records.length;
  const searchValue = state.filters[view] || '';

  return `
    <section class="panel view-grid">
      <div class="section-head">
        <div>
          <h3 class="section-title">${escapeHtml(VIEW_META[view].title)}</h3>
          <p class="section-description">${escapeHtml(VIEW_META[view].description)}</p>
        </div>
        <div class="view-actions">
          ${config.allowCreate ? `<button class="btn btn-primary" data-action="create-record" data-view="${view}">${escapeHtml(config.createLabel)}</button>` : ''}
          <span class="badge-inline">${formatNumber(counts)} bản ghi</span>
        </div>
      </div>

      <div class="search-bar">
        <input type="search" placeholder="Tìm kiếm nhanh..." value="${escapeHtml(searchValue)}" data-action="search-input" data-view="${view}" />
        <button class="btn btn-secondary btn-small" data-action="clear-search" data-view="${view}">Xóa lọc</button>
        <span class="helper">${config.searchKey === 'search' ? 'Backend hỗ trợ tìm kiếm qua query param search.' : 'Lọc được xử lý ngay trên giao diện.'}</span>
      </div>
    </section>

    <section class="panel">
      ${renderDataTable(view, records)}
    </section>
  `;
}

function getFilteredRecords(view, records) {
  const list = Array.isArray(records) ? records : (records?.reviews || []);
  const query = (state.filters[view] || '').trim().toLowerCase();
  if (!query) return list;
  return list.filter(record => JSON.stringify(record).toLowerCase().includes(query));
}

function renderDataTable(view, records) {
  if (records?.__error) {
    return `<div class="error-state"><strong>Lỗi tải dữ liệu</strong><p>${escapeHtml(records.__error)}</p></div>`;
  }

  if (!records || records.length === 0) {
    return `<div class="empty-state"><strong>Chưa có dữ liệu</strong><p>Không có bản ghi nào cho mục này.</p></div>`;
  }

  if (view === 'reviews') {
    return renderReviewsTable(records);
  }

  if (view === 'orders') {
    return renderOrdersTable(records);
  }

  const columns = ENTITY_CONFIGS[view].columns;
  return `
    <div class="table-wrap">
      <table class="data-table">
        <thead>
          <tr>
            ${columns.map(column => `<th>${escapeHtml(column.label)}</th>`).join('')}
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          ${records.map(record => renderEntityRow(view, record)).join('')}
        </tbody>
      </table>
    </div>
  `;
}

function renderEntityRow(view, record) {
  const config = ENTITY_CONFIGS[view];
  const cells = config.columns.map(column => `<td>${column.render(record)}</td>`).join('');
  return `
    <tr>
      ${cells}
      <td>
        <div class="row-actions">
          ${config.allowEdit ? `<button class="btn btn-secondary btn-small" data-action="edit-record" data-view="${view}" data-id="${record.id}">Sửa</button>` : ''}
          ${config.allowDelete ? `<button class="btn btn-danger btn-small" data-action="delete-record" data-view="${view}" data-id="${record.id}">Xóa</button>` : ''}
          ${renderCustomRowActions(view, record)}
        </div>
      </td>
    </tr>
  `;
}

function renderCustomRowActions(view, record) {
  if (view === 'tables') {
    return `
      <select class="inline-input" style="width:auto" data-action="table-status-select" data-id="${record.id}">
        ${['AVAILABLE', 'BOOKED', 'OCCUPIED', 'CLEANING'].map(status => `<option value="${status}" ${String(record.status).toUpperCase() === status ? 'selected' : ''}>${status}</option>`).join('')}
      </select>
      <button class="btn btn-secondary btn-small" data-action="save-table-status" data-id="${record.id}">Cập nhật</button>
    `;
  }

  if (view === 'reservations') {
    return `
      <button class="btn btn-secondary btn-small" data-action="reservation-checkin" data-id="${record.id}">Check-in</button>
      <button class="btn btn-ghost btn-small" data-action="reservation-cancel" data-id="${record.id}">Hủy</button>
    `;
  }

  if (view === 'products') {
    return `<span class="badge-inline">#${record.id}</span>`;
  }

  return '';
}

function renderOrdersTable(records) {
  return `
    <div class="table-wrap">
      <table class="data-table">
        <thead>
          <tr>
            <th>Mã đơn</th>
            <th>Khách</th>
            <th>Bàn</th>
            <th>Tổng tiền</th>
            <th>Thanh toán</th>
            <th>Trạng thái</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          ${records.map(record => `
            <tr>
              <td>#${record.id}</td>
              <td>${escapeHtml(record.User?.fullName || record.user_id ? (record.User?.fullName || `#${record.user_id}`) : 'Khách vãng lai')}</td>
              <td>${escapeHtml(record.RestaurantTable?.tableNumber ? `#${record.RestaurantTable.tableNumber}` : record.table_id ? `#${record.table_id}` : '-')}</td>
              <td>${formatCurrency(record.finalPrice ?? record.totalPrice)}</td>
              <td>${statusChip(paymentStatusClass(record.paymentStatus), record.paymentStatus)}</td>
              <td>
                <select class="inline-input" style="width:auto" data-action="order-status-select" data-id="${record.id}">
                  ${['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'COMPLETED', 'CANCELLED'].map(status => `<option value="${status}" ${String(record.status).toUpperCase() === status ? 'selected' : ''}>${status}</option>`).join('')}
                </select>
              </td>
              <td>
                <div class="row-actions">
                  <button class="btn btn-secondary btn-small" data-action="save-order-status" data-id="${record.id}">Lưu</button>
                  <button class="btn btn-primary btn-small" data-action="pay-order" data-id="${record.id}">Thanh toán</button>
                  <button class="btn btn-danger btn-small" data-action="delete-record" data-view="orders" data-id="${record.id}">Xóa</button>
                  <button class="btn btn-ghost btn-small" data-action="toggle-order-detail" data-id="${record.id}">Chi tiết</button>
                </div>
              </td>
            </tr>
            <tr class="hidden" data-order-detail="${record.id}">
              <td colspan="7">
                <div class="mini-card">
                  <h4 class="mini-card-title">Chi tiết đơn #${record.id}</h4>
                  <p class="mini-card-copy">${escapeHtml(record.note || 'Không có ghi chú')}</p>
                  <div class="info-list" style="margin-top:0.8rem">
                    ${(record.OrderItems || []).map(item => `
                      <div class="info-row">
                        <strong>${escapeHtml(item.Product?.name || `#${item.product_id}`)} x${item.quantity}</strong>
                        <span>${formatCurrency(item.totalPrice || 0)}</span>
                      </div>
                    `).join('')}
                  </div>
                </div>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

function renderReviewsTable(records) {
  const list = Array.isArray(records?.reviews) ? records.reviews : records;
  return `
    <div class="table-wrap">
      <table class="data-table">
        <thead>
          <tr>
            <th>Người đánh giá</th>
            <th>Món</th>
            <th>Nội dung</th>
            <th>Số sao</th>
            <th>Ngày tạo</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          ${list.map(record => `
            <tr>
              <td>${escapeHtml(record.user?.fullName || record.phone || '-')}</td>
              <td>${escapeHtml(record.dish_name || '-')}</td>
              <td>${escapeHtml(record.content || '-')}</td>
              <td>${escapeHtml('★'.repeat(record.rating || 0))}</td>
              <td>${escapeHtml(formatDateTime(record.created_at || record.createdAt))}</td>
              <td><button class="btn btn-danger btn-small" data-action="delete-record" data-view="reviews" data-id="${record.id}">Xóa</button></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

function renderModal() {
  if (!state.modal) return '';
  if (state.modal.kind === 'generic-form') {
    return `
      <div class="modal-backdrop" data-action="close-modal">
        <div class="modal-card" data-action="stop-propagation">
          <div class="modal-head">
            <div>
              <h3 class="modal-title">${escapeHtml(state.modal.title)}</h3>
              <div class="subtle">${escapeHtml(state.modal.subtitle || '')}</div>
            </div>
            <button class="btn btn-ghost btn-small" data-action="close-modal">Đóng</button>
          </div>
          <form class="modal-body" data-form="entity" data-view="${state.modal.view}" data-mode="${state.modal.mode}" data-id="${state.modal.record?.id || ''}">
            ${renderEntityFields(state.modal.view, state.modal.record)}
            <div class="modal-actions">
              <button type="submit" class="btn btn-primary">${state.modal.mode === 'edit' ? 'Lưu thay đổi' : 'Tạo mới'}</button>
              <button type="button" class="btn btn-secondary" data-action="close-modal">Hủy</button>
            </div>
          </form>
        </div>
      </div>
    `;
  }

  if (state.modal.kind === 'order-form') {
    return renderOrderModal();
  }

  if (state.modal.kind === 'reservation-form') {
    return renderReservationModal();
  }

  if (state.modal.kind === 'bulk-tables') {
    return renderTableBulkModal();
  }

  return '';
}

function renderEntityFields(view, record) {
  const config = ENTITY_CONFIGS[view];
  const payload = config.payload ? config.payload(record || {}) : {};

  return `
    <div class="modal-grid">
      ${config.fields.map(field => renderField(view, field, payload[field.name], record)).join('')}
    </div>
  `;
}

function renderField(view, field, value, record) {
  if (field.onlyOnEdit && !record) return '';
  if (field.requiredOnCreate && record) {
    field = { ...field, required: false };
  }

  if (field.type === 'checkbox') {
    return `
      <div class="field">
        <label>
          <input type="checkbox" name="${field.name}" ${value ? 'checked' : ''} />
          ${escapeHtml(field.label)}
        </label>
        ${field.helper ? `<div class="form-hint">${escapeHtml(field.helper)}</div>` : ''}
      </div>
    `;
  }

  if (field.type === 'select') {
    const options = typeof field.options === 'function' ? field.options(state) : field.options;
    return `
      <div class="field">
        <label for="${field.name}">${escapeHtml(field.label)}</label>
        <select id="${field.name}" name="${field.name}" ${field.required ? 'required' : ''}>
          ${field.placeholder ? `<option value="">${escapeHtml(field.placeholder)}</option>` : ''}
          ${(options || []).map(option => {
            if (typeof option === 'string') {
              return `<option value="${escapeHtml(option)}" ${String(value) === option ? 'selected' : ''}>${escapeHtml(option)}</option>`;
            }
            return `<option value="${escapeHtml(option.value)}" ${String(value) === String(option.value) ? 'selected' : ''}>${escapeHtml(option.label)}</option>`;
          }).join('')}
        </select>
        ${field.helper ? `<div class="form-hint">${escapeHtml(field.helper)}</div>` : ''}
      </div>
    `;
  }

  if (field.type === 'textarea') {
    return `
      <div class="field full">
        <label for="${field.name}">${escapeHtml(field.label)}</label>
        <textarea id="${field.name}" name="${field.name}" placeholder="${escapeHtml(field.placeholder || '')}" ${field.required ? 'required' : ''}>${escapeHtml(value || '')}</textarea>
        ${field.helper ? `<div class="form-hint">${escapeHtml(field.helper)}</div>` : ''}
      </div>
    `;
  }

  if (field.type === 'image') {
    return `
      <div class="field full">
        <label for="${field.name}">${escapeHtml(field.label)}</label>
        <input id="${field.name}" name="${field.name}" type="text" value="${escapeHtml(value || '')}" placeholder="/uploads/... hoặc URL ảnh" />
        <input name="${field.name}File" type="file" accept="image/*" />
        <div class="form-hint">Chọn file để upload tự động hoặc dán trực tiếp URL ảnh.</div>
        ${value ? `<div class="image-preview"><img src="${escapeHtml(value)}" alt="${escapeHtml(field.label)}" /></div>` : ''}
      </div>
    `;
  }

  const inputType = field.type === 'datetime-local' ? 'datetime-local' : field.type;
  const inputValue = field.type === 'datetime-local' ? toDatetimeLocal(value) : value ?? '';

  return `
    <div class="field ${field.full ? 'full' : ''}">
      <label for="${field.name}">${escapeHtml(field.label)}</label>
      <input
        id="${field.name}"
        name="${field.name}"
        type="${inputType}"
        value="${escapeHtml(inputValue)}"
        ${field.min !== undefined ? `min="${field.min}"` : ''}
        ${field.step ? `step="${field.step}"` : ''}
        ${field.required ? 'required' : ''}
        placeholder="${escapeHtml(field.placeholder || '')}"
      />
      ${field.helper ? `<div class="form-hint">${escapeHtml(field.helper)}</div>` : ''}
    </div>
  `;
}

function toDatetimeLocal(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60000);
  return local.toISOString().slice(0, 16);
}

function renderOrderModal() {
  const tables = state.data.tables || [];
  const products = state.data.products || [];
  const defaultItems = [
    { product_id: products[0]?.id || '', quantity: 1, note: '' }
  ];

  return `
    <div class="modal-backdrop" data-action="close-modal">
      <div class="modal-card" data-action="stop-propagation">
        <div class="modal-head">
          <div>
            <h3 class="modal-title">Tạo đơn hàng</h3>
            <div class="subtle">Đơn hàng mới sẽ được tạo trực tiếp qua endpoint hiện có.</div>
          </div>
          <button class="btn btn-ghost btn-small" data-action="close-modal">Đóng</button>
        </div>

        <form class="modal-body" data-form="order-create">
          <div class="modal-grid">
            <div class="field">
              <label for="orderTable">Bàn</label>
              <select id="orderTable" name="table_id">
                <option value="">Khách mang đi / chưa gán bàn</option>
                ${tables.map(table => `<option value="${table.id}">#${table.tableNumber} • ${escapeHtml(table.status)}</option>`).join('')}
              </select>
            </div>
            <div class="field">
              <label for="orderPoints">Điểm dùng</label>
              <input id="orderPoints" name="used_points" type="number" min="0" step="1" value="0" />
            </div>
            <div class="field full">
              <label for="orderNote">Ghi chú</label>
              <textarea id="orderNote" name="note" placeholder="Ghi chú cho bếp hoặc thu ngân"></textarea>
            </div>
          </div>

          <div>
            <div class="section-head" style="margin-bottom:0.6rem">
              <div>
                <h4 class="section-title" style="font-size:1.08rem">Món trong đơn</h4>
                <p class="section-description">Thêm nhiều món để gửi đúng payload items cho backend.</p>
              </div>
              <button type="button" class="btn btn-secondary btn-small" data-action="add-order-item">Thêm món</button>
            </div>
            <div class="card-list" data-order-items>
              ${defaultItems.map((item, index) => renderOrderItemRow(index, item)).join('')}
            </div>
          </div>

          <div class="note-box">Gợi ý: nếu muốn thanh toán ngay, hãy tạo đơn xong rồi quay lại tab Đơn hàng để đổi trạng thái và thanh toán.</div>

          <div class="modal-actions">
            <button type="submit" class="btn btn-primary">Tạo đơn</button>
            <button type="button" class="btn btn-secondary" data-action="close-modal">Hủy</button>
          </div>
        </form>
      </div>
    </div>
  `;
}

function renderOrderItemRow(index, item = {}) {
  const products = state.data.products || [];
  return `
    <div class="item-row" data-order-item="${index}">
      <div class="field">
        <label>Sản phẩm</label>
        <select name="product_id">
          ${products.map(product => `<option value="${product.id}" ${String(item.product_id) === String(product.id) ? 'selected' : ''}>${escapeHtml(product.name)} • ${formatCurrency(product.price)}</option>`).join('')}
        </select>
      </div>
      <div class="field small">
        <label>Số lượng</label>
        <input name="quantity" type="number" min="1" step="1" value="${item.quantity || 1}" />
      </div>
      <div class="field">
        <label>Ghi chú</label>
        <input name="note" type="text" value="${escapeHtml(item.note || '')}" placeholder="Ví dụ: ít cay" />
      </div>
      <button type="button" class="btn btn-danger btn-small" data-action="remove-order-item">Xóa</button>
    </div>
  `;
}

function renderReservationModal() {
  const users = state.data.users || [];
  return `
    <div class="modal-backdrop" data-action="close-modal">
      <div class="modal-card" data-action="stop-propagation">
        <div class="modal-head">
          <div>
            <h3 class="modal-title">Thêm đặt bàn</h3>
            <div class="subtle">Tạo lịch đặt mới qua endpoint hiện có của backend.</div>
          </div>
          <button class="btn btn-ghost btn-small" data-action="close-modal">Đóng</button>
        </div>

        <form class="modal-body" data-form="reservation-create">
          <div class="modal-grid">
            <div class="field">
              <label for="guestName">Tên khách</label>
              <input id="guestName" name="guestName" type="text" required />
            </div>
            <div class="field">
              <label for="guestPhone">Số điện thoại</label>
              <input id="guestPhone" name="guestPhone" type="text" required />
            </div>
            <div class="field">
              <label for="reservationTime">Thời gian</label>
              <input id="reservationTime" name="reservationTime" type="datetime-local" required />
            </div>
            <div class="field">
              <label for="numberOfGuests">Số khách</label>
              <input id="numberOfGuests" name="numberOfGuests" type="number" min="1" step="1" value="1" required />
            </div>
            <div class="field">
              <label for="user_id">Tài khoản liên kết</label>
              <select id="user_id" name="user_id">
                <option value="">Không liên kết</option>
                ${users.map(user => `<option value="${user.id}">${escapeHtml(user.fullName)} • ${escapeHtml(user.phone)}</option>`).join('')}
              </select>
            </div>
            <div class="field full">
              <label for="note">Ghi chú</label>
              <textarea id="note" name="note"></textarea>
            </div>
          </div>

          <div class="modal-actions">
            <button type="submit" class="btn btn-primary">Tạo đặt bàn</button>
            <button type="button" class="btn btn-secondary" data-action="close-modal">Hủy</button>
          </div>
        </form>
      </div>
    </div>
  `;
}

function renderTableBulkModal() {
  const template = JSON.stringify([
    { tableNumber: 1, qrCode: 'T1-001', capacity: 4, status: 'AVAILABLE' },
    { tableNumber: 2, qrCode: 'T2-002', capacity: 4, status: 'AVAILABLE' }
  ], null, 2);

  return `
    <div class="modal-backdrop" data-action="close-modal">
      <div class="modal-card" data-action="stop-propagation">
        <div class="modal-head">
          <div>
            <h3 class="modal-title">Nạp bàn hàng loạt</h3>
            <div class="subtle">Backend hiện tại chỉ hỗ trợ bulk create cho bàn, nên form này gửi một mảng JSON.</div>
          </div>
          <button class="btn btn-ghost btn-small" data-action="close-modal">Đóng</button>
        </div>

        <form class="modal-body" data-form="table-bulk-create">
          <div class="note-box">Mỗi phần tử cần có <strong>tableNumber</strong>, <strong>qrCode</strong>, <strong>capacity</strong> và <strong>status</strong>.</div>
          <div class="field full">
            <label for="tableBulkJson">JSON danh sách bàn</label>
            <textarea id="tableBulkJson" name="tableBulkJson">${escapeHtml(template)}</textarea>
          </div>
          <div class="modal-actions">
            <button type="submit" class="btn btn-primary">Nạp dữ liệu</button>
            <button type="button" class="btn btn-secondary" data-action="close-modal">Hủy</button>
          </div>
        </form>
      </div>
    </div>
  `;
}

function renderToast(item) {
  return `
    <div class="toast">
      <h4 class="toast-title">${escapeHtml(item.title)}</h4>
      <p class="toast-text">${escapeHtml(item.text)}</p>
    </div>
  `;
}

function renderToasts() {
  const existing = app.querySelector('.toast-stack');
  if (!existing) return;
  existing.innerHTML = state.toast.map(renderToast).join('');
}

function bindLogin() {
  const form = app.querySelector('[data-form="login"]');
  if (!form) return;
  form.addEventListener('submit', async event => {
    event.preventDefault();
    const formData = new FormData(form);
    const account = String(formData.get('account') || '').trim();
    const password = String(formData.get('password') || '');

    try {
      const result = await api('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ account, password })
      });
      persistAuth(result.token, result.user);
      toast('success', 'Đăng nhập thành công', `Xin chào ${result.user.fullName || result.user.username}`);
      await boot();
    } catch (error) {
      toast('danger', 'Đăng nhập thất bại', error.message || 'Không thể xác thực tài khoản.');
    }
  });
}

function bindGlobalEvents() {
  app.onclick = async event => {
    const target = event.target.closest('[data-action]');
    if (!target) return;

    const action = target.dataset.action;
    const view = target.dataset.view;
    const id = target.dataset.id;

    if (action !== 'close-modal' && action !== 'stop-propagation') {
      event.preventDefault();
    }

    if (action === 'stop-propagation') {
      event.stopPropagation();
      return;
    }

    try {
      switch (action) {
        case 'switch-view':
          state.activeView = view;
          render();
          break;
        case 'logout':
          clearAuth();
          toast('success', 'Đã đăng xuất', 'Phiên quản trị đã được xóa khỏi trình duyệt.');
          render();
          break;
        case 'refresh-all':
          state.loading = true;
          render();
          await loadAllData();
          state.loading = false;
          render();
          break;
        case 'create-record':
          openCreateModal(view);
          break;
        case 'edit-record':
          openEditModal(view, id);
          break;
        case 'delete-record':
          await deleteRecord(view, id);
          break;
        case 'close-modal':
          state.modal = null;
          render();
          break;
        case 'stats-reset':
          state.statsQuery = { type: 'day', date: '' };
          state.loading = true;
          render();
          await loadAllData();
          state.loading = false;
          render();
          break;
        case 'reservation-checkin':
          await simpleAction(`/api/reservations/${id}/check-in`, { method: 'PUT' }, 'Đã check-in đặt bàn');
          break;
        case 'reservation-cancel':
          await simpleAction(`/api/reservations/${id}/cancel`, { method: 'PUT' }, 'Đã hủy đặt bàn');
          break;
        case 'save-table-status': {
          const select = app.querySelector(`[data-action="table-status-select"][data-id="${id}"]`);
          const status = select?.value || 'AVAILABLE';
          await simpleAction(`/api/tables/${id}/status`, {
            method: 'PUT',
            body: JSON.stringify({ status })
          }, 'Đã cập nhật trạng thái bàn');
          break;
        }
        case 'order-status-select':
          break;
        case 'save-order-status': {
          const select = app.querySelector(`[data-action="order-status-select"][data-id="${id}"]`);
          const status = select?.value || 'PENDING';
          await simpleAction(`/api/orders/${id}/status`, {
            method: 'PUT',
            body: JSON.stringify({ status })
          }, 'Đã cập nhật trạng thái đơn');
          break;
        }
        case 'pay-order':
          await simpleAction(`/api/orders/${id}/pay`, {
            method: 'PUT',
            body: JSON.stringify({ paymentMethod: 'CASH' })
          }, 'Đơn đã được thanh toán');
          break;
        case 'table-status-select':
          break;
        case 'search-input':
          state.filters[view] = target.value;
          render();
          break;
        case 'clear-search':
          state.filters[view] = '';
          render();
          break;
        case 'add-order-item':
          addOrderItem();
          break;
        case 'remove-order-item':
          removeOrderItem(target.closest('.item-row'));
          break;
        case 'toggle-order-detail': {
          const detailRow = app.querySelector(`[data-order-detail="${id}"]`);
          if (detailRow) {
            detailRow.classList.toggle('hidden');
          }
          break;
        }
        default:
          break;
      }
    } catch (error) {
      toast('danger', 'Thao tác thất bại', error.message || 'Không thể thực hiện thao tác.');
    }
  };

  app.oninput = event => {
    const target = event.target;
    if (target.matches('[data-action="search-input"]')) {
      state.filters[target.dataset.view] = target.value;
      render();
    }
  };

  app.onsubmit = async event => {
    const form = event.target;
    const formName = form.dataset.form;
    if (!formName) return;
    event.preventDefault();

    try {
      if (formName === 'entity') {
        await submitEntityForm(form);
      } else if (formName === 'order-create') {
        await submitOrderForm(form);
      } else if (formName === 'reservation-create') {
        await submitReservationForm(form);
      } else if (formName === 'table-bulk-create') {
        await submitTableBulkForm(form);
      } else if (formName === 'stats-filter') {
        const formData = new FormData(form);
        state.statsQuery = {
          type: String(formData.get('type') || 'day'),
          date: String(formData.get('date') || '')
        };
        state.loading = true;
        render();
        await loadAllData();
        state.loading = false;
        render();
      }
    } catch (error) {
      toast('danger', 'Lưu thất bại', error.message || 'Không thể lưu dữ liệu.');
    }
  };
}

function openCreateModal(view) {
  const config = ENTITY_CONFIGS[view];
  if (config.customCreateMode === 'order') {
    state.modal = { kind: 'order-form' };
  } else if (config.customCreateMode === 'reservation') {
    state.modal = { kind: 'reservation-form' };
  } else if (config.customCreateMode === 'bulk-tables') {
    state.modal = { kind: 'bulk-tables' };
  } else {
    state.modal = {
      kind: 'generic-form',
      view,
      mode: 'create',
      title: config.createLabel,
      subtitle: `Tạo mới dữ liệu cho mục ${VIEW_META[view].title}.`,
      record: null
    };
  }
  render();
}

function openEditModal(view, id) {
  const config = ENTITY_CONFIGS[view];
  const record = (state.data[view] || []).find(item => String(item.id) === String(id));
  if (!record) {
    toast('danger', 'Không tìm thấy bản ghi', 'Bản ghi cần chỉnh sửa không tồn tại.');
    return;
  }

  state.modal = {
    kind: 'generic-form',
    view,
    mode: 'edit',
    title: `Sửa ${VIEW_META[view].title.toLowerCase()}`,
    subtitle: `Cập nhật trực tiếp bản ghi #${record.id}.`,
    record
  };
  render();
}

async function submitEntityForm(form) {
  const view = form.dataset.view;
  const mode = form.dataset.mode;
  const id = form.dataset.id;
  const config = ENTITY_CONFIGS[view];
  const payload = buildPayloadFromForm(form, config.fields, config.payload ? config.payload((mode === 'edit' ? state.data[view].find(item => String(item.id) === String(id)) : null) || {}) : {});
  const filePayload = await hydrateImageFields(form, config.fields, payload);
  const body = normalizePayload(view, filePayload, mode, id);

  const endpoint = mode === 'edit' ? `${config.endpoint}/${id}` : config.endpoint;
  const method = mode === 'edit' ? 'PUT' : 'POST';
  await api(endpoint, { method, body: JSON.stringify(body) });
  toast('success', 'Đã lưu dữ liệu', `${VIEW_META[view].title} đã được cập nhật.`);
  state.modal = null;
  await reloadAfterMutation();
}

function buildPayloadFromForm(form, fields, defaults = {}) {
  const formData = new FormData(form);
  const payload = { ...defaults };

  for (const field of fields) {
    if (field.type === 'image') {
      const textValue = String(formData.get(field.name) || '').trim();
      payload[field.name] = textValue;
      continue;
    }

    if (field.type === 'checkbox') {
      payload[field.name] = formData.has(field.name);
      continue;
    }

    if (field.type === 'select') {
      const raw = formData.get(field.name);
      payload[field.name] = raw === '' || raw === null ? '' : raw;
      continue;
    }

    const rawValue = formData.get(field.name);
    if (rawValue === null || rawValue === '') {
      if (field.requiredOnCreate) {
        continue;
      }
      payload[field.name] = defaults[field.name] ?? '';
      continue;
    }

    if (field.type === 'number') {
      payload[field.name] = Number(rawValue);
    } else {
      payload[field.name] = String(rawValue);
    }
  }

  return payload;
}

async function hydrateImageFields(form, fields, payload) {
  const nextPayload = { ...payload };
  const formData = new FormData(form);
  for (const field of fields.filter(item => item.type === 'image')) {
    const file = formData.get(`${field.name}File`);
    if (file instanceof File && file.size > 0) {
      nextPayload[field.name] = await uploadImage(file);
    }
  }
  return nextPayload;
}

function normalizePayload(view, payload, mode, id) {
  const body = { ...payload };

  if (view === 'users') {
    if (mode === 'edit' && !body.password) {
      delete body.password;
    }
    if (body.points !== undefined) {
      body.points = Number(body.points || 0);
    }
  }

  if (view === 'products') {
    body.price = Number(body.price || 0);
    body.stock = Number(body.stock || 0);
    body.category_id = Number(body.category_id || 0);
    body.isAvailable = Boolean(body.isAvailable);
  }

  if (view === 'categories') {
    body.name = String(body.name || '').trim();
  }

  if (view === 'reservations') {
    body.numberOfGuests = Number(body.numberOfGuests || 1);
    if (body.user_id === '') delete body.user_id;
  }

  if (view === 'orders') {
    body.table_id = body.table_id ? Number(body.table_id) : null;
    body.used_points = Number(body.used_points || 0);
  }

  return body;
}

function submitOrderForm(form) {
  const formData = new FormData(form);
  const itemRows = [...form.querySelectorAll('[data-order-item]')];
  const items = itemRows.map(row => {
    const productId = row.querySelector('[name="product_id"]')?.value;
    const quantity = Number(row.querySelector('[name="quantity"]')?.value || 1);
    const note = row.querySelector('[name="note"]')?.value || '';
    return {
      product_id: Number(productId),
      quantity,
      note
    };
  }).filter(item => item.product_id);

  if (!items.length) {
    throw new Error('Đơn hàng phải có ít nhất một món.');
  }

  const body = {
    table_id: formData.get('table_id') ? Number(formData.get('table_id')) : null,
    items,
    note: String(formData.get('note') || ''),
    used_points: Number(formData.get('used_points') || 0)
  };

  return api('/api/orders', {
    method: 'POST',
    body: JSON.stringify(body)
  }).then(() => {
    toast('success', 'Đã tạo đơn hàng', 'Đơn hàng mới đã được gửi tới backend.');
    state.modal = null;
    return reloadAfterMutation();
  });
}

function submitReservationForm(form) {
  const formData = new FormData(form);
  const body = {
    guestName: String(formData.get('guestName') || ''),
    guestPhone: String(formData.get('guestPhone') || ''),
    reservationTime: String(formData.get('reservationTime') || ''),
    numberOfGuests: Number(formData.get('numberOfGuests') || 1),
    note: String(formData.get('note') || '')
  };

  const userId = formData.get('user_id');
  if (userId) {
    body.user_id = Number(userId);
  }

  return api('/api/reservations', {
    method: 'POST',
    body: JSON.stringify(body)
  }).then(() => {
    toast('success', 'Đã tạo đặt bàn', 'Lịch đặt mới đã được lưu thành công.');
    state.modal = null;
    return reloadAfterMutation();
  });
}

function submitTableBulkForm(form) {
  const formData = new FormData(form);
  const raw = String(formData.get('tableBulkJson') || '');
  const tables = safeParseJson(raw);
  if (!Array.isArray(tables)) {
    throw new Error('JSON phải là một mảng các bàn.');
  }

  return api('/api/tables/bulk', {
    method: 'POST',
    body: JSON.stringify(tables)
  }).then(() => {
    toast('success', 'Đã nạp bàn', 'Danh sách bàn đã được đồng bộ vào backend.');
    state.modal = null;
    return reloadAfterMutation();
  });
}

function addOrderItem() {
  const list = app.querySelector('[data-order-items]');
  if (!list) return;
  const index = list.querySelectorAll('[data-order-item]').length;
  const wrapper = document.createElement('div');
  wrapper.innerHTML = renderOrderItemRow(index, { product_id: state.data.products?.[0]?.id || '', quantity: 1, note: '' });
  list.appendChild(wrapper.firstElementChild);
}

function removeOrderItem(row) {
  if (!row) return;
  const list = row.parentElement;
  if (!list || list.querySelectorAll('[data-order-item]').length <= 1) {
    toast('warning', 'Không thể xóa hết món', 'Đơn hàng cần ít nhất một món.');
    return;
  }
  row.remove();
}

async function deleteRecord(view, id) {
  const message = view === 'reviews'
    ? 'Bạn chắc chắn muốn xóa đánh giá này?'
    : `Bạn chắc chắn muốn xóa ${VIEW_META[view].title.toLowerCase()} #${id}?`;

  if (!window.confirm(message)) return;

  const config = ENTITY_CONFIGS[view];
  if (view === 'reviews') {
    await api(`/api/reviews/${id}`, { method: 'DELETE' });
  } else {
    await api(`${config.endpoint}/${id}`, { method: 'DELETE' });
  }

  toast('success', 'Đã xóa bản ghi', `${VIEW_META[view].title} đã được xóa thành công.`);
  await reloadAfterMutation();
}

async function simpleAction(path, options, successMessage) {
  await api(path, options);
  toast('success', 'Hoàn tất', successMessage);
  await reloadAfterMutation();
}

async function reloadAfterMutation() {
  state.loading = true;
  render();
  await loadAllData();
  state.loading = false;
  render();
}

render();
boot();
