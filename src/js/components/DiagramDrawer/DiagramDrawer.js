// src/js/components/DiagramDrawer/DiagramDrawer.js

import { ToolbarManager } from './ToolbarManager.js';
import { ElementManager } from './ElementManager.js';
import { HistoryManager } from './HistoryManager.js';
import { GridManager } from './GridManager.js';
import './elements/index.js';
import { ZoomManager } from './ZoomManager.js';
import { TechStackPanel } from './TechStackPanel.js';
import { SaveLoadManager } from './SaveLoadManager.js';
import { OsStackPanel } from './OsStackPanel.js';
import { CommonStackPanel } from './CommonStackPanel.js';
import { ImageCache } from './ImageCache.js';

export class DiagramDrawer {
  constructor(container, techStacks) {
    this.container = container;
    this.techStacks = techStacks;
    this.canvas = null;
    this.ctx = null;
    this.currentTool = 'select';
    this.isShiftPressed = false;
    this.currentArrowType = 'one-way';
    this.isSelectMode = false; // 초기값을 false로 설정

    // 캔버스 초기화
    this.initCanvas();
    
    // 초기 커서 스타일 설정
    this.canvas.style.cursor = 'grab';
    
    // 매니저 초기화
    this.elementManager = new ElementManager(this);
    this.toolbarManager = new ToolbarManager(this);
    this.historyManager = new HistoryManager(this);
    this.gridManager = new GridManager(this);
    this.zoomManager = new ZoomManager(this);
    this.techStackPanel = new TechStackPanel(this);
    this.osStackPanel = new OsStackPanel(this);
    this.commonStackPanel = new CommonStackPanel(this);
    this.saveLoadManager = new SaveLoadManager(this);

    // 지원되는 도구 목록 생성
    this.supportedTools = ['select', 'text', 'arrow'];
    Object.keys(this.elementManager.elementFactory.categories).forEach(category => {
      Object.keys(this.elementManager.elementFactory.categories[category]).forEach(type => {
        if (!this.supportedTools.includes(type)) {
          this.supportedTools.push(type);
        }
      });
    });

    // UI 초기화
    this.initUI();
    this.setupEventListeners();

    // 초기 상태 저장
    this.historyManager.saveState();

    // 애니메이션 프레임 추가
    this.animationFrameId = null;
    this.startAnimation();

    this.imageCache = new ImageCache();
  }

  initCanvas() {
    this.canvas = document.createElement('canvas');
    this.canvas.classList.add('diagram-canvas');
    this.container.appendChild(this.canvas);
    
    // DOM에 추가된 후 크기 설정
    this.updateCanvasSize();
    
    this.ctx = this.canvas.getContext('2d');
  }

  updateCanvasSize() {
    const container = this.canvas.parentElement;
    const rect = container.getBoundingClientRect();
    
    // 캔버스 크기를 컨테이너에 맞춤
    this.canvas.width = rect.width;
    this.canvas.height = rect.height;
    
    // 캔버스 스타일 설정
    this.canvas.style.width = '100%';
    this.canvas.style.height = '100%';
    
    // 컨텍스트가 있는 경우에만 변환 적용
    if (this.ctx) {
      this.ctx.setTransform(1, 0, 0, 1, 0, 0);
      if (this.zoomManager) {
        this.ctx.scale(this.zoomManager.scale, this.zoomManager.scale);
      }
    }
  }

  initUI() {
    this.toolbarManager.init();
    this.gridManager.init();
  }

  setupEventListeners() {
    this.canvas.addEventListener('mousedown', this.elementManager.handleMouseDown.bind(this.elementManager));
    this.canvas.addEventListener('mousemove', this.elementManager.handleMouseMove.bind(this.elementManager));
    this.canvas.addEventListener('mouseup', this.elementManager.handleMouseUp.bind(this.elementManager));

    // 키치 이벤트 리스너 추가
    this.canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      const mouseEvent = new MouseEvent('mousedown', {
        clientX: touch.clientX,
        clientY: touch.clientY,
        bubbles: true,
        cancelable: true,
        view: window
      });
      this.elementManager.handleMouseDown(mouseEvent);
    });

    this.canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      const mouseEvent = new MouseEvent('mousemove', {
        clientX: touch.clientX,
        clientY: touch.clientY,
        bubbles: true,
        cancelable: true,
        view: window
      });
      this.elementManager.handleMouseMove(mouseEvent);
    });

    this.canvas.addEventListener('touchend', (e) => {
      e.preventDefault();
      const lastTouch = e.changedTouches[0];
      const mouseEvent = new MouseEvent('mouseup', {
        clientX: lastTouch.clientX,
        clientY: lastTouch.clientY,
        bubbles: true,
        cancelable: true,
        view: window
      });
      this.elementManager.handleMouseUp(mouseEvent);
    });

    // 키보드 이벤트 리스너
    document.addEventListener('keydown', (e) => {
      if (this.elementManager.elementCreator.isTypingText) {
        return;
      }
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
            this.elementManager.deleteSelectedElements();
            break;

          case 'c':
            if (e.ctrlKey || e.metaKey) {
              e.preventDefault();
              this.elementManager.copySelectedElements();
            }
            break;

          case 'v':
            if (e.ctrlKey || e.metaKey) {
              e.preventDefault();
              this.elementManager.pasteElements();
            }
            break;

          case 's':
            e.preventDefault();
            this.saveLoadManager.saveAsImage();
            break;

          case 'o':
            e.preventDefault();
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.xml';
            input.style.display = 'none';
            input.onchange = (e) => {
              if (e.target.files[0]) {
                this.saveLoadManager.loadFromXML(e.target.files[0]);
              }
            };
            document.body.appendChild(input);
            input.click();
            document.body.removeChild(input);
            break;
        }
      } else {
        // 일반 키 처리
        switch (e.key) {
          case 'Delete':
          case 'Backspace':
            e.preventDefault();
            this.elementManager.deleteSelectedElements();
            break;

          case 'Escape':
            this.elementManager.deselectAll();
            this.redraw();
            break;

          case 'Enter':
            if (this.elementManager.selectedElements.length === 1) {
              const selectedElement = this.elementManager.selectedElements[0];
              if (selectedElement.type === 'text') {
                e.preventDefault();
                this.elementManager.elementCreator.startEditingTextElement(selectedElement);
              }
            }
            break;
        }
      }
    });

    document.addEventListener('keyup', (e) => {
      if (e.key === 'Shift') {
        this.isShiftPressed = false;
      }
    });

    // resize 이벤트 핸들러 수정
    const resizeObserver = new ResizeObserver(() => {
      this.updateCanvasSize();
      if (this.ctx) {
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        this.ctx.scale(this.zoomManager.scale, this.zoomManager.scale);
        this.redraw();
      }
    });

    resizeObserver.observe(this.container);
  }

  setTool(toolId, subType = null) {
    if (!this.supportedTools.includes(toolId)) {
      throw new Error(`Unsupported tool: ${toolId}`);
    }
    
    // 이전 도구가 select였고, 새로운 도구도 select인 경우에만 토글
    if (toolId === 'select' && this.currentTool === 'select') {
      this.isSelectMode = !this.isSelectMode;
    } else {
      // 다른 도구로 변경하는 경우
      this.currentTool = toolId;
      this.isSelectMode = (toolId === 'select'); // select 도구 선택시에만 true
    }

    // 커서 스타일 설정
    if (toolId === 'select') {
      this.canvas.style.cursor = this.isSelectMode ? 'default' : 'grab';
    } else {
      this.canvas.style.cursor = 'crosshair';
    }

    // 화살표 타입 설정
    if (toolId === 'arrow' && subType) {
      this.currentArrowType = subType;
    }

    // select 모드가 아닌 경우나 isSelectMode��� false인 경우 선택 해제
    if (toolId !== 'select' || !this.isSelectMode) {
      this.elementManager.deselectAll();
    }

    this.toolbarManager.updateToolbarState(this.toolbarManager.getToolButton(toolId));
    this.redraw();
  }

  redraw() {
    // 배경을 회색으로 채우기
    this.ctx.save();
    this.ctx.setTransform(1, 0, 0, 1, 0, 0); // 변환 초기화
    this.ctx.fillStyle = 'gray';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.restore();

    // 그리드 및 요소 그리기
    if (this.gridManager.showGrid) {
      this.gridManager.drawGrid();
    }
    this.elementManager.drawElements();
  }

  getMousePos(e) {
    const rect = this.canvas.getBoundingClientRect();
    const point = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
    return this.zoomManager.transformPoint(point.x, point.y);
  }

  startAnimation() {
    const animate = () => {
      if (this.elementManager.elementCreator.isTypingText) {
        this.redraw();
      }
      this.animationFrameId = requestAnimationFrame(animate);
    };
    animate();
  }

  destroy() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }
}
