export class FloatingIcons {
    constructor() {
        this.container = document.querySelector('.floating-icons-container');
        this.icons = [];
        this.iconSize = 48;
        this.techStackSearch = null;
        this.init();
    }

    setTechStackSearch(techStackSearch) {
        this.techStackSearch = techStackSearch;
    }

    async init() {
        try {
            const { mockTechStacks } = await import('../data/mockData.js');
            const allIcons = mockTechStacks;
            
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
                    height: this.iconSize
                });
            });

            this.startAnimation();
        } catch (error) {
            console.error('Failed to initialize floating icons:', error);
        }
    }

    createIcon(tech) {
        const icon = document.createElement('img');
        icon.src = tech.icon;
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
        return (
            icon1.x < icon2.x + icon2.width &&
            icon1.x + icon1.width > icon2.x &&
            icon1.y < icon2.y + icon2.height &&
            icon1.y + icon1.height > icon2.y
        );
    }

    resolveCollision(icon1, icon2) {
        // 충돌 시 속도 교환
        const tempVX = icon1.velocityX;
        const tempVY = icon1.velocityY;
        
        icon1.velocityX = icon2.velocityX * 0.8;
        icon1.velocityY = icon2.velocityY * 0.8;
        
        icon2.velocityX = tempVX * 0.8;
        icon2.velocityY = tempVY * 0.8;

        // 회전 속도에도 영향
        const tempRotation = icon1.rotationVelocity;
        icon1.rotationVelocity = icon2.rotationVelocity * 0.5;
        icon2.rotationVelocity = tempRotation * 0.5;

        // X축 겹침 처리
        const overlapX = this.iconSize - Math.abs(icon1.x - icon2.x);
        if (overlapX > 0) {
            if (icon1.x < icon2.x) {
                icon1.x -= overlapX / 2;
                icon2.x += overlapX / 2;
            } else {
                icon1.x += overlapX / 2;
                icon2.x -= overlapX / 2;
            }
        }

        // Y축 겹침 처리
        const overlapY = this.iconSize - Math.abs(icon1.y - icon2.y);
        if (overlapY > 0) {
            if (icon1.y < icon2.y) {
                icon1.y -= overlapY / 2;
                icon2.y += overlapY / 2;
            } else {
                icon1.y += overlapY / 2;
                icon2.y -= overlapY / 2;
            }
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
