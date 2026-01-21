import { useMemo } from 'react';
import { Record, Racer } from '../types';

export const useVisibleRecords = (records: Record[], racers: Racer[], myRacerIds: string[]) => {
  // 根據公開設定過濾記錄
  // 1. 如果選手的 isPublic 為 true，所有人都可以看到
  // 2. 如果選手的 isPublic 為 false 或 undefined，只有設定者（創建者）可以看到
  const visibleRecords = useMemo(() => {
    // 建立 racer lookup map 以提升效能
    const racerMap = new Map(racers.map(r => [r.id, r]));
    
    return records.filter(record => {
      const racer = racerMap.get(record.racerId);
      // 如果找不到選手，不顯示
      if (!racer) return false;
      // 如果選手的 isPublic 為 true，顯示記錄（公開）
      if (racer.isPublic === true) return true;
      // 如果選手的 isPublic 為 false 或 undefined，只有創建者可以看到
      return myRacerIds.includes(racer.id);
    });
  }, [records, racers, myRacerIds]);

  return visibleRecords;
};
