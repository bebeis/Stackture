// src/js/components/DiagramDrawer/elements/ArrowElement.js

import { Element } from './Element.js';
import { elementFactory } from './ElementFactory.js';

export class ArrowElement extends Element {
  static type = 'arrow';
  static icon = '➡️';
  static title = 'Arrow';

  constructor(x, y, width, height, arrowType = 'one-way') {
    super(ArrowElement.type, x, y, width, height);
    this.arrowType = arrowType; // 'one-way', 'two-way', 'line'
  }

  draw(ctx) {
    ctx.save();

    const startX = this.x;
    const startY = this.y;
    const endX = this.x + this.width;
    const endY = this.y + this.height;

    ctx.strokeStyle = this.isSelected ? '#2196f3' : '#000000';
    ctx.lineWidth = this.isSelected ? 2 : 1;

    // 선 그리기
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.stroke();

    // 화살표 머리 그리기
    const drawArrowHead = (fromX, fromY, toX, toY) => {
      const angle = Math.atan2(toY - fromY, toX - fromX);
      const arrowHeadLength = 10;

      ctx.beginPath();
      ctx.moveTo(toX, toY);
      ctx.lineTo(
        toX - arrowHeadLength * Math.cos(angle - Math.PI / 6),
        toY - arrowHeadLength * Math.sin(angle - Math.PI / 6)
      );
      ctx.lineTo(
        toX - arrowHeadLength * Math.cos(angle + Math.PI / 6),
        toY - arrowHeadLength * Math.sin(angle + Math.PI / 6)
      );
      ctx.closePath();
      ctx.fillStyle = this.isSelected ? '#2196f3' : '#000000';
      ctx.fill();
    };

    if (this.arrowType === 'one-way' || this.arrowType === 'two-way') {
      drawArrowHead(startX, startY, endX, endY);
    }

    if (this.arrowType === 'two-way') {
      drawArrowHead(endX, endY, startX, startY);
    }

    ctx.restore();
  }

  containsPoint(x, y) {
    const distance = this._distanceToLineSegment(
      x,
      y,
      this.x,
      this.y,
      this.x + this.width,
      this.y + this.height
    );
    return distance <= 5;
  }

  _distanceToLineSegment(px, py, x1, y1, x2, y2) {
    const lineLengthSquared =
      (x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1);
    if (lineLengthSquared === 0) return Math.hypot(px - x1, py - y1);

    let t =
      ((px - x1) * (x2 - x1) + (py - y1) * (y2 - y1)) / lineLengthSquared;
    t = Math.max(0, Math.min(1, t));

    const projectionX = x1 + t * (x2 - x1);
    const projectionY = y1 + t * (y2 - y1);

    return Math.hypot(px - projectionX, py - projectionY);
  }

  serialize() {
    const data = super.serialize();
    data.arrowType = this.arrowType;
    return data;
  }

  static createFromData(data) {
    const element = new ArrowElement(
      data.x,
      data.y,
      data.width,
      data.height,
      data.arrowType
    );
    element.isSelected = data.isSelected;
    return element;
  }

  static register() {
    elementFactory.registerElement('connectors', ArrowElement.type, ArrowElement);
  }
}

ArrowElement.register();
