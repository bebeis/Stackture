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
    this.selectedElement = null;
    this.isDragging = false;
    this.isDrawing = false;
    this.isResizing = false;
    this.resizeHandle = null;
    this.startPos = { x: 0, y: 0 };
    this.originalElement = null;
    this.textInput = null;

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
        this.elementSelector.handleSelectMouseDown(pos);
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

    if (this.isDragging && this.selectedElement) {
      this.elementSelector.moveElement(snappedPos);
    } else if (this.isResizing && this.selectedElement) {
      this.elementResizer.resizeElement(snappedPos);
    } else if (this.isDrawing) {
      this.diagram.redraw();
      if (this.diagram.gridManager.showGrid) {
        this.diagram.gridManager.drawGrid();
      }
      this.elementDrawer.drawPreview(this.startPos, snappedPos);
    }

    this.updateCursor(snappedPos);
  }

  handleMouseUp(e) {
    if (this.isDrawing) {
      const pos = this.diagram.gridManager.snapToGrid(this.diagram.getMousePos(e));

      const width = Math.abs(pos.x - this.startPos.x);
      const height = Math.abs(pos.y - this.startPos.y);

      if (width >= 10 || height >= 10) {
        this.elementCreator.createNewElement(this.startPos, pos);
        this.diagram.historyManager.saveState();
      }
    } else if (this.isDragging || this.isResizing) {
      this.diagram.historyManager.saveState();
    }

    this.isDragging = false;
    this.isDrawing = false;
    this.isResizing = false;
    this.resizeHandle = null;
    this.originalElement = null;
  }

  drawElements() {
    this.elementDrawer.drawElements();
  }

  updateCursor(pos) {
    if (this.diagram.currentTool === 'select') {
      if (this.selectedElement) {
        const handle = this.elementResizer.getResizeHandle(pos, this.selectedElement);

        if (handle) {
          if (this.selectedElement.type !== 'rectangle' && !['nw', 'ne', 'se', 'sw'].includes(handle)) {
            this.diagram.canvas.style.cursor = 'default';
            return;
          }
          this.diagram.canvas.style.cursor = handle + '-resize';
        } else if (this.elementSelector.isPointInElement(pos, this.selectedElement)) {
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

  deleteSelectedElement() {
    if (this.selectedElement) {
      const index = this.elements.indexOf(this.selectedElement);
      if (index > -1) {
        this.elements.splice(index, 1);
        this.selectedElement = null;
        this.diagram.redraw();
        this.diagram.historyManager.saveState();
        return true;
      }
    }
    return false;
  }
}
