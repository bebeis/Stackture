export class SaveLoadManager {
  constructor(diagram) {
    this.diagram = diagram;
  }

  async saveAsImage() {
    const boundingBox = this.calculateBoundingBox();
    const padding = 20;

    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');

    tempCanvas.width = boundingBox.width + (padding * 2);
    tempCanvas.height = boundingBox.height + (padding * 2);

    // 배경을 흰색으로 설정
    tempCtx.fillStyle = '#ffffff';
    tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

    // 원본 캔버스의 내용을 임시 캔버스에 그리기
    tempCtx.save();
    tempCtx.translate(-boundingBox.x + padding, -boundingBox.y + padding);

    // 모든 요소 그리기
    this.diagram.elementManager.elements.forEach(element => {
      element.draw(tempCtx);
    });

    tempCtx.restore();

    // PNG로 저장
    const link = document.createElement('a');
    link.download = 'diagram.png';
    link.href = tempCanvas.toDataURL('image/png');
    link.click();
  }

  saveAsXML() {
    const xmlDoc = document.implementation.createDocument(null, 'diagram');
    const root = xmlDoc.documentElement;

    // 요소들 저장
    this.diagram.elementManager.elements.forEach(element => {
      const elementNode = xmlDoc.createElement('element');
      const serialized = element.serialize();
      
      Object.entries(serialized).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          elementNode.setAttribute(key, value.toString());
        }
      });
      
      root.appendChild(elementNode);
    });

    const serializer = new XMLSerializer();
    const xmlString = serializer.serializeToString(xmlDoc);
    
    const blob = new Blob([xmlString], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'diagram.xml';
    link.click();
    URL.revokeObjectURL(url);
  }

  loadFromXML(file) {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(e.target.result, 'application/xml');
      
      // 기존 요소들 제거
      this.diagram.elementManager.elements = [];
      
      // XML에서 요소들 복원
      xmlDoc.querySelectorAll('element').forEach(elementNode => {
        const data = {};
        elementNode.getAttributeNames().forEach(attr => {
          data[attr] = elementNode.getAttribute(attr);
        });
        
        // 숫자형 데이터 변환
        ['x', 'y', 'width', 'height'].forEach(prop => {
          if (data[prop]) data[prop] = parseFloat(data[prop]);
        });
        
        const element = this.diagram.elementManager.elementFactory.createElementFromData(data);
        this.diagram.elementManager.elements.push(element);
      });
      
      this.diagram.redraw();
      this.diagram.historyManager.saveState();
    };
    
    reader.readAsText(file);
  }

  calculateBoundingBox() {
    const elements = this.diagram.elementManager.elements;
    if (elements.length === 0) {
      return { x: 0, y: 0, width: 100, height: 100 };
    }

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    elements.forEach(element => {
      minX = Math.min(minX, element.x);
      minY = Math.min(minY, element.y);
      maxX = Math.max(maxX, element.x + element.width);
      maxY = Math.max(maxY, element.y + element.height);
    });

    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY
    };
  }
} 