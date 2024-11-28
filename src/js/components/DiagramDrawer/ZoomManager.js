// src/js/components/DiagramDrawer/ZoomManager.js
export class ZoomManager {
    constructor(diagram) {
      this.diagram = diagram;
      this.scale = 1;
      this.minScale = 0.1;
      this.maxScale = 5;
      this.translateX = 0;
      this.translateY = 0;
      this.isDragging = false;
      this.lastX = 0;
      this.lastY = 0;
      this.padding = 1000; // 캔버스 확장을 위한 여백
  
      this.init();
      this.setupEventListeners();
    }
  
    init() {
      this.updateCanvasSize();
      this.applyTransform();
    }
  
    updateCanvasSize() {
      const minWidth = window.innerWidth + 2 * this.padding;
      const minHeight = window.innerHeight + 2 * this.padding;
      
      this.diagram.canvas.width = Math.max(minWidth, this.diagram.canvas.width);
      this.diagram.canvas.height = Math.max(minHeight, this.diagram.canvas.height);
    }
  
    setupEventListeners() {
      // 마우스 휠 줌
      this.diagram.canvas.addEventListener('wheel', (e) => {
        e.preventDefault();
        if (e.ctrlKey || e.metaKey) {
          const delta = e.deltaY < 0 ? 1.1 : 0.9;
          const rect = this.diagram.canvas.getBoundingClientRect();
          const mouseX = e.clientX - rect.left;
          const mouseY = e.clientY - rect.top;
          this.zoom(delta, mouseX, mouseY);
        }
      });
  
      // 스페이스바 + 드래그로 캔버스 이동
      this.diagram.canvas.addEventListener('mousedown', (e) => {
        if (e.button === 1 || e.getModifierState('Space')) { // 마우스 중간 버튼 또는 스페이스바
          e.preventDefault();
          this.isDragging = true;
          this.lastX = e.clientX;
          this.lastY = e.clientY;
          this.diagram.canvas.style.cursor = 'grabbing';
        }
      });
  
      this.diagram.canvas.addEventListener('mousemove', (e) => {
        if (this.isDragging) {
          const dx = (e.clientX - this.lastX) / this.scale;
          const dy = (e.clientY - this.lastY) / this.scale;
          this.translateX += dx;
          this.translateY += dy;
          this.lastX = e.clientX;
          this.lastY = e.clientY;
  
          this.checkAndExpandCanvas();
          this.applyTransform();
        }
      });
  
      document.addEventListener('mouseup', () => {
        if (this.isDragging) {
          this.isDragging = false;
          this.diagram.canvas.style.cursor = 'default';
        }
      });
  
      // 키보드 단축키
      document.addEventListener('keydown', (e) => {
        if (e.code === 'Space') {
          this.diagram.canvas.style.cursor = 'grab';
        }
  
        if ((e.ctrlKey || e.metaKey) && (e.key === '=' || e.key === '+')) {
          e.preventDefault();
          this.zoom(1.1, this.diagram.canvas.width / 2, this.diagram.canvas.height / 2);
        }
        if ((e.ctrlKey || e.metaKey) && e.key === '-') {
          e.preventDefault();
          this.zoom(0.9, this.diagram.canvas.width / 2, this.diagram.canvas.height / 2);
        }
      });
  
      document.addEventListener('keyup', (e) => {
        if (e.code === 'Space') {
          this.diagram.canvas.style.cursor = 'default';
        }
      });
    }
  
    zoom(delta, mouseX, mouseY) {
      const newScale = Math.min(Math.max(this.scale * delta, this.minScale), this.maxScale);
      
      // 마우스 포인터 위치 기준으로 줌
      if (newScale !== this.scale) {
        const scaleRatio = newScale / this.scale;
        const canvasX = (mouseX - this.translateX) / this.scale;
        const canvasY = (mouseY - this.translateY) / this.scale;
        
        this.translateX -= (canvasX * (scaleRatio - 1)) * this.scale;
        this.translateY -= (canvasY * (scaleRatio - 1)) * this.scale;
        this.scale = newScale;
        
        this.applyTransform();
      }
    }
  
    checkAndExpandCanvas() {
      const margin = 200; // 확장 트리거를 위한 여백
      let needsUpdate = false;
  
      if (-this.translateX + margin > this.diagram.canvas.width) {
        this.diagram.canvas.width += this.padding;
        needsUpdate = true;
      }
      if (-this.translateY + margin > this.diagram.canvas.height) {
        this.diagram.canvas.height += this.padding;
        needsUpdate = true;
      }
  
      if (needsUpdate) {
        this.diagram.redraw();
      }
    }
  
    applyTransform() {
      this.diagram.ctx.setTransform(
        this.scale, 0,
        0, this.scale,
        this.translateX,
        this.translateY
      );
      this.diagram.redraw();
    }
  
    // 실제 캔버스 좌표를 변환된 좌표로 변환
    transformPoint(x, y) {
      return {
        x: (x - this.translateX) / this.scale,
        y: (y - this.translateY) / this.scale
      };
    }
}