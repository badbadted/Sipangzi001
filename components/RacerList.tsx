import React, { useState } from 'react';
import { Plus, User, Trash2 } from 'lucide-react';
import { Racer, AVATAR_COLORS } from '../types';
import { Theme, themes } from '../themes';
import { getTextColor, getTextSecondaryColor, getPrimaryColor, getCardBgColor, getBorderColor, isDarkTheme } from '../themeUtils';
import PasswordModal from './PasswordModal';
import { SUPER_PASSWORD } from '../constants/passwords';

interface RacerListProps {
  racers: Racer[];
  selectedRacerId: string | null;
  onSelectRacer: (id: string) => void;
  onAddRacer: (name: string, color: string) => void;
  onDeleteRacer: (id: string) => void;
  onNavigateToRacers?: () => void;
  theme: Theme;
}

const RacerList: React.FC<RacerListProps> = ({ 
  racers, 
  selectedRacerId, 
  onSelectRacer, 
  onAddRacer,
  onDeleteRacer,
  onNavigateToRacers,
  theme
}) => {
  const currentTheme = themes[theme] || themes['light'];
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [selectedColor, setSelectedColor] = useState(AVATAR_COLORS[0]);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [pendingRacerId, setPendingRacerId] = useState<string | null>(null);

  const handleAdd = () => {
    if (newName.trim()) {
      onAddRacer(newName.trim(), selectedColor);
      setNewName('');
      setIsAdding(false);
      // Pick a random color for next time
      setSelectedColor(AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)]);
    }
  };

  const handleSelectRacer = (racerId: string) => {
    const racer = racers.find(r => r.id === racerId);
    if (!racer) return;
    
    // 檢查是否需要密碼
    if (racer.requirePassword && racer.password) {
      setPendingRacerId(racerId);
      setShowPasswordModal(true);
    } else {
      onSelectRacer(racerId);
    }
  };

  const handlePasswordVerify = (inputPassword: string): boolean => {
    if (!pendingRacerId) return false;
    
    const racer = racers.find(r => r.id === pendingRacerId);
    if (!racer) return false;
    
    // 檢查超級權限密碼
    if (inputPassword.toUpperCase() === SUPER_PASSWORD) {
      onSelectRacer(pendingRacerId);
      setPendingRacerId(null);
      return true;
    }
    
    // 檢查選手密碼
    if (racer.password && inputPassword === racer.password) {
      onSelectRacer(pendingRacerId);
      setPendingRacerId(null);
      return true;
    }
    
    return false;
  };

  // 只顯示選中的選手，簡化顯示
  const selectedRacer = racers.find(r => r.id === selectedRacerId);

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className={`text-lg font-bold ${getTextColor(theme)}`}>
          當前選手
        </h2>
        {onNavigateToRacers && (
          <button 
            onClick={onNavigateToRacers}
            className={`text-sm font-medium flex items-center gap-1 active:opacity-70 ${
              theme === 'cute' ? 'text-pink-600 hover:text-pink-700' :
              theme === 'tech' ? 'text-cyan-400 hover:text-cyan-300' :
              theme === 'dark' ? 'text-gray-300 hover:text-gray-100' :
              'text-gray-700 hover:text-gray-900'
            }`}
          >
            管理選手
          </button>
        )}
      </div>

      {!selectedRacer ? (
        <div className={`text-center py-8 rounded-xl border-2 border-dashed ${
          theme === 'cute'
            ? 'bg-pink-50 border-pink-200'
            : theme === 'tech'
            ? 'bg-slate-800 border-slate-700'
            : theme === 'dark'
            ? 'bg-gray-800 border-gray-700'
            : 'bg-gray-50 border-gray-200'
        }`}>
          <p className={getTextSecondaryColor(theme)}>
            請先選擇選手或前往「選手」頁面新增
          </p>
        </div>
      ) : (
        <div className={`${currentTheme.styles.cardBg} p-4 rounded-xl shadow-sm border ${currentTheme.colors.border} flex items-center gap-4`}>
          {selectedRacer.avatar ? (
            <img 
              src={selectedRacer.avatar} 
              alt={selectedRacer.name}
              className={`w-16 h-16 rounded-full object-cover border-2 ${
                theme === 'cute' ? 'border-pink-200' :
                theme === 'tech' ? 'border-cyan-500/30' :
                theme === 'dark' ? 'border-gray-600' :
                'border-gray-300'
              }`}
            />
          ) : (
            <div className={`w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-bold shadow-md ${selectedRacer.avatarColor}`}>
              {selectedRacer.name[0]}
            </div>
          )}
          <div className="flex-1">
            <p className={`font-bold text-lg ${getTextColor(theme)}`}>
              {selectedRacer.name}
            </p>
            <p className={`text-sm ${getTextSecondaryColor(theme)}`}>
              點擊上方「管理選手」可切換或新增選手
            </p>
          </div>
        </div>
      )}

      {/* 密碼驗證彈窗 */}
      <PasswordModal
        isOpen={showPasswordModal}
        onClose={() => {
          setShowPasswordModal(false);
          setPendingRacerId(null);
        }}
        onVerify={handlePasswordVerify}
        title={pendingRacerId ? `請輸入 ${racers.find(r => r.id === pendingRacerId)?.name || '選手'} 的密碼` : '請輸入密碼'}
        theme={theme}
      />
    </div>
  );
};

export default RacerList;