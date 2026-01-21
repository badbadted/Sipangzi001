import { useState, useCallback } from 'react';

const MY_RACER_IDS_KEY = 'my_racer_ids';

// 獲取用戶創建的選手ID列表（從 sessionStorage，每個分頁獨立）
const getMyRacerIdsFromStorage = (): string[] => {
  try {
    const stored = sessionStorage.getItem(MY_RACER_IDS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

export const useMyRacers = () => {
  const [myRacerIds, setMyRacerIds] = useState<string[]>(() => getMyRacerIdsFromStorage());

  // 將選手ID添加到用戶創建的列表中
  const addToMyRacers = useCallback((racerId: string) => {
    const currentIds = getMyRacerIdsFromStorage();
    if (!currentIds.includes(racerId)) {
      const updatedIds = [...currentIds, racerId];
      sessionStorage.setItem(MY_RACER_IDS_KEY, JSON.stringify(updatedIds));
      setMyRacerIds(updatedIds);
    }
  }, []);

  const getMyRacerIds = useCallback((): string[] => {
    return getMyRacerIdsFromStorage();
  }, []);

  return {
    myRacerIds,
    getMyRacerIds,
    addToMyRacers
  };
};
