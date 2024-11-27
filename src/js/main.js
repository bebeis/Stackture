// src/js/main.js
import { TechStackSearch } from './components/TechStackSearch.js';
import { FloatingIcons } from './components/FloatingIcons.js';
import { DiagramDrawer } from './components/DiagramDrawer/DiagramDrawer.js';

document.addEventListener('DOMContentLoaded', async () => {
  const techStackSearch = new TechStackSearch();
  await techStackSearch.init(); // 초기화 완료를 기다림

  const floatingIcons = new FloatingIcons();
  
  // 그리기 버튼 이벤트 리스너 추가
  const drawButton = document.querySelector('.draw-button');
  drawButton.addEventListener('click', () => {
    // 기존 컨테이너의 내용을 숨기고 다이어그램 컨테이너 생성
    const mainContainer = document.querySelector('.main-container');
    mainContainer.innerHTML = '';
    
    const diagramContainer = document.createElement('div');
    diagramContainer.classList.add('diagram-container');
    mainContainer.appendChild(diagramContainer);
    
    // 다이어그램 드로어 초기화
    const diagramDrawer = new DiagramDrawer(diagramContainer, techStackSearch.techStacks);
  });
});
