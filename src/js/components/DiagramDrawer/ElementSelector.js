// src/js/components/DiagramDrawer/ElementSelector.js
export class ElementSelector {
  constructor(elementManager) {
    this.elementManager = elementManager;
  }

  handleSelectMouseDown(pos) {
    const clickedElement = this.findElementAtPosition(pos);

    if (this.elementManager.selectedElement) {
      const handle = this.elementManager.elementResizer.getResizeHandle(pos, this.elementManager.selectedElement);

      if (handle) {
        if (this.elementManager.selectedElement.type !== 'rectangle' &&
            !['nw', 'ne', 'se', 'sw'].includes(handle)) {
          return;
        }
        this.elementManager.isResizing = true;
        this.elementManager.resizeHandle = handle;
        this.elementManager.startPos = pos;
        this.elementManager.originalElement = JSON.parse(
          JSON.stringify(this.elementManager.selectedElement)
        );
      } else if (clickedElement === this.elementManager.selectedElement) {
        this.elementManager.isDragging = true;
        this.elementManager.startPos = pos;
        this.elementManager.originalElement = JSON.parse(
          JSON.stringify(this.elementManager.selectedElement)
        );
      } else {
        if (clickedElement) {
          this.selectElement(clickedElement);
        } else {
          this.selectElement(null);
        }
      }
    } else {
      if (clickedElement) {
        this.selectElement(clickedElement);
      }
    }
  }

  moveElement(pos) {
    if (this.elementManager.selectedElement && this.elementManager.isDragging &&
        this.elementManager.originalElement) {
      const dx = pos.x - this.elementManager.startPos.x;
      const dy = pos.y - this.elementManager.startPos.y;

      this.elementManager.selectedElement.x = this.elementManager.originalElement.x + dx;
      this.elementManager.selectedElement.y = this.elementManager.originalElement.y + dy;

      this.elementManager.diagram.redraw();
      this.elementManager.elementDrawer.drawResizeHandles(this.elementManager.selectedElement);
    }
  }

  selectElement(element) {
    if (this.elementManager.selectedElement) {
      this.elementManager.selectedElement.isSelected = false;
    }
    this.elementManager.selectedElement = element;
    if (element) {
      element.isSelected = true;
    }
    this.elementManager.diagram.redraw();
  }

  findElementAtPosition(pos) {
    for (let i = this.elementManager.elements.length - 1; i >= 0; i--) {
      const element = this.elementManager.elements[i];
      if (this.isPointInElement(pos, element)) {
        return element;
      }
    }
    return null;
  }

  isPointInElement(pos, element) {
    return element.containsPoint(pos.x, pos.y);
  }
}
