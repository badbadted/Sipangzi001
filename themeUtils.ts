import { Theme } from './themes';

// 獲取文字顏色類名
export const getTextColor = (theme: Theme): string => {
  switch (theme) {
    case 'cute': return 'text-gray-800';
    case 'tech': return 'text-slate-200';
    case 'dark': return 'text-gray-200';
    case 'light': return 'text-gray-900';
    default: return 'text-gray-800';
  }
};

// 獲取次要文字顏色類名
export const getTextSecondaryColor = (theme: Theme): string => {
  switch (theme) {
    case 'cute': return 'text-gray-500';
    case 'tech': return 'text-slate-400';
    case 'dark': return 'text-gray-400';
    case 'light': return 'text-gray-600';
    default: return 'text-gray-500';
  }
};

// 獲取主要顏色類名
export const getPrimaryColor = (theme: Theme): string => {
  switch (theme) {
    case 'cute': return 'text-pink-500';
    case 'tech': return 'text-cyan-400';
    case 'dark': return 'text-gray-400';
    case 'light': return 'text-gray-700';
    default: return 'text-pink-500';
  }
};

// 獲取背景顏色類名
export const getBackgroundColor = (theme: Theme): string => {
  switch (theme) {
    case 'cute': return 'bg-rose-50';
    case 'tech': return 'bg-slate-900';
    case 'dark': return 'bg-gray-900';
    case 'light': return 'bg-white';
    default: return 'bg-white';
  }
};

// 獲取卡片背景顏色類名
export const getCardBgColor = (theme: Theme): string => {
  switch (theme) {
    case 'cute': return 'bg-white';
    case 'tech': return 'bg-slate-800';
    case 'dark': return 'bg-gray-800';
    case 'light': return 'bg-white';
    default: return 'bg-white';
  }
};

// 獲取邊框顏色類名
export const getBorderColor = (theme: Theme): string => {
  switch (theme) {
    case 'cute': return 'border-pink-100';
    case 'tech': return 'border-slate-700';
    case 'dark': return 'border-gray-700';
    case 'light': return 'border-gray-200';
    default: return 'border-gray-200';
  }
};

// 判斷是否為深色主題
export const isDarkTheme = (theme: Theme): boolean => {
  return theme === 'tech' || theme === 'dark';
};

// 判斷是否為淺色主題
export const isLightTheme = (theme: Theme): boolean => {
  return theme === 'cute' || theme === 'light';
};
