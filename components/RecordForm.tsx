import React, { useState, useEffect } from 'react';
import { Timer, Save } from 'lucide-react';
import { Distance } from '../types';

interface RecordFormProps {
  racerId: string | null;
  onAddRecord: (distance: Distance, time: number) => void;
}

const DISTANCES: Distance[] = [10, 30, 50];

const RecordForm: React.FC<RecordFormProps> = ({ racerId, onAddRecord }) => {
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
    <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-100">
      <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <Timer className="text-indigo-500" />
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
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 transform scale-105' 
                    : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
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
              className="w-full text-4xl font-mono font-bold text-gray-800 p-4 bg-gray-50 rounded-xl border border-gray-200 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none text-center"
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
          className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 rounded-xl text-lg font-bold shadow-lg shadow-indigo-200 hover:shadow-xl hover:from-indigo-700 hover:to-purple-700 active:transform active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save size={20} />
          儲存紀錄
        </button>
      </form>
    </div>
  );
};

export default RecordForm;