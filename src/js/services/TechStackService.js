import { database, storage } from '../firebase/firebase-config.js';
import { mockTechStacks } from '../data/mockData.js';

export class TechStackService {
    constructor() {
        this.imageCache = new Map();
        this.preloadPromises = new Map();
        console.log('TechStackService 초기화됨');
    }

    async fetchTechStacks() {
        try {
            console.log('Fetching tech stacks from Firebase...');
            const snapshot = await database.ref('api/tech-stacks').get();
            
            if (snapshot.exists()) {
                const techStacks = snapshot.val();
                console.log('Raw tech stacks data:', techStacks);
                
                // Storage에서 아이콘 URL 가져오기
                const techStacksWithIcons = await Promise.all(
                    techStacks.map(async tech => {
                        try {
                            const iconFileName = tech.name.toLowerCase()
                                .replace('.', '')
                                .replace(/\s+/g, '');
                            console.log(`Fetching icon for ${tech.name}: ${iconFileName}.svg`);
                            const iconUrl = await storage.ref(`tech-stack/${iconFileName}.svg`)
                                .getDownloadURL();
                            return { ...tech, icon: iconUrl };
                        } catch (error) {
                            console.warn(`Icon load failed for ${tech.name}:`, error);
                            return {
                                ...tech,
                                icon: `./public/icons/${tech.name.toLowerCase().replace('.', '')}.svg`
                            };
                        }
                    })
                );
                
                console.log('Tech stacks with icons:', techStacksWithIcons);
                await this.preloadImages(techStacksWithIcons);
                return techStacksWithIcons;
            }
            
            console.warn('No data found in Firebase, using mock data');
            return mockTechStacks;
        } catch (error) {
            console.error('Firebase에서 데이터 가져오기 실패:', error);
            console.error('오류 상세 정보:', {
                name: error.name,
                message: error.message,
                stack: error.stack
            });
            throw error;
        }
    }

    async getTechStacks() {
        try {
            console.log('기술 스택 데이터 가져오기 시작...');
            const techStacks = await this.fetchTechStacks();
            console.log('이미지 프리로딩 시작...');
            await this.preloadImages(techStacks);
            console.log('기술 스택 데이터 처리 완료');
            return techStacks;
        } catch (error) {
            console.error('기술 스택 가져오기 실패:', error);
            console.log('대체 데이터(mockTechStacks) 사용');
            return mockTechStacks;
        }
    }

    async preloadImages(techStacks) {
        const loadingOverlay = document.querySelector('.loading-overlay');
        
        try {
            console.log('이미지 프리로딩 시작...');
            const preloadPromises = techStacks.map(tech => this.preloadImage(tech.icon));
            await Promise.all(preloadPromises);
            console.log('이미지 프리로딩 완료');
            
            // CSS 트랜지션을 위한 스타일 추가
            loadingOverlay.style.transition = 'opacity 0.5s ease-in-out';
            loadingOverlay.style.opacity = '0';
            
            // 페이드 아웃 후 요소 제거
            setTimeout(() => {
                loadingOverlay.remove();
            }, 500);
            
        } catch (error) {
            console.error('이미지 프리로딩 실패:', error);
            if (loadingOverlay) {
                loadingOverlay.remove();
            }
        }
    }

    preloadImage(src) {
        if (this.preloadPromises.has(src)) {
            return this.preloadPromises.get(src);
        }

        const promise = new Promise((resolve, reject) => {
            if (this.imageCache.has(src)) {
                resolve(this.imageCache.get(src));
                return;
            }

            const img = new Image();
            
            img.onload = () => {
                this.imageCache.set(src, img);
                resolve(img);
            };
            
            img.onerror = (err) => {
                console.warn(`Failed to preload image: ${src}`, err);
                reject(err);
            };

            img.src = src;
        });

        this.preloadPromises.set(src, promise);
        return promise;
    }

    getCachedImage(src) {
        return this.imageCache.get(src);
    }

    filterTechStacks(techStacks, searchTerm) {
        return techStacks.filter(tech => 
            tech.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }
}