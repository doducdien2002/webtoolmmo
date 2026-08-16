import { apiRequest } from './apiClient';

class AuthService {
  async getUsers() {
    const data = await apiRequest('/users');
    return data.users || [];
  }

  async register(payload) {
    const data = await apiRequest('/auth/register', { method: 'POST', body: payload });
    return data.user;
  }

  async login(payload) {
    const data = await apiRequest('/auth/login', { method: 'POST', body: payload });
    return data.user;
  }

  async logout() {
    await apiRequest('/auth/logout', { method: 'POST', body: {} });
  }

  async getCurrentUser() {
    const data = await apiRequest('/auth/me');
    return data.user || null;
  }

  async getUserById(userId) {
    const users = await this.getUsers();
    return users.find((u) => u.id === userId) || null;
  }
}

export const authService = new AuthService();
