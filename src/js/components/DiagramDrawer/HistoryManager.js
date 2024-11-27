// src/js/components/DiagramDrawer/HistoryManager.js
export class HistoryManager {
    constructor(diagram) {
      this.diagram = diagram;
      this.history = [];
      this.redoStack = [];
      this.maxHistorySize = 50;
    }
  
    saveState() {
      // 현재 요소들의 상태을 깊은 복사하여 저장
      const currentState = JSON.stringify(this.diagram.elementManager.elements);
      this.history.push(currentState);
      
      // 최대 히스토리 크기 유지
      if (this.history.length > this.maxHistorySize) {
        this.history.shift();
      }
      
      // 실행 취소 후 새로운 작업을 하면 다시 실행 스택 초기화
      this.redoStack = [];
      
      console.log('State saved. History size:', this.history.length);
    }
  
    undo() {
      if (this.history.length > 0) {
        // 현재 상태를 다시 실행 스택에 저장
        const currentState = JSON.stringify(this.diagram.elementManager.elements);
        this.redoStack.push(currentState);
        
        // 이전 상태 복원
        const previousState = this.history.pop();
        this.diagram.elementManager.elements = JSON.parse(previousState);
        this.diagram.redraw();
        
        console.log('Undo performed. History size:', this.history.length);
      } else {
        console.warn('No more history to undo.');
      }
    }
  
    redo() {
      if (this.redoStack.length > 0) {
        // 현재 상태를 히스토리에 저장
        const currentState = JSON.stringify(this.diagram.elementManager.elements);
        this.history.push(currentState);
        
        // 다음 상태 복원
        const nextState = this.redoStack.pop();
        this.diagram.elementManager.elements = JSON.parse(nextState);
        this.diagram.redraw();
        
        console.log('Redo performed. Redo stack size:', this.redoStack.length);
      } else {
        console.warn('No more history to redo.');
      }
    }
  
    // 상태 저장이 필요한지 확인
    shouldSaveState(action) {
      const actionsToSave = ['create', 'move', 'resize', 'delete', 'text'];
      return actionsToSave.includes(action);
    }
  
    // 히스토리 크기 확인
    getHistorySize() {
      return {
        undo: this.history.length,
        redo: this.redoStack.length
      };
    }
}
