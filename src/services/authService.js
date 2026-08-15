import { storageService, STORAGE_KEYS } from './storageService';
import { SEED_ADMIN } from '../data/seedData';
import { ROLES } from '../utils/constants';
import { genId } from '../utils/formatters';

/**
 * AuthService
 * -----------------------------------------------------------------------
 * Chịu trách nhiệm: đăng ký, đăng nhập, đăng xuất, lấy phiên hiện tại.
 * Toàn bộ danh sách user được lưu ở STORAGE_KEYS.USERS.
 * -----------------------------------------------------------------------
 */
class AuthService {
  constructor() {
    this._ensureSeedData();
  }

  _ensureSeedData() {
    const users = storageService.read(STORAGE_KEYS.USERS, null);
    if (!users) {
      storageService.write(STORAGE_KEYS.USERS, [SEED_ADMIN]);
    }
  }

  getUsers() {
    return storageService.read(STORAGE_KEYS.USERS, []);
  }

  saveUsers(users) {
    storageService.write(STORAGE_KEYS.USERS, users);
  }

  register({ fullName, email, password }) {
    const users = this.getUsers();
    const emailNorm = email.trim().toLowerCase();

    if (!fullName || !email || !password) {
      throw new Error('Vui lòng nhập đầy đủ thông tin.');
    }
    if (password.length < 6) {
      throw new Error('Mật khẩu phải có ít nhất 6 ký tự.');
    }
    if (users.some((u) => u.email.toLowerCase() === emailNorm)) {
      throw new Error('Email này đã được đăng ký.');
    }

    const newUser = {
      id: genId('user'),
      fullName: fullName.trim(),
      email: emailNorm,
      password, // demo only – thực tế cần hash phía backend
      role: ROLES.USER,
      balance: 0,
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    this.saveUsers(users);
    this.setSession(newUser);
    return newUser;
  }

  login({ email, password }) {
    const users = this.getUsers();
    const emailNorm = email.trim().toLowerCase();
    const user = users.find((u) => u.email.toLowerCase() === emailNorm);

    if (!user || user.password !== password) {
      throw new Error('Email hoặc mật khẩu không đúng.');
    }

    this.setSession(user);
    return user;
  }

  logout() {
    storageService.remove(STORAGE_KEYS.SESSION);
  }

  setSession(user) {
    const { password, ...safeUser } = user;
    storageService.write(STORAGE_KEYS.SESSION, safeUser);
  }

  getCurrentUser() {
    return storageService.read(STORAGE_KEYS.SESSION, null);
  }

  /** Cập nhật thông tin user (vd: số dư) và đồng bộ lại session nếu cần */
  updateUser(userId, patch) {
    const users = this.getUsers();
    const idx = users.findIndex((u) => u.id === userId);
    if (idx === -1) return null;

    users[idx] = { ...users[idx], ...patch };
    this.saveUsers(users);

    const current = this.getCurrentUser();
    if (current && current.id === userId) {
      this.setSession(users[idx]);
    }
    return users[idx];
  }

  getUserById(userId) {
    return this.getUsers().find((u) => u.id === userId) || null;
  }
}

export const authService = new AuthService();
