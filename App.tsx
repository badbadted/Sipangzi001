import React, { useState, useEffect, useRef } from 'react';
import { Timer, Watch, Play, Pause, RotateCcw, Flag } from 'lucide-react';
import { ref, push, onValue, set, remove } from "firebase/database";
import { db } from "./firebase.ts"; // 確保 firebase.ts 在同一個資料夾 
import { AppMode, Lap } from './types';

const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>(AppMode.STOPWATCH);
  
  // 計時器相關 State
  const [time, setTime] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [laps, setLaps] = useState<any[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // --- 1. 監聽 Firebase 雲端紀錄 ---
  useEffect(() => {
    const lapsRef = ref(db, 'laps');
    const unsubscribe = onValue(lapsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        // 將 Firebase 物件轉換為陣列並排序
        const firebaseLaps = Object.entries(data).map(([key, value]: [string, any]) => ({
          id: key,
          time: value.time,
          split: value.split,
          createdAt: value.createdAt
        })).sort((a, b) => b.createdAt - a.createdAt); // 最新的在前
        setLaps(firebaseLaps);
      } else {
        setLaps([]);
      }
    });
    return () => unsubscribe();
  }, []);

  // --- 2. 計時邏輯 ---
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTime((prevTime) => prevTime + 10);
      }, 10);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning]);

  // --- 3. 功能按鈕 ---
  const handleStartPause = () => setIsRunning(!isRunning);

  const handleReset = () => {
    setIsRunning(false);
    setTime(0);
    if (window.confirm("要清空雲端紀錄嗎？")) {
      remove(ref(db, 'laps'));
    }
  };

  const handleRecordLap = () => {
    const lastLapTime = laps.length > 0 ? laps[0].time : 0;
    const newLapData = {
      time: time,
      split: time - lastLapTime,
      createdAt: Date.now()
    };
    push(ref(db, 'laps'), newLapData);
  };

  // 格式化時間顯示 (00:00.00)
  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    const centiseconds = Math.floor((ms % 1000) / 10);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${centiseconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 font-sans flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-gray-900/40 backdrop-blur-xl border border-gray-800 rounded-3xl shadow-2xl flex flex-col h-[85vh]">
        
        <header className="p-2 grid grid-cols-2 gap-2 bg-gray-900/50 m-4 rounded-2xl border border-gray-800/50">
          <button onClick={() => setMode(AppMode.STOPWATCH)} className={`flex items-center justify-center gap-2 py-3 rounded-xl ${mode === AppMode.STOPWATCH ? 'bg-gray-800 text-white' : 'text-gray-500'}`}>
            <Watch size={18} /><span>Stopwatch</span>
          </button>
          <button onClick={() => setMode(AppMode.TIMER)} className={`flex items-center justify-center gap-2 py-3 rounded-xl ${mode === AppMode.TIMER ? 'bg-gray-800 text-white' : 'text-gray-500'}`}>
            <Timer size={18} /><span>Timer</span>
          </button>
        </header>

        <main className="flex-1 flex flex-col items-center justify-center p-6">
          <div className="text-6xl font-mono mb-12 tracking-tighter text-indigo-400">
            {formatTime(time)}
          </div>

          <div className="flex gap-6 mb-12">
            <button onClick={handleReset} className="p-4 bg-gray-800 rounded-full hover:bg-gray-700 transition-colors"><RotateCcw size={28} /></button>
            <button onClick={handleStartPause} className="p-6 bg-indigo-600 rounded-full hover:bg-indigo-500 shadow-lg shadow-indigo-500/20 transition-all">
              {isRunning ? <Pause size={32} fill="white" /> : <Play size={32} fill="white" />}
            </button>
            <button onClick={handleRecordLap} disabled={!isRunning} className="p-4 bg-gray-800 rounded-full hover:bg-gray-700 disabled:opacity-30"><Flag size={28} /></button>
          </div>

          <div className="w-full flex-1 overflow-y-auto no-scrollbar border-t border-gray-800 pt-4">
            {laps.map((lap, index) => (
              <div key={lap.id} className="flex justify-between py-3 border-bottom border-gray-800/50">
                <span className="text-gray-500">Lap {laps.length - index}</span>
                <span className="font-mono text-indigo-300">+{formatTime(lap.split)}</span>
                <span className="font-mono">{formatTime(lap.time)}</span>
              </div>
            ))}
          </div>
        </main>

        <footer className="p-6 text-center text-xs text-gray-600 border-t border-gray-800/50">
            CHRONOS AI v1.0 • Multi-Device Cloud Sync
        </footer>
      </div>
    </div>
  );
};

export default App;