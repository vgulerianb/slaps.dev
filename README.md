# React-EXE Playground

An interactive playground showcasing React-EXE's capabilities with live code editing, multiple examples, and real-time preview.

## ✨ Features

- **🎮 Interactive Playground**: Live code editing with Monaco Editor
- **📱 Responsive Design**: Works on desktop and mobile devices
- **🎨 Multiple View Modes**: Code-only, split view, or preview-only
- **📦 External Dependencies**: Support for libraries like ECharts and Framer Motion
- **📄 Multi-file Components**: Complex applications with multiple files
- **🔧 Real-time Preview**: Instant feedback as you type
- **📱 Modern UI**: Beautiful design with smooth animations

## 🚀 Getting Started

**Important:** Before installing dependencies in the examples folder, you need to build the parent `react-exe` package first.

### Option 1: Use the setup script (Recommended)

From the examples directory:

```bash
cd examples
npm run setup
```

This will:

1. Install parent package dependencies
2. Build the parent package (`dist` folder)
3. Install examples dependencies

### Option 2: Manual setup

1. First, build the parent package:

```bash
# From the root directory
npm install
npm run build
```

2. Then install examples dependencies:

```bash
cd examples
npm install
```

3. Start the development server:

```bash
npm run dev
```

4. Open your browser and navigate to the URL shown in the terminal (usually `http://localhost:5173`)

## 📚 Examples Included

### 🎯 Getting Started

- **Welcome to React-EXE**: Interactive introduction with live editing demo

### 🎨 UI Components

- **Interactive Card**: Beautiful card component with hover effects and animations

### 📊 Advanced

- **Data Visualization**: Interactive charts with ECharts and real-time data updates

### 🏗️ Applications

- **Todo App with Hooks**: Complete todo application showcasing React hooks and state management

### 🏗️ Advanced

- **Multi-File Dashboard**: Complex dashboard built with multiple components and files

## 🎮 How to Use

1. **Select an Example**: Choose from the sidebar examples organized by category
2. **View Modes**: Switch between Code, Split, or Preview views using the header buttons
3. **Edit Code**: Click on the code editor to modify the code in real-time
4. **Run Code**: Use the Run button to execute your changes (or they run automatically)
5. **Reset**: Use the Reset button to restore the original example code

## 🛠️ Development

### Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build for production
- `npm run preview` - Preview the production build
- `npm run setup` - Setup script for first-time installation

### Tech Stack

- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **Monaco Editor** - Code editor with TypeScript support
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Beautiful icons
- **React-EXE** - The library being demonstrated

## 🔧 Configuration

The examples are configured with:

- TypeScript support in Monaco Editor
- React and Tailwind CSS intellisense
- Custom theme (dark mode for code editor)
- External library support (ECharts, Framer Motion)

## 📝 Notes

- This examples folder is excluded from the npm package bundle (see `.npmignore` in the root directory)
- Examples demonstrate various React-EXE features including external dependencies and multi-file support
- All examples include proper TypeScript types and error handling

## 📚 Product documentation (slaps.dev)

The site serves Markdown for **agentpad** and **stubfetch** at:

- `https://slaps.dev/docs/agentpad` and `/docs/agentpad/...` (sources in `src/site-docs/execpad/`)
- `https://slaps.dev/docs/stubfetch` and `/docs/stubfetch/...` (sources in `src/site-docs/ghost-env/`)

Legacy URLs **`/execpad`** and **`/ghost-env`** (product pages) redirect to **`/agentpad`** and **`/stubfetch`**. Legacy doc URLs **`/docs/execpad`** and **`/docs/ghost-env`** redirect to **`/docs/agentpad`** and **`/docs/stubfetch`**.

Content is rendered with [Markdoc](https://markdoc.dev/). The **agentpad** and **stubfetch** package sources are **not** in this repo—clone [execpad](https://github.com/vgulerianb/execpad) and [ghost-env](https://github.com/vgulerianb/ghost-env) as `execpad/` and `ghost-env/` next to `slaps.dev` (or inside it, ignored by git). Then sync package `docs/` into the site:

```bash
npm run sync-docs
```

**Package tests (Node + Python)** — same layout as above; then:

```bash
npm run test:packages
```

Runs Vitest and pytest for whichever clones are present (`./execpad` or `../execpad`, same for `ghost-env`).

To register another product, add markdown under `src/site-docs/<id>/`, then extend `src/documentation/docRegistry.ts` and `App.tsx` routes already cover `/:product/docs/:slug?`.

## 🤝 Contributing

Feel free to add more examples or improve the existing ones! The examples are a great way to showcase React-EXE's capabilities.
