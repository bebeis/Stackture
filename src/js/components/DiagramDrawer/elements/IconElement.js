// src/js/components/DiagramDrawer/elements/IconElement.js

import { Element } from './Element.js';
import { elementFactory } from './ElementFactory.js';

export class IconElement extends Element {
  static type = 'icon';
  static icon = '🖼️';
  static title = 'Icon';

  constructor(x, y, width, height, icon, tech) {
    super('icon', x, y, width, height);
    this.icon = icon; // 이미지 객체 (Image 인스턴스)
    this.tech = tech; // 기술 스택 정보 (선택 사항)
  }

  draw(ctx) {
    ctx.save();
    ctx.drawImage(this.icon, this.x, this.y, this.width, this.height);
    if (this.isSelected) {
      ctx.strokeStyle = '#2196f3';
      ctx.lineWidth = 2;
      ctx.strokeRect(this.x, this.y, this.width, this.height);
    }
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

  serialize() {
    const baseData = super.serialize();
    return {
      ...baseData,
      iconSrc: this.icon.src,
      tech: this.tech,
    };
  }

  static createFromData(data) {
    const icon = new Image();
    icon.src = data.iconSrc;
    const element = new IconElement(data.x, data.y, data.width, data.height, icon, data.tech);
    element.isSelected = data.isSelected;
    return element;
  }

  static register() {
    elementFactory.registerElement('icons', 'icon', IconElement);
  }
}

IconElement.register();
