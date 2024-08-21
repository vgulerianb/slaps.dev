import React, { useState, useRef } from "react";
import Editor, { Monaco } from "@monaco-editor/react";
import { RotateCcw, Copy, Check } from "lucide-react";
import type { CodeFile } from "react-exe";

interface CodeEditorProps {
  code: string | CodeFile[];
  onCodeChange: (code: string | CodeFile[]) => void;
  onReset: () => void;
}

const CodeEditor: React.FC<CodeEditorProps> = ({
  code,
  onCodeChange,
  onReset,
}) => {
  const [activeFile, setActiveFile] = useState(0);
  const [copied, setCopied] = useState(false);
  const editorRef = useRef<any>(null);

  const isMultiFile = Array.isArray(code);
  const files = isMultiFile
    ? code
    : [{ name: "App.tsx", content: code as string }];
  const currentFile = files[activeFile];

  const handleEditorDidMount = (editor: any, monaco: Monaco) => {
    editorRef.current = editor;

    // Configure TypeScript
    monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
      target: monaco.languages.typescript.ScriptTarget.Latest,
      allowNonTsExtensions: true,
      moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
      module: monaco.languages.typescript.ModuleKind.CommonJS,
      noEmit: true,
      esModuleInterop: true,
      jsx: monaco.languages.typescript.JsxEmit.React,
      reactNamespace: "React",
      allowJs: true,
      typeRoots: ["node_modules/@types"],
    });

    // Add React types
    monaco.languages.typescript.typescriptDefaults.addExtraLib(
      `declare module 'react' {
        export = React;
        export as namespace React;
        namespace React {
          interface Component<P = {}, S = {}> {}
          class Component<P, S> {
            constructor(props: P);
            render(): React.ReactNode;
            setState(state: Partial<S>): void;
            state: S;
            props: P;
          }
          interface FunctionComponent<P = {}> {
            (props: P): React.ReactElement | null;
          }
          type FC<P = {}> = FunctionComponent<P>;
          interface ReactElement {}
          interface ReactNode {}
          namespace JSX {
            interface Element extends React.ReactElement {}
          }
        }
        declare var React: typeof React;
      }`,
      "file:///node_modules/@types/react/index.d.ts"
    );
  };

  const handleCodeChange = (value: string | undefined) => {
    if (value === undefined) return;

    if (isMultiFile) {
      const updatedFiles = files.map((file, index) =>
        index === activeFile ? { ...file, content: value } : file
      );
      onCodeChange(updatedFiles);
    } else {
      onCodeChange(value);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(currentFile.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy code:", err);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 pb-0 pt-1">
        <div className="flex overflow-x-auto">
          {files.map((file, index) => (
            <button
              key={index}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap flex items-center gap-2 ${index === activeFile
                ? "border-blue-500 text-blue-700 bg-white"
                : "border-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-100/50"
                }`}
              onClick={() => setActiveFile(index)}
            >
              {file.name}
              {file.isEntry && <span className="px-1.5 py-0.5 rounded-md bg-blue-50 text-blue-600 text-[10px] uppercase font-bold tracking-wider">entry</span>}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1 px-3">
          <button
            onClick={handleCopy}
            className="p-1.5 text-gray-500 hover:text-gray-900 transition-colors rounded-md hover:bg-gray-200"
            title="Copy code"
          >
            {copied ? <Check size={16} className="text-green-600" /> : <Copy size={16} />}
          </button>
          <button
            onClick={onReset}
            className="p-1.5 text-gray-500 hover:text-gray-900 transition-colors rounded-md hover:bg-gray-200"
            title="Reset code"
          >
            <RotateCcw size={16} />
          </button>
        </div>
      </div>
      <div className="flex-1 min-h-0 relative">
        <Editor
          height="100%"
          language="typescript"
          value={currentFile.content}
          onChange={handleCodeChange}
          onMount={handleEditorDidMount}
          theme="light"
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: "on",
            renderWhitespace: "selection",
            automaticLayout: true,
            wordWrap: "on",
            scrollBeyondLastLine: false,
            smoothScrolling: true,
            cursorBlinking: "blink",
            folding: true,
            lineDecorationsWidth: 10,
            lineNumbersMinChars: 3,
            glyphMargin: false,
          }}
        />
      </div>
    </div>
  );
};

export default CodeEditor;
