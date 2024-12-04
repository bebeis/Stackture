import { database, storage } from '../../firebase/firebase-config.js';
import { IconElement } from './elements/IconElement.js';

export class CommonStackPanel {
  constructor(diagram) {
    this.diagram = diagram;
    this.panel = null;
    this.commonStacks = [];
    this.tooltipShown = false;
    this.init();
  }

  async init() {
    try {
      const response = await fetch('https://stackture-65e68-default-rtdb.firebaseio.com/api/common.json');
      const commonData = await response.json();
      
      this.commonStacks = await Promise.all(
        commonData.map(async common => {
          try {
            const iconFileName = common.name.toLowerCase().replace(/\s+/g, '');
            const iconUrl = await storage.ref(`common/${iconFileName}.svg`)
              .getDownloadURL();
            return { ...common, icon: iconUrl, id: commonData.indexOf(common) };
          } catch (error) {
            console.warn(`아이콘 로드 실패 (${common.name}):`, error);
            return null;
          }
        })
      );

      this.commonStacks = this.commonStacks.filter(item => item !== null);
      
      this.createPanel();
      this.renderCommonStacks();
      this.setupDragEvents();
      this.setupTooltip();
    } catch (error) {
      console.error('Common 스택 로딩 실패:', error);
    }
  }

  createPanel() {
    this.panel = document.createElement('div');
    this.panel.classList.add('common-stack-panel');
    this.diagram.container.parentElement.appendChild(this.panel);
  }

  renderCommonStacks() {
    this.panel.innerHTML = this.commonStacks.map(common => `
      <div class="common-stack-item" draggable="true" data-common-id="${common.id}">
        <img src="${common.icon}" alt="${common.name}" title="${common.name}">
      </div>
    `).join('');
  }

  setupDragEvents() {
    this.panel.querySelectorAll('.common-stack-item').forEach(item => {
      item.addEventListener('dragstart', (e) => {
        const commonId = parseInt(item.dataset.commonId);
        e.dataTransfer.setData('application/json', JSON.stringify({
          type: 'common-stack',
          id: commonId
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
        if (data.type === 'common-stack') {
          const common = this.commonStacks.find(c => c.id === data.id);
          if (common) {
            const pos = this.diagram.getMousePos(e);
            const snappedPos = this.diagram.gridManager.snapToGrid(pos);
            this.createCommonStackElement(common, snappedPos);
          }
        }
      } catch (err) {
        console.error('드롭 처리 중 오류 발생:', err);
      }
    });
  }

  createCommonStackElement(common, pos) {
    const icon = new Image();
    icon.crossOrigin = 'anonymous';
    icon.src = common.icon;
    icon.onload = () => {
      const element = new IconElement(pos.x - 24, pos.y - 24, 48, 48, icon, common);
      this.diagram.elementManager.elements.push(element);
      element.isSelected = true;
      this.diagram.elementManager.selectedElements = [element];
      this.diagram.redraw();
      this.diagram.historyManager.saveState();
    };
  }

  setupTooltip() {
    const items = this.panel.querySelectorAll('.common-stack-item');
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
    tooltip.textContent = '공통 아이콘을 드래그하여 캔버스에 추가할 수 있습니다';
    document.body.appendChild(tooltip);
    
    this.tooltipShown = true;
    
    setTimeout(() => {
      tooltip.remove();
      this.tooltipShown = false;
    }, 3000);
  }
} 