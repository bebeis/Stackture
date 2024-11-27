// src/js/components/DiagramDrawer/ElementCreator.js
export class ElementCreator {
    constructor(elementManager) {
      this.elementManager = elementManager;
    }
  
    createNewElement(start, end) {
        let element = {
          type: this.elementManager.diagram.currentTool,
          x: start.x,
          y: start.y,
          width: end.x - start.x,
          height: end.y - start.y
        };
      
        // 화살표일 경우 음수 width/height 허용
        if (element.type !== 'arrow') {
          element.x = Math.min(start.x, end.x);
          element.y = Math.min(start.y, end.y);
          element.width = Math.abs(end.x - start.x);
          element.height = Math.abs(end.y - start.y);
        }
        
        const minSize = 10;
        if (element.type !== 'arrow' && element.width < minSize) element.width = minSize;
        if (element.type !== 'arrow' && element.height < minSize) element.height = minSize;
      
        this.elementManager.elements.push(element);
        this.elementManager.selectedElement = element;
        this.elementManager.diagram.setTool('select');
        this.elementManager.diagram.redraw();
      }
  
    startTextInput(pos) {
      if (this.elementManager.textInput) {
        this.finalizeTextInput();
      }
  
      this.elementManager.textInput = document.createElement('textarea');
      this.elementManager.textInput.classList.add('text-input');
      this.elementManager.textInput.style.left = `${pos.x}px`;
      this.elementManager.textInput.style.top = `${pos.y}px`;
      
      this.elementManager.diagram.canvas.parentElement.appendChild(this.elementManager.textInput);
      this.elementManager.textInput.focus();
  
      this.elementManager.textInput.addEventListener('blur', () => {
        this.finalizeTextInput();
      });
  
      this.elementManager.textInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          this.finalizeTextInput();
        }
      });
    }
  
    finalizeTextInput() {
      if (this.elementManager.textInput && this.elementManager.textInput.value.trim()) {
        const pos = {
          x: parseInt(this.elementManager.textInput.style.left),
          y: parseInt(this.elementManager.textInput.style.top)
        };
        
        this.elementManager.elements.push({
          type: 'text',
          x: pos.x,
          y: pos.y + 16,
          text: this.elementManager.textInput.value.trim(),
          font: '16px Arial'
        });
        
        this.elementManager.diagram.historyManager.saveState();
        this.elementManager.diagram.redraw();
      }
  
      if (this.elementManager.textInput) {
        this.elementManager.textInput.remove();
        this.elementManager.textInput = null;
      }
    }
  }