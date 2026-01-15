import React, { useState, useMemo, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity } from 'lucide-react';
import { Record, Racer, Distance } from '../types';
import { Theme, themes } from '../themes';

interface AnalysisProps {
  records: Record[];
  racers: Racer[];
  theme: Theme;
}

const Analysis: React.FC<AnalysisProps> = ({ records, racers, theme }) => {
  const currentTheme = themes[theme];
  const [selectedRacerId, setSelectedRacerId] = useState<string>(racers[0]?.id || '');
  const [selectedDistance, setSelectedDistance] = useState<Distance>(30);

  // If no initial selection but racers exist, set default
  useEffect(() => {
    if (!selectedRacerId && racers.length > 0) {
      setSelectedRacerId(racers[0].id);
    }
  }, [racers, selectedRacerId]);

  const chartData = useMemo(() => {
    if (!selectedRacerId) return [];
    
    return records
      .filter(r => r.racerId === selectedRacerId && r.distance === selectedDistance)
      .sort((a, b) => a.timestamp - b.timestamp)
      .map(r => ({
        date: r.dateStr.slice(5), // MM-DD
        time: r.timeSeconds
      }));
  }, [selectedRacerId, selectedDistance, records]);

  if (racers.length === 0) {
    return (
      <div className={`text-center py-10 ${
        theme === 'cute' ? 'text-gray-400' : 'text-slate-500'
      }`}>
        請先新增選手與紀錄以查看分析。
      </div>
    );
  }

  const bestTime = chartData.length > 0 ? Math.min(...chartData.map(d => d.time)) : 0;
  const avgTime = chartData.length > 0 ? (chartData.reduce((acc, curr) => acc + curr.time, 0) / chartData.length) : 0;

  return (
    <div className="space-y-6 pb-8">
      {/* Controls */}
      <div className={`${currentTheme.styles.cardBg} p-4 rounded-xl shadow-sm border ${currentTheme.colors.border} space-y-4`}>
        <div>
            <label className={`block text-xs font-bold uppercase tracking-wide mb-2 ${
              theme === 'cute' ? 'text-gray-400' : 'text-slate-500'
            }`}>
              選手
            </label>
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                {racers.map(r => (
                    <button
                        key={r.id}
                        onClick={() => {
                            setSelectedRacerId(r.id);
                        }}
                        className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                            selectedRacerId === r.id 
                            ? `${r.avatarColor} text-white shadow-md` 
                            : theme === 'cute'
                              ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                              : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                        }`}
                    >
                        {r.name}
                    </button>
                ))}
            </div>
        </div>
        
        <div>
            <label className={`block text-xs font-bold uppercase tracking-wide mb-2 ${
              theme === 'cute' ? 'text-gray-400' : 'text-slate-500'
            }`}>
              距離
            </label>
            <div className="flex gap-2">
                {[10, 30, 50].map((d) => (
                    <button
                        key={d}
                        onClick={() => setSelectedDistance(d as Distance)}
                        className={`flex-1 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                            selectedDistance === d
                            ? theme === 'cute'
                              ? 'bg-pink-100 text-pink-700 border border-pink-200'
                              : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                            : theme === 'cute'
                              ? 'bg-white border border-gray-200 text-gray-600'
                              : 'bg-slate-700 border border-slate-600 text-slate-400'
                        }`}
                    >
                        {d}m
                    </button>
                ))}
            </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4">
          <div className={`${currentTheme.styles.cardBg} p-4 rounded-xl shadow-sm border ${currentTheme.colors.border}`}>
              <p className={`text-xs mb-1 ${
                theme === 'cute' ? 'text-gray-500' : 'text-slate-400'
              }`}>
                最佳紀錄 (PB)
              </p>
              <p className={`text-2xl font-bold ${
                theme === 'cute' ? 'text-pink-600' : 'text-cyan-400'
              }`}>
                  {bestTime > 0 ? bestTime.toFixed(2) : '--'} <span className={`text-sm font-normal ${
                    theme === 'cute' ? 'text-gray-400' : 'text-slate-500'
                  }`}>s</span>
              </p>
          </div>
          <div className={`${currentTheme.styles.cardBg} p-4 rounded-xl shadow-sm border ${currentTheme.colors.border}`}>
              <p className={`text-xs mb-1 ${
                theme === 'cute' ? 'text-gray-500' : 'text-slate-400'
              }`}>
                平均秒數
              </p>
              <p className={`text-2xl font-bold ${
                theme === 'cute' ? 'text-rose-500' : 'text-blue-400'
              }`}>
                  {avgTime > 0 ? avgTime.toFixed(2) : '--'} <span className={`text-sm font-normal ${
                    theme === 'cute' ? 'text-gray-400' : 'text-slate-500'
                  }`}>s</span>
              </p>
          </div>
      </div>

      {/* Chart */}
      <div className={`${currentTheme.styles.cardBg} p-4 rounded-xl shadow-sm border ${currentTheme.colors.border} h-64`}>
        {chartData.length > 1 ? (
            <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{fontSize: 10}} stroke="#9ca3af" />
                <YAxis domain={['auto', 'auto']} tick={{fontSize: 10}} stroke="#9ca3af" />
                <Tooltip 
                    contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}}
                    labelStyle={{color: '#6b7280', fontSize: '12px'}}
                />
                <Line 
                    type="monotone" 
                    dataKey="time" 
                    stroke="#4f46e5" 
                    strokeWidth={3} 
                    dot={{ fill: '#4f46e5', strokeWidth: 2 }} 
                    activeDot={{ r: 6 }}
                    animationDuration={1000}
                />
            </LineChart>
            </ResponsiveContainer>
        ) : (
            <div className={`h-full flex flex-col items-center justify-center ${
              theme === 'cute' ? 'text-gray-400' : 'text-slate-500'
            }`}>
                <Activity className="mb-2 opacity-50" />
                <span className="text-sm">資料不足，無法顯示圖表</span>
            </div>
        )}
      </div>
    </div>
  );
};

export default Analysis;