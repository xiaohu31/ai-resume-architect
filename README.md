<div align="center">
  <img src="./image/og-image.png" width="200" style="border-radius: 20px; margin-bottom: 20px" />
  <h1>✨ AI Resume Architect</h1>

  <p>
    <b>极致美观 ｜ 集成顶级 AI ｜ 完全免费 ｜ 无需登录 ｜ 在线即用</b>
    <br />
    <a href="https://ara.yingluowu.com/"><strong>🌐 发现你的职业新可能：ara.yingluowu.com</strong></a>
  </p>

  <p>
    <a href="https://github.com/xiaohu31/ai-resume-architect/stargazers"><img src="https://img.shields.io/github/stars/xiaohu31/ai-resume-architect?style=for-the-badge&logo=github&color=FFD700" alt="stars"></a>
    <a href="https://github.com/xiaohu31/ai-resume-architect/network/members"><img src="https://img.shields.io/github/forks/xiaohu31/ai-resume-architect?style=for-the-badge&logo=git&color=white" alt="forks"></a>
    <a href="https://github.com/xiaohu31/ai-resume-architect/blob/main/LICENSE"><img src="https://img.shields.io/github/license/xiaohu31/ai-resume-architect?style=for-the-badge&logo=opensourceinitiative" alt="license"></a>
  </p>
</div>

---

## 💎 为什么选择 AI Resume Architect?

在求职的过程中，第一印象不仅来自简历内容，更来自视觉呈现。**AI Resume Architect** 旨在为你打造一份**既有灵魂（AI 优化），又有颜值（专业设计）**的完美简历。

### 🌈 核心优势
- 🎨 **极致美观**：基于现代审美设计的 UI 界面，玻璃拟态风格，实时渲染 A4 标准布局。
- 🤖 **顶级 AI 集成**：原生支持 **Gemini 3.0** 与 **DeepSeek**，深度对齐 **STAR 法则**，让每一行描述都掷地有声。
- � **完全免费**：开源项目，无任何隐藏收费，不割韭菜。
- 🔓 **无需登录**：打开即用。我们不收集你的邮箱，不索取你的电话，你的隐私由你掌控。
- ☁️ **在线即用**：支持 Vercel 一键部署，或直接通过浏览器安全访问。数据全本地存储，永不丢件。

---

## 🌟 核心特性 (Core Features)

- 🤖 **AI 深度驱动的工作流**
  - **智能润色**：利用大模型将平凡的语言转化为专业的职场话术。
  - **内容扩展**：自动挖掘项目细节，量化工作成果。
  - **选中即修复**：首创**浮动 AI 工具栏**，鼠标选中文字即可实时进化内容。
  - **简历诊断**：模拟资深 HR 视角，从四个维度为你的简历评分。
- 🛡️ **隐私优先架构**
  - 使用 **IndexedDB (Dexie.js)** 技术，数据物理隔离在你的浏览器中。
  - 零后端、零 API 泄露风险，项目支持完全离线运行。
- 🎨 **模块化与自由排版**
  - **组件化管理**：基于 `@dnd-kit` 的平滑拖拽排序，像拼积木一样写简历。
  - **样式微调**：字号、行高、间距、字体库（内置阿里惠普体 3.0）均可毫秒级预览。
- 📸 **专业化管理**
  - **快照系统**：一键保存 V1.0、V2.0 版本，按需切换。
  - **高保真 PDF**：完美支持浏览器打印引擎，生成 ATS 友好的高清 PDF。

---

## 📸 视觉预览 (Visual Preview)

| 极简且高级的编辑器 | 深度 AI 诊断报告 |
| :---: | :---: |
| ![Editor Interface](./image/image_1.png) | ![Diagnosis Report](./image/image_2.png) |

---

  - **高清 PDF 导出**：支持通过浏览器打印引擎一键生成标准 PDF。
- 📸 **版本管理系统**
  - **快照存档**：支持为不同公司或岗位创建专属简历快照（如：阿里版、腾讯版、V1.0）。
  - **撤销/重做**：基于 Zundo 的完整操作历史记录。

---

## 🛠️ 技术栈

| 类别 | 技术 |
| :--- | :--- |
| **框架** | React 19 + Vite 6 |
| **状态管理** | Zustand (Persistent) + Zundo (Undo/Redo) |
| **样式** | Tailwind CSS (Dark Mode Support) |
| **存储** | IndexedDB (Powered by Dexie.js) |
| **AI 模型** | Gemini 3.0 Flash / OpenAI 兼容协议 (DeepSeek / Claude 等) |
| **拖拽** | @dnd-kit |
| **图标** | Lucide React |

---

## 🚀 快速开始

### ☁️ 一键部署 (Vercel)

本项目已经过优化，支持在 Vercel 上实现秒级自动化部署：

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fxiaohu31%2Fai-resume-architect)

**部署步骤：**
1. 点击上方的 **Deploy with Vercel** 按钮。
2. 按照 Vercel 提示连接您的 GitHub 仓库（完全免费）。
3. 部署完成后即可访问您的专属简历工具。
4. **AI 配置**：在应用界面的 **⚙️ 设置** 中填入您自己的 API Key。

### 💻 本地开发

如果您希望在本地运行或进行二次开发，请按照以下步骤操作：

1. **克隆仓库**
   ```bash
   git clone https://github.com/xiaohu31/ai-resume-architect.git
   cd ai-resume-architect
   ```

2. **安装依赖**
   ```bash
   npm install
   ```

3. **启动开发服务器**
   ```bash
   npm run dev
   ```

4. **浏览器访问**
   打开 [http://localhost:3000](http://localhost:3000) 即可开始制作。

   *(注：本项目无需配置任何环境变量，所有设置均在应用内完成。)*

---

## 💡 使用建议

1. **配置 AI**：在顶部导航栏点击 **⚙️ 设置**，选择你的 AI 提供商（Gemini 或 OpenAI）。Gemini 响应速度快且目前提供免费层级。
2. **使用 AI 助手**：在编辑具体的描述文本时，点击下方的“润色”或“扩展”按钮，AI 会根据上下文给出优化后的对比建议。
3. **定期诊断**：完成草稿后，点击 **📋 诊断**，根据反馈优化内容的量化数据。
4. **版本存档**：投递不同岗位前，建议点击 **📂 版本管理** 保存快照。

---

## 🔒 隐私承诺

我们郑重承诺：您的所有简历数据（包括姓名、电话、教育背景等）仅存储在您本地浏览器的 **IndexedDB** 数据库中。除非您主动点击 AI 优化功能（此时会向 AI 服务商发送当前描述文本），否则任何数据都不会离开您的设备。

---

## 🛡️ 安全与隐私说明 (Security & Privacy)

本项目采用 **客户端加密存储** 方案：
- **API Key 安全**：您的 API Key 仅保存在浏览器本地的 `localStorage` 或 `IndexedDB` 中。我们**不会**也**无法**在服务器端获取您的 Key。
- **防止泄露建议**：
  - 请勿在公共电脑上保存您的 API Key。
  - 建议为 AI 服务设置使用额度限制，以防 Key 意外泄漏导致的资费风险。
  - 本项目已移除构建过程中的 Key 注入机制，生产环境版本纯净安全。

---

## 📄 开源协议

本项目基于 [MIT](LICENSE) 协议开源。

---

<div align="center">
  制作不易，如果这个项目对你有帮助，欢迎点个 ⭐️ Star！
</div>
