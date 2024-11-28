// src/js/components/DiagramDrawer/elements/TextElement.js
import { Element } from './Element.js';
import { elementFactory } from './ElementFactory.js';

export class TextElement extends Element {
    static type = 'text';
  static icon = '📝'; // 적절한 아이콘으로 변경
  static title = 'Text';
  constructor(x, y, text, font = '16px Arial', color = '#000000') {
    super('text', x, y, 0, 0);
    this.text = text;
    this.font = font;
    this.color = color;
  }

  draw(ctx) {
    ctx.save();
    ctx.font = this.font;
    ctx.fillStyle = this.color;
    ctx.textBaseline = 'top';
    ctx.fillText(this.text, this.x, this.y);

    if (this.isSelected) {
      const metrics = ctx.measureText(this.text);
      const textWidth = metrics.width;
      const textHeight = parseInt(this.font, 10);

      ctx.strokeStyle = '#2196f3';
      ctx.lineWidth = 1;
      ctx.strokeRect(this.x, this.y, textWidth, textHeight);
    }
    ctx.restore();
  }

  containsPoint(x, y) {
    const ctx = this._getContext();
    ctx.font = this.font;
    const metrics = ctx.measureText(this.text);
    const textWidth = metrics.width;
    const textHeight = parseInt(this.font, 10);

    return (
      x >= this.x &&
      x <= this.x + textWidth &&
      y >= this.y &&
      y <= this.y + textHeight
    );
  }

  _getContext() {
    // 임시 Canvas Context 생성
    const canvas = document.createElement('canvas');
    return canvas.getContext('2d');
  }

  static register() {   
    elementFactory.registerElement('text', 'text', TextElement);
  }
}

TextElement.register();
