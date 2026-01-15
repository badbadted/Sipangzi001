import React, { useState, useEffect } from 'react';
import { Trophy, Timer, History, BarChart2 } from 'lucide-react';
import { db } from './firebase';
// @ts-ignore
import { ref, onValue, push, set, remove } from 'firebase/database';
import RacerList from './components/RacerList';
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
  const [activeTab, setActiveTab] = useState<'record' | 'history' | 'analysis'>('record');
  const [racers, setRacers] = useState<Racer[]>([]);
  const [records, setRecords] = useState<Record[]>([]);
  const [selectedRacerId, setSelectedRacerId] = useState<string | null>(null);
  const [theme, setTheme] = useState<Theme>(() => {
    // 從 localStorage 讀取主題，預設為可愛動物風
    const savedTheme = localStorage.getItem('app-theme') as Theme;
    return savedTheme && (savedTheme === 'cute' || savedTheme === 'tech') ? savedTheme : 'cute';
  });

  // 保存主題到 localStorage
  useEffect(() => {
    localStorage.setItem('app-theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const currentTheme = themes[theme];

  // Sync Racers from Firebase
  useEffect(() => {
    const racersRef = ref(db, 'racers');
    const unsubscribe = onValue(racersRef, (snapshot: any) => {
      const data = snapshot.val();
      if (data) {
        // Convert object to array
        const racerList = Object.values(data) as Racer[];
        setRacers(racerList);
      } else {
        setRacers([]);
      }
    });

    return () => unsubscribe();
  }, []);

  // Sync Records from Firebase
  useEffect(() => {
    const recordsRef = ref(db, 'records');
    const unsubscribe = onValue(recordsRef, (snapshot: any) => {
      const data = snapshot.val();
      if (data) {
        const recordList = Object.values(data) as Record[];
        // Sort by timestamp desc (newest first)
        recordList.sort((a, b) => b.timestamp - a.timestamp);
        setRecords(recordList);
      } else {
        setRecords([]);
      }
    });

    return () => unsubscribe();
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

  const addRacer = (name: string, color: string) => {
    const newRacerRef = push(ref(db, 'racers'));
    const newRacer: Racer = {
      id: newRacerRef.key as string,
      name,
      avatarColor: color,
      createdAt: Date.now()
    };
    // Save to Firebase
    set(newRacerRef, newRacer);
    setSelectedRacerId(newRacer.id);
  };

  const deleteRacer = (id: string) => {
    if (confirm('確定要刪除此選手嗎？相關紀錄也會一併刪除。')) {
      // Remove racer
      remove(ref(db, `racers/${id}`));
      
      // Remove associated records
      // Note: In a production app with huge data, this should be done via a cloud function.
      // For this scale, client-side iteration is fine.
      records.forEach(r => {
        if (r.racerId === id) {
          remove(ref(db, `records/${r.id}`));
        }
      });

      if (selectedRacerId === id) {
          setSelectedRacerId(null);
      }
    }
  };

  const addRecord = (distance: Distance, timeSeconds: number) => {
    if (!selectedRacerId) return;
    
    const newRecordRef = push(ref(db, 'records'));
    const newRecord: Record = {
      id: newRecordRef.key as string,
      racerId: selectedRacerId,
      distance,
      timeSeconds,
      timestamp: Date.now(),
      dateStr: getLocalDateStr() // Use local date
    };
    
    // Push to Firebase
    set(newRecordRef, newRecord);
    
    // Optional: Visual feedback or vibration
    if (navigator.vibrate) navigator.vibrate(50);
  };

  const deleteRecord = (id: string) => {
    remove(ref(db, `records/${id}`));
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
              theme={theme}
            />
            {racers.length > 0 && selectedRacerId ? (
              <RecordForm racerId={selectedRacerId} onAddRecord={addRecord} theme={theme} />
            ) : null}
            
            <div className="mt-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className={`font-bold ${
                  theme === 'cute' ? 'text-gray-700' : 'text-slate-300'
                }`}>
                  今日最新紀錄
                </h3>
                <button 
                  onClick={() => setActiveTab('history')}
                  className={`text-xs font-medium hover:underline ${
                    theme === 'cute' 
                      ? 'text-pink-600 hover:text-pink-700' 
                      : 'text-cyan-400 hover:text-cyan-300'
                  }`}
                >
                  查看全部
                </button>
              </div>
              <HistoryLog 
                racers={racers} 
                records={records.filter(r => r.dateStr === getLocalDateStr())} 
                onDeleteRecord={deleteRecord}
              />
            </div>
          </div>
        );
      case 'history':
        return (
          <div className="animate-fade-in">
            <h2 className={`text-xl font-bold mb-6 flex items-center gap-2 ${
              theme === 'cute' ? 'text-gray-800' : 'text-slate-200'
            }`}>
              <History className={theme === 'cute' ? 'text-pink-500' : 'text-cyan-400'} />
              歷史紀錄
            </h2>
            <HistoryLog racers={racers} records={records} onDeleteRecord={deleteRecord} theme={theme} />
          </div>
        );
      case 'analysis':
        return (
          <div className="animate-fade-in">
            <h2 className={`text-xl font-bold mb-6 flex items-center gap-2 ${
              theme === 'cute' ? 'text-gray-800' : 'text-slate-200'
            }`}>
              <BarChart2 className={theme === 'cute' ? 'text-pink-500' : 'text-cyan-400'} />
              數據分析
            </h2>
            <Analysis racers={racers} records={records} theme={theme} />
          </div>
        );
    }
  };

  return (
    <div 
      data-theme={theme}
      className={`min-h-screen pb-24 max-w-md mx-auto shadow-2xl overflow-hidden relative transition-colors duration-300 ${
        theme === 'cute' 
          ? 'bg-rose-50' 
          : 'bg-slate-900'
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
              <h1 className={`text-lg font-bold tracking-tight ${
                theme === 'cute' ? 'text-white' : 'text-white'
              }`}>
                滑步車測速紀錄
              </h1>
              <p className={`text-xs font-medium ${
                theme === 'cute' ? 'text-pink-100' : 'text-cyan-100'
              }`}>
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
        theme === 'cute' 
          ? 'bg-white border-t border-pink-100' 
          : 'bg-slate-800 border-t border-slate-700'
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