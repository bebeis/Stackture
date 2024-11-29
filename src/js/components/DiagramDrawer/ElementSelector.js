// src/js/components/DiagramDrawer/ElementSelector.js
export class ElementSelector {
  constructor(elementManager) {
    this.elementManager = elementManager;
  }

  handleSelectMouseDown(e, pos) {
    const clickedElement = this.findElementAtPosition(pos);
    const isCtrlPressed = e.ctrlKey || e.metaKey;
    const isShiftPressed = e.shiftKey;

    const resizeHandle = this.elementManager.elementResizer.getResizeHandle(
      pos,
      this.elementManager.selectedElements
    );

    if (resizeHandle) {
      this.elementManager.isResizing = true;
      this.elementManager.resizeHandle = resizeHandle;
      this.elementManager.startPos = pos;
      this.elementManager.originalElements = this.elementManager.selectedElements.map((el) =>
        JSON.parse(JSON.stringify(el))
      );
    } else if (clickedElement && this.isElementSelected(clickedElement)) {
      // 이미 선택된 요소를 드래그
      this.elementManager.isDragging = true;
      this.elementManager.startPos = pos;
      this.elementManager.originalElements = this.elementManager.selectedElements.map((el) =>
        JSON.parse(JSON.stringify(el))
      );
    } else if (clickedElement && (isCtrlPressed || isShiftPressed)) {
      // Ctrl 또는 Shift 키로 다중 선택
      this.toggleElementSelection(clickedElement);
    } else if (clickedElement) {
      // 단일 요소 선택
      this.selectSingleElement(clickedElement);
      this.elementManager.isDragging = true;
      this.elementManager.startPos = pos;
      this.elementManager.originalElements = this.elementManager.selectedElements.map((el) =>
        JSON.parse(JSON.stringify(el))
      );
    } else {
      // 빈 영역을 드래그하여 선택 사각형 시작
      this.deselectAll();
      this.elementManager.selectionRectangle = {
        startX: pos.x,
        startY: pos.y,
        endX: pos.x,
        endY: pos.y,
      };
    }
  }

  moveElements(pos) {
    if (
      this.elementManager.selectedElements.length > 0 &&
      this.elementManager.isDragging &&
      this.elementManager.originalElements.length > 0
    ) {
      const dx = pos.x - this.elementManager.startPos.x;
      const dy = pos.y - this.elementManager.startPos.y;

      this.elementManager.selectedElements.forEach((el, index) => {
        const original = this.elementManager.originalElements[index];
        el.x = original.x + dx;
        el.y = original.y + dy;
      });

      this.elementManager.diagram.redraw();
      this.elementManager.elementDrawer.drawResizeHandles(this.elementManager.selectedElements);
    }
  }

  selectSingleElement(element) {
    this.deselectAll();
    element.isSelected = true;
    this.elementManager.selectedElements = [element];
    this.elementManager.diagram.redraw();
  }

  toggleElementSelection(element) {
    if (this.isElementSelected(element)) {
      element.isSelected = false;
      this.elementManager.selectedElements = this.elementManager.selectedElements.filter(
        (el) => el !== element
      );
    } else {
      element.isSelected = true;
      this.elementManager.selectedElements.push(element);
    }
    this.elementManager.diagram.redraw();
  }

  deselectAll() {
    this.elementManager.selectedElements.forEach((el) => (el.isSelected = false));
    this.elementManager.selectedElements = [];
    this.elementManager.diagram.redraw();
  }

  selectElementsInRectangle(rect) {
    const x1 = Math.min(rect.startX, rect.endX);
    const y1 = Math.min(rect.startY, rect.endY);
    const x2 = Math.max(rect.startX, rect.endX);
    const y2 = Math.max(rect.startY, rect.endY);

    this.deselectAll();

    this.elementManager.elements.forEach((el) => {
      if (
        el.x >= x1 &&
        el.y >= y1 &&
        el.x + el.width <= x2 &&
        el.y + el.height <= y2
      ) {
        el.isSelected = true;
        this.elementManager.selectedElements.push(el);
      }
    });

    this.elementManager.diagram.redraw();
  }

  findElementAtPosition(pos) {
    for (let i = this.elementManager.elements.length - 1; i >= 0; i--) {
      const element = this.elementManager.elements[i];
      if (element.containsPoint(pos.x, pos.y)) {
        return element;
      }
    }
    return null;
  }

  isPointInSelectedElements(pos) {
    return this.elementManager.selectedElements.some((el) =>
      el.containsPoint(pos.x, pos.y)
    );
  }

  isElementSelected(element) {
    return this.elementManager.selectedElements.includes(element);
  }
}
