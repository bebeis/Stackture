// src/js/components/DiagramDrawer/ToolbarManager.js

import { elementFactory } from './elements/ElementFactory.js';

export class ToolbarManager {
  constructor(diagram) {
    this.diagram = diagram;
    this.toolbar = null;
    this.shapesSubmenu = null;
    this.arrowsSubmenu = null;
    this.elementManager = diagram.elementManager;
    this.tooltip = null;
    this.tooltipTimeout = null;
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
      { id: 'save', icon: '💾', title: '장' },
      { id: 'load', icon: '📂', title: '불러오기' }
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

    button.addEventListener('mouseenter', () => {
      this.showTooltip(button, this.getTooltipContent(tool.id));
    });

    button.addEventListener('mouseleave', () => {
      this.hideTooltip();
    });

    button.addEventListener('click', () => {
      this.hideTooltip();
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
        case 'save':
          const saveMenu = document.createElement('div');
          saveMenu.classList.add('save-menu');
          saveMenu.style.position = 'absolute';
          saveMenu.style.background = 'white';
          saveMenu.style.border = '1px solid #ccc';
          saveMenu.style.borderRadius = '4px';
          saveMenu.style.padding = '8px';
          saveMenu.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
          saveMenu.style.zIndex = '1000';

          const buttonRect = button.getBoundingClientRect();
          saveMenu.style.top = `${buttonRect.bottom + 5}px`;
          saveMenu.style.left = `${buttonRect.left}px`;

          const savePNG = document.createElement('button');
          savePNG.textContent = 'PNG로 저장';
          savePNG.style.display = 'block';
          savePNG.style.width = '100%';
          savePNG.style.marginBottom = '4px';
          savePNG.style.padding = '4px 8px';
          savePNG.onclick = () => {
            this.diagram.saveLoadManager.saveAsImage();
            document.body.removeChild(saveMenu);
          };

          const saveXML = document.createElement('button');
          saveXML.textContent = 'XML로 저장';
          saveXML.style.display = 'block';
          saveXML.style.width = '100%';
          saveXML.style.padding = '4px 8px';
          saveXML.onclick = () => {
            this.diagram.saveLoadManager.saveAsXML();
            document.body.removeChild(saveMenu);
          };

          saveMenu.appendChild(savePNG);
          saveMenu.appendChild(saveXML);
          document.body.appendChild(saveMenu);

          // 외부 클릭 시 메뉴 닫기
          const closeMenu = (e) => {
            if (!saveMenu.contains(e.target) && e.target !== button) {
              document.body.removeChild(saveMenu);
              document.removeEventListener('click', closeMenu);
            }
          };
          setTimeout(() => document.addEventListener('click', closeMenu), 0);
          break;

        case 'load':
          const input = document.createElement('input');
          input.type = 'file';
          input.accept = '.xml';
          input.style.display = 'none';
          input.onchange = (e) => {
            if (e.target.files[0]) {
              this.diagram.saveLoadManager.loadFromXML(e.target.files[0]);
            }
          };
          document.body.appendChild(input);
          input.click();
          document.body.removeChild(input);
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

  showTooltip(element, content) {
    if (this.tooltipTimeout) {
      clearTimeout(this.tooltipTimeout);
    }

    if (this.tooltip) {
      this.tooltip.remove();
    }

    this.tooltip = document.createElement('div');
    this.tooltip.classList.add('toolbar-tooltip');
    this.tooltip.innerHTML = content;

    document.body.appendChild(this.tooltip);

    const elementRect = element.getBoundingClientRect();
    const tooltipRect = this.tooltip.getBoundingClientRect();

    this.tooltip.style.left = `${elementRect.left + (elementRect.width - tooltipRect.width) / 2}px`;
    this.tooltip.style.top = `${elementRect.bottom + 5}px`;
  }

  hideTooltip() {
    if (this.tooltipTimeout) {
      clearTimeout(this.tooltipTimeout);
    }
    
    if (this.tooltip) {
      this.tooltip.remove();
      this.tooltip = null;
    }
  }

  getTooltipContent(toolId) {
    const tooltipContent = {
      'select': '요소를 선택하고 이동할 수 있습니다<br>Shift/Ctrl(Cmd) + 클릭으로 다중 선택이 가능합니다',
      'shapes': '사각형, 원 등 다양한 도형을 그릴 수 있습니다',
      'arrows': '화살표와 선을 그릴 수 있습니다<br>클릭하여 시작점을, 드래그하여 끝점을 지정합니다',
      'text': '텍스트를 추가할 수 있습니다<br>클릭하여 입력을 시작하고 Esc를 누르거나 텍스트 박스 바깥을 클릭하여 완료합니다',
      'cut': '선택한 요소를 잘라냅니다<br>단축키: Ctrl(Cmd) + X',
      'copy': '선택한 요소를 복사합니다<br>단축키: Ctrl(Cmd) + C',
      'paste': '복사한 요소를 붙여넣습니다<br>단축키: Ctrl(Cmd) + V',
      'save': '다이어그램을 PNG 또는 XML 형식으로 저장합니다',
      'load': '저장된 다이어그램을 불러옵니다'
    };

    return tooltipContent[toolId] || '';
  }
}
