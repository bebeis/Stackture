export class FloatingIcons {
    constructor() {
        this.container = document.querySelector('.floating-icons-container');
        this.icons = [];
        this.iconSize = 48;
        this.techStackSearch = null;
        this.searchBarRect = null;
    }

    setTechStackSearch(techStackSearch) {
        this.techStackSearch = techStackSearch;
        this.searchBarRect = document.querySelector('.search-box').getBoundingClientRect();
        this.init();
    }

    jumpToSearchBar(techId) {
        const icon = this.icons.find(icon => icon.tech.id === techId);
        if (!icon) return;

        // 현재 위치 저장
        const startX = icon.x;
        const startY = icon.y;

        // 검색바 중앙 위치 계산
        const endX = this.searchBarRect.left + (this.searchBarRect.width / 2) - (this.iconSize / 2);
        const endY = this.searchBarRect.top - this.iconSize;

        // 애니메이션 시작
        const startTime = performance.now();
        const duration = 800; // 0.8초

        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // 이지징 함수 적용 (부드러운 감속)
            const easeProgress = 1 - Math.pow(1 - progress, 3);

            // 직선 경로로 위로 올라가기
            const currentX = startX + (endX - startX) * easeProgress;
            const currentY = startY + (endY - startY) * easeProgress;

            icon.x = currentX;
            icon.y = currentY;
            icon.rotation += icon.rotationVelocity;

            icon.element.style.transform = 
                `translate3d(${currentX}px, ${currentY}px, 0) rotate(${icon.rotation}deg)`;

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                this.removeIcon(icon);
            }
        };

        requestAnimationFrame(animate);
    }

    dropFromSearchBar(tech) {
        const icon = this.createIcon(tech);
        this.container.appendChild(icon);

        // 시작 위치 (검색바)
        const startX = this.searchBarRect.left + (this.searchBarRect.width / 2) - (this.iconSize / 2);
        const startY = this.searchBarRect.top - this.iconSize;

        // 무작위 최종 위치
        const endX = Math.random() * (window.innerWidth - this.iconSize);
        const endY = window.innerHeight - this.iconSize;

        const iconData = {
            element: icon,
            x: startX,
            y: startY,
            velocityY: 0,
            velocityX: (Math.random() - 0.5) * 2,
            rotation: Math.random() * 360,
            rotationVelocity: (Math.random() - 0.5) * 4,
            width: this.iconSize,
            height: this.iconSize,
            tech: tech
        };

        this.icons.push(iconData);

        // 중력 애니메이션 시작
        let velocityY = 0;
        const gravity = 0.6;
        const bounce = 0.6;

        const animate = () => {
            velocityY += gravity;
            iconData.y += velocityY;

            // 바닥 충돌 체크
            if (iconData.y > window.innerHeight - this.iconSize) {
                iconData.y = window.innerHeight - this.iconSize;
                velocityY *= -bounce;
            }

            iconData.rotation += iconData.rotationVelocity;
            iconData.element.style.transform = 
                `translate3d(${iconData.x}px, ${iconData.y}px, 0) rotate(${iconData.rotation}deg)`;

            if (Math.abs(velocityY) > 0.1 || iconData.y < window.innerHeight - this.iconSize) {
                requestAnimationFrame(animate);
            }
        };

        requestAnimationFrame(animate);
    }

    removeIcon(icon) {
        const index = this.icons.indexOf(icon);
        if (index > -1) {
            this.icons.splice(index, 1);
            icon.element.remove();
        }
    }

    easeOutBack(x) {
        const c1 = 1.70158;
        const c3 = c1 + 1;
        return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
    }

    easeInBounce(x) {
        return 1 - this.bounceOut(1 - x);
    }

    bounceOut(x) {
        const n1 = 7.5625;
        const d1 = 2.75;
        
        if (x < 1 / d1) {
            return n1 * x * x;
        } else if (x < 2 / d1) {
            return n1 * (x -= 1.5 / d1) * x + 0.75;
        } else if (x < 2.5 / d1) {
            return n1 * (x -= 2.25 / d1) * x + 0.9375;
        } else {
            return n1 * (x -= 2.625 / d1) * x + 0.984375;
        }
    }

    async init() {
        if (!this.techStackSearch) return;

        try {
            const allIcons = this.techStackSearch.techStacks;
            
            allIcons.forEach((tech) => {
                const icon = this.createIcon(tech);
                this.container.appendChild(icon);
                
                const randomX = Math.random() * (window.innerWidth - this.iconSize);
                const randomY = -Math.random() * window.innerHeight * 2;
                
                this.icons.push({
                    element: icon,
                    x: randomX,
                    y: randomY,
                    velocityY: 0,
                    velocityX: (Math.random() - 0.5) * 2,
                    rotation: Math.random() * 360,
                    rotationVelocity: (Math.random() - 0.5) * 4,
                    width: this.iconSize,
                    height: this.iconSize,
                    tech: tech
                });
            });

            this.startAnimation();
        } catch (error) {
            console.error('Failed to initialize floating icons:', error);
        }
    }

    createIcon(tech) {
        const icon = document.createElement('img');
        const cachedImage = this.techStackSearch.techStackService.getCachedImage(tech.icon);
        
        if (cachedImage) {
            icon.src = cachedImage.src;
        } else {
            icon.src = tech.icon;
        }
        
        icon.className = 'floating-icon';
        icon.alt = tech.name;
        icon.draggable = false;
        icon.style.position = 'absolute';
        
        icon.addEventListener('click', () => {
            if (this.techStackSearch) {
                this.techStackSearch.addTechStack(tech.id);
            }
        });

        return icon;
    }

    checkCollision(icon1, icon2) {
        // 각 아이콘의 중심점 계산
        const center1 = {
            x: icon1.x + icon1.width / 2,
            y: icon1.y + icon1.height / 2
        };
        const center2 = {
            x: icon2.x + icon2.width / 2,
            y: icon2.y + icon2.height / 2
        };

        // 두 중심점 사이의 거리 계산
        const dx = center2.x - center1.x;
        const dy = center2.y - center1.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // 아이콘의 반지름 (정사각형 아이콘 기준)
        const radius = icon1.width / 2;
        
        // 두 원이 겹치는지 확인
        return distance < radius * 2;
    }

    resolveCollision(icon1, icon2) {
        // 각 아이콘의 중심점 계산
        const center1 = {
            x: icon1.x + icon1.width / 2,
            y: icon1.y + icon1.height / 2
        };
        const center2 = {
            x: icon2.x + icon2.width / 2,
            y: icon2.y + icon2.height / 2
        };

        // 충돌 각도 계산
        const dx = center2.x - center1.x;
        const dy = center2.y - center1.y;
        const angle = Math.atan2(dy, dx);
        const distance = Math.sqrt(dx * dx + dy * dy);

        // 겹침 정도 계산
        const radius = icon1.width / 2;
        const overlap = 2 * radius - distance;

        if (overlap > 0) {
            // 겹침을 해결하기 위해 아이콘들을 밀어냄
            const pushX = (overlap / 2) * Math.cos(angle);
            const pushY = (overlap / 2) * Math.sin(angle);

            icon1.x -= pushX;
            icon1.y -= pushY;
            icon2.x += pushX;
            icon2.y += pushY;

            // 충돌 후 속도 계산
            const normalX = dx / distance;
            const normalY = dy / distance;
            
            const p = 2 * (icon1.velocityX * normalX + icon1.velocityY * normalY);
            
            // 탄성 계수와 마찰 계수 설정
            const bounce = 0.5;  // 0.8에서 0.5로 감소
            const friction = 0.95;  // 마찰 계수

            icon1.velocityX -= p * normalX * bounce;
            icon1.velocityY -= p * normalY * bounce;
            icon2.velocityX += p * normalX * bounce;
            icon2.velocityY += p * normalY * bounce;
        }
    }

    startAnimation() {
        const gravity = 0.2;
        const bounce = 0.6;
        const friction = 0.99;

        const animate = () => {
            this.icons.forEach(icon => {
                icon.velocityY += gravity;
                icon.y += icon.velocityY;
                icon.x += icon.velocityX;
                icon.rotation += icon.rotationVelocity;

                // 바닥 충돌
                const bottom = window.innerHeight - this.iconSize;
                if (icon.y > bottom) {
                    icon.y = bottom;
                    icon.velocityY *= -bounce;
                    icon.velocityX *= friction;
                    icon.rotationVelocity *= friction;
                }

                // 벽 충돌
                if (icon.x < 0) {
                    icon.x = 0;
                    icon.velocityX *= -bounce;
                } else if (icon.x > window.innerWidth - this.iconSize) {
                    icon.x = window.innerWidth - this.iconSize;
                    icon.velocityX *= -bounce;
                }

                icon.element.style.transform = 
                    `translate3d(${icon.x}px, ${icon.y}px, 0) rotate(${icon.rotation}deg)`;
            });

            // 아이콘 간 충돌 체크
            for (let i = 0; i < this.icons.length; i++) {
                for (let j = i + 1; j < this.icons.length; j++) {
                    if (this.checkCollision(this.icons[i], this.icons[j])) {
                        this.resolveCollision(this.icons[i], this.icons[j]);
                    }
                }
            }

            requestAnimationFrame(animate);
        };

        animate();
    }
}
