document.addEventListener('DOMContentLoaded', () => {
    const sections = document.querySelectorAll('.guide-content section[id]');
    const navLinks = document.querySelectorAll('.guide-nav a');
    
    // 스크롤 이벤트에 throttle 적용
    let ticking = false;
    
    const updateActiveSection = () => {
        const scrollPos = window.scrollY;
        
        // 현재 화면에 보이는 섹션 찾기
        let currentSection = null;
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 100; // 여유 공간
            const sectionBottom = sectionTop + section.offsetHeight;
            
            if (scrollPos >= sectionTop && scrollPos < sectionBottom) {
                currentSection = section;
            }
        });
        
        // 네비게이션 링크 업데이트
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (currentSection && link.getAttribute('href') === `#${currentSection.id}`) {
                link.classList.add('active');
            }
        });
        
        ticking = false;
    };
    
    // 스크롤 이벤트 리스너
    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                updateActiveSection();
            });
            ticking = true;
        }
    });
    
    // 초기 로드 시 실행
    updateActiveSection();
}); 