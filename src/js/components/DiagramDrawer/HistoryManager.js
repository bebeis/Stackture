export class HistoryManager {
  constructor(diagram) {
    this.diagram = diagram;
    this.history = [];
    this.redoStack = [];
    this.maxHistorySize = 50;
  }

  saveState() {
    const currentState = {
      elements: this.diagram.elementManager.elements.map(el => el.serialize()),
      selectedElements: this.diagram.elementManager.selectedElements.map(el =>
        this.diagram.elementManager.elements.indexOf(el)
      ),
    };

    this.history.push(currentState);
    if (this.history.length > this.maxHistorySize) this.history.shift();
    this.redoStack = [];
  }

  restoreElements(elementDataArray) {
    return elementDataArray.map(data => {
      const element = this.diagram.elementManager.elementFactory.createElementFromData(data);
      element.isSelected = data.isSelected;
      return element;
    });
  }

  undo() {
    if (this.history.length > 1) { // 초기 상태를 유지하기 위해 1보다 클 때만 undo
      const currentState = this.history.pop();
      this.redoStack.push(currentState);

      const previousState = this.history[this.history.length - 1];
      this.diagram.elementManager.elements = this.restoreElements(previousState.elements);

      this.diagram.elementManager.selectedElements = previousState.selectedElements.map(
        index => this.diagram.elementManager.elements[index]
      ).filter(el => el !== undefined);

      this.diagram.redraw();
    } else {
      console.warn('No more history to undo.');
    }
  }

  redo() {
    if (this.redoStack.length > 0) {
      const nextState = this.redoStack.pop();
      this.history.push(nextState);

      this.diagram.elementManager.elements = this.restoreElements(nextState.elements);

      this.diagram.elementManager.selectedElements = nextState.selectedElements.map(
        index => this.diagram.elementManager.elements[index]
      ).filter(el => el !== undefined);

      this.diagram.redraw();
    } else {
      console.warn('No more history to redo.');
    }
  }

  getHistorySize() {
    return {
      undo: this.history.length - 1, // 초기 상태 제외
      redo: this.redoStack.length
    };
  }
}
