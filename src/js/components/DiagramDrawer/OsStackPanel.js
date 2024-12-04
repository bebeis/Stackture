import { database, storage } from '../../firebase/firebase-config.js';
import { IconElement } from './elements/IconElement.js';

export class OsStackPanel {
  constructor(diagram) {
    this.diagram = diagram;
    this.panel = null;
    this.osStacks = [];
    this.tooltipShown = false;
    this.init();
  }

  async init() {
    try {
      const response = await fetch('https://stackture-65e68-default-rtdb.firebaseio.com/api/os.json');
      const osData = await response.json();
      
      this.osStacks = await Promise.all(
        osData.map(async os => {
          try {
            const iconFileName = os.name.toLowerCase().replace(/\s+/g, '');
            const iconUrl = await storage.ref(`os/${iconFileName}.svg`)
              .getDownloadURL();
            return { ...os, icon: iconUrl, id: osData.indexOf(os) };
          } catch (error) {
            console.warn(`아이콘 로드 실패 (${os.name}):`, error);
            return null;
          }
        })
      );

      // null 값 제거
      this.osStacks = this.osStacks.filter(item => item !== null);
      
      this.createPanel();
      this.renderOsStacks();
      this.setupDragEvents();
      this.setupTooltip();
    } catch (error) {
      console.error('OS 스택 로딩 실패:', error);
    }
  }

  createPanel() {
    this.panel = document.createElement('div');
    this.panel.classList.add('os-stack-panel');
    this.diagram.container.parentElement.appendChild(this.panel);
  }

  renderOsStacks() {
    this.panel.innerHTML = this.osStacks.map(os => `
      <div class="os-stack-item" draggable="true" data-os-id="${os.id}">
        <img src="${os.icon}" alt="${os.name}" title="${os.name}">
      </div>
    `).join('');
  }

  setupDragEvents() {
    this.panel.querySelectorAll('.os-stack-item').forEach(item => {
      item.addEventListener('dragstart', (e) => {
        const osId = parseInt(item.dataset.osId);
        e.dataTransfer.setData('application/json', JSON.stringify({
          type: 'os-stack',
          id: osId
        }));
        item.classList.add('dragging');
      });

      item.addEventListener('dragend', () => {
        item.classList.remove('dragging');
      });
    });

    this.setupDropZone();
  }

  setupDropZone() {
    this.diagram.canvas.addEventListener('drop', (e) => {
      e.preventDefault();
      this.diagram.canvas.classList.remove('drag-over');
      
      try {
        const data = JSON.parse(e.dataTransfer.getData('application/json'));
        if (data.type === 'os-stack') {
          // 기존 선택 요소들 선택 해제
          this.diagram.elementManager.selectedElements.forEach(el => {
            el.isSelected = false;
          });
          this.diagram.elementManager.selectedElements = [];
          
          const os = this.osStacks.find(o => o.id === data.id);
          if (os) {
            const pos = this.diagram.getMousePos(e);
            const snappedPos = this.diagram.gridManager.snapToGrid(pos);
            this.createOsStackElement(os, snappedPos);
          }
          this.diagram.redraw(); // 화면 갱신 추가
        }
      } catch (err) {
        console.error('드롭 처리 중 오류 발생:', err);
      }
    });
  }

  createOsStackElement(os, pos) {
    const icon = new Image();
    icon.crossOrigin = 'anonymous';
    icon.src = os.icon;
    icon.onload = () => {
      const element = new IconElement(pos.x - 24, pos.y - 24, 48, 48, icon, os);
      this.diagram.elementManager.elements.push(element);
      element.isSelected = true;
      this.diagram.elementManager.selectedElements = [element];
      this.diagram.redraw();
      this.diagram.historyManager.saveState();
    };
  }

  setupTooltip() {
    const items = this.panel.querySelectorAll('.os-stack-item');
    items.forEach(item => {
      item.addEventListener('mouseenter', () => {
        if (!this.tooltipShown) {
          this.showDragTooltip();
        }
      });
    });
  }

  showDragTooltip() {
    const tooltip = document.createElement('div');
    tooltip.classList.add('drag-tooltip');
    tooltip.textContent = 'OS 아이콘을 드래그하여 캔버스에 추가할 수 있습니다';
    document.body.appendChild(tooltip);
    
    this.tooltipShown = true;
    
    setTimeout(() => {
      tooltip.remove();
      this.tooltipShown = false;
    }, 3000);
  }
}