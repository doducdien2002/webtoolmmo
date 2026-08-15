export function formatVND(amount = 0) {
  return amount.toLocaleString('vi-VN') + 'đ';
}

export function formatDateTime(isoString) {
  if (!isoString) return '—';
  const d = new Date(isoString);
  return d.toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function genLicenseKey() {
  const seg = () =>
    Math.random().toString(36).substring(2, 6).toUpperCase();
  return `TS-${seg()}-${seg()}-${seg()}`;
}

export function genId(prefix = 'id') {
  return `${prefix}_${Date.now().toString(36)}_${Math.random()
    .toString(36)
    .slice(2, 8)}`;
}
