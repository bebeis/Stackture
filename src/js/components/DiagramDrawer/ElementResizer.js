// src/js/components/DiagramDrawer/ElementResizer.js
export class ElementResizer {
    constructor(elementManager) {
      this.elementManager = elementManager;
    }
  
    resizeElement(pos) {
        if (!this.elementManager.selectedElement || !this.elementManager.isResizing || 
            !this.elementManager.originalElement) return;
    
        const dx = pos.x - this.elementManager.startPos.x;
        const dy = pos.y - this.elementManager.startPos.y;
        const minSize = 10;
        const selected = this.elementManager.selectedElement;
        const original = this.elementManager.originalElement;
    
        if (selected.type === 'arrow') {
          switch (this.elementManager.resizeHandle) {
            case 'se':
              selected.width = original.width + dx;
              selected.height = original.height + dy;
              break;
            case 'sw':
              selected.x = original.x + dx;
              selected.width = -dx;
              selected.height = original.height + dy;
              break;
            case 'ne':
              selected.width = original.width + dx;
              selected.y = original.y + dy;
              selected.height = -dy;
              break;
            case 'nw':
              selected.x = original.x + dx;
              selected.y = original.y + dy;
              selected.width = -dx;
              selected.height = -dy;
              break;
          }
        } else {
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
    
        this.elementManager.diagram.redraw();
        this.elementManager.elementDrawer.drawResizeHandles(selected);
      }
  
    getResizeHandle(pos, element) {
      const handleSize = 8;
      const handles = [];
      
      if (element.type === 'rectangle') {
        handles.push(
          { x: element.x, y: element.y, cursor: 'nw' },
          { x: element.x + element.width/2, y: element.y, cursor: 'n' },
          { x: element.x + element.width, y: element.y, cursor: 'ne' },
          { x: element.x + element.width, y: element.y + element.height/2, cursor: 'e' },
          { x: element.x + element.width, y: element.y + element.height, cursor: 'se' },
          { x: element.x + element.width/2, y: element.y + element.height, cursor: 's' },
          { x: element.x, y: element.y + element.height, cursor: 'sw' },
          { x: element.x, y: element.y + element.height/2, cursor: 'w' }
        );
      } else {
        handles.push(
          { x: element.x, y: element.y, cursor: 'nw' },
          { x: element.x + element.width, y: element.y, cursor: 'ne' },
          { x: element.x + element.width, y: element.y + element.height, cursor: 'se' },
          { x: element.x, y: element.y + element.height, cursor: 'sw' }
        );
      }
  
      for (const handle of handles) {
        if (Math.abs(pos.x - handle.x) <= handleSize/2 &&
            Math.abs(pos.y - handle.y) <= handleSize/2) {
          return handle.cursor;
        }
      }
      return null;
    }
  }