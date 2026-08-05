// Modular Orders View (Giao diện Quản lý Đơn hàng & Modal Thanh Toán)
import { formatCurrency, formatDateTime, statusChip, paymentStatusClass, escapeHtml } from '../utils.js';
import { api } from '../api.js';

export function renderOrdersGrid(records, activeFilter = 'ALL') {
  if (!records || records.length === 0) {
    return `<div class="empty-state"><strong>Không có đơn hàng phù hợp</strong></div>`;
  }

  let filtered = records;
  if (activeFilter && activeFilter !== 'ALL') {
    filtered = records.filter(o => {
      const st = String(o.status || '').toUpperCase();
      const pst = String(o.paymentStatus || '').toUpperCase();
      if (activeFilter === 'UNPAID') return pst === 'UNPAID';
      return st === activeFilter;
    });
  }

  if (filtered.length === 0) {
    return `<div class="empty-state"><strong>Không tìm thấy đơn hàng ở trạng thái này</strong></div>`;
  }

  return `
    <div class="orders-grid">
      ${filtered.map(order => {
        const tableBadge = order.RestaurantTable?.tableNumber ? `Bàn #${order.RestaurantTable.tableNumber}` : order.table_id ? `Bàn #${order.table_id}` : 'Mang đi';
        const customerName = order.User?.fullName || (order.user_id ? `Khách #${order.user_id}` : 'Khách vãng lai');
        const rawStatus = String(order.status || 'PENDING').toUpperCase();
        const paymentStatus = String(order.paymentStatus || 'UNPAID').toUpperCase();
        const items = order.OrderItems || [];
        const itemsCount = items.reduce((acc, item) => acc + (item.quantity || 1), 0);

        let stepIdx = 0;
        if (rawStatus === 'CONFIRMED' || rawStatus === 'PREPARING') stepIdx = 1;
        if (rawStatus === 'READY') stepIdx = 2;
        if (rawStatus === 'COMPLETED') stepIdx = 3;

        return `
          <article class="order-card">
            <div class="order-card-head">
              <div class="order-id-badge">
                <i class="fa-solid fa-receipt"></i> Đơn #${order.id}
              </div>
              <span class="order-table-chip">${tableBadge}</span>
            </div>

            <div class="order-customer-info">
              <div><i class="fa-solid fa-user"></i> <strong>${escapeHtml(customerName)}</strong></div>
              <span class="muted">${formatDateTime(order.createdAt || order.created_at)}</span>
            </div>

            <div class="order-stepper">
              <div class="order-stepper-line"></div>
              <div class="order-step ${stepIdx >= 0 ? 'done' : ''}" title="Nhận đơn"><i class="fa-solid fa-check"></i></div>
              <div class="order-step ${stepIdx >= 1 ? 'done' : ''}" title="Đang chế biến"><i class="fa-solid fa-fire"></i></div>
              <div class="order-step ${stepIdx >= 2 ? 'done' : ''}" title="Sẵn sàng"><i class="fa-solid fa-bell"></i></div>
              <div class="order-step ${stepIdx >= 3 ? 'done' : ''}" title="Hoàn thành"><i class="fa-solid fa-flag-checkered"></i></div>
            </div>

            <div class="order-summary-box">
              <div>
                <span class="muted" style="font-size:0.82rem; display:block">Số món: <strong>${itemsCount} phần</strong></span>
                ${statusChip(paymentStatusClass(paymentStatus), paymentStatus === 'PAID' ? 'Đã thanh toán' : 'Chưa thanh toán')}
              </div>
              <div class="order-total-price">${formatCurrency(order.finalPrice ?? order.totalPrice)}</div>
            </div>

            <div class="row-actions" style="gap:0.4rem; justify-content:space-between;">
              <select class="table-quick-select" data-action="order-status-select" data-id="${order.id}">
                ${['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'COMPLETED', 'CANCELLED'].map(s => `<option value="${s}" ${rawStatus === s ? 'selected' : ''}>${s}</option>`).join('')}
              </select>
              <button class="btn btn-secondary btn-small" data-action="save-order-status" data-id="${order.id}">Lưu</button>
              ${paymentStatus !== 'PAID' ? `
                ${['READY', 'COMPLETED'].includes(rawStatus) ? `
                  <button class="btn btn-primary btn-small" data-action="open-admin-checkout" data-id="${order.id}" data-table="${order.RestaurantTable?.tableNumber || order.table_id || ''}" data-customer="${escapeHtml(customerName)}" data-amount="${order.finalPrice ?? order.totalPrice}" data-items="${itemsCount}" data-status="${rawStatus}" style="font-weight:800">
                    <i class="fa-solid fa-credit-card"></i> Thanh toán
                  </button>
                ` : `
                  <button class="btn btn-secondary btn-small" disabled style="opacity:0.55; cursor:not-allowed; font-weight:700" title="Đơn hàng chưa nấu xong! Chỉ có thể thanh toán khi món ăn SẴN SÀNG (Trạng thái READY)">
                    <i class="fa-solid fa-clock"></i> Chờ bếp (READY)
                  </button>
                `}
              ` : ''}
              <button class="btn btn-ghost btn-small" data-action="toggle-order-detail" data-id="${order.id}"><i class="fa-solid fa-chevron-down"></i></button>
            </div>

            <div class="mini-card hidden" data-order-detail="${order.id}">
              <h4 class="mini-card-title">Ghi chú: ${escapeHtml(order.note || 'Không có')}</h4>
              <div class="info-list" style="margin-top:0.6rem">
                ${items.map(item => `
                  <div class="info-row" style="padding:0.4rem 0.6rem">
                    <span>${escapeHtml(item.Product?.name || `#${item.product_id}`)} x${item.quantity}</span>
                    <strong>${formatCurrency(item.totalPrice || 0)}</strong>
                  </div>
                `).join('')}
              </div>
            </div>
          </article>
        `;
      }).join('')}
    </div>
  `;
}

export async function generatePayOSQRUrl(orderId, amount) {
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

    return {
      qrUrl,
      orderCode: res.orderCode || orderId,
      checkoutUrl: res.checkoutUrl || null
    };
  } catch (err) {
    console.warn('PayOS API Fallback:', err);
    return {
      qrUrl: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(`AppDatMon-DH${orderId}-Amount-${amount}`)}`,
      orderCode: orderId,
      checkoutUrl: null
    };
  }
}
