import { useMemo } from 'react';
import { TrainingSession, Racer } from '../types';

export const useVisibleSessions = (sessions: TrainingSession[], racers: Racer[], myRacerIds: string[]) => {
    const visibleSessions = useMemo(() => {
        // 建立 racer lookup map 以提升效能
        const racerMap = new Map(racers.map(r => [r.id, r]));

        return sessions.filter(session => {
            const racer = racerMap.get(session.racerId);
            // 如果找不到選手，不顯示
            if (!racer) return false;
            // 如果選手的 isPublic 為 true，顯示記錄（公開）
            if (racer.isPublic === true) return true;
            // 如果選手的 isPublic 為 false 或 undefined，只有創建者可以看到
            return myRacerIds.includes(racer.id);
        });
    }, [sessions, racers, myRacerIds]);

    return visibleSessions;
};
