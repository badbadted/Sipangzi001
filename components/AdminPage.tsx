import React, { useState, useRef } from 'react';
import { Plus, User, Upload, X, Lock, Globe, Trophy, ArrowLeft, Loader2, Home, FileSpreadsheet, CheckCircle } from 'lucide-react';
import { AVATAR_COLORS, Distance, Record } from '../types';
import { db, firebaseInitialized } from '../firebase';
import { ref, push, set } from 'firebase/database';
import { useRacers } from '../hooks/useRacers';
import { useMyRacers } from '../hooks/useMyRacers';
import PasswordModal from './PasswordModal';
import { SUPER_PASSWORD } from '../constants/passwords';

const AdminPage: React.FC = () => {
  const { racers, isLoading, addRacer: addRacerHook } = useRacers();
  const { addToMyRacers } = useMyRacers();

  // 管理員驗證
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(true);

  // 新增選手表單
  const [newName, setNewName] = useState('');
  const [selectedColor, setSelectedColor] = useState(AVATAR_COLORS[0]);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [password, setPassword] = useState('');
  const [requirePassword, setRequirePassword] = useState(false);
  const [isPublic, setIsPublic] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 匯入紀錄
  const [importRacerId, setImportRacerId] = useState('');
  const [importDate, setImportDate] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  });
  const [importDistance, setImportDistance] = useState<Distance>(50);
  const [importTimesText, setImportTimesText] = useState('');
  const [importResult, setImportResult] = useState<{ success: number; failed: number } | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  // 解析秒數文字：支援空白、頓號、逗號分隔
  const parseTimes = (text: string): number[] => {
    return text
      .split(/[\s,、]+/)
      .map(v => parseFloat(v.trim()))
      .filter(v => !isNaN(v) && v > 0);
  };

  const handleImport = async () => {
    if (!db || !importRacerId) return;

    const times = parseTimes(importTimesText);
    if (times.length === 0) return;

    setIsImporting(true);
    let success = 0;
    let failed = 0;

    const baseTimestamp = new Date(importDate + 'T00:00:00').getTime();

    for (let i = 0; i < times.length; i++) {
      try {
        const newRecordRef = push(ref(db, 'records'));
        if (!newRecordRef.key) {
          failed++;
          continue;
        }
        const record: Record = {
          id: newRecordRef.key,
          racerId: importRacerId,
          distance: importDistance,
          timeSeconds: times[i],
          timestamp: baseTimestamp + i,
          dateStr: importDate,
          recordType: 'manual',
        };
        await set(newRecordRef, record);
        success++;
      } catch {
        failed++;
      }
    }

    setImportResult({ success, failed });
    setIsImporting(false);
    if (success > 0) {
      setImportTimesText('');
    }
  };

  // 圖片壓縮函數
  const compressImage = (file: File, maxWidth: number = 800, maxHeight: number = 800, quality: number = 0.8): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
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

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');

          if (!ctx) {
            reject(new Error('無法創建 Canvas 上下文'));
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);
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
      if (!file.type.startsWith('image/')) {
        alert('請選擇圖片檔案');
        return;
      }

      setIsCompressing(true);
      try {
        const compressedImage = await compressImage(file, 800, 800, 0.8);
        setAvatarPreview(compressedImage);
      } catch (error) {
        console.error('圖片壓縮失敗：', error);
        alert('圖片處理失敗，請重試');
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
      const newRacerId = addRacerHook(
        newName.trim(),
        selectedColor,
        avatarPreview || undefined,
        requirePassword && password ? password : undefined,
        requirePassword,
        isPublic
      );
      if (newRacerId) {
        addToMyRacers(newRacerId);
      }

      setSuccessMessage(`已成功新增選手「${newName.trim()}」！`);
      setNewName('');
      setAvatarPreview(null);
      setPassword('');
      setRequirePassword(false);
      setIsPublic(false);
      setSelectedColor(AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)]);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      setTimeout(() => setSuccessMessage(''), 3000);
    }
  };

  // 用 ref 追蹤驗證狀態，避免 onClose 在驗證成功後還觸發跳轉
  const authPassedRef = useRef(false);

  const handleAuthVerify = (inputPassword: string): boolean => {
    if (inputPassword.toUpperCase() === SUPER_PASSWORD) {
      authPassedRef.current = true;
      setIsAuthenticated(true);
      setShowAuthModal(false);
      return true;
    }
    return false;
  };

  // Firebase 未初始化
  if (!firebaseInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full border border-yellow-200">
          <h2 className="text-xl font-bold text-yellow-600 mb-4">Firebase 未初始化</h2>
          <p className="text-gray-700">請檢查環境變數設定。</p>
        </div>
      </div>
    );
  }

  // 未驗證 - 顯示密碼驗證
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-800 rounded-2xl flex items-center justify-center text-white shadow-lg mx-auto mb-4">
            <Lock size={28} />
          </div>
          <h1 className="text-xl font-bold text-gray-800 mb-2">管理員驗證</h1>
          <p className="text-gray-500 text-sm mb-4">請輸入管理員密碼以進入後台</p>
          <PasswordModal
            isOpen={showAuthModal}
            onClose={() => {
              // 只有在驗證未通過時才跳回首頁（使用者按取消）
              if (!authPassedRef.current) {
                window.location.href = '/';
              }
            }}
            onVerify={handleAuthVerify}
            title="請輸入管理員密碼"
            theme="light"
          />
          {!showAuthModal && (
            <a
              href="/"
              className="inline-flex items-center gap-2 mt-6 text-gray-500 hover:text-gray-700 text-sm transition-colors"
            >
              <Home size={16} />
              回到首頁
            </a>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-gray-800 pt-6 pb-4 px-6 sticky top-0 z-20 shadow-lg">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-700 rounded-xl flex items-center justify-center text-white shadow-lg">
              <Trophy size={20} />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-white">
                管理後台
              </h1>
              <p className="text-xs font-medium text-white/80">
                Admin Panel
              </p>
            </div>
          </div>
          <a
            href="/"
            className="flex items-center gap-1 text-white/80 hover:text-white text-sm transition-colors"
          >
            <ArrowLeft size={16} />
            回到首頁
          </a>
        </div>
      </header>

      <main className="max-w-lg mx-auto p-6 space-y-6">
        {/* 新增選手表單 */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-4">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Plus size={20} />
            新增選手
          </h2>

          {successMessage && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm font-medium animate-fade-in">
              {successMessage}
            </div>
          )}

          <div>
            <label className="block text-sm font-bold mb-2 text-gray-800">
              選手姓名 / 暱稱
            </label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="例如: 小飛俠"
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-500 focus:outline-none text-gray-900 bg-white"
            />
          </div>

          <div>
            <label className="block text-sm font-bold mb-2 text-gray-800">
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
                <div className="w-24 h-24 rounded-full flex items-center justify-center border-2 border-dashed border-gray-300 bg-gray-50">
                  <User size={32} className="text-gray-400" />
                </div>
              )}
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="admin-avatar-upload"
                />
                <label
                  htmlFor="admin-avatar-upload"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer transition-colors bg-gray-100 text-gray-700 hover:bg-gray-200"
                >
                  <Upload size={16} />
                  <span className="text-sm font-medium">選擇圖片</span>
                </label>
                <p className="text-xs mt-1 text-gray-500">
                  支援 JPG、PNG，會自動壓縮
                </p>
                {isCompressing && (
                  <p className="text-xs mt-1 text-gray-600 animate-pulse">
                    正在壓縮圖片...
                  </p>
                )}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold mb-2 text-gray-800">
              選擇代表色
            </label>
            <div className="flex flex-wrap gap-2">
              {AVATAR_COLORS.map(color => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  className={`w-10 h-10 rounded-full ${color} transition-transform ${
                    selectedColor === color
                      ? 'ring-2 ring-offset-2 ring-gray-700 scale-110'
                      : 'hover:scale-105'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* 密碼設定 */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-bold text-gray-800 flex items-center gap-2">
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
                  requirePassword ? 'bg-gray-700' : 'bg-gray-300'
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
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-500 focus:outline-none font-mono text-center tracking-widest text-gray-900 bg-white"
                  maxLength={4}
                />
                <p className="text-xs mt-1 text-gray-500">
                  設定後，異動此選手資料時需要輸入密碼
                </p>
              </div>
            )}
          </div>

          {/* 資料公開設定 */}
          <div className="flex items-center justify-between">
            <label className="block text-sm font-bold text-gray-800 flex items-center gap-2">
              <Globe size={16} />
              測秒資料公開
            </label>
            <button
              type="button"
              onClick={() => setIsPublic(!isPublic)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                isPublic ? 'bg-gray-700' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isPublic ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          <p className="text-xs text-gray-500">
            {isPublic ? '開啟後，所有人都可以看到此選手的測秒資料' : '關閉後，只有設定者可以看到此選手的測秒資料'}
          </p>

          <button
            onClick={handleAdd}
            disabled={!newName.trim() || (requirePassword && password.length !== 4)}
            className="w-full bg-gray-800 hover:bg-gray-900 text-white px-4 py-3 rounded-xl font-bold disabled:opacity-50 transition-colors flex items-center justify-center gap-2 shadow-sm"
          >
            <Plus size={18} />
            建立選手
          </button>
        </div>

        {/* 匯入紀錄 */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-4">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <FileSpreadsheet size={20} />
            匯入紀錄
          </h2>

          {/* 選手 */}
          <div>
            <label className="block text-sm font-bold mb-2 text-gray-800">選手</label>
            <select
              value={importRacerId}
              onChange={(e) => setImportRacerId(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-500 focus:outline-none text-gray-900 bg-white"
            >
              <option value="">請選擇選手</option>
              {racers.map(r => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </div>

          {/* 日期 */}
          <div>
            <label className="block text-sm font-bold mb-2 text-gray-800">日期</label>
            <input
              type="date"
              value={importDate}
              onChange={(e) => setImportDate(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-500 focus:outline-none text-gray-900 bg-white"
            />
          </div>

          {/* 距離 */}
          <div>
            <label className="block text-sm font-bold mb-2 text-gray-800">距離</label>
            <div className="flex gap-2">
              {([10, 30, 50] as Distance[]).map(d => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setImportDistance(d)}
                  className={`flex-1 py-3 rounded-xl font-bold text-sm transition-colors ${
                    importDistance === d
                      ? 'bg-gray-800 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {d}m
                </button>
              ))}
            </div>
          </div>

          {/* 秒數 */}
          <div>
            <label className="block text-sm font-bold mb-2 text-gray-800">秒數</label>
            <textarea
              value={importTimesText}
              onChange={(e) => {
                setImportTimesText(e.target.value);
                setImportResult(null);
              }}
              placeholder="輸入秒數，用空白、逗號或頓號分隔多筆&#10;例如：7.5 7.8 8.1 或 7.5,7.8,8.1 或 7.5、7.8、8.1"
              rows={3}
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-500 focus:outline-none text-gray-900 bg-white text-sm"
            />
            {parseTimes(importTimesText).length > 0 && (
              <p className="text-xs mt-1 text-gray-500">
                已解析 {parseTimes(importTimesText).length} 筆：{parseTimes(importTimesText).join(', ')}
              </p>
            )}
          </div>

          {/* 匯入結果 */}
          {importResult && (
            <div className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium ${
              importResult.failed > 0
                ? 'bg-yellow-50 border border-yellow-200 text-yellow-700'
                : 'bg-green-50 border border-green-200 text-green-700'
            }`}>
              <CheckCircle size={16} />
              成功匯入 {importResult.success} 筆紀錄
              {importResult.failed > 0 && `，${importResult.failed} 筆失敗`}
            </div>
          )}

          {/* 匯入按鈕 */}
          <button
            onClick={handleImport}
            disabled={isImporting || !importRacerId || !importDate || parseTimes(importTimesText).length === 0}
            className="w-full bg-gray-800 hover:bg-gray-900 text-white px-4 py-3 rounded-xl font-bold disabled:opacity-50 transition-colors flex items-center justify-center gap-2 shadow-sm"
          >
            {isImporting ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                匯入中...
              </>
            ) : (
              <>
                <FileSpreadsheet size={18} />
                確認匯入
              </>
            )}
          </button>
        </div>

        {/* 現有選手列表 */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <User size={20} />
            現有選手（{racers.length}）
          </h2>

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
              <span className="ml-2 text-gray-500 text-sm">載入中...</span>
            </div>
          ) : racers.length === 0 ? (
            <p className="text-gray-500 text-center py-8">尚無選手</p>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              {racers.map(racer => (
                <div key={racer.id} className="flex flex-col items-center p-3 rounded-lg bg-gray-50 border border-gray-100">
                  {racer.avatar ? (
                    <img
                      src={racer.avatar}
                      alt={racer.name}
                      className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                    />
                  ) : (
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white text-lg font-bold ${racer.avatarColor}`}>
                      {racer.name[0]}
                    </div>
                  )}
                  <p className="text-xs font-medium text-gray-700 mt-2 text-center truncate w-full">
                    {racer.name}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminPage;
