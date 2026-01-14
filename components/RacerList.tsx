import React, { useState } from 'react';
import { Plus, User, Trash2 } from 'lucide-react';
import { Racer, AVATAR_COLORS } from '../types';

interface RacerListProps {
  racers: Racer[];
  selectedRacerId: string | null;
  onSelectRacer: (id: string) => void;
  onAddRacer: (name: string, color: string) => void;
  onDeleteRacer: (id: string) => void;
}

const RacerList: React.FC<RacerListProps> = ({ 
  racers, 
  selectedRacerId, 
  onSelectRacer, 
  onAddRacer,
  onDeleteRacer
}) => {
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
        <h2 className="text-lg font-bold text-gray-800">選擇選手</h2>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="text-sm text-indigo-600 font-medium flex items-center gap-1 active:opacity-70"
        >
          {isAdding ? '取消' : <><Plus size={16} /> 新增選手</>}
        </button>
      </div>

      {isAdding && (
        <div className="bg-white p-4 rounded-xl shadow-sm mb-4 border border-indigo-100 animate-fade-in-down">
          <label className="block text-sm font-medium text-gray-700 mb-2">選手姓名 / 暱稱</label>
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="例如: 小飛俠"
              className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
            <button 
              onClick={handleAdd}
              disabled={!newName.trim()}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium disabled:opacity-50 hover:bg-indigo-700 transition-colors"
            >
              建立
            </button>
          </div>
          <label className="block text-sm font-medium text-gray-700 mb-2">選擇代表色</label>
          <div className="flex flex-wrap gap-2">
            {AVATAR_COLORS.map(color => (
              <button
                key={color}
                onClick={() => setSelectedColor(color)}
                className={`w-8 h-8 rounded-full ${color} ${selectedColor === color ? 'ring-2 ring-offset-2 ring-indigo-600' : ''}`}
              />
            ))}
          </div>
        </div>
      )}

      {racers.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
          <p className="text-gray-500">還沒有選手，請先新增！</p>
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
                  selectedRacerId === racer.id ? 'ring-4 ring-indigo-200' : ''
                }`}>
                  {racer.name[0]}
                </div>
                <span className={`text-sm font-medium ${selectedRacerId === racer.id ? 'text-indigo-900' : 'text-gray-600'}`}>
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
