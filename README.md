# Ask Me Anything.. — Local Ollama Web UI (ChatGPT-Inspired)

A modern, fast, privacy-first ChatGPT-like web interface built for running local AI models on your computer using **Ollama**.

![React](https://img.shields.io/badge/React-19-61dafb.svg)
![Vite](https://img.shields.io/badge/Vite-8-646cff.svg)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-06b6d4.svg)
![Ollama](https://img.shields.io/badge/Ollama-Local-black.svg)

---

## 🌟 Key Features

- **100% Local & Private**: All AI processing runs on your local hardware. Prompts and chat history never leave your computer.
- **Real-time Response Streaming**: Ultra-fast response streaming directly from your local Ollama instance.
- **Multi-Model Support**: Effortlessly switch between installed Ollama models (e.g., `llama3.2:1b`, `llama3.2`, `deepseek-r1`, `mistral`, `phi3`).
- **In-App Model Puller**: Download and pull new AI models directly from the UI without touching the command line.
- **Rich Text & Math Formatting**:
  - Full GitHub-Flavored Markdown support
  - Syntax-highlighted code blocks with 1-click **Copy Code** button
  - KaTeX math equation rendering ($E = mc^2$ and block equations)
- **Chat Management**:
  - Multiple conversation threads
  - Pin important chats & search chat titles
  - Export chat history as JSON
  - LocalStorage persistence (chats saved across browser refreshes)

---

## 🛠️ Tech Stack & How It Was Developed

### Frontend Architecture
- **Core Framework**: **React 19** (JSX & ES Modules)
- **Build Tool / Bundler**: **Vite 8** for instant HMR (Hot Module Replacement) and fast production builds.
- **Styling**: **Tailwind CSS v4** + Custom CSS variables for a dark-mode ChatGPT aesthetic.
- **Iconography**: **Lucide React** icons.
- **Markdown & Math Processing**:
  - `react-markdown` for rendering Markdown.
  - `remark-gfm` for tables, strikethrough, task lists.
  - `remark-math` & `rehype-katex` for LaTeX mathematical notation.
  - `highlight.js` for code syntax highlighting.

### AI Integration
- **Engine**: **Ollama** running locally on macOS, Linux, or Windows.
- **Communication Protocol**: Direct client-side HTTP REST API requests via native `fetch` API.
- **Streaming Implementation**: Uses `ReadableStream` reader with text decoding to parse streamed NDJSON objects from Ollama's `/api/chat` endpoint in real-time.

---

## 📁 Project Structure

```text
my-chatgpt/
├── index.html                 # HTML Entry Point
├── package.json               # Project Dependencies & Scripts
├── vite.config.js             # Vite Configuration
├── public/                    # Favicon & Static Assets
└── src/
    ├── App.jsx                # Main Application Shell & State Orchestration
    ├── index.css              # Global Design Tokens & Tailwind Directives
    ├── components/
    │   ├── ChatContainer.jsx  # Main Message View & Empty Welcome Screen
    │   ├── CodeBlock.jsx      # Code Snippet Container with Copy & Syntax Highlighting
    │   ├── Header.jsx         # App Bar & Model Dropdown Selector
    │   ├── MessageComposer.jsx# Chat Textarea & Action Buttons
    │   ├── MessageItem.jsx    # Individual User/AI Message Bubble
    │   ├── ModelSelectorModal.jsx # Pull New Models Modal
    │   ├── SettingsModal.jsx  # System Instructions & Parameters Modal
    │   └── Sidebar.jsx        # Navigation Drawer (Threads, Search, Pin, Delete)
    ├── hooks/
    │   └── useChatStorage.js  # Custom Hook for LocalStorage Chat Management
    └── services/
        └── ollamaApi.js       # Client API Service for Ollama endpoints
```

---

## 🎓 Student Setup Guide (Step-by-Step)

Follow these simple steps to set up and run the project locally on your machine.

### Prerequisites

Make sure you have the following installed on your machine:
1. **Node.js** (v18.0 or higher) — [Download Node.js](https://nodejs.org/)
2. **Git** — [Download Git](https://git-scm.com/)
3. **Ollama** — [Download Ollama](https://ollama.com/)

---

### Step 1: Install & Start Ollama

1. Download and install **Ollama** for your OS from [ollama.com](https://ollama.com).
2. Open your Terminal (macOS/Linux) or Command Prompt (Windows).
3. Pull a lightweight model (e.g., `llama3.2:1b` ~1.3 GB):
   ```bash
   ollama pull llama3.2:1b
   ```
4. Verify Ollama is running:
   - On macOS/Windows, Ollama runs automatically in the background menu bar.
   - Alternatively, start it manually in terminal:
     ```bash
     ollama serve
     ```

---

### Step 2: Clone & Install the Web App

1. Open your terminal and clone this repository:
   ```bash
   git clone https://github.com/TechTitans-Academy/my-chatgpt.git
   ```

2. Navigate into the project folder:
   ```bash
   cd my-chatgpt
   ```

3. Install project dependencies:
   ```bash
   npm install
   ```

---

### Step 3: Run the Local Development Server

1. Start the Vite development server:
   ```bash
   npm run dev
   ```

2. You will see output similar to:
   ```text
     VITE v8.3.0  ready in 200 ms

     ➜  Local:   http://localhost:5173/
     ➜  Network: use --host to expose
   ```

3. Open your browser and navigate to **`http://localhost:5173`**.

---

## 🚀 How to Use the App

1. **Select a Model**: Click the model dropdown at the top header and choose `llama3.2:1b`.
2. **Ask Questions**: Type your message in the text input box at the bottom and hit **Enter** or click the **Send** button.
3. **Pull New Models**: Click on the model dropdown and select **"Pull New Model..."** to download any Ollama model (e.g., `deepseek-r1:1.5b`, `mistral`, `phi3`).
4. **Manage Chats**: Use the sidebar to create **New Chats**, search existing conversations, or pin important threads.
5. **Export Data**: Click the download icon in the top header to export your entire chat history as a `.json` backup file.

---

## 🔒 Privacy & Network Statement

- **Inference is 100% Offline**: Text generation and chat conversations happen entirely on your computer's CPU/GPU.
- **No Remote Servers**: Prompts are never transmitted to external cloud APIs.
- **Internet Usage**: Internet connection is required **only** when downloading/pulling new model weights from Ollama library.

---

## 🎓 Educational Disclaimer

This project is created strictly for **educational, experimental, and learning purposes** to help students understand client-side web development, real-time API streaming, and local LLM integration using open-source software.

- **Independent Project**: This repository is an independent open-source learning project and is not affiliated with, sponsored by, or endorsed by OpenAI, Meta, or Ollama.
- **Trademarks & Attributions**: All product names, logos, and brands mentioned herein belong to their respective trademark owners and are used purely for descriptive, educational, and identification purposes.

