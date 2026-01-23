import { Theme } from './themes';

// 獲取文字顏色類名
export const getTextColor = (theme: Theme): string => {
  switch (theme) {
    case 'light': return 'text-gray-900';
    case 'vibrant': return 'text-gray-900';
    case 'pixel': return 'text-black';
    case 'space': return 'text-cyan-100';
    case 'playground': return 'text-gray-900';
    default: return 'text-gray-900';
  }
};

// 獲取次要文字顏色類名
export const getTextSecondaryColor = (theme: Theme): string => {
  switch (theme) {
    case 'light': return 'text-gray-600';
    case 'vibrant': return 'text-gray-700';
    case 'pixel': return 'text-gray-700';
    case 'space': return 'text-cyan-300';
    case 'playground': return 'text-gray-700';
    default: return 'text-gray-600';
  }
};

// 獲取主要顏色類名
export const getPrimaryColor = (theme: Theme): string => {
  switch (theme) {
    case 'light': return 'text-gray-700';
    case 'vibrant': return 'text-yellow-500';
    case 'pixel': return 'text-black';
    case 'space': return 'text-cyan-400';
    case 'playground': return 'text-red-500';
    default: return 'text-gray-700';
  }
};

// 獲取背景顏色類名
export const getBackgroundColor = (theme: Theme): string => {
  switch (theme) {
    case 'light': return 'bg-white';
    case 'vibrant': return 'bg-yellow-50';
    case 'pixel': return 'bg-gray-100';
    case 'space': return 'bg-indigo-950';
    case 'playground': return 'bg-red-50';
    default: return 'bg-white';
  }
};

// 獲取卡片背景顏色類名
export const getCardBgColor = (theme: Theme): string => {
  switch (theme) {
    case 'light': return 'bg-white';
    case 'vibrant': return 'bg-white';
    case 'pixel': return 'bg-white';
    case 'space': return 'bg-indigo-900/60';
    case 'playground': return 'bg-white';
    default: return 'bg-white';
  }
};

// 獲取邊框顏色類名
export const getBorderColor = (theme: Theme): string => {
  switch (theme) {
    case 'light': return 'border-gray-200';
    case 'vibrant': return 'border-gray-900';
    case 'pixel': return 'border-black';
    case 'space': return 'border-cyan-500/50';
    case 'playground': return 'border-gray-300';
    default: return 'border-gray-200';
  }
};

// 判斷是否為深色主題
export const isDarkTheme = (theme: Theme): boolean => {
  return theme === 'space';
};

// 判斷是否為淺色主題
export const isLightTheme = (theme: Theme): boolean => {
  return theme === 'light' || theme === 'vibrant' || theme === 'pixel' || theme === 'playground';
};
