// src/js/components/DiagramDrawer/elements/CircleElement.js

import { Element } from './Element.js';
import { elementFactory } from './ElementFactory.js';

export class CircleElement extends Element {
  static type = 'circle';
  static icon = '⭕';
  static title = 'Circle';

  constructor(x, y, width, height) {
    super(CircleElement.type, x, y, width, height);
  }

  draw(ctx) {
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(
      this.x + this.width / 2,
      this.y + this.height / 2,
      this.width / 2,
      this.height / 2,
      0,
      0,
      Math.PI * 2
    );
    ctx.fillStyle = this.isSelected ? 'rgba(33, 150, 243, 0.1)' : 'transparent';
    ctx.fill();
    ctx.strokeStyle = this.isSelected ? '#2196f3' : '#000000';
    ctx.lineWidth = this.isSelected ? 2 : 1;
    ctx.stroke();
    ctx.restore();
  }

  containsPoint(x, y) {
    const centerX = this.x + this.width / 2;
    const centerY = this.y + this.height / 2;
    const radiusX = this.width / 2;
    const radiusY = this.height / 2;

    const normalizedX = (x - centerX) / radiusX;
    const normalizedY = (y - centerY) / radiusY;

    return normalizedX * normalizedX + normalizedY * normalizedY <= 1;
  }

  static register() {
    elementFactory.registerElement('shapes', CircleElement.type, CircleElement);
  }
}

CircleElement.register();
