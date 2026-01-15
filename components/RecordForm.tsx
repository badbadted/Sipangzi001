import React, { useState, useEffect } from 'react';
import { Timer, Save } from 'lucide-react';
import { Distance } from '../types';
import { Theme, themes } from '../themes';
import { getTextColor, getPrimaryColor } from '../themeUtils';

interface RecordFormProps {
  racerId: string | null;
  onAddRecord: (distance: Distance, time: number) => void;
  theme: Theme;
}

const DISTANCES: Distance[] = [10, 30, 50];

const RecordForm: React.FC<RecordFormProps> = ({ racerId, onAddRecord, theme }) => {
  const currentTheme = themes[theme];
  const [distance, setDistance] = useState<Distance>(30);
  const [timeStr, setTimeStr] = useState('');

  // Load last used time from localStorage on mount
  useEffect(() => {
    const lastTime = localStorage.getItem('pb_last_time');
    if (lastTime) {
      setTimeStr(lastTime);
    }
  }, []);

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    
    // Allow clearing the input
    if (val === '') {
      setTimeStr('');
      return;
    }

    // Regex check:
    // ^\d* matches integer part
    // \.? matches optional decimal point
    // \d{0,2}$ matches at most 2 decimal digits
    const regex = /^\d*\.?\d{0,2}$/;

    if (regex.test(val)) {
      const num = parseFloat(val);
      
      // Range check: 0 to 10 seconds
      // Allow valid numbers within range, or intermediate states like "0."
      if (!isNaN(num)) {
        if (num >= 0 && num <= 10) {
          setTimeStr(val);
        }
      } else if (val === '.') {
        // Automatically handle starting with a decimal point as "0."
        setTimeStr('0.');
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const time = parseFloat(timeStr);
    if (racerId && time > 0) {
      onAddRecord(distance, time);
      // Save valid time to localStorage for persistence
      localStorage.setItem('pb_last_time', timeStr);
      // Note: We do NOT clear setTimeStr('') here, so the value remains for the next entry
    }
  };

  if (!racerId) return null;

  return (
    <div className={`${currentTheme.styles.cardBg} rounded-2xl shadow-lg p-6 mb-8 border ${currentTheme.colors.border}`}>
      <h2 className={`text-xl font-bold mb-6 flex items-center gap-2 ${getTextColor(theme)}`}>
        <Timer className={getPrimaryColor(theme)} />
        輸入成績
      </h2>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-500 mb-3">測驗距離</label>
          <div className="grid grid-cols-3 gap-3">
            {DISTANCES.map(d => (
              <button
                key={d}
                type="button"
                onClick={() => setDistance(d)}
                className={`py-3 px-2 rounded-xl text-lg font-bold transition-all duration-200 ${
                  distance === d 
                    ? theme === 'cute' ? 'bg-pink-500 text-white shadow-lg shadow-pink-200 transform scale-105' :
                      theme === 'tech' ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/30 transform scale-105' :
                      theme === 'dark' ? 'bg-gray-700 text-white shadow-lg shadow-gray-900/30 transform scale-105' :
                      'bg-gray-700 text-white shadow-lg shadow-gray-300 transform scale-105'
                    : theme === 'cute' ? 'bg-gray-100 text-gray-400 hover:bg-gray-200' :
                      theme === 'tech' ? 'bg-slate-700 text-slate-400 hover:bg-slate-600' :
                      theme === 'dark' ? 'bg-gray-700 text-gray-400 hover:bg-gray-600' :
                      'bg-gray-100 text-gray-400 hover:bg-gray-200'
                }`}
              >
                {d} 米
              </button>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-500 mb-2">秒數 (0-10s)</label>
          <div className="relative">
            <input
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0"
              max="10"
              value={timeStr}
              onChange={handleTimeChange}
              placeholder="0.00"
              className={`w-full text-4xl font-mono font-bold p-4 rounded-xl border outline-none text-center ${
                theme === 'cute' ? 'text-gray-800 bg-gray-50 border-gray-200 focus:ring-4 focus:ring-pink-100 focus:border-pink-500' :
                theme === 'tech' ? 'text-slate-200 bg-slate-800 border-slate-600 focus:ring-4 focus:ring-cyan-500/20 focus:border-cyan-500' :
                theme === 'dark' ? 'text-gray-200 bg-gray-800 border-gray-600 focus:ring-4 focus:ring-gray-500/20 focus:border-gray-500' :
                'text-gray-900 bg-gray-50 border-gray-300 focus:ring-4 focus:ring-gray-200 focus:border-gray-700'
              }`}
              required
            />
            <span className="absolute right-6 top-1/2 transform -translate-y-1/2 text-gray-400 font-medium">
              sec
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-2 text-center">
             限制：0 ~ 10 秒，最多兩位小數
          </p>
        </div>

        <button
          type="submit"
          disabled={!timeStr || parseFloat(timeStr) === 0}
          className={`w-full text-white py-4 rounded-xl text-lg font-bold shadow-lg active:transform active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${
            theme === 'cute' ? 'bg-gradient-to-r from-pink-500 to-rose-500 shadow-pink-200 hover:shadow-xl hover:from-pink-600 hover:to-rose-600' :
            theme === 'tech' ? 'bg-gradient-to-r from-cyan-500 to-blue-600 shadow-cyan-500/30 hover:shadow-xl hover:from-cyan-600 hover:to-blue-700' :
            theme === 'dark' ? 'bg-gradient-to-r from-gray-700 to-gray-800 shadow-gray-900/30 hover:shadow-xl hover:from-gray-600 hover:to-gray-700' :
            'bg-gradient-to-r from-gray-700 to-gray-800 shadow-gray-300 hover:shadow-xl hover:from-gray-800 hover:to-gray-900'
          }`}
        >
          <Save size={20} />
          儲存紀錄
        </button>
      </form>
    </div>
  );
};

export default RecordForm;