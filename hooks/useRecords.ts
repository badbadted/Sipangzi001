import { useState, useEffect } from 'react';
import { db, firebaseInitialized } from '../firebase';
import { ref, onValue, push, set, remove, DataSnapshot, query, limitToLast, orderByChild } from 'firebase/database';
import { Record, Distance } from '../types';
import { getLocalDateStr } from '../utils/dateUtils';

const RECORDS_LIMIT = 100; // 預設只載入最近 100 筆紀錄

export const useRecords = (enablePagination: boolean = false) => {
  const [records, setRecords] = useState<Record[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!firebaseInitialized || !db) {
      console.warn('Firebase 未初始化，無法同步紀錄數據');
      setIsLoading(false);
      return;
    }
    
    try {
      const recordsRef = enablePagination 
        ? query(ref(db, 'records'), orderByChild('timestamp'), limitToLast(RECORDS_LIMIT))
        : ref(db, 'records');
      
      setIsLoading(true);
      const unsubscribe = onValue(recordsRef, (snapshot: DataSnapshot) => {
          try {
            const data = snapshot.val();
            if (data) {
              const recordList = Object.values(data) as Record[];
              // 過濾掉無效的紀錄並排序
              const validRecords = recordList.filter(
                (r): r is Record => 
                  r && 
                  typeof r.id === 'string' &&
                  typeof r.timestamp === 'number' &&
                  !isNaN(r.timestamp)
              );
              // Sort by timestamp desc (newest first)
              validRecords.sort((a, b) => b.timestamp - a.timestamp);
              setRecords(validRecords);
            } else {
              setRecords([]);
            }
            setIsLoading(false);
          } catch (error) {
            console.error('處理紀錄數據時發生錯誤：', error);
            setRecords([]);
            setIsLoading(false);
          }
      });

      return () => unsubscribe();
    } catch (error) {
      console.error('設定紀錄監聽時發生錯誤：', error);
      setIsLoading(false);
    }
  }, [enablePagination]);

  const addRecord = (racerId: string, distance: Distance, timeSeconds: number, tenMeterTime?: number) => {
    if (!firebaseInitialized || !db) {
      alert('Firebase 未初始化，無法新增紀錄。請檢查環境變數設定。');
      return;
    }
    
    if (!racerId) {
      console.warn('無法新增紀錄：未選擇選手');
      return;
    }
    
    try {
      const dateStr = getLocalDateStr();
      const timestamp = Date.now();
      
      // 創建主要距離的紀錄
      const newRecordRef = push(ref(db, 'records'));
      if (!newRecordRef.key) {
        console.error('無法新增紀錄：Firebase 未返回 key');
        return;
      }
      
      const newRecord: Record = {
        id: newRecordRef.key,
        racerId,
        distance,
        timeSeconds,
        timestamp,
        dateStr
      };
      
      // 儲存主要紀錄
      set(newRecordRef, newRecord).catch((error) => {
        console.error('新增紀錄失敗：', error);
        alert('新增紀錄失敗，請檢查網路連線或 Firebase 設定');
      });
      
      // 如果有提供 10 米時間，同時創建 10 米紀錄
      if (tenMeterTime !== undefined && tenMeterTime > 0) {
        const tenMeterRecordRef = push(ref(db, 'records'));
        if (tenMeterRecordRef.key) {
          const tenMeterRecord: Record = {
            id: tenMeterRecordRef.key,
            racerId,
            distance: 10,
            timeSeconds: tenMeterTime,
            timestamp: timestamp + 1, // 稍微延後時間戳，確保排序正確
            dateStr
          };
          
          set(tenMeterRecordRef, tenMeterRecord).catch((error) => {
            console.error('新增 10 米紀錄失敗：', error);
          });
        }
      }
      
      // Optional: Visual feedback or vibration
      if (navigator.vibrate) navigator.vibrate(50);
    } catch (error) {
      console.error('新增紀錄時發生錯誤：', error);
      alert('新增紀錄時發生錯誤，請稍後再試');
    }
  };

  const deleteRecord = (id: string) => {
    if (!firebaseInitialized || !db) {
      alert('Firebase 未初始化，無法刪除紀錄。請檢查環境變數設定。');
      return;
    }
    
    try {
      remove(ref(db, `records/${id}`)).catch((error) => {
        console.error('刪除紀錄失敗：', error);
        alert('刪除紀錄失敗，請檢查網路連線或 Firebase 設定');
      });
    } catch (error) {
      console.error('刪除紀錄時發生錯誤：', error);
      alert('刪除紀錄時發生錯誤，請稍後再試');
    }
  };

  const deleteRecordsByRacerId = (racerId: string) => {
    if (!firebaseInitialized || !db) {
      return;
    }
    
    // 刪除該選手的相關紀錄
    records.forEach(r => {
      if (r.racerId === racerId) {
        remove(ref(db, `records/${r.id}`)).catch((error) => {
          console.error('刪除紀錄失敗：', error);
        });
      }
    });
  };

  return {
    records,
    isLoading,
    addRecord,
    deleteRecord,
    deleteRecordsByRacerId
  };
};
