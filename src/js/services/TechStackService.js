import { database, storage } from '../firebase/firebase-config.js';
import { mockTechStacks } from '../data/mockData.js';

export class TechStackService {
    async getTechStacks() {
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
                return techStacksWithIcons;
            }
            console.warn('No data found in Firebase, using mock data');
            return mockTechStacks;
        } catch (error) {
            console.error('Firebase error:', error);
            return mockTechStacks;
        }
    }

    filterTechStacks(techStacks, searchTerm) {
        return techStacks.filter(tech => 
            tech.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }
}