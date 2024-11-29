// src/js/components/DiagramDrawer/ElementManager.js

import { ElementCreator } from './ElementCreator.js';
import { ElementDrawer } from './ElementDrawer.js';
import { ElementSelector } from './ElementSelector.js';
import { ElementResizer } from './ElementResizer.js';
import { elementFactory } from './elements/ElementFactory.js';

export class ElementManager {
  constructor(diagram) {
    this.diagram = diagram;
    this.elements = [];
    this.selectedElements = []; // 다중 선택된 요소들을 저장
    this.isDragging = false;
    this.isDrawing = false;
    this.isResizing = false;
    this.resizeHandle = null;
    this.startPos = { x: 0, y: 0 };
    this.originalElements = []; // 선택된 요소들의 원본 상태 저장
    this.textInput = null;
    this.selectionRectangle = null; // 드래그 선택을 위한 사각형

    this.elementFactory = elementFactory; // 싱글톤 인스턴스 사용

    this.elementDrawer = new ElementDrawer(this);
    this.elementSelector = new ElementSelector(this);
    this.elementResizer = new ElementResizer(this);
    this.elementCreator = new ElementCreator(this);
  }

  handleMouseDown(e) {
    const pos = this.diagram.getMousePos(e);
    const snappedPos = this.diagram.gridManager.snapToGrid(pos);

    switch (this.diagram.currentTool) {
      case 'select':
        this.elementSelector.handleSelectMouseDown(e, pos);
        break;

      case 'text':
        this.elementCreator.startTextInput(snappedPos);
        break;

      default:
        this.isDrawing = true;
        this.startPos = snappedPos;
        break;
    }
  }

  handleMouseMove(e) {
    const pos = this.diagram.getMousePos(e);
    const snappedPos = this.diagram.gridManager.snapToGrid(pos);

    if (this.isDragging && this.selectedElements.length > 0) {
      this.elementSelector.moveElements(snappedPos);
    } else if (this.isResizing && this.selectedElements.length > 0) {
      this.elementResizer.resizeElements(snappedPos);
    } else if (this.isDrawing) {
      this.diagram.redraw();
      if (this.diagram.gridManager.showGrid) {
        this.diagram.gridManager.drawGrid();
      }
      this.elementDrawer.drawPreview(this.startPos, snappedPos);
    } else if (this.selectionRectangle) {
      // 선택 사각형 업데이트 및 그리기
      this.selectionRectangle.endX = snappedPos.x;
      this.selectionRectangle.endY = snappedPos.y;
      this.diagram.redraw();
      this.elementDrawer.drawSelectionRectangle(this.selectionRectangle);
    }

    this.updateCursor(snappedPos);
  }

  handleMouseUp(e) {
    const pos = this.diagram.getMousePos(e);
    const snappedPos = this.diagram.gridManager.snapToGrid(pos);

    if (this.isDrawing) {
      // 그리기 완료 처리
      if (this.isWithinGrid(snappedPos)) {
        const width = Math.abs(snappedPos.x - this.startPos.x);
        const height = Math.abs(snappedPos.y - this.startPos.y);

        if (width >= 10 || height >= 10) {
          this.elementCreator.createNewElement(this.startPos, snappedPos);
          this.diagram.historyManager.saveState();
        }
      }
    } else if (this.isDragging || this.isResizing) {
      this.diagram.historyManager.saveState();
    } else if (this.selectionRectangle) {
      // 선택 사각형으로 선택된 요소 처리
      this.elementSelector.selectElementsInRectangle(this.selectionRectangle);
    }

    this.isDragging = false;
    this.isDrawing = false;
    this.isResizing = false;
    this.resizeHandle = null;
    this.originalElements = [];
    this.selectionRectangle = null;
  }

  isWithinGrid(pos) {
    // 그리드 영역 내인지 확인
    const gridSettings = this.diagram.gridManager.getGridSettings();
    const canvasWidth = this.diagram.canvas.width;
    const canvasHeight = this.diagram.canvas.height;

    return pos.x >= 0 && pos.x <= canvasWidth && pos.y >= 0 && pos.y <= canvasHeight;
  }

  deleteSelectedElements() {
    if (this.selectedElements.length > 0) {
      this.elements = this.elements.filter(
        (el) => !this.selectedElements.includes(el)
      );
      this.selectedElements = [];
      this.diagram.redraw();
      this.diagram.historyManager.saveState();
    }
  }

  updateCursor(pos) {
    if (this.diagram.currentTool === 'select') {
      if (this.selectedElements.length > 0) {
        const handle = this.elementResizer.getResizeHandle(pos, this.selectedElements);

        if (handle) {
          this.diagram.canvas.style.cursor = handle + '-resize';
        } else if (this.elementSelector.isPointInSelectedElements(pos)) {
          this.diagram.canvas.style.cursor = 'move';
        } else {
          this.diagram.canvas.style.cursor = 'default';
        }
      } else {
        this.diagram.canvas.style.cursor =
          this.elementSelector.findElementAtPosition(pos) ? 'pointer' : 'default';
      }
    } else {
      this.diagram.canvas.style.cursor = this.getCursorForTool(this.diagram.currentTool);
    }
  }

  drawElements() {
    this.elementDrawer.drawElements();
  }

  getCursorForTool(tool) {
    switch (tool) {
      case 'text':
        return 'text';
      case 'select':
        return 'default';
      default:
        return 'crosshair';
    }
  }
}
