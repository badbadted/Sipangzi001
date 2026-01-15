import React, { useState, useRef } from 'react';
import { Plus, User, Trash2, Upload, X } from 'lucide-react';
import { Racer, AVATAR_COLORS } from '../types';
import { Theme, themes } from '../themes';
import { getTextColor, getTextSecondaryColor, getPrimaryColor, getCardBgColor, getBorderColor } from '../themeUtils';

interface RacerManagementProps {
  racers: Racer[];
  selectedRacerId: string | null;
  onSelectRacer: (id: string) => void;
  onAddRacer: (name: string, color: string, avatar?: string) => void;
  onDeleteRacer: (id: string) => void;
  theme: Theme;
}

const RacerManagement: React.FC<RacerManagementProps> = ({ 
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
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // 檢查文件類型
      if (!file.type.startsWith('image/')) {
        alert('請選擇圖片檔案');
        return;
      }
      
      // 檢查文件大小（限制 2MB）
      if (file.size > 2 * 1024 * 1024) {
        alert('圖片大小不能超過 2MB');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveAvatar = () => {
    setAvatarPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleAdd = () => {
    if (newName.trim()) {
      onAddRacer(newName.trim(), selectedColor, avatarPreview || undefined);
      setNewName('');
      setAvatarPreview(null);
      setIsAdding(false);
      // Pick a random color for next time
      setSelectedColor(AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)]);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className={`text-xl font-bold ${getTextColor(theme)}`}>
          選手管理
        </h2>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className={`text-sm font-medium flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            theme === 'cute' ? 'bg-pink-100 text-pink-700 hover:bg-pink-200' :
            theme === 'tech' ? 'bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30' :
            theme === 'dark' ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' :
            'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {isAdding ? <><X size={16} /> 取消</> : <><Plus size={16} /> 新增選手</>}
        </button>
      </div>

      {isAdding && (
        <div className={`${currentTheme.styles.cardBg} p-6 rounded-xl shadow-lg border ${currentTheme.colors.border} animate-fade-in-down space-y-4`}>
          <div>
            <label className={`block text-sm font-bold mb-2 ${getTextColor(theme)}`}>
              選手姓名 / 暱稱
            </label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="例如: 小飛俠"
              className={`w-full p-3 border rounded-xl focus:ring-2 focus:outline-none ${
                theme === 'cute'
                  ? 'border-gray-300 focus:ring-pink-500 text-gray-800 bg-white'
                  : theme === 'tech'
                  ? 'border-slate-600 focus:ring-cyan-500 text-slate-200 bg-slate-700'
                  : theme === 'dark'
                  ? 'border-gray-600 focus:ring-gray-500 text-gray-200 bg-gray-800'
                  : 'border-gray-300 focus:ring-gray-500 text-gray-900 bg-white'
              }`}
            />
          </div>

          <div>
            <label className={`block text-sm font-bold mb-2 ${getTextColor(theme)}`}>
              大頭貼（選填）
            </label>
            <div className="space-y-3">
              {avatarPreview ? (
                <div className="relative inline-block">
                  <img 
                    src={avatarPreview} 
                    alt="預覽" 
                    className="w-24 h-24 rounded-full object-cover border-2 border-gray-300"
                  />
                  <button
                    onClick={handleRemoveAvatar}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                    title="移除圖片"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <div className={`w-24 h-24 rounded-full flex items-center justify-center border-2 border-dashed ${
                  theme === 'cute' ? 'border-pink-300 bg-pink-50' :
                  theme === 'tech' ? 'border-cyan-500/30 bg-slate-800' :
                  theme === 'dark' ? 'border-gray-600 bg-gray-800' :
                  'border-gray-300 bg-gray-50'
                }`}>
                  <User size={32} className={getTextSecondaryColor(theme)} />
                </div>
              )}
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="avatar-upload"
                />
                <label
                  htmlFor="avatar-upload"
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer transition-colors ${
                    theme === 'cute' ? 'bg-pink-100 text-pink-700 hover:bg-pink-200' :
                    theme === 'tech' ? 'bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30' :
                    theme === 'dark' ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' :
                    'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Upload size={16} />
                  <span className="text-sm font-medium">選擇圖片</span>
                </label>
                <p className={`text-xs mt-1 ${getTextSecondaryColor(theme)}`}>
                  支援 JPG、PNG，最大 2MB
                </p>
              </div>
            </div>
          </div>

          <div>
            <label className={`block text-sm font-bold mb-2 ${getTextColor(theme)}`}>
              選擇代表色
            </label>
            <div className="flex flex-wrap gap-2">
              {AVATAR_COLORS.map(color => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  className={`w-10 h-10 rounded-full ${color} transition-transform ${
                    selectedColor === color 
                      ? theme === 'cute'
                        ? 'ring-2 ring-offset-2 ring-pink-600 scale-110'
                        : theme === 'tech'
                        ? 'ring-2 ring-offset-2 ring-cyan-500 scale-110'
                        : theme === 'dark'
                        ? 'ring-2 ring-offset-2 ring-gray-400 scale-110'
                        : 'ring-2 ring-offset-2 ring-gray-700 scale-110'
                      : 'hover:scale-105'
                  }`}
                />
              ))}
            </div>
          </div>

          <button 
            onClick={handleAdd}
            disabled={!newName.trim()}
            className={`w-full ${currentTheme.styles.buttonPrimary} text-white px-4 py-3 rounded-xl font-bold disabled:opacity-50 transition-colors flex items-center justify-center gap-2 shadow-sm`}
          >
            <Plus size={18} />
            建立選手
          </button>
        </div>
      )}

      {racers.length === 0 ? (
        <div className={`text-center py-12 rounded-xl border-2 border-dashed ${
          theme === 'cute' ? 'bg-pink-50 border-pink-200' :
          theme === 'tech' ? 'bg-slate-800 border-slate-700' :
          theme === 'dark' ? 'bg-gray-800 border-gray-700' :
          'bg-gray-50 border-gray-200'
        }`}>
          <User size={48} className={`mx-auto mb-4 ${getTextSecondaryColor(theme)}`} />
          <p className={getTextSecondaryColor(theme)}>
            還沒有選手，請先新增！
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {racers.map(racer => (
            <div 
              key={racer.id}
              className={`${currentTheme.styles.cardBg} p-4 rounded-xl shadow-sm border ${currentTheme.colors.border} transition-all ${
                selectedRacerId === racer.id 
                  ? theme === 'cute' ? 'ring-2 ring-pink-500' :
                    theme === 'tech' ? 'ring-2 ring-cyan-500' :
                    theme === 'dark' ? 'ring-2 ring-gray-400' :
                    'ring-2 ring-gray-700'
                  : 'hover:shadow-md'
              }`}
            >
              <button
                onClick={() => onSelectRacer(racer.id)}
                className="w-full text-left"
              >
                <div className="flex flex-col items-center space-y-3 mb-3">
                  {racer.avatar ? (
                    <img 
                      src={racer.avatar} 
                      alt={racer.name}
                      className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
                    />
                  ) : (
                    <div className={`w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-md ${racer.avatarColor}`}>
                      {racer.name[0]}
                    </div>
                  )}
                  <div className="text-center">
                    <p className={`font-bold text-sm ${getTextColor(theme)}`}>
                      {racer.name}
                    </p>
                  </div>
                </div>
              </button>
              <div className="flex gap-2">
                <button
                  onClick={() => onSelectRacer(racer.id)}
                  className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                    selectedRacerId === racer.id
                      ? theme === 'cute' ? 'bg-pink-100 text-pink-700' :
                        theme === 'tech' ? 'bg-cyan-500/20 text-cyan-400' :
                        theme === 'dark' ? 'bg-gray-700 text-gray-200' :
                        'bg-gray-100 text-gray-700'
                      : theme === 'cute' ? 'bg-pink-50 text-pink-600 hover:bg-pink-100' :
                        theme === 'tech' ? 'bg-slate-700 text-cyan-400 hover:bg-slate-600' :
                        theme === 'dark' ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' :
                        'bg-gray-50 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {selectedRacerId === racer.id ? '已選中' : '選擇'}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if(confirm(`確定要刪除 ${racer.name} 嗎？所有紀錄也會消失。`)) {
                      onDeleteRacer(racer.id);
                    }
                  }}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    theme === 'cute' ? 'bg-red-50 text-red-600 hover:bg-red-100' :
                    theme === 'tech' ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' :
                    theme === 'dark' ? 'bg-red-900/30 text-red-400 hover:bg-red-900/50' :
                    'bg-red-50 text-red-600 hover:bg-red-100'
                  }`}
                  title="刪除選手"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RacerManagement;
