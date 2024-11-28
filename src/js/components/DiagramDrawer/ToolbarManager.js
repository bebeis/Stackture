// src/js/components/DiagramDrawer/ToolbarManager.js

import { elementFactory } from './elements/ElementFactory.js';

export class ToolbarManager {
  constructor(diagram) {
    this.diagram = diagram;
    this.toolbar = null;
    this.shapesSubmenu = null;
    this.elementManager = diagram.elementManager;
  }

  init() {
    this.createToolbar();
    this.createShapesSubmenu();
    this.setupOutsideClickHandler();
  }

  createToolbar() {
    this.toolbar = document.createElement('div');
    this.toolbar.classList.add('drawing-toolbar');

    const tools = [
      { id: 'select', icon: '👆', title: 'Select' },
      { id: 'shapes', icon: '⬜', title: 'Shapes' },
      { id: 'text', icon: 'T', title: 'Text' },
      { id: 'arrow', icon: '➡️', title: 'Arrow' }
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
