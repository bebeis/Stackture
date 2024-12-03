// src/js/components/DiagramDrawer/elements/TextElement.js

import { Element } from './Element.js';
import { elementFactory } from './ElementFactory.js';

export class TextElement extends Element {
  static type = 'text';
  static icon = '📝';
  static title = 'Text';

  constructor(x, y, text, font = '16px Arial', color = '#000000') {
    super('text', x, y, 0, 0);
    this.text = text || '';
    this.font = font;
    this.color = color;
    this.isEditing = false;
  }

  draw(ctx) {
    ctx.save();
    ctx.font = this.font;
    ctx.fillStyle = this.color;
    ctx.textBaseline = 'top';

    const lines = this.text.split('\n');
    const lineHeight = parseInt(this.font, 10) * 1.2;
    let yOffset = 0;

    lines.forEach((line, index) => {
      ctx.fillText(line, this.x, this.y + yOffset);
      // 편집 모드일 때 커서 그리기
      if (this.isEditing) {
        const currentLineLength = lines.slice(0, index).reduce((acc, line) => acc + line.length + 1, 0);
        if (this.cursorPosition >= currentLineLength && this.cursorPosition <= currentLineLength + line.length) {
          const textBeforeCursor = line.substring(0, this.cursorPosition - currentLineLength);
          const cursorX = this.x + ctx.measureText(textBeforeCursor).width;
          const cursorY = this.y + yOffset;
          if (Math.floor(Date.now() / 500) % 2 === 0) {
            ctx.beginPath();
            ctx.moveTo(cursorX, cursorY);
            ctx.lineTo(cursorX, cursorY + lineHeight);
            ctx.strokeStyle = this.color;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }
      yOffset += lineHeight;
    });

    if (this.isSelected || this.isEditing) {
      // 텍스트의 너비와 높이 계산
      const metrics = lines.map((line) => ctx.measureText(line).width);
      const textWidth = Math.max(...metrics);
      const textHeight = lines.length * lineHeight;

      ctx.strokeStyle = '#2196f3';
      ctx.lineWidth = 1;
      ctx.strokeRect(this.x - 2, this.y - 2, textWidth + 4, textHeight + 4);
    }

    ctx.restore();
  }

  containsPoint(x, y) {
    const ctx = this._getContext();
    ctx.font = this.font;
    const lines = this.text.split('\n');
    const lineHeight = parseInt(this.font, 10) * 1.2;
    const metrics = lines.map((line) => ctx.measureText(line).width);
    const textWidth = Math.max(...metrics);
    const textHeight = lines.length * lineHeight;

    return (
      x >= this.x - 2 &&
      x <= this.x + textWidth + 2 &&
      y >= this.y - 2 &&
      y <= this.y + textHeight + 2
    );
  }

  _getContext() {
    const canvas = document.createElement('canvas');
    return canvas.getContext('2d');
  }

  serialize() {
    const baseData = super.serialize();
    return {
      ...baseData,
      text: this.text,
      font: this.font,
      color: this.color,
    };
  }

  static createFromData(data) {
    const element = new TextElement(data.x, data.y, data.text, data.font, data.color);
    element.isSelected = data.isSelected;
    return element;
  }

  static register() {
    elementFactory.registerElement('text', 'text', TextElement);
  }
}

TextElement.register();
