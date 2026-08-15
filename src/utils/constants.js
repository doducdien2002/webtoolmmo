// Vai trò người dùng trong hệ thống
export const ROLES = {
  USER: 'user',
  ADMIN: 'admin',
};

// Trạng thái của 1 đơn mua / key sau khi khách hàng thanh toán
export const ORDER_STATUS = {
  PENDING: 'pending', // vừa mua, đang chờ admin kích hoạt
  ACTIVE: 'active', // admin đã duyệt & kích hoạt key
  REJECTED: 'rejected', // admin từ chối (vd: thanh toán lỗi)
};

export const ORDER_STATUS_LABEL = {
  [ORDER_STATUS.PENDING]: 'Chờ kích hoạt',
  [ORDER_STATUS.ACTIVE]: 'Đã kích hoạt',
  [ORDER_STATUS.REJECTED]: 'Đã từ chối',
};

export const CATEGORIES = [
  { id: 'all', label: 'Tất cả' },
  { id: 'facebook', label: 'Facebook Tool' },
  { id: 'tiktok', label: 'TikTok' },
  { id: 'instagram', label: 'Instagram Tool' },
  { id: 'telegram', label: 'Telegram Tool' },
  { id: 'email', label: 'Email Tool' },
  { id: 'ai', label: 'AI Tool' },
];

export const CURRENCY = 'đ';
