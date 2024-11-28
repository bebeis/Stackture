// src/js/components/DiagramDrawer/elements/RectangleElement.js

import { Element } from './Element.js';
import { elementFactory } from './ElementFactory.js';

export class RectangleElement extends Element {
  static type = 'rectangle';
  static icon = '⬜';
  static title = 'Rectangle';

  constructor(x, y, width, height) {
    super(RectangleElement.type, x, y, width, height);
  }

  draw(ctx) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(this.x, this.y, this.width, this.height);
    ctx.fillStyle = this.isSelected ? 'rgba(33, 150, 243, 0.1)' : 'transparent';
    ctx.fill();
    ctx.strokeStyle = this.isSelected ? '#2196f3' : '#000000';
    ctx.lineWidth = this.isSelected ? 2 : 1;
    ctx.stroke();
    ctx.restore();
  }

  containsPoint(x, y) {
    return (
      x >= this.x &&
      x <= this.x + this.width &&
      y >= this.y &&
      y <= this.y + this.height
    );
  }

  static register() {
    elementFactory.registerElement('shapes', 'rectangle', RectangleElement);
  }
}

RectangleElement.register();
