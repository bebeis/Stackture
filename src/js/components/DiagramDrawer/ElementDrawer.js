export class ElementDrawer {
    constructor(elementManager) {
      this.elementManager = elementManager;
    }
  
    drawElement(element) {
      const ctx = this.elementManager.diagram.ctx;
      ctx.save();
      
      if (element === this.elementManager.selectedElement) {
        ctx.strokeStyle = '#2196f3';
        ctx.lineWidth = 2;
        ctx.fillStyle = 'rgba(33, 150, 243, 0.1)';
      } else {
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1;
        ctx.fillStyle = 'transparent';
      }
  
      switch (element.type) {
        case 'rectangle':
        case 'square':
          this.drawRectangle(element);
          break;
        case 'circle':
          this.drawCircle(element);
          break;
        case 'arrow':
          this.drawArrow(element);
          break;
        case 'text':
          this.drawText(element);
          break;
        case 'icon':
          this.drawIcon(element);
          break;
      }
  
      ctx.restore();
  
      if (element === this.elementManager.selectedElement) {
        this.drawResizeHandles(element);
      }
    }
  
    drawRectangle(element) {
      const ctx = this.elementManager.diagram.ctx;
      ctx.fillRect(element.x, element.y, element.width, element.height);
      ctx.strokeRect(element.x, element.y, element.width, element.height);
    }
  
    drawCircle(element) {
      const ctx = this.elementManager.diagram.ctx;
      ctx.beginPath();
      ctx.ellipse(
        element.x + element.width / 2,
        element.y + element.height / 2,
        element.width / 2,
        element.height / 2,
        0, 0, Math.PI * 2
      );
      ctx.fill();
      ctx.stroke();
    }
  
    drawArrow(element) {
        const ctx = this.elementManager.diagram.ctx;
        const headLength = 10;
        
        // 시작점과 끝점
        const startX = element.x;
        const startY = element.y;
        const endX = element.x + element.width;
        const endY = element.y + element.height;
        
        // 각도 계산
        const angle = Math.atan2(endY - startY, endX - startX);
        
        // 메인 선 그리기
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        
        // 화살표 머리 그리기
        ctx.lineTo(
          endX - headLength * Math.cos(angle - Math.PI / 6),
          endY - headLength * Math.sin(angle - Math.PI / 6)
        );
        ctx.moveTo(endX, endY);
        ctx.lineTo(
          endX - headLength * Math.cos(angle + Math.PI / 6),
          endY - headLength * Math.sin(angle + Math.PI / 6)
        );
        
        ctx.stroke();
      }
      
  
    drawText(element) {
      if (element.text) {
        const ctx = this.elementManager.diagram.ctx;
        ctx.fillStyle = '#000000';
        ctx.font = element.font || '16px Arial';
        ctx.fillText(element.text, element.x, element.y);
      }
    }
  
    drawIcon(element) {
      if (element.icon) {
        const ctx = this.elementManager.diagram.ctx;
        ctx.drawImage(element.icon, element.x, element.y, element.width, element.height);
      }
    }
  
    drawResizeHandles(element) {
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
  
      const ctx = this.elementManager.diagram.ctx;
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#2196f3';
      
      handles.forEach(handle => {
        ctx.beginPath();
        ctx.rect(
          handle.x - handleSize/2,
          handle.y - handleSize/2,
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
      
      const x = Math.min(start.x, end.x);
      const y = Math.min(start.y, end.y);
      const width = Math.abs(end.x - start.x);
      const height = Math.abs(end.y - start.y);
      
      switch (this.elementManager.diagram.currentTool) {
        case 'square':
          const size = Math.min(width, height);
          ctx.strokeRect(
            x,
            y,
            this.elementManager.diagram.isShiftPressed ? size : width,
            this.elementManager.diagram.isShiftPressed ? size : height
          );
          break;
          
        case 'rectangle':
          ctx.strokeRect(x, y, width, height);
          break;
          
        case 'circle':
          const centerX = start.x + (end.x - start.x) / 2;
          const centerY = start.y + (end.y - start.y) / 2;
          const radiusX = width / 2;
          const radiusY = this.elementManager.diagram.isShiftPressed ? radiusX : height / 2;
          
          ctx.beginPath();
          ctx.ellipse(
            centerX,
            centerY,
            radiusX,
            radiusY,
            0,
            0,
            Math.PI * 2
          );
          ctx.stroke();
          break;
  
        case 'arrow':
          const headLength = 10;
          const dx = end.x - start.x;
          const dy = end.y - start.y;
          const angle = Math.atan2(dy, dx);
          
          ctx.beginPath();
          ctx.moveTo(start.x, start.y);
          ctx.lineTo(end.x, end.y);
          
          // 화살표 머리 그리기
          ctx.lineTo(
            end.x - headLength * Math.cos(angle - Math.PI / 6),
            end.y - headLength * Math.sin(angle - Math.PI / 6)
          );
          ctx.moveTo(end.x, end.y);
          ctx.lineTo(
            end.x - headLength * Math.cos(angle + Math.PI / 6),
            end.y - headLength * Math.sin(angle + Math.PI / 6)
          );
          ctx.stroke();
          break;
      }
      
      ctx.restore();
    }
  }