
import React, { useState, useEffect, useRef } from 'react';
import { Play, Square, RotateCcw, Watch } from 'lucide-react';
import { Distance } from '../types';
import { Theme, themes } from '../themes';
import { getTextColor, getPrimaryColor } from '../themeUtils';

interface TrainingTimerProps {
    racerId: string | null;
    onSaveRecord: (distance: Distance, timeSeconds: number, note?: string) => void;
    theme: Theme;
}

const TrainingTimer: React.FC<TrainingTimerProps> = ({ racerId, onSaveRecord, theme }) => {
    const currentTheme = themes[theme] || themes['light'];
    const [isRunning, setIsRunning] = useState(false);
    const [time, setTime] = useState(0); // milliseconds
    const [distance, setDistance] = useState<Distance>(30); // 選擇距離：30米或50米

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
        
        // 停止時自動儲存
        if (time > 0 && racerId) {
            const timeSeconds = time / 1000;
            onSaveRecord(distance, timeSeconds);
            // 重置計時器
            setTime(0);
        }
    };

    const resetTimer = () => {
        stopTimer();
        setTime(0);
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
                請先選擇選手以開始碼表測速
            </div>
        );
    }

    return (
        <div className={`${currentTheme.styles.cardBg} rounded-2xl shadow-lg p-6 mb-8 border ${currentTheme.colors.border}`}>
            <h2 className={`text-xl font-bold mb-6 flex items-center gap-2 ${getTextColor(theme)}`}>
                <Watch className={getPrimaryColor(theme)} />
                碼表測速
            </h2>

            {/* Distance Selection - 選擇 30米或50米 */}
            <div className="grid grid-cols-2 gap-2 mb-8">
                {[
                    { id: 30, label: '30米' },
                    { id: 50, label: '50米' },
                ].map((d) => (
                    <button
                        key={d.id}
                        onClick={() => setDistance(d.id as Distance)}
                        className={`py-2 px-1 rounded-lg text-sm font-bold transition-all ${distance === d.id
                                ? theme === 'cute' ? 'bg-pink-500 text-white shadow-md' :
                                    theme === 'tech' ? 'bg-cyan-500 text-white shadow-md' :
                                        theme === 'dark' ? 'bg-gray-600 text-white shadow-md' :
                                            'bg-gray-800 text-white shadow-md'
                                : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                            }`}
                    >
                        {d.label}
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
            <div className="grid grid-cols-2 gap-4">
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
        </div>
    );
};

export default TrainingTimer;
