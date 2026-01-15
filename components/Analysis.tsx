import React, { useState, useMemo, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, Sparkles, Loader2 } from 'lucide-react';
import { Record, Racer, Distance } from '../types';
import { analyzePerformance } from '../services/geminiService';

interface AnalysisProps {
  records: Record[];
  racers: Racer[];
}

const Analysis: React.FC<AnalysisProps> = ({ records, racers }) => {
  const [selectedRacerId, setSelectedRacerId] = useState<string>(racers[0]?.id || '');
  const [selectedDistance, setSelectedDistance] = useState<Distance>(30);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

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

  const handleAnalyze = async () => {
    const racer = racers.find(r => r.id === selectedRacerId);
    if (!racer) return;

    setIsAnalyzing(true);
    setAnalysisResult(null);
    try {
      const result = await analyzePerformance(racer, records);
      setAnalysisResult(result);
    } catch (error) {
      setAnalysisResult("分析發生錯誤，請稍後再試。");
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (racers.length === 0) {
    return <div className="text-center py-10 text-gray-400">請先新增選手與紀錄以查看分析。</div>;
  }

  const bestTime = chartData.length > 0 ? Math.min(...chartData.map(d => d.time)) : 0;
  const avgTime = chartData.length > 0 ? (chartData.reduce((acc, curr) => acc + curr.time, 0) / chartData.length) : 0;

  return (
    <div className="space-y-6 pb-8">
      {/* Controls */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 space-y-4">
        <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">選手</label>
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                {racers.map(r => (
                    <button
                        key={r.id}
                        onClick={() => {
                            setSelectedRacerId(r.id);
                            setAnalysisResult(null);
                        }}
                        className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                            selectedRacerId === r.id 
                            ? `${r.avatarColor} text-white shadow-md` 
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                    >
                        {r.name}
                    </button>
                ))}
            </div>
        </div>
        
        <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">距離</label>
            <div className="flex gap-2">
                {[10, 30, 50].map((d) => (
                    <button
                        key={d}
                        onClick={() => setSelectedDistance(d as Distance)}
                        className={`flex-1 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                            selectedDistance === d
                            ? 'bg-indigo-100 text-indigo-700 border border-indigo-200'
                            : 'bg-white border border-gray-200 text-gray-600'
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
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
              <p className="text-xs text-gray-500 mb-1">最佳紀錄 (PB)</p>
              <p className="text-2xl font-bold text-indigo-600">
                  {bestTime > 0 ? bestTime.toFixed(2) : '--'} <span className="text-sm text-gray-400 font-normal">s</span>
              </p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
              <p className="text-xs text-gray-500 mb-1">平均秒數</p>
              <p className="text-2xl font-bold text-emerald-600">
                  {avgTime > 0 ? avgTime.toFixed(2) : '--'} <span className="text-sm text-gray-400 font-normal">s</span>
              </p>
          </div>
      </div>

      {/* Chart */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 h-64">
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
            <div className="h-full flex flex-col items-center justify-center text-gray-400">
                <Activity className="mb-2 opacity-50" />
                <span className="text-sm">資料不足，無法顯示圖表</span>
            </div>
        )}
      </div>

      {/* AI Analysis Section */}
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-5 rounded-2xl border border-indigo-100">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-indigo-900 flex items-center gap-2">
            <Sparkles size={18} className="text-amber-500" />
            AI 教練評語
          </h3>
        </div>
        
        {analysisResult ? (
          <div className="bg-white/80 p-4 rounded-xl text-sm text-gray-700 leading-relaxed shadow-sm whitespace-pre-line animate-fade-in">
            {analysisResult}
          </div>
        ) : (
          <div className="text-center">
             <button
              onClick={handleAnalyze}
              disabled={isAnalyzing || chartData.length === 0}
              className="bg-white text-indigo-600 px-6 py-3 rounded-xl font-bold text-sm shadow-sm border border-indigo-100 hover:bg-indigo-50 hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 mx-auto"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  分析中...
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  {chartData.length === 0 ? '請先累積紀錄' : '取得教練分析'}
                </>
              )}
            </button>
            <p className="text-xs text-indigo-300 mt-2">
              Gemini AI 將分析近期表現並給予建議
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Analysis;