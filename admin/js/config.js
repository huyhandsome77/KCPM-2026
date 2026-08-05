// System Configuration & Constants
export const API_BASE_URL = (window.ADMIN_API_BASE_URL || localStorage.getItem('appdatmon_admin_api_base') || 'http://localhost:3000').replace(/\/$/, '');
export const TOKEN_KEY = 'appdatmon_admin_token';
export const USER_KEY = 'appdatmon_admin_user';

export const RESERVATION_STATUS_MAP = {
  CONFIRMED: '<span class="badge-inline" style="background:#eff6ff; color:#1e40af; font-weight:700">⚡ Đã xác nhận</span>',
  CHECKED_IN: '<span class="badge-inline" style="background:#f0fdf4; color:#166534; font-weight:700">📌 Đã nhận bàn</span>',
  CANCELLED: '<span class="badge-inline" style="background:#fef2f2; color:#991b1b; font-weight:700">❌ Đã hủy</span>',
  PENDING: '<span class="badge-inline" style="background:#fffbeb; color:#9a3412; font-weight:700">⏳ Chờ duyệt</span>'
};

export const TABLE_STATUS_MAP = {
  AVAILABLE: { label: '🟢 Bàn trống', cssClass: 'st-available' },
  BOOKED: { label: '🔵 Đặt trước', cssClass: 'st-booked' },
  OCCUPIED: { label: '🟡 Đang ăn', cssClass: 'st-occupied' },
  CLEANING: { label: '🟣 Cần dọn', cssClass: 'st-cleaning' }
};
