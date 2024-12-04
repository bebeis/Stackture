// src/js/components/DiagramDrawer/ElementCreator.js
export class ElementCreator {
  constructor(elementManager) {
    this.elementManager = elementManager;
    this.isTypingText = false;
    this.activeTextElement = null;
    this.textInput = null;
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
    // 기존 텍스트 입력이 진행 중이면 완료 처리
    if (this.isTypingText) {
      this.finalizeTextInput();
    }

    this.isTypingText = true;

    // 숨겨진 textarea 생성
    this.createHiddenTextInput(pos);

    // 새로운 TextElement 생성 및 활성화
    this.activeTextElement = this.elementManager.elementFactory.createElement('text', pos.x, pos.y, '');
    this.activeTextElement.isEditing = true;
    this.elementManager.elements.push(this.activeTextElement);
    this.elementManager.selectedElements = [this.activeTextElement];
    this.elementManager.diagram.redraw();
    this.activeTextElement.cursorPosition = this.textInput.value.length;

  }

  startEditingTextElement(textElement) {
    if (this.isTypingText) {
      this.finalizeTextInput();
    }

    this.isTypingText = true;
    this.activeTextElement = textElement;
    this.activeTextElement.isEditing = true;

    // 기존의 텍스트를 textarea에 설정
    this.createHiddenTextInput({ x: textElement.x, y: textElement.y }, textElement.text);

    this.elementManager.diagram.redraw();

    this.textInput.selectionStart = this.textInput.value.length;
    this.textInput.selectionEnd = this.textInput.value.length;
    this.activeTextElement.cursorPosition = this.textInput.selectionStart;
  }


  createHiddenTextInput(pos, existingText = '') {
    // 기존의 textarea 제거
    if (this.textInput && this.textInput.parentNode) {
      this.textInput.parentNode.removeChild(this.textInput);
    }

    this.textInput = document.createElement('textarea');
    this.textInput.style.position = 'absolute';
    this.textInput.style.left = `${pos.x}px`;
    this.textInput.style.top = `${pos.y}px`;
    this.textInput.style.opacity = '0.01';
    this.textInput.style.height = '1px';
    this.textInput.style.width = '1px';
    this.textInput.style.zIndex = '1000';
    this.textInput.style.overflow = 'hidden';
    this.textInput.style.resize = 'none';
    this.textInput.style.border = 'none';
    this.textInput.style.outline = 'none';
    this.textInput.style.padding = '0';
    this.textInput.style.margin = '0';
    this.textInput.value = existingText;
    document.body.appendChild(this.textInput);

    // this.textInput.focus();

    // 입력 이벤트 처리
    this.handleInput = this.handleInput.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);

    this.textInput.addEventListener('input', this.handleInput);
    this.textInput.addEventListener('keydown', this.handleKeyDown);
    this.textInput.addEventListener('select', (e) => {
      if (this.activeTextElement) {
        this.activeTextElement.cursorPosition = this.textInput.selectionStart;
        this.elementManager.diagram.redraw();
      }
    });

    this.textInput.addEventListener('keyup', (e) => {
      if (this.activeTextElement) {
        this.activeTextElement.cursorPosition = this.textInput.selectionStart;
        this.elementManager.diagram.redraw();
      }
    });

    // 포커스 설정
    setTimeout(() => {
      this.textInput.focus();
      this.textInput.setSelectionRange(
        existingText.length,
        existingText.length
      );
    }, 0);

    return this.textInput;
  }

  handleInput(e) {
    if (!this.isTypingText || !this.activeTextElement) return;


    this.activeTextElement.text = this.textInput.value;
    this.activeTextElement.cursorPosition = this.textInput.selectionStart; // 커서 위치 업데이트
    this.elementManager.diagram.redraw();
  }

  handleKeyDown(e) {
    if (!this.isTypingText || !this.activeTextElement) return;

    if (e.key === 'Enter' && e.shiftKey) {
      // Shift + Enter로 텍스트 입력 완료
      e.preventDefault();
      this.finalizeTextInput();
    } else if (e.key === 'Enter') {
      // Enter로 개행 처리
      e.preventDefault();
      const cursorPos = this.textInput.selectionStart;
      const text = this.textInput.value;
      
      // 한글 입력 중인지 확인
      if (e.isComposing) {
        return;
      }
      
      const newText = text.slice(0, cursorPos) + '\n' + text.slice(this.textInput.selectionEnd);
      this.textInput.value = newText;
      this.textInput.selectionStart = cursorPos + 1;
      this.textInput.selectionEnd = cursorPos + 1;
      this.handleInput();
    } else if (e.key === 'Escape') {
      // Escape 키로 현재까지의 텍스트로 완료
      e.preventDefault();
      if (this.textInput.value.trim()) {
        this.finalizeTextInput();
      } else {
        this.cancelTextInput();
      }
    }
  }

  finalizeTextInput() {
    if (!this.isTypingText || !this.activeTextElement) return;

    // 텍스트 입력 완료 처리
    this.activeTextElement.isEditing = false;
    this.activeTextElement.isSelected = true;
    this.elementManager.selectedElements = [this.activeTextElement];
    this.elementManager.diagram.historyManager.saveState();

    // 이벤트 리스너 제거 및 textarea 삭제
    this.cleanupTextInput();

    this.isTypingText = false;
    this.activeTextElement = null;

    // 도구를 select로 변경
    this.elementManager.diagram.setTool('select');
    this.elementManager.diagram.redraw();
  }

  cancelTextInput() {
    if (!this.isTypingText || !this.activeTextElement) return;

    // 텍스트 입력 취소 처리
    // 요소 목록에서 제거
    const index = this.elementManager.elements.indexOf(this.activeTextElement);
    if (index !== -1) {
      this.elementManager.elements.splice(index, 1);
    }

    // 이벤트 리스너 제거 및 textarea 삭제
    this.cleanupTextInput();

    this.activeTextElement = null;
    this.isTypingText = false;

    // 도구를 select로 변경
    this.elementManager.diagram.setTool('select');
    this.elementManager.diagram.redraw();
  }

  cleanupTextInput() {
    if (this.textInput) {
      this.textInput.removeEventListener('input', this.handleInput);
      this.textInput.removeEventListener('keydown', this.handleKeyDown);
      if (this.textInput.parentNode) {
        this.textInput.parentNode.removeChild(this.textInput);
      }
      this.textInput = null;
    }
  }
 
}