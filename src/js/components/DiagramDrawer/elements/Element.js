// src/js/components/DiagramDrawer/elements/Element.js

export class Element {
  constructor(type, x, y, width, height) {
    this.type = type;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.isSelected = false;
  }

  draw(ctx) {
    throw new Error('Draw method must be implemented');
  }

  containsPoint(x, y) {
    throw new Error('ContainsPoint method must be implemented');
  }

  serialize() {
    return {
      type: this.type,
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height,
      isSelected: this.isSelected,
    };
  }

  static createFromData(data) {
    // 기본적으로는 직접 생성할 수 없으므로 에러를 던집니다.
    throw new Error('createFromData method must be implemented in subclass');
  }
}
