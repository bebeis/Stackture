// src/js/components/DiagramDrawer/elements/RoundedRectangleElement.js
// 리팩토링하면서 새로운 요소 추가 시 얼마나 깔끔하게 코드가 작성되는지 체크하는 겸 추가함
import { Element } from './Element.js';
import { elementFactory } from './ElementFactory.js';

export class RoundedRectangleElement extends Element {
  static type = 'roundedRect';
  static icon = '🔲';
  static title = 'Rounded Rectangle';

  constructor(x, y, width, height) {
    super('roundedRect', x, y, width, height);
    this.borderRadius = 10;
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
    return (
      x >= this.x &&
      x <= this.x + this.width &&
      y >= this.y &&
      y <= this.y + this.height
    );
  }

  static register() {
    elementFactory.registerElement('shapes', 'roundedRect', RoundedRectangleElement);
  }
}

RoundedRectangleElement.register();