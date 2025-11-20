import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { GoogleGenAI } from "@google/genai";
import JSZip from 'jszip';
import { 
  MousePointer2, 
  Play, 
  RefreshCw, 
  Code, 
  Loader2, 
  ArrowRight, 
  Wand2, 
  Layout,
  Type,
  CheckCircle2,
  X,
  Layers,
  Settings,
  Save,
  Download
} from 'lucide-react';

// --- Core Prompt Template ---
const CORE_PROMPT = `
# Role
您是一位顶级的UI/UX设计师和前端架构师，精通现代设计系统（如Material Design, Fluent UI, Human Interface Guidelines, MIUI, 小红书设计规范），对黄金比例、响应式布局、无障碍设计有深刻理解。您熟练掌握最新的前端组件库（如React生态的Material-UI, Ant Design, Chakra UI, Shadcn/ui；Vue生态的Element Plus, Vuetify；以及Tailwind CSS等）和动画原理，能够将抽象的设计理念转化为精确可执行的代码规范。

# Goal
根据用户提供的功能需求，生成一个高度详细、结构化、可直接输入给AI编码代理（如Cursor, Cody, Claude, Google CLI等）的GUI/前端界面生成提示词。此提示词需确保最终产物在审美、交互、性能和跨设备兼容性上达到行业最高标准，并且**界面元素的默认显示语言为简体中文**。

# Constraints (核心约束)
-   **Do:**
    -   **设计理念:** 始终遵循现代极简主义、清晰度、用户友好性和无障碍设计原则。
    -   **审美标准:** 严格对标微软、苹果、小米、小红书、谷歌等顶级设计语言，融合其精髓，力求视觉优雅、专业且和谐。
    -   **布局与比例:** 严格应用黄金比例原则进行整体布局、元素间距和字体排版，确保视觉平衡与舒适。
    -   **色彩搭配:** 运用专业且无障碍的色彩理论，选择协调、对比适中、品牌识别度高的调色板，确保所有颜色组合都符合最新的WCAG标准。
    -   **响应式设计:** 必须优先采用“移动优先”或“内容优先”的响应式布局策略（Flexbox, CSS Grid, 媒体查询），确保界面在任意尺寸设备上均能完美自适应和流畅交互。
    -   **组件库与动画:** 明确建议使用最新的、成熟稳定的前端组件库（若用户未指定，请根据场景智能选择），并设计流畅、有意义且性能优异的微动效和过渡动画。
    -   **输出格式:** 最终输出内容必须是一个完整的、可直接执行的AI编码代理提示词。**所有GUI界面和前端界面的可见文本内容（如按钮文字、标题、菜单项、占位符等）默认使用简体中文。**代码变量、函数名、CSS属性等仍遵循英文命名规范。
    -   **细节粒度:** 提示词内容应细化到布局、颜色（HEX/RGB/HSL）、字体（大小、行高、字重）、组件类型、交互行为、动画细节等。
-   **Don't:**
    -   **拒绝不专业:** 严禁出现任何不专业、不协调、或与主流设计趋势相悖的布局、配色或交互模式。
    -   **禁止幻觉:** 提供的技术栈和设计建议必须是实际可行的且业界认可的。
    -   **避免冗余:** 提示词内容应精炼高效，不含任何废话、口水话或重复信息。
    -   **禁止偏离核心:** 任何情况下不得偏离用户最初的功能需求。
    -   **禁止输出多余内容:**任何情况下不得输出如示例中的内容：好的，用户。您希望创建一个具有苹果风格的天气网页。我将根据您的要求，并结合苹果Human Interface Guidelines的精髓，为您生成一个高度详细的AI编码代理提示词。

# Workflow (思维链)
1.  **Analyze & Augment (分析与补全):**
    *   彻底分析用户提供的功能需求，识别核心功能、目标用户群和隐式设计期望。
    *   如果需求过于简单或模糊，自动脑补行业最佳实践、通用用户场景和合理的职业素养要求，以充实设计基础。
    *   在内部构建一个初步的功能结构和信息架构草图。
2.  **Synthesize Design Principles (综合设计原则):**
    *   根据用户需求和内部构建的结构，选择或融合1-2种最适合的顶级设计语言（如Material You的动态色彩与Apple的清晰简约）作为主要风格指南。
    *   确立整体布局模式（如侧边栏+主内容区，卡片式布局，仪表盘布局等），并初步规划各区域的黄金比例分配。
    *   选定基础调色板（主色、辅助色、中性色、强调色、错误/成功/警告色），确保其符合WCAG可访问性标准。
    *   选择核心字体组合（标题、正文、代码），并定义其层级和使用场景。
3.  **Propose Technical & Interactive Details (提出技术与交互细节):**
    *   根据设计风格和功能需求，智能推荐最合适的现代前端技术栈（如React/Vue/Angular框架）、高性能组件库和CSS框架（如Tailwind CSS），并说明其选用理由。
    *   设计关键用户旅程和交互模式，如导航切换、表单提交、数据加载状态、按钮点击反馈等。
    *   构思微交互动画，指定动画类型（如过渡、弹性、缓入缓出）、持续时间、触发条件和效果。
    *   规划响应式断点和不同设备下的布局调整策略。
4.  **Construct AI Agent Prompt (构建AI编码代理提示词):**
    *   将上述所有分析和设计决策，按照以下严谨的结构和格式，转化为一个指令AI编码代理的详细Prompt。
    *   提示词内容必须包含：\`Project Goal\`, \`Design System/Aesthetic\`, \`Color Palette\`, \`Typography\`, \`Layout & Responsiveness\`, \`Core Components & Interactions\`, \`Animations\`, \`Accessibility\`, \`Technical Stack Suggestions\`, \`Output Requirements\`。
    *   **确保所有用户可见文本内容为简体中文。**
5.  **Refine & Validate (优化与验证):**
    *   对照 \`Constraints\` 中的所有“Do”和“Don't”列表，逐一核对生成Prompt的完整性、准确性、专业性和可执行性。
    *   确保语言精确、无歧义，并且可以直接用于AI编码。

# Few-Shot Examples (范例)
<example>
User: 我想创建一个简单的在线笔记应用的主界面，需要包含侧边栏导航、笔记列表、以及一个可编辑的笔记内容区域。
AI:
\`\`\`
# 在线笔记应用主界面前端/GUI生成提示词

## 项目目标
开发一个简洁、高度响应式且用户友好的在线笔记应用主界面。该界面应允许用户通过侧边栏导航、查看笔记列表以及编辑选定的笔记内容。**所有可见的UI文本都应使用简体中文。**

## Design System/Aesthetic
受微软 Fluent UI 的清晰度和谷歌 Material You 的自适应优雅启发，着重于简洁的线条、细微的阴影和有目的的空间利用。强调专业、平静和高效的用户体验。所有布局和间距决策严格遵循黄金比例原则。

## Color Palette (HEX values)
-   **Primary:** \`#4285F4\` (Google Blue - 用于强调、主要操作)
-   **Secondary/Accent:** \`#673AB7\` (深紫色 - 用于次要操作、突出显示选中项)
-   **Background (Light Mode):** \`#FFFFFF\` (纯白色)
-   **Background (Dark Mode - optional, focus Light Mode primarily):** \`#1A1A1A\`
-   **Surface/Card Background:** \`#F5F5F5\` (浅灰色 - 用于内容区域、卡片)
-   **Text (Primary):** \`#212121\` (深灰色)
-   **Text (Secondary):** \`#616161\` (中灰色)
-   **Border/Divider:** \`#E0E0E0\` (极浅灰色)
-   **Success:** \`#4CAF50\` (成功提示色)
-   **Error:** \`#F44336\` (错误提示色)

## Typography
-   **Font Family:** 'Noto Sans SC', 'Roboto', 'Segoe UI', sans-serif (优先使用系统字体，并确保中文字符显示优化)。
-   **Headings (例如, 笔记标题):** Noto Sans SC Bold, \`font-size: 24px\`, \`line-height: 1.2\`
-   **Sidebar Navigation (侧边栏导航):** Noto Sans SC Medium, \`font-size: 16px\`, \`line-height: 1.5\`
-   **Note List Item Title (笔记列表项标题):** Noto Sans SC Medium, \`font-size: 18px\`, \`line-height: 1.4\`
-   **Note List Item Snippet (笔记列表项摘要):** Noto Sans SC Regular, \`font-size: 14px\`, \`line-height: 1.6\`, \`color: #616161\`
-   **Content Editor (内容编辑器):** Noto Sans SC Regular, \`font-size: 16px\`, \`line-height: 1.7\`

## Layout & Responsiveness
-   **Overall Structure:** 三个主要列：
    1.  **Sidebar (左侧边栏):** \`width: 280px\` (桌面端), 可在平板电脑上折叠, 移动端默认隐藏 (可通过汉堡菜单访问)。侧边栏宽度与主内容区域尽可能遵循黄金比例。
    2.  **Note List (中间笔记列表):** \`width: 320px\` (桌面端), 侧边栏隐藏时在平板电脑/移动端全宽。
    3.  **Content Editor (右侧内容编辑器):** 流式宽度, 占据剩余空间。
-   **Mobile Layout (<= 768px):**
    -   Sidebar: 隐藏, 可通过左上角汉堡菜单切换显示。
    -   Default View: 笔记列表占据全屏。点击笔记后，内容编辑器占据全屏。内容编辑器中应有返回按钮以返回笔记列表。
    -   **Tablet Layout (769px - 1024px):**
    -   Sidebar: 可折叠或部分可见 (例如，仅显示图标模式)。
    -   Note List and Content Editor: 两者均可见，并调整宽度。
-   **Desktop Layout (> 1024px):** 三个面板均可见。
-   **Spacing:** 使用 \`8px\` 作为基本单位，保持一致的内边距和外边距 (例如，\`padding: 16px 24px\`, \`margin-bottom: 8px\`)。

## Core Components & Interactions
1.  **Sidebar (侧边栏):**
    -   **Header (顶部):** 应用 Logo/标题, 可选用户头像。
    -   **Navigation Items (导航项):** 类别/文件夹列表 (例如, "所有笔记", "收藏夹", "回收站")。每个项目应包含图标和文本。悬停状态: \`background: #E8E8E8\`。选中状态: \`background: #E3F2FD\`, \`color: #4285F4\`, 文本加粗。
    -   **"New Note" Button (新建笔记按钮):** 突出显示, 浮动操作按钮 (FAB) 或固定在侧边栏底部。
2.  **Note List (笔记列表):**
    -   **Header (顶部):** "笔记" 标题, 搜索栏, 排序/筛选选项 (图标)。
    -   **Note Card/Item (笔记卡片/项):** 每个项目显示笔记标题、简短内容摘要和最后修改日期。
        -   悬停状态: 细微的 \`box-shadow\` 增加。
        -   选中状态: \`border-left: 4px solid #4285F4\`, \`background: #F0F8FF\`。
        -   右键上下文菜单 (删除, 归档, 分享)。
3.  **Content Editor (内容编辑器):**
    -   **Header (顶部):** 笔记标题输入框 (可编辑), 操作按钮 (保存, 分享, 更多选项 - 省略号图标)。
    -   **Text Editor Area (文本编辑区):** 富文本编辑器 (WYSIWYG), 支持基本格式设置 (加粗, 斜体, 下划线, 列表, 链接)。占位符文本为 "开始撰写您的笔记..."。
    -   **Status Bar (Optional - 状态栏，可选):** 字数统计, 最后保存时间。

## Animations
-   **Sidebar Toggle (侧边栏切换):** 平滑的 \`slide-in/slide-out\` 过渡 (\`duration: 200ms\`, \`ease-out\`)。
-   **Note Selection (笔记选择):** 内容编辑器 subtle \`fade-in\`, 选中笔记项 \`background-color\` 过渡 (\`duration: 150ms\`, \`ease-in-out\`)。
-   **Button/Icon Hover (按钮/图标悬停):** \`transform: translateY(-2px)\` 或 \`background-color\` 变化 (\`duration: 100ms\`)。
-   **FAB "新建笔记" Button:** 悬停时 \`scale-up\`，点击时图标 \`rotate\` (如果适用，表示打开更多选项)。

## Accessibility
-   确保所有交互元素具有清晰的 \`aria-labels\` 并支持键盘导航 (\`tab-index\`)。
-   文本和背景之间的高对比度。
-   语义化的 HTML 结构。

## Technical Stack Suggestions
-   **Framework:** React
-   **Component Library:** Material-UI (MUI) or Chakra UI for robust, accessible components.
-   **Styling:** Styled Components or Emotion (if using Material-UI), or Chakra UI's styling system. Tailwind CSS could be an alternative for utility-first approach.
-   **Editor:** Quill.js or Tiptap for the rich text editor.

## Output Requirements
Generate the complete HTML, CSS, and JavaScript (React components) for the main interface based on these specifications. Ensure modular component structure.
\`\`\`
</example>

# Initialization
我已准备好将您的UI需求转化为一个高密度、生产级的AI编码代理提示词，旨在创造极致美学与功能的GUI/前端界面。所有可见的界面文本将优先使用简体中文。请提供您的需求。
`;

// --- Injectable Script for Iframe ---
const IFRAME_SCRIPT = `
<script>
  (function() {
    let selectionMode = false;
    let highlightedElement = null;

    // Helper to calculate unique CSS selector
    function getCssSelector(el) {
      if (!(el instanceof Element)) return;
      const path = [];
      while (el.nodeType === Node.ELEMENT_NODE) {
        let selector = el.nodeName.toLowerCase();
        if (el.id) {
          selector += '#' + el.id;
          path.unshift(selector);
          break;
        } else {
          let sib = el, nth = 1;
          while (sib = sib.previousElementSibling) {
            if (sib.nodeName.toLowerCase() == selector) nth++;
          }
          if (nth != 1) selector += ":nth-of-type("+nth+")";
        }
        path.unshift(selector);
        el = el.parentNode;
      }
      return path.join(" > ");
    }

    window.addEventListener('message', (event) => {
      if (event.data.type === 'TOGGLE_SELECTION') {
        selectionMode = event.data.active;
        if (selectionMode) {
          document.body.style.cursor = 'crosshair';
          document.addEventListener('mouseover', handleHover, true);
          document.addEventListener('click', handleClick, true);
          addStyles();
        } else {
          document.body.style.cursor = 'default';
          document.removeEventListener('mouseover', handleHover, true);
          document.removeEventListener('click', handleClick, true);
          removeStyles();
          if (highlightedElement) highlightedElement.classList.remove('__ai-editor-highlight');
        }
      }
      
      if (event.data.type === 'UPDATE_SELECTION_VISUALS') {
         // Clear old selections
         document.querySelectorAll('.__ai-editor-selected').forEach(el => el.classList.remove('__ai-editor-selected'));
         
         // Apply new selections
         const selectors = event.data.selectors || [];
         selectors.forEach(sel => {
           try {
             const el = document.querySelector(sel);
             if (el) el.classList.add('__ai-editor-selected');
           } catch(e) { console.warn('Invalid selector', sel); }
         });
      }
    });

    function addStyles() {
      if (!document.getElementById('__ai-editor-styles')) {
        const style = document.createElement('style');
        style.id = '__ai-editor-styles';
        style.innerHTML = \`
          .__ai-editor-highlight {
            outline: 2px dashed #ef4444 !important;
            outline-offset: -2px !important;
            background-color: rgba(239, 68, 68, 0.1) !important;
            transition: all 0.1s ease !important;
            cursor: pointer !important;
          }
          .__ai-editor-selected {
            outline: 3px solid #3b82f6 !important; /* Blue-500 */
            outline-offset: -3px !important;
            box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.2) !important;
            position: relative;
            z-index: 1000;
          }
        \`;
        document.head.appendChild(style);
      }
    }

    function removeStyles() {
      const style = document.getElementById('__ai-editor-styles');
      if (!selectionMode && document.querySelectorAll('.__ai-editor-selected').length === 0) {
          if (style) style.remove();
      }
    }

    function handleHover(e) {
      if (!selectionMode) return;
      e.stopPropagation();
      
      if (highlightedElement && highlightedElement !== e.target) {
        highlightedElement.classList.remove('__ai-editor-highlight');
      }
      
      highlightedElement = e.target;
      highlightedElement.classList.add('__ai-editor-highlight');
    }

    function handleClick(e) {
      if (!selectionMode) return;
      e.preventDefault();
      e.stopPropagation();
      
      const target = e.target;
      const selector = getCssSelector(target);
      
      const clone = target.cloneNode(true);
      clone.classList.remove('__ai-editor-highlight');
      clone.classList.remove('__ai-editor-selected');
      
      window.parent.postMessage({
        type: 'TOGGLE_ELEMENT',
        payload: {
          tagName: target.tagName.toLowerCase(),
          selector: selector,
          html: clone.outerHTML,
          text: target.innerText.substring(0, 50)
        }
      }, '*');
    }
  })();
</script>
`;

const App = () => {
  // State
  const [userInput, setUserInput] = useState('');
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [loadingState, setLoadingState] = useState<'idle' | 'generating_prompt' | 'generating_code' | 'updating_element'>('idle');
  
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedElements, setSelectedElements] = useState<Array<{selector: string, html: string, tagName: string, text: string}>>([]);
  const [modificationInput, setModificationInput] = useState('');
  
  // Settings State
  const [showSettings, setShowSettings] = useState(false);
  const [customBaseUrl, setCustomBaseUrl] = useState('');
  const [customApiKey, setCustomApiKey] = useState('');
  const [customModel, setCustomModel] = useState('');
  
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Helper: Get AI Client with optional custom config
  const getAIClient = () => {
    return new GoogleGenAI({
      apiKey: customApiKey || process.env.API_KEY,
      baseUrl: customBaseUrl || undefined, 
    });
  };

  const getModelName = () => {
    return customModel.trim() || 'gemini-2.5-flash';
  };

  // --- Handlers ---

  const generatePrompt = async () => {
    if (!userInput.trim()) return;
    setLoadingState('generating_prompt');
    setGeneratedCode(''); 
    setSelectedElements([]);
    
    try {
      const ai = getAIClient();
      const response = await ai.models.generateContent({
        model: getModelName(),
        contents: userInput,
        config: {
          systemInstruction: CORE_PROMPT,
        }
      });

      const promptText = response.text;
      setGeneratedPrompt(promptText);
      generateCode(promptText);
    } catch (error) {
      console.error("Error generating prompt:", error);
      setLoadingState('idle');
      alert("提示词生成失败，请检查配置或重试。");
    }
  };

  const generateCode = async (promptText: string) => {
    setLoadingState('generating_code');
    try {
      const ai = getAIClient();
      const systemInstruction = `
        You are an expert frontend developer.
        Execute the following prompt exactly to create a high-quality single-file HTML/CSS/JS interface.
        
        RULES:
        1. Output valid HTML5.
        2. Use Tailwind CSS via CDN for styling (include the script tag).
        3. Include Font Awesome or Lucide icons via CDN if needed.
        4. Ensure the design is responsive and beautiful.
        5. Return ONLY the raw HTML code. Do not use markdown code blocks (no \`\`\`html).
        6. All UI text should be in Simplified Chinese unless specified otherwise.
      `;

      const response = await ai.models.generateContent({
        model: getModelName(),
        contents: promptText,
        config: { systemInstruction }
      });

      let code = response.text;
      code = code.replace(/^```html/, '').replace(/^```/, '').replace(/```$/, '');
      
      setGeneratedCode(code);
      setLoadingState('idle');
    } catch (error) {
      console.error("Error generating code:", error);
      setLoadingState('idle');
      alert("代码生成失败。");
    }
  };

  const toggleSelectionMode = () => {
    const newMode = !selectionMode;
    setSelectionMode(newMode);
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.postMessage({
        type: 'TOGGLE_SELECTION',
        active: newMode
      }, '*');
    }
  };

  const clearSelection = () => {
    setSelectedElements([]);
  };

  const updateElement = async () => {
    if (selectedElements.length === 0 && !modificationInput.trim()) return;
    setLoadingState('updating_element');
    
    try {
      const ai = getAIClient();
      
      const targetsDescription = selectedElements.map((el, i) => `
        Target #${i + 1} (Ref: @${el.tagName}):
        - Selector: ${el.selector}
        - Current HTML Context: ${el.html}
      `).join('\n\n');

      const updateInstruction = `
        You are an expert frontend developer performing a surgical code update.
        
        CONTEXT:
        The user wants to modify elements in the provided HTML page.
        
        TARGET ELEMENTS:
        ${targetsDescription}
        
        USER REQUEST:
        ${modificationInput}
        
        INSTRUCTIONS:
        1. Take the provided FULL HTML code.
        2. Interpret user references (like "@div" or "@button") based on the TARGET ELEMENTS provided above.
        3. Apply the requested changes.
        4. You may adjust CSS classes (Tailwind) or inline styles.
        5. Do NOT drastically change the rest of the layout.
        6. Return the FULL, valid, updated HTML string. Do not use markdown.
      `;

      const response = await ai.models.generateContent({
        model: getModelName(),
        contents: generatedCode, 
        config: { systemInstruction: updateInstruction }
      });

      let newCode = response.text;
      newCode = newCode.replace(/^```html/, '').replace(/^```/, '').replace(/```$/, '');
      
      setGeneratedCode(newCode);
      setModificationInput('');
      setSelectedElements([]);
      setSelectionMode(false); 
      setLoadingState('idle');
      
      if (iframeRef.current && iframeRef.current.contentWindow) {
        iframeRef.current.contentWindow.postMessage({
          type: 'TOGGLE_SELECTION',
          active: false
        }, '*');
      }

    } catch (error) {
      console.error("Error updating element:", error);
      setLoadingState('idle');
      alert("更新失败。");
    }
  };

  const handleExport = async () => {
    if (!generatedCode) return;
    try {
      const zip = new JSZip();
      // We export the clean generated code (without the editor interaction script)
      zip.file("index.html", generatedCode);
      zip.file("README.md", "# AI Generated UI\n\nGenerated with AI UI Editor.\n\nOpen index.html in your browser to view the project.");
      
      const content = await zip.generateAsync({type: "blob"});
      const url = URL.createObjectURL(content);
      const a = document.createElement("a");
      a.href = url;
      a.download = "ai-ui-project.zip";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Export failed", e);
      alert("导出失败 (Export failed)");
    }
  };

  // --- Effects ---

  useEffect(() => {
    const handler = (event: MessageEvent) => {
      if (event.data.type === 'TOGGLE_ELEMENT') {
        const payload = event.data.payload;
        
        setSelectedElements(prev => {
          const exists = prev.some(el => el.selector === payload.selector);
          if (exists) {
            // Toggle OFF: Remove element
            return prev.filter(el => el.selector !== payload.selector);
          } else {
            // Toggle ON: Add element and append mention to input
            const tagLabel = `@${payload.tagName}`;
            // Append with space if needed
            setModificationInput(curr => {
              const prefix = curr.length > 0 && !curr.endsWith(' ') ? ' ' : '';
              return curr + prefix + tagLabel + ' ';
            });
            return [...prev, payload];
          }
        });
      }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, []);

  useEffect(() => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.postMessage({
        type: 'UPDATE_SELECTION_VISUALS',
        selectors: selectedElements.map(el => el.selector)
      }, '*');
    }
  }, [selectedElements]);

  const getIframeContent = () => {
    if (!generatedCode) return '';
    if (generatedCode.includes('</body>')) {
      return generatedCode.replace('</body>', `${IFRAME_SCRIPT}</body>`);
    }
    return generatedCode + IFRAME_SCRIPT;
  };

  return (
    <div className="flex h-screen bg-gray-900 text-gray-100 font-sans overflow-hidden">
      {/* Left Sidebar - Controls */}
      <div className="w-[400px] flex-shrink-0 flex flex-col border-r border-gray-800 bg-gray-900 shadow-xl z-10">
        <div className="p-5 border-b border-gray-800 flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Wand2 className="w-6 h-6 text-blue-400" />
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                AI UI 编辑器
              </h1>
            </div>
            <p className="text-xs text-gray-500">从提示词生成 UI，支持可视化批量编辑</p>
          </div>
          <div className="flex items-center gap-2">
            {generatedCode && (
              <button
                onClick={handleExport}
                className="p-2 rounded-lg text-gray-500 hover:text-green-400 hover:bg-gray-800 transition-colors"
                title="Export to ZIP"
              >
                <Download className="w-5 h-5" />
              </button>
            )}
            <button 
              onClick={() => setShowSettings(!showSettings)} 
              className={`p-2 rounded-lg transition-colors ${showSettings ? 'bg-gray-800 text-blue-400' : 'text-gray-500 hover:text-gray-300'}`}
              title="Settings"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="bg-gray-800 border-b border-gray-700 p-4 space-y-3 animate-in slide-in-from-top-2">
            <h3 className="text-sm font-bold text-gray-300 flex items-center gap-2">
              <Settings className="w-4 h-4" />
              模型配置 (Model Config)
            </h3>
            <div className="space-y-2">
              <div>
                <label className="text-xs text-gray-400 block mb-1">Custom Model Name (Optional)</label>
                <input 
                  type="text" 
                  value={customModel}
                  onChange={(e) => setCustomModel(e.target.value)}
                  placeholder="gemini-2.5-flash"
                  className="w-full bg-gray-900 border border-gray-700 rounded px-2 py-1 text-xs text-white focus:border-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 block mb-1">Custom Base URL (Optional)</label>
                <input 
                  type="text" 
                  value={customBaseUrl}
                  onChange={(e) => setCustomBaseUrl(e.target.value)}
                  placeholder="https://api.openai.com/v1"
                  className="w-full bg-gray-900 border border-gray-700 rounded px-2 py-1 text-xs text-white focus:border-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 block mb-1">Custom API Key (Optional)</label>
                <input 
                  type="password" 
                  value={customApiKey}
                  onChange={(e) => setCustomApiKey(e.target.value)}
                  placeholder="sk-..."
                  className="w-full bg-gray-900 border border-gray-700 rounded px-2 py-1 text-xs text-white focus:border-blue-500 outline-none"
                />
              </div>
              <p className="text-[10px] text-gray-500">
                Leave blank to use default.
              </p>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* Step 1: Generation */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
              <Layout className="w-4 h-4" />
              1. 描述您的界面
            </label>
            <textarea
              className="w-full h-32 bg-gray-800 border border-gray-700 rounded-lg p-3 text-sm text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
              placeholder="例如：一个带有邮箱、密码和圆形登录按钮的登录卡片，背景为渐变色..."
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              disabled={loadingState !== 'idle'}
            />
            <button
              onClick={generatePrompt}
              disabled={!userInput.trim() || loadingState !== 'idle'}
              className={`w-full py-2.5 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-all ${
                loadingState !== 'idle' 
                  ? 'bg-gray-700 cursor-not-allowed text-gray-400' 
                  : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/20'
              }`}
            >
              {loadingState === 'generating_prompt' ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> 设计中...</>
              ) : loadingState === 'generating_code' ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> 编码中...</>
              ) : (
                <><Play className="w-4 h-4 fill-current" /> 生成 UI</>
              )}
            </button>
          </div>

          {/* Divider */}
          {generatedCode && <div className="h-px bg-gray-800" />}

          {/* Step 2: Editing */}
          {generatedCode && (
            <div className="space-y-4 animate-in fade-in slide-in-from-left-4 duration-500">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                  <MousePointer2 className="w-4 h-4" />
                  2. 调整元素
                </label>
                {selectedElements.length > 0 && (
                  <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full">
                    已选 {selectedElements.length} 项
                  </span>
                )}
              </div>

              {/* Selector Toggle */}
              <div className="flex gap-2">
                <button
                  onClick={toggleSelectionMode}
                  disabled={loadingState !== 'idle'}
                  className={`flex-1 py-2 px-4 rounded-lg border flex items-center justify-center gap-2 text-sm transition-all ${
                    selectionMode 
                      ? 'bg-red-500/10 border-red-500/50 text-red-400 animate-pulse font-medium' 
                      : 'bg-gray-800 border-gray-700 hover:border-gray-600 text-gray-300'
                  }`}
                >
                  {selectionMode ? '点击元素进行选择 (已开启)' : '选择元素'}
                </button>
                {selectedElements.length > 0 && (
                  <button 
                    onClick={clearSelection}
                    className="px-3 rounded-lg bg-gray-800 border border-gray-700 hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
                    title="Clear Selection"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Selected Context List */}
              {selectedElements.length > 0 && (
                <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-3 space-y-2 max-h-32 overflow-y-auto">
                  <div className="flex items-start gap-2 text-xs text-gray-400 uppercase font-bold tracking-wider">
                     选中元素 (Context):
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedElements.map((el, idx) => (
                      <div key={idx} className="flex items-center gap-1 text-xs bg-gray-700 text-gray-200 px-2 py-1 rounded border border-gray-600">
                        <Layers className="w-3 h-3 text-blue-400" />
                        <span className="font-mono">@{el.tagName}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Modification Input */}
              <div className="space-y-2 animate-in slide-in-from-bottom-2">
                <label className="text-xs text-gray-400">您希望如何修改这些元素？</label>
                <textarea
                  className="w-full h-24 bg-gray-800 border border-gray-700 rounded-lg p-3 text-sm text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none font-mono"
                  placeholder="例如：@div 把背景改成红色，把 @button 的字体变大..."
                  value={modificationInput}
                  onChange={(e) => setModificationInput(e.target.value)}
                  disabled={loadingState !== 'idle'}
                />
                <button
                  onClick={updateElement}
                  disabled={(!modificationInput.trim() && selectedElements.length === 0) || loadingState !== 'idle'}
                  className={`w-full py-2 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-all ${
                    loadingState === 'updating_element'
                      ? 'bg-gray-700 cursor-not-allowed text-gray-400'
                      : 'bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-900/20'
                  }`}
                >
                  {loadingState === 'updating_element' ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> 更新中...</>
                  ) : (
                    <><RefreshCw className="w-4 h-4" /> 应用更改</>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Status Bar */}
        <div className="p-3 border-t border-gray-800 text-xs text-gray-500 flex justify-between items-center bg-gray-900">
           <span>状态: {loadingState === 'idle' ? '空闲' : loadingState}</span>
           {generatedCode && <span className="text-green-500 flex items-center gap-1"><Code className="w-3 h-3"/> 代码已就绪</span>}
        </div>
      </div>

      {/* Right - Preview Area */}
      <div className="flex-1 bg-[#1e1e1e] relative flex flex-col">
        {generatedCode ? (
          <iframe
            ref={iframeRef}
            title="Preview"
            className="flex-1 w-full h-full border-none bg-white"
            srcDoc={getIframeContent()}
            sandbox="allow-scripts allow-same-origin allow-modals allow-forms allow-popups"
          />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-600 space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-gray-800 border border-gray-700 flex items-center justify-center shadow-inner">
              <Layout className="w-8 h-8 opacity-50" />
            </div>
            <p className="text-sm font-medium">生成的 UI 将显示在这里</p>
          </div>
        )}
        
        {/* Overlay for Selection Mode Hint */}
        {selectionMode && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-red-600/90 backdrop-blur-sm text-white px-4 py-2 rounded-full shadow-lg text-sm font-medium animate-in slide-in-from-top-2 pointer-events-none z-50 border border-red-400">
            多选模式: 点击元素可添加到输入框
          </div>
        )}
      </div>
    </div>
  );
};

const root = createRoot(document.getElementById('app')!);
root.render(<App />);