const API_BASE_URL = (window.ADMIN_API_BASE_URL || localStorage.getItem('appdatmon_admin_api_base') || 'http://localhost:3000').replace(/\/$/, '');
const TOKEN_KEY = 'appdatmon_admin_token';

let state = {
  orders: [],
  tables: [],
  users: [],
  reservations: [],
  orderFilter: 'ALL',
  reservationFilter: 'ALL',
  checkoutOrderId: null,
  checkoutAmount: 0,
  paymentTab: 'cash'
};

// Generic API Client with Auth Header Integration
function api(path, options = {}) {
  const headers = { ...(options.headers || {}) };
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) headers.Authorization = `Bearer ${token}`;
  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  return fetch(`${API_BASE_URL}${path}`, { ...options, headers }).then(async res => {
    const raw = await res.text();
    const body = raw ? JSON.parse(raw) : null;
    if (!res.ok) {
      const error = new Error(body?.message || body?.error || raw || 'Thao tác thất bại');
      error.status = res.status;
      throw error;
    }
    return body;
  });
}

function formatCurrency(value) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(value || 0));
}

function formatNumber(value) {
  return new Intl.NumberFormat('vi-VN').format(Number(value || 0));
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

function escapeHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// 1. Quản lý Đơn hàng: Render Enterprise Order Cards Grid
function renderOrdersGrid(records) {
  const container = document.querySelector('#staff-orders-grid');
  if (!container) return;

  const list = Array.isArray(records) ? records : [];
  const activeFilter = state.orderFilter || 'ALL';

  const filtered = list.filter(order => {
    const st = String(order.status).toUpperCase();
    const paySt = String(order.paymentStatus).toUpperCase();
    if (activeFilter === 'PENDING') return st === 'PENDING';
    if (activeFilter === 'PREPARING') return ['CONFIRMED', 'PREPARING'].includes(st);
    if (activeFilter === 'UNPAID') return paySt !== 'PAID';
    if (activeFilter === 'COMPLETED') return st === 'COMPLETED';
    return true;
  });

  if (filtered.length === 0) {
    container.innerHTML = `
      <div style="grid-column:1/-1; text-align:center; padding:2.5rem; background:#ffffff; border-radius:16px; border:1px dashed #cbd5e1; color:#64748b">
        <i class="fa-solid fa-receipt" style="font-size:2rem; margin-bottom:0.5rem; color:#94a3b8"></i>
        <div style="font-weight:700">Không tìm thấy đơn hàng nào trong mục này</div>
      </div>
    `;
    return;
  }

  const statusBadgeMap = {
    PENDING: { label: '⏳ Chờ xác nhận', bg: '#fff7d6', color: '#b45309' },
    CONFIRMED: { label: '⚡ Đã xác nhận', bg: '#dbe1ff', color: '#004ac6' },
    PREPARING: { label: '🔥 Đang bếp làm', bg: '#ffe3ec', color: '#b8004f' },
    READY: { label: '🔔 Món đã sẵn sàng', bg: '#dcfce7', color: '#15803d' },
    COMPLETED: { label: '🎉 Đã hoàn tất', bg: '#e0e7ff', color: '#3730a3' },
    CANCELLED: { label: '❌ Đã hủy đơn', bg: '#fee2e2', color: '#b91c1c' }
  };

  container.innerHTML = filtered.map(order => {
    const tableNumber = order.RestaurantTable?.tableNumber || order.table_id || '-';
    const customerName = order.User?.fullName || (order.user_id ? `#${order.user_id}` : 'Khách vãng lai');
    const isPaid = String(order.paymentStatus).toUpperCase() === 'PAID';
    const status = String(order.status).toUpperCase();
    const stInfo = statusBadgeMap[status] || { label: status, bg: '#f1f5f9', color: '#475569' };

    const itemsList = Array.isArray(order.OrderItems) && order.OrderItems.length > 0
      ? order.OrderItems.map(item => `
          <div style="display:flex; justify-content:space-between; font-size:0.83rem; padding:0.25rem 0; border-bottom:1px dashed #f1f5f9">
            <span><strong>${escapeHtml(item.Product?.name || `#${item.product_id}`)}</strong> x${item.quantity}</span>
            <span style="color:#475569; font-weight:700">${formatCurrency(item.totalPrice || 0)}</span>
          </div>
        `).join('')
      : `<div style="font-size:0.8rem; color:#94a3b8; font-style:italic">Ghi chú: ${escapeHtml(order.note || 'Không có ghi chú món')}</div>`;

    const paymentBadge = isPaid
      ? `<span class="badge-inline" style="background:#dcfce7; color:#15803d; font-weight:800"><i class="fa-solid fa-circle-check"></i> Đã thanh toán (${escapeHtml(order.paymentMethod || 'Tiền mặt')})</span>`
      : `<span class="badge-inline" style="background:#fee2e2; color:#b91c1c; font-weight:800"><i class="fa-solid fa-clock"></i> Chưa thanh toán</span>`;

    const amount = order.finalPrice ?? order.totalPrice ?? 0;
    const itemsCount = order.OrderItems?.length || 0;

    return `
      <article class="user-card" style="display:flex; flex-direction:column; justify-space-between; background:#ffffff; border-radius:18px; border:1px solid #e2e8f0; box-shadow:0 4px 12px rgba(0,0,0,0.03); padding:1.1rem">
        <div>
          <!-- Header -->
          <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:0.6rem">
            <div>
              <strong style="font-size:1.1rem; color:#111c2d">Đơn hàng #${order.id}</strong>
              <div style="font-size:0.8rem; color:#64748b; margin-top:0.1rem">🪑 Bàn #${tableNumber} • 👤 ${escapeHtml(customerName)}</div>
            </div>
            <span class="badge-inline" style="background:${stInfo.bg}; color:${stInfo.color}; font-weight:800; font-size:0.78rem">${stInfo.label}</span>
          </div>

          <!-- Items list -->
          <div style="background:#f8fafc; padding:0.6rem 0.8rem; border-radius:12px; margin:0.6rem 0; max-height:140px; overflow-y:auto">
            ${itemsList}
          </div>

          <!-- Price & Payment status -->
          <div style="display:flex; justify-content:space-between; align-items:center; margin-top:0.6rem">
            <span style="font-size:0.85rem; color:#64748b">Tổng tiền đơn:</span>
            <strong style="font-size:1.3rem; color:#004ac6; font-weight:900">${formatCurrency(amount)}</strong>
          </div>
          <div style="margin-top:0.4rem; text-align:right">
            ${paymentBadge}
          </div>
        </div>

        <!-- Action buttons -->
        <div style="display:grid; grid-template-columns:${!isPaid ? '1fr 1.1fr' : '1fr'}; gap:0.5rem; margin-top:1rem">
          ${!isPaid ? `
            ${['READY', 'COMPLETED'].includes(status) ? `
              <button class="btn btn-primary" data-action="open-checkout-modal" data-id="${order.id}" data-table="${tableNumber}" data-customer="${escapeHtml(customerName)}" data-amount="${amount}" data-items="${itemsCount}" data-status="${status}" style="font-weight:800">
                <i class="fa-solid fa-credit-card"></i> Thanh toán
              </button>
            ` : `
              <button class="btn btn-secondary" disabled style="opacity:0.55; cursor:not-allowed; font-weight:700" title="Đơn hàng chưa nấu xong! Chỉ có thể thanh toán khi món ăn SẴN SÀNG (Trạng thái READY)">
                <i class="fa-solid fa-clock"></i> Chờ bếp (READY)
              </button>
            `}
          ` : ''}

          <select data-action="change-order-status" data-id="${order.id}" style="font-size:0.8rem; padding:0.45rem; border-radius:10px; border:1px solid #cbd5e1; background:#ffffff; font-weight:700">
            <option value="PENDING" ${status === 'PENDING' ? 'selected' : ''}>⏳ Chờ xác nhận</option>
            <option value="CONFIRMED" ${status === 'CONFIRMED' ? 'selected' : ''}>⚡ Đã xác nhận</option>
            <option value="PREPARING" ${status === 'PREPARING' ? 'selected' : ''}>🔥 Đang bếp làm</option>
            <option value="READY" ${status === 'READY' ? 'selected' : ''}>🔔 Món sẵn sàng</option>
            <option value="COMPLETED" ${status === 'COMPLETED' ? 'selected' : ''}>🎉 Đã hoàn tất</option>
            <option value="CANCELLED" ${status === 'CANCELLED' ? 'selected' : ''}>❌ Đã hủy đơn</option>
          </select>
        </div>
      </article>
    `;
  }).join('');
}

// 2. Quản lý Bàn: Render Interactive Grid (Ultra-Minimalist - Only Status Pill has Color)
function renderTablesGrid(tables) {
  const container = document.querySelector('#staff-tables-grid');
  if (!container) return;

  const list = Array.isArray(tables) ? tables : [];
  if (list.length === 0) {
    container.innerHTML = `<div style="grid-column:1/-1; text-align:center; color:#64748b; padding:2rem">Chưa có dữ liệu bàn ăn</div>`;
    return;
  }

  const statusMap = {
    AVAILABLE: { label: '🟢 Bàn trống', cssClass: 'st-available' },
    BOOKED: { label: '🔵 Đặt trước', cssClass: 'st-booked' },
    OCCUPIED: { label: '🟡 Đang ăn', cssClass: 'st-occupied' },
    CLEANING: { label: '🟣 Cần dọn', cssClass: 'st-cleaning' }
  };

  const now = new Date();

  container.innerHTML = list.map(table => {
    const st = String(table.calculatedStatus || table.status).toUpperCase();
    const info = statusMap[st] || statusMap.AVAILABLE;

    let liveTimerText = '';
    if (st === 'OCCUPIED') {
      const startTime = table.occupiedSince ? new Date(table.occupiedSince) : null;
      if (startTime && !isNaN(startTime)) {
        const diffMins = Math.max(0, Math.floor((now - startTime) / 60000));
        const timeStr = diffMins >= 60 ? `${Math.floor(diffMins / 60)}h ${diffMins % 60}p` : `${diffMins}p`;
        liveTimerText = ` • ⏱️ ${timeStr}`;
      } else if (table.timeUsed) {
        liveTimerText = ` • ⏱️ ${table.timeUsed}`;
      }
    }

    const targetUrl = `https://appdatmon.com/table/${table.qrCode || `T${table.tableNumber}`}`;
    const qrImageSrc = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(targetUrl)}`;

    return `
      <article class="table-card-clean">
        <div class="table-card-head-clean">
          <div class="table-title-clean">Bàn #${table.tableNumber}</div>
          <span class="table-pill-clean ${info.cssClass}">${info.label}</span>
        </div>

        <div style="font-size:0.8rem; color:#475569; margin:0.3rem 0; line-height:1.4">
          👥 ${table.capacity || 4} chỗ ${liveTimerText} • QR: <code>${escapeHtml(table.qrCode || `T${table.tableNumber}`)}</code>
        </div>

        <div style="display:grid; grid-template-columns:1fr auto; gap:0.4rem; align-items:center; margin-top:0.4rem">
          <select data-action="change-table-status" data-id="${table.id}" style="width:100%; font-size:0.78rem; padding:0.35rem 0.5rem; border-radius:6px; border:1px solid #cbd5e1; background:#ffffff; font-weight:600">
            <option value="AVAILABLE" ${st === 'AVAILABLE' ? 'selected' : ''}>🟢 Bàn trống</option>
            <option value="OCCUPIED" ${st === 'OCCUPIED' ? 'selected' : ''}>🟡 Đang ăn</option>
            <option value="BOOKED" ${st === 'BOOKED' ? 'selected' : ''}>🔵 Đặt trước</option>
            <option value="CLEANING" ${st === 'CLEANING' ? 'selected' : ''}>🟣 Cần dọn</option>
          </select>
          <button class="btn btn-secondary btn-small" data-action="open-table-qr-modal" data-number="${table.tableNumber}" data-capacity="${table.capacity || 4}" data-url="${targetUrl}" data-img="${qrImageSrc}" style="font-size:0.75rem; padding:0.35rem 0.6rem" title="Mở Mã QR Bàn">
            <i class="fa-solid fa-qrcode"></i> QR
          </button>
        </div>
      </article>
    `;
  }).join('');
}

// 3. Quản lý Đặt bàn: Filter Pills & Render Reservations Table
function renderReservationFilterPills() {
  const container = document.querySelector('#reservation-filter-pills');
  if (!container) return;

  const raw = state.reservations || [];
  const counts = {
    ALL: raw.length,
    PENDING: raw.filter(r => String(r.status).toUpperCase() === 'PENDING').length,
    CONFIRMED: raw.filter(r => String(r.status).toUpperCase() === 'CONFIRMED').length,
    CHECKED_IN: raw.filter(r => String(r.status).toUpperCase() === 'CHECKED_IN').length,
    CANCELLED: raw.filter(r => String(r.status).toUpperCase() === 'CANCELLED').length
  };

  const pills = [
    { id: 'ALL', label: 'Tất cả', count: counts.ALL },
    { id: 'PENDING', label: '⏳ Chờ duyệt', count: counts.PENDING },
    { id: 'CONFIRMED', label: '⚡ Đã xác nhận', count: counts.CONFIRMED },
    { id: 'CHECKED_IN', label: '📌 Đã nhận bàn', count: counts.CHECKED_IN },
    { id: 'CANCELLED', label: '❌ Đã hủy', count: counts.CANCELLED }
  ];

  container.innerHTML = pills.map(p => {
    const active = state.reservationFilter === p.id;
    return `
      <button class="filter-tab ${active ? 'active' : ''}" data-action="filter-reservation" data-status="${p.id}">
        <span>${p.label}</span>
        <span class="filter-tab-count">${p.count}</span>
      </button>
    `;
  }).join('');
}

function renderReservationsTable(records) {
  const allRows = Array.isArray(records) ? records : (state.reservations || []);

  // Update KPI counters
  const confirmedEl = document.querySelector('#metric-res-confirmed');
  const checkedEl = document.querySelector('#metric-res-checked');
  const pendingEl = document.querySelector('#metric-res-pending');
  if (confirmedEl) confirmedEl.textContent = allRows.filter(r => String(r.status).toUpperCase() === 'CONFIRMED').length;
  if (checkedEl) checkedEl.textContent = allRows.filter(r => String(r.status).toUpperCase() === 'CHECKED_IN').length;
  if (pendingEl) pendingEl.textContent = allRows.filter(r => String(r.status).toUpperCase() === 'PENDING').length;

  renderReservationFilterPills();

  // Filter rows based on active reservationFilter
  let rows = allRows;
  if (state.reservationFilter && state.reservationFilter !== 'ALL') {
    rows = rows.filter(r => String(r.status).toUpperCase() === state.reservationFilter);
  }

  const gridContainer = document.querySelector('#reservations-cards-grid');
  const tbody = document.querySelector('#reservations-table tbody');
  const now = new Date();

  // Render Grid Cards if container exists
  if (gridContainer) {
    if (rows.length === 0) {
      gridContainer.innerHTML = `<div style="grid-column:1/-1; text-align:center; padding:2rem; color:#64748b" class="empty-state">Không tìm thấy lịch đặt bàn nào phù hợp</div>`;
    } else {
      gridContainer.innerHTML = rows.map(res => {
        const tableNumber = res.RestaurantTable?.tableNumber || res.table_id || '-';
        const customerName = res.User?.fullName || res.guestName || res.customerName || (res.user_id ? `#${res.user_id}` : 'Khách vãng lai');
        const phone = res.User?.phone || res.guestPhone || res.phone || '-';
        const status = String(res.status || 'PENDING').toUpperCase();

        const statusBadgeMap = {
          CONFIRMED: '<span class="res-status-badge st-confirmed"><i class="fa-solid fa-bolt"></i> Đã xác nhận</span>',
          CHECKED_IN: '<span class="res-status-badge st-checked-in"><i class="fa-solid fa-user-check"></i> Đã nhận bàn</span>',
          ARRIVED: '<span class="res-status-badge st-checked-in"><i class="fa-solid fa-user-check"></i> Đã nhận bàn</span>',
          CANCELLED: '<span class="res-status-badge st-cancelled"><i class="fa-solid fa-xmark"></i> Đã hủy</span>',
          PENDING: '<span class="res-status-badge st-pending"><i class="fa-solid fa-clock"></i> Chờ duyệt</span>'
        };

        const resDate = new Date(res.reservationTime);
        const diffMins = !isNaN(resDate) ? (now - resDate) / 60000 : null;

        let confirmBtnHtml = '';
        let checkinBtnHtml = '';
        let cancelBtnHtml = '';

        if (status === 'PENDING') {
          confirmBtnHtml = `<button class="btn btn-primary btn-small res-action-btn" data-action="confirm-reservation" data-id="${res.id}" title="Xác nhận đơn đặt bàn"><i class="fa-solid fa-check"></i> Duyệt</button>`;
          if (diffMins !== null && diffMins >= -30 && diffMins <= 30) {
            checkinBtnHtml = `<button class="btn btn-primary btn-small res-action-btn" data-action="checkin-reservation" data-id="${res.id}" title="Nhận bàn cho khách"><i class="fa-solid fa-user-check"></i> Nhận bàn</button>`;
          }
          cancelBtnHtml = `<button class="btn btn-danger btn-small res-action-btn" data-action="cancel-reservation" data-id="${res.id}" title="Hủy lịch đặt bàn"><i class="fa-solid fa-xmark"></i> Hủy</button>`;
        } else if (status === 'CONFIRMED') {
          if (diffMins !== null) {
            if (diffMins >= -30 && diffMins <= 30) {
              checkinBtnHtml = `<button class="btn btn-primary btn-small res-action-btn" data-action="checkin-reservation" data-id="${res.id}" title="Nhận bàn cho khách"><i class="fa-solid fa-user-check"></i> Nhận bàn</button>`;
            } else if (diffMins < -30) {
              checkinBtnHtml = `<span class="res-disabled-pill" title="Chỉ mở nút Nhận bàn trong khoảng 30 phút trước hoặc 30 phút sau giờ đặt bàn (${formatDateTime(res.reservationTime)})"><i class="fa-solid fa-clock"></i> Chưa tới giờ</span>`;
            } else {
              checkinBtnHtml = `<span class="res-disabled-pill" title="Đã trễ quá 30 phút so với giờ đặt bàn (${formatDateTime(res.reservationTime)})"><i class="fa-solid fa-triangle-exclamation"></i> Quá 30p</span>`;
            }
          } else {
            checkinBtnHtml = `<button class="btn btn-primary btn-small res-action-btn" data-action="checkin-reservation" data-id="${res.id}"><i class="fa-solid fa-user-check"></i> Nhận bàn</button>`;
          }
          cancelBtnHtml = `<button class="btn btn-danger btn-small res-action-btn" data-action="cancel-reservation" data-id="${res.id}" title="Hủy lịch đặt bàn"><i class="fa-solid fa-xmark"></i> Hủy</button>`;
        }

        return `
          <article class="reservation-card">
            <div class="reservation-header">
              <div class="guest-info">
                <div class="guest-avatar">
                  ${customerName.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div class="guest-name">#${res.id} • ${escapeHtml(customerName)}</div>
                  <div class="guest-phone"><i class="fa-solid fa-phone"></i> ${escapeHtml(phone)}</div>
                </div>
              </div>
              ${statusBadgeMap[status] || status}
            </div>

            <div class="reservation-meta">
              <div class="res-meta-item">
                <span class="res-meta-label">Thời gian hẹn</span>
                <span class="res-meta-value"><i class="fa-regular fa-clock text-primary"></i> ${formatDateTime(res.reservationTime)}</span>
              </div>
              <div class="res-meta-item">
                <span class="res-meta-label">Vị trí & Khách</span>
                <span class="res-meta-value"><i class="fa-solid fa-chair text-amber"></i> Bàn #${tableNumber} • 👥 ${res.numberOfGuests || 1} người</span>
              </div>
            </div>

            ${res.note ? `<div class="res-note-box"><i class="fa-solid fa-quote-left"></i><span>"${escapeHtml(res.note)}"</span></div>` : ''}

            <div class="row-actions" style="margin-top:auto; display:flex; gap:0.5rem; justify-content:flex-end; align-items:center">
              ${confirmBtnHtml}
              ${checkinBtnHtml}
              ${cancelBtnHtml}
            </div>
          </article>
        `;
      }).join('');
    }
  }

  // Render Table if tbody exists
  if (tbody) {
    if (rows.length === 0) {
      tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding:1.5rem; color:#64748b">Không tìm thấy lịch đặt bàn nào phù hợp</td></tr>`;
      return;
    }

    tbody.innerHTML = rows.map(res => {
      const tableNumber = res.RestaurantTable?.tableNumber || res.table_id || '-';
      const customerName = res.User?.fullName || res.guestName || res.customerName || (res.user_id ? `#${res.user_id}` : 'Khách vãng lai');
      const phone = res.User?.phone || res.guestPhone || res.phone || '-';
      const status = String(res.status || 'PENDING').toUpperCase();

      const statusBadgeMap = {
        CONFIRMED: '<span class="res-status-badge st-confirmed"><i class="fa-solid fa-bolt"></i> Đã xác nhận</span>',
        CHECKED_IN: '<span class="res-status-badge st-checked-in"><i class="fa-solid fa-user-check"></i> Đã nhận bàn</span>',
        ARRIVED: '<span class="res-status-badge st-checked-in"><i class="fa-solid fa-user-check"></i> Đã nhận bàn</span>',
        CANCELLED: '<span class="res-status-badge st-cancelled"><i class="fa-solid fa-xmark"></i> Đã hủy</span>',
        PENDING: '<span class="res-status-badge st-pending"><i class="fa-solid fa-clock"></i> Chờ duyệt</span>'
      };

      const resDate = new Date(res.reservationTime);
      const diffMins = !isNaN(resDate) ? (now - resDate) / 60000 : null;

      let confirmBtnHtml = '';
      let checkinBtnHtml = '';
      let cancelBtnHtml = '';

      if (status === 'PENDING') {
        confirmBtnHtml = `<button class="btn btn-primary btn-small res-action-btn" data-action="confirm-reservation" data-id="${res.id}" title="Xác nhận đơn đặt bàn"><i class="fa-solid fa-check"></i> Duyệt</button>`;
        if (diffMins !== null && diffMins >= -30 && diffMins <= 30) {
          checkinBtnHtml = `<button class="btn btn-primary btn-small res-action-btn" data-action="checkin-reservation" data-id="${res.id}" title="Nhận bàn cho khách"><i class="fa-solid fa-user-check"></i> Nhận bàn</button>`;
        }
        cancelBtnHtml = `<button class="btn btn-danger btn-small res-action-btn" data-action="cancel-reservation" data-id="${res.id}" title="Hủy lịch đặt bàn"><i class="fa-solid fa-xmark"></i> Hủy</button>`;
      } else if (status === 'CONFIRMED') {
        if (diffMins !== null) {
          if (diffMins >= -30 && diffMins <= 30) {
            checkinBtnHtml = `<button class="btn btn-primary btn-small res-action-btn" data-action="checkin-reservation" data-id="${res.id}" title="Nhận bàn cho khách"><i class="fa-solid fa-user-check"></i> Nhận bàn</button>`;
          } else if (diffMins < -30) {
            checkinBtnHtml = `<span class="res-disabled-pill" title="Chỉ mở nút Nhận bàn trong khoảng 30 phút trước hoặc 30 phút sau giờ đặt bàn (${res.reservationTime})"><i class="fa-solid fa-clock"></i> Chưa tới giờ</span>`;
          } else {
            checkinBtnHtml = `<span class="res-disabled-pill" title="Đã trễ quá 30 phút so với giờ đặt bàn (${res.reservationTime})"><i class="fa-solid fa-triangle-exclamation"></i> Quá 30p</span>`;
          }
        } else {
          checkinBtnHtml = `<button class="btn btn-primary btn-small res-action-btn" data-action="checkin-reservation" data-id="${res.id}"><i class="fa-solid fa-user-check"></i> Nhận bàn</button>`;
        }
        cancelBtnHtml = `<button class="btn btn-danger btn-small res-action-btn" data-action="cancel-reservation" data-id="${res.id}" title="Hủy lịch đặt bàn"><i class="fa-solid fa-xmark"></i> Hủy</button>`;
      }

      return `
        <tr>
          <td><strong>#${res.id}</strong></td>
          <td><strong>${escapeHtml(customerName)}</strong></td>
          <td>${escapeHtml(phone)}</td>
          <td><strong>Bàn #${tableNumber}</strong></td>
          <td><strong>${res.numberOfGuests || 1} người</strong></td>
          <td>${escapeHtml(res.reservationTime || '-')}</td>
          <td>${statusBadgeMap[status] || status}</td>
          <td style="text-align:right">
            <div style="display:flex; gap:0.4rem; justify-content:flex-end; align-items:center">
              ${confirmBtnHtml}
              ${checkinBtnHtml}
              ${cancelBtnHtml}
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }
}

// 4. Tích điểm & Khách VIP
function renderVipUsers(users) {
  const container = document.querySelector('#staff-vip-users-list');
  if (!container) return;

  const list = Array.isArray(users) ? users : [];
  if (list.length === 0) {
    container.innerHTML = `<div style="grid-column:1/-1; text-align:center; color:#64748b; padding:1.5rem">Không tìm thấy khách hàng nào</div>`;
    return;
  }

  container.innerHTML = list.map(user => {
    const points = Number(user.points || 0);
    const initials = (user.fullName || user.username || 'U').slice(0, 2).toUpperCase();

    return `
      <div style="background:#ffffff; border:1px solid rgba(0,0,0,0.08); border-radius:16px; padding:1rem; display:flex; justify-content:space-between; align-items:center">
        <div style="display:flex; align-items:center; gap:0.8rem">
          <div style="width:44px; height:44px; border-radius:12px; background:linear-gradient(135deg,#004ac6,#3b82f6); color:#fff; font-weight:800; display:flex; align-items:center; justify-content:center">
            ${initials}
          </div>
          <div>
            <strong style="display:block; color:#111c2d; font-size:0.95rem">${escapeHtml(user.fullName || user.username)}</strong>
            <span style="font-size:0.78rem; color:#64748b"><i class="fa-solid fa-phone"></i> ${escapeHtml(user.phone || '-')}</span>
          </div>
        </div>

        <div style="text-align:right">
          <div style="font-weight:900; font-size:1.1rem; color:#004ac6"><i class="fa-solid fa-coins text-amber" style="color:#d97706; margin-right:0.2rem"></i> ${formatNumber(points)} p</div>
          <div style="display:flex; gap:0.3rem; margin-top:0.4rem">
            <button class="btn btn-secondary btn-small" data-action="adjust-user-points" data-id="${user.id}" data-current="${points}" data-delta="50" title="+50 điểm">+50p</button>
            <button class="btn btn-secondary btn-small" data-action="adjust-user-points" data-id="${user.id}" data-current="${points}" data-delta="100" title="+100 điểm">+100p</button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// 5. Render Metric Strip Summary
function renderMetrics(orders, tables, reservations) {
  const oList = Array.isArray(orders) ? orders : [];
  const tList = Array.isArray(tables) ? tables : [];
  const rList = Array.isArray(reservations) ? reservations : [];

  const pending = oList.filter(o => String(o.status).toUpperCase() === 'PENDING').length;
  const empty = tList.filter(t => String(t.calculatedStatus || t.status).toUpperCase() === 'AVAILABLE').length;
  const booked = tList.filter(t => String(t.calculatedStatus || t.status).toUpperCase() === 'BOOKED').length;
  const serving = tList.filter(t => String(t.calculatedStatus || t.status).toUpperCase() === 'OCCUPIED').length;
  const cleaning = tList.filter(t => String(t.calculatedStatus || t.status).toUpperCase() === 'CLEANING').length;
  const paidCount = oList.filter(o => String(o.paymentStatus).toUpperCase() === 'PAID').length;

  if (document.querySelector('#metric-pending')) document.querySelector('#metric-pending').textContent = formatNumber(pending);
  if (document.querySelector('#metric-empty')) document.querySelector('#metric-empty').textContent = formatNumber(empty);
  if (document.querySelector('#metric-booked')) document.querySelector('#metric-booked').textContent = formatNumber(booked);
  if (document.querySelector('#metric-serving')) document.querySelector('#metric-serving').textContent = formatNumber(serving);
  if (document.querySelector('#metric-cleaning')) document.querySelector('#metric-cleaning').textContent = formatNumber(cleaning);
  if (document.querySelector('#metric-pay')) document.querySelector('#metric-pay').textContent = formatNumber(paidCount);
}

// Open Staff Payment Checkout Modal
function openCheckoutModal(orderId, tableNumber, customerName, amount, itemsCount, status) {
  const st = String(status || '').toUpperCase();
  if (st && st !== 'READY' && st !== 'COMPLETED') {
    alert(`⚠️ Đơn hàng #${orderId} chưa hoàn thành chế biến! (Trạng thái hiện tại: ${st}).\nVui lòng chờ Bếp nấu xong và đổi trạng thái sang SẴN SÀNG (READY) trước khi thanh toán.`);
    return;
  }

  state.checkoutOrderId = orderId;
  state.checkoutAmount = Number(amount || 0);

  if (document.querySelector('#payment-modal-title')) document.querySelector('#payment-modal-title').textContent = `💳 Thanh toán Đơn hàng #${orderId}`;
  if (document.querySelector('#payment-modal-sub')) document.querySelector('#payment-modal-sub').textContent = `Vị trí: Bàn #${tableNumber} • Khách hàng: ${customerName}`;
  if (document.querySelector('#payment-modal-amount')) document.querySelector('#payment-modal-amount').textContent = formatCurrency(amount);
  if (document.querySelector('#payment-modal-items-count')) document.querySelector('#payment-modal-items-count').textContent = `${itemsCount || 0} món ăn trong đơn hàng`;

  if (document.querySelector('#cash-given-input')) document.querySelector('#cash-given-input').value = '';
  if (document.querySelector('#cash-change-text')) document.querySelector('#cash-change-text').textContent = '0 ₫';

  // Default to Cash tab
  switchPaymentTab('cash');

  if (document.querySelector('#staff-payment-modal')) document.querySelector('#staff-payment-modal').classList.remove('hidden');
}

function switchPaymentTab(tab) {
  state.paymentTab = tab;
  const cashBtn = document.querySelector('#tab-pay-cash');
  const payosBtn = document.querySelector('#tab-pay-payos');
  const cashPanel = document.querySelector('#panel-pay-cash');
  const payosPanel = document.querySelector('#panel-pay-payos');

  if (tab === 'cash') {
    if (cashBtn) cashBtn.className = 'btn btn-primary';
    if (payosBtn) payosBtn.className = 'btn btn-secondary';
    if (cashPanel) cashPanel.classList.remove('hidden');
    if (payosPanel) payosPanel.classList.add('hidden');
  } else {
    if (cashBtn) cashBtn.className = 'btn btn-secondary';
    if (payosBtn) payosBtn.className = 'btn btn-primary';
    if (cashPanel) cashPanel.classList.add('hidden');
    if (payosPanel) payosPanel.classList.remove('hidden');

    initPayOSCheckout(state.checkoutOrderId);
  }
}

async function initPayOSCheckout(orderId) {
  if (!orderId) return;
  const qrImg = document.querySelector('#payos-qr-image');
  const statusTxt = document.querySelector('#payos-qr-status');
  const codeTxt = document.querySelector('#payos-order-code');
  const webBtn = document.querySelector('#btn-open-payos-url');

  if (statusTxt) statusTxt.textContent = '⏳ Đang kết nối liên kết thanh toán PayOS Backend...';

  try {
    const res = await api('/api/payos/create-payment-link', {
      method: 'POST',
      body: JSON.stringify({ orderId: Number(orderId) })
    });

    let qrUrl = '';
    if (res.qrCode && (res.qrCode.startsWith('http://') || res.qrCode.startsWith('https://') || res.qrCode.startsWith('data:image'))) {
      qrUrl = res.qrCode;
    } else if (res.qrCode) {
      qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(res.qrCode)}`;
    } else if (res.checkoutUrl) {
      qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(res.checkoutUrl)}`;
    } else {
      qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(`PayOS-DH${orderId}`)}`;
    }

    if (qrImg) qrImg.src = qrUrl;
    if (statusTxt) statusTxt.textContent = `🟢 Mã QR PayOS đã sẵn sàng (Số HĐ: ${res.orderCode || orderId})`;
    if (codeTxt) codeTxt.textContent = `PAYOS-CODE: ${res.orderCode || orderId}`;
    if (webBtn && res.checkoutUrl) {
      webBtn.href = res.checkoutUrl;
      webBtn.style.display = 'inline-flex';
    }
  } catch (err) {
    console.warn('PayOS API info:', err);
    const fallbackQr = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(`AppDatMon-DH${orderId}-Amount-${state.checkoutAmount}`)}`;
    if (qrImg) qrImg.src = fallbackQr;
    if (statusTxt) statusTxt.textContent = `⚡ Mã QR Chuyển Khoản Trực Tiếp (DH #${orderId})`;
    if (codeTxt) codeTxt.textContent = `DH#${orderId} • ${formatCurrency(state.checkoutAmount)}`;
  }
}

// Global Event Delegate Handlers
function bindGlobalActions() {
  document.addEventListener('click', async event => {
    // Logout Action Button
    const logoutBtn = event.target.closest('[data-action="logout"], .admin-logout-button');
    if (logoutBtn) {
      if (confirm('Bạn chắc chắn muốn đăng xuất khỏi hệ thống nhân viên?')) {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem('appdatmon_admin_user');
        window.location.href = 'index.html';
      }
      return;
    }

    // Filter Pills
    const filterBtn = event.target.closest('[data-order-filter]');
    if (filterBtn) {
      state.orderFilter = filterBtn.dataset.orderFilter;
      document.querySelectorAll('#order-filter-pills button').forEach(b => {
        b.className = b.dataset.orderFilter === state.orderFilter ? 'btn btn-primary btn-small' : 'btn btn-secondary btn-small';
      });
      renderOrdersGrid(state.orders);
      return;
    }

    // Reservation Filter Pills
    const resFilterBtn = event.target.closest('[data-action="filter-reservation"]');
    if (resFilterBtn) {
      state.reservationFilter = resFilterBtn.dataset.status;
      renderReservationsTable(state.reservations);
      return;
    }

    // Open Checkout Modal
    const checkoutBtn = event.target.closest('[data-action="open-checkout-modal"]');
    if (checkoutBtn) {
      const id = checkoutBtn.dataset.id;
      const tableNumber = checkoutBtn.dataset.table;
      const customerName = checkoutBtn.dataset.customer;
      const amount = checkoutBtn.dataset.amount;
      const itemsCount = checkoutBtn.dataset.items;
      openCheckoutModal(id, tableNumber, customerName, amount, itemsCount);
      return;
    }

    // Payment Tabs
    if (event.target.closest('#tab-pay-cash')) {
      switchPaymentTab('cash');
      return;
    }
    if (event.target.closest('#tab-pay-payos')) {
      switchPaymentTab('payos');
      return;
    }

    // Confirm Cash Paid
    if (event.target.closest('#btn-confirm-cash-paid')) {
      if (!state.checkoutOrderId) return;
      try {
        await api(`/api/orders/${state.checkoutOrderId}/pay`, {
          method: 'PUT',
          body: JSON.stringify({ paymentMethod: 'CASH' })
        });
        if (document.querySelector('#staff-payment-modal')) document.querySelector('#staff-payment-modal').classList.add('hidden');
        alert(`Đã thanh toán TIỀN MẶT thành công cho Đơn hàng #${state.checkoutOrderId}!`);
        await bootstrap();
      } catch (err) {
        alert(err.message || 'Không thể xác nhận thanh toán tiền mặt');
      }
      return;
    }

    // Confirm Bank Transfer Paid
    if (event.target.closest('#btn-confirm-transfer-paid')) {
      if (!state.checkoutOrderId) return;
      try {
        await api(`/api/orders/${state.checkoutOrderId}/pay`, {
          method: 'PUT',
          body: JSON.stringify({ paymentMethod: 'BANK_TRANSFER' })
        });
        if (document.querySelector('#staff-payment-modal')) document.querySelector('#staff-payment-modal').classList.add('hidden');
        alert(`Đã xác nhận thanh toán CHUYỂN KHOẢN thành công cho Đơn hàng #${state.checkoutOrderId}!`);
        await bootstrap();
      } catch (err) {
        alert(err.message || 'Không thể xác nhận thanh toán chuyển khoản');
      }
      return;
    }

    // Check PayOS Status
    if (event.target.closest('#btn-check-payos-status')) {
      if (!state.checkoutOrderId) return;
      try {
        const statusRes = await api(`/api/payos/check-status/${state.checkoutOrderId}`);
        alert(`Trạng thái PayOS: ${statusRes.status || 'Chưa nhận thanh toán'}`);
        if (statusRes.status === 'PAID') {
          if (document.querySelector('#staff-payment-modal')) document.querySelector('#staff-payment-modal').classList.add('hidden');
          await bootstrap();
        }
      } catch (err) {
        alert('Chưa nhận được giao dịch từ PayOS: ' + err.message);
      }
      return;
    }

    // Close Payment Modal
    if (event.target.closest('#close-staff-payment-modal')) {
      if (document.querySelector('#staff-payment-modal')) document.querySelector('#staff-payment-modal').classList.add('hidden');
      return;
    }

    // Open Table QR Code Generator Modal
    const qrTableBtn = event.target.closest('[data-action="open-table-qr-modal"]');
    if (qrTableBtn) {
      const tableNumber = qrTableBtn.dataset.number;
      const capacity = qrTableBtn.dataset.capacity;
      const targetUrl = qrTableBtn.dataset.url;
      const qrImg = qrTableBtn.dataset.img;

      if (document.querySelector('#table-qr-modal-title')) document.querySelector('#table-qr-modal-title').textContent = `📱 Mã QR Gọi Món Bàn #${tableNumber}`;
      if (document.querySelector('#table-qr-subtext')) document.querySelector('#table-qr-subtext').textContent = `Bàn #${tableNumber} • Sức chứa ${capacity} người`;
      if (document.querySelector('#table-qr-url-text')) document.querySelector('#table-qr-url-text').textContent = targetUrl;
      if (document.querySelector('#table-qr-image')) document.querySelector('#table-qr-image').src = qrImg;
      if (document.querySelector('#btn-download-table-qr')) {
        document.querySelector('#btn-download-table-qr').href = qrImg;
        document.querySelector('#btn-download-table-qr').setAttribute('download', `Ma_QR_Ban_${tableNumber}.png`);
      }

      if (document.querySelector('#table-qr-modal')) document.querySelector('#table-qr-modal').classList.remove('hidden');
      return;
    }

    // Close Table QR Modal
    if (event.target.closest('#close-table-qr-modal')) {
      if (document.querySelector('#table-qr-modal')) document.querySelector('#table-qr-modal').classList.add('hidden');
      return;
    }

    // Confirm Reservation
    const confirmResBtn = event.target.closest('[data-action="confirm-reservation"]');
    if (confirmResBtn) {
      const resId = confirmResBtn.dataset.id;
      try {
        await api(`/api/reservations/${resId}/confirm`, { method: 'PUT' });
        alert(`Đã xác nhận thành công đơn đặt bàn #${resId}!`);
        await bootstrap();
      } catch (err) {
        alert(err.message || 'Không thể xác nhận đặt bàn');
      }
      return;
    }

    // Check-in Reservation
    const checkinBtn = event.target.closest('[data-action="checkin-reservation"]');
    if (checkinBtn) {
      const resId = checkinBtn.dataset.id;
      try {
        await api(`/api/reservations/${resId}/check-in`, { method: 'PUT' });
        alert(`Đã Check-in thành công cho lịch đặt bàn #${resId}!`);
        await bootstrap();
      } catch (err) {
        alert(err.message || 'Không thể Check-in đặt bàn');
      }
      return;
    }

    // Cancel Reservation
    const cancelResBtn = event.target.closest('[data-action="cancel-reservation"]');
    if (cancelResBtn) {
      const resId = cancelResBtn.dataset.id;
      if (confirm(`Bạn có chắc chắn muốn HỦY lịch đặt bàn #${resId}?`)) {
        try {
          await api(`/api/reservations/${resId}/cancel`, { method: 'PUT' });
          alert(`Đã hủy lịch đặt bàn #${resId}!`);
          await bootstrap();
        } catch (err) {
          alert(err.message || 'Không thể hủy đặt bàn');
        }
      }
      return;
    }

    // Add User Points API Call
    const pointsBtn = event.target.closest('[data-action="adjust-user-points"]');
    if (pointsBtn) {
      const userId = pointsBtn.dataset.id;
      const currentPoints = Number(pointsBtn.dataset.current || 0);
      const delta = Number(pointsBtn.dataset.delta || 50);
      const newPoints = currentPoints + delta;

      try {
        await api(`/api/users/${userId}`, {
          method: 'PUT',
          body: JSON.stringify({ points: newPoints })
        });
        alert(`Đã cộng +${delta} điểm cho khách hàng #${userId}! Tổng điểm mới: ${newPoints} p`);
        await bootstrap();
      } catch (err) {
        alert(err.message || 'Không thể cộng điểm cho khách hàng');
      }
      return;
    }
  });

  // Calculate Cash Change live
  document.addEventListener('input', event => {
    if (event.target.id === 'cash-given-input') {
      const given = Number(event.target.value || 0);
      const needed = state.checkoutAmount || 0;
      const change = Math.max(0, given - needed);
      if (document.querySelector('#cash-change-text')) {
        document.querySelector('#cash-change-text').textContent = formatCurrency(change);
      }
    }
  });

  // Change Order Status Select
  document.addEventListener('change', async event => {
    const select = event.target.closest('[data-action="change-order-status"]');
    if (select) {
      const orderId = select.dataset.id;
      const newStatus = select.value;
      try {
        await api(`/api/orders/${orderId}/status`, {
          method: 'PUT',
          body: JSON.stringify({ status: newStatus })
        });
        await bootstrap();
      } catch (err) {
        alert(err.message || 'Không thể cập nhật trạng thái đơn');
      }
      return;
    }

    // Change Table Status Select
    const tSelect = event.target.closest('[data-action="change-table-status"]');
    if (tSelect) {
      const tableId = tSelect.dataset.id;
      const newStatus = tSelect.value;
      try {
        await api(`/api/tables/${tableId}/status`, {
          method: 'PUT',
          body: JSON.stringify({ status: newStatus })
        });
        await bootstrap();
      } catch (err) {
        alert(err.message || 'Không thể cập nhật trạng thái bàn');
      }
      return;
    }
  });

  // Live Search Filters
  const staffSearchInput = document.querySelector('#staff-search-input');
  if (staffSearchInput) {
    staffSearchInput.addEventListener('input', e => {
      const q = (e.target.value || '').trim().toLowerCase();
      if (!q) {
        renderOrdersGrid(state.orders);
        renderTablesGrid(state.tables);
        renderReservationsTable(state.reservations);
        return;
      }
      const filteredOrders = state.orders.filter(o =>
        String(o.id).includes(q) ||
        (o.User?.fullName || '').toLowerCase().includes(q) ||
        String(o.RestaurantTable?.tableNumber || o.table_id || '').includes(q)
      );
      renderOrdersGrid(filteredOrders);

      const filteredTables = state.tables.filter(t =>
        String(t.tableNumber || t.id).includes(q)
      );
      renderTablesGrid(filteredTables);

      const filteredRes = state.reservations.filter(r =>
        String(r.id).includes(q) ||
        (r.User?.fullName || r.customerName || '').toLowerCase().includes(q) ||
        (r.User?.phone || r.phone || '').includes(q) ||
        String(r.RestaurantTable?.tableNumber || r.table_id || '').includes(q)
      );
      renderReservationsTable(filteredRes);
    });
  }

  const userPointsSearch = document.querySelector('#user-points-search');
  if (userPointsSearch) {
    userPointsSearch.addEventListener('input', e => {
      const q = (e.target.value || '').trim().toLowerCase();
      if (!q) {
        renderVipUsers(state.users);
        return;
      }
      const filteredUsers = state.users.filter(u =>
        (u.fullName || '').toLowerCase().includes(q) ||
        (u.phone || '').includes(q) ||
        (u.username || '').toLowerCase().includes(q)
      );
      renderVipUsers(filteredUsers);
    });
  }

  // Refresh CTA Button
  const refreshBtn = document.querySelector('#btn-refresh-staff');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', () => bootstrap());
  }

  // Real-time Live Clock
  setInterval(() => {
    const clockEl = document.querySelector('#live-clock-text');
    if (clockEl) {
      clockEl.textContent = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    }
  }, 1000);
}

// Bootstrap Data Sync with Backend APIs
async function bootstrap() {
  try {
    const [orders, tables, users, reservations] = await Promise.all([
      api('/api/orders').catch(() => []),
      api('/api/tables').catch(() => []),
      api('/api/users').catch(() => []),
      api('/api/reservations').catch(() => [])
    ]);

    state.orders = Array.isArray(orders) ? orders : [];
    state.tables = Array.isArray(tables) ? tables : [];
    state.users = Array.isArray(users) ? users : [];
    state.reservations = Array.isArray(reservations) ? reservations : [];

    renderMetrics(state.orders, state.tables, state.reservations);
    renderOrdersGrid(state.orders);
    renderTablesGrid(state.tables);
    renderReservationsTable(state.reservations);
    renderVipUsers(state.users);
  } catch (error) {
    console.error('Bootstrap staff error:', error);
  }
}

// DOM Ready Handler
window.addEventListener('DOMContentLoaded', () => {
  bindGlobalActions();
  bootstrap();

  // Auto polling refresh every 10 seconds
  setInterval(() => {
    bootstrap();
  }, 10000);
});
