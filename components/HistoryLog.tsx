import React, { useMemo, useState, useCallback } from 'react';
import { Calendar, Trash2, AlertCircle } from 'lucide-react';
import { Record, GroupedRecords, Racer, Distance } from '../types';
import { Theme, themes } from '../themes';
import { getTextColor, getTextSecondaryColor, getPrimaryColor, getCardBgColor, getBorderColor } from '../themeUtils';

interface HistoryLogProps {
  records: Record[];
  racers: Racer[];
  onDeleteRecord?: (id: string) => void;
  theme: Theme;
}

interface RecordItemProps {
  record: Record;
  racer: Racer | undefined;
  theme: Theme;
  onDelete?: (id: string) => void;
}

// 優化：使用 React.memo 避免不必要的重繪
const RecordItem = React.memo<RecordItemProps>(({ record, racer, theme, onDelete }) => {
  const currentTheme = themes[theme] || themes['light'];
  const handleDeleteClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete?.(record.id);
  }, [record.id, onDelete]);

  return (
    <div className={`${currentTheme.styles.cardBg} p-3 rounded-xl shadow-sm border ${currentTheme.colors.border} flex items-center justify-between group relative overflow-hidden`}>
      <div className="flex items-center gap-3 relative z-0">
        {racer?.avatar ? (
          <img 
            src={racer.avatar} 
            alt={racer.name}
            className="w-10 h-10 rounded-full object-cover border border-gray-200"
          />
        ) : (
          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm ${racer?.avatarColor || (
            theme === 'light' ? 'bg-gray-300' :
            theme === 'vibrant' ? 'bg-yellow-400' :
            theme === 'pixel' ? 'bg-black' :
            theme === 'space' ? 'bg-cyan-500' :
            theme === 'playground' ? 'bg-red-500' :
            'bg-gray-300'
          )}`}>
            {racer?.name[0] || '?'}
          </div>
        )}
        <div>
          <p className={`font-bold ${getTextColor(theme)}`}>
            {racer?.name || '未知選手'}
          </p>
          <div className="flex items-center gap-2">
            <span className={`text-xs px-2 py-0.5 rounded font-medium ${
              theme === 'light' ? 'bg-gray-100 text-gray-500' :
              theme === 'vibrant' ? 'bg-yellow-100 text-yellow-700' :
              theme === 'pixel' ? 'bg-black text-white' :
              theme === 'space' ? 'bg-cyan-500/20 text-cyan-300' :
              theme === 'playground' ? 'bg-red-100 text-red-700' :
              'bg-gray-100 text-gray-500'
            }`}>
              {record.distance} 米
            </span>
            {/* 顯示記錄類型標籤 */}
            {record.recordType && (
              <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                record.recordType === 'training'
                  ? theme === 'light' ? 'bg-blue-100 text-blue-600' :
                      theme === 'vibrant' ? 'bg-yellow-200 text-yellow-800' :
                      theme === 'pixel' ? 'bg-black text-white' :
                      theme === 'space' ? 'bg-cyan-500/20 text-cyan-300' :
                      theme === 'playground' ? 'bg-red-200 text-red-800' :
                      'bg-blue-100 text-blue-600'
                  : theme === 'light' ? 'bg-gray-100 text-gray-600' :
                      theme === 'vibrant' ? 'bg-gray-200 text-gray-800' :
                      theme === 'pixel' ? 'bg-gray-200 text-black' :
                      theme === 'space' ? 'bg-indigo-800/50 text-cyan-200' :
                      theme === 'playground' ? 'bg-gray-100 text-gray-700' :
                      'bg-gray-100 text-gray-600'
              }`}>
                {record.recordType === 'training' ? '碼表測速' : '輸入測速'}
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3 relative z-0">
        <span className={`text-xl font-mono font-bold ${getTextColor(theme)}`}>
          {record.timeSeconds.toFixed(2)}<span className={`text-xs ml-1 ${getTextSecondaryColor(theme)}`}>s</span>
        </span>
        {onDelete && (
          <button
            onClick={handleDeleteClick}
            className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 active:bg-red-100 rounded-full transition-all cursor-pointer relative z-10"
            title="刪除"
            aria-label="刪除紀錄"
            type="button"
          >
            <Trash2 size={18} />
          </button>
        )}
      </div>
    </div>
  );
});

RecordItem.displayName = 'RecordItem';

const HistoryLog: React.FC<HistoryLogProps> = ({ records, racers, onDeleteRecord, theme }) => {
  const currentTheme = themes[theme] || themes['light'];
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [selectedDistance, setSelectedDistance] = useState<Distance | 'all'>('all');
  
  // 根據選擇的距離過濾記錄
  const filteredRecords = useMemo(() => {
    if (selectedDistance === 'all') {
      return records;
    }
    return records.filter(r => r.distance === selectedDistance);
  }, [records, selectedDistance]);
  
  const groupedRecords = useMemo(() => {
    const groups: GroupedRecords = {};
    filteredRecords.forEach(record => {
      if (!groups[record.dateStr]) {
        groups[record.dateStr] = [];
      }
      groups[record.dateStr].push(record);
    });
    // Sort dates descending
    return Object.keys(groups).sort((a, b) => new Date(b).getTime() - new Date(a).getTime()).reduce(
      (obj, key) => { 
        obj[key] = groups[key].sort((a, b) => b.timestamp - a.timestamp); // Sort records within date by time desc (latest first)
        return obj;
      }, 
      {} as GroupedRecords
    );
  }, [filteredRecords]);

  // 優化：建立 racer lookup map 以提升效能
  const racerMap = useMemo(() => {
    return new Map(racers.map(r => [r.id, r]));
  }, [racers]);

  const getRacer = useCallback((id: string) => racerMap.get(id), [racerMap]);

  const confirmDelete = () => {
    if (deleteId && onDeleteRecord) {
      onDeleteRecord(deleteId);
      setDeleteId(null);
    }
  };

  if (records.length === 0) {
    return (
      <div className={`text-center py-12 ${getTextSecondaryColor(theme)}`}>
        <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
          theme === 'light' ? 'bg-gray-100' :
          theme === 'vibrant' ? 'bg-yellow-100' :
          theme === 'pixel' ? 'bg-black' :
          theme === 'space' ? 'bg-indigo-800/50' :
          theme === 'playground' ? 'bg-red-100' :
          'bg-gray-100'
        }`}>
          <Calendar size={24} className={getPrimaryColor(theme)} />
        </div>
        <p>尚無歷史紀錄</p>
      </div>
    );
  }

  return (
    <>
      {/* 距離篩選器 */}
      <div className={`${currentTheme.styles.cardBg} p-4 rounded-xl shadow-sm border ${currentTheme.colors.border} mb-6`}>
        <label className={`block text-xs font-bold uppercase tracking-wide mb-2 ${getTextSecondaryColor(theme)}`}>
          距離篩選
        </label>
        <div className="flex gap-2">
          <button
            onClick={() => setSelectedDistance('all')}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedDistance === 'all'
                ? theme === 'light' ? 'bg-gray-100 text-gray-700 border border-gray-300' :
                  theme === 'vibrant' ? 'bg-yellow-100 text-yellow-700 border-2 border-gray-900' :
                  theme === 'pixel' ? 'bg-black text-white border-2 border-white' :
                  theme === 'space' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' :
                  theme === 'playground' ? 'bg-red-100 text-red-700 border border-red-300' :
                  'bg-gray-100 text-gray-700 border border-gray-300'
                : theme === 'light' ? 'bg-white border border-gray-200 text-gray-600' :
                  theme === 'vibrant' ? 'bg-white border-2 border-gray-900 text-gray-600' :
                  theme === 'pixel' ? 'bg-white border-2 border-black text-black' :
                  theme === 'space' ? 'bg-indigo-800/50 border border-cyan-500/30 text-cyan-300' :
                  theme === 'playground' ? 'bg-white border border-red-200 text-gray-600' :
                  'bg-white border border-gray-200 text-gray-600'
            }`}
          >
            全部
          </button>
          {[10, 30, 50].map((d) => (
            <button
              key={d}
              onClick={() => setSelectedDistance(d as Distance)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedDistance === d
                  ? theme === 'light' ? 'bg-gray-100 text-gray-700 border border-gray-300' :
                      theme === 'vibrant' ? 'bg-yellow-100 text-yellow-700 border-2 border-gray-900' :
                      theme === 'pixel' ? 'bg-black text-white border-2 border-white' :
                      theme === 'space' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' :
                      theme === 'playground' ? 'bg-red-100 text-red-700 border border-red-300' :
                      'bg-gray-100 text-gray-700 border border-gray-300'
                  : theme === 'light' ? 'bg-white border border-gray-200 text-gray-600' :
                      theme === 'vibrant' ? 'bg-white border-2 border-gray-900 text-gray-600' :
                      theme === 'pixel' ? 'bg-white border-2 border-black text-black' :
                      theme === 'space' ? 'bg-indigo-800/50 border border-cyan-500/30 text-cyan-300' :
                      theme === 'playground' ? 'bg-white border border-red-200 text-gray-600' :
                      'bg-white border border-gray-200 text-gray-600'
              }`}
            >
              {d}m
            </button>
          ))}
        </div>
      </div>

      {filteredRecords.length === 0 ? (
        <div className={`text-center py-12 ${getTextSecondaryColor(theme)}`}>
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
            theme === 'light' ? 'bg-gray-100' :
            theme === 'vibrant' ? 'bg-yellow-100' :
            theme === 'pixel' ? 'bg-black' :
            theme === 'space' ? 'bg-indigo-800/50' :
            theme === 'playground' ? 'bg-red-100' :
            'bg-gray-100'
          }`}>
            <Calendar size={24} className={getPrimaryColor(theme)} />
          </div>
          <p>尚無{selectedDistance === 'all' ? '' : `${selectedDistance}米`}歷史紀錄</p>
        </div>
      ) : (
        <div className="space-y-6">
        {Object.entries(groupedRecords).map(([date, dayRecords]) => (
          <div key={date} className="animate-fade-in">
            <div className="flex items-center gap-2 mb-3 px-1">
              <div className={`h-4 w-1 rounded-full ${
                theme === 'light' ? 'bg-gray-400' :
                theme === 'vibrant' ? 'bg-yellow-500' :
                theme === 'pixel' ? 'bg-black' :
                theme === 'space' ? 'bg-cyan-500' :
                theme === 'playground' ? 'bg-red-500' :
                'bg-gray-400'
              }`}></div>
              <h3 className={`font-medium text-sm sticky top-0 py-2 z-10 w-full ${getTextSecondaryColor(theme)} ${
                theme === 'light' ? 'bg-white' :
                theme === 'vibrant' ? 'bg-yellow-50' :
                theme === 'pixel' ? 'bg-white' :
                theme === 'space' ? 'bg-indigo-900/40' :
                theme === 'playground' ? 'bg-red-50' :
                'bg-white'
              }`}>
                {date} ({new Date(date).toLocaleDateString('zh-TW', { weekday: 'short' })})
              </h3>
            </div>
            
            <div className="space-y-3">
              {dayRecords.map(record => (
                <RecordItem
                  key={record.id}
                  record={record}
                  racer={getRacer(record.racerId)}
                  theme={theme}
                  onDelete={onDeleteRecord ? (id) => setDeleteId(id) : undefined}
                />
              ))}
            </div>
          </div>
        ))}
        </div>
      )}

      {/* Custom Delete Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 animate-fade-in">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setDeleteId(null)}
          ></div>
          
          {/* Modal Content */}
          <div className={`${currentTheme.styles.cardBg} rounded-2xl p-6 w-full max-w-xs shadow-2xl relative z-10 transform transition-all scale-100`}>
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-12 h-12 bg-red-100 text-red-500 rounded-full flex items-center justify-center mb-4">
                <AlertCircle size={24} />
              </div>
              <h3 className={`text-lg font-bold mb-2 ${getTextColor(theme)}`}>
                確定刪除此紀錄？
              </h3>
              <p className={`text-sm ${getTextSecondaryColor(theme)}`}>
                刪除後將無法復原這筆成績。
              </p>
            </div>
            
            <div className="flex gap-3">
              <button 
                onClick={() => setDeleteId(null)}
                className={`flex-1 py-3 px-4 font-bold rounded-xl active:scale-95 transition-transform ${
                  theme === 'light' || theme === 'vibrant' || theme === 'pixel' || theme === 'playground'
                    ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    : 'bg-indigo-800/50 text-cyan-300 hover:bg-indigo-700/50'
                }`}
              >
                取消
              </button>
              <button 
                onClick={confirmDelete}
                className="flex-1 py-3 px-4 bg-red-500 text-white font-bold rounded-xl shadow-lg shadow-red-200 hover:bg-red-600 active:scale-95 transition-transform"
              >
                刪除
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default HistoryLog;