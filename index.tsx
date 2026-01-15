import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// 初始化主題（在 App 渲染前設置）
const savedTheme = localStorage.getItem('app-theme');
const initialTheme = (savedTheme === 'cute' || savedTheme === 'tech') ? savedTheme : 'cute';
document.documentElement.setAttribute('data-theme', initialTheme);

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);