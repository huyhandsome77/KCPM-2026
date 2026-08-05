const mockData = {
  products: [
    { id: 1, name: 'Gà chiên giòn', description: 'Gà tươi chiên giòn, sốt đặc biệt.', price: 125000, category: 'Món chính' },
    { id: 2, name: 'Mỳ xào hải sản', description: 'Hải sản tươi, mỳ mềm, rau củ giòn.', price: 98000, category: 'Hải sản' },
    { id: 3, name: 'Cơm sườn', description: 'Sườn nướng mật ong, cơm trắng thơm.', price: 88000, category: 'Món chính' },
    { id: 4, name: 'Salad trái cây', description: 'Salad mát lạnh với sốt chua ngọt.', price: 65000, category: 'Tráng miệng' }
  ],
  categories: ['Tất cả danh mục', 'Món chính', 'Hải sản', 'Tráng miệng']
};

function showToast(message, type = 'info') {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 2400);
}

function formatPrice(value) {
  return `${Number(value).toLocaleString('vi-VN')}₫`;
}

function initOrderPage() {
  const categoryFilter = document.getElementById('categoryFilter');
  const productGrid = document.getElementById('productGrid');
  const searchInput = document.getElementById('searchInput');
  const cartList = document.getElementById('cartList');
  const cartCount = document.getElementById('cartCount');
  const cartSubtotal = document.getElementById('cartSubtotal');
  const cartTotal = document.getElementById('cartTotal');
  const tableNumber = document.getElementById('tableNumber');
  const tableStatus = document.getElementById('tableStatus');
  const tableTime = document.getElementById('tableTime');
  const tableInput = document.getElementById('tableInput');
  const loadTableBtn = document.getElementById('loadTableBtn');
  const submitOrderBtn = document.getElementById('submitOrderBtn');
  const orderNote = document.getElementById('orderNote');

  let cart = [];
  let currentTable = null;

  function renderProducts() {
    const query = searchInput.value.trim().toLowerCase();
    const selectedCategory = categoryFilter.value;
    const products = mockData.products.filter((item) => {
      const matchesCategory = selectedCategory === '' || selectedCategory === 'Tất cả danh mục' || item.category === selectedCategory;
      const matchesSearch = item.name.toLowerCase().includes(query) || item.description.toLowerCase().includes(query);
      return matchesCategory && matchesSearch;
    });
    productGrid.innerHTML = products.map((product) => `
      <article class="product-card">
        <img src="https://images.unsplash.com/photo-1555992336-03a23c17b9a6?auto=format&fit=crop&w=900&q=60" alt="${product.name}" />
        <div class="product-meta"><strong>${product.name}</strong><span class="price">${formatPrice(product.price)}</span></div>
        <p class="muted small">${product.description}</p>
        <button class="btn btn-primary" type="button" data-product-id="${product.id}">Thêm vào giỏ</button>
      </article>
    `).join('');
    productGrid.querySelectorAll('[data-product-id]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const productId = Number(btn.dataset.productId);
        addToCart(productId);
      });
    });
  }

  function addToCart(productId) {
    const product = mockData.products.find((item) => item.id === productId);
    if (!product) return;
    const existing = cart.find((item) => item.id === productId);
    if (existing) existing.quantity += 1;
    else cart.push({ ...product, quantity: 1 });
    renderCart();
    showToast(`Đã thêm ${product.name} vào giỏ`);
  }

  function renderCart() {
    cartList.innerHTML = cart.length ? cart.map((item) => `
      <div class="cart-item">
        <div>
          <strong>${item.name}</strong>
          <div class="muted small">${formatPrice(item.price)}</div>
        </div>
        <div class="qty-controls">
          <button type="button" data-action="decrease" data-id="${item.id}">-</button>
          <span>${item.quantity}</span>
          <button type="button" data-action="increase" data-id="${item.id}">+</button>
        </div>
      </div>
    `).join('') : '<div class="empty-state">Chọn món để bắt đầu.</div>';

    cartList.querySelectorAll('button').forEach((button) => {
      button.addEventListener('click', () => {
        const id = Number(button.dataset.id);
        if (button.dataset.action === 'increase') updateQuantity(id, 1);
        else updateQuantity(id, -1);
      });
    });

    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const total = subtotal + 20000;
    cartCount.textContent = `${cart.reduce((sum, item) => sum + item.quantity, 0)} món`;
    cartSubtotal.textContent = formatPrice(subtotal);
    cartTotal.textContent = formatPrice(total);
  }

  function updateQuantity(productId, delta) {
    const item = cart.find((entry) => entry.id === productId);
    if (!item) return;
    item.quantity += delta;
    if (item.quantity <= 0) cart = cart.filter((entry) => entry.id !== productId);
    renderCart();
  }

  function loadTable() {
    const value = tableInput.value.trim();
    if (!value) {
      showToast('Vui lòng nhập mã bàn');
      return;
    }
    currentTable = {
      number: value.replace(/[^0-9]+/g, '') || '01',
      status: 'Sẵn sàng',
      time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    };
    tableNumber.textContent = `#${currentTable.number}`;
    tableStatus.textContent = currentTable.status;
    tableTime.textContent = currentTable.time;
    showToast(`Tải thành công bàn ${tableNumber.textContent}`, 'success');
  }

  loadTableBtn.addEventListener('click', loadTable);
  submitOrderBtn.addEventListener('click', () => {
    if (!cart.length) {
      showToast('Giỏ hàng đang trống', 'error');
      return;
    }
    if (!currentTable) {
      showToast('Vui lòng chọn bàn trước khi gửi order', 'error');
      return;
    }
    showToast('Order đã được gửi. Nhân viên sẽ xác nhận trong giây lát.', 'success');
    cart = [];
    renderCart();
    orderNote.value = '';
  });

  categoryFilter.innerHTML = mockData.categories.map((category) => `<option value="${category}">${category}</option>`).join('');
  searchInput.addEventListener('input', renderProducts);
  categoryFilter.addEventListener('change', renderProducts);
  renderProducts();
  renderCart();
}

function initBookingPage() {
  const form = document.getElementById('bookingForm');
  if (!form) return;
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    showToast('Yêu cầu đặt bàn đã được gửi. Chúng tôi sẽ xác nhận trong vòng 30 phút.', 'success');
    form.reset();
  });
}

function initReviewPage() {
  const form = document.querySelector('.form-section form');
  if (!form) return;
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    showToast('Cảm ơn bạn đã gửi đánh giá!', 'success');
    form.reset();
  });
}

function initContactPage() {
  const form = document.querySelector('.contact-form-panel form');
  if (!form) return;
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    showToast('Tin nhắn liên hệ đã được gửi tới nhà hàng.', 'success');
    form.reset();
  });
}

async function handleAuthFormSubmit(event) {
  event.preventDefault();
  const loginFields = document.getElementById('loginFields');
  const registerFields = document.getElementById('registerFields');
  const isLogin = !loginFields.classList.contains('hidden');

  if (isLogin) {
    const account = document.getElementById('loginAccount').value.trim();
    const password = document.getElementById('loginPassword').value.trim();

    if (!account || !password) {
      showToast('Vui lòng nhập tài khoản và mật khẩu', 'error');
      return;
    }

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ account, password })
      });
      const result = await response.json();
      if (!response.ok) {
        showToast(result.message || 'Đăng nhập thất bại', 'error');
        return;
      }
      localStorage.setItem('appdatmon_customer_token', result.token || '');
      localStorage.setItem('appdatmon_customer_user', JSON.stringify(result.user || {}));
      showToast(result.message || 'Đăng nhập thành công', 'success');
      setTimeout(() => { window.location.href = 'order.html'; }, 600);
    } catch (error) {
      showToast(error.message || 'Lỗi mạng. Vui lòng thử lại.', 'error');
    }
  } else {
    const fullName = document.getElementById('registerName').value.trim();
    const email = document.getElementById('registerEmail').value.trim();
    const password = document.getElementById('registerPassword').value.trim();
    const confirm = document.getElementById('registerConfirm').value.trim();

    if (!fullName || !email || !password || !confirm) {
      showToast('Vui lòng điền đầy đủ thông tin đăng ký', 'error');
      return;
    }
    if (password !== confirm) {
      showToast('Mật khẩu xác nhận không khớp', 'error');
      return;
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, email, phone: '', username: email, password })
      });
      const result = await response.json();
      if (!response.ok) {
        showToast(result.message || 'Đăng ký thất bại', 'error');
        return;
      }
      showToast(result.message || 'Đăng ký thành công', 'success');
      loginFields.classList.remove('hidden');
      registerFields.classList.add('hidden');
      document.querySelector('.auth-card button[type="submit"]').textContent = 'Đăng nhập';
    } catch (error) {
      showToast(error.message || 'Lỗi mạng. Vui lòng thử lại.', 'error');
    }
  }
}

function initLoginPage() {
  const loginBtn = document.getElementById('loginBtn');
  const registerBtn = document.getElementById('registerBtn');
  const loginFields = document.getElementById('loginFields');
  const registerFields = document.getElementById('registerFields');
  const submitButton = document.querySelector('.auth-card button[type="submit"]');
  const authForm = document.getElementById('authForm');
  if (!loginBtn || !registerBtn || !loginFields || !registerFields || !submitButton || !authForm) return;

  loginBtn.addEventListener('click', () => {
    loginFields.classList.remove('hidden');
    registerFields.classList.add('hidden');
    submitButton.textContent = 'Đăng nhập';
  });
  registerBtn.addEventListener('click', () => {
    loginFields.classList.add('hidden');
    registerFields.classList.remove('hidden');
    submitButton.textContent = 'Đăng ký';
  });

  authForm.addEventListener('submit', handleAuthFormSubmit);
}

function initPage() {
  if (document.getElementById('productGrid')) initOrderPage();
  if (document.getElementById('bookingForm')) initBookingPage();
  if (document.getElementById('reviewForm')) initReviewPage();
  if (document.querySelector('.contact-form-panel form')) initContactPage();
  if (document.getElementById('authForm') || document.getElementById('loginBtn')) initLoginPage();
}

document.addEventListener('DOMContentLoaded', initPage);
