// src/js/components/DiagramDrawer/elements/ArrowElement.js

import { Element } from './Element.js';
import { elementFactory } from './ElementFactory.js';

export class ArrowElement extends Element {
  static type = 'arrow';
  static icon = '➡️';
  static title = 'Arrow';

  constructor(x, y, width, height) {
    super(ArrowElement.type, x, y, width, height);
  }

  draw(ctx) {
    ctx.save();

    const startX = this.x;
    const startY = this.y;
    const endX = this.x + this.width;
    const endY = this.y + this.height;

    // 화살표 선 그리기
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.strokeStyle = this.isSelected ? '#2196f3' : '#000000';
    ctx.lineWidth = this.isSelected ? 2 : 1;
    ctx.stroke();

    // 화살표 머리 그리기
    const angle = Math.atan2(endY - startY, endX - startX);
    const arrowHeadLength = 10;

    ctx.beginPath();
    ctx.moveTo(endX, endY);
    ctx.lineTo(
      endX - arrowHeadLength * Math.cos(angle - Math.PI / 6),
      endY - arrowHeadLength * Math.sin(angle - Math.PI / 6)
    );
    ctx.lineTo(
      endX - arrowHeadLength * Math.cos(angle + Math.PI / 6),
      endY - arrowHeadLength * Math.sin(angle + Math.PI / 6)
    );
    ctx.lineTo(endX, endY);
    ctx.fillStyle = this.isSelected ? '#2196f3' : '#000000';
    ctx.fill();

    ctx.restore();
  }

  containsPoint(x, y) {
    // 점이 선분에 가까운지 계산
    const distance = this._distanceToLineSegment(
      x,
      y,
      this.x,
      this.y,
      this.x + this.width,
      this.y + this.height
    );

    return distance <= 5; // 허용 오차 내에 있으면 선택된 것으로 간주
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

  static register() {
    elementFactory.registerElement('connectors', 'arrow', ArrowElement);
  }
}

// 클래스가 로드될 때 자동으로 등록
ArrowElement.register();
