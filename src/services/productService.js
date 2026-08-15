import { storageService, STORAGE_KEYS } from './storageService';
import { SEED_PRODUCTS } from '../data/seedData';
import { genId } from '../utils/formatters';

/**
 * ProductService
 * -----------------------------------------------------------------------
 * Quản lý danh sách sản phẩm/tool: xem, tạo mới, cập nhật, xoá (admin).
 * -----------------------------------------------------------------------
 */
class ProductService {
  constructor() {
    this._ensureSeedData();
  }

  _ensureSeedData() {
    const products = storageService.read(STORAGE_KEYS.PRODUCTS, null);
    if (!products) {
      storageService.write(STORAGE_KEYS.PRODUCTS, SEED_PRODUCTS);
    }
  }

  getAll() {
    return storageService.read(STORAGE_KEYS.PRODUCTS, []);
  }

  getById(productId) {
    return this.getAll().find((p) => p.id === productId) || null;
  }

  getByCategory(categoryId) {
    const all = this.getAll();
    if (!categoryId || categoryId === 'all') return all;
    return all.filter((p) => p.category === categoryId);
  }

  create(product) {
    const all = this.getAll();
    const newProduct = {
      id: genId('p'),
      views: 0,
      packages: [],
      ...product,
    };
    all.unshift(newProduct);
    storageService.write(STORAGE_KEYS.PRODUCTS, all);
    return newProduct;
  }

  update(productId, patch) {
    const all = this.getAll();
    const idx = all.findIndex((p) => p.id === productId);
    if (idx === -1) return null;
    all[idx] = { ...all[idx], ...patch };
    storageService.write(STORAGE_KEYS.PRODUCTS, all);
    return all[idx];
  }

  remove(productId) {
    const all = this.getAll().filter((p) => p.id !== productId);
    storageService.write(STORAGE_KEYS.PRODUCTS, all);
  }

  incrementViews(productId) {
    const product = this.getById(productId);
    if (!product) return;
    this.update(productId, { views: (product.views || 0) + 1 });
  }
}

export const productService = new ProductService();
