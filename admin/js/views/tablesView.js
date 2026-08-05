// Modular Tables View (Giao diện Quản lý Bàn ăn Tối giản)
import { TABLE_STATUS_MAP } from '../config.js';
import { escapeHtml } from '../utils.js';

export function renderTablesFloorGrid(tables, activeFilter = 'ALL') {
  if (!tables || tables.length === 0) {
    return `<div class="empty-state"><strong>Chưa có dữ liệu bàn ăn</strong></div>`;
  }

  let filtered = tables;
  if (activeFilter && activeFilter !== 'ALL') {
    filtered = tables.filter(t => String(t.calculatedStatus || t.status).toUpperCase() === activeFilter);
  }

  if (filtered.length === 0) {
    return `<div class="empty-state"><strong>Không tìm thấy bàn ăn ở trạng thái này</strong></div>`;
  }

  const now = new Date();

  return `
    <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(240px, 1fr)); gap:1rem">
      ${filtered.map(table => {
        const st = String(table.calculatedStatus || table.status).toUpperCase();
        const info = TABLE_STATUS_MAP[st] || TABLE_STATUS_MAP.AVAILABLE;

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

        const targetUrl = `http://54.81.9.236:3000/menu?tableId=${table.id}`;
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
              <select class="table-quick-select" data-action="table-status-select" data-id="${table.id}" style="width:100%">
                <option value="AVAILABLE" ${st === 'AVAILABLE' ? 'selected' : ''}>🟢 Bàn trống</option>
                <option value="OCCUPIED" ${st === 'OCCUPIED' ? 'selected' : ''}>🟡 Đang ăn</option>
                <option value="BOOKED" ${st === 'BOOKED' ? 'selected' : ''}>🔵 Đặt trước</option>
                <option value="CLEANING" ${st === 'CLEANING' ? 'selected' : ''}>🟣 Cần dọn</option>
              </select>
              <button class="btn btn-secondary btn-small" data-action="save-table-status" data-id="${table.id}">Lưu</button>
            </div>
          </article>
        `;
      }).join('')}
    </div>
  `;
}
