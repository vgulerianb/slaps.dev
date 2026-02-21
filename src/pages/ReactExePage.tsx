import { useState, useCallback, useMemo } from "react";
import { CodeExecutor } from "react-exe";
import * as echarts from "echarts";
import CodeEditor from "../components/CodeEditor";
import Editor from "@monaco-editor/react";
import {
  Code,
  RotateCcw,
  Shield,
  ArrowRight,
  ArrowUpRight,
  Copy,
} from "lucide-react";
import { usePageMeta } from "../hooks/usePageMeta";
import "../App.css";

interface Example {
  id: string;
  title: string;
  description: string;
  code: string | any[];
  config?: any;
  category: string;
}

const examples: Example[] = [
  {
    id: "welcome",
    title: "Animated Hero Section",
    description:
      "A stunning animated hero with glassmorphism and particle effects",
    category: "Getting Started",
    code: `export default function AnimatedHero() {
  const [mousePosition, setMousePosition] = React.useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = React.useState(false);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePosition({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100
    });
  };

  return (
    <div 
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900"
      onMouseMove={handleMouseMove}
    >
      {/* Animated background gradient */}
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          background: \`radial-gradient(circle at \${mousePosition.x}% \${mousePosition.y}%, rgba(168, 85, 247, 0.4) 0%, transparent 50%)\`
        }}
      />

      {/* Floating particles */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-purple-400 rounded-full animate-pulse"
            style={{
              left: \`\${Math.random() * 100}%\`,
              top: \`\${Math.random() * 100}%\`,
              animationDelay: \`\${Math.random() * 2}s\`,
              animationDuration: \`\${2 + Math.random() * 3}s\`
            }}
          />
        ))}
      </div>

      {/* Main content */}
      <div className="relative z-10 text-center px-6 max-w-5xl">
        <div 
          className="backdrop-blur-xl bg-white/10 rounded-3xl p-12 border border-white/20 shadow-2xl transform transition-all duration-500"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          style={{
            transform: isHovered ? 'scale(1.02) translateY(-10px)' : 'scale(1)',
            boxShadow: isHovered ? '0 30px 60px rgba(168, 85, 247, 0.3)' : '0 20px 40px rgba(0, 0, 0, 0.3)'
          }}
        >
          <h1 className="text-7xl font-black mb-6 text-white">
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent animate-pulse">
              React-EXE
            </span>
          </h1>
          <p className="text-2xl text-purple-200 mb-8 font-light">
            Build. Execute. Experience.
          </p>
          <p className="text-lg text-purple-300 mb-8 max-w-2xl mx-auto leading-relaxed">
            Execute React components on the fly with external dependencies, custom styling, and TypeScript support. Perfect for creating live code previews, documentation, or interactive code playgrounds.
          </p>
          
          {/* Key Features */}
          <div className="mb-10 space-y-4 max-w-2xl mx-auto">
            <div className="flex items-start gap-4 text-left">
              <div className="text-2xl flex-shrink-0">🚀</div>
              <div>
                <h3 className="text-white font-semibold mb-1">Execute React Components</h3>
                <p className="text-purple-300 text-sm">Run React components from string code with full TypeScript support</p>
              </div>
            </div>
            <div className="flex items-start gap-4 text-left">
              <div className="text-2xl flex-shrink-0">📦</div>
              <div>
                <h3 className="text-white font-semibold mb-1">External Dependencies</h3>
                <p className="text-purple-300 text-sm">Support for external libraries like ECharts, Framer Motion, and more</p>
              </div>
            </div>
            <div className="flex items-start gap-4 text-left">
              <div className="text-2xl flex-shrink-0">🎨</div>
              <div>
                <h3 className="text-white font-semibold mb-1">Tailwind CSS Support</h3>
                <p className="text-purple-300 text-sm">Built-in Tailwind CSS support for beautiful, responsive designs</p>
              </div>
            </div>
            <div className="flex items-start gap-4 text-left">
              <div className="text-2xl flex-shrink-0">🔒</div>
              <div>
                <h3 className="text-white font-semibold mb-1">Security First</h3>
                <p className="text-purple-300 text-sm">Built-in security checks and error boundary protection</p>
              </div>
            </div>
            <div className="flex items-start gap-4 text-left">
              <div className="text-2xl flex-shrink-0">📄</div>
              <div>
                <h3 className="text-white font-semibold mb-1">Multi-File Support</h3>
                <p className="text-purple-300 text-sm">Build complex applications with multiple component files</p>
              </div>
            </div>
          </div>

          {/* GitHub Star Button */}
          <div className="flex justify-center mb-8">
            <a 
              href="https://github.com/vgulerianb/react-exe" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-sm text-white rounded-xl font-semibold text-base border-2 border-white/30 hover:bg-white/20 transition-all hover:scale-105 shadow-lg"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="#fbbf24" stroke="#fbbf24" strokeWidth="2">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
              <span>Star us on GitHub</span>
            </a>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 pt-8 border-t border-white/20">
            <div>
              <div className="text-4xl font-black text-white mb-2">∞</div>
              <div className="text-purple-300 text-sm">Possibilities</div>
            </div>
            <div>
              <div className="text-4xl font-black text-white mb-2">⚡</div>
              <div className="text-purple-300 text-sm">Instant Preview</div>
            </div>
            <div>
              <div className="text-4xl font-black text-white mb-2">🎨</div>
              <div className="text-purple-300 text-sm">Beautiful UI</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}`,
    config: {
      enableTailwind: true,
    },
  },
  {
    id: "3d-card",
    title: "3D Product Card",
    description: "An immersive 3D card with tilt effects and premium design",
    category: "UI Components",
    code: `export default function ProductCard3D() {
  const [rotation, setRotation] = React.useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = React.useState(false);
  const [likes, setLikes] = React.useState(1284);
  const [isLiked, setIsLiked] = React.useState(false);

  const handleMouseMove = (e) => {
    if (!isHovered) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientY - rect.top - rect.height / 2) / 10;
    const y = (e.clientX - rect.left - rect.width / 2) / 10;
    setRotation({ x: -x, y });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotation({ x: 0, y: 0 });
  };

  const toggleLike = () => {
    setLikes(prev => isLiked ? prev - 1 : prev + 1);
    setIsLiked(!isLiked);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div
        className="relative"
        style={{ perspective: '1000px' }}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={handleMouseLeave}
      >
        <div
          className="relative w-96 bg-gradient-to-br from-purple-600 to-blue-600 rounded-3xl shadow-2xl transition-all duration-300"
          style={{
            transform: \`rotateX(\${rotation.x}deg) rotateY(\${rotation.y}deg) scale(\${isHovered ? 1.05 : 1})\`,
            boxShadow: isHovered 
              ? '0 30px 60px rgba(168, 85, 247, 0.5)' 
              : '0 20px 40px rgba(0, 0, 0, 0.4)'
          }}
        >
          {/* Shine effect */}
          <div 
            className="absolute inset-0 rounded-3xl opacity-0 transition-opacity duration-300"
            style={{
              background: \`linear-gradient(\${rotation.y + 90}deg, transparent 40%, rgba(255,255,255,0.1) 50%, transparent 60%)\`,
              opacity: isHovered ? 1 : 0
            }}
          />

          {/* Content */}
          <div className="relative p-8">
            <div className="flex justify-between items-start mb-6">
              <span className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white text-xs font-bold">
                NEW
              </span>
              <button
                onClick={toggleLike}
                className="p-2 bg-white/10 backdrop-blur-sm rounded-full hover:bg-white/20 transition-all"
              >
                <span className="text-2xl">{isLiked ? '❤️' : '🤍'}</span>
              </button>
            </div>

            <div className="mb-8">
              <h3 className="text-3xl font-black text-white mb-2">
                Premium Design
              </h3>
              <p className="text-purple-200 text-sm">
                3D Interactive Experience
              </p>
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                  <span className="text-xl">🎨</span>
                </div>
                <div>
                  <div className="text-white font-semibold text-sm">Beautiful Design</div>
                  <div className="text-purple-200 text-xs">Crafted with care</div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                  <span className="text-xl">⚡</span>
                </div>
                <div>
                  <div className="text-white font-semibold text-sm">Interactive</div>
                  <div className="text-purple-200 text-xs">Hover & explore</div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-6 border-t border-white/20">
              <div className="flex items-center space-x-2">
                <span className="text-white/60 text-sm">Likes</span>
                <span className="text-white font-bold">{likes.toLocaleString()}</span>
              </div>
              <button className="px-6 py-3 bg-white text-purple-600 rounded-xl font-bold text-sm hover:bg-purple-50 transition-all shadow-lg">
                View Details →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}`,
    config: {
      enableTailwind: true,
    },
  },
  {
    id: "glassmorphism-dashboard",
    title: "Glassmorphism Dashboard",
    description: "Modern dashboard with glassmorphism design and live stats",
    category: "UI Components",
    code: `export default function GlassDashboard() {
  const [activeTab, setActiveTab] = React.useState('overview');
  const [stats, setStats] = React.useState([
    { label: 'Revenue', value: '$45,231', change: '+12.5%', trend: 'up' },
    { label: 'Users', value: '12,483', change: '+8.2%', trend: 'up' },
    { label: 'Orders', value: '3,842', change: '-2.1%', trend: 'down' },
    { label: 'Conversion', value: '3.24%', change: '+0.5%', trend: 'up' },
  ]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 p-8">
      {/* Floating orbs background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative max-w-7xl mx-auto">
        {/* Header */}
        <div className="backdrop-blur-xl bg-white/10 rounded-3xl p-8 mb-8 border border-white/20 shadow-2xl">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-4xl font-black text-white mb-2">Dashboard</h1>
              <p className="text-white/70">Welcome back! Here's what's happening today.</p>
            </div>
            <button className="px-6 py-3 bg-white/20 backdrop-blur-sm text-white rounded-2xl font-semibold hover:bg-white/30 transition-all border border-white/30">
              Export Data
            </button>
          </div>

          {/* Tabs */}
          <div className="flex space-x-2">
            {['overview', 'analytics', 'reports'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={\`px-6 py-3 rounded-xl font-semibold capitalize transition-all \${
                  activeTab === tab
                    ? 'bg-white/30 text-white shadow-lg'
                    : 'bg-white/10 text-white/70 hover:bg-white/20'
                }\`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, idx) => (
            <div
              key={idx}
              className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20 shadow-xl hover:bg-white/20 transition-all group"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="text-white/70 text-sm font-medium">{stat.label}</div>
                <span className={\`text-2xl group-hover:scale-110 transition-transform\`}>
                  {stat.trend === 'up' ? '📈' : '📉'}
                </span>
              </div>
              <div className="text-3xl font-black text-white mb-2">{stat.value}</div>
              <div className={\`text-sm font-semibold \${
                stat.trend === 'up' ? 'text-green-300' : 'text-red-300'
              }\`}>
                {stat.change} from last month
              </div>
            </div>
          ))}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chart */}
          <div className="lg:col-span-2 backdrop-blur-xl bg-white/10 rounded-2xl p-8 border border-white/20 shadow-xl">
            <h3 className="text-2xl font-black text-white mb-6">Revenue Trend</h3>
            <div className="h-64 flex items-end justify-around gap-4">
              {[65, 75, 60, 85, 70, 90, 80].map((height, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center">
                  <div 
                    className="w-full bg-gradient-to-t from-white/80 to-white/40 rounded-t-lg transition-all hover:from-white hover:to-white/60"
                    style={{ height: \`\${height}%\` }}
                  />
                  <span className="text-white/60 text-xs mt-2">Day {idx + 1}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Activity */}
          <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-8 border border-white/20 shadow-xl">
            <h3 className="text-2xl font-black text-white mb-6">Activity</h3>
            <div className="space-y-4">
              {[
                { icon: '🎯', text: 'New goal achieved', time: '2m ago' },
                { icon: '👥', text: '12 new users', time: '15m ago' },
                { icon: '💰', text: 'Payment received', time: '1h ago' },
                { icon: '📊', text: 'Report generated', time: '3h ago' },
              ].map((activity, idx) => (
                <div key={idx} className="flex items-center space-x-4 group">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center group-hover:bg-white/30 transition-all">
                    <span className="text-2xl">{activity.icon}</span>
                  </div>
                  <div className="flex-1">
                    <div className="text-white font-semibold text-sm">{activity.text}</div>
                    <div className="text-white/60 text-xs">{activity.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}`,
    config: {
      enableTailwind: true,
    },
  },
  {
    id: "data-visualization",
    title: "Data Visualization",
    description: "Interactive charts with ECharts and real-time data updates",
    category: "Advanced",
    code: `import * as echarts from 'echarts';
import { useEffect, useRef } from 'react';

export default function DataVisualization() {
  const chartRef = useRef(null);
  const [data, setData] = React.useState([120, 200, 150, 80, 70, 110, 130]);

  useEffect(() => {
    if (chartRef.current) {
      const chart = echarts.init(chartRef.current);

      const option = {
        title: {
          text: 'Monthly Sales Data',
          left: 'center',
          textStyle: { color: '#333' }
        },
        tooltip: {
          trigger: 'axis',
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          borderColor: '#777',
          textStyle: { color: '#fff' }
        },
        xAxis: {
          type: 'category',
          data: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
          axisLine: { lineStyle: { color: '#666' } }
        },
        yAxis: {
          type: 'value',
          axisLine: { lineStyle: { color: '#666' } }
        },
        series: [{
          name: 'Sales',
          type: 'line',
          data: data,
          smooth: true,
          symbol: 'circle',
          symbolSize: 8,
          lineStyle: {
            color: '#667eea',
            width: 3
          },
          itemStyle: {
            color: '#667eea'
          },
          areaStyle: {
            color: 'rgba(102, 126, 234, 0.1)'
          }
        }],
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        }
      };

      chart.setOption(option);

      return () => {
        chart.dispose();
      };
    }
  }, [data]);

  const randomizeData = () => {
    setData(data.map(() => Math.floor(Math.random() * 200) + 50));
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Sales Analytics Dashboard
            </h2>
            <p className="text-gray-600">
              Interactive chart powered by ECharts
            </p>
          </div>
          <button
            onClick={randomizeData}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Randomize Data
          </button>
        </div>

        <div
          ref={chartRef}
          style={{ height: '400px', width: '100%' }}
          className="bg-gray-50 rounded-lg"
        />

        <div className="mt-6 grid grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-blue-600">
              {Math.max(...data)}
            </div>
            <div className="text-sm text-blue-800">Peak Sales</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-green-600">
              {(data.reduce((a, b) => a + b, 0) / data.length).toFixed(0)}
            </div>
            <div className="text-sm text-green-800">Average</div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-purple-600">
              {data.length}
            </div>
            <div className="text-sm text-purple-800">Data Points</div>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-orange-600">
              📊
            </div>
            <div className="text-sm text-orange-800">Live Chart</div>
          </div>
        </div>
      </div>
    </div>
  );
}`,
    config: {
      dependencies: {
        echarts: echarts,
      },
      enableTailwind: true,
    },
  },
  {
    id: "todo-app",
    title: "Todo App with Hooks",
    description:
      "A complete todo application showcasing React hooks and state management",
    category: "Applications",
    code: `export default function TodoApp() {
  const [todos, setTodos] = React.useState([
    { id: 1, text: 'Learn React-EXE', completed: true },
    { id: 2, text: 'Build amazing components', completed: false },
    { id: 3, text: 'Share with the world', completed: false }
  ]);
  const [inputValue, setInputValue] = React.useState('');
  const [filter, setFilter] = React.useState('all');

  const addTodo = () => {
    if (inputValue.trim()) {
      setTodos([...todos, {
        id: Date.now(),
        text: inputValue,
        completed: false
      }]);
      setInputValue('');
    }
  };

  const toggleTodo = (id) => {
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  const deleteTodo = (id) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  const filteredTodos = todos.filter(todo => {
    if (filter === 'active') return !todo.completed;
    if (filter === 'completed') return todo.completed;
    return true;
  });

  const completedCount = todos.filter(todo => todo.completed).length;

  return (
    <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Todo App</h1>
        <p className="text-blue-100">
          {completedCount} of {todos.length} tasks completed
        </p>
      </div>

      <div className="p-6">
        <div className="flex gap-2 mb-6">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addTodo()}
            placeholder="Add a new todo..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={addTodo}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Add
          </button>
        </div>

        <div className="flex gap-2 mb-4">
          {['all', 'active', 'completed'].map(filterType => (
            <button
              key={filterType}
              onClick={() => setFilter(filterType)}
              className={\`px-3 py-1 rounded-full text-sm font-medium capitalize transition-colors \${
                filter === filterType
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }\`}
            >
              {filterType}
            </button>
          ))}
        </div>

        <div className="space-y-2">
          {filteredTodos.map(todo => (
            <div
              key={todo.id}
              className={\`flex items-center gap-3 p-3 rounded-lg transition-all \${
                todo.completed ? 'bg-green-50 border border-green-200' : 'bg-gray-50'
              }\`}
            >
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={() => toggleTodo(todo.id)}
                className="w-5 h-5 text-green-600 rounded focus:ring-green-500"
              />
              <span className={\`flex-1 \${
                todo.completed
                  ? 'line-through text-gray-500'
                  : 'text-gray-800'
              }\`}>
                {todo.text}
              </span>
              <button
                onClick={() => deleteTodo(todo.id)}
                className="text-red-500 hover:text-red-700 p-1"
              >
                🗑️
              </button>
            </div>
          ))}
        </div>

        {filteredTodos.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">📝</div>
            <p>No todos found</p>
          </div>
        )}
      </div>
    </div>
  );
}`,
    config: {
      enableTailwind: true,
    },
  },
  {
    id: "multi-file-dashboard",
    title: "Multi-File Dashboard",
    description: "A complex dashboard built with multiple components and files",
    category: "Advanced",
    code: [
      {
        name: "App.tsx",
        content: `import React from 'react';
import Header from '../components/Header';
import StatsGrid from '../components/StatsGrid';
import ChartPanel from '../components/ChartPanel';
import RecentActivity from '../components/RecentActivity';

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <StatsGrid />
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
          <ChartPanel />
          <RecentActivity />
        </div>
      </main>
    </div>
  );
}`,
        isEntry: true,
      },
      {
        name: "components/Header.tsx",
        content: `import React from 'react';

export default function Header() {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="bg-blue-600 text-white p-2 rounded-lg mr-3">
              📊
            </div>
            <h1 className="text-xl font-semibold text-gray-900">
              React-EXE Dashboard
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-500">
              Live Demo
            </span>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    </header>
  );
}`,
      },
      {
        name: "components/StatsGrid.tsx",
        content: `import React from 'react';

const stats = [
  { name: 'Total Users', value: '2,847', change: '+12%', icon: '👥' },
  { name: 'Revenue', value: '$54,239', change: '+8%', icon: '💰' },
  { name: 'Orders', value: '1,429', change: '+23%', icon: '📦' },
  { name: 'Conversion', value: '3.24%', change: '+2%', icon: '📈' },
];

export default function StatsGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat) => (
        <div key={stat.name} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="text-2xl mr-3">{stat.icon}</div>
            <div>
              <p className="text-sm font-medium text-gray-600">{stat.name}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-sm text-green-600 font-medium">{stat.change}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}`,
      },
      {
        name: "components/ChartPanel.tsx",
        content: `import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';

export default function ChartPanel() {
  const chartRef = useRef(null);

  useEffect(() => {
    if (chartRef.current) {
      const chart = echarts.init(chartRef.current);

      const option = {
        title: {
          text: 'Weekly Performance',
          left: 'center',
          textStyle: { fontSize: 16 }
        },
        tooltip: { trigger: 'axis' },
        xAxis: {
          type: 'category',
          data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
        },
        yAxis: { type: 'value' },
        series: [{
          name: 'Performance',
          type: 'bar',
          data: [120, 200, 150, 80, 70, 110, 130],
          itemStyle: { color: '#3b82f6' }
        }]
      };

      chart.setOption(option);
      return () => chart.dispose();
    }
  }, []);

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Performance Chart</h3>
      <div ref={chartRef} style={{ height: '300px' }} />
    </div>
  );
}`,
      },
      {
        name: "components/RecentActivity.tsx",
        content: `import React from 'react';

const activities = [
  { user: 'John Doe', action: 'created a new project', time: '2 minutes ago' },
  { user: 'Jane Smith', action: 'updated dashboard', time: '5 minutes ago' },
  { user: 'Mike Johnson', action: 'completed task', time: '10 minutes ago' },
  { user: 'Sarah Wilson', action: 'joined the team', time: '1 hour ago' },
];

export default function RecentActivity() {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
      <div className="space-y-4">
        {activities.map((activity, index) => (
          <div key={index} className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-medium text-blue-600">
              {activity.user.split(' ').map(n => n[0]).join('')}
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-900">
                <span className="font-medium">{activity.user}</span> {activity.action}
              </p>
              <p className="text-xs text-gray-500">{activity.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}`,
      },
    ],
    config: {
      dependencies: {
        echarts: echarts,
      },
      enableTailwind: true,
    },
  },
  {
    id: "auto-resolve-demo",
    title: "Auto CDN Resolution",
    description:
      "Demonstrates automatic package resolution from CDN without manual dependencies",
    category: "Advanced",
    code: `import { useState } from 'react';
import { format, addDays, differenceInDays } from 'date-fns';

export default function AutoResolveDemo() {
  const [count, setCount] = useState(0);
  const [targetDate, setTargetDate] = useState(addDays(new Date(), 7));

  const handleClick = () => {
    setCount(count + 1);
    setTargetDate(addDays(new Date(), count + 8));
  };

  const today = new Date();
  const formattedToday = format(today, 'EEEE, MMMM do, yyyy');
  const formattedTarget = format(targetDate, 'MMMM do, yyyy');
  const daysUntil = differenceInDays(targetDate, today);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="bg-white rounded-2xl shadow-xl p-8 transform transition-all hover:scale-[1.02]">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Auto CDN Resolution Demo
          </h1>
          <p className="text-gray-600 mb-6">
            This example uses <code className="bg-purple-100 text-purple-800 px-2 py-1 rounded font-mono text-sm">date-fns</code> which is automatically resolved from CDN.
          </p>
          
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4">
            <p className="text-sm text-blue-800">
              <strong>✨ No manual dependencies!</strong> The package is fetched automatically from CDN when needed.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="text-gray-600 font-medium">Auto-Resolve Feature</div>
              <div className="text-green-600 font-bold">✓ Enabled</div>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="text-gray-600 font-medium">CDN Source</div>
              <div className="text-blue-600 font-bold">jsDelivr</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 transform transition-all hover:scale-[1.02]">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Interactive Counter & Date Calculator
          </h2>
          
          <div className="text-center mb-6">
            <div className="text-6xl font-bold text-purple-600 mb-4 transition-transform transform hover:scale-110">
              {count}
            </div>
            <button
              onClick={handleClick}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95"
            >
              Increment & Add Days
            </button>
          </div>

          <div className="mt-6 p-4 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg">
            <p className="text-sm text-gray-700 text-center">
              Each click adds a day to the target date!
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 transform transition-all hover:scale-[1.02]">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Date Formatting with date-fns
          </h2>
          
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">Today's Date</div>
              <div className="text-lg font-bold text-gray-900">{formattedToday}</div>
            </div>
            
            <div className="p-4 bg-purple-50 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">Target Date</div>
              <div className="text-lg font-bold text-gray-900">{formattedTarget}</div>
            </div>
            
            <div className="p-4 bg-pink-50 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">Days Until Target</div>
              <div className="text-3xl font-bold text-pink-600">{daysUntil} days</div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-50 to-teal-50 rounded-2xl shadow-xl p-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-3">
            🎉 How It Works
          </h3>
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-start">
              <span className="text-green-500 mr-2">1.</span>
              <span>React-EXE detects missing import: <code className="bg-white px-2 py-1 rounded text-sm">date-fns</code></span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">2.</span>
              <span>Automatically fetches from CDN (jsDelivr/unpkg)</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">3.</span>
              <span>Loads and makes available to your component</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">4.</span>
              <span>All without any manual configuration! 🚀</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}`,
    config: {
      enableTailwind: true,
      // Note: No dependencies provided - date-fns will be
      // automatically resolved from CDN thanks to autoResolvePackage (default: true)
    },
  },
];

function ReactExePage() {
  usePageMeta({
    title: "React-EXE | Interactive UI Engine & Playground",
    description:
      "Render React components from raw code strings natively in the browser. Ships with CDN resolution, multi-file support, and iframe execution sandboxing.",
  });

  const defaultExample =
    examples.find((ex) => ex.id === "3d-card") || examples[0];

  const [selectedExample, setSelectedExample] = useState<string>(
    defaultExample.id,
  );
  const [currentCode, setCurrentCode] = useState<string | any[]>(
    defaultExample.code,
  );
  const [refreshKey, setRefreshKey] = useState(0);
  const [useSandbox, setUseSandbox] = useState(true);
  const [showCodeModal, setShowCodeModal] = useState(false);

  const currentExample = examples.find((ex) => ex.id === selectedExample);

  const handleExampleChange = useCallback((exampleId: string) => {
    const example = examples.find((ex) => ex.id === exampleId);
    if (example) {
      setSelectedExample(exampleId);
      setCurrentCode(example.code);
    }
  }, []);

  const handleRefresh = useCallback(() => {
    setRefreshKey((prev) => prev + 1);
  }, []);

  const getExampleCode = useCallback(() => {
    if (!currentExample) return "";

    const configString = JSON.stringify(
      { ...(currentExample.config || {}), sandbox: useSandbox },
      null,
      2,
    );

    return `import React from 'react';
import { CodeExecutor } from 'react-exe';
${
  currentExample.config?.dependencies
    ? Object.keys(currentExample.config.dependencies)
        .map(
          (dep) =>
            `import * as ${dep.replace(/[^a-zA-Z0-9]/g, "_")} from '${dep}';`,
        )
        .join("\n")
    : ""
}

function Example() {
  ${
    Array.isArray(currentExample.code)
      ? `const files = ${JSON.stringify(currentExample.code, null, 2)};`
      : `const code = \`${currentExample.code}\`;`
  }

  return (
    <CodeExecutor
      code={${Array.isArray(currentExample.code) ? "files" : "code"}}
      config={${configString}}
    />
  );
}

export default Example;`;
  }, [currentExample, useSandbox]);

  const handleCodeChange = useCallback((code: string | any[]) => {
    setCurrentCode(code);
  }, []);

  const handleReset = useCallback(() => {
    const example = examples.find((ex) => ex.id === selectedExample);
    if (example) {
      setCurrentCode(example.code);
    }
  }, [selectedExample]);

  const categories = Array.from(new Set(examples.map((ex) => ex.category)));

  const previewConfig = useMemo(() => {
    const baseConfig = currentExample?.config || {};
    return {
      ...baseConfig,
      sandbox: useSandbox,
    };
  }, [currentExample, useSandbox]);

  const executorKey = useMemo(
    () =>
      `${selectedExample}-${refreshKey}-${useSandbox ? "sandbox" : "direct"}`,
    [selectedExample, refreshKey, useSandbox],
  );

  const handleToggleSandbox = useCallback(() => {
    setUseSandbox((prev) => !prev);
    setRefreshKey((prev) => prev + 1);
  }, []);

  return (
    <div className="react-exe-page">
      {/* ── Product hero ── */}
      <section className="product-hero">
        <div>
          <p className="eyebrow">UI Runtime</p>
          <h1>React-EXE</h1>
          <p className="lede">
            Execute React components from raw code strings in the browser.
            Auto-resolve npm packages from CDN, render inside a secure iframe
            sandbox, and style with Tailwind — all with zero build step.
          </p>
          <code className="install-cmd">npm install react-exe</code>
          <div className="product-hero__actions">
            <a
              href="https://www.npmjs.com/package/react-exe"
              target="_blank"
              rel="noreferrer"
              className="btn-primary"
            >
              View on npm <ArrowRight size={16} />
            </a>
            <a
              href="https://github.com/vgulerianb/react-exe"
              target="_blank"
              rel="noreferrer"
              className="btn-secondary"
            >
              GitHub <ArrowUpRight size={14} />
            </a>
          </div>
          <div className="hero-stats">
            <div>
              <div className="stat-value">6K+</div>
              <div className="stat-label">Weekly downloads</div>
            </div>
            <div>
              <div className="stat-value">TS</div>
              <div className="stat-label">TypeScript native</div>
            </div>
            <div>
              <div className="stat-value">MIT</div>
              <div className="stat-label">Licensed</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Native Playground Section ── */}
      <section className="native-playground-section section">
        <div className="section-header mb-8">
          <p className="eyebrow">Playground</p>
          <h2 className="text-3xl font-bold mb-4">Try it live</h2>
          <p className="text-gray-600 max-w-2xl">
            Select an example below to see how React-EXE renders and executes
            React components on the fly without a build step.
          </p>
        </div>

        <main className="native-workspace grid grid-cols-1 lg:grid-cols-2 gap-8">
          {currentExample && (
            <>
              {/* Left Column: Code Editor */}
              <div className="native-code-column flex flex-col gap-4">
                <div className="native-controls flex items-center justify-between bg-gray-50 p-4 rounded-xl border border-gray-200">
                  <div className="flex items-center gap-3">
                    <label
                      htmlFor="example-select"
                      className="text-sm font-semibold text-gray-700"
                    >
                      Example:
                    </label>
                    <select
                      id="example-select"
                      className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2 transition-colors"
                      value={selectedExample}
                      onChange={(e) => handleExampleChange(e.target.value)}
                    >
                      {categories.map((category) => (
                        <optgroup key={category} label={category}>
                          {examples
                            .filter((ex) => ex.category === category)
                            .map((ex) => (
                              <option key={ex.id} value={ex.id}>
                                {ex.title}
                              </option>
                            ))}
                        </optgroup>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleRefresh}
                      className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-200 rounded-lg transition-colors"
                      title="Refresh Code"
                    >
                      <RotateCcw size={16} />
                    </button>
                    <button
                      onClick={() => setShowCodeModal(true)}
                      className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-200 rounded-lg transition-colors"
                      title="View Integration Code"
                    >
                      <Code size={16} />
                    </button>
                  </div>
                </div>

                <div
                  className="native-code-panel rounded-xl overflow-hidden border border-gray-200 shadow-sm bg-white sticky top-[88px] z-10"
                  style={{ height: "calc(100vh - 120px)" }}
                >
                  <CodeEditor
                    code={currentCode}
                    onCodeChange={handleCodeChange}
                    onReset={handleReset}
                  />
                </div>
              </div>

              {/* Right Column: Preview Pane */}
              <div className="native-preview-column flex flex-col gap-4">
                <div className="native-preview-controls flex justify-end">
                  <button
                    onClick={handleToggleSandbox}
                    className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                      useSandbox
                        ? "bg-green-50 text-green-700 border border-green-200 hover:bg-green-100"
                        : "bg-red-50 text-red-700 border border-red-200 hover:bg-red-100"
                    }`}
                  >
                    <Shield size={14} />
                    {useSandbox ? "Sandbox Enabled" : "Sandbox Disabled"}
                  </button>
                </div>

                <div className="native-preview-content w-full flex-1 min-h-[600px] h-full">
                  <CodeExecutor
                    key={executorKey}
                    code={currentCode}
                    config={previewConfig}
                  />
                </div>
              </div>
            </>
          )}
        </main>
      </section>

      {/* Code Modal */}
      {showCodeModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={() => setShowCodeModal(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/80">
              <h2 className="text-lg font-semibold text-gray-900">
                How to Use This Example
              </h2>
              <button
                className="p-2 text-gray-400 hover:text-gray-900 transition-colors rounded-lg hover:bg-gray-200"
                onClick={() => setShowCodeModal(false)}
              >
                ✕
              </button>
            </div>
            <div className="p-6 flex-1 overflow-y-auto flex flex-col gap-4">
              <p className="text-gray-600 text-sm">
                Copy this code to use the example in your React application with
                react-exe:
              </p>
              <div className="border border-gray-200 rounded-xl overflow-hidden bg-gray-50 flex-1">
                <Editor
                  height="400px"
                  language="typescript"
                  value={getExampleCode()}
                  theme="light"
                  options={{
                    readOnly: true,
                    minimap: { enabled: false },
                    fontSize: 14,
                    lineNumbers: "on",
                    wordWrap: "on",
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                  }}
                />
              </div>
              <div className="flex justify-end pt-2">
                <button
                  className="flex items-center gap-2 px-6 py-2.5 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors shadow-sm"
                  onClick={() => {
                    navigator.clipboard.writeText(getExampleCode());
                  }}
                >
                  <Copy size={16} />
                  Copy to Clipboard
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ReactExePage;
