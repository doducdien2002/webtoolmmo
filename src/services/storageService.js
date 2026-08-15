/**
 * storageService.js
 * -----------------------------------------------------------------------
 * Lớp trừu tượng thao tác dữ liệu. Hiện tại dùng localStorage để giả lập
 * database, nhưng mọi truy cập dữ liệu trong app đều đi qua class này.
 * => Sau này chỉ cần viết lại các hàm bên trong (gọi fetch/axios tới API
 *    thật) mà KHÔNG cần sửa bất kỳ component/service nào khác.
 * -----------------------------------------------------------------------
 */
class StorageService {
  read(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      if (raw === null) return fallback;
      return JSON.parse(raw);
    } catch (err) {
      console.error(`[StorageService] Lỗi đọc key "${key}"`, err);
      return fallback;
    }
  }

  write(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (err) {
      console.error(`[StorageService] Lỗi ghi key "${key}"`, err);
    }
  }

  remove(key) {
    localStorage.removeItem(key);
  }
}

export const storageService = new StorageService();

// Danh sách khoá lưu trữ tập trung, tránh gõ tay chuỗi rải rác khắp nơi
export const STORAGE_KEYS = {
  USERS: 'ts_users',
  PRODUCTS: 'ts_products',
  ORDERS: 'ts_orders',
  SESSION: 'ts_session',
  MEDIA: 'ts_media',
};
