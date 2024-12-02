import { database, storage } from '../firebase/firebase-config.js';
import { mockTechStacks } from '../data/mockData.js';

export class TechStackService {
    constructor() {
        this.imageCache = new Map();
        this.preloadPromises = new Map();
    }

    async getTechStacks() {
        try {
            const techStacks = await this.fetchTechStacks();
            await this.preloadImages(techStacks);
            return techStacks;
        } catch (error) {
            console.error('Failed to get tech stacks:', error);
            return mockTechStacks;
        }
    }

    async preloadImages(techStacks) {
        const preloadPromises = techStacks.map(tech => this.preloadImage(tech.icon));
        await Promise.all(preloadPromises);
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