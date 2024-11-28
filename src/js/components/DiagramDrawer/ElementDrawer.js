// src/js/components/DiagramDrawer/ElementDrawer.js
export class ElementDrawer {
  constructor(elementManager) {
    this.elementManager = elementManager;
  }

  drawElement(element) {
    if (!element || typeof element.draw !== 'function') {
      console.error('Invalid element:', element);
      return;
    }
    
    const ctx = this.elementManager.diagram.ctx;
    ctx.save();
    
    // 줌 변환 적용
    const zoom = this.elementManager.diagram.zoomManager;
    ctx.setTransform(
      zoom.scale, 0,
      0, zoom.scale,
      zoom.translateX,
      zoom.translateY
    );
    
    element.draw(ctx);
    if (element === this.elementManager.selectedElement) {
      this.drawResizeHandles(element);
    }
    
    ctx.restore();
  }

  drawElements() {
    this.elementManager.elements.forEach((element) => {
      this.drawElement(element);
    });
  }

  drawResizeHandles(element) {
    const handleSize = 8;
    const handles = [];

    if (element.type === 'rectangle' || element.type === 'icon' || element.type === 'text') {
      handles.push(
        { x: element.x, y: element.y, cursor: 'nw' },
        { x: element.x + element.width / 2, y: element.y, cursor: 'n' },
        { x: element.x + element.width, y: element.y, cursor: 'ne' },
        { x: element.x + element.width, y: element.y + element.height / 2, cursor: 'e' },
        { x: element.x + element.width, y: element.y + element.height, cursor: 'se' },
        { x: element.x + element.width / 2, y: element.y + element.height, cursor: 's' },
        { x: element.x, y: element.y + element.height, cursor: 'sw' },
        { x: element.x, y: element.y + element.height / 2, cursor: 'w' }
      );
    } else {
      handles.push(
        { x: element.x, y: element.y, cursor: 'nw' },
        { x: element.x + element.width, y: element.y, cursor: 'ne' },
        { x: element.x + element.width, y: element.y + element.height, cursor: 'se' },
        { x: element.x, y: element.y + element.height, cursor: 'sw' }
      );
    }

    const ctx = this.elementManager.diagram.ctx;
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#2196f3';

    handles.forEach((handle) => {
      ctx.beginPath();
      ctx.rect(
        handle.x - handleSize / 2,
        handle.y - handleSize / 2,
        handleSize,
        handleSize
      );
      ctx.fill();
      ctx.stroke();
    });
  }

  drawPreview(start, end) {
    const ctx = this.elementManager.diagram.ctx;
    ctx.save();
    ctx.setLineDash([5, 5]);
  
    const type = this.elementManager.diagram.currentTool;
    const factory = this.elementManager.elementFactory;
  
    // 현재 도구가 등록된 요소인지 확인
    if (!factory.elementClasses[type] && type !== 'select') {
      ctx.restore();
      return;
    }
  
    // 임시 요소 생성
    let x = start.x;
    let y = start.y;
    let width = end.x - start.x;
    let height = end.y - start.y;

    // 그리드 영역 내에서만 그리기
    if (!this.isWithinGrid({ x: x + width / 2, y: y + height / 2 })) {
      ctx.restore();
      return;
    }
  
    if (type !== 'arrow') {
      x = Math.min(start.x, end.x);
      y = Math.min(start.y, end.y);
      width = Math.abs(width);
      height = Math.abs(height);
    }

    try {
      const tempElement = factory.createElement(type, x, y, width, height);
      tempElement.isSelected = true;
      tempElement.draw(ctx);
    } catch (error) {
      console.warn(`Failed to create preview for type: ${type}`);
    }
  
    ctx.restore();
  }

  isWithinGrid(pos) {
    const gridSettings = this.elementManager.diagram.gridManager.getGridSettings();
    const canvasWidth = this.elementManager.diagram.canvas.width;
    const canvasHeight = this.elementManager.diagram.canvas.height;

    return pos.x >= 0 && pos.x <= canvasWidth && pos.y >= 0 && pos.y <= canvasHeight;
  }
}
