import { apiRequest } from './apiClient';

class TopUpService {
  async getAll() {
    const data = await apiRequest('/topups');
    return data.topups || [];
  }

  async create(payload) {
    const data = await apiRequest('/topups', { method: 'POST', body: payload });
    return data.topup;
  }

  async approve(id, note = '') {
    const data = await apiRequest(`/topups/${encodeURIComponent(id)}/approve`, { method: 'PATCH', body: { note } });
    return data.topup;
  }

  async reject(id, note = '') {
    const data = await apiRequest(`/topups/${encodeURIComponent(id)}/reject`, { method: 'PATCH', body: { note } });
    return data.topup;
  }
}

export const topUpService = new TopUpService();
