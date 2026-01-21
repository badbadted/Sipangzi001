import { useState, useEffect } from 'react';
import { db, firebaseInitialized } from '../firebase';
import { ref, onValue, push, set, remove, DataSnapshot } from 'firebase/database';
import { Racer } from '../types';

export const useRacers = () => {
  const [racers, setRacers] = useState<Racer[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!firebaseInitialized || !db) {
      console.warn('Firebase 未初始化，無法同步選手數據');
      setIsLoading(false);
      return;
    }
    
    try {
      const racersRef = ref(db, 'racers');
      setIsLoading(true);
      const unsubscribe = onValue(racersRef, (snapshot: DataSnapshot) => {
          try {
            const data = snapshot.val();
            if (data) {
              // Convert object to array and filter invalid entries
              const racerList = Object.values(data).filter(
                (r): r is Racer => 
                  r && 
                  typeof (r as Racer).id === 'string' &&
                  typeof (r as Racer).name === 'string'
              ) as Racer[];
              setRacers(racerList);
            } else {
              setRacers([]);
            }
            setIsLoading(false);
          } catch (error) {
            console.error('處理選手數據時發生錯誤：', error);
            setRacers([]);
            setIsLoading(false);
          }
      });

      return () => unsubscribe();
    } catch (error) {
      console.error('設定選手監聽時發生錯誤：', error);
      setIsLoading(false);
    }
  }, []);

  const addRacer = (name: string, color: string, avatar?: string, password?: string, requirePassword?: boolean, isPublic?: boolean) => {
    if (!firebaseInitialized || !db) {
      alert('Firebase 未初始化，無法新增選手。請檢查環境變數設定。');
      return;
    }
    
    try {
      const newRacerRef = push(ref(db, 'racers'));
      if (!newRacerRef.key) {
        console.error('無法新增選手：Firebase 未返回 key');
        return;
      }
      
      const newRacer: Racer = {
        id: newRacerRef.key,
        name,
        avatarColor: color,
        ...(avatar && { avatar }),
        createdAt: Date.now(),
        ...(password && { password }),
        ...(requirePassword !== undefined && { requirePassword }),
        ...(isPublic !== undefined && { isPublic })
      };
      
      set(newRacerRef, newRacer).catch((error) => {
        console.error('新增選手失敗：', error);
        alert('新增選手失敗，請檢查網路連線或 Firebase 設定');
      });
      
      return newRacer.id;
    } catch (error) {
      console.error('新增選手時發生錯誤：', error);
      alert('新增選手時發生錯誤，請稍後再試');
      return null;
    }
  };

  const updateRacer = (id: string, name: string, color: string, avatar?: string, password?: string, requirePassword?: boolean, isPublic?: boolean) => {
    if (!firebaseInitialized || !db) {
      alert('Firebase 未初始化，無法更新選手。請檢查環境變數設定。');
      return;
    }
    
    try {
      const existingRacer = racers.find(r => r.id === id);
      if (!existingRacer) {
        console.error('找不到要更新的選手');
        return;
      }

      const racerRef = ref(db, `racers/${id}`);
      const updatedRacer: Racer = {
        id: existingRacer.id,
        name,
        avatarColor: color,
        createdAt: existingRacer.createdAt,
        ...(avatar !== undefined && { avatar: avatar || null }),
        ...(password !== undefined && { password: password || null }),
        ...(requirePassword !== undefined && { requirePassword }),
        ...(isPublic !== undefined && { isPublic })
      };
      
      set(racerRef, updatedRacer).catch((error) => {
        console.error('更新選手失敗：', error);
        alert('更新選手失敗，請檢查網路連線或 Firebase 設定');
      });
    } catch (error) {
      console.error('更新選手時發生錯誤：', error);
      alert('更新選手時發生錯誤，請稍後再試');
    }
  };

  const deleteRacer = (id: string, onRecordsDelete?: (id: string) => void) => {
    if (!firebaseInitialized || !db) {
      alert('Firebase 未初始化，無法刪除選手。請檢查環境變數設定。');
      return;
    }
    
    if (confirm('確定要刪除此選手嗎？相關紀錄也會一併刪除。')) {
      try {
        remove(ref(db, `racers/${id}`)).catch((error) => {
          console.error('刪除選手失敗：', error);
          alert('刪除選手失敗，請檢查網路連線或 Firebase 設定');
        });
        
        // 刪除相關紀錄（如果提供了回調函式）
        if (onRecordsDelete) {
          onRecordsDelete(id);
        }
      } catch (error) {
        console.error('刪除選手時發生錯誤：', error);
        alert('刪除選手時發生錯誤，請稍後再試');
      }
    }
  };

  return {
    racers,
    isLoading,
    addRacer,
    updateRacer,
    deleteRacer
  };
};
