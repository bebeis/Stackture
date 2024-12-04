export class HistoryManager {
  constructor(diagram) {
    this.diagram = diagram;
    this.history = [];
    this.redoStack = [];
    this.maxHistorySize = 50;
    this.imageCache = new Map();
  }

  saveState() {
    const currentState = {
      elements: this.diagram.elementManager.elements.map(el => {
        const serialized = el.serialize();
        if (el.type === 'icon' && el.icon) {
          const iconSrc = el.icon.src;
          if (!this.imageCache.has(iconSrc)) {
            this.imageCache.set(iconSrc, el.icon);
          }
        }
        return serialized;
      }),
      selectedElements: this.diagram.elementManager.selectedElements.map(el =>
        this.diagram.elementManager.elements.indexOf(el)
      ),
    };

    this.history.push(currentState);
    if (this.history.length > this.maxHistorySize) {
      const removedState = this.history.shift();
      this.cleanupImageCache(removedState);
    }
    this.redoStack = [];
  }

  restoreElements(elementDataArray) {
    const elements = [];
    const loadPromises = [];

    elementDataArray.forEach(data => {
      const element = this.diagram.elementManager.elementFactory.createElementFromData(data);
      
      if (element.type === 'icon' && data.iconSrc) {
        const cachedImage = this.imageCache.get(data.iconSrc);
        if (cachedImage) {
          element.icon = cachedImage;
          element.isImageLoaded = true;
        } else {
          const loadPromise = new Promise((resolve) => {
            const icon = new Image();
            icon.crossOrigin = 'anonymous';
            icon.onload = () => {
              element.icon = icon;
              element.isImageLoaded = true;
              this.imageCache.set(data.iconSrc, icon);
              this.diagram.redraw();
              resolve();
            };
            icon.src = data.iconSrc;
          });
          loadPromises.push(loadPromise);
        }
      }
      
      element.isSelected = data.isSelected;
      elements.push(element);
    });

    if (loadPromises.length > 0) {
      Promise.all(loadPromises).then(() => {
        this.diagram.redraw();
      });
    }

    return elements;
  }

  cleanupImageCache(state) {
    const activeUrls = new Set();
    this.history.forEach(historyState => {
      historyState.elements.forEach(el => {
        if (el.iconSrc) {
          activeUrls.add(el.iconSrc);
        }
      });
    });

    for (const [url, _] of this.imageCache) {
      if (!activeUrls.has(url)) {
        this.imageCache.delete(url);
      }
    }
  }

  undo() {
    if (this.history.length > 1) {
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
      undo: this.history.length - 1,
      redo: this.redoStack.length
    };
  }
}
