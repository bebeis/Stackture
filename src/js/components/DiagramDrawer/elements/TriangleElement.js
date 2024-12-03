// src/js/components/DiagramDrawer/elements/TriangleElement.js

import { Element } from './Element.js';
import { elementFactory } from './ElementFactory.js';

export class TriangleElement extends Element {
  static type = 'triangle';
  static icon = '🔺';
  static title = 'Triangle';

  constructor(x, y, width, height) {
    super(TriangleElement.type, x, y, width, height);
  }

  draw(ctx) {
    ctx.save();
    ctx.beginPath();

    const x1 = this.x + this.width / 2;
    const y1 = this.y;
    const x2 = this.x;
    const y2 = this.y + this.height;
    const x3 = this.x + this.width;
    const y3 = this.y + this.height;

    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.lineTo(x3, y3);
    ctx.closePath();

    ctx.fillStyle = this.isSelected ? 'rgba(33, 150, 243, 0.1)' : 'transparent';
    ctx.fill();
    ctx.strokeStyle = this.isSelected ? '#2196f3' : '#000000';
    ctx.lineWidth = this.isSelected ? 2 : 1;
    ctx.stroke();

    ctx.restore();
  }

  containsPoint(x, y) {
    const x1 = this.x + this.width / 2;
    const y1 = this.y;
    const x2 = this.x;
    const y2 = this.y + this.height;
    const x3 = this.x + this.width;
    const y3 = this.y + this.height;

    return this._isPointInTriangle({ x, y }, { x: x1, y: y1 }, { x: x2, y: y2 }, { x: x3, y: y3 });
  }

  _isPointInTriangle(pt, v1, v2, v3) {
    const dX = pt.x - v3.x;
    const dY = pt.y - v3.y;
    const dX21 = v3.x - v2.x;
    const dY12 = v2.y - v3.y;
    const D = dY12 * (v1.x - v3.x) + dX21 * (v1.y - v3.y);
    const s = dY12 * dX + dX21 * dY;
    const t = (v3.y - v1.y) * dX + (v1.x - v3.x) * dY;

    if (D < 0) return s <= 0 && t <= 0 && s + t >= D;
    return s >= 0 && t >= 0 && s + t <= D;
  }

  serialize() {
    return super.serialize();
  }

  static createFromData(data) {
    const element = new TriangleElement(data.x, data.y, data.width, data.height);
    element.isSelected = data.isSelected;
    return element;
  }

  static register() {
    elementFactory.registerElement('shapes', TriangleElement.type, TriangleElement);
  }
}

TriangleElement.register();
