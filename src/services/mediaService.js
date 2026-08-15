import { storageService, STORAGE_KEYS } from './storageService';
import { genId } from '../utils/formatters';

class MediaService {
  getAll() {
    return storageService.read(STORAGE_KEYS.MEDIA, []);
  }

  create({ name, url, alt = '' }) {
    const media = { id: genId('media'), name: name || 'Hình ảnh chưa đặt tên', url, alt, createdAt: new Date().toISOString() };
    const all = this.getAll();
    all.unshift(media);
    storageService.write(STORAGE_KEYS.MEDIA, all);
    return media;
  }

  remove(id) {
    storageService.write(STORAGE_KEYS.MEDIA, this.getAll().filter((item) => item.id !== id));
  }
}

export const mediaService = new MediaService();
