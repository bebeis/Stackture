// src/js/components/DiagramDrawer/TechStackPanel.js

import { IconElement } from './elements/IconElement.js';

export class TechStackPanel {
  constructor(diagram) {
    this.diagram = diagram;
    this.panel = null;
    this.techStacks = diagram.techStacks || [];
    this.tooltipShown = false;
    this.init();
  }

  init() {
    this.panel = document.createElement('div');
    this.panel.classList.add('tech-stack-panel');
    this.diagram.container.parentElement.appendChild(this.panel);
    
    this.renderTechStacks();
    this.setupDragEvents();
    this.setupTooltip();
  }

  renderTechStacks() {
    this.panel.innerHTML = this.techStacks.map(tech => `
      <div class="tech-stack-item" draggable="true" data-tech-id="${tech.id}">
        <img src="${tech.icon}" alt="${tech.name}" title="${tech.name}">
      </div>
    `).join('');
  }

  setupDragEvents() {
    this.panel.querySelectorAll('.tech-stack-item').forEach(item => {
      item.addEventListener('dragstart', (e) => {
        const techId = parseInt(item.dataset.techId);
        e.dataTransfer.setData('application/json', JSON.stringify({
          type: 'tech-stack',
          id: techId
        }));
        item.classList.add('dragging');
      });

      item.addEventListener('dragend', (e) => {
        item.classList.remove('dragging');
      });
    });

    this.diagram.canvas.addEventListener('dragover', (e) => {
      e.preventDefault();
      this.diagram.canvas.classList.add('drag-over');
    });

    this.diagram.canvas.addEventListener('dragleave', () => {
      this.diagram.canvas.classList.remove('drag-over');
    });

    this.diagram.canvas.addEventListener('drop', (e) => {
      e.preventDefault();
      this.diagram.canvas.classList.remove('drag-over');
      
      try {
        const data = JSON.parse(e.dataTransfer.getData('application/json'));
        if (data.type === 'tech-stack') {
          const tech = this.techStacks.find(t => t.id === data.id);
          if (tech) {
            const pos = this.diagram.getMousePos(e);
            const snappedPos = this.diagram.gridManager.snapToGrid(pos);
            this.createTechStackElement(tech, snappedPos);
          }
        }
      } catch (err) {
        console.error('드롭 처리 중 오류 발생:', err);
      }
    });
  }

  createTechStackElement(tech, pos) {
    const icon = new Image();
    icon.crossOrigin = 'anonymous';
    icon.src = tech.icon;
    icon.onload = () => {
      const element = new IconElement(pos.x - 24, pos.y - 24, 48, 48, icon, tech);
      this.diagram.elementManager.elements.push(element);
      element.isSelected = true;
      this.diagram.elementManager.selectedElements = [element];
      this.diagram.redraw();

      this.diagram.historyManager.saveState();
    };
  }

  setupTooltip() {
    const items = this.panel.querySelectorAll('.tech-stack-item');
    
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
    tooltip.textContent = '아이콘을 드래그하여 캔버스에 추가할 수 있습니다';
    document.body.appendChild(tooltip);
    
    this.tooltipShown = true;
    
    setTimeout(() => {
      tooltip.remove();
      this.tooltipShown = false;
    }, 3000);
  }
}
