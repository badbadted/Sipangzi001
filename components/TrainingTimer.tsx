
import React, { useState, useEffect, useRef } from 'react';
import { Play, Square, RotateCcw, Save, Watch } from 'lucide-react';
import { TrainingType } from '../types';
import { Theme, themes } from '../themes';
import { getTextColor, getPrimaryColor } from '../themeUtils';

interface TrainingTimerProps {
    racerId: string | null;
    onSaveSession: (type: TrainingType, duration: number, note?: string) => void;
    theme: Theme;
}

const TrainingTimer: React.FC<TrainingTimerProps> = ({ racerId, onSaveSession, theme }) => {
    const currentTheme = themes[theme] || themes['light'];
    const [isRunning, setIsRunning] = useState(false);
    const [time, setTime] = useState(0); // milliseconds
    const [type, setType] = useState<TrainingType>('sprint');
    const [note, setNote] = useState('');

    const timerRef = useRef<number | null>(null);
    const startTimeRef = useRef<number>(0);

    useEffect(() => {
        return () => {
            if (timerRef.current) {
                cancelAnimationFrame(timerRef.current);
            }
        };
    }, []);

    const startTimer = () => {
        if (isRunning) return;

        setIsRunning(true);
        startTimeRef.current = Date.now() - time;

        const tick = () => {
            setTime(Date.now() - startTimeRef.current);
            timerRef.current = requestAnimationFrame(tick);
        };

        timerRef.current = requestAnimationFrame(tick);
    };

    const stopTimer = () => {
        setIsRunning(false);
        if (timerRef.current) {
            cancelAnimationFrame(timerRef.current);
            timerRef.current = null;
        }
    };

    const resetTimer = () => {
        stopTimer();
        setTime(0);
        setNote('');
    };

    const handleSave = () => {
        if (time === 0 || !racerId) return;

        // Save in seconds (with decimals)
        onSaveSession(type, time / 1000, note);
        resetTimer();
    };

    const formatTime = (ms: number) => {
        const minutes = Math.floor(ms / 60000);
        const seconds = Math.floor((ms % 60000) / 1000);
        const centiseconds = Math.floor((ms % 1000) / 10);

        return (
            <div className="font-mono flex items-baseline justify-center gap-1">
                <span className="text-6xl font-bold">{minutes.toString().padStart(2, '0')}</span>
                <span className="text-2xl text-gray-400">:</span>
                <span className="text-6xl font-bold">{seconds.toString().padStart(2, '0')}</span>
                <span className="text-2xl text-gray-400">.</span>
                <span className="text-4xl text-gray-500">{centiseconds.toString().padStart(2, '0')}</span>
            </div>
        );
    };

    if (!racerId) {
        return (
            <div className="text-center p-8 text-gray-500 bg-gray-50 rounded-xl border border-gray-200">
                請先選擇選手以開始訓練
            </div>
        );
    }

    return (
        <div className={`${currentTheme.styles.cardBg} rounded-2xl shadow-lg p-6 mb-8 border ${currentTheme.colors.border}`}>
            <h2 className={`text-xl font-bold mb-6 flex items-center gap-2 ${getTextColor(theme)}`}>
                <Watch className={getPrimaryColor(theme)} />
                訓練計時
            </h2>

            {/* Type Selection */}
            <div className="grid grid-cols-3 gap-2 mb-8">
                {[
                    { id: 'sprint', label: '衝刺練習' },
                    { id: 'start_practice', label: '起跑反應' },
                    { id: 'endurance', label: '耐力訓練' },
                ].map((t) => (
                    <button
                        key={t.id}
                        onClick={() => setType(t.id as TrainingType)}
                        className={`py-2 px-1 rounded-lg text-sm font-bold transition-all ${type === t.id
                                ? theme === 'cute' ? 'bg-pink-500 text-white shadow-md' :
                                    theme === 'tech' ? 'bg-cyan-500 text-white shadow-md' :
                                        theme === 'dark' ? 'bg-gray-600 text-white shadow-md' :
                                            'bg-gray-800 text-white shadow-md'
                                : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                            }`}
                    >
                        {t.label}
                    </button>
                ))}
            </div>

            {/* Timer Display */}
            <div className={`text-center mb-8 p-6 rounded-2xl ${theme === 'tech' ? 'bg-slate-900 border border-slate-700' :
                    theme === 'dark' ? 'bg-black/20' :
                        'bg-gray-50'
                }`}>
                {formatTime(time)}
            </div>

            {/* Controls */}
            <div className="grid grid-cols-2 gap-4 mb-6">
                {!isRunning ? (
                    <button
                        onClick={startTimer}
                        className="flex items-center justify-center gap-2 py-4 rounded-xl text-xl font-bold text-white bg-green-500 hover:bg-green-600 shadow-lg shadow-green-200 transition-all active:scale-95"
                    >
                        <Play fill="currentColor" />
                        開始
                    </button>
                ) : (
                    <button
                        onClick={stopTimer}
                        className="flex items-center justify-center gap-2 py-4 rounded-xl text-xl font-bold text-white bg-red-500 hover:bg-red-600 shadow-lg shadow-red-200 transition-all active:scale-95"
                    >
                        <Square fill="currentColor" />
                        停止
                    </button>
                )}

                <button
                    onClick={resetTimer}
                    className="flex items-center justify-center gap-2 py-4 rounded-xl text-xl font-bold text-gray-600 bg-gray-200 hover:bg-gray-300 transition-all active:scale-95"
                >
                    <RotateCcw />
                    重置
                </button>
            </div>

            {/* Save Section */}
            {!isRunning && time > 0 && (
                <div className="animate-fade-in-up">
                    <input
                        type="text"
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder="備註 (可選)..."
                        className={`w-full p-3 rounded-lg border mb-3 ${theme === 'tech' ? 'bg-slate-800 border-slate-600 text-slate-200 placeholder-slate-500' :
                                theme === 'dark' ? 'bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-400' :
                                    'bg-white border-gray-200'
                            }`}
                    />
                    <button
                        onClick={handleSave}
                        className={`w-full py-3 rounded-xl font-bold text-white flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95 ${theme === 'cute' ? 'bg-gradient-to-r from-pink-500 to-rose-500 shadow-pink-200' :
                                theme === 'tech' ? 'bg-gradient-to-r from-cyan-500 to-blue-600 shadow-cyan-500/30' :
                                    theme === 'dark' ? 'bg-gradient-to-r from-gray-700 to-gray-600 shadow-gray-900/30' :
                                        'bg-gradient-to-r from-gray-800 to-gray-900 shadow-gray-300'
                            }`}
                    >
                        <Save size={20} />
                        儲存本次訓練
                    </button>
                </div>
            )}
        </div>
    );
};

export default TrainingTimer;
