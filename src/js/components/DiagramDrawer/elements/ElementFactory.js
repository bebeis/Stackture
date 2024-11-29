// src/js/components/DiagramDrawer/elements/ElementFactory.js

export class ElementFactory {
  constructor() {
    this.elementClasses = {};
    this.categories = {
      shapes: {},
      text: {},
      icons: {},
      connectors: {},
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
    const ElementClass = this.elementClasses[type];
    if (!ElementClass) {
      throw new Error(`Unknown element type: ${type}`);
    }
    return new ElementClass(...args);
  }

  createElementFromData(data) {
    const ElementClass = this.elementClasses[data.type];
    if (!ElementClass) {
      throw new Error(`Unknown element type: ${data.type}`);
    }
    return ElementClass.createFromData(data);
  }

  getElementsByCategory(category) {
    return this.categories[category] || {};
  }
}

export const elementFactory = new ElementFactory();
