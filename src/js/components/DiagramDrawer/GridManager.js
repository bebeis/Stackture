// src/js/components/DiagramDrawer/GridManager.js
export class GridManager {
    constructor(diagram) {
      this.diagram = diagram;
      this.gridSize = 20;
      this.showGrid = true;
      this.gridColor = '#e0e0e0';
      this.gridLineWidth = 0.5;
    }
  
    init() {
      if (this.showGrid) {
        this.drawGrid();
      }
    }
  
    drawGrid() {
      const ctx = this.diagram.ctx;
      const width = this.diagram.canvas.width;
      const height = this.diagram.canvas.height;
  
      ctx.save();
      ctx.strokeStyle = this.gridColor;
      ctx.lineWidth = this.gridLineWidth;
      
      // 세로 선 그리기
      for (let x = 0; x < width; x += this.gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      
      // 가로 선 그리기
      for (let y = 0; y < height; y += this.gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
      
      ctx.restore();
    }
  
    toggleGrid() {
      this.showGrid = !this.showGrid;
      this.diagram.redraw();
    }
  
    snapToGrid(pos) {
      if (!this.showGrid) return pos;
      
      return {
        x: Math.round(pos.x / this.gridSize) * this.gridSize,
        y: Math.round(pos.y / this.gridSize) * this.gridSize
      };
    }
  
    setGridSize(size) {
      this.gridSize = size;
      if (this.showGrid) {
        this.diagram.redraw();
      }
    }
  
    setGridColor(color) {
      this.gridColor = color;
      if (this.showGrid) {
        this.diagram.redraw();
      }
    }
  
    // 그리드 설정 저장/복원
    getGridSettings() {
      return {
        size: this.gridSize,
        color: this.gridColor,
        visible: this.showGrid,
        lineWidth: this.gridLineWidth
      };
    }
  
    setGridSettings(settings) {
      if (settings.size) this.gridSize = settings.size;
      if (settings.color) this.gridColor = settings.color;
      if (settings.visible !== undefined) this.showGrid = settings.visible;
      if (settings.lineWidth) this.gridLineWidth = settings.lineWidth;
      this.diagram.redraw();
    }
  }