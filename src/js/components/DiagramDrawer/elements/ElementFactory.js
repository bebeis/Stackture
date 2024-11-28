// src/js/components/DiagramDrawer/elements/ElementFactory.js
export class ElementFactory {
    constructor() {
      this.elementClasses = {};
      this.categories = {
        shapes: {},    // 도형 관련 요소
        text: {},      // 텍스트 관련 요소
        icons: {},     // 아이콘 관련 요소
        connectors: {} // 연결선 관련 요소
      };
    }
  
    registerElement(category, type, elementClass) {
      if (!this.categories[category]) {
        throw new Error(`Invalid category: ${category}`);
      }
      this.categories[category][type] = elementClass;
      this.elementClasses[type] = elementClass;
    }
  
    createElement(type, ...args) {
      let ElementClass = this.elementClasses[type];
      
      if (!ElementClass) {
        // 카테고리에서 검색
        for (const category of Object.values(this.categories)) {
          if (category[type]) {
            ElementClass = category[type];
            break;
          }
        }
      }

      if (!ElementClass) {
        console.error(`Failed to find element class for type: ${type}`);
        throw new Error(`Element type "${type}" is not registered.`);
      }

      const element = new ElementClass(...args);
      
      if (!element.draw || typeof element.draw !== 'function') {
        console.error('Created element:', element);
        throw new Error(`Element of type "${type}" does not have a valid draw method`);
      }

      return element;
    }
  
    getElementsByCategory(category) {
      return this.categories[category] || {};
    }
  }
  
  export const elementFactory = new ElementFactory(); // 싱글톤 인스턴스 생성
  