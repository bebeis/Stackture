// src/js/components/DiagramDrawer/ElementCreator.js
export class ElementCreator {
  constructor(elementManager) {
    this.elementManager = elementManager;
    this.isFinalizingText = false;
  }

  createNewElement(start, end) {
    const type = this.elementManager.diagram.currentTool;
    const factory = this.elementManager.elementFactory;
    let element;

    // 위치 및 크기 계산
    let x = start.x;
    let y = start.y;
    let width = end.x - start.x;
    let height = end.y - start.y;

    // 최소 크기 보정
    const minSize = 10;
    if (type !== 'arrow') {
      x = Math.min(start.x, end.x);
      y = Math.min(start.y, end.y);
      width = Math.abs(width);
      height = Math.abs(height);
      width = Math.max(minSize, width);
      height = Math.max(minSize, height);
    }

    // 팩토리를 사용하여 요소 생성
    if (type === 'text') {
      this.startTextInput({ x, y });
      return;
    } else if (type === 'arrow') {
      const arrowType = this.elementManager.diagram.currentArrowType;
      element = factory.createElement(type, x, y, width, height, arrowType);
    } else {
      element = factory.createElement(type, x, y, width, height);
    }

    // 새로 생성된 요소를 배열에 추가하고 선택 상태로 설정
    this.elementManager.elements.push(element);
    element.isSelected = true;

    // 기존 선택 해제 및 새 요소 선택
    this.elementManager.selectedElements.forEach((el) => (el.isSelected = false));
    this.elementManager.selectedElements = [element];

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
    this.elementManager.textInput.style.position = 'absolute';
    this.elementManager.textInput.style.minWidth = '100px';
    this.elementManager.textInput.style.minHeight = '24px';
    this.elementManager.textInput.style.padding = '4px';
    this.elementManager.textInput.style.border = '1px solid #2196f3';
    this.elementManager.textInput.style.outline = 'none';
    this.elementManager.textInput.style.resize = 'both';
    this.elementManager.textInput.style.overflow = 'hidden';
    this.elementManager.textInput.style.backgroundColor = 'white';
    this.elementManager.textInput.style.zIndex = '1000';

    this.elementManager.diagram.canvas.parentElement.appendChild(this.elementManager.textInput);

    setTimeout(() => {
      this.elementManager.textInput.focus();
    }, 0);

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
    if (this.isFinalizingText) return;
    this.isFinalizingText = true;

    try {
      if (this.elementManager.textInput && this.elementManager.textInput.value.trim()) {
        const pos = {
          x: parseInt(this.elementManager.textInput.style.left),
          y: parseInt(this.elementManager.textInput.style.top)
        };

        const text = this.elementManager.textInput.value.trim();
        const element = this.elementManager.elementFactory.createElement('text', pos.x, pos.y, text);

        this.elementManager.elements.push(element);
        this.elementManager.selectedElement = element;
        this.elementManager.diagram.historyManager.saveState();
      }

      if (this.elementManager.textInput && this.elementManager.textInput.parentNode) {
        this.elementManager.textInput.remove();
      }
      this.elementManager.textInput = null;

      this.elementManager.diagram.setTool('select');
      this.elementManager.diagram.redraw();
    } finally {
      this.isFinalizingText = false;
    }
  }
}
