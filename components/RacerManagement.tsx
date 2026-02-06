import React, { useState, useRef } from 'react';
import { Plus, User, Trash2, Upload, X, Edit2, Save, Lock, Globe } from 'lucide-react';
import { Racer, AVATAR_COLORS } from '../types';
import { Theme, themes } from '../themes';
import { getTextColor, getTextSecondaryColor, getPrimaryColor, getCardBgColor, getBorderColor } from '../themeUtils';
import PasswordModal from './PasswordModal';
import { SUPER_PASSWORD } from '../constants/passwords';

interface RacerManagementProps {
  racers: Racer[];
  selectedRacerId: string | null;
  onSelectRacer: (id: string) => void;
  onAddRacer: (name: string, color: string, avatar?: string, password?: string, requirePassword?: boolean, isPublic?: boolean) => void;
  onUpdateRacer: (id: string, name: string, color: string, avatar?: string, password?: string, requirePassword?: boolean, isPublic?: boolean) => void;
  onDeleteRacer: (id: string) => void;
  theme: Theme;
}

const RacerManagement: React.FC<RacerManagementProps> = ({ 
  racers, 
  selectedRacerId, 
  onSelectRacer, 
  onAddRacer,
  onUpdateRacer,
  onDeleteRacer,
  theme
}) => {
  const currentTheme = themes[theme] || themes['light'];
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newName, setNewName] = useState('');
  const [selectedColor, setSelectedColor] = useState(AVATAR_COLORS[0]);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [password, setPassword] = useState('');
  const [requirePassword, setRequirePassword] = useState(false);
  const [isPublic, setIsPublic] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);
  const [currentRacerForAction, setCurrentRacerForAction] = useState<Racer | null>(null);
  const [showAddPasswordModal, setShowAddPasswordModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);

  // 圖片壓縮函數
  const compressImage = (file: File, maxWidth: number = 800, maxHeight: number = 800, quality: number = 0.8): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          // 計算新尺寸，保持寬高比
          let width = img.width;
          let height = img.height;
          
          if (width > maxWidth || height > maxHeight) {
            if (width > height) {
              height = (height * maxWidth) / width;
              width = maxWidth;
            } else {
              width = (width * maxHeight) / height;
              height = maxHeight;
            }
          }

          // 創建 Canvas 進行壓縮
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          
          if (!ctx) {
            reject(new Error('無法創建 Canvas 上下文'));
            return;
          }

          // 繪製圖片
          ctx.drawImage(img, 0, 0, width, height);
          
          // 轉換為 base64
          const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
          resolve(compressedDataUrl);
        };
        img.onerror = () => reject(new Error('圖片載入失敗'));
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error('文件讀取失敗'));
      reader.readAsDataURL(file);
    });
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // 檢查文件類型
      if (!file.type.startsWith('image/')) {
        alert('請選擇圖片檔案');
        return;
      }
      
      // 移除大小限制，改為自動壓縮
      setIsCompressing(true);
      
      try {
        // 壓縮圖片（最大 800x800，品質 0.8）
        const compressedImage = await compressImage(file, 800, 800, 0.8);
        setAvatarPreview(compressedImage);
      } catch (error) {
        console.error('圖片壓縮失敗：', error);
        alert('圖片處理失敗，請重試');
        // 如果壓縮失敗，嘗試直接使用原圖
        const reader = new FileReader();
        reader.onloadend = () => {
          setAvatarPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      } finally {
        setIsCompressing(false);
      }
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
      // 如果 avatarPreview 是 null，傳遞 undefined（不包含該屬性）
      // 如果 avatarPreview 有值，傳遞該值
      onAddRacer(
        newName.trim(), 
        selectedColor, 
        avatarPreview || undefined,
        requirePassword && password ? password : undefined,
        requirePassword,
        isPublic
      );
      setNewName('');
      setAvatarPreview(null);
      setPassword('');
      setRequirePassword(false);
      setIsPublic(false);
      setIsAdding(false);
      // Pick a random color for next time
      setSelectedColor(AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)]);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleStartEdit = (racer: Racer) => {
    // 如果已經選中該選手，則不需要密碼驗證
    if (selectedRacerId === racer.id) {
      setEditingId(racer.id);
      setNewName(racer.name);
      setSelectedColor(racer.avatarColor);
      setAvatarPreview(racer.avatar || null);
      setPassword(racer.password || '');
      setRequirePassword(racer.requirePassword || false);
      setIsPublic(racer.isPublic || false);
      setIsAdding(false);
      return;
    }
    
    // 檢查是否需要密碼
    if (racer.requirePassword && racer.password) {
      setCurrentRacerForAction(racer);
      setPendingAction(() => () => {
        setEditingId(racer.id);
        setNewName(racer.name);
        setSelectedColor(racer.avatarColor);
        setAvatarPreview(racer.avatar || null);
        setPassword(racer.password || '');
        setRequirePassword(racer.requirePassword || false);
        setIsPublic(racer.isPublic || false);
        setIsAdding(false);
      });
      setShowPasswordModal(true);
    } else {
      setEditingId(racer.id);
      setNewName(racer.name);
      setSelectedColor(racer.avatarColor);
      setAvatarPreview(racer.avatar || null);
      setPassword(racer.password || '');
      setRequirePassword(racer.requirePassword || false);
      setIsPublic(racer.isPublic || false);
      setIsAdding(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setNewName('');
    setSelectedColor(AVATAR_COLORS[0]);
    setAvatarPreview(null);
    setPassword('');
    setRequirePassword(false);
    setIsPublic(false);
    if (editFileInputRef.current) {
      editFileInputRef.current.value = '';
    }
  };

  const handleSaveEdit = () => {
    if (editingId && newName.trim()) {
      // 如果 avatarPreview 是 null，傳遞 undefined（不包含該屬性）
      // 如果 avatarPreview 有值，傳遞該值
      onUpdateRacer(
        editingId, 
        newName.trim(), 
        selectedColor, 
        avatarPreview || undefined,
        requirePassword && password ? password : undefined,
        requirePassword,
        isPublic
      );
      handleCancelEdit();
    }
  };

  const handleDeleteClick = (racer: Racer) => {
    // 如果已經選中該選手，則不需要密碼驗證
    if (selectedRacerId === racer.id) {
      if (confirm(`確定要刪除 ${racer.name} 嗎？所有紀錄也會消失。`)) {
        onDeleteRacer(racer.id);
      }
      return;
    }
    
    // 檢查是否需要密碼
    if (racer.requirePassword && racer.password) {
      setCurrentRacerForAction(racer);
      setPendingAction(() => () => {
        if (confirm(`確定要刪除 ${racer.name} 嗎？所有紀錄也會消失。`)) {
          onDeleteRacer(racer.id);
        }
      });
      setShowPasswordModal(true);
    } else {
      if (confirm(`確定要刪除 ${racer.name} 嗎？所有紀錄也會消失。`)) {
        onDeleteRacer(racer.id);
      }
    }
  };

  const handlePasswordVerify = (inputPassword: string): boolean => {
    if (!currentRacerForAction) return false;
    
    // 檢查超級權限密碼
    if (inputPassword.toUpperCase() === SUPER_PASSWORD) {
      if (pendingAction) {
        pendingAction();
        setPendingAction(null);
        setCurrentRacerForAction(null);
      }
      return true;
    }
    
    // 檢查選手密碼
    if (currentRacerForAction.password && inputPassword === currentRacerForAction.password) {
      if (pendingAction) {
        pendingAction();
        setPendingAction(null);
        setCurrentRacerForAction(null);
      }
      return true;
    }
    
    return false;
  };

  const handleAddPasswordVerify = (inputPassword: string): boolean => {
    // 新增選手時必須輸入密碼 TED
    if (inputPassword.toUpperCase() === SUPER_PASSWORD) {
      setIsAdding(true);
      setShowAddPasswordModal(false);
      return true;
    }
    return false;
  };

  const handleEditFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // 檢查文件類型
      if (!file.type.startsWith('image/')) {
        alert('請選擇圖片檔案');
        return;
      }
      
      // 移除大小限制，改為自動壓縮
      setIsCompressing(true);
      
      try {
        // 壓縮圖片（最大 800x800，品質 0.8）
        const compressedImage = await compressImage(file, 800, 800, 0.8);
        setAvatarPreview(compressedImage);
      } catch (error) {
        console.error('圖片壓縮失敗：', error);
        alert('圖片處理失敗，請重試');
        // 如果壓縮失敗，嘗試直接使用原圖
        const reader = new FileReader();
        reader.onloadend = () => {
          setAvatarPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      } finally {
        setIsCompressing(false);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className={`text-xl font-bold ${getTextColor(theme)}`}>
          選手管理
        </h2>
        {/* 新增選手按鈕已隱藏 */}
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
                  支援 JPG、PNG，會自動壓縮
                </p>
                {isCompressing && (
                  <p className={`text-xs mt-1 ${getPrimaryColor(theme)} animate-pulse`}>
                    正在壓縮圖片...
                  </p>
                )}
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

          {/* 密碼設定 */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className={`block text-sm font-bold ${getTextColor(theme)} flex items-center gap-2`}>
                <Lock size={16} />
                設定密碼保護（選填）
              </label>
              <button
                type="button"
                onClick={() => {
                  setRequirePassword(!requirePassword);
                  if (!requirePassword) {
                    setPassword('');
                  }
                }}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  requirePassword
                    ? theme === 'cute' ? 'bg-pink-500' :
                      theme === 'tech' ? 'bg-cyan-500' :
                      theme === 'dark' ? 'bg-gray-600' :
                      'bg-gray-700'
                    : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    requirePassword ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            
            {requirePassword && (
              <div>
                <input
                  type="text"
                  value={password}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '').slice(0, 4);
                    setPassword(val);
                  }}
                  placeholder="輸入4位數字密碼"
                  className={`w-full p-3 border rounded-xl focus:ring-2 focus:outline-none font-mono text-center tracking-widest ${
                    theme === 'cute'
                      ? 'border-gray-300 focus:ring-pink-500 text-gray-800 bg-white'
                      : theme === 'tech'
                      ? 'border-slate-600 focus:ring-cyan-500 text-slate-200 bg-slate-700'
                      : theme === 'dark'
                      ? 'border-gray-600 focus:ring-gray-500 text-gray-200 bg-gray-800'
                      : 'border-gray-300 focus:ring-gray-500 text-gray-900 bg-white'
                  }`}
                  maxLength={4}
                />
                <p className={`text-xs mt-1 ${getTextSecondaryColor(theme)}`}>
                  設定後，異動此選手資料時需要輸入密碼
                </p>
              </div>
            )}
          </div>

          {/* 資料公開設定 */}
          <div className="flex items-center justify-between">
            <label className={`block text-sm font-bold ${getTextColor(theme)} flex items-center gap-2`}>
              <Globe size={16} />
              測秒資料公開
            </label>
            <button
              type="button"
              onClick={() => setIsPublic(!isPublic)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                isPublic
                  ? theme === 'cute' ? 'bg-pink-500' :
                    theme === 'tech' ? 'bg-cyan-500' :
                    theme === 'dark' ? 'bg-gray-600' :
                    'bg-gray-700'
                  : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isPublic ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          <p className={`text-xs ${getTextSecondaryColor(theme)}`}>
            {isPublic ? '開啟後，所有人都可以看到此選手的測秒資料' : '關閉後，只有設定者可以看到此選手的測秒資料'}
          </p>

          <button 
            onClick={handleAdd}
            disabled={!newName.trim() || (requirePassword && password.length !== 4)}
            className={`w-full ${currentTheme.styles.buttonPrimary} text-white px-4 py-3 rounded-xl font-bold disabled:opacity-50 transition-colors flex items-center justify-center gap-2 shadow-sm`}
          >
            <Plus size={18} />
            建立選手
          </button>
        </div>
      )}

      {/* 編輯表單 */}
      {editingId && (() => {
        const racer = racers.find(r => r.id === editingId);
        if (!racer) return null;
        
        return (
          <div className={`${currentTheme.styles.cardBg} p-6 rounded-xl shadow-lg border ${currentTheme.colors.border} animate-fade-in-down space-y-4`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-lg font-bold ${getTextColor(theme)}`}>
                編輯選手
              </h3>
              <button
                onClick={handleCancelEdit}
                className={`text-sm ${getTextSecondaryColor(theme)} hover:${getTextColor(theme)}`}
              >
                <X size={20} />
              </button>
            </div>

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
                      onClick={() => {
                        setAvatarPreview(null);
                        if (editFileInputRef.current) {
                          editFileInputRef.current.value = '';
                        }
                      }}
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
                    ref={editFileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleEditFileSelect}
                    className="hidden"
                    id="edit-avatar-upload"
                  />
                  <label
                    htmlFor="edit-avatar-upload"
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer transition-colors ${
                      theme === 'cute' ? 'bg-pink-100 text-pink-700 hover:bg-pink-200' :
                      theme === 'tech' ? 'bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30' :
                      theme === 'dark' ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' :
                      'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <Upload size={16} />
                    <span className="text-sm font-medium">{avatarPreview ? '更換圖片' : '選擇圖片'}</span>
                  </label>
                  <p className={`text-xs mt-1 ${getTextSecondaryColor(theme)}`}>
                    支援 JPG、PNG，會自動壓縮
                  </p>
                  {isCompressing && (
                    <p className={`text-xs mt-1 ${getPrimaryColor(theme)} animate-pulse`}>
                      正在壓縮圖片...
                    </p>
                  )}
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

            {/* 密碼設定 */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className={`block text-sm font-bold ${getTextColor(theme)} flex items-center gap-2`}>
                  <Lock size={16} />
                  設定密碼保護（選填）
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setRequirePassword(!requirePassword);
                    if (!requirePassword) {
                      setPassword('');
                    }
                  }}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    requirePassword
                      ? theme === 'cute' ? 'bg-pink-500' :
                        theme === 'tech' ? 'bg-cyan-500' :
                        theme === 'dark' ? 'bg-gray-600' :
                        'bg-gray-700'
                      : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      requirePassword ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              
              {requirePassword && (
                <div>
                  <input
                    type="text"
                    value={password}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '').slice(0, 4);
                      setPassword(val);
                    }}
                    placeholder="輸入4位數字密碼"
                    className={`w-full p-3 border rounded-xl focus:ring-2 focus:outline-none font-mono text-center tracking-widest ${
                      theme === 'cute'
                        ? 'border-gray-300 focus:ring-pink-500 text-gray-800 bg-white'
                        : theme === 'tech'
                        ? 'border-slate-600 focus:ring-cyan-500 text-slate-200 bg-slate-700'
                        : theme === 'dark'
                        ? 'border-gray-600 focus:ring-gray-500 text-gray-200 bg-gray-800'
                        : 'border-gray-300 focus:ring-gray-500 text-gray-900 bg-white'
                    }`}
                    maxLength={4}
                  />
                  <p className={`text-xs mt-1 ${getTextSecondaryColor(theme)}`}>
                    設定後，異動此選手資料時需要輸入密碼
                  </p>
                </div>
              )}
            </div>

            {/* 資料公開設定 */}
            <div className="flex items-center justify-between">
              <label className={`block text-sm font-bold ${getTextColor(theme)} flex items-center gap-2`}>
                <Globe size={16} />
                測秒資料公開
              </label>
              <button
                type="button"
                onClick={() => setIsPublic(!isPublic)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  isPublic
                    ? theme === 'cute' ? 'bg-pink-500' :
                      theme === 'tech' ? 'bg-cyan-500' :
                      theme === 'dark' ? 'bg-gray-600' :
                      'bg-gray-700'
                    : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    isPublic ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            <p className={`text-xs ${getTextSecondaryColor(theme)}`}>
              {isPublic ? '開啟後，所有人都可以看到此選手的測秒資料' : '關閉後，只有設定者可以看到此選手的測秒資料'}
            </p>

            <button 
              onClick={handleSaveEdit}
              disabled={!newName.trim() || (requirePassword && password.length !== 4)}
              className={`w-full ${currentTheme.styles.buttonPrimary} text-white px-4 py-3 rounded-xl font-bold disabled:opacity-50 transition-colors flex items-center justify-center gap-2 shadow-sm`}
            >
              <Save size={18} />
              儲存變更
            </button>
          </div>
        );
      })()}

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
                onClick={() => {
                  // 檢查是否需要密碼
                  if (racer.requirePassword && racer.password) {
                    setCurrentRacerForAction(racer);
                    setPendingAction(() => () => {
                      onSelectRacer(racer.id);
                    });
                    setShowPasswordModal(true);
                  } else {
                    onSelectRacer(racer.id);
                  }
                }}
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
                  onClick={(e) => {
                    e.stopPropagation();
                    // 檢查是否需要密碼
                    if (racer.requirePassword && racer.password) {
                      setCurrentRacerForAction(racer);
                      setPendingAction(() => () => {
                        onSelectRacer(racer.id);
                      });
                      setShowPasswordModal(true);
                    } else {
                      onSelectRacer(racer.id);
                    }
                  }}
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
                    handleStartEdit(racer);
                  }}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    theme === 'cute' ? 'bg-blue-50 text-blue-600 hover:bg-blue-100' :
                    theme === 'tech' ? 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30' :
                    theme === 'dark' ? 'bg-blue-900/30 text-blue-400 hover:bg-blue-900/50' :
                    'bg-blue-50 text-blue-600 hover:bg-blue-100'
                  }`}
                  title="編輯選手"
                >
                  <Edit2 size={16} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteClick(racer);
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

      {/* 密碼驗證彈窗（編輯/刪除選手用） */}
      <PasswordModal
        isOpen={showPasswordModal}
        onClose={() => {
          setShowPasswordModal(false);
          setPendingAction(null);
          setCurrentRacerForAction(null);
        }}
        onVerify={handlePasswordVerify}
        title={currentRacerForAction ? `驗證 ${currentRacerForAction.name} 的密碼` : '請輸入密碼'}
        theme={theme}
      />

      {/* 新增選手密碼驗證彈窗 */}
      <PasswordModal
        isOpen={showAddPasswordModal}
        onClose={() => {
          setShowAddPasswordModal(false);
        }}
        onVerify={handleAddPasswordVerify}
        title="新增選手需要驗證密碼"
        theme={theme}
      />
    </div>
  );
};

export default RacerManagement;
