const API_BASE_URL = (window.ADMIN_API_BASE_URL || localStorage.getItem('appdatmon_admin_api_base') || 'http://localhost:3000').replace(/\/$/, '');
const TOKEN_KEY = 'appdatmon_admin_token';

let kitchenOrders = [];

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
      const error = new Error(body?.message || body?.error || raw || 'Request failed');
      error.status = res.status;
      throw error;
    }
    return body;
  });
}

function escapeHtml(str) {
  return String(str || '').replace(/[&<>"']/g, match => {
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
    return map[match];
  });
}

function getBoardState(order) {
  const st = String(order.status).toUpperCase();
  if (['PENDING', 'CONFIRMED'].includes(st)) return 'todo';
  if (['PREPARING'].includes(st)) return 'doing';
  return 'done';
}

function renderBoard(orders) {
  const boards = {
    todo: document.querySelector('#board-todo'),
    doing: document.querySelector('#board-doing'),
    done: document.querySelector('#board-done')
  };

  if (!boards.todo || !boards.doing || !boards.done) return;

  for (const key of Object.keys(boards)) {
    boards[key].innerHTML = '';
  }

  const list = Array.isArray(orders) ? orders : [];
  const grouped = list.reduce((acc, order) => {
    const boardKey = getBoardState(order);
    acc[boardKey] = [...(acc[boardKey] || []), order];
    return acc;
  }, { todo: [], doing: [], done: [] });

  document.querySelector('#todo-count').textContent = String(grouped.todo.length);
  document.querySelector('#doing-count').textContent = String(grouped.doing.length);
  document.querySelector('#done-count').textContent = String(grouped.done.length);

  Object.entries(grouped).forEach(([key, items]) => {
    if (!items.length) {
      boards[key].innerHTML = '<div class="empty-note"><i class="fa-solid fa-inbox" style="font-size:1.5rem; display:block; margin-bottom:0.4rem; color:#cbd5e1"></i>Chưa có món trong danh mục này</div>';
      return;
    }

    boards[key].innerHTML = items.map(order => {
      const tableNumber = order.RestaurantTable?.tableNumber || order.table_id || '-';
      const customerName = order.User?.fullName || (order.user_id ? `#${order.user_id}` : 'Khách vãng lai');
      const itemsList = (order.OrderItems || []).map(item => `
        <div style="display:flex; justify-content:space-between; align-items:center; padding:0.3rem 0; border-bottom:1.5px dashed rgba(115,118,134,0.12)">
          <strong style="color:#111c2d; font-size:0.95rem">${escapeHtml(item.Product?.name || `#${item.product_id}`)}</strong>
          <span class="badge-inline" style="background:#dbe1ff; color:#004ac6; font-weight:800">x${item.quantity}</span>
        </div>
      `).join('');

      let actionBtn = '';
      if (key === 'todo') {
        actionBtn = `<button class="btn btn-primary btn-small" data-action="update-kitchen-status" data-id="${order.id}" data-target="PREPARING" style="width:100%; margin-top:0.8rem; background:linear-gradient(135deg, #e11d48, #f43f5e)"><i class="fa-solid fa-fire"></i> Bắt đầu làm món</button>`;
      } else if (key === 'doing') {
        actionBtn = `<button class="btn btn-primary btn-small" data-action="update-kitchen-status" data-id="${order.id}" data-target="READY" style="width:100%; margin-top:0.8rem; background:linear-gradient(135deg, #10b981, #059669)"><i class="fa-solid fa-circle-check"></i> Báo Hoàn thành</button>`;
      } else {
        actionBtn = `<div style="text-align:center; font-size:0.8rem; color:#10b981; font-weight:700; margin-top:0.6rem"><i class="fa-solid fa-circle-check"></i> Đã làm xong & sẵn sàng phục vụ</div>`;
      }

      return `
        <div class="kanban-card" draggable="true" data-order-id="${order.id}">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.6rem">
            <strong style="font-size:1.05rem; color:#004ac6">Đơn #${order.id}</strong>
            <span class="badge-inline" style="background:#f1f5f9; color:#0f172a; font-weight:800"><i class="fa-solid fa-utensils"></i> Bàn #${tableNumber}</span>
          </div>

          <div style="font-size:0.8rem; color:#64748b; margin-bottom:0.6rem">Khách: ${escapeHtml(customerName)}</div>

          <div class="kanban-items-box">
            ${itemsList || '<div style="color:#94a3b8">Không có chi tiết món</div>'}
          </div>

          ${order.note ? `
            <div style="margin-top:0.6rem; padding:0.5rem; background:#fff7d6; border-radius:10px; border:1px solid #fef08a; font-size:0.82rem; color:#b45309">
              <i class="fa-solid fa-note-sticky"></i> <strong>Ghi chú:</strong> ${escapeHtml(order.note)}
            </div>
          ` : ''}

          ${actionBtn}
        </div>
      `;
    }).join('');
  });
}

async function updateOrderStatus(orderId, newStatus) {
  try {
    await api(`/api/orders/${orderId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status: newStatus })
    });
    await bootstrap();
  } catch (error) {
    alert(error.message || 'Không thể cập nhật trạng thái bếp');
  }
}

function bindActions() {
  // Drag and drop
  document.addEventListener('dragstart', event => {
    const card = event.target.closest('.kanban-card');
    if (!card) return;
    event.dataTransfer.setData('text/plain', card.dataset.orderId);
  });

  document.querySelectorAll('.kanban-list').forEach(list => {
    list.addEventListener('dragover', event => event.preventDefault());
    list.addEventListener('drop', async event => {
      event.preventDefault();
      const orderId = event.dataTransfer.getData('text/plain');
      const statusMap = {
        'board-todo': 'PENDING',
        'board-doing': 'PREPARING',
        'board-done': 'READY'
      };
      const newStatus = statusMap[list.id] || 'PENDING';
      await updateOrderStatus(orderId, newStatus);
    });
  });

  // Click handler for 1-click status update buttons
  document.addEventListener('click', async event => {
    const btn = event.target.closest('[data-action="update-kitchen-status"]');
    if (btn) {
      const orderId = btn.dataset.id;
      const targetStatus = btn.dataset.target;
      await updateOrderStatus(orderId, targetStatus);
      return;
    }

    const logoutBtn = event.target.closest('[data-action="logout"]');
    if (logoutBtn) {
      localStorage.removeItem(TOKEN_KEY);
      window.location.assign('./index.html');
      return;
    }
  });

  // Live Search in Kitchen
  const kitchenSearchInput = document.querySelector('#kitchen-search-input');
  if (kitchenSearchInput) {
    kitchenSearchInput.addEventListener('input', e => {
      const q = (e.target.value || '').trim().toLowerCase();
      if (!q) {
        renderBoard(kitchenOrders);
        return;
      }
      const filtered = kitchenOrders.filter(order => {
        const idMatch = String(order.id).includes(q);
        const tableMatch = String(order.RestaurantTable?.tableNumber || order.table_id || '').includes(q);
        const noteMatch = (order.note || '').toLowerCase().includes(q);
        const itemMatch = (order.OrderItems || []).some(item => (item.Product?.name || '').toLowerCase().includes(q));
        return idMatch || tableMatch || noteMatch || itemMatch;
      });
      renderBoard(filtered);
    });
  }

  // Real-time Live Clock
  setInterval(() => {
    const clockEl = document.querySelector('#live-clock-text');
    if (clockEl) {
      clockEl.textContent = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    }
  }, 1000);

  // Auto refresh every 10 seconds for real-time kitchen updates
  setInterval(() => bootstrap(), 10000);
}

async function bootstrap() {
  try {
    const orders = await api('/api/orders');
    kitchenOrders = Array.isArray(orders) ? orders : [];
    renderBoard(kitchenOrders);
  } catch (error) {
    const fallback = `<div class="empty-note">${error.message}</div>`;
    if (document.querySelector('#board-todo')) document.querySelector('#board-todo').innerHTML = fallback;
    if (document.querySelector('#board-doing')) document.querySelector('#board-doing').innerHTML = fallback;
    if (document.querySelector('#board-done')) document.querySelector('#board-done').innerHTML = fallback;
  }
}

window.addEventListener('DOMContentLoaded', async () => {
  bindActions();
  await bootstrap();
});
