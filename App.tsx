import React, { useState, useEffect } from 'react';
import { Trophy, Timer, History, BarChart2, Users } from 'lucide-react';
import { db, firebaseInitialized } from './firebase';
// @ts-ignore
import { ref, onValue, push, set, remove } from 'firebase/database';
import RacerList from './components/RacerList';
import RacerManagement from './components/RacerManagement';
import RecordForm from './components/RecordForm';
import HistoryLog from './components/HistoryLog';
import Analysis from './components/Analysis';
import ThemeSwitcher from './components/ThemeSwitcher';
import { Racer, Record, Distance } from './types';
import { Theme, themes } from './themes';

// Helper to get local date string YYYY-MM-DD
const getLocalDateStr = () => {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60000;
  const localDate = new Date(now.getTime() - offset);
  return localDate.toISOString().split('T')[0];
};

function App() {
  const [activeTab, setActiveTab] = useState<'record' | 'history' | 'analysis' | 'racers'>('record');
  const [racers, setRacers] = useState<Racer[]>([]);
  const [records, setRecords] = useState<Record[]>([]);
  const [selectedRacerId, setSelectedRacerId] = useState<string | null>(null);
  const [theme, setTheme] = useState<Theme>(() => {
    // 從 localStorage 讀取主題，預設為白色系
    try {
      const savedTheme = localStorage.getItem('app-theme') as Theme;
      const validThemes: Theme[] = ['cute', 'tech', 'dark', 'light'];
      const themeToUse = savedTheme && validThemes.includes(savedTheme) ? savedTheme : 'light';
      // 確保主題配置存在
      if (!themes[themeToUse]) {
        console.warn(`主題 "${themeToUse}" 不存在，使用預設主題 "light"`);
        return 'light';
      }
      return themeToUse;
    } catch (error) {
      console.error('讀取主題時發生錯誤：', error);
      return 'light';
    }
  });

  // 保存主題到 localStorage
  useEffect(() => {
    localStorage.setItem('app-theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // 確保主題配置存在，如果不存在則使用預設主題
  const currentTheme = themes[theme] || themes['light'];

  // Sync Racers from Firebase
  useEffect(() => {
    if (!firebaseInitialized || !db) {
      console.warn('Firebase 未初始化，無法同步選手數據');
      return;
    }
    
    try {
      const racersRef = ref(db, 'racers');
      const unsubscribe = onValue(racersRef, (snapshot: any) => {
          try {
            const data = snapshot.val();
            if (data) {
              // Convert object to array and filter invalid entries
              const racerList = Object.values(data).filter(
                (r): r is Racer => 
                  r && 
                  typeof (r as Racer).id === 'string' &&
                  typeof (r as Racer).name === 'string'
              ) as Racer[];
              setRacers(racerList);
            } else {
              setRacers([]);
            }
          } catch (error) {
            console.error('處理選手數據時發生錯誤：', error);
            setRacers([]);
          }
      });

      return () => unsubscribe();
    } catch (error) {
      console.error('設定選手監聽時發生錯誤：', error);
    }
  }, []);

  // Sync Records from Firebase
  useEffect(() => {
    if (!firebaseInitialized || !db) {
      console.warn('Firebase 未初始化，無法同步紀錄數據');
      return;
    }
    
    try {
      const recordsRef = ref(db, 'records');
      const unsubscribe = onValue(recordsRef, (snapshot: any) => {
          try {
            const data = snapshot.val();
            if (data) {
              const recordList = Object.values(data) as Record[];
              // 過濾掉無效的紀錄並排序
              const validRecords = recordList.filter(
                (r): r is Record => 
                  r && 
                  typeof r.id === 'string' &&
                  typeof r.timestamp === 'number' &&
                  !isNaN(r.timestamp)
              );
              // Sort by timestamp desc (newest first)
              validRecords.sort((a, b) => b.timestamp - a.timestamp);
              setRecords(validRecords);
            } else {
              setRecords([]);
            }
          } catch (error) {
            console.error('處理紀錄數據時發生錯誤：', error);
            setRecords([]);
          }
      });

      return () => unsubscribe();
    } catch (error) {
      console.error('設定紀錄監聽時發生錯誤：', error);
    }
  }, []);

  // Set default racer selection logic
  useEffect(() => {
    if (racers.length > 0) {
      // If no racer selected, or selected racer no longer exists
      if (!selectedRacerId || !racers.find(r => r.id === selectedRacerId)) {
        setSelectedRacerId(racers[0].id);
      }
    } else {
      setSelectedRacerId(null);
    }
  }, [racers, selectedRacerId]);

  const addRacer = (name: string, color: string, avatar?: string) => {
    if (!firebaseInitialized || !db) {
      alert('Firebase 未初始化，無法新增選手。請檢查環境變數設定。');
      return;
    }
    
    try {
      const newRacerRef = push(ref(db, 'racers'));
      if (!newRacerRef.key) {
        console.error('無法新增選手：Firebase 未返回 key');
        return;
      }
      
      const newRacer: Racer = {
        id: newRacerRef.key,
        name,
        avatarColor: color,
        ...(avatar && { avatar }), // 只有當 avatar 存在時才包含
        createdAt: Date.now()
      };
      // Save to Firebase
      set(newRacerRef, newRacer).catch((error) => {
        console.error('新增選手失敗：', error);
        alert('新增選手失敗，請檢查網路連線或 Firebase 設定');
      });
      setSelectedRacerId(newRacer.id);
    } catch (error) {
      console.error('新增選手時發生錯誤：', error);
      alert('新增選手時發生錯誤，請稍後再試');
    }
  };

  const updateRacer = (id: string, name: string, color: string, avatar?: string) => {
    if (!firebaseInitialized || !db) {
      alert('Firebase 未初始化，無法更新選手。請檢查環境變數設定。');
      return;
    }
    
    try {
      const existingRacer = racers.find(r => r.id === id);
      if (!existingRacer) {
        console.error('找不到要更新的選手');
        return;
      }

      const racerRef = ref(db, `racers/${id}`);
      // 構建更新物件，確保不包含 undefined
      const updatedRacer: Racer = {
        id: existingRacer.id,
        name,
        avatarColor: color,
        createdAt: existingRacer.createdAt,
        // 只有當 avatar 不是 undefined 時才包含
        ...(avatar !== undefined && { avatar: avatar || null })
      };
      
      set(racerRef, updatedRacer).catch((error) => {
        console.error('更新選手失敗：', error);
        alert('更新選手失敗，請檢查網路連線或 Firebase 設定');
      });
      
      set(racerRef, updatedRacer).catch((error) => {
        console.error('更新選手失敗：', error);
        alert('更新選手失敗，請檢查網路連線或 Firebase 設定');
      });
    } catch (error) {
      console.error('更新選手時發生錯誤：', error);
      alert('更新選手時發生錯誤，請稍後再試');
    }
  };

  const deleteRacer = (id: string) => {
    if (!firebaseInitialized || !db) {
      alert('Firebase 未初始化，無法刪除選手。請檢查環境變數設定。');
      return;
    }
    
    if (confirm('確定要刪除此選手嗎？相關紀錄也會一併刪除。')) {
      try {
        // Remove racer
        remove(ref(db, `racers/${id}`)).catch((error) => {
          console.error('刪除選手失敗：', error);
          alert('刪除選手失敗，請檢查網路連線或 Firebase 設定');
        });
        
        // Remove associated records
        // Note: In a production app with huge data, this should be done via a cloud function.
        // For this scale, client-side iteration is fine.
        records.forEach(r => {
          if (r.racerId === id) {
            remove(ref(db, `records/${r.id}`)).catch((error) => {
              console.error('刪除紀錄失敗：', error);
            });
          }
        });

        if (selectedRacerId === id) {
            setSelectedRacerId(null);
        }
      } catch (error) {
        console.error('刪除選手時發生錯誤：', error);
        alert('刪除選手時發生錯誤，請稍後再試');
      }
    }
  };

  const addRecord = (distance: Distance, timeSeconds: number, tenMeterTime?: number) => {
    if (!firebaseInitialized || !db) {
      alert('Firebase 未初始化，無法新增紀錄。請檢查環境變數設定。');
      return;
    }
    
    if (!selectedRacerId) {
      console.warn('無法新增紀錄：未選擇選手');
      return;
    }
    
    try {
      const dateStr = getLocalDateStr();
      const timestamp = Date.now();
      
      // 創建主要距離的紀錄
      const newRecordRef = push(ref(db, 'records'));
      if (!newRecordRef.key) {
        console.error('無法新增紀錄：Firebase 未返回 key');
        return;
      }
      
      const newRecord: Record = {
        id: newRecordRef.key,
        racerId: selectedRacerId,
        distance,
        timeSeconds,
        timestamp,
        dateStr
      };
      
      // 儲存主要紀錄
      set(newRecordRef, newRecord).catch((error) => {
        console.error('新增紀錄失敗：', error);
        alert('新增紀錄失敗，請檢查網路連線或 Firebase 設定');
      });
      
      // 如果有提供 10 米時間，同時創建 10 米紀錄
      if (tenMeterTime !== undefined && tenMeterTime > 0) {
        const tenMeterRecordRef = push(ref(db, 'records'));
        if (tenMeterRecordRef.key) {
          const tenMeterRecord: Record = {
            id: tenMeterRecordRef.key,
            racerId: selectedRacerId,
            distance: 10,
            timeSeconds: tenMeterTime,
            timestamp: timestamp + 1, // 稍微延後時間戳，確保排序正確
            dateStr
          };
          
          set(tenMeterRecordRef, tenMeterRecord).catch((error) => {
            console.error('新增 10 米紀錄失敗：', error);
            // 不顯示錯誤提示，因為主要紀錄已經成功
          });
        }
      }
      
      // Optional: Visual feedback or vibration
      if (navigator.vibrate) navigator.vibrate(50);
    } catch (error) {
      console.error('新增紀錄時發生錯誤：', error);
      alert('新增紀錄時發生錯誤，請稍後再試');
    }
  };

  const deleteRecord = (id: string) => {
    if (!firebaseInitialized || !db) {
      alert('Firebase 未初始化，無法刪除紀錄。請檢查環境變數設定。');
      return;
    }
    
    try {
      remove(ref(db, `records/${id}`)).catch((error) => {
        console.error('刪除紀錄失敗：', error);
        alert('刪除紀錄失敗，請檢查網路連線或 Firebase 設定');
      });
    } catch (error) {
      console.error('刪除紀錄時發生錯誤：', error);
      alert('刪除紀錄時發生錯誤，請稍後再試');
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'record':
        return (
          <div className="animate-fade-in-up">
            <RacerList 
              racers={racers} 
              selectedRacerId={selectedRacerId} 
              onSelectRacer={setSelectedRacerId}
              onAddRacer={addRacer}
              onDeleteRacer={deleteRacer}
              onNavigateToRacers={() => setActiveTab('racers')}
              theme={theme}
            />
            {racers.length > 0 && selectedRacerId ? (
              <RecordForm racerId={selectedRacerId} onAddRecord={addRecord} theme={theme} />
            ) : null}
            
            <div className="mt-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className={`font-bold ${
                  theme === 'cute' ? 'text-gray-700' :
                  theme === 'tech' ? 'text-slate-300' :
                  theme === 'dark' ? 'text-gray-200' :
                  'text-gray-800'
                }`}>
                  今日最新紀錄
                </h3>
                <button 
                  onClick={() => setActiveTab('history')}
                  className={`text-xs font-medium hover:underline ${
                    theme === 'cute' ? 'text-pink-600 hover:text-pink-700' :
                    theme === 'tech' ? 'text-cyan-400 hover:text-cyan-300' :
                    theme === 'dark' ? 'text-gray-300 hover:text-gray-100' :
                    'text-gray-700 hover:text-gray-900'
                  }`}
                >
                  查看全部
                </button>
              </div>
              <HistoryLog 
                racers={racers} 
                records={records.filter(r => r.dateStr === getLocalDateStr())} 
                onDeleteRecord={deleteRecord}
                theme={theme}
              />
            </div>
          </div>
        );
      case 'history':
        return (
          <div className="animate-fade-in">
            <h2 className={`text-xl font-bold mb-6 flex items-center gap-2 ${
              theme === 'cute' ? 'text-gray-800' :
              theme === 'tech' ? 'text-slate-200' :
              theme === 'dark' ? 'text-gray-200' :
              'text-gray-900'
            }`}>
              <History className={
                theme === 'cute' ? 'text-pink-500' :
                theme === 'tech' ? 'text-cyan-400' :
                theme === 'dark' ? 'text-gray-400' :
                'text-gray-700'
              } />
              歷史紀錄
            </h2>
            <HistoryLog racers={racers} records={records} onDeleteRecord={deleteRecord} theme={theme} />
          </div>
        );
      case 'racers':
        return (
          <div className="animate-fade-in">
            <RacerManagement 
              racers={racers} 
              selectedRacerId={selectedRacerId} 
              onSelectRacer={setSelectedRacerId}
              onAddRacer={addRacer}
              onUpdateRacer={updateRacer}
              onDeleteRacer={deleteRacer}
              theme={theme}
            />
          </div>
        );
      case 'analysis':
        return (
          <div className="animate-fade-in">
            <h2 className={`text-xl font-bold mb-6 flex items-center gap-2 ${
              theme === 'cute' ? 'text-gray-800' :
              theme === 'tech' ? 'text-slate-200' :
              theme === 'dark' ? 'text-gray-200' :
              'text-gray-900'
            }`}>
              <BarChart2 className={
                theme === 'cute' ? 'text-pink-500' :
                theme === 'tech' ? 'text-cyan-400' :
                theme === 'dark' ? 'text-gray-400' :
                'text-gray-700'
              } />
              數據分析
            </h2>
            <Analysis racers={racers} records={records} theme={theme} />
          </div>
        );
    }
  };

  // 如果 Firebase 未初始化，顯示警告訊息
  if (!firebaseInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full border border-yellow-200">
          <h2 className="text-xl font-bold text-yellow-600 mb-4">⚠️ Firebase 未初始化</h2>
          <p className="text-gray-700 mb-4">
            請檢查環境變數設定。應用程式需要正確的 Firebase 配置才能正常運行。
          </p>
          <div className="bg-gray-100 p-4 rounded-lg mb-4">
            <p className="text-sm text-gray-600 mb-2">請確認以下環境變數已設定：</p>
            <ul className="text-xs text-gray-600 list-disc list-inside space-y-1">
              <li>VITE_FIREBASE_API_KEY</li>
              <li>VITE_FIREBASE_AUTH_DOMAIN</li>
              <li>VITE_FIREBASE_PROJECT_ID</li>
              <li>VITE_FIREBASE_DATABASE_URL</li>
            </ul>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-yellow-500 text-white py-2 px-4 rounded-lg font-bold hover:bg-yellow-600 transition-colors"
          >
            重新整理頁面
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      data-theme={theme}
      className={`min-h-screen pb-24 max-w-md mx-auto shadow-2xl overflow-hidden relative transition-colors duration-300 ${
        theme === 'cute' ? 'bg-rose-50' :
        theme === 'tech' ? 'bg-slate-900' :
        theme === 'dark' ? 'bg-gray-900' :
        'bg-white'
      }`}
    >
      {/* Header */}
      <header className={`${currentTheme.styles.headerBg} pt-6 pb-4 px-6 sticky top-0 z-20 shadow-lg`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 ${currentTheme.styles.headerIcon} rounded-xl flex items-center justify-center text-white shadow-lg`}>
              <Trophy size={20} />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-white">
                滑步車測速紀錄
              </h1>
              <p className="text-xs font-medium text-white/80">
                Speedy Striders Tracker
              </p>
            </div>
          </div>
          <ThemeSwitcher currentTheme={theme} onThemeChange={setTheme} />
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
        {renderContent()}
      </main>

      {/* Bottom Navigation */}
      <nav className={`fixed bottom-0 w-full max-w-md px-6 py-3 flex justify-between items-center z-30 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] ${
        theme === 'cute' ? 'bg-white border-t border-pink-100' :
        theme === 'tech' ? 'bg-slate-800 border-t border-slate-700' :
        theme === 'dark' ? 'bg-gray-800 border-t border-gray-700' :
        'bg-white border-t border-gray-200'
      }`}>
        <button 
          onClick={() => setActiveTab('record')}
          className={`flex flex-col items-center gap-1 transition-colors ${
            activeTab === 'record' 
              ? currentTheme.styles.navActive 
              : currentTheme.styles.navInactive
          }`}
        >
          <Timer size={24} strokeWidth={activeTab === 'record' ? 2.5 : 2} />
          <span className="text-[10px] font-bold">測速</span>
        </button>
        
        <button 
          onClick={() => setActiveTab('history')}
          className={`flex flex-col items-center gap-1 transition-colors ${
            activeTab === 'history' 
              ? currentTheme.styles.navActive 
              : currentTheme.styles.navInactive
          }`}
        >
          <History size={24} strokeWidth={activeTab === 'history' ? 2.5 : 2} />
          <span className="text-[10px] font-bold">紀錄</span>
        </button>
        
        <button 
          onClick={() => setActiveTab('racers')}
          className={`flex flex-col items-center gap-1 transition-colors ${
            activeTab === 'racers' 
              ? currentTheme.styles.navActive 
              : currentTheme.styles.navInactive
          }`}
        >
          <Users size={24} strokeWidth={activeTab === 'racers' ? 2.5 : 2} />
          <span className="text-[10px] font-bold">選手</span>
        </button>
        
        <button 
          onClick={() => setActiveTab('analysis')}
          className={`flex flex-col items-center gap-1 transition-colors ${
            activeTab === 'analysis' 
              ? currentTheme.styles.navActive 
              : currentTheme.styles.navInactive
          }`}
        >
          <BarChart2 size={24} strokeWidth={activeTab === 'analysis' ? 2.5 : 2} />
          <span className="text-[10px] font-bold">分析</span>
        </button>
      </nav>
    </div>
  );
}

export default App;