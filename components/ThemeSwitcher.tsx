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
          currentTheme === 'cute' ? 'bg-pink-100 text-pink-700 hover:bg-pink-200' :
          currentTheme === 'tech' ? 'bg-slate-700 text-cyan-300 hover:bg-slate-600' :
          currentTheme === 'dark' ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' :
          'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
        title="切換主題"
      >
        <Palette size={18} />
        <span className="text-sm font-medium hidden sm:inline">{themes[currentTheme].icon}</span>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className={`absolute right-0 top-full mt-2 w-48 rounded-xl shadow-lg border z-50 overflow-hidden animate-fade-in-down ${
            currentTheme === 'cute' ? 'bg-white border-gray-200' :
            currentTheme === 'tech' ? 'bg-slate-800 border-slate-700' :
            currentTheme === 'dark' ? 'bg-gray-800 border-gray-700' :
            'bg-white border-gray-200'
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
                    ? themes[themeKey].styles.buttonPrimary + ' text-white'
                    : currentTheme === 'cute' || currentTheme === 'light'
                      ? 'hover:bg-gray-50 text-gray-700'
                      : 'hover:bg-slate-700 text-slate-300'
                }`}
              >
                <span className="text-xl">{themes[themeKey].icon}</span>
                <span className="font-medium">{themes[themeKey].name}</span>
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
