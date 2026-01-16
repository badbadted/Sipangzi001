import React, { useState, useRef, useEffect } from 'react';
import { Lock, X } from 'lucide-react';
import { Theme, themes } from '../themes';
import { getTextColor, getPrimaryColor } from '../themeUtils';

interface PasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerify: (password: string) => boolean;
  title?: string;
  theme: Theme;
}

const SUPER_PASSWORD = 'TED'; // 超級權限密碼

const PasswordModal: React.FC<PasswordModalProps> = ({ 
  isOpen, 
  onClose, 
  onVerify, 
  title = '請輸入密碼',
  theme 
}) => {
  const currentTheme = themes[theme] || themes['light'];
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // 檢查超級權限密碼
    if (password.toUpperCase() === SUPER_PASSWORD) {
      onVerify(password);
      setPassword('');
      onClose();
      return;
    }
    
    // 驗證4位數字密碼
    if (password.length !== 4 || !/^\d{4}$/.test(password)) {
      setError('密碼必須為4位數字');
      return;
    }
    
    if (onVerify(password)) {
      setPassword('');
      onClose();
    } else {
      setError('密碼錯誤，請重試');
      setPassword('');
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  };

  const handleClose = () => {
    setPassword('');
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className={`${currentTheme.styles.cardBg} rounded-2xl shadow-2xl border ${currentTheme.colors.border} w-full max-w-md p-6 animate-fade-in-down`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className={`text-xl font-bold flex items-center gap-2 ${getTextColor(theme)}`}>
            <Lock className={getPrimaryColor(theme)} size={20} />
            {title}
          </h3>
          <button
            onClick={handleClose}
            className={`${getTextColor(theme)} hover:opacity-70 transition-opacity`}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className={`block text-sm font-medium mb-2 ${getTextColor(theme)}`}>
              密碼（4位數字或超級權限密碼）
            </label>
            <input
              ref={inputRef}
              type="password"
              value={password}
              onChange={(e) => {
                const val = e.target.value;
                // 允許數字和字母（用於超級密碼）
                if (/^[0-9A-Za-z]*$/.test(val) && val.length <= 4) {
                  setPassword(val.toUpperCase());
                  setError('');
                }
              }}
              placeholder="輸入密碼"
              className={`w-full text-2xl font-mono font-bold p-4 rounded-xl border outline-none text-center tracking-widest ${
                theme === 'cute' ? 'text-gray-800 bg-gray-50 border-gray-200 focus:ring-4 focus:ring-pink-100 focus:border-pink-500' :
                theme === 'tech' ? 'text-slate-200 bg-slate-800 border-slate-600 focus:ring-4 focus:ring-cyan-500/20 focus:border-cyan-500' :
                theme === 'dark' ? 'text-gray-200 bg-gray-800 border-gray-600 focus:ring-4 focus:ring-gray-500/20 focus:border-gray-500' :
                'text-gray-900 bg-gray-50 border-gray-300 focus:ring-4 focus:ring-gray-200 focus:border-gray-700'
              }`}
              maxLength={4}
              autoFocus
            />
            {error && (
              <p className="text-red-500 text-sm mt-2">{error}</p>
            )}
            <p className={`text-xs mt-2 ${getTextColor(theme)} opacity-70`}>
              提示：輸入4位數字密碼，或使用超級權限密碼
            </p>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleClose}
              className={`flex-1 py-3 px-4 rounded-xl font-medium transition-colors ${
                theme === 'cute' ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' :
                theme === 'tech' ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' :
                theme === 'dark' ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' :
                'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              取消
            </button>
            <button
              type="submit"
              disabled={password.length === 0}
              className={`flex-1 py-3 px-4 rounded-xl font-bold text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                theme === 'cute' ? 'bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600' :
                theme === 'tech' ? 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700' :
                theme === 'dark' ? 'bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700' :
                'bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-800 hover:to-gray-900'
              }`}
            >
              確認
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PasswordModal;
