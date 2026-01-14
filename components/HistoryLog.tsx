import React, { useMemo, useState } from 'react';
import { Calendar, Trash2, AlertCircle } from 'lucide-react';
import { Record, GroupedRecords, Racer } from '../types';

interface HistoryLogProps {
  records: Record[];
  racers: Racer[];
  onDeleteRecord?: (id: string) => void;
}

const HistoryLog: React.FC<HistoryLogProps> = ({ records, racers, onDeleteRecord }) => {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  
  const groupedRecords = useMemo(() => {
    const groups: GroupedRecords = {};
    records.forEach(record => {
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
  }, [records]);

  const getRacer = (id: string) => racers.find(r => r.id === id);

  const confirmDelete = () => {
    if (deleteId && onDeleteRecord) {
      onDeleteRecord(deleteId);
      setDeleteId(null);
    }
  };

  if (records.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Calendar size={24} />
        </div>
        <p>尚無歷史紀錄</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {Object.entries(groupedRecords).map(([date, dayRecords]) => (
          <div key={date} className="animate-fade-in">
            <div className="flex items-center gap-2 mb-3 px-1">
              <div className="h-4 w-1 bg-indigo-500 rounded-full"></div>
              <h3 className="text-gray-500 font-medium text-sm sticky top-0 bg-[#f3f4f6] py-2 z-10 w-full">
                {date} ({new Date(date).toLocaleDateString('zh-TW', { weekday: 'short' })})
              </h3>
            </div>
            
            <div className="space-y-3">
              {dayRecords.map(record => {
                const racer = getRacer(record.racerId);
                return (
                  <div key={record.id} className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between group relative overflow-hidden">
                    <div className="flex items-center gap-3 relative z-0">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm ${racer?.avatarColor || 'bg-gray-400'}`}>
                        {racer?.name[0] || '?'}
                      </div>
                      <div>
                        <p className="font-bold text-gray-800">{racer?.name || '未知選手'}</p>
                        <span className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-500 font-medium">
                          {record.distance} 米
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 relative z-0">
                      <span className="text-xl font-mono font-bold text-gray-800">
                        {record.timeSeconds.toFixed(2)}<span className="text-xs text-gray-400 ml-1">s</span>
                      </span>
                      {onDeleteRecord && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteId(record.id);
                          }}
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
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Custom Delete Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 animate-fade-in">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setDeleteId(null)}
          ></div>
          
          {/* Modal Content */}
          <div className="bg-white rounded-2xl p-6 w-full max-w-xs shadow-2xl relative z-10 transform transition-all scale-100">
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-12 h-12 bg-red-100 text-red-500 rounded-full flex items-center justify-center mb-4">
                <AlertCircle size={24} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">確定刪除此紀錄？</h3>
              <p className="text-sm text-gray-500">
                刪除後將無法復原這筆成績。
              </p>
            </div>
            
            <div className="flex gap-3">
              <button 
                onClick={() => setDeleteId(null)}
                className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 active:scale-95 transition-transform"
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