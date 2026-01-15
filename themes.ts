export type Theme = 'cute' | 'tech';

export interface ThemeConfig {
  name: string;
  icon: string;
  colors: {
    primary: string;
    primaryLight: string;
    primaryDark: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    shadow: string;
  };
  styles: {
    headerBg: string;
    headerIcon: string;
    buttonPrimary: string;
    buttonHover: string;
    cardBg: string;
    navActive: string;
    navInactive: string;
  };
}

export const themes: Record<Theme, ThemeConfig> = {
  cute: {
    name: '可愛動物風',
    icon: '🐾',
    colors: {
      primary: 'pink-500',
      primaryLight: 'pink-100',
      primaryDark: 'pink-600',
      secondary: 'purple-400',
      accent: 'rose-400',
      background: 'rose-50',
      surface: 'white',
      text: 'gray-800',
      textSecondary: 'gray-600',
      border: 'pink-100',
      shadow: 'pink-200',
    },
    styles: {
      headerBg: 'bg-gradient-to-r from-pink-400 to-rose-400',
      headerIcon: 'bg-pink-500',
      buttonPrimary: 'bg-pink-500 hover:bg-pink-600',
      buttonHover: 'hover:bg-pink-50',
      cardBg: 'bg-white',
      navActive: 'text-pink-600',
      navInactive: 'text-gray-400 hover:text-pink-400',
    },
  },
  tech: {
    name: '科技競速風',
    icon: '⚡',
    colors: {
      primary: 'cyan-500',
      primaryLight: 'cyan-100',
      primaryDark: 'cyan-600',
      secondary: 'blue-500',
      accent: 'indigo-500',
      background: 'slate-900',
      surface: 'slate-800',
      text: 'slate-100',
      textSecondary: 'slate-400',
      border: 'slate-700',
      shadow: 'cyan-500',
    },
    styles: {
      headerBg: 'bg-gradient-to-r from-cyan-500 to-blue-600',
      headerIcon: 'bg-cyan-500',
      buttonPrimary: 'bg-cyan-500 hover:bg-cyan-600',
      buttonHover: 'hover:bg-slate-700',
      cardBg: 'bg-slate-800',
      navActive: 'text-cyan-400',
      navInactive: 'text-slate-500 hover:text-cyan-400',
    },
  },
};
