import { apiRequest } from './apiClient';

class MediaService {
  async getAll() {
    const data = await apiRequest('/media');
    return data.media || [];
  }

  async create({ name, url, alt = '' }) {
    const data = await apiRequest('/media/url', { method: 'POST', body: { name, url, alt } });
    return data.media;
  }

  async uploadFile(file) {
    const dataBase64 = await fileToBase64(file);
    const data = await apiRequest('/media/upload', {
      method: 'POST',
      body: { name: file.name, type: file.type, dataBase64 },
    });
    return data.media;
  }

  async remove(id) {
    await apiRequest(`/media/${encodeURIComponent(id)}`, { method: 'DELETE', body: {} });
  }
}

export const mediaService = new MediaService();

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(',')[1] || '');
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
