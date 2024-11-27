// src/js/components/DiagramDrawer/DiagramDrawer.js
import { ToolbarManager } from './ToolbarManager.js';
import { BottomBarManager } from './BottomBarManager.js';
import { ElementManager } from './ElementManager.js';
import { HistoryManager } from './HistoryManager.js';
import { GridManager } from './GridManager.js';

export class DiagramDrawer {
  constructor(container, techStacks) {
    this.container = container;
    this.techStacks = techStacks;
    this.canvas = null;
    this.ctx = null;
    
    // 상태 관리
    this.currentTool = 'select';
    this.isShiftPressed = false;
    
    // 매니저 초기화
    this.toolbarManager = new ToolbarManager(this);
    this.bottomBarManager = new BottomBarManager(this);
    this.elementManager = new ElementManager(this);
    this.historyManager = new HistoryManager(this);
    this.gridManager = new GridManager(this);
    
    this.init();
    this.setupEventListeners();
    
    // 초기 상태 저장
    this.historyManager.saveState();
  }

  init() {
    const canvasContainer = document.createElement('div');
    canvasContainer.classList.add('canvas-container');
    
    this.canvas = document.createElement('canvas');
    this.canvas.width = window.innerWidth - 40;
    this.canvas.height = window.innerHeight - 300;
    this.canvas.classList.add('diagram-canvas');
    this.canvas.style.zIndex = '500'; // CSS와 일치하도록 설정
    this.ctx = this.canvas.getContext('2d');
    
    canvasContainer.appendChild(this.canvas);
    this.container.appendChild(canvasContainer);
    
    this.toolbarManager.init();
    this.bottomBarManager.init();
    this.gridManager.init();
    
    // 캔버스 스타일 설정 (추가)
    this.canvas.style.position = 'absolute';
    this.canvas.style.top = '0';
    this.canvas.style.left = '0';
    this.canvas.style.zIndex = '500'; // 높은 z-index 설정
  }

  setupEventListeners() {
    this.canvas.addEventListener('mousedown', this.elementManager.handleMouseDown.bind(this.elementManager));
    this.canvas.addEventListener('mousemove', this.elementManager.handleMouseMove.bind(this.elementManager));
    this.canvas.addEventListener('mouseup', this.elementManager.handleMouseUp.bind(this.elementManager));
  
    // 키보드 이벤트 리스너
    document.addEventListener('keydown', (e) => {
      // Shift 키 상태 관리
      if (e.key === 'Shift') {
        this.isShiftPressed = true;
      }
  
      // 단축키 처리
      if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
          case 'z':
            e.preventDefault();
            if (e.shiftKey) {
              this.historyManager.redo();
            } else {
              this.historyManager.undo();
            }
            break;
            
          case 'x':
            e.preventDefault();
            this.elementManager.deleteSelectedElement();
            break;
        }
      } else {
        // 일반 키 처리
        switch (e.key) {
          case 'Delete':
          case 'Backspace':
            e.preventDefault();
            this.elementManager.deleteSelectedElement();
            break;
            
          case 'Escape':
            this.elementManager.selectedElement = null;
            this.elementManager.removeResizeHandles();
            this.redraw();
            break;
        }
      }
    });
  
    document.addEventListener('keyup', (e) => {
      if (e.key === 'Shift') {
        this.isShiftPressed = false;
      }
    });
  
    // 창 크기 변경 이벤트
    window.addEventListener('resize', () => {
      this.canvas.width = window.innerWidth - 40;
      this.canvas.height = window.innerHeight - 300;
      this.redraw();
    });
  }
  

  // DiagramDrawer 클래스의 setTool 메서드 수정
setTool(toolId) {
  this.currentTool = toolId;

  // select 모드가 아닌 다른 도구로 변경할 때는 선택 해제
  if (toolId !== 'select') {
    this.elementManager.selectedElement = null;
  }
  
  this.toolbarManager.updateToolbarState(this.toolbarManager.getToolButton(toolId));
  this.redraw();
}

  redraw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    if (this.gridManager.showGrid) {
      this.gridManager.drawGrid();
    }
    this.elementManager.drawElements();
  }

  getMousePos(e) {
    const rect = this.canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  }
}
