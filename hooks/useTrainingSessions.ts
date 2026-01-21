import { useState, useEffect } from 'react';
import { db, firebaseInitialized } from '../firebase';
// @ts-ignore
import { ref, onValue, push, set, remove } from 'firebase/database';
import { TrainingSession, TrainingType } from '../types';
import { getLocalDateStr } from '../utils/dateUtils';

export const useTrainingSessions = () => {
    const [sessions, setSessions] = useState<TrainingSession[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!firebaseInitialized || !db) {
            setIsLoading(false);
            return;
        }

        try {
            const trainingRef = ref(db, 'training_logs');
            const unsubscribe = onValue(trainingRef, (snapshot: any) => {
                try {
                    const data = snapshot.val();
                    if (data) {
                        const sessionList = Object.values(data) as TrainingSession[];
                        // Filter and Sort
                        const validSessions = sessionList.filter(
                            (s): s is TrainingSession =>
                                s &&
                                typeof s.id === 'string' &&
                                typeof s.timestamp === 'number'
                        );
                        validSessions.sort((a, b) => b.timestamp - a.timestamp);
                        setSessions(validSessions);
                    } else {
                        setSessions([]);
                    }
                } catch (error) {
                    console.error('處理訓練數據時發生錯誤：', error);
                    setSessions([]);
                } finally {
                    setIsLoading(false);
                }
            });

            return () => unsubscribe();
        } catch (error) {
            console.error('設定訓練監聽時發生錯誤：', error);
            setIsLoading(false);
        }
    }, []);

    const addSession = async (racerId: string, type: TrainingType, durationSeconds: number, note?: string) => {
        if (!firebaseInitialized || !db) {
            alert('Firebase 未初始化');
            return;
        }

        try {
            const newRef = push(ref(db, 'training_logs'));
            if (!newRef.key) return;

            const newSession: TrainingSession = {
                id: newRef.key,
                racerId,
                type,
                durationSeconds,
                note,
                timestamp: Date.now(),
                dateStr: getLocalDateStr()
            };

            await set(newRef, newSession);
            if (navigator.vibrate) navigator.vibrate(50);
        } catch (error) {
            console.error('新增訓練紀錄失敗:', error);
            alert('新增失敗');
        }
    };

    const deleteSession = async (id: string) => {
        if (!firebaseInitialized || !db) return;
        try {
            await remove(ref(db, `training_logs/${id}`));
        } catch (error) {
            console.error('刪除訓練紀錄失敗:', error);
        }
    };

    return {
        sessions,
        isLoading,
        addSession,
        deleteSession
    };
};
