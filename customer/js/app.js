const API_BASE = "http://localhost:3000";
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

/*==================================================
                HEADER
==================================================*/

function renderHeader() {

    return `

<header class="header">

    <div class="logo">

        <img src="./assets/logo.png">

        <span>FutureSuShi</span>

    </div>

    <nav>

        <a href="#hero">Trang chủ</a>

        <a href="#menu">Thực đơn</a>

        <a href="#about">Giới thiệu</a>

        <a href="#review">Đánh giá</a>

        <a href="#contact">Liên hệ</a>

    </nav>

    <div class="user-box">

        <i class="fa-solid fa-user"></i>

        <span>

            Xin chào,

            ${state.user?.fullName || "Khách"}

        </span>

        <button

            class="logout-btn"

            onclick="appHandlers.logout()">

            Đăng xuất

        </button>

    </div>

</header>

`;

}


/*==================================================
                HERO
==================================================*/

function renderHero(){

return`

<section

id="hero"

class="hero">

<div class="hero-overlay">

<h1>

FutureSuShi

</h1>

<h2>

Trọn vị Nhật Bản

</h2>

<p>

Thưởng thức tinh hoa ẩm thực Nhật Bản
với nguyên liệu tươi ngon mỗi ngày.

</p>

<div class="hero-buttons">

<button onclick="document.getElementById('menu').scrollIntoView({behavior:'smooth'})">

Xem Menu

</button>

<button onclick="document.getElementById('contact').scrollIntoView({behavior:'smooth'})">

Đặt bàn

</button>

</div>

</div>

<div class="hero-scroll">

<i class="fa-solid fa-angles-down"></i>

</div>

</section>

`;

}

/*==================================================
                ABOUT
==================================================*/

function renderAbout() {

    return `

<section id="about" class="about">

    <div class="container">

        <div class="about-left">

            <img src="./assets/about.jpg"
                 alt="FutureSuShi">

        </div>

        <div class="about-right">

            <span class="about-tag">

                FUTURESUSHI

            </span>

            <h2>

                Trải nghiệm ẩm thực Nhật Bản

            </h2>

            <p>

                FutureSuShi mang đến trải nghiệm ẩm thực Nhật Bản hiện đại,
                sử dụng nguyên liệu tươi ngon được tuyển chọn mỗi ngày,
                kết hợp cùng đội ngũ đầu bếp nhiều năm kinh nghiệm.

            </p>

            <div class="about-feature">

                <div>

                    <h3>100+</h3>

                    <span>Món ăn Nhật</span>

                </div>

                <div>

                    <h3>100%</h3>

                    <span>Nguyên liệu tươi</span>

                </div>

                <div>

                    <h3>5★</h3>

                    <span>Dịch vụ chất lượng</span>

                </div>

            </div>

        </div>

    </div>

</section>

`;

}

/*==================================================
                FEATURE
==================================================*/

function renderFeature(){

return`

<section class="feature">

<div class="container">

<div class="feature-grid">

<div class="feature-item">

<i class="fa-solid fa-fish"></i>

<h3>

Hải sản tươi

</h3>

<p>

Nhập mới mỗi ngày
đảm bảo độ tươi ngon.

</p>

</div>

<div class="feature-item">

<i class="fa-solid fa-bowl-food"></i>

<h3>

100+ món Nhật

</h3>

<p>

Sushi

Sashimi

Donburi

Udon

Tempura

</p>

</div>

<div class="feature-item">

<i class="fa-solid fa-store"></i>

<h3>

Không gian Nhật

</h3>

<p>

Thiết kế hiện đại,
ấm cúng và sang trọng.

</p>

</div>

</div>

</div>

</section>

`;

}

/*==================================================
                TABLE
==================================================*/

function renderTable(tableLabel) {

    return `

<section class="container">

    <div class="table-card">

        <div>

            <h2>

                🍣 Đặt món tại bàn

            </h2>

            <p>

                ${tableLabel}

            </p>

        </div>

        <div class="table-input">

            <input

                type="text"

                placeholder="Nhập mã QR hoặc số bàn"

                value="${state.tableInput}"

                oninput="appHandlers.setTableInput(this.value)"

            >

            <button

                onclick="appHandlers.loadTableFromInput()">

                Xác nhận

            </button>

        </div>

    </div>

</section>

`;

}

/*==================================================
                MENU
==================================================*/

function renderMenu(filteredProducts) {

    return `

<div class="panel menu-section" id="menu">

    <h2 class="section-title">

        🍣 Thực đơn FutureSuShi

    </h2>

    <div class="toolbar">

        <input
            type="text"
            placeholder="Tìm món ăn..."
            value="${state.searchTerm}"
            oninput="appHandlers.setSearchTerm(this.value)"
        >

        <select onchange="appHandlers.setCategory(this.value)">

            <option value="">Tất cả danh mục</option>

            ${state.categories.map(category => `

                <option
                    value="${category.id}"
                    ${String(state.selectedCategory) === String(category.id) ? "selected" : ""}
                >

                    ${category.name}

                </option>

            `).join("")}

        </select>

    </div>

    <div class="products-grid">

        ${filteredProducts.length
            ? filteredProducts.map(product => `

                <div class="product-card">

                    <div class="product-image">

                        <img
                            src="${product.image || "./assets/default-food.jpg"}"
                            alt="${product.name}"
                        >

                    </div>

                    <div class="product-content">

                        <h3>

                            ${product.name}

                        </h3>

                        <p>

                            ${product.description || "Món ăn chuẩn vị Nhật Bản"}

                        </p>

                        <div class="product-footer">

                            <span class="price">

                                ${Number(product.price).toLocaleString("vi-VN")}đ

                            </span>

                            <button
                                class="add-btn"
                                onclick="appHandlers.addToCart(${product.id})"
                            >

                                <i class="fa-solid fa-plus"></i>

                            </button>

                        </div>

                    </div>

                </div>

            `).join("")
            : `

            <div class="empty-menu">

                <h3>

                    Không có món ăn phù hợp

                </h3>

            </div>

        `}

    </div>

</div>

`;

}



/*==================================================
                CART
==================================================*/

function renderCart(subtotal){

    return `

<div class="cart-section">

    <h2>

        🛒 Giỏ hàng

    </h2>

    ${state.cart.length===0?`

        <div class="empty-cart">

            <i class="fa-solid fa-cart-shopping"></i>

            <p>

                Chưa có món ăn nào

            </p>

        </div>

    `:`

        <div class="cart-list">

            ${state.cart.map(item=>`

                <div class="cart-item">

                    <div>

                        <strong>

                            ${item.name}

                        </strong>

                        <br>

                        <small>

                            ${Number(item.price).toLocaleString("vi-VN")}đ

                        </small>

                    </div>

                    <div class="qty">

                        <button

                            onclick="appHandlers.changeQuantity(${item.id},-1)">

                            -

                        </button>

                        <span>

                            ${item.quantity}

                        </span>

                        <button

                            onclick="appHandlers.changeQuantity(${item.id},1)">

                            +

                        </button>

                    </div>

                </div>

            `).join("")}

        </div>

        <div class="cart-summary">

            <div class="summary-row">

                <span>

                    Số món

                </span>

                <span>

                    ${state.cart.reduce((a,b)=>a+b.quantity,0)}

                </span>

            </div>

            <div class="summary-total">

                <span>

                    Tổng cộng

                </span>

                <span>

                    ${subtotal.toLocaleString("vi-VN")}đ

                </span>

            </div>

            <button

                class="order-btn"

                onclick="appHandlers.submitOrder()">

                Đặt món

            </button>

        </div>

    `}

</div>

`;

}

/*=========================================
                FOOTER
=========================================*/

function renderFooter(){

return`

<footer
id="contact"
class="footer">

<div class="footer-content">

<div>

<div class="footer-logo">

<img src="./assets/logo.png">

</div>

<p>

FutureSuShi

<br>

Tinh hoa ẩm thực Nhật Bản.

</p>

</div>

<div>

<h2>

Liên hệ

</h2>

<ul>

<li>

📍 TP. Hồ Chí Minh

</li>

<li>

☎ 0123 456 789

</li>

<li>

✉ futuresushi@gmail.com

</li>

</ul>

</div>

<div>

<h2>

Giờ mở cửa

</h2>

<ul>

<li>

09:00 - 22:00

</li>

<li>

Thứ 2 - Chủ nhật

</li>

</ul>

</div>

<div>

<h2>

Theo dõi

</h2>

<div class="social">

<i class="fab fa-facebook-f"></i>

<i class="fab fa-instagram"></i>

<i class="fab fa-tiktok"></i>

</div>

</div>

</div>

<div class="footer-bottom">

© 2026 FutureSuShi

</div>

</footer>

`;

}





function renderHome() {

    const subtotal = state.cart.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
    );

    const tableLabel = state.table
        ? `Bàn ${state.table.tableNumber || state.table.id}`
        : "Chưa chọn bàn";

    const filteredProducts = getFilteredProducts();

    return `

        ${renderHeader()}

        ${renderHero()}

        ${renderAbout()}

        ${renderFeature()}

        ${renderTable(tableLabel)}

        <section class="container">

            <div class="main-layout">

                ${renderMenu(filteredProducts)}

                ${renderCart(subtotal)}

            </div>

        </section>

        ${renderFooter()}

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
  addToCart(productId) {

    const product = state.products.find(
        p => p.id === productId
    );

    if(product){

        addToCart(product);

    }

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
