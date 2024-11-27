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
      this.elementManager.selectedElement = element;
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
      switch (element.type) {
        case 'rectangle':
        case 'square':
        case 'icon':
          return pos.x >= element.x && 
                 pos.x <= element.x + element.width &&
                 pos.y >= element.y && 
                 pos.y <= element.y + element.height;
        
        case 'circle':
          const centerX = element.x + element.width / 2;
          const centerY = element.y + element.height / 2;
          const radiusX = element.width / 2;
          const radiusY = element.height / 2;
          
          return Math.pow((pos.x - centerX) / radiusX, 2) + 
                 Math.pow((pos.y - centerY) / radiusY, 2) <= 1;
        
        case 'arrow':
          const start = { x: element.x, y: element.y };
          const end = { x: element.x + element.width, y: element.y + element.height };
          return this.isPointNearLine(pos, start, end, 5);
        
        case 'text':
          const metrics = this.elementManager.diagram.ctx.measureText(element.text);
          const textWidth = metrics.width;
          const textHeight = parseInt(element.font) || 16;
          return pos.x >= element.x && 
                 pos.x <= element.x + textWidth &&
                 pos.y >= element.y - textHeight &&
                 pos.y <= element.y;
        
        default:
          return false;
      }
    }
  
    isPointNearLine(point, start, end, threshold = 5) {
      const a = end.y - start.y;
      const b = start.x - end.x;
      const c = end.x * start.y - start.x * end.y;
      
      const distance = Math.abs(a * point.x + b * point.y + c) / 
                      Math.sqrt(a * a + b * b);
      
      return distance <= threshold;
    }
  }