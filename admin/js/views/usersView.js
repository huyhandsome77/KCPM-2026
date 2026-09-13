// Modular Users View (Giao diện Quản lý Người dùng & Điểm thưởng)
import { formatNumber, escapeHtml, userInitials, statusChip } from '../utils.js';

export function renderUsersGrid(users) {
  if (!users || users.length === 0) {
    return `
      <div class="empty-state">
        <div class="empty-state-icon" style="font-size:2.5rem; color:#94a3b8; margin-bottom:0.75rem">
          <i class="fa-solid fa-users-slash"></i>
        </div>
        <strong>Không tìm thấy tài khoản người dùng phù hợp</strong>
        <p style="color:#64748b; font-size:0.9rem; margin-top:0.3rem">Thử tìm kiếm với từ khóa khác hoặc xóa bộ lọc tìm kiếm.</p>
        <div style="margin-top:1rem">
          <button class="btn btn-secondary btn-small" data-action="clear-search" data-view="users">
            <i class="fa-solid fa-rotate-left"></i> Xóa bộ lọc tìm kiếm
          </button>
        </div>
      </div>
    `;
  }

  return `
    <div class="users-grid-container">
      ${users.map(user => {
        const initials = userInitials(user);
        const roleStr = String(user.role || 'CUSTOMER').toUpperCase();
        const isBlocked = String(user.status || 'ACTIVE').toUpperCase() === 'BLOCKED' || String(user.status || '').toUpperCase() === 'INACTIVE';
        const roleLabelMap = {
          'ADMIN': 'Quản trị viên',
          'STAFF': 'Nhân viên phục vụ',
          'KITCHEN': 'Đầu bếp',
          'CUSTOMER': 'Khách hàng'
        };
        const roleText = roleLabelMap[roleStr] || roleStr;

        return `
          <article class="user-card-premium ${isBlocked ? 'is-blocked' : ''}">
            <!-- Header: Avatar, Name, Status Badge -->
            <div class="user-card-header">
              <div class="user-avatar-wrap">
                ${user.avatar
                  ? `<img src="${escapeHtml(user.avatar)}" alt="${escapeHtml(user.fullName || user.username)}" class="user-avatar-img" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" /><div class="user-avatar-initials" style="display:none">${initials}</div>`
                  : `<div class="user-avatar-initials">${initials}</div>`
                }
                <span class="user-online-dot ${isBlocked ? 'blocked' : 'active'}" title="${isBlocked ? 'Tài khoản bị khóa' : 'Đang hoạt động'}"></span>
              </div>

              <div class="user-title-wrap">
                <div class="user-name-row">
                  <h4 class="user-full-name" title="${escapeHtml(user.fullName || user.username)}">${escapeHtml(user.fullName || 'Người dùng')}</h4>
                  <span class="user-id-badge">#${user.id}</span>
                </div>
                <div class="user-username-text" title="@${escapeHtml(user.username || 'user')}">@${escapeHtml(user.username || 'user')}</div>
              </div>

              <div class="user-status-pill ${isBlocked ? 'status-blocked' : 'status-active'}">
                <i class="fa-solid ${isBlocked ? 'fa-lock' : 'fa-circle-check'}"></i>
                <span>${isBlocked ? 'Bị khóa' : 'Hoạt động'}</span>
              </div>
            </div>

            <!-- Contact Information -->
            <div class="user-card-info-list">
              <div class="user-info-item" title="${escapeHtml(user.phone || 'Chưa cập nhật')}">
                <i class="fa-solid fa-phone info-icon"></i>
                <span class="info-text">${escapeHtml(user.phone || 'Chưa có SĐT')}</span>
              </div>
              <div class="user-info-item" title="${escapeHtml(user.email || 'Chưa cập nhật')}">
                <i class="fa-solid fa-envelope info-icon"></i>
                <span class="info-text">${escapeHtml(user.email || 'Chưa có email')}</span>
              </div>
            </div>

            <!-- Role & Points Bar -->
            <div class="user-card-meta-bar">
              <div class="user-role-cell">
                <span class="meta-label">Vai trò</span>
                <span class="user-role-tag role-${roleStr.toLowerCase()}">${escapeHtml(roleText)}</span>
              </div>
              <div class="user-points-cell">
                <span class="meta-label">Điểm tích lũy</span>
                <span class="user-points-val">🪙 ${formatNumber(user.points ?? 0)} p</span>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="user-card-actions">
              <button class="btn btn-ghost btn-small" data-action="view-user-detail" data-id="${user.id}" title="Xem chi tiết người dùng">
                <i class="fa-solid fa-eye"></i> Chi tiết
              </button>
              <button class="btn btn-secondary btn-small" data-action="edit-record" data-view="users" data-id="${user.id}" title="Chỉnh sửa thông tin">
                <i class="fa-solid fa-pen"></i> Sửa
              </button>
              <button class="btn ${isBlocked ? 'btn-success-soft' : 'btn-warning-soft'} btn-small" data-action="toggle-user-status" data-id="${user.id}" title="${isBlocked ? 'Mở khóa tài khoản' : 'Khóa tài khoản'}">
                <i class="fa-solid ${isBlocked ? 'fa-lock-open' : 'fa-lock'}"></i> ${isBlocked ? 'Mở' : 'Khóa'}
              </button>
              <button class="btn btn-danger btn-small" data-action="delete-record" data-view="users" data-id="${user.id}" title="Xóa tài khoản">
                <i class="fa-solid fa-trash"></i>
              </button>
            </div>
          </article>
        `;
      }).join('')}
    </div>
  `;
}

export function renderUsersTable(users) {
  if (!users || users.length === 0) {
    return `
      <div class="empty-state">
        <div class="empty-state-icon" style="font-size:2.5rem; color:#94a3b8; margin-bottom:0.75rem">
          <i class="fa-solid fa-users-slash"></i>
        </div>
        <strong>Không tìm thấy tài khoản người dùng phù hợp</strong>
        <p style="color:#64748b; font-size:0.9rem; margin-top:0.3rem">Thử tìm kiếm với từ khóa khác hoặc xóa bộ lọc tìm kiếm.</p>
        <div style="margin-top:1rem">
          <button class="btn btn-secondary btn-small" data-action="clear-search" data-view="users">
            <i class="fa-solid fa-rotate-left"></i> Xóa bộ lọc tìm kiếm
          </button>
        </div>
      </div>
    `;
  }

  return `
    <div class="table-wrap">
      <table class="data-table">
        <thead>
          <tr>
            <th style="min-width:220px"><i class="fa-solid fa-user" style="color:#3b82f6; margin-right:0.35rem"></i> Thành viên</th>
            <th style="min-width:140px"><i class="fa-solid fa-phone" style="color:#64748b; margin-right:0.35rem"></i> Số điện thoại</th>
            <th style="min-width:180px"><i class="fa-solid fa-envelope" style="color:#64748b; margin-right:0.35rem"></i> Email</th>
            <th style="min-width:120px"><i class="fa-solid fa-user-shield" style="color:#8b5cf6; margin-right:0.35rem"></i> Vai trò</th>
            <th style="min-width:120px"><i class="fa-solid fa-coins" style="color:#d97706; margin-right:0.35rem"></i> Điểm</th>
            <th style="min-width:120px"><i class="fa-solid fa-shield-halved" style="color:#10b981; margin-right:0.35rem"></i> Trạng thái</th>
            <th style="text-align:right; min-width:160px">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          ${users.map(user => {
            const initials = userInitials(user);
            const roleStr = String(user.role || 'CUSTOMER').toUpperCase();
            const isBlocked = String(user.status || 'ACTIVE').toUpperCase() === 'BLOCKED' || String(user.status || '').toUpperCase() === 'INACTIVE';
            const roleLabelMap = {
              'ADMIN': 'Quản trị viên',
              'STAFF': 'Nhân viên',
              'KITCHEN': 'Đầu bếp',
              'CUSTOMER': 'Khách hàng'
            };
            const roleText = roleLabelMap[roleStr] || roleStr;

            return `
              <tr class="${isBlocked ? 'row-blocked' : ''}">
                <td>
                  <div style="display:flex; align-items:center; gap:0.75rem; min-width:0">
                    <div class="user-avatar-wrap-sm" style="flex-shrink:0">
                      ${user.avatar
                        ? `<img src="${escapeHtml(user.avatar)}" alt="${escapeHtml(user.fullName || user.username)}" class="user-avatar-img-sm" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" /><div class="user-avatar-initials-sm" style="display:none">${initials}</div>`
                        : `<div class="user-avatar-initials-sm">${initials}</div>`
                      }
                    </div>
                    <div style="min-width:0; overflow:hidden">
                      <div style="display:flex; align-items:center; gap:0.4rem">
                        <strong style="font-size:0.92rem; color:#0f172a; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; display:block" title="${escapeHtml(user.fullName || user.username)}">${escapeHtml(user.fullName || 'Người dùng')}</strong>
                        <span style="font-size:0.72rem; color:#94a3b8; font-weight:700">#${user.id}</span>
                      </div>
                      <small style="color:#64748b; display:block; white-space:nowrap; overflow:hidden; text-overflow:ellipsis" title="@${escapeHtml(user.username || 'user')}">@${escapeHtml(user.username || 'user')}</small>
                    </div>
                  </div>
                </td>
                <td style="white-space:nowrap">
                  <i class="fa-solid fa-phone" style="font-size:0.75rem; color:#94a3b8; margin-right:0.3rem"></i>
                  ${escapeHtml(user.phone || '-')}
                </td>
                <td style="max-width:200px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis" title="${escapeHtml(user.email || '-')}">
                  ${user.email ? `<i class="fa-solid fa-envelope" style="font-size:0.75rem; color:#94a3b8; margin-right:0.3rem"></i>${escapeHtml(user.email)}` : '-'}
                </td>
                <td>
                  <span class="user-role-tag role-${roleStr.toLowerCase()}">${escapeHtml(roleText)}</span>
                </td>
                <td>
                  <strong style="color:#d97706; font-size:0.88rem">🪙 ${formatNumber(user.points ?? 0)}</strong>
                </td>
                <td>
                  <span class="user-status-pill ${isBlocked ? 'status-blocked' : 'status-active'}">
                    <i class="fa-solid ${isBlocked ? 'fa-lock' : 'fa-circle-check'}"></i>
                    ${isBlocked ? 'Bị khóa' : 'Hoạt động'}
                  </span>
                </td>
                <td style="text-align:right">
                  <div class="row-actions" style="justify-content:flex-end; gap:0.3rem">
                    <button class="btn btn-ghost btn-small" data-action="view-user-detail" data-id="${user.id}" title="Xem chi tiết"><i class="fa-solid fa-eye"></i></button>
                    <button class="btn btn-secondary btn-small" data-action="edit-record" data-view="users" data-id="${user.id}" title="Sửa"><i class="fa-solid fa-pen"></i></button>
                    <button class="btn ${isBlocked ? 'btn-success-soft' : 'btn-warning-soft'} btn-small" data-action="toggle-user-status" data-id="${user.id}" title="${isBlocked ? 'Mở khóa tài khoản' : 'Khóa tài khoản'}">
                      <i class="fa-solid ${isBlocked ? 'fa-lock-open' : 'fa-lock'}"></i>
                    </button>
                    <button class="btn btn-danger btn-small" data-action="delete-record" data-view="users" data-id="${user.id}" title="Xóa"><i class="fa-solid fa-trash"></i></button>
                  </div>
                </td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    </div>
  `;
}
