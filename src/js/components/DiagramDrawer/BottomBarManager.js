// src/js/components/DiagramDrawer/BottomBarManager.js
export class BottomBarManager {
    constructor(diagram) {
      this.diagram = diagram;
      this.bottomBar = null;
    }
  
    init() {
      this.bottomBar = document.createElement('div');
      this.bottomBar.classList.add('bottom-bar');
      
      const techList = document.createElement('div');
      techList.classList.add('tech-list');
      
      // 선택된 기술 스택만 필터링
      const selectedTechs = Array.from(document.querySelectorAll('.tech-item.selected'))
        .map(item => {
          const id = parseInt(item.dataset.id);
          return this.diagram.techStacks.find(tech => tech.id === id);
        })
        .filter(tech => tech);
  
      selectedTechs.forEach(tech => this.createTechItem(tech, techList));
      
      this.bottomBar.appendChild(techList);
      this.diagram.container.appendChild(this.bottomBar);
    }
  
    createTechItem(tech, container) {
      const techItem = document.createElement('div');
      techItem.classList.add('tech-item');
      techItem.draggable = true;
      techItem.dataset.id = tech.id;
      
      const icon = document.createElement('img');
      icon.src = tech.icon;
      icon.alt = tech.name;
      
      const name = document.createElement('span');
      name.textContent = tech.name;
      
      techItem.appendChild(icon);
      techItem.appendChild(name);
      container.appendChild(techItem);
      
      this.setupDragEvents(techItem);
    }
  
    setupDragEvents(techItem) {
      techItem.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('text/plain', techItem.dataset.id);
      });
  
      this.diagram.canvas.addEventListener('dragover', (e) => {
        e.preventDefault();
        this.diagram.canvas.classList.add('dragover');
      });
  
      this.diagram.canvas.addEventListener('dragleave', () => {
        this.diagram.canvas.classList.remove('dragover');
      });
  
      this.diagram.canvas.addEventListener('drop', (e) => {
        e.preventDefault();
        this.diagram.canvas.classList.remove('dragover');
        
        const techId = parseInt(e.dataTransfer.getData('text/plain'));
        const pos = this.diagram.getMousePos(e);
        const tech = this.diagram.techStacks.find(t => t.id === techId);
        
        if (tech) {
          this.addTechIcon(tech, this.diagram.gridManager.snapToGrid(pos));
        }
      });
    }
  
    addTechIcon(tech, pos) {
      const icon = new Image();
      icon.src = tech.icon;
      icon.onload = () => {
        const element = {
          type: 'icon',
          x: pos.x - 24,
          y: pos.y - 24,
          width: 48,
          height: 48,
          icon: icon,
          tech: tech
        };
        
        this.diagram.elementManager.elements.push(element);
        this.diagram.historyManager.saveState();
        this.diagram.redraw();
      };
    }
  }