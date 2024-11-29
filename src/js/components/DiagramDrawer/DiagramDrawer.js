// src/js/components/DiagramDrawer/DiagramDrawer.js

import { ToolbarManager } from './ToolbarManager.js';
import { ElementManager } from './ElementManager.js';
import { HistoryManager } from './HistoryManager.js';
import { GridManager } from './GridManager.js';
import './elements/index.js';
import { ZoomManager } from './ZoomManager.js';

export class DiagramDrawer {
  constructor(container, techStacks) {
    this.container = container;
    this.techStacks = techStacks;
    this.canvas = null;
    this.ctx = null;
    this.currentTool = 'select';
    this.isShiftPressed = false;
    this.currentArrowType = 'one-way';

    // 캔버스 초기화
    this.initCanvas();

    // 매니저 초기화
    this.elementManager = new ElementManager(this);
    this.toolbarManager = new ToolbarManager(this);
    this.historyManager = new HistoryManager(this);
    this.gridManager = new GridManager(this);
    this.zoomManager = new ZoomManager(this);

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
  }

  initCanvas() {
    this.canvas = document.createElement('canvas');
    this.canvas.classList.add('diagram-canvas');
    
    // 컨테이너 크기에 맞춰 캔버스 크기 설정
    const containerHeight = this.container.clientHeight - 60; // 툴바 높이 고려
    this.canvas.width = this.container.clientWidth;
    this.canvas.height = containerHeight;
    
    this.ctx = this.canvas.getContext('2d');
    this.container.appendChild(this.canvas);
  }

  initUI() {
    this.toolbarManager.init();
    this.gridManager.init();
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
            this.elementManager.deleteSelectedElements();
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

  setTool(toolId, subType = null) {
    if (!this.supportedTools.includes(toolId)) {
      throw new Error(`Unsupported tool: ${toolId}`);
    }
    this.currentTool = toolId;

    // 화살표 타입 설정
    if (toolId === 'arrow' && subType) {
      this.currentArrowType = subType;
    }

    // select 모드가 아닌 다른 도구로 변경할 때는 선택 해제
    if (toolId !== 'select') {
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
}
