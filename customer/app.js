const API_BASE = window.API_BASE_URL || window.location.origin;
const TOKEN_KEY = 'appdatmon_customer_token';
const USER_KEY = 'appdatmon_customer_user';
const app = document.getElementById('app');

const state = {
  user: JSON.parse(localStorage.getItem(USER_KEY) || 'null'),
  token: localStorage.getItem(TOKEN_KEY) || '',
  authMode: 'login',
  loading: false,
  products: [],
  categories: [],
  table: null,
  cart: [],
  error: '',
  success: '',
  tableQr: '',
  tableInput: '',
  selectedCategory: '',
  searchTerm: ''
};

function showToast(message, type = 'info') {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 2200);
}

function setMessage(type, message) {
  state.error = type === 'error' ? message : '';
  state.success = type === 'success' ? message : '';
  render();
}

async function api(path, options = {}) {
  const headers = {
    ...(options.body ? { 'Content-Type': 'application/json' } : {}),
    ...(state.token ? { Authorization: `Bearer ${state.token}` } : {})
  };
  const response = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || 'Yêu cầu thất bại');
  return data;
}

async function loadInitialData() {
  try {
    const [productsRes, categoriesRes] = await Promise.all([
      api('/api/products'),
      api('/api/categories')
    ]);
    state.products = productsRes || [];
    state.categories = categoriesRes || [];
  } catch (error) {
    console.error(error);
    showToast('Không thể tải menu. Vui lòng thử lại.');
  }
}

function getTableFromQr() {
  const params = new URLSearchParams(window.location.search);
  const qr = params.get('qr') || params.get('table') || state.tableQr;
  if (qr) {
    return qr;
  }
  return '';
}

async function loadTableByQr(qr) {
  if (!qr) return;
  try {
    state.table = await api(`/api/tables/qr/${encodeURIComponent(qr)}`);
    state.tableInput = qr;
    state.tableQr = qr;
  } catch (error) {
    state.table = null;
    showToast(error.message);
  }
}

async function loadTableFromInput() {
  const qr = state.tableInput.trim();
  if (!qr) {
    showToast('Vui lòng nhập mã QR bàn trước');
    return;
  }
  try {
    await loadTableByQr(qr);
    render();
    showToast(`Đã tải bàn ${state.table?.tableNumber || state.table?.id || qr}`);
  } catch (error) {
    showToast(error.message);
  }
}

function getFilteredProducts() {
  const search = state.searchTerm.trim().toLowerCase();
  return state.products.filter((product) => {
    const matchesCategory = !state.selectedCategory || String(product.category_id) === String(state.selectedCategory);
    const matchesSearch = !search || product.name?.toLowerCase().includes(search) || product.description?.toLowerCase().includes(search);
    return matchesCategory && matchesSearch;
  });
}

async function handleAuthSubmit(event) {
  event.preventDefault();
  const form = event.target;
  const formData = new FormData(form);
  const payload = Object.fromEntries(formData.entries());

  if (state.authMode === 'login') {
    const body = { account: payload.account, password: payload.password };
    try {
      const data = await api('/api/auth/login', { method: 'POST', body: JSON.stringify(body) });
      state.user = data.user;
      state.token = data.token;
      localStorage.setItem(TOKEN_KEY, data.token);
      localStorage.setItem(USER_KEY, JSON.stringify(data.user));
      setMessage('success', 'Đăng nhập thành công');
      await loadInitialData();
      const qr = getTableFromQr();
      if (qr) await loadTableByQr(qr);
    } catch (error) {
      setMessage('error', error.message);
    }
  } else {
    const body = {
      fullName: payload.fullName,
      email: payload.email,
      phone: payload.phone,
      username: payload.username,
      password: payload.password
    };
    try {
      await api('/api/auth/register', { method: 'POST', body: JSON.stringify(body) });
      setMessage('success', 'Đăng ký thành công. Bạn có thể đăng nhập ngay.');
      state.authMode = 'login';
      form.reset();
    } catch (error) {
      setMessage('error', error.message);
    }
  }
}

function addToCart(product) {
  const existing = state.cart.find(item => item.id === product.id);
  if (existing) {
    existing.quantity += 1;
  } else {
    state.cart.push({ id: product.id, name: product.name, price: Number(product.price), quantity: 1 });
  }
  render();
}

function changeQuantity(productId, delta) {
  const item = state.cart.find(i => i.id === productId);
  if (!item) return;
  item.quantity += delta;
  if (item.quantity <= 0) {
    state.cart = state.cart.filter(i => i.id !== productId);
  }
  render();
}

async function submitOrder() {
  if (!state.table?.id) {
    showToast('Vui lòng quét hoặc chọn bàn trước khi đặt món');
    return;
  }
  if (!state.cart.length) {
    showToast('Giỏ hàng đang trống');
    return;
  }

  try {
    const payload = {
      table_id: state.table.id,
      items: state.cart.map(item => ({ product_id: item.id, quantity: item.quantity })),
      note: 'Đặt món từ giao diện QR'
    };
    const data = await api('/api/orders', { method: 'POST', body: JSON.stringify(payload) });
    state.cart = [];
    render();
    showToast(data.message || 'Đặt món thành công');
  } catch (error) {
    showToast(error.message);
  }
}

function renderAuth() {
  const isLogin = state.authMode === 'login';
  return `
    <section class="auth-screen">
      <div class="auth-card card">
        <div class="badge"><i class="fa-solid fa-utensils"></i> AppDatMon</div>
        <h1 class="auth-title">${isLogin ? 'Đăng nhập' : 'Tạo tài khoản'}</h1>
        <p class="auth-copy">${isLogin ? 'Đăng nhập để đặt món nhanh qua QR và theo dõi đơn hàng.' : 'Tạo tài khoản khách hàng để sử dụng dịch vụ đặt món.'}</p>
        <form class="form-grid" id="auth-form" onsubmit="appHandlers.handleAuthSubmit(event)">
          ${!isLogin ? `
            <div class="field">
              <label>Họ tên</label>
              <input name="fullName" placeholder="Nhập họ tên" required />
            </div>
            <div class="field">
              <label>Email</label>
              <input name="email" type="email" placeholder="Nhập email" required />
            </div>
            <div class="field">
              <label>Số điện thoại</label>
              <input name="phone" placeholder="Nhập số điện thoại" required />
            </div>
            <div class="field">
              <label>Tên đăng nhập</label>
              <input name="username" placeholder="Nhập tên đăng nhập" required />
            </div>
          ` : ''}
          <div class="field">
            <label>${isLogin ? 'Tài khoản' : 'Tên đăng nhập'}</label>
            <input name="account" placeholder="${isLogin ? 'Số điện thoại hoặc tên đăng nhập' : 'Tên đăng nhập'}" required />
          </div>
          <div class="field">
            <label>Mật khẩu</label>
            <input name="password" type="password" placeholder="Nhập mật khẩu" required />
          </div>
          <button class="btn btn-primary btn-block" type="submit">${isLogin ? 'Đăng nhập' : 'Đăng ký'}</button>
          <div class="inline-actions">
            <span>${isLogin ? 'Chưa có tài khoản?' : 'Đã có tài khoản?'}</span>
            <span class="switch-link" onclick="appHandlers.toggleAuthMode()">${isLogin ? 'Đăng ký ngay' : 'Đăng nhập'}</span>
          </div>
          ${state.error ? `<div class="error">${state.error}</div>` : ''}
          ${state.success ? `<div class="success">${state.success}</div>` : ''}
        </form>
      </div>
    </section>
  `;
}

function renderHome() {
  const subtotal = state.cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tableLabel = state.table ? `Bàn #${state.table.tableNumber || state.table.id}` : 'Chưa chọn bàn';
  const filteredProducts = getFilteredProducts();
  return `
    <section class="home-screen container">
      <div class="topbar card">
        <div>
          <div class="badge"><i class="fa-solid fa-qrcode"></i> Đặt món qua QR</div>
          <h1 style="margin: 0.6rem 0 0.2rem; font-size: 1.45rem;">Xin chào, ${state.user?.fullName || 'khách hàng'}</h1>
          <p class="muted" style="margin: 0;">${tableLabel} • ${state.table?.qrCode || 'Quét QR hoặc nhập mã bàn để bắt đầu'}</p>
        </div>
        <button class="btn btn-secondary" onclick="appHandlers.logout()">Đăng xuất</button>
      </div>

      <div class="panel card table-panel">
        <div class="field">
          <label>Mã QR bàn</label>
          <div class="inline-qr">
            <input value="${state.tableInput}" placeholder="Ví dụ: TABLE-001 hoặc QR code" oninput="appHandlers.setTableInput(this.value)" />
            <button class="btn btn-primary" onclick="appHandlers.loadTableFromInput()">Tải bàn</button>
          </div>
        </div>
        <div class="muted small">Bạn có thể mở link theo mẫu /customer?qr=TABLE-001 hoặc nhập trực tiếp mã bàn ở đây.</div>
      </div>

      <div class="grid grid-2">
        <div class="panel card">
          <div class="menu-header">
            <h3 style="margin: 0;">Menu món ăn</h3>
            <div class="menu-toolbar">
              <input value="${state.searchTerm}" placeholder="Tìm món..." oninput="appHandlers.setSearchTerm(this.value)" />
              <select onchange="appHandlers.setCategory(this.value)">
                <option value="">Tất cả danh mục</option>
                ${state.categories.map(category => `<option value="${category.id}" ${state.selectedCategory === String(category.id) ? 'selected' : ''}>${category.name}</option>`).join('')}
              </select>
            </div>
          </div>
          <div class="products-grid">
            ${filteredProducts.length ? filteredProducts.map(product => `
              <article class="product-card">
                <div class="product-meta">
                  <strong>${product.name}</strong>
                  <span class="price">${Number(product.price).toLocaleString('vi-VN')}đ</span>
                </div>
                <div class="muted small">${product.description || 'Món ăn ngon và nóng hổi.'}</div>
                <button class="btn btn-primary" onclick="appHandlers.addToCart(${JSON.stringify(product)})">+ Thêm vào giỏ</button>
              </article>
            `).join('') : '<div class="empty-state">Không tìm thấy món phù hợp.</div>'}
          </div>
        </div>

        <div class="panel card">
          <h3 style="margin-top: 0;">Giỏ hàng</h3>
          <div class="cart-list">
            ${state.cart.length ? state.cart.map(item => `
              <div class="cart-item">
                <div>
                  <strong>${item.name}</strong>
                  <div class="muted small">${Number(item.price).toLocaleString('vi-VN')}đ</div>
                </div>
                <div class="qty-controls">
                  <button onclick="appHandlers.changeQuantity(${item.id}, -1)">-</button>
                  <span>${item.quantity}</span>
                  <button onclick="appHandlers.changeQuantity(${item.id}, 1)">+</button>
                </div>
              </div>
            `).join('') : '<div class="empty-state">Chọn món để bắt đầu.</div>'}
          </div>
          <div class="order-summary">
            <div class="row"><span>Tạm tính</span><strong>${subtotal.toLocaleString('vi-VN')}đ</strong></div>
            <button class="btn btn-primary btn-block" onclick="appHandlers.submitOrder()">Đặt món ngay</button>
          </div>
        </div>
      </div>
    </section>
  `;
}

function render() {
  app.innerHTML = state.user ? renderHome() : renderAuth();
}

const appHandlers = {
  toggleAuthMode() {
    state.authMode = state.authMode === 'login' ? 'register' : 'login';
    state.error = '';
    state.success = '';
    render();
  },
  async handleAuthSubmit(event) {
    await handleAuthSubmit(event);
  },
  addToCart(product) {
    addToCart(product);
  },
  changeQuantity(productId, delta) {
    changeQuantity(productId, delta);
  },
  async submitOrder() {
    await submitOrder();
  },
  setTableInput(value) {
    state.tableInput = value;
  },
  async loadTableFromInput() {
    await loadTableFromInput();
  },
  setCategory(value) {
    state.selectedCategory = value;
    render();
  },
  setSearchTerm(value) {
    state.searchTerm = value;
    render();
  },
  logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    state.user = null;
    state.token = '';
    state.cart = [];
    state.table = null;
    state.error = '';
    state.success = '';
    render();
  }
};

window.appHandlers = appHandlers;

(async function init() {
  const qr = getTableFromQr();
  state.tableQr = qr;
  if (state.user && state.token) {
    await loadInitialData();
    if (qr) await loadTableByQr(qr);
  }
  render();
})();
