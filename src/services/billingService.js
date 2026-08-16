import { apiRequest } from './apiClient';

class BillingService {
  async get() {
    const data = await apiRequest('/billing');
    return data.billing || {};
  }

  async update(payload) {
    const data = await apiRequest('/billing', { method: 'PUT', body: payload });
    return data.billing;
  }
}

export const billingService = new BillingService();
