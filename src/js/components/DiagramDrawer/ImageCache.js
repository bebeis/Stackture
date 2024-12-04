export class ImageCache {
  constructor() {
    this.cache = new Map();
    this.sessionCache = window.sessionStorage;
  }

  async getImage(src) {
    if (this.cache.has(src)) {
      return this.cache.get(src);
    }

    const sessionData = this.sessionCache.getItem(src);
    if (sessionData) {
      const img = new Image();
      img.src = sessionData;
      this.cache.set(src, img);
      return img;
    }

    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      const imageLoadPromise = new Promise((resolve, reject) => {
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0);
          
          const dataUrl = canvas.toDataURL('image/png');
          this.sessionCache.setItem(src, dataUrl);
          
          resolve(img);
        };
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