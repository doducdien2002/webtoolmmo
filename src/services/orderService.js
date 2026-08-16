import { apiRequest } from './apiClient';
import { ORDER_STATUS } from '../utils/constants';

class OrderService {
  async getAll() {
    const data = await apiRequest('/orders');
    return data.orders || [];
  }

  async getByUser() {
    return this.getAll();
  }

  async getPending() {
    return (await this.getAll())
      .filter((o) => o.status === ORDER_STATUS.PENDING)
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  }

  async checkout({ product, pkg }) {
    const data = await apiRequest('/orders/checkout', {
      method: 'POST',
      body: { productId: product.id, packageId: pkg.id },
    });
    return data.order;
  }

  async approve(orderId, note = '') {
    const data = await apiRequest(`/orders/${encodeURIComponent(orderId)}/approve`, { method: 'PATCH', body: { note } });
    return data.order;
  }

  async reject(orderId, note = '') {
    const data = await apiRequest(`/orders/${encodeURIComponent(orderId)}/reject`, { method: 'PATCH', body: { note } });
    return data.order;
  }

  async countByStatus(status) {
    return (await this.getAll()).filter((o) => o.status === status).length;
  }

  async totalRevenue() {
    return (await this.getAll())
      .filter((o) => o.status === ORDER_STATUS.ACTIVE)
      .reduce((sum, o) => sum + o.price, 0);
  }
}

export const orderService = new OrderService();
