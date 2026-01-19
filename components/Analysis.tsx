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

  // 10米數據
  const chartData10m = useMemo(() => {
    if (!selectedRacerId) return [];
    
    return records
      .filter(r => r.racerId === selectedRacerId && r.distance === 10)
      .sort((a, b) => a.timestamp - b.timestamp)
      .map(r => ({
        date: r.dateStr.slice(5), // MM-DD
        time: r.timeSeconds,
        timestamp: r.timestamp
      }));
  }, [selectedRacerId, records]);

  // 30米但沒有10米的記錄
  const chartData30mWithout10m = useMemo(() => {
    if (!selectedRacerId) return [];
    
    const records30m = records.filter(r => r.racerId === selectedRacerId && r.distance === 30);
    const records10m = records.filter(r => r.racerId === selectedRacerId && r.distance === 10);
    
    // 建立10米記錄的日期集合（包含時間戳接近的）
    const has10mDates = new Set<string>();
    records30m.forEach(record30m => {
      const sameDay10m = records10m.filter(
        r => r.dateStr === record30m.dateStr
      );
      if (sameDay10m.length > 0) {
        const closest10m = sameDay10m.reduce((closest, current) => {
          const closestDiff = Math.abs(closest.timestamp - record30m.timestamp);
          const currentDiff = Math.abs(current.timestamp - record30m.timestamp);
          return currentDiff < closestDiff ? current : closest;
        });
        const timeDiff = Math.abs(closest10m.timestamp - record30m.timestamp);
        if (timeDiff <= 2000) {
          has10mDates.add(record30m.dateStr);
        }
      }
    });
    
    // 返回沒有10米記錄的30米記錄
    return records30m
      .filter(r => !has10mDates.has(r.dateStr))
      .sort((a, b) => a.timestamp - b.timestamp)
      .map(r => ({
        date: r.dateStr.slice(5), // MM-DD
        time: r.timeSeconds,
        timestamp: r.timestamp
      }));
  }, [selectedRacerId, records]);

  // 30米數據
  const chartData30m = useMemo(() => {
    if (!selectedRacerId) return [];
    
    return records
      .filter(r => r.racerId === selectedRacerId && r.distance === 30)
      .sort((a, b) => a.timestamp - b.timestamp)
      .map(r => ({
        date: r.dateStr.slice(5), // MM-DD
        time: r.timeSeconds,
        timestamp: r.timestamp
      }));
  }, [selectedRacerId, records]);

  // 50米數據
  const chartData50m = useMemo(() => {
    if (!selectedRacerId) return [];
    
    return records
      .filter(r => r.racerId === selectedRacerId && r.distance === 50)
      .sort((a, b) => a.timestamp - b.timestamp)
      .map(r => ({
        date: r.dateStr.slice(5), // MM-DD
        time: r.timeSeconds,
        timestamp: r.timestamp
      }));
  }, [selectedRacerId, records]);

  // 通用圖表數據（用於其他距離）
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
    
    // 配對30米和10米記錄，計算差值
    const differenceData: Array<{
      date: string;
      dateLabel: string;
      difference: number;
      time30m: number;
      time10m: number;
      timestamp: number;
    }> = [];
    
    // 用於追蹤已配對的10米記錄，避免重複配對
    const used10mRecords = new Set<string>();
    
    records30m.forEach(record30m => {
      // 在同一天的10米記錄中，找時間戳最接近的（且未被使用過的）
      const sameDay10m = records10m.filter(
        r => r.dateStr === record30m.dateStr && !used10mRecords.has(r.id)
      );
      
      // 如果30米記錄沒有對應的10米記錄，跳過（不列入分析表）
      if (sameDay10m.length === 0) {
        return; // 跳過這個30米記錄
      }
      
      // 找時間戳最接近的10米記錄
      // 由於10米記錄的timestamp通常是30米記錄的timestamp + 1，所以找最接近的
      const closest10m = sameDay10m.reduce((closest, current) => {
        const closestDiff = Math.abs(closest.timestamp - record30m.timestamp);
        const currentDiff = Math.abs(current.timestamp - record30m.timestamp);
        return currentDiff < closestDiff ? current : closest;
      });
      
      // 檢查時間戳是否在合理範圍內（30米和10米記錄應該是在同一時間創建的，相差不超過2秒）
      // 根據代碼邏輯，10米記錄的timestamp通常是30米記錄的timestamp + 1毫秒
      const timeDiff = Math.abs(closest10m.timestamp - record30m.timestamp);
      
      // 如果時間戳差超過2秒，視為不相關的記錄，不列入分析表
      if (timeDiff > 2000) {
        return; // 跳過這個30米記錄（沒有配對到合適的10米記錄）
      }
      
      // 找到配對的10米記錄，計算差值並加入分析表
      const difference = record30m.timeSeconds - closest10m.timeSeconds;
      differenceData.push({
        date: record30m.dateStr,
        dateLabel: record30m.dateStr.slice(5), // MM-DD
        difference: difference,
        time30m: record30m.timeSeconds,
        time10m: closest10m.timeSeconds,
        timestamp: record30m.timestamp
      });
      
      // 標記這個10米記錄已被使用
      used10mRecords.add(closest10m.id);
    });
    
    // 按時間戳排序
    return differenceData.sort((a, b) => a.timestamp - b.timestamp);
  }, [selectedRacerId, records]);

  // 判斷30米是否有關聯到10米的資料
  const has30mWith10m = useMemo(() => {
    if (!selectedRacerId || selectedDistance !== 30) return false;
    return timeDifferenceData.length > 0;
  }, [selectedRacerId, selectedDistance, timeDifferenceData]);

  if (racers.length === 0) {
    return (
      <div className={`text-center py-10 ${getTextSecondaryColor(theme)}`}>
        請先新增選手與紀錄以查看分析。
      </div>
    );
  }

  // 根據選中的距離計算統計數據
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

      {/* 10米每日秒數變化：選擇10m時顯示，或選擇30m且有配對資料時顯示 */}
      {chartData10m.length > 0 && (selectedDistance === 10 || (selectedDistance === 30 && has30mWith10m)) && (
        <div className={`${currentTheme.styles.cardBg} p-4 rounded-xl shadow-sm border ${currentTheme.colors.border}`}>
          <h3 className={`text-sm font-bold mb-4 ${getTextColor(theme)}`}>
            10米每日秒數變化
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData10m}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="#9ca3af" />
                <YAxis domain={['auto', 'auto']} tick={{ fontSize: 10 }} stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                  labelStyle={{ color: '#6b7280', fontSize: '12px' }}
                  formatter={(value: number) => [`${value.toFixed(2)} 秒`, '10米']}
                />
                <Line
                  type="monotone"
                  dataKey="time"
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
                  name="10米"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* 30米每日秒數變化（只在選擇30m時顯示） */}
      {selectedDistance === 30 && chartData30m.length > 0 && (
        <div className={`${currentTheme.styles.cardBg} p-4 rounded-xl shadow-sm border ${currentTheme.colors.border}`}>
          <h3 className={`text-sm font-bold mb-4 ${getTextColor(theme)}`}>
            30米每日秒數變化
          </h3>
          <div className="h-64">
            {chartData30m.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData30m}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="date" tick={{fontSize: 10}} stroke="#9ca3af" />
                  <YAxis domain={['auto', 'auto']} tick={{fontSize: 10}} stroke="#9ca3af" />
                  <Tooltip 
                    contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}}
                    labelStyle={{color: '#6b7280', fontSize: '12px'}}
                    formatter={(value: number) => [`${value.toFixed(2)} 秒`, '30米']}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="time" 
                    stroke={
                      theme === 'cute' ? '#f43f5e' :
                      theme === 'tech' ? '#3b82f6' :
                      theme === 'dark' ? '#60a5fa' :
                      '#3b82f6'
                    }
                    strokeWidth={3} 
                    dot={{ 
                      fill: theme === 'cute' ? '#f43f5e' :
                            theme === 'tech' ? '#3b82f6' :
                            theme === 'dark' ? '#60a5fa' :
                            '#3b82f6',
                      strokeWidth: 2 
                    }} 
                    activeDot={{ r: 6 }}
                    animationDuration={1000}
                    name="30米"
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
      )}

      {/* 50米每日秒數變化（只在選擇50m時顯示） */}
      {selectedDistance === 50 && chartData50m.length > 0 && (
        <div className={`${currentTheme.styles.cardBg} p-4 rounded-xl shadow-sm border ${currentTheme.colors.border}`}>
          <h3 className={`text-sm font-bold mb-4 ${getTextColor(theme)}`}>
            50米每日秒數變化
          </h3>
          <div className="h-64">
            {chartData50m.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData50m}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="date" tick={{fontSize: 10}} stroke="#9ca3af" />
                  <YAxis domain={['auto', 'auto']} tick={{fontSize: 10}} stroke="#9ca3af" />
                  <Tooltip 
                    contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}}
                    labelStyle={{color: '#6b7280', fontSize: '12px'}}
                    formatter={(value: number) => [`${value.toFixed(2)} 秒`, '50米']}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="time" 
                    stroke={
                      theme === 'cute' ? '#f97316' :
                      theme === 'tech' ? '#8b5cf6' :
                      theme === 'dark' ? '#a78bfa' :
                      '#8b5cf6'
                    }
                    strokeWidth={3} 
                    dot={{ 
                      fill: theme === 'cute' ? '#f97316' :
                            theme === 'tech' ? '#8b5cf6' :
                            theme === 'dark' ? '#a78bfa' :
                            '#8b5cf6',
                      strokeWidth: 2 
                    }} 
                    activeDot={{ r: 6 }}
                    animationDuration={1000}
                    name="50米"
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
      )}

      {/* 30米與10米秒數差值分析（只在選擇30m且有配對資料時顯示） */}
      {selectedDistance === 30 && timeDifferenceData.length > 0 && (
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

      {/* 30米(未登錄10米)分析圖 */}
      {chartData30mWithout10m.length > 0 && (
        <div className={`${currentTheme.styles.cardBg} p-4 rounded-xl shadow-sm border ${currentTheme.colors.border}`}>
          <h3 className={`text-sm font-bold mb-4 ${getTextColor(theme)}`}>
            30米(未登錄10米)每日秒數變化
          </h3>
          <div className="h-64">
            {chartData30mWithout10m.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData30mWithout10m}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis dataKey="date" tick={{fontSize: 10}} stroke="#9ca3af" />
                    <YAxis domain={['auto', 'auto']} tick={{fontSize: 10}} stroke="#9ca3af" />
                    <Tooltip 
                        contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}}
                        labelStyle={{color: '#6b7280', fontSize: '12px'}}
                        formatter={(value: number) => [`${value.toFixed(2)} 秒`, '30米(未登錄10米)']}
                    />
                    <Line 
                        type="monotone" 
                        dataKey="time" 
                        stroke={
                          theme === 'cute' ? '#f97316' :
                          theme === 'tech' ? '#f59e0b' :
                          theme === 'dark' ? '#fbbf24' :
                          '#f59e0b'
                        }
                        strokeWidth={3} 
                        dot={{ 
                          fill: theme === 'cute' ? '#f97316' :
                                theme === 'tech' ? '#f59e0b' :
                                theme === 'dark' ? '#fbbf24' :
                                '#f59e0b',
                          strokeWidth: 2 
                        }} 
                        activeDot={{ r: 6 }}
                        animationDuration={1000}
                        name="30米(未登錄10米)"
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