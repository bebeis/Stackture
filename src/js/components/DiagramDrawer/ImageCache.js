export class ImageCache {
  constructor() {
    this.cache = new Map();
  }

  async getImage(src) {
    if (this.cache.has(src)) {
      return this.cache.get(src);
    }

    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      const imageLoadPromise = new Promise((resolve, reject) => {
        img.onload = () => resolve(img);
        img.onerror = reject;
      });

      img.src = src;
      const loadedImage = await imageLoadPromise;
      this.cache.set(src, loadedImage);
      return loadedImage;
    } catch (error) {
      console.error('이미지 로드 실패:', src, error);
      return null;
    }
  }

  clear() {
    this.cache.clear();
  }
} 