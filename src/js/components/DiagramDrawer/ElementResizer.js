// src/js/components/DiagramDrawer/ElementResizer.js
export class ElementResizer {
  constructor(elementManager) {
    this.elementManager = elementManager;
  }

  resizeElements(pos) {
    if (
      this.elementManager.selectedElements.length === 0 ||
      !this.elementManager.isResizing ||
      this.elementManager.originalElements.length === 0
    )
      return;

    const dx = pos.x - this.elementManager.startPos.x;
    const dy = pos.y - this.elementManager.startPos.y;
    const minSize = 10;

    this.elementManager.selectedElements.forEach((selected, index) => {
      const original = this.elementManager.originalElements[index];

      if (selected.type === 'arrow') {
        // 화살표는 width와 height를 음수로 허용
        switch (this.elementManager.resizeHandle) {
          case 'se':
            selected.width = original.width + dx;
            selected.height = original.height + dy;
            break;
          case 'sw':
            selected.x = original.x + dx;
            selected.width = original.width + -dx;
            selected.height = original.height + dy;
            break;
          case 'ne':
            selected.width = original.width + dx;
            selected.y = original.y + dy;
            selected.height = original.height + -dy;
            break;
          case 'nw':
            selected.x = original.x + dx;
            selected.y = original.y + dy;
            selected.width = original.width + -dx;
            selected.height = original.height + -dy;
            break;
        }
      } else {
        // 다른 요소들은 최소 크기 보정
        switch (this.elementManager.resizeHandle) {
          case 'se':
            selected.width = Math.max(minSize, original.width + dx);
            selected.height = Math.max(minSize, original.height + dy);
            break;

          case 'sw':
            const newWidthSW = Math.max(minSize, original.width - dx);
            selected.x = original.x + (original.width - newWidthSW);
            selected.width = newWidthSW;
            selected.height = Math.max(minSize, original.height + dy);
            break;

          case 'ne':
            selected.width = Math.max(minSize, original.width + dx);
            const newHeightNE = Math.max(minSize, original.height - dy);
            selected.y = original.y + (original.height - newHeightNE);
            selected.height = newHeightNE;
            break;

          case 'nw':
            const newWidthNW = Math.max(minSize, original.width - dx);
            const newHeightNW = Math.max(minSize, original.height - dy);
            selected.x = original.x + (original.width - newWidthNW);
            selected.y = original.y + (original.height - newHeightNW);
            selected.width = newWidthNW;
            selected.height = newHeightNW;
            break;

          case 'n':
            const newHeightN = Math.max(minSize, original.height - dy);
            selected.y = original.y + (original.height - newHeightN);
            selected.height = newHeightN;
            break;

          case 's':
            selected.height = Math.max(minSize, original.height + dy);
            break;

          case 'e':
            selected.width = Math.max(minSize, original.width + dx);
            break;

          case 'w':
            const newWidthW = Math.max(minSize, original.width - dx);
            selected.x = original.x + (original.width - newWidthW);
            selected.width = newWidthW;
            break;
        }
      }
    });

    this.elementManager.diagram.redraw();
    this.elementManager.elementDrawer.drawResizeHandles(this.elementManager.selectedElements);
  }

  getResizeHandle(pos, elements) {
    const handleSize = 8;
    const handles = [];

    // 선택된 모든 요소의 바운딩 박스를 계산
    const boundingBox = this.getBoundingBox(elements);

    if (!boundingBox) return null;

    // 요소 타입에 따른 핸들 위치 설정
    handles.push(
      { x: boundingBox.x, y: boundingBox.y, cursor: 'nw' },
      { x: boundingBox.x + boundingBox.width / 2, y: boundingBox.y, cursor: 'n' },
      { x: boundingBox.x + boundingBox.width, y: boundingBox.y, cursor: 'ne' },
      { x: boundingBox.x + boundingBox.width, y: boundingBox.y + boundingBox.height / 2, cursor: 'e' },
      { x: boundingBox.x + boundingBox.width, y: boundingBox.y + boundingBox.height, cursor: 'se' },
      { x: boundingBox.x + boundingBox.width / 2, y: boundingBox.y + boundingBox.height, cursor: 's' },
      { x: boundingBox.x, y: boundingBox.y + boundingBox.height, cursor: 'sw' },
      { x: boundingBox.x, y: boundingBox.y + boundingBox.height / 2, cursor: 'w' }
    );

    for (const handle of handles) {
      if (
        Math.abs(pos.x - handle.x) <= handleSize / 2 &&
        Math.abs(pos.y - handle.y) <= handleSize / 2
      ) {
        return handle.cursor;
      }
    }
    return null;
  }

  getBoundingBox(elements) {
    if (elements.length === 0) return null;

    let xMin = elements[0].x;
    let yMin = elements[0].y;
    let xMax = elements[0].x + elements[0].width;
    let yMax = elements[0].y + elements[0].height;

    elements.forEach((el) => {
      xMin = Math.min(xMin, el.x);
      yMin = Math.min(yMin, el.y);
      xMax = Math.max(xMax, el.x + el.width);
      yMax = Math.max(yMax, el.y + el.height);
    });

    return {
      x: xMin,
      y: yMin,
      width: xMax - xMin,
      height: yMax - yMin,
    };
  }
}
