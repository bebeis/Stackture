export class LLMPanel {
  constructor(diagram) {
    this.diagram = diagram;
    this.panel = null;
    this.toggleButton = null;
    this.isVisible = true;
    this.init();
  }

  init() {
    // 패널 생성
    this.panel = document.createElement('div');
    this.panel.classList.add('llm-panel');
    
    // 토글 버튼은 패널 외부에 별도로 생성
    this.toggleButton = document.createElement('button');
    this.toggleButton.classList.add('llm-toggle-btn');
    this.toggleButton.innerHTML = '◀';
    this.toggleButton.addEventListener('click', () => this.togglePanel());
    
    const title = document.createElement('h3');
    title.textContent = 'AI 아키텍처 제안';
    
    const textarea = document.createElement('textarea');
    textarea.classList.add('llm-response');
    textarea.placeholder = '선택한 기술 스택을 기반으로 AI가 아키텍처를 제안합니다...';
    textarea.readOnly = true;

    const generateBtn = document.createElement('button');
    generateBtn.textContent = 'AI 아키텍처 생성';
    generateBtn.classList.add('generate-btn');
    generateBtn.addEventListener('click', () => this.generateArchitecture());

    const applyBtn = document.createElement('button');
    applyBtn.textContent = 'LLM 응답 기반 생성하기';
    applyBtn.classList.add('apply-btn');
    applyBtn.addEventListener('click', () => this.applyArchitecture());

    this.panel.appendChild(title);
    this.panel.appendChild(textarea);
    this.panel.appendChild(generateBtn);
    this.panel.appendChild(applyBtn);

    // 패널과 토글 버튼을 컨테이너에 추가
    const container = document.createElement('div');
    container.classList.add('llm-container');
    container.appendChild(this.toggleButton);
    container.appendChild(this.panel);
    
    this.diagram.container.parentElement.appendChild(container);
  }

  togglePanel() {
    this.isVisible = !this.isVisible;
    const container = this.panel.parentElement;
    
    if (this.isVisible) {
      this.panel.classList.remove('collapsed');
      container.classList.remove('collapsed');
      this.toggleButton.innerHTML = '◀';
    } else {
      this.panel.classList.add('collapsed');
      container.classList.add('collapsed');
      this.toggleButton.innerHTML = '▶';
    }
  }

  async generateArchitecture() {
    const textarea = this.panel.querySelector('.llm-response');
    const selectedTechs = this.diagram.techStacks.map(tech => tech.name).join(', ');
    
    textarea.value = '아키텍처 생성 중...';
    
    try {
      const response = await fetch('YOUR_LLM_API_ENDPOINT', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          techs: selectedTechs
        })
      });
      
      const data = await response.json();
      textarea.value = data.response;
    } catch (error) {
      textarea.value = '아키텍처 생성에 실패했습니다.';
      console.error('LLM API 호출 실패:', error);
    }
  }

  applyArchitecture() {
    const response = this.panel.querySelector('.llm-response').value;
    if (!response) return;

    // 예시 응답 파싱 (실제 구현시에는 LLM 응답 형식에 맞게 수정 필요)
    const sections = {
      '프론트엔드': ['React', 'Vue'],
      '백엔드': ['Spring', 'Node.js'],
      '데이터베이스': ['MySQL', 'MongoDB']
    };

    let yOffset = 50;
    Object.entries(sections).forEach(([section, techs], index) => {
      // 섹션별 직사각형 생성
      const rect = this.diagram.elementManager.elementFactory.createElement(
        'rectangle',
        100 + (index * 300),
        yOffset,
        250,
        200
      );
      
      // 섹션 제목 텍스트 추가
      const text = this.diagram.elementManager.elementFactory.createElement(
        'text',
        120 + (index * 300),
        yOffset + 30,
        section
      );

      this.diagram.elementManager.elements.push(rect, text);

      // 해당 섹션의 기술 스택 아이콘 배치
      techs.forEach((techName, techIndex) => {
        const tech = this.diagram.techStacks.find(t => t.name === techName);
        if (tech) {
          const pos = {
            x: 150 + (index * 300) + (techIndex * 60),
            y: yOffset + 80
          };
          this.diagram.techStackPanel.createTechStackElement(tech, pos);
        }
      });
    });

    this.diagram.redraw();
    this.diagram.historyManager.saveState();
  }
} 