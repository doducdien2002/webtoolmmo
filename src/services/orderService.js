import { storageService, STORAGE_KEYS } from './storageService';
import { ORDER_STATUS } from '../utils/constants';
import { genId, genLicenseKey } from '../utils/formatters';

/**
 * OrderService
 * -----------------------------------------------------------------------
 * Luồng nghiệp vụ chính:
 *  1. User chọn 1 gói (package) của sản phẩm -> checkout()
 *  2. Hệ thống sinh license key, tạo order với status = PENDING,
 *     đồng thời trừ số dư user (nếu đủ tiền).
 *  3. Order hiện lên khu vực Admin > Yêu cầu kích hoạt.
 *  4. Admin bấm "Kích hoạt" (approve) -> status = ACTIVE, user xem được
 *     key tại trang "Key của tôi". Hoặc admin "Từ chối" (reject) -> hoàn
 *     tiền lại cho user.
 * -----------------------------------------------------------------------
 */
class OrderService {
  getAll() {
    return storageService.read(STORAGE_KEYS.ORDERS, []);
  }

  saveAll(orders) {
    storageService.write(STORAGE_KEYS.ORDERS, orders);
  }

  getByUser(userId) {
    return this.getAll()
      .filter((o) => o.userId === userId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  getPending() {
    return this.getAll()
      .filter((o) => o.status === ORDER_STATUS.PENDING)
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  }

  /**
   * Tạo đơn mua mới (checkout). Trả về order vừa tạo.
   * Ném lỗi nếu số dư không đủ.
   */
  checkout({ user, product, pkg }) {
    if (!user) throw new Error('Bạn cần đăng nhập để mua sản phẩm.');
    if (user.balance < pkg.price) {
      throw new Error('Số dư không đủ. Vui lòng nạp thêm tiền.');
    }

    const order = {
      id: genId('order'),
      userId: user.id,
      userEmail: user.email,
      productId: product.id,
      productName: product.name,
      packageId: pkg.id,
      packageName: pkg.name,
      price: pkg.price,
      licenseKey: genLicenseKey(),
      status: ORDER_STATUS.PENDING,
      createdAt: new Date().toISOString(),
      activatedAt: null,
      adminNote: '',
    };

    const orders = this.getAll();
    orders.unshift(order);
    this.saveAll(orders);

    return order;
  }

  /** Admin duyệt & kích hoạt key cho user */
  approve(orderId, note = '') {
    return this._updateStatus(orderId, ORDER_STATUS.ACTIVE, note);
  }

  /** Admin từ chối đơn (vd nghi ngờ gian lận) */
  reject(orderId, note = '') {
    return this._updateStatus(orderId, ORDER_STATUS.REJECTED, note);
  }

  _updateStatus(orderId, status, note) {
    const orders = this.getAll();
    const idx = orders.findIndex((o) => o.id === orderId);
    if (idx === -1) return null;

    orders[idx] = {
      ...orders[idx],
      status,
      adminNote: note,
      activatedAt: status === ORDER_STATUS.ACTIVE ? new Date().toISOString() : orders[idx].activatedAt,
    };
    this.saveAll(orders);
    return orders[idx];
  }

  countByStatus(status) {
    return this.getAll().filter((o) => o.status === status).length;
  }

  totalRevenue() {
    return this.getAll()
      .filter((o) => o.status === ORDER_STATUS.ACTIVE)
      .reduce((sum, o) => sum + o.price, 0);
  }
}

export const orderService = new OrderService();
