import React, { useState } from 'react';
import { Plus, User, Trash2 } from 'lucide-react';
import { Racer, AVATAR_COLORS } from '../types';
import { Theme, themes } from '../themes';

interface RacerListProps {
  racers: Racer[];
  selectedRacerId: string | null;
  onSelectRacer: (id: string) => void;
  onAddRacer: (name: string, color: string) => void;
  onDeleteRacer: (id: string) => void;
  theme: Theme;
}

const RacerList: React.FC<RacerListProps> = ({ 
  racers, 
  selectedRacerId, 
  onSelectRacer, 
  onAddRacer,
  onDeleteRacer,
  theme
}) => {
  const currentTheme = themes[theme];
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [selectedColor, setSelectedColor] = useState(AVATAR_COLORS[0]);

  const handleAdd = () => {
    if (newName.trim()) {
      onAddRacer(newName.trim(), selectedColor);
      setNewName('');
      setIsAdding(false);
      // Pick a random color for next time
      setSelectedColor(AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)]);
    }
  };

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className={`text-lg font-bold ${
          theme === 'cute' ? 'text-gray-800' : 'text-slate-200'
        }`}>
          選擇選手
        </h2>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className={`text-sm font-medium flex items-center gap-1 active:opacity-70 ${
            theme === 'cute' 
              ? 'text-pink-600 hover:text-pink-700' 
              : 'text-cyan-400 hover:text-cyan-300'
          }`}
        >
          {isAdding ? '取消' : <><Plus size={16} /> 新增選手</>}
        </button>
      </div>

      {isAdding && (
        <div className={`${currentTheme.styles.cardBg} p-4 rounded-xl shadow-sm mb-4 border ${currentTheme.colors.border} animate-fade-in-down`}>
          <label className={`block text-sm font-bold mb-2 ${
            theme === 'cute' ? 'text-gray-700' : 'text-slate-300'
          }`}>
            選手姓名 / 暱稱
          </label>
          <div className="flex flex-col gap-3 mb-4">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="例如: 小飛俠"
              className={`w-full p-3 border rounded-xl focus:ring-2 focus:outline-none ${
                theme === 'cute'
                  ? 'border-gray-300 focus:ring-pink-500 text-gray-800 bg-white'
                  : 'border-slate-600 focus:ring-cyan-500 text-slate-200 bg-slate-700'
              }`}
            />
            <button 
              onClick={handleAdd}
              disabled={!newName.trim()}
              className={`w-full ${currentTheme.styles.buttonPrimary} text-white px-4 py-3 rounded-xl font-bold disabled:opacity-50 transition-colors flex items-center justify-center gap-2 shadow-sm`}
            >
              <Plus size={18} />
              建立選手
            </button>
          </div>
          <label className={`block text-sm font-bold mb-2 ${
            theme === 'cute' ? 'text-gray-700' : 'text-slate-300'
          }`}>
            選擇代表色
          </label>
          <div className="flex flex-wrap gap-2">
            {AVATAR_COLORS.map(color => (
              <button
                key={color}
                onClick={() => setSelectedColor(color)}
                className={`w-8 h-8 rounded-full ${color} ${
                  selectedColor === color 
                    ? theme === 'cute'
                      ? 'ring-2 ring-offset-2 ring-pink-600'
                      : 'ring-2 ring-offset-2 ring-cyan-500'
                    : ''
                }`}
              />
            ))}
          </div>
        </div>
      )}

      {racers.length === 0 ? (
        <div className={`text-center py-8 rounded-xl border-2 border-dashed ${
          theme === 'cute'
            ? 'bg-pink-50 border-pink-200'
            : 'bg-slate-800 border-slate-700'
        }`}>
          <p className={theme === 'cute' ? 'text-gray-500' : 'text-slate-400'}>
            還沒有選手，請先新增！
          </p>
        </div>
      ) : (
        <div className="flex overflow-x-auto gap-4 pb-4 no-scrollbar items-center">
          {racers.map(racer => (
            <div 
              key={racer.id}
              className={`flex-shrink-0 relative group`}
            >
              <button
                onClick={() => onSelectRacer(racer.id)}
                className={`flex flex-col items-center space-y-2 transition-all duration-200 ${
                  selectedRacerId === racer.id ? 'transform scale-110' : 'opacity-70 hover:opacity-100'
                }`}
              >
                <div className={`w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-bold shadow-md ${racer.avatarColor} ${
                  selectedRacerId === racer.id 
                    ? theme === 'cute'
                      ? 'ring-4 ring-pink-200'
                      : 'ring-4 ring-cyan-500/30'
                    : ''
                }`}>
                  {racer.name[0]}
                </div>
                <span className={`text-sm font-medium ${
                  selectedRacerId === racer.id 
                    ? theme === 'cute' ? 'text-pink-700' : 'text-cyan-300'
                    : theme === 'cute' ? 'text-gray-600' : 'text-slate-400'
                }`}>
                  {racer.name}
                </span>
              </button>
              {selectedRacerId === racer.id && (
                <button
                    onClick={(e) => { e.stopPropagation(); if(confirm(`確定要刪除 ${racer.name} 嗎？所有紀錄也會消失。`)) onDeleteRacer(racer.id); }}
                    className="absolute -top-1 -right-1 bg-white text-red-500 rounded-full p-1 shadow-sm border border-gray-100 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="刪除選手"
                >
                    <Trash2 size={12} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RacerList;