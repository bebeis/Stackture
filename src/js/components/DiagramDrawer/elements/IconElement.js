// src/js/components/DiagramDrawer/elements/IconElement.js

import { Element } from './Element.js';
import { elementFactory } from './ElementFactory.js';

export class IconElement extends Element {
  static type = 'icon';
  static icon = '🖼️';
  static title = 'Icon';

  constructor(x, y, width, height, icon, tech) {
    super('icon', x, y, width, height);
    this.icon = icon;
    this.tech = tech;
    this.isImageLoaded = icon.complete;
  }

  draw(ctx) {
    if (!this.isImageLoaded) {
      // 이미지가 로드되지 않은 경우 로딩 표시
      ctx.save();
      ctx.fillStyle = '#f0f0f0';
      ctx.fillRect(this.x, this.y, this.width, this.height);
      ctx.restore();
      return;
    }

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
