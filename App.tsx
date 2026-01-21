import React, { useState, useEffect, useMemo } from 'react';
import { Trophy, Timer, History, BarChart2, Users, Loader2, Zap } from 'lucide-react';
import { firebaseInitialized } from './firebase';
import RacerList from './components/RacerList';
import RacerManagement from './components/RacerManagement';
import RecordForm from './components/RecordForm';
import HistoryLog from './components/HistoryLog';
import Analysis from './components/Analysis';
import TrainingTimer from './components/TrainingTimer';
import TrainingLog from './components/TrainingLog';
import ThemeSwitcher from './components/ThemeSwitcher';
import { Distance } from './types';
import { Theme, themes } from './themes';
import { useRacers } from './hooks/useRacers';
import { useRecords } from './hooks/useRecords';
import { useMyRacers } from './hooks/useMyRacers';
import { useVisibleRecords } from './hooks/useVisibleRecords';
import { useTrainingSessions } from './hooks/useTrainingSessions';
import { useVisibleSessions } from './hooks/useVisibleSessions';
import { getLocalDateStr } from './utils/dateUtils';

function App() {
  const [activeTab, setActiveTab] = useState<'record' | 'history' | 'analysis' | 'racers' | 'training'>('record');
  const [selectedRacerId, setSelectedRacerId] = useState<string | null>(() => {
    // 只從 sessionStorage 讀取（每個瀏覽器會話獨立，不同瀏覽器必須重新選擇）
    return sessionStorage.getItem('selected_racer_id');
  });
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

  // 使用 Custom Hooks
  const { racers, isLoading: isLoadingRacers, addRacer: addRacerHook, updateRacer, deleteRacer: deleteRacerHook } = useRacers();
  const { records, isLoading: isLoadingRecords, addRecord: addRecordHook, deleteRecord, deleteRecordsByRacerId } = useRecords(false);
  const { myRacerIds, addToMyRacers } = useMyRacers();
  const visibleRecords = useVisibleRecords(records, racers, myRacerIds);
  const { sessions: trainingSessions, addSession: addTrainingSession, deleteSession: deleteTrainingSession } = useTrainingSessions();
  const visibleSessions = useVisibleSessions(trainingSessions, racers, myRacerIds);

  // 保存主題到 localStorage
  useEffect(() => {
    localStorage.setItem('app-theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // 確保主題配置存在，如果不存在則使用預設主題
  const currentTheme = themes[theme] || themes['light'];

  // Save selected racer to sessionStorage (每個瀏覽器會話獨立)
  useEffect(() => {
    if (selectedRacerId) {
      sessionStorage.setItem('selected_racer_id', selectedRacerId);
    } else {
      sessionStorage.removeItem('selected_racer_id');
    }
  }, [selectedRacerId]);

  // Set default racer selection logic
  useEffect(() => {
    // 只有在 racers 載入完成後才處理選擇邏輯
    if (!isLoadingRacers && racers.length > 0) {
      // 如果沒有選中選手，或選中的選手不存在於列表中
      if (!selectedRacerId || !racers.find(r => r.id === selectedRacerId)) {
        // 嘗試從 sessionStorage 恢復（以防初始化時未正確讀取）
        const savedRacerId = sessionStorage.getItem('selected_racer_id');
        
        if (savedRacerId && racers.find(r => r.id === savedRacerId)) {
          // 如果找到有效的保存 ID，使用它
          setSelectedRacerId(savedRacerId);
        } else {
          // 否則不自動選擇，讓用戶手動選擇（不同瀏覽器必須重新選擇）
          // 不設置預設值，保持為 null
        }
      }
      // 如果 selectedRacerId 存在且有效，不需要做任何事（保留它）
    } else if (!isLoadingRacers && racers.length === 0) {
      // racers 載入完成但為空，清除選擇
      setSelectedRacerId(null);
      sessionStorage.removeItem('selected_racer_id');
    }
  }, [racers, selectedRacerId, isLoadingRacers]);

  // 包裝 addRacer 以處理 myRacers 邏輯
  const addRacer = (name: string, color: string, avatar?: string, password?: string, requirePassword?: boolean, isPublic?: boolean) => {
    const newRacerId = addRacerHook(name, color, avatar, password, requirePassword, isPublic);
    if (newRacerId) {
      addToMyRacers(newRacerId);
      setSelectedRacerId(newRacerId);
    }
  };

  // 包裝 deleteRacer 以處理相關紀錄刪除
  const deleteRacer = (id: string) => {
    deleteRacerHook(id, deleteRecordsByRacerId);
    if (selectedRacerId === id) {
      setSelectedRacerId(null);
    }
  };

  // 包裝 addRecord 以使用 selectedRacerId
  const addRecord = (distance: Distance, timeSeconds: number, tenMeterTime?: number) => {
    if (!selectedRacerId) {
      console.warn('無法新增紀錄：未選擇選手');
      return;
    }
    addRecordHook(selectedRacerId, distance, timeSeconds, tenMeterTime);
  };

  // 獲取當前選手的記錄（只要能選到該選手，就能看到該選手的全部資料）
  const getCurrentRacerRecords = (racerId: string | null) => {
    if (!racerId) return [];
    // 只要能選到該選手，就能看到該選手的全部資料
    return records.filter(r => r.racerId === racerId);
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

            {/* 顯示當前選手的記錄（只要能選到該選手，就能看到該選手的全部資料） */}
            {selectedRacerId && (
              <div className="mt-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className={`font-bold ${theme === 'cute' ? 'text-gray-700' :
                    theme === 'tech' ? 'text-slate-300' :
                      theme === 'dark' ? 'text-gray-200' :
                        'text-gray-800'
                    }`}>
                    {(() => {
                      const racer = racers.find(r => r.id === selectedRacerId);
                      return `${racer?.name || '選手'} 的今日紀錄`;
                    })()}
                  </h3>
                  <button
                    onClick={() => setActiveTab('history')}
                    className={`text-xs font-medium hover:underline ${theme === 'cute' ? 'text-pink-600 hover:text-pink-700' :
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
                  records={getCurrentRacerRecords(selectedRacerId).filter(r => r.dateStr === getLocalDateStr())}
                  onDeleteRecord={deleteRecord}
                  theme={theme}
                />
              </div>
            )}

            {/* 顯示所有公開選手的今日紀錄 */}
            {visibleRecords.filter(r => r.dateStr === getLocalDateStr() && r.racerId !== selectedRacerId).length > 0 && (
              <div className="mt-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className={`font-bold ${theme === 'cute' ? 'text-gray-700' :
                    theme === 'tech' ? 'text-slate-300' :
                      theme === 'dark' ? 'text-gray-200' :
                        'text-gray-800'
                    }`}>
                    其他選手的今日紀錄（公開資料）
                  </h3>
                </div>
                <HistoryLog
                  racers={racers}
                  records={visibleRecords.filter(r => r.dateStr === getLocalDateStr() && r.racerId !== selectedRacerId)}
                  onDeleteRecord={deleteRecord}
                  theme={theme}
                />
              </div>
            )}
          </div>
        );
      case 'history':
        // 如果有選中的選手，顯示該選手的全部記錄 + 其他公開選手的記錄
        const historyRecords = selectedRacerId
          ? [
            ...getCurrentRacerRecords(selectedRacerId), // 選中選手的全部記錄（不管是否公開）
            ...visibleRecords.filter(r => r.racerId !== selectedRacerId) // 其他公開選手的記錄
          ]
          : visibleRecords; // 沒有選中選手時，只顯示公開資料

        return (
          <div className="animate-fade-in">
            <h2 className={`text-xl font-bold mb-6 flex items-center gap-2 ${theme === 'cute' ? 'text-gray-800' :
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
              {selectedRacerId
                ? '歷史紀錄（包含選中選手的全部資料）'
                : '歷史紀錄（僅顯示公開資料）'}
            </h2>
            <HistoryLog racers={racers} records={historyRecords} onDeleteRecord={deleteRecord} theme={theme} />
          </div>
        );
      case 'training':
        // Using outer definition
        const currentRacerSessions = selectedRacerId
          ? visibleSessions.filter(s => s.racerId === selectedRacerId)
          : [];

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

            <TrainingTimer
              racerId={selectedRacerId}
              onSaveSession={(type, duration, note) => {
                if (selectedRacerId) addTrainingSession(selectedRacerId, type, duration, note);
              }}
              theme={theme}
            />

            {visibleSessions.length > 0 && (
              <div className="mt-8">
                <h3 className={`font-bold mb-4 ${theme === 'cute' ? 'text-gray-700' :
                  theme === 'tech' ? 'text-slate-300' :
                    theme === 'dark' ? 'text-gray-200' :
                      'text-gray-800'
                  }`}>
                  最近訓練紀錄
                </h3>
                <TrainingLog
                  racers={racers}
                  sessions={currentRacerSessions.length > 0 ? currentRacerSessions : visibleSessions}
                  onDeleteSession={deleteTrainingSession}
                  theme={theme}
                />
              </div>
            )}
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
            <h2 className={`text-xl font-bold mb-6 flex items-center gap-2 ${theme === 'cute' ? 'text-gray-800' :
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
              數據分析（僅顯示公開資料）
            </h2>
            <Analysis
              racers={racers}
              records={selectedRacerId
                ? [
                  ...getCurrentRacerRecords(selectedRacerId), // 選中選手的全部記錄（不管是否公開）
                  ...visibleRecords.filter(r => r.racerId !== selectedRacerId) // 其他公開選手的記錄
                ]
                : visibleRecords // 沒有選中選手時，只顯示公開資料
              }
              theme={theme}
            />
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
      className={`min-h-screen pb-24 max-w-md mx-auto shadow-2xl overflow-hidden relative transition-colors duration-300 ${theme === 'cute' ? 'bg-rose-50' :
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
                滑步車小幫手
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
        {(isLoadingRacers || isLoadingRecords) && (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className={`w-8 h-8 animate-spin ${theme === 'cute' ? 'text-pink-500' :
              theme === 'tech' ? 'text-cyan-400' :
                theme === 'dark' ? 'text-gray-400' :
                  'text-gray-600'
              }`} />
            <p className={`mt-4 text-sm ${theme === 'cute' ? 'text-gray-600' :
              theme === 'tech' ? 'text-slate-400' :
                theme === 'dark' ? 'text-gray-400' :
                  'text-gray-600'
              }`}>
              {isLoadingRacers ? '載入選手資料中...' : '載入紀錄資料中...'}
            </p>
          </div>
        )}
        {!isLoadingRacers && !isLoadingRecords && renderContent()}
      </main>

      {/* Bottom Navigation */}
      <nav className={`fixed bottom-0 w-full max-w-md px-6 py-3 flex justify-between items-center z-30 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] ${theme === 'cute' ? 'bg-white border-t border-pink-100' :
        theme === 'tech' ? 'bg-slate-800 border-t border-slate-700' :
          theme === 'dark' ? 'bg-gray-800 border-t border-gray-700' :
            'bg-white border-t border-gray-200'
        }`}>
        <button
          onClick={() => setActiveTab('record')}
          className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'record'
            ? currentTheme.styles.navActive
            : currentTheme.styles.navInactive
            }`}
        >
          <Timer size={24} strokeWidth={activeTab === 'record' ? 2.5 : 2} />
          <span className="text-[10px] font-bold">測速</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'history'
            ? currentTheme.styles.navActive
            : currentTheme.styles.navInactive
            }`}
        >
          <History size={24} strokeWidth={activeTab === 'history' ? 2.5 : 2} />
          <span className="text-[10px] font-bold">紀錄</span>
        </button>

        <button
          onClick={() => setActiveTab('training')}
          className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'training'
            ? currentTheme.styles.navActive
            : currentTheme.styles.navInactive
            }`}
        >
          <Zap size={24} strokeWidth={activeTab === 'training' ? 2.5 : 2} />
          <span className="text-[10px] font-bold">訓練</span>
        </button>

        <button
          onClick={() => setActiveTab('racers')}
          className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'racers'
            ? currentTheme.styles.navActive
            : currentTheme.styles.navInactive
            }`}
        >
          <Users size={24} strokeWidth={activeTab === 'racers' ? 2.5 : 2} />
          <span className="text-[10px] font-bold">選手</span>
        </button>

        <button
          onClick={() => setActiveTab('analysis')}
          className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'analysis'
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
