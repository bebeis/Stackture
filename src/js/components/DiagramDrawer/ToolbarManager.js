// src/js/components/DiagramDrawer/ToolbarManager.js
export class ToolbarManager {
  constructor(diagram) {
    this.diagram = diagram;
    this.toolbar = null;
    this.shapesSubmenu = null;
  }

  init() {
    this.createToolbar();
    this.createShapesSubmenu();
  }

  createToolbar() {
    this.toolbar = document.createElement('div');
    this.toolbar.classList.add('drawing-toolbar');
    
    const tools = [
      { id: 'select', icon: '👆', title: 'Select' },
      { id: 'shapes', icon: '⬜', title: 'Shapes' },
      { id: 'arrow', icon: '➡️', title: 'Arrow' },
      { id: 'text', icon: 'T', title: 'Text' }
    ];
    
    tools.forEach(tool => this.createToolButton(tool));
    this.createUtilityButtons();
    
    this.diagram.container.appendChild(this.toolbar);
  }

  createToolButton(tool) {
    const button = document.createElement('button');
    button.innerHTML = tool.icon;
    button.title = tool.title;
    button.dataset.tool = tool.id;
    
    button.addEventListener('click', () => {
      if (tool.id === 'shapes') {
        this.toggleShapesSubmenu(button);
      } else {
        this.diagram.setTool(tool.id);
        this.hideShapesSubmenu();
        this.updateToolbarState(button);
      }
    });
    
    this.toolbar.appendChild(button);
  }

  createUtilityButtons() {
    const undoButton = document.createElement('button');
    undoButton.innerHTML = '↩️';
    undoButton.title = 'Undo (Ctrl+Z)';
    undoButton.addEventListener('click', () => this.diagram.historyManager.undo());
    
    const redoButton = document.createElement('button');
    redoButton.innerHTML = '↪️';
    redoButton.title = 'Redo (Ctrl+Shift+Z)';
    redoButton.addEventListener('click', () => this.diagram.historyManager.redo());
    
    const gridButton = document.createElement('button');
    gridButton.innerHTML = '📏';
    gridButton.title = 'Toggle Grid';
    gridButton.addEventListener('click', () => this.diagram.gridManager.toggleGrid());
    
    this.toolbar.appendChild(undoButton);
    this.toolbar.appendChild(redoButton);
    this.toolbar.appendChild(gridButton);
  }

  createShapesSubmenu() {
    const submenu = document.createElement('div');
    submenu.classList.add('shapes-submenu');
    
    const shapes = [
      { id: 'square', icon: '⬛', title: 'Square' },
      { id: 'rectangle', icon: '⬜', title: 'Rectangle' },
      { id: 'circle', icon: '⭕', title: 'Circle' }
    ];
    
    shapes.forEach(shape => {
      const button = document.createElement('button');
      button.innerHTML = shape.icon;
      button.title = shape.title;
      button.addEventListener('click', () => {
        this.diagram.setTool(shape.id);
        this.hideShapesSubmenu();
        this.updateToolbarState(button);
      });
      submenu.appendChild(button);
    });
    
    this.shapesSubmenu = submenu;
    this.diagram.container.appendChild(submenu);
  }

  toggleShapesSubmenu(button) {
    const rect = button.getBoundingClientRect();
    this.shapesSubmenu.style.display = 
      this.shapesSubmenu.style.display === 'none' ? 'flex' : 'none';
    this.shapesSubmenu.style.top = `${rect.bottom + 5}px`;
    this.shapesSubmenu.style.left = `${rect.left}px`;
  }

  hideShapesSubmenu() {
    if (this.shapesSubmenu) {
      this.shapesSubmenu.style.display = 'none';
    }
  }

  updateToolbarState(activeButton) {
    // 모든 버튼의 active 클래스 제거
    this.toolbar.querySelectorAll('button').forEach(button => {
      button.classList.remove('active');
    });
    
    // shapes 서브메뉴의 버튼들도 active 클래스 제거
    if (this.shapesSubmenu) {
      this.shapesSubmenu.querySelectorAll('button').forEach(button => {
        button.classList.remove('active');
      });
    }
    
    // 선택된 버튼에 active 클래스 추가
    if (activeButton) {
      activeButton.classList.add('active');
    }
  }

  // 캔버스 영역 클릭 시 서브메뉴 숨기기
  setupOutsideClickHandler() {
    document.addEventListener('click', (e) => {
      if (!this.toolbar.contains(e.target) && 
          !this.shapesSubmenu.contains(e.target)) {
        this.hideShapesSubmenu();
      }
    });
  }

  // 도구 활성화 상태 확인
  isToolActive(toolId) {
    return this.diagram.currentTool === toolId;
  }

  // 특정 도구 버튼 찾기
  getToolButton(toolId) {
    return this.toolbar.querySelector(`button[data-tool="${toolId}"]`);
  }

  // 모든 서브메뉴 숨기기
  hideAllSubmenus() {
    this.hideShapesSubmenu();
  }
}