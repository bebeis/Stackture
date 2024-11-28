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
          const zoomSpeed = 0.05;
          const delta = e.deltaY < 0 ? (1 + zoomSpeed) : (1 - zoomSpeed);
          
          const centerX = this.diagram.canvas.width / 2;
          const centerY = this.diagram.canvas.height / 2;
          
          this.zoom(delta, centerX, centerY);
        }
      });
  
      // 마우스 드래그로 캔버스 이동 (마우스 중간 버튼 또는 스페이스바)
      this.diagram.canvas.addEventListener('mousedown', (e) => {
        if (e.button === 1 || e.getModifierState('Space')) {
          e.preventDefault();
          this.isDragging = true;
          this.lastX = e.clientX;
          this.lastY = e.clientY;
          this.diagram.canvas.style.cursor = 'grabbing';
        }
      });
  
      // 마우스 오른쪽 버튼으로도 캔버스 이동 가능
      this.diagram.canvas.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        this.isDragging = true;
        this.lastX = e.clientX;
        this.lastY = e.clientY;
        this.diagram.canvas.style.cursor = 'grabbing';
      });
  
      this.diagram.canvas.addEventListener('mousemove', (e) => {
        if (this.isDragging) {
          const dx = e.clientX - this.lastX;
          const dy = e.clientY - this.lastY;
          
          this.translateX += dx;
          this.translateY += dy;
          
          this.lastX = e.clientX;
          this.lastY = e.clientY;
  
          this.limitTranslation();
          this.applyTransform();
        }
      });
  
      document.addEventListener('mouseup', (e) => {
        if (this.isDragging) {
          this.isDragging = false;
          if (e.getModifierState('Space')) {
            this.diagram.canvas.style.cursor = 'grab';
          } else {
            this.diagram.canvas.style.cursor = 'default';
          }
        }
      });
  
      // 키보드 이벤트
      document.addEventListener('keydown', (e) => {
        if (e.code === 'Space' && !this.isDragging) {
          this.diagram.canvas.style.cursor = 'grab';
        }
      });
  
      document.addEventListener('keyup', (e) => {
        if (e.code === 'Space') {
          if (!this.isDragging) {
            this.diagram.canvas.style.cursor = 'default';
          }
        }
      });
    }
  
    zoom(delta, centerX, centerY) {
      const newScale = Math.min(Math.max(this.scale * delta, this.minScale), this.maxScale);
      
      if (newScale !== this.scale) {
        const scaleRatio = newScale / this.scale;
        
        // 그리드 영역의 중앙을 기준으로 확대/축소
        const canvasX = (centerX - this.translateX) / this.scale;
        const canvasY = (centerY - this.translateY) / this.scale;
        
        this.translateX -= (canvasX * (scaleRatio - 1)) * this.scale;
        this.translateY -= (canvasY * (scaleRatio - 1)) * this.scale;
        this.scale = newScale;
        
        this.limitTranslation();
        this.applyTransform();
      }
    }
  
    limitTranslation() {
      const viewportWidth = this.diagram.canvas.width;
      const viewportHeight = this.diagram.canvas.height;
      
      // 캔버스 이동 제한
      const maxTranslateX = viewportWidth * 0.5;  // 캔버스 너비의 50%까지만 이동 가능
      const maxTranslateY = viewportHeight * 0.5; // 캔버스 높이의 50%까지만 이동 가능
      
      this.translateX = Math.max(Math.min(this.translateX, maxTranslateX), -maxTranslateX);
      this.translateY = Math.max(Math.min(this.translateY, maxTranslateY), -maxTranslateY);
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