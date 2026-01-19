import React, { useState, useMemo, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity } from 'lucide-react';
import { Record, Racer, Distance } from '../types';
import { Theme, themes } from '../themes';
import { getTextColor, getTextSecondaryColor, getPrimaryColor, getCardBgColor, getBorderColor } from '../themeUtils';

interface AnalysisProps {
  records: Record[];
  racers: Racer[];
  theme: Theme;
}

const Analysis: React.FC<AnalysisProps> = ({ records, racers, theme }) => {
  const currentTheme = themes[theme] || themes['light'];
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

  // 月份統計數據
  const monthlyData = useMemo(() => {
    if (!selectedRacerId) return [];
    
    const filteredRecords = records.filter(
      r => r.racerId === selectedRacerId && r.distance === selectedDistance
    );
    
    // 按月份分組
    const monthlyGroups: { [key: string]: number[] } = {};
    filteredRecords.forEach(r => {
      // 從 dateStr (YYYY-MM-DD) 提取年月 (YYYY-MM)
      const monthKey = r.dateStr.slice(0, 7); // YYYY-MM
      if (!monthlyGroups[monthKey]) {
        monthlyGroups[monthKey] = [];
      }
      monthlyGroups[monthKey].push(r.timeSeconds);
    });
    
    // 計算每個月的平均秒數
    return Object.entries(monthlyGroups)
      .map(([month, times]) => ({
        month,
        avgTime: times.reduce((sum, t) => sum + t, 0) / times.length,
        count: times.length,
        bestTime: Math.min(...times),
        // 格式化月份顯示為 "YYYY年MM月" 或 "MM月"
        monthLabel: `${month.slice(5)}月` // MM月
      }))
      .sort((a, b) => a.month.localeCompare(b.month)); // 按月份排序
  }, [selectedRacerId, selectedDistance, records]);

  // 30米與10米秒數差值數據（僅當30米有對應的10米記錄時）
  const timeDifferenceData = useMemo(() => {
    if (!selectedRacerId) return [];
    
    // 獲取該選手的30米和10米記錄
    const records30m = records.filter(
      r => r.racerId === selectedRacerId && r.distance === 30
    );
    const records10m = records.filter(
      r => r.racerId === selectedRacerId && r.distance === 10
    );
    
    // 按日期分組10米記錄（同一天可能有多筆，取第一筆）
    const records10mByDate: { [date: string]: Record } = {};
    records10m.forEach(r => {
      if (!records10mByDate[r.dateStr] || r.timestamp < records10mByDate[r.dateStr].timestamp) {
        records10mByDate[r.dateStr] = r;
      }
    });
    
    // 配對30米和10米記錄，計算差值
    const differenceData: Array<{
      date: string;
      dateLabel: string;
      difference: number;
      time30m: number;
      time10m: number;
      timestamp: number;
    }> = [];
    
    records30m.forEach(record30m => {
      const record10m = records10mByDate[record30m.dateStr];
      if (record10m) {
        // 找到同一天的10米記錄，計算差值
        const difference = record30m.timeSeconds - record10m.timeSeconds;
        differenceData.push({
          date: record30m.dateStr,
          dateLabel: record30m.dateStr.slice(5), // MM-DD
          difference: difference,
          time30m: record30m.timeSeconds,
          time10m: record10m.timeSeconds,
          timestamp: record30m.timestamp
        });
      }
    });
    
    // 按時間戳排序
    return differenceData.sort((a, b) => a.timestamp - b.timestamp);
  }, [selectedRacerId, records]);

  if (racers.length === 0) {
    return (
      <div className={`text-center py-10 ${getTextSecondaryColor(theme)}`}>
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
            <label className={`block text-xs font-bold uppercase tracking-wide mb-2 ${getTextSecondaryColor(theme)}`}>
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
                            : theme === 'cute' ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' :
                              theme === 'tech' ? 'bg-slate-700 text-slate-400 hover:bg-slate-600' :
                              theme === 'dark' ? 'bg-gray-700 text-gray-400 hover:bg-gray-600' :
                              'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                    >
                        {r.name}
                    </button>
                ))}
            </div>
        </div>
        
        <div>
            <label className={`block text-xs font-bold uppercase tracking-wide mb-2 ${getTextSecondaryColor(theme)}`}>
              距離
            </label>
            <div className="flex gap-2">
                {[10, 30, 50].map((d) => (
                    <button
                        key={d}
                        onClick={() => setSelectedDistance(d as Distance)}
                        className={`flex-1 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                            selectedDistance === d
                            ? theme === 'cute' ? 'bg-pink-100 text-pink-700 border border-pink-200' :
                              theme === 'tech' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' :
                              theme === 'dark' ? 'bg-gray-600/30 text-gray-200 border border-gray-500/30' :
                              'bg-gray-100 text-gray-700 border border-gray-300'
                            : theme === 'cute' ? 'bg-white border border-gray-200 text-gray-600' :
                              theme === 'tech' ? 'bg-slate-700 border border-slate-600 text-slate-400' :
                              theme === 'dark' ? 'bg-gray-700 border border-gray-600 text-gray-400' :
                              'bg-white border border-gray-200 text-gray-600'
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
              <p className={`text-xs mb-1 ${getTextSecondaryColor(theme)}`}>
                最佳紀錄 (PB)
              </p>
              <p className={`text-2xl font-bold ${
                theme === 'cute' ? 'text-pink-600' :
                theme === 'tech' ? 'text-cyan-400' :
                theme === 'dark' ? 'text-gray-300' :
                'text-gray-700'
              }`}>
                  {bestTime > 0 ? bestTime.toFixed(2) : '--'} <span className={`text-sm font-normal ${getTextSecondaryColor(theme)}`}>s</span>
              </p>
          </div>
          <div className={`${currentTheme.styles.cardBg} p-4 rounded-xl shadow-sm border ${currentTheme.colors.border}`}>
              <p className={`text-xs mb-1 ${getTextSecondaryColor(theme)}`}>
                平均秒數
              </p>
              <p className={`text-2xl font-bold ${
                theme === 'cute' ? 'text-rose-500' :
                theme === 'tech' ? 'text-blue-400' :
                theme === 'dark' ? 'text-gray-400' :
                'text-gray-600'
              }`}>
                  {avgTime > 0 ? avgTime.toFixed(2) : '--'} <span className={`text-sm font-normal ${getTextSecondaryColor(theme)}`}>s</span>
              </p>
          </div>
      </div>

      {/* Daily Chart */}
      <div className={`${currentTheme.styles.cardBg} p-4 rounded-xl shadow-sm border ${currentTheme.colors.border}`}>
        <h3 className={`text-sm font-bold mb-4 ${getTextColor(theme)}`}>
          每日秒數變化
        </h3>
        <div className="h-64">
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
              <div className={`h-full flex flex-col items-center justify-center ${getTextSecondaryColor(theme)}`}>
                  <Activity className="mb-2 opacity-50" />
                  <span className="text-sm">資料不足，無法顯示圖表</span>
              </div>
          )}
        </div>
      </div>

      {/* 30米與10米秒數差值分析 */}
      {timeDifferenceData.length > 0 && (
        <div className={`${currentTheme.styles.cardBg} p-4 rounded-xl shadow-sm border ${currentTheme.colors.border}`}>
          <h3 className={`text-sm font-bold mb-4 ${getTextColor(theme)}`}>
            30米與10米秒數差值變化（30米 - 10米）
          </h3>
          <div className="mb-4">
            <div className="grid grid-cols-3 gap-2">
              <div className={`p-2 rounded-lg ${
                theme === 'cute' ? 'bg-pink-50 border border-pink-200' :
                theme === 'tech' ? 'bg-slate-800/50 border border-slate-700' :
                theme === 'dark' ? 'bg-gray-800/50 border border-gray-700' :
                'bg-gray-50 border border-gray-200'
              }`}>
                <p className={`text-xs mb-1 ${getTextSecondaryColor(theme)}`}>平均差值</p>
                <p className={`text-lg font-bold ${
                  theme === 'cute' ? 'text-pink-600' :
                  theme === 'tech' ? 'text-cyan-400' :
                  theme === 'dark' ? 'text-gray-300' :
                  'text-gray-700'
                }`}>
                  {(timeDifferenceData.reduce((sum, d) => sum + d.difference, 0) / timeDifferenceData.length).toFixed(2)}
                  <span className={`text-xs font-normal ml-1 ${getTextSecondaryColor(theme)}`}>s</span>
                </p>
              </div>
              <div className={`p-2 rounded-lg ${
                theme === 'cute' ? 'bg-pink-50 border border-pink-200' :
                theme === 'tech' ? 'bg-slate-800/50 border border-slate-700' :
                theme === 'dark' ? 'bg-gray-800/50 border border-gray-700' :
                'bg-gray-50 border border-gray-200'
              }`}>
                <p className={`text-xs mb-1 ${getTextSecondaryColor(theme)}`}>最大差值</p>
                <p className={`text-lg font-bold ${
                  theme === 'cute' ? 'text-pink-600' :
                  theme === 'tech' ? 'text-cyan-400' :
                  theme === 'dark' ? 'text-gray-300' :
                  'text-gray-700'
                }`}>
                  {Math.max(...timeDifferenceData.map(d => d.difference)).toFixed(2)}
                  <span className={`text-xs font-normal ml-1 ${getTextSecondaryColor(theme)}`}>s</span>
                </p>
              </div>
              <div className={`p-2 rounded-lg ${
                theme === 'cute' ? 'bg-pink-50 border border-pink-200' :
                theme === 'tech' ? 'bg-slate-800/50 border border-slate-700' :
                theme === 'dark' ? 'bg-gray-800/50 border border-gray-700' :
                'bg-gray-50 border border-gray-200'
              }`}>
                <p className={`text-xs mb-1 ${getTextSecondaryColor(theme)}`}>最小差值</p>
                <p className={`text-lg font-bold ${
                  theme === 'cute' ? 'text-pink-600' :
                  theme === 'tech' ? 'text-cyan-400' :
                  theme === 'dark' ? 'text-gray-300' :
                  'text-gray-700'
                }`}>
                  {Math.min(...timeDifferenceData.map(d => d.difference)).toFixed(2)}
                  <span className={`text-xs font-normal ml-1 ${getTextSecondaryColor(theme)}`}>s</span>
                </p>
              </div>
            </div>
          </div>
          <div className="h-64">
            {timeDifferenceData.length > 1 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={timeDifferenceData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="dateLabel" 
                    tick={{fontSize: 10}} 
                    stroke="#9ca3af" 
                  />
                  <YAxis 
                    domain={['auto', 'auto']} 
                    tick={{fontSize: 10}} 
                    stroke="#9ca3af"
                    label={{ value: '差值(秒)', angle: -90, position: 'insideLeft', fontSize: 10 }}
                  />
                  <Tooltip 
                    contentStyle={{
                      borderRadius: '8px', 
                      border: 'none', 
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                      backgroundColor: currentTheme.styles.cardBg
                    }}
                    labelStyle={{color: getTextColor(theme), fontSize: '12px', fontWeight: 'bold'}}
                    formatter={(value: number, name: string, props: any) => {
                      if (name === 'difference' && props.payload) {
                        return [
                          `差值: ${value.toFixed(2)}s (30米: ${props.payload.time30m.toFixed(2)}s - 10米: ${props.payload.time10m.toFixed(2)}s)`,
                          '30米 - 10米'
                        ];
                      }
                      return [value, name];
                    }}
                    labelFormatter={(label) => `日期: ${label}`}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="difference" 
                    stroke={
                      theme === 'cute' ? '#f43f5e' :
                      theme === 'tech' ? '#f59e0b' :
                      theme === 'dark' ? '#fbbf24' :
                      '#f59e0b'
                    }
                    strokeWidth={3} 
                    dot={{ 
                      fill: theme === 'cute' ? '#f43f5e' :
                            theme === 'tech' ? '#f59e0b' :
                            theme === 'dark' ? '#fbbf24' :
                            '#f59e0b',
                      strokeWidth: 2 
                    }} 
                    activeDot={{ r: 6 }}
                    animationDuration={1000}
                    name="差值"
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className={`h-full flex flex-col items-center justify-center ${getTextSecondaryColor(theme)}`}>
                <Activity className="mb-2 opacity-50" />
                <span className="text-sm">需要至少兩筆配對記錄才能顯示趨勢</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Monthly Statistics */}
      {monthlyData.length > 0 && (
        <div className={`${currentTheme.styles.cardBg} p-4 rounded-xl shadow-sm border ${currentTheme.colors.border}`}>
          <h3 className={`text-sm font-bold mb-4 ${getTextColor(theme)}`}>
            月份秒數變化
          </h3>
          <div className="h-64">
            {monthlyData.length > 1 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="monthLabel" 
                    tick={{fontSize: 10}} 
                    stroke="#9ca3af" 
                  />
                  <YAxis 
                    domain={['auto', 'auto']} 
                    tick={{fontSize: 10}} 
                    stroke="#9ca3af"
                    label={{ value: '秒數', angle: -90, position: 'insideLeft', fontSize: 10 }}
                  />
                  <Tooltip 
                    contentStyle={{
                      borderRadius: '8px', 
                      border: 'none', 
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                      backgroundColor: currentTheme.styles.cardBg
                    }}
                    labelStyle={{color: getTextColor(theme), fontSize: '12px', fontWeight: 'bold'}}
                    formatter={(value: number) => [`${value.toFixed(2)} 秒`, '平均秒數']}
                    labelFormatter={(label) => `月份: ${label}`}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="avgTime" 
                    stroke={
                      theme === 'cute' ? '#ec4899' :
                      theme === 'tech' ? '#06b6d4' :
                      theme === 'dark' ? '#9ca3af' :
                      '#4f46e5'
                    }
                    strokeWidth={3} 
                    dot={{ 
                      fill: theme === 'cute' ? '#ec4899' :
                            theme === 'tech' ? '#06b6d4' :
                            theme === 'dark' ? '#9ca3af' :
                            '#4f46e5',
                      strokeWidth: 2 
                    }} 
                    activeDot={{ r: 6 }}
                    animationDuration={1000}
                    name="平均秒數"
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className={`h-full flex flex-col items-center justify-center ${getTextSecondaryColor(theme)}`}>
                <Activity className="mb-2 opacity-50" />
                <span className="text-sm">需要至少兩個月的資料才能顯示趨勢</span>
              </div>
            )}
          </div>
          
          {/* Monthly Stats Cards */}
          {monthlyData.length > 0 && (
            <div className="mt-4 grid grid-cols-2 gap-2">
              {monthlyData.slice(-3).reverse().map((month, index) => (
                <div 
                  key={month.month}
                  className={`p-3 rounded-lg border ${
                    theme === 'cute' ? 'bg-pink-50 border-pink-200' :
                    theme === 'tech' ? 'bg-slate-800/50 border-slate-700' :
                    theme === 'dark' ? 'bg-gray-800/50 border-gray-700' :
                    'bg-gray-50 border-gray-200'
                  }`}
                >
                  <p className={`text-xs font-medium mb-1 ${getTextSecondaryColor(theme)}`}>
                    {month.monthLabel}
                  </p>
                  <p className={`text-lg font-bold ${
                    theme === 'cute' ? 'text-pink-600' :
                    theme === 'tech' ? 'text-cyan-400' :
                    theme === 'dark' ? 'text-gray-300' :
                    'text-gray-700'
                  }`}>
                    {month.avgTime.toFixed(2)}<span className={`text-xs font-normal ml-1 ${getTextSecondaryColor(theme)}`}>s</span>
                  </p>
                  <p className={`text-xs mt-1 ${getTextSecondaryColor(theme)}`}>
                    {month.count} 筆紀錄 · 最佳 {month.bestTime.toFixed(2)}s
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Analysis;