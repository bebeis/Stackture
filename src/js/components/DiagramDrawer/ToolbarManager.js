// src/js/components/DiagramDrawer/ToolbarManager.js

import { elementFactory } from './elements/ElementFactory.js';

export class ToolbarManager {
  constructor(diagram) {
    this.diagram = diagram;
    this.toolbar = null;
    this.shapesSubmenu = null;
    this.arrowsSubmenu = null;
    this.elementManager = diagram.elementManager;
  }

  init() {
    this.createToolbar();
    this.createShapesSubmenu();
    this.createArrowsSubmenu();
    this.setupOutsideClickHandler();
  }

  createToolbar() {
    this.toolbar = document.createElement('div');
    this.toolbar.classList.add('drawing-toolbar');

    const tools = [
      { id: 'select', icon: '👆', title: 'Select' },
      { id: 'shapes', icon: '⬜', title: 'Shapes' },
      { id: 'arrows', icon: '➡️', title: 'Arrows' },
      { id: 'text', icon: 'T', title: 'Text' },
      { id: 'cut', icon: '✂️', title: '잘라내기 (Ctrl+X)' },
      { id: 'copy', icon: '📋', title: '복사 (Ctrl+C)' },
      { id: 'paste', icon: '📎', title: '붙여넣기 (Ctrl+V)' },
    ];

    tools.forEach((tool) => this.createToolButton(tool));
    this.createUtilityButtons();

    this.diagram.container.appendChild(this.toolbar);
  }

  createToolButton(tool) {
    const button = document.createElement('button');
    button.innerHTML = tool.icon;
    button.title = tool.title;
    button.dataset.tool = tool.id;

    button.addEventListener('click', () => {
      switch (tool.id) {
        case 'shapes':
          this.toggleShapesSubmenu(button);
          this.hideArrowsSubmenu();
          break;
        case 'arrows':
          this.toggleArrowsSubmenu(button);
          this.hideShapesSubmenu();
          break;
        case 'cut':
          this.diagram.elementManager.copySelectedElements();
          this.diagram.elementManager.deleteSelectedElements();
          break;
        case 'copy':
          this.diagram.elementManager.copySelectedElements();
          break;
        case 'paste':
          this.diagram.elementManager.pasteElements();
          break;
        default:
          this.diagram.setTool(tool.id);
          this.hideSubmenus();
          this.updateToolbarState(button);
      }
    });

    this.toolbar.appendChild(button);
  }

  createArrowsSubmenu() {
    this.arrowsSubmenu = document.createElement('div');
    this.arrowsSubmenu.classList.add('arrows-submenu', 'submenu');
    this.arrowsSubmenu.style.display = 'none';

    const arrowTypes = [
      { type: 'one-way', icon: '➡️', title: '단방향 화살표' },
      { type: 'two-way', icon: '⟷', title: '양방향 화살표' },
      { type: 'line', icon: '━', title: '선 (화살표 없음)' },
    ];

    arrowTypes.forEach((arrow) => {
      const button = document.createElement('button');
      button.innerHTML = arrow.icon;
      button.title = arrow.title;
      button.addEventListener('click', () => {
        this.diagram.setTool('arrow', arrow.type);
        this.hideSubmenus();
        this.updateToolbarState(this.getToolButton('arrows'));
      });
      this.arrowsSubmenu.appendChild(button);
    });

    this.diagram.container.appendChild(this.arrowsSubmenu);
  }

  toggleArrowsSubmenu(button) {
    const buttonRect = button.getBoundingClientRect();
    const containerRect = this.diagram.container.getBoundingClientRect();
    
    this.arrowsSubmenu.style.position = 'absolute';
    this.arrowsSubmenu.style.display = this.arrowsSubmenu.style.display === 'none' ? 'flex' : 'none';
    this.arrowsSubmenu.style.top = `${buttonRect.bottom - containerRect.top}px`;
    this.arrowsSubmenu.style.left = `${buttonRect.left - containerRect.left}px`;
  }

  hideSubmenus() {
    if (this.shapesSubmenu) {
      this.shapesSubmenu.style.display = 'none';
    }
    if (this.arrowsSubmenu) {
      this.arrowsSubmenu.style.display = 'none';
    }
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
    submenu.style.display = 'none';

    const shapeElements = this.elementManager.elementFactory.categories.shapes;
    
    Object.values(shapeElements).forEach((ElementClass) => {
      const button = document.createElement('button');
      button.innerHTML = ElementClass.icon;
      button.title = ElementClass.title;
      button.addEventListener('click', () => {
        this.diagram.setTool(ElementClass.type);
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

  hideArrowsSubmenu() {
    if (this.arrowsSubmenu) {
      this.arrowsSubmenu.style.display = 'none';
    }
  }

  updateToolbarState(activeButton) {
    // 모든 버튼의 active 클래스 제거
    this.toolbar.querySelectorAll('button').forEach((button) => {
      button.classList.remove('active');
    });

    // shapes 서브메뉴의 버튼들도 active 클래스 제거
    if (this.shapesSubmenu) {
      this.shapesSubmenu.querySelectorAll('button').forEach((button) => {
        button.classList.remove('active');
      });
    }

    // 선택된 버튼에 active 클래스 추가
    if (activeButton) {
      activeButton.classList.add('active');
    }
  }

  setupOutsideClickHandler() {
    document.addEventListener('click', (e) => {
      if (!this.toolbar.contains(e.target) &&
          !this.shapesSubmenu.contains(e.target)) {
        this.hideShapesSubmenu();
      }
    });
  }

  isToolActive(toolId) {
    return this.diagram.currentTool === toolId;
  }

  getToolButton(toolId) {
    return this.toolbar.querySelector(`button[data-tool="${toolId}"]`);
  }
}
