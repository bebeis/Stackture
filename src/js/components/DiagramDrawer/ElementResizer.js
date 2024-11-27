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
  
      const isRectangle = this.elementManager.selectedElement.type === 'rectangle';
      const originalAspectRatio = this.elementManager.originalElement.width / 
                                 this.elementManager.originalElement.height;
      const isCornerHandle = ['nw', 'ne', 'se', 'sw'].includes(this.elementManager.resizeHandle);
      
      if (!isRectangle) {
        if (!isCornerHandle) return;
  
        let newWidth, newHeight;
        const ratio = Math.max(Math.abs(dx), Math.abs(dy)) / 
                     Math.max(this.elementManager.originalElement.width, 
                             this.elementManager.originalElement.height);
  
        switch (this.elementManager.resizeHandle) {
          case 'se':
            newWidth = Math.max(minSize, this.elementManager.originalElement.width + dx);
            newHeight = newWidth / originalAspectRatio;
            this.elementManager.selectedElement.width = newWidth;
            this.elementManager.selectedElement.height = newHeight;
            break;
  
          case 'sw':
            newWidth = Math.max(minSize, this.elementManager.originalElement.width - dx);
            newHeight = newWidth / originalAspectRatio;
            this.elementManager.selectedElement.width = newWidth;
            this.elementManager.selectedElement.height = newHeight;
            this.elementManager.selectedElement.x = this.elementManager.originalElement.x + 
                                                  (this.elementManager.originalElement.width - newWidth);
            break;
  
          case 'ne':
            newWidth = Math.max(minSize, this.elementManager.originalElement.width + dx);
            newHeight = newWidth / originalAspectRatio;
            this.elementManager.selectedElement.width = newWidth;
            this.elementManager.selectedElement.height = newHeight;
            this.elementManager.selectedElement.y = this.elementManager.originalElement.y + 
                                                  (this.elementManager.originalElement.height - newHeight);
            break;
  
          case 'nw':
            newWidth = Math.max(minSize, this.elementManager.originalElement.width - dx);
            newHeight = newWidth / originalAspectRatio;
            this.elementManager.selectedElement.width = newWidth;
            this.elementManager.selectedElement.height = newHeight;
            this.elementManager.selectedElement.x = this.elementManager.originalElement.x + 
                                                  (this.elementManager.originalElement.width - newWidth);
            this.elementManager.selectedElement.y = this.elementManager.originalElement.y + 
                                                  (this.elementManager.originalElement.height - newHeight);
            break;
        }
      } else {
        switch (this.elementManager.resizeHandle) {
          case 'se':
            this.elementManager.selectedElement.width = Math.max(minSize, 
              this.elementManager.originalElement.width + dx);
            this.elementManager.selectedElement.height = Math.max(minSize, 
              this.elementManager.originalElement.height + dy);
            break;
  
          case 'sw':
            const newWidthSW = Math.max(minSize, this.elementManager.originalElement.width - dx);
            this.elementManager.selectedElement.x = this.elementManager.originalElement.x + 
                                                  (this.elementManager.originalElement.width - newWidthSW);
            this.elementManager.selectedElement.width = newWidthSW;
            this.elementManager.selectedElement.height = Math.max(minSize, 
              this.elementManager.originalElement.height + dy);
            break;
  
          case 'ne':
            this.elementManager.selectedElement.width = Math.max(minSize, 
              this.elementManager.originalElement.width + dx);
            const newHeightNE = Math.max(minSize, this.elementManager.originalElement.height - dy);
            this.elementManager.selectedElement.y = this.elementManager.originalElement.y + 
                                                  (this.elementManager.originalElement.height - newHeightNE);
            this.elementManager.selectedElement.height = newHeightNE;
            break;
  
          case 'nw':
            const newWidthNW = Math.max(minSize, this.elementManager.originalElement.width - dx);
            const newHeightNW = Math.max(minSize, this.elementManager.originalElement.height - dy);
            this.elementManager.selectedElement.x = this.elementManager.originalElement.x + 
                                                  (this.elementManager.originalElement.width - newWidthNW);
            this.elementManager.selectedElement.y = this.elementManager.originalElement.y + 
                                                  (this.elementManager.originalElement.height - newHeightNW);
            this.elementManager.selectedElement.width = newWidthNW;
            this.elementManager.selectedElement.height = newHeightNW;
            break;
  
          case 'n':
            const newHeightN = Math.max(minSize, this.elementManager.originalElement.height - dy);
            this.elementManager.selectedElement.y = this.elementManager.originalElement.y + 
                                                  (this.elementManager.originalElement.height - newHeightN);
            this.elementManager.selectedElement.height = newHeightN;
            break;
  
          case 's':
            this.elementManager.selectedElement.height = Math.max(minSize, 
              this.elementManager.originalElement.height + dy);
            break;
  
          case 'e':
            this.elementManager.selectedElement.width = Math.max(minSize, 
              this.elementManager.originalElement.width + dx);
            break;
  
          case 'w':
            const newWidthW = Math.max(minSize, this.elementManager.originalElement.width - dx);
            this.elementManager.selectedElement.x = this.elementManager.originalElement.x + 
                                                  (this.elementManager.originalElement.width - newWidthW);
            this.elementManager.selectedElement.width = newWidthW;
            break;
        }
      }
  
      this.elementManager.diagram.redraw();
      this.elementManager.elementDrawer.drawResizeHandles(this.elementManager.selectedElement);
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