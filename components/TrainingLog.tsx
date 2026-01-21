
import React from 'react';
import { Trash2, Activity, Play, Zap, Clock } from 'lucide-react';
import { TrainingSession, Racer, TrainingType } from '../types';
import { Theme, themes } from '../themes';
import { getTextColor, getBackgroundColor } from '../themeUtils';

interface TrainingLogProps {
    racers: Racer[];
    sessions: TrainingSession[];
    onDeleteSession: (id: string) => void;
    theme: Theme;
}

const TrainingLog: React.FC<TrainingLogProps> = ({ racers, sessions, onDeleteSession, theme }) => {
    const currentTheme = themes[theme] || themes['light'];

    const getTypeLabel = (type: TrainingType) => {
        switch (type) {
            case 'sprint': return '衝刺';
            case 'endurance': return '耐力';
            case 'start_practice': return '起跑';
            default: return type;
        }
    };

    const getTypeIcon = (type: TrainingType) => {
        switch (type) {
            case 'sprint': return <Zap size={14} className="text-yellow-500" />;
            case 'endurance': return <Activity size={14} className="text-blue-500" />;
            case 'start_practice': return <Play size={14} className="text-green-500" />;
            default: return <Clock size={14} />;
        }
    };

    const getRacerName = (racerId: string) => {
        const racer = racers.find(r => r.id === racerId);
        return racer ? racer.name : '未知選手';
    };

    const getRacerColor = (racerId: string) => {
        const racer = racers.find(r => r.id === racerId);
        return racer ? racer.avatarColor : 'bg-gray-400';
    };

    if (sessions.length === 0) {
        return (
            <div className={`text-center py-8 rounded-xl border-2 border-dashed ${theme === 'dark' ? 'border-gray-700 text-gray-500' : 'border-gray-200 text-gray-400'
                }`}>
                尚無訓練紀錄
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {sessions.map((session) => (
                <div
                    key={session.id}
                    className={`${currentTheme.styles.cardBg} p-4 rounded-xl shadow-sm border flex items-center justify-between transition-all hover:shadow-md ${currentTheme.colors.border}`}
                >
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 ${getRacerColor(session.racerId)} rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm shrink-0`}>
                            {getRacerName(session.racerId).substring(0, 1)}
                        </div>

                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className={`text-xs px-2 py-0.5 rounded-full flex items-center gap-1 border ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-gray-300' : 'bg-gray-100 border-gray-200 text-gray-600'
                                    }`}>
                                    {getTypeIcon(session.type)}
                                    {getTypeLabel(session.type)}
                                </span>
                                <span className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                                    }`}>
                                    {new Date(session.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>

                            <div className="flex items-baseline gap-2">
                                <span className={`text-xl font-bold font-mono ${getTextColor(theme)}`}>
                                    {session.durationSeconds.toFixed(2)}s
                                </span>
                                {session.note && (
                                    <span className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                                        }`}>
                                        - {session.note}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={() => {
                            if (confirm('確定要刪除這筆訓練紀錄嗎？')) {
                                onDeleteSession(session.id);
                            }
                        }}
                        className={`p-2 rounded-lg transition-colors opacity-60 hover:opacity-100 ${theme === 'cute' ? 'text-pink-300 hover:text-pink-500 hover:bg-pink-50' :
                            theme === 'tech' ? 'text-slate-500 hover:text-red-400 hover:bg-slate-700' :
                                theme === 'dark' ? 'text-gray-600 hover:text-red-400 hover:bg-gray-700' :
                                    'text-gray-300 hover:text-red-500 hover:bg-red-50'
                            }`}
                    >
                        <Trash2 size={18} />
                    </button>
                </div>
            ))}
        </div>
    );
};

export default TrainingLog;
