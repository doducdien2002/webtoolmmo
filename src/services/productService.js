import { apiRequest } from './apiClient';

class ProductService {
  async getAll() {
    const data = await apiRequest('/products');
    return data.products || [];
  }

  async getById(productId) {
    const data = await apiRequest(`/products/${encodeURIComponent(productId)}`);
    return data.product || null;
  }

  async getByCategory(categoryId) {
    const all = await this.getAll();
    if (!categoryId || categoryId === 'all') return all;
    return all.filter((p) => p.category === categoryId);
  }

  async create(product) {
    const data = await apiRequest('/products', { method: 'POST', body: product });
    return data.product;
  }

  async update(productId, patch) {
    const data = await apiRequest(`/products/${encodeURIComponent(productId)}`, { method: 'PATCH', body: patch });
    return data.product;
  }

  async remove(productId) {
    await apiRequest(`/products/${encodeURIComponent(productId)}`, { method: 'DELETE', body: {} });
  }

  async incrementViews(productId) {
    await apiRequest(`/products/${encodeURIComponent(productId)}/views`, { method: 'POST', body: {} });
  }
}

export const productService = new ProductService();
