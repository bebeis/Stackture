// src/js/components/DiagramDrawer/ElementManager.js
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
    }
  
    handleMouseDown(e) {
        const pos = this.diagram.getMousePos(e);
        const snappedPos = this.diagram.gridManager.snapToGrid(pos);
      
        switch (this.diagram.currentTool) {
          case 'select':
            const clickedElement = this.findElementAtPosition(pos);
            
            // 이미 선택된 요소가 있는 경우
            if (this.selectedElement) {
              const handle = this.getResizeHandle(pos, this.selectedElement);
              
              if (handle) {
                // 리사이즈 핸들을 클릭한 경우
                this.isResizing = true;
                this.resizeHandle = handle;
                this.startPos = pos;
                this.originalElement = JSON.parse(JSON.stringify(this.selectedElement));
                console.log('Starting resize with handle:', handle);
                
                // 직사각형이 아닌 경우 꼭짓점만 허용
                if (this.selectedElement.type !== 'rectangle' && !['nw', 'ne', 'se', 'sw'].includes(handle)) {
                  this.isResizing = false;
                  return;
                }
              } else if (clickedElement === this.selectedElement) {
                // 선택된 요소를 다시 클릭한 경우 - 드래그 시작
                this.isDragging = true;
                this.startPos = pos;
                this.originalElement = JSON.parse(JSON.stringify(this.selectedElement));
                console.log('Starting drag');
              } else {
                // 다른 곳을 클릭한 경우
                if (clickedElement) {
                  // 다른 요소를 클릭한 경우 - 새로운 요소 선택
                  this.selectElement(clickedElement);
                } else {
                  // 빈 공간을 클릭한 경우 - 선택 해제
                  this.selectElement(null);
                }
              }
            } else {
              // 아무것도 선택되지 않은 상태에서 요소를 클릭한 경우
              if (clickedElement) {
                this.selectElement(clickedElement);
                console.log('Selected element:', clickedElement);
              }
            }
            break;
      
          case 'text':
            this.startTextInput(snappedPos);
            break;
      
          default:
            this.isDrawing = true;
            this.startPos = snappedPos;
            console.log('Drawing started at:', this.startPos);
            break;
        }
      }
  
    handleMouseMove(e) {
      const pos = this.diagram.getMousePos(e);
      const snappedPos = this.diagram.gridManager.snapToGrid(pos);
      
      if (this.isDragging && this.selectedElement) {
        this.moveElement(snappedPos);
      } else if (this.isResizing && this.selectedElement) {
        this.resizeElement(snappedPos);
      } else if (this.isDrawing) {
        // 그리기 중일 때는 매번 캔버스를 지우고 다시 그림
        this.diagram.redraw();
        if (this.diagram.gridManager.showGrid) {
          this.diagram.gridManager.drawGrid();
        }
        this.drawPreview(this.startPos, snappedPos);
      }
      
      this.updateCursor(snappedPos);
    }
  
    handleMouseUp(e) {
        if (this.isDrawing) {
          const pos = this.diagram.gridManager.snapToGrid(this.diagram.getMousePos(e));
          
          // 최소 크기 체크
          const width = Math.abs(pos.x - this.startPos.x);
          const height = Math.abs(pos.y - this.startPos.y);
          
          if (width >= 10 || height >= 10) {  // 최소 크기 조건
            this.createNewElement(this.startPos, pos);
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
  
    createNewElement(start, end) {
        let element = {
          type: this.diagram.currentTool,
          x: Math.min(start.x, end.x),
          y: Math.min(start.y, end.y),
          width: Math.abs(end.x - start.x),
          height: Math.abs(end.y - start.y)
        };
      
        // Shift 키가 눌린 상태에서 정사각형이나 원 그리기
        if (this.diagram.isShiftPressed) {
          if (this.diagram.currentTool === 'square' || this.diagram.currentTool === 'circle') {
            const size = Math.min(element.width, element.height);
            element.width = size;
            element.height = size;
          }
        }
      
        // 최소 크기 적용
        const minSize = 10;
        if (element.width < minSize) element.width = minSize;
        if (element.height < minSize) element.height = minSize;
      
        // 새로운 요소 추가
        this.elements.push(element);
        
        // 새로 생성된 요소를 자동으로 선택
        this.selectedElement = element;
      
        // 도구를 'select' 모드로 변경
        this.diagram.setTool('select');
        
        // 캔버스 다시 그리기
        this.diagram.redraw();
        
        console.log('New element created and selected:', element);
      }

    
  
    drawElements() {
        this.elements.forEach(element => {
          this.diagram.ctx.save();
          
          // 선택된 요소 강조 표시
          if (element === this.selectedElement) {
            this.diagram.ctx.strokeStyle = '#2196f3';
            this.diagram.ctx.lineWidth = 2;
            
            // 선택 표시를 위한 반투명한 파란색 배경
            this.diagram.ctx.fillStyle = 'rgba(33, 150, 243, 0.1)';
          } else {
            this.diagram.ctx.strokeStyle = '#000000';
            this.diagram.ctx.lineWidth = 1;
            this.diagram.ctx.fillStyle = 'transparent';
          }
      
          // 요소 그리기
          switch (element.type) {
            case 'rectangle':
            case 'square':
              this.diagram.ctx.fillRect(element.x, element.y, element.width, element.height);
              this.diagram.ctx.strokeRect(element.x, element.y, element.width, element.height);
              break;
            case 'circle':
              this.diagram.ctx.beginPath();
              this.diagram.ctx.ellipse(
                element.x + element.width / 2,
                element.y + element.height / 2,
                element.width / 2,
                element.height / 2,
                0, 0, Math.PI * 2
              );
              this.diagram.ctx.fill();
              this.diagram.ctx.stroke();
              break;
            // ... 다른 도형들에 대한 처리
          }
      
          this.diagram.ctx.restore();
      
          // 선택된 요소의 리사이즈 핸들 표시
          if (element === this.selectedElement) {
            this.drawResizeHandles(element);
          }
        });
      }
  
    drawRectangle(element) {
      this.diagram.ctx.strokeRect(element.x, element.y, element.width, element.height);
    }
  
    drawCircle(element) {
      this.diagram.ctx.beginPath();
      this.diagram.ctx.ellipse(
        element.x + element.width / 2,
        element.y + element.height / 2,
        element.width / 2,
        element.height / 2,
        0, 0, Math.PI * 2
      );
      this.diagram.ctx.stroke();
    }
  
    drawArrow(element) {
      const headLength = 10;
      const dx = element.width;
      const dy = element.height;
      const angle = Math.atan2(dy, dx);
      
      this.diagram.ctx.beginPath();
      this.diagram.ctx.moveTo(element.x, element.y);
      this.diagram.ctx.lineTo(element.x + dx, element.y + dy);
      
      this.diagram.ctx.lineTo(
        element.x + dx - headLength * Math.cos(angle - Math.PI / 6),
        element.y + dy - headLength * Math.sin(angle - Math.PI / 6)
      );
      this.diagram.ctx.moveTo(element.x + dx, element.y + dy);
      this.diagram.ctx.lineTo(
        element.x + dx - headLength * Math.cos(angle + Math.PI / 6),
        element.y + dy - headLength * Math.sin(angle + Math.PI / 6)
      );
      
      this.diagram.ctx.stroke();
    }
  
    drawText(element) {
      if (element.text) {
        this.diagram.ctx.font = element.font || '14px Arial';
        this.diagram.ctx.fillText(element.text, element.x, element.y);
      }
    }
  
    drawIcon(element) {
      if (element.icon) {
        this.diagram.ctx.drawImage(element.icon, element.x, element.y, element.width, element.height);
      }
    }
  
    startTextInput(pos) {
      if (this.textInput) {
        this.finalizeTextInput();
      }
  
      this.textInput = document.createElement('textarea');
      this.textInput.classList.add('text-input');
      this.textInput.style.left = `${pos.x}px`;
      this.textInput.style.top = `${pos.y}px`;
      
      this.diagram.canvas.parentElement.appendChild(this.textInput);
      this.textInput.focus();
  
      this.textInput.addEventListener('blur', () => {
        this.finalizeTextInput();
      });
  
      this.textInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          this.finalizeTextInput();
        }
      });
    }
  
    finalizeTextInput() {
      if (this.textInput && this.textInput.value.trim()) {
        const pos = {
          x: parseInt(this.textInput.style.left),
          y: parseInt(this.textInput.style.top)
        };
        
        this.elements.push({
          type: 'text',
          x: pos.x,
          y: pos.y + 16,
          text: this.textInput.value.trim(),
          font: '16px Arial'
        });
        
        this.diagram.historyManager.saveState();
        this.diagram.redraw();
      }
  
      if (this.textInput) {
        this.textInput.remove();
        this.textInput = null;
      }
    }
  
    findElementAtPosition(pos) {
      // 배열의 뒤에서부터 검사하여 가장 위에 있는 요소를 선택
      for (let i = this.elements.length - 1; i >= 0; i--) {
        const element = this.elements[i];
        if (this.isPointInElement(pos, element)) {
          console.log('Element found at position:', element);
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
          // 화살표의 경우 선과의 거리 계산
          const start = { x: element.x, y: element.y };
          const end = { x: element.x + element.width, y: element.y + element.height };
          return this.isPointNearLine(pos, start, end, 5);
        
        case 'text':
          // 텍스트의 경우 간단한 사각형 범위 검사
          const metrics = this.diagram.ctx.measureText(element.text);
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
  
    updateCursor(pos) {
        if (this.diagram.currentTool === 'select') {
          // 선택된 요소가 있는 경우
          if (this.selectedElement) {
            // 리사이즈 핸들 위에 있는지 확인
            const handle = this.getResizeHandle(pos, this.selectedElement);
            if (handle) {
              // 직사각형이 아닌 경우 꼭짓점에서만 커서 변경
              if (this.selectedElement.type !== 'rectangle' && !['nw', 'ne', 'se', 'sw'].includes(handle)) {
                this.diagram.canvas.style.cursor = 'default';
                return;
              }
              // 리사이즈 핸들에 따른 커서 스타일 설정
              this.diagram.canvas.style.cursor = handle + '-resize';
            } else if (this.isPointInElement(pos, this.selectedElement)) {
              // 요소 내부에 있으면 이동 커서
              this.diagram.canvas.style.cursor = 'move';
            } else {
              this.diagram.canvas.style.cursor = 'default';
            }
          } else {
            // 선택된 요소가 없는 경우, 요소 위에 있으면 포인터 커서
            this.diagram.canvas.style.cursor = 
              this.findElementAtPosition(pos) ? 'pointer' : 'default';
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
      
  
      selectElement(element) {
        this.selectedElement = element;
        
        // 선택 상태가 변경될 때마다 캔버스 다시 그리기
        this.diagram.redraw();
        
        if (element) {
          console.log('Selected element:', element.type);
        } else {
          console.log('Selection cleared');
        }
      }
  
    drawResizeHandles(element) {
        const handleSize = 8;
        const handles = [];
        
        // 직사각형인 경우 모든 핸들 표시
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
          // 다른 도형들은 꼭짓점 핸들만 표시
          handles.push(
            { x: element.x, y: element.y, cursor: 'nw' },
            { x: element.x + element.width, y: element.y, cursor: 'ne' },
            { x: element.x + element.width, y: element.y + element.height, cursor: 'se' },
            { x: element.x, y: element.y + element.height, cursor: 'sw' }
          );
        }
      
        this.diagram.ctx.fillStyle = '#ffffff';
        this.diagram.ctx.strokeStyle = '#2196f3';
        
        handles.forEach(handle => {
          this.diagram.ctx.beginPath();
          this.diagram.ctx.rect(
            handle.x - handleSize/2,
            handle.y - handleSize/2,
            handleSize,
            handleSize
          );
          this.diagram.ctx.fill();
          this.diagram.ctx.stroke();
        });
      }
  
    moveElement(pos) {
      if (this.selectedElement && this.isDragging && this.originalElement) {
        const dx = pos.x - this.startPos.x;
        const dy = pos.y - this.startPos.y;
        
        // 원본 요소를 기반으로 새로운 위치 계산
        this.selectedElement.x = this.originalElement.x + dx;
        this.selectedElement.y = this.originalElement.y + dy;
        
        this.diagram.redraw();
        this.drawResizeHandles(this.selectedElement);
      }
    }
  
    resizeElement(pos) {
        if (!this.selectedElement || !this.isResizing || !this.originalElement) return;
      
        const dx = pos.x - this.startPos.x;
        const dy = pos.y - this.startPos.y;
        const minSize = 10;
      
        // 현재 선택된 도형이 직사각형인지 확인
        const isRectangle = this.selectedElement.type === 'rectangle';
        
        // 원본 도형의 비율 계산
        const originalAspectRatio = this.originalElement.width / this.originalElement.height;
      
        // 꼭짓점 핸들인지 확인
        const isCornerHandle = ['nw', 'ne', 'se', 'sw'].includes(this.resizeHandle);
        
        // 직사각형이 아닌 경우, 비율을 유지하며 꼭짓점으로만 크기 조절
        if (!isRectangle) {
          if (!isCornerHandle) return; // 꼭짓점이 아닌 경우 크기 조절하지 않음
      
          let newWidth, newHeight;
          const ratio = Math.max(Math.abs(dx), Math.abs(dy)) / Math.max(this.originalElement.width, this.originalElement.height);
      
          switch (this.resizeHandle) {
            case 'se':
              newWidth = Math.max(minSize, this.originalElement.width + dx);
              newHeight = newWidth / originalAspectRatio;
              this.selectedElement.width = newWidth;
              this.selectedElement.height = newHeight;
              break;
      
            case 'sw':
              newWidth = Math.max(minSize, this.originalElement.width - dx);
              newHeight = newWidth / originalAspectRatio;
              this.selectedElement.width = newWidth;
              this.selectedElement.height = newHeight;
              this.selectedElement.x = this.originalElement.x + (this.originalElement.width - newWidth);
              break;
      
            case 'ne':
              newWidth = Math.max(minSize, this.originalElement.width + dx);
              newHeight = newWidth / originalAspectRatio;
              this.selectedElement.width = newWidth;
              this.selectedElement.height = newHeight;
              this.selectedElement.y = this.originalElement.y + (this.originalElement.height - newHeight);
              break;
      
            case 'nw':
              newWidth = Math.max(minSize, this.originalElement.width - dx);
              newHeight = newWidth / originalAspectRatio;
              this.selectedElement.width = newWidth;
              this.selectedElement.height = newHeight;
              this.selectedElement.x = this.originalElement.x + (this.originalElement.width - newWidth);
              this.selectedElement.y = this.originalElement.y + (this.originalElement.height - newHeight);
              break;
          }
        } 
        // 직사각형인 경우, 모든 방향으로 자유롭게 크기 조절
        else {
          switch (this.resizeHandle) {
            // 모서리 핸들
            case 'se':
              this.selectedElement.width = Math.max(minSize, this.originalElement.width + dx);
              this.selectedElement.height = Math.max(minSize, this.originalElement.height + dy);
              break;
      
            case 'sw':
              const newWidthSW = Math.max(minSize, this.originalElement.width - dx);
              this.selectedElement.x = this.originalElement.x + (this.originalElement.width - newWidthSW);
              this.selectedElement.width = newWidthSW;
              this.selectedElement.height = Math.max(minSize, this.originalElement.height + dy);
              break;
      
            case 'ne':
              this.selectedElement.width = Math.max(minSize, this.originalElement.width + dx);
              const newHeightNE = Math.max(minSize, this.originalElement.height - dy);
              this.selectedElement.y = this.originalElement.y + (this.originalElement.height - newHeightNE);
              this.selectedElement.height = newHeightNE;
              break;
      
            case 'nw':
              const newWidthNW = Math.max(minSize, this.originalElement.width - dx);
              const newHeightNW = Math.max(minSize, this.originalElement.height - dy);
              this.selectedElement.x = this.originalElement.x + (this.originalElement.width - newWidthNW);
              this.selectedElement.y = this.originalElement.y + (this.originalElement.height - newHeightNW);
              this.selectedElement.width = newWidthNW;
              this.selectedElement.height = newHeightNW;
              break;
      
            // 변 핸들
            case 'n':
              const newHeightN = Math.max(minSize, this.originalElement.height - dy);
              this.selectedElement.y = this.originalElement.y + (this.originalElement.height - newHeightN);
              this.selectedElement.height = newHeightN;
              break;
      
            case 's':
              this.selectedElement.height = Math.max(minSize, this.originalElement.height + dy);
              break;
      
            case 'e':
              this.selectedElement.width = Math.max(minSize, this.originalElement.width + dx);
              break;
      
            case 'w':
              const newWidthW = Math.max(minSize, this.originalElement.width - dx);
              this.selectedElement.x = this.originalElement.x + (this.originalElement.width - newWidthW);
              this.selectedElement.width = newWidthW;
              break;
          }
        }
      
        // 캔버스 다시 그리기
        this.diagram.redraw();
        this.drawResizeHandles(this.selectedElement);
      }
  
      deleteSelectedElement() {
        if (this.selectedElement) {
          const index = this.elements.indexOf(this.selectedElement);
          if (index > -1) {
            // 요소 삭제
            this.elements.splice(index, 1);
            
            // 선택 상태 초기화
            this.selectedElement = null;
            
            // 캔버스 다시 그리기
            this.diagram.redraw();
            
            // 실행 취소를 위해 상태 저장
            this.diagram.historyManager.saveState();
            
            console.log('Element deleted');
            
            // 삭제 성공을 반환
            return true;
          }
        }
        return false;
      }
  
    getResizeHandle(pos, element) {
      const handleSize = 8;
      const handles = [];
      
      // 직사각형인 경우 모든 핸들 추가
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
        // 다른 도형들은 모서리 핸들만 추가
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
  
    drawPreview(start, end) {
      this.diagram.ctx.save();
      this.diagram.ctx.setLineDash([5, 5]);
      
      // 시작점과 끝점의 상대적 위치에 따라 좌표 계산
      const x = Math.min(start.x, end.x);
      const y = Math.min(start.y, end.y);
      const width = Math.abs(end.x - start.x);
      const height = Math.abs(end.y - start.y);
      
      this.diagram.ctx.beginPath();
      
      switch (this.diagram.currentTool) {
        case 'square':
          const size = Math.min(width, height);
          this.diagram.ctx.strokeRect(
            x,
            y,
            this.diagram.isShiftPressed ? size : width,
            this.diagram.isShiftPressed ? size : height
          );
          break;
          
        case 'rectangle':
          this.diagram.ctx.strokeRect(x, y, width, height);
          break;
          
        case 'circle':
          const centerX = start.x + (end.x - start.x) / 2;
          const centerY = start.y + (end.y - start.y) / 2;
          const radiusX = width / 2;
          const radiusY = this.diagram.isShiftPressed ? radiusX : height / 2;
          
          this.diagram.ctx.beginPath();
          this.diagram.ctx.ellipse(
            centerX,
            centerY,
            radiusX,
            radiusY,
            0,
            0,
            Math.PI * 2
          );
          this.diagram.ctx.stroke();
          break;
          
        case 'arrow':
          const headLength = 10;
          const dx = end.x - start.x;
          const dy = end.y - start.y;
          const angle = Math.atan2(dy, dx);
          
          this.diagram.ctx.beginPath();
          this.diagram.ctx.moveTo(start.x, start.y);
          this.diagram.ctx.lineTo(end.x, end.y);
          
          // 화살표 머리 그리기
          this.diagram.ctx.lineTo(
            end.x - headLength * Math.cos(angle - Math.PI / 6),
            end.y - headLength * Math.sin(angle - Math.PI / 6)
          );
          this.diagram.ctx.moveTo(end.x, end.y);
          this.diagram.ctx.lineTo(
            end.x - headLength * Math.cos(angle + Math.PI / 6),
            end.y - headLength * Math.sin(angle + Math.PI / 6)
          );
          this.diagram.ctx.stroke();
          break;
      }
      
      this.diagram.ctx.restore();
    }
}
