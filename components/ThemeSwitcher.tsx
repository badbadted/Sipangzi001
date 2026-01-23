import React from 'react';
import { Palette } from 'lucide-react';
import { Theme, themes } from '../themes';

interface ThemeSwitcherProps {
  currentTheme: Theme;
  onThemeChange: (theme: Theme) => void;
}

const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({ currentTheme, onThemeChange }) => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
          currentTheme === 'light' ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' :
          currentTheme === 'vibrant' ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200 border-2 border-gray-900' :
          currentTheme === 'pixel' ? 'bg-black text-white hover:bg-gray-800 border-2 border-white' :
          currentTheme === 'space' ? 'bg-indigo-900/80 text-cyan-300 hover:bg-indigo-800/80 backdrop-blur-md border border-cyan-500/30' :
          currentTheme === 'playground' ? 'bg-red-100 text-red-700 hover:bg-red-200' :
          'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
        title="切換主題"
      >
        <Palette size={18} />
        <span className="text-sm font-medium hidden sm:inline">{(themes[currentTheme] || themes['light']).icon}</span>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className={`absolute right-0 top-full mt-2 w-48 rounded-xl shadow-lg border z-50 overflow-hidden animate-fade-in-down ${
            currentTheme === 'light' || currentTheme === 'vibrant' || currentTheme === 'pixel' || currentTheme === 'playground'
              ? 'bg-white border-gray-200'
              : 'bg-indigo-900/90 backdrop-blur-xl border border-cyan-500/30'
          }`}>
            {(Object.keys(themes) as Theme[]).map((themeKey) => (
              <button
                key={themeKey}
                onClick={() => {
                  onThemeChange(themeKey);
                  setIsOpen(false);
                }}
                className={`w-full px-4 py-3 text-left flex items-center gap-3 transition-colors ${
                  currentTheme === themeKey
                    ? (themes[themeKey] || themes['light']).styles.buttonPrimary + ' text-white'
                    : currentTheme === 'space'
                      ? 'hover:bg-indigo-800/50 text-cyan-300'
                      : 'hover:bg-gray-50 text-gray-700'
                }`}
              >
                <span className="text-xl">{(themes[themeKey] || themes['light']).icon}</span>
                <span className="font-medium">{(themes[themeKey] || themes['light']).name}</span>
                {currentTheme === themeKey && (
                  <span className="ml-auto text-sm">✓</span>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default ThemeSwitcher;
