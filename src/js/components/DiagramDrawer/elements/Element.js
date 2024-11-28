// src/js/components/DiagramDrawer/elements/Element.js

export class Element {
    constructor(type, x, y, width, height) {
      this.type = type; // 요소의 타입 (예: 'rectangle', 'circle', 'arrow' 등)
      this.x = x;       // 요소의 x 좌표
      this.y = y;       // 요소의 y 좌표
      this.width = width;   // 요소의 너비
      this.height = height; // 요소의 높이
      this.isSelected = false; // 요소 선택 여부
    }
  
    draw(ctx) {
      // 기본 draw 메서드 - 하위 클래스에서 반드시 구현해야 함
      throw new Error('Draw method must be implemented');
    }
  
    containsPoint(x, y) {
      // 기본 containsPoint 메서드 - 하위 클래스에서 반드시 구현해야 함
      throw new Error('ContainsPoint method must be implemented');
    }
  
    static register() {
      // 기본 register 메서드 - 하위 클래스에서 구현해야 함
      throw new Error('Register method must be implemented');
    }
  }
  