// src/js/components/DiagramDrawer/elements/RoundedRectangleElement.js

import { Element } from './Element.js';
import { elementFactory } from './ElementFactory.js';

export class RoundedRectangleElement extends Element {
  static type = 'roundedRect';
  static icon = '◽';
  static title = 'Rounded Rectangle';

  constructor(x, y, width, height, borderRadius = 10) {
    super(RoundedRectangleElement.type, x, y, width, height);
    this.borderRadius = borderRadius;
  }

  draw(ctx) {
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(this.x, this.y, this.width, this.height, this.borderRadius);
    ctx.fillStyle = this.isSelected ? 'rgba(33, 150, 243, 0.1)' : 'transparent';
    ctx.fill();
    ctx.strokeStyle = this.isSelected ? '#2196f3' : '#000000';
    ctx.lineWidth = this.isSelected ? 2 : 1;
    ctx.stroke();
    ctx.restore();
  }

  containsPoint(x, y) {
    // 단순히 사각형 영역 내에 있는지 확인
    return (
      x >= this.x &&
      x <= this.x + this.width &&
      y >= this.y &&
      y <= this.y + this.height
    );
  }

  serialize() {
    const data = super.serialize();
    data.borderRadius = this.borderRadius;
    return data;
  }

  static createFromData(data) {
    const element = new RoundedRectangleElement(
      data.x,
      data.y,
      data.width,
      data.height,
      data.borderRadius
    );
    element.isSelected = data.isSelected;
    return element;
  }

  static register() {
    elementFactory.registerElement('shapes', RoundedRectangleElement.type, RoundedRectangleElement);
  }
}

RoundedRectangleElement.register();
