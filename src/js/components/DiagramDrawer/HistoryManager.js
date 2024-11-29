// src/js/components/DiagramDrawer/HistoryManager.js
import { IconElement } from './elements/IconElement.js';
export class HistoryManager {
    constructor(diagram) {
      this.diagram = diagram;
      this.history = [];
      this.redoStack = [];
      this.maxHistorySize = 50;
    }
  
    saveState() {
      const currentState = {
        elements: this.diagram.elementManager.elements.map(el => {
          const data = {
            type: el.type,
            x: el.x,
            y: el.y,
            width: el.width,
            height: el.height,
            isSelected: el.isSelected,
          };
          
          if (el.type === 'icon') {
            data.icon = el.icon;
            data.tech = el.tech;
          } else if (el.type === 'arrow') {
            data.arrowType = el.arrowType;
          }
          
          return data;
        }),
        selectedElements: this.diagram.elementManager.selectedElements.map(el => 
          this.diagram.elementManager.elements.indexOf(el)
        )
      };
      
      this.history.push(currentState);
      if (this.history.length > this.maxHistorySize) this.history.shift();
      this.redoStack = [];
    }
  
    restoreElements(elementDataArray) {
      return elementDataArray.map(data => {
        let element;
        
        if (data.type === 'icon') {
          element = new IconElement(
            data.x,
            data.y,
            data.width,
            data.height,
            data.icon,
            data.tech
          );
        } else {
          element = this.diagram.elementManager.elementFactory.createElement(
            data.type,
            data.x,
            data.y,
            data.width,
            data.height,
            data.arrowType
          );
        }
        
        element.isSelected = data.isSelected;
        return element;
      });
    }
  
    undo() {
      if (this.history.length > 0) {
        const currentState = {
          elements: this.diagram.elementManager.elements.map(el => ({
            type: el.type,
            x: el.x,
            y: el.y,
            width: el.width,
            height: el.height,
            isSelected: el.isSelected
          })),
          selectedElements: this.diagram.elementManager.selectedElements.map(el => 
            this.diagram.elementManager.elements.indexOf(el)
          )
        };
        this.redoStack.push(currentState);
        
        const previousState = this.history.pop();
        this.diagram.elementManager.elements = this.restoreElements(previousState.elements);
        
        this.diagram.elementManager.selectedElements = previousState.selectedElements.map(
          index => this.diagram.elementManager.elements[index]
        ).filter(el => el !== undefined);
        
        this.diagram.redraw();
        
        console.log('Undo performed. History size:', this.history.length);
      } else {
        console.warn('No more history to undo.');
      }
    }
  
    redo() {
      if (this.redoStack.length > 0) {
        const currentState = {
          elements: this.diagram.elementManager.elements.map(el => ({
            type: el.type,
            x: el.x,
            y: el.y,
            width: el.width,
            height: el.height,
            isSelected: el.isSelected
          })),
          selectedElements: this.diagram.elementManager.selectedElements.map(el => 
            this.diagram.elementManager.elements.indexOf(el)
          )
        };
        this.history.push(currentState);
        
        const nextState = this.redoStack.pop();
        this.diagram.elementManager.elements = this.restoreElements(nextState.elements);
        
        this.diagram.elementManager.selectedElements = nextState.selectedElements.map(
          index => this.diagram.elementManager.elements[index]
        ).filter(el => el !== undefined);
        
        this.diagram.redraw();
        
        console.log('Redo performed. Redo stack size:', this.redoStack.length);
      } else {
        console.warn('No more history to redo.');
      }
    }
  
    shouldSaveState(action) {
      const actionsToSave = ['create', 'move', 'resize', 'delete', 'text'];
      return actionsToSave.includes(action);
    }
  
    getHistorySize() {
      return {
        undo: this.history.length,
        redo: this.redoStack.length
      };
    }
}
