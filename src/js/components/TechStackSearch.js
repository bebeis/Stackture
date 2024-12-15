// src/js/components/TechStackSearch.js
import { TechStackService } from '../services/TechStackService.js';

export class TechStackSearch {
    constructor() {
        this.techStacks = [];
        this.selectedTechs = new Set();
        this.searchInput = document.querySelector('.search-box');
        this.searchResults = document.querySelector('.search-results');
        this.selectedGrid = document.querySelector('.selected-grid');
        this.techStackService = new TechStackService();
        this.floatingIcons = null;
        
        this.init();
    }

    async init() {
        try {
            console.log('Fetching tech stacks...');
            this.techStacks = await this.techStackService.getTechStacks();
            console.log('Fetched tech stacks:', this.techStacks);
            this.setupEventListeners();
        } catch (error) {
            console.error('Failed to initialize tech stacks:', error);
            // mockData 사용
            const { mockTechStacks } = await import('../data/mockData.js');
            this.techStacks = mockTechStacks;
            this.setupEventListeners();
        }
    }

    setupEventListeners() {
        // 어 입력할 때마다 실시간으로 결과 표시
        this.searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.trim();
            this.showSearchResults(searchTerm);
        });

        // 검색창 포커스 시 마지막 검색 결과 다시 표시
        this.searchInput.addEventListener('focus', (e) => {
            const searchTerm = e.target.value.trim();
            if (searchTerm) {
                this.showSearchResults(searchTerm);
            }
        });

        // 검색창 외부 클릭 시 결과 숨김
        document.addEventListener('click', (e) => {
            if (!this.searchResults.contains(e.target) && 
                !this.searchInput.contains(e.target)) {
                this.hideSearchResults();
            }
        });
    }

    showSearchResults(searchTerm) {
        if (!searchTerm) {
            this.hideSearchResults();
            return;
        }

        const filteredTechs = this.techStacks.filter(tech => 
            tech.name.toLowerCase().includes(searchTerm.toLowerCase())
        );

        if (filteredTechs.length === 0) {
            this.searchResults.innerHTML = '<div class="no-results">검색 결과가 없습니다</div>';
        } else {
            this.searchResults.innerHTML = filteredTechs.map(tech => {
                const cachedImage = this.techStackService.getCachedImage(tech.icon);
                const iconSrc = cachedImage ? cachedImage.src : tech.icon;
                
                return `
                    <div class="tech-item" data-id="${tech.id}">
                        <img src="${iconSrc}" alt="${tech.name}" class="tech-icon">
                        <span>${tech.name}</span>
                    </div>
                `;
            }).join('');
            
            // 검색 결과 클릭 이벤트
            this.searchResults.querySelectorAll('.tech-item').forEach(item => {
                item.addEventListener('click', () => {
                    const techId = Number(item.dataset.id);
                    this.addTechStack(techId);
                    this.hideSearchResults();
                    this.searchInput.value = '';
                });
            });
        }

        this.searchResults.classList.add('active');
    }

    hideSearchResults() {
        this.searchResults.classList.remove('active');
    }

    addTechStack(techId) {
        const tech = this.techStacks.find(t => t.id === techId);
        if (!tech || this.selectedTechs.has(techId)) return;

        this.selectedTechs.add(techId);
        this.updateSelectedGrid();
        
        if (this.floatingIcons) {
            this.floatingIcons.jumpToSearchBar(techId);
        }
    }

    updateSelectedGrid() {
        const selectedTechStacks = this.techStacks.filter(tech => 
            this.selectedTechs.has(tech.id)
        );

        // 태그 업데이트
        const selectedTagsContainer = document.querySelector('.selected-tags');
        selectedTagsContainer.innerHTML = selectedTechStacks.map(tech => `
            <div class="tech-tag" data-id="${tech.id}">
                <img src="${tech.icon}" alt="${tech.name}">
                <span>${tech.name}</span>
                <span class="remove-tag" data-tech-id="${tech.id}">×</span>
            </div>
        `).join('');

        // 태그 삭제 이벤트 리스너 추가
        selectedTagsContainer.querySelectorAll('.remove-tag').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const techId = Number(e.target.dataset.techId);
                this.removeTechStack(techId);
            });
        });

        this.updateCategoryGrid(); // 카테고리 그리드 업데이트를 위한 새로운 메서드 호출
    }

    // 카테고리별 그리드 업데이트를 위한 새로운 메서드
    updateCategoryGrid() {
        const selectedTechStacks = this.techStacks.filter(tech => 
            this.selectedTechs.has(tech.id)
        );

        const allCategories = [...new Set(this.techStacks.map(tech => tech.category))];
        const categoryNames = {
            frontend: '프론트엔드',
            backend: '백엔드',
            database: '데이터베이스',
            devops: '데브옵스',
            language: '프로그래밍 언어',
            cloud: '클라우드'
        };

        this.selectedGrid.innerHTML = allCategories.map(category => {
            const techsInCategory = selectedTechStacks.filter(tech => tech.category === category);
            if (techsInCategory.length === 0) return '';

            return `
                <div class="category-section">
                    <h4 class="category-title">${categoryNames[category] || category}</h4>
                    <div class="category-items">
                        ${techsInCategory.map(tech => `
                            <div class="tech-item selected" data-id="${tech.id}">
                                <img src="${tech.icon}" alt="${tech.name}" class="tech-icon">
                                <span>${tech.name}</span>
                                <button class="remove-btn" data-tech-id="${tech.id}">×</button>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }).join('');

        // 카테고리 그리드의 삭제 버튼에도 이벤트 리스너 추가
        this.selectedGrid.querySelectorAll('.remove-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const techId = Number(e.target.dataset.techId);
                this.selectedTechs.delete(techId);
                this.updateSelectedGrid();
            });
        });
    }

    removeTechStack(techId) {
        const tech = this.techStacks.find(t => t.id === techId);
        if (!tech) return;
        
        // FloatingIcons 애니메이션을 먼저 실행
        if (this.floatingIcons) {
            this.floatingIcons.dropFromSearchBar(tech);
        }

        // 약간의 지연 후 태그 제거
        setTimeout(() => {
            this.selectedTechs.delete(techId);
            this.updateSelectedGrid();
            this.updateCategoryGrid();
        }, 100);
    }

    getSelectedTechStacks() {
        return this.techStacks.filter(tech => this.selectedTechs.has(tech.id));
    }

    setFloatingIcons(floatingIcons) {
        this.floatingIcons = floatingIcons;
    }
}