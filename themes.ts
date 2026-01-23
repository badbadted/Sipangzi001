export type Theme = 'light' | 'vibrant' | 'pixel' | 'space' | 'playground';

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
  // 黑白風格
  light: {
    name: '黑白風格',
    icon: '⚫',
    colors: {
      primary: 'gray-100',
      primaryLight: 'white',
      primaryDark: 'gray-200',
      secondary: 'gray-300',
      accent: 'gray-400',
      background: 'white',
      surface: 'gray-50',
      text: 'gray-900',
      textSecondary: 'gray-600',
      border: 'gray-200',
      shadow: 'gray-300',
    },
    styles: {
      headerBg: 'bg-gradient-to-r from-gray-100 to-gray-200',
      headerIcon: 'bg-gray-300',
      buttonPrimary: 'bg-gray-700 hover:bg-gray-800',
      buttonHover: 'hover:bg-gray-100',
      cardBg: 'bg-white',
      navActive: 'text-gray-900',
      navInactive: 'text-gray-500 hover:text-gray-700',
    },
  },
  // 鮮豔冒險風 (Vibrant Hero)
  vibrant: {
    name: '鮮豔冒險風',
    icon: '🌈',
    colors: {
      primary: 'yellow-400',
      primaryLight: 'yellow-100',
      primaryDark: 'yellow-600',
      secondary: 'green-500',
      accent: 'blue-400',
      background: 'yellow-50',
      surface: 'white',
      text: 'gray-900',
      textSecondary: 'gray-700',
      border: 'gray-900',
      shadow: 'yellow-200',
    },
    styles: {
      headerBg: 'bg-gradient-to-r from-yellow-400 via-green-400 to-blue-400',
      headerIcon: 'bg-yellow-500',
      buttonPrimary: 'bg-yellow-400 hover:bg-yellow-500 border-4 border-gray-900',
      buttonHover: 'hover:bg-yellow-100',
      cardBg: 'bg-white border-4 border-gray-900',
      navActive: 'text-yellow-600 font-black',
      navInactive: 'text-gray-600 hover:text-yellow-500',
    },
  },
  // 復古像素 RPG 風 (Pixel Art)
  pixel: {
    name: '復古像素風',
    icon: '🎮',
    colors: {
      primary: 'gray-800',
      primaryLight: 'gray-700',
      primaryDark: 'black',
      secondary: 'gray-600',
      accent: 'gray-500',
      background: 'gray-100',
      surface: 'white',
      text: 'black',
      textSecondary: 'gray-700',
      border: 'black',
      shadow: 'black',
    },
    styles: {
      headerBg: 'bg-black border-4 border-white',
      headerIcon: 'bg-gray-800',
      buttonPrimary: 'bg-black hover:bg-gray-800 border-4 border-white',
      buttonHover: 'hover:bg-gray-200',
      cardBg: 'bg-white border-4 border-black',
      navActive: 'text-black font-black',
      navInactive: 'text-gray-600 hover:text-black',
    },
  },
  // 懸浮太空科幻風 (Floating Space)
  space: {
    name: '太空科幻風',
    icon: '🚀',
    colors: {
      primary: 'cyan-400',
      primaryLight: 'cyan-300',
      primaryDark: 'cyan-600',
      secondary: 'purple-500',
      accent: 'blue-500',
      background: 'indigo-950',
      surface: 'indigo-900/80',
      text: 'cyan-100',
      textSecondary: 'cyan-300',
      border: 'cyan-500/50',
      shadow: 'cyan-500/30',
    },
    styles: {
      headerBg: 'bg-gradient-to-r from-indigo-900/90 via-purple-900/90 to-indigo-900/90 backdrop-blur-xl border border-cyan-500/30',
      headerIcon: 'bg-cyan-500/20',
      buttonPrimary: 'bg-cyan-500/20 hover:bg-cyan-500/30 backdrop-blur-md border border-cyan-400/50 shadow-lg shadow-cyan-500/20',
      buttonHover: 'hover:bg-indigo-800/50',
      cardBg: 'bg-indigo-900/60 backdrop-blur-xl border border-cyan-500/30 shadow-lg shadow-cyan-500/10',
      navActive: 'text-cyan-300 font-bold',
      navInactive: 'text-cyan-500/70 hover:text-cyan-300',
    },
  },
  // 繽紛經典樂園風 (Fun Playground)
  playground: {
    name: '經典樂園風',
    icon: '🎪',
    colors: {
      primary: 'red-500',
      primaryLight: 'red-100',
      primaryDark: 'red-700',
      secondary: 'blue-500',
      accent: 'yellow-400',
      background: 'red-50',
      surface: 'white',
      text: 'gray-900',
      textSecondary: 'gray-700',
      border: 'gray-300',
      shadow: 'red-200',
    },
    styles: {
      headerBg: 'bg-gradient-to-r from-red-500 to-blue-500',
      headerIcon: 'bg-red-600',
      buttonPrimary: 'bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-lg shadow-red-300/50',
      buttonHover: 'hover:bg-red-100',
      cardBg: 'bg-white shadow-lg shadow-red-200/50',
      navActive: 'text-red-600 font-bold',
      navInactive: 'text-gray-600 hover:text-red-500',
    },
  },
};
