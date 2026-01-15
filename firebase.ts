import { initializeApp } from "firebase/app";
// @ts-ignore
import { getDatabase } from "firebase/database";

// 使用 Vite 標準方式讀取環境變數
const getEnvVar = (key: string): string => {
  const value = import.meta.env[key];
  if (!value) {
    console.warn(`環境變數 ${key} 未設定`);
  }
  return value || '';
};

const firebaseConfig = {
  apiKey: getEnvVar('VITE_FIREBASE_API_KEY'),
  authDomain: getEnvVar('VITE_FIREBASE_AUTH_DOMAIN'),
  projectId: getEnvVar('VITE_FIREBASE_PROJECT_ID'),
  storageBucket: getEnvVar('VITE_FIREBASE_STORAGE_BUCKET'),
  messagingSenderId: getEnvVar('VITE_FIREBASE_MESSAGING_SENDER_ID'),
  appId: getEnvVar('VITE_FIREBASE_APP_ID'),
  databaseURL: getEnvVar('VITE_FIREBASE_DATABASE_URL')
};

// Initialize Firebase
let app;
let db;
let firebaseInitialized = false;

try {
  // 檢查必要的環境變數
  const requiredEnvVars = [
    'VITE_FIREBASE_API_KEY',
    'VITE_FIREBASE_AUTH_DOMAIN',
    'VITE_FIREBASE_PROJECT_ID',
    'VITE_FIREBASE_DATABASE_URL'
  ];
  
  const missingVars = requiredEnvVars.filter(
    key => !import.meta.env[key]
  );
  
  if (missingVars.length > 0) {
    console.error('缺少必要的 Firebase 環境變數：', missingVars);
    console.warn('請檢查 .env.local 文件是否正確設定');
    console.warn('應用程式將在離線模式下運行');
  } else {
    // 只有當所有必要的環境變數都存在時才初始化
    app = initializeApp(firebaseConfig);
    db = getDatabase(app);
    firebaseInitialized = true;
    console.log('Firebase 初始化成功');
  }
} catch (error) {
  console.error('Firebase 初始化失敗：', error);
  console.warn('應用程式將在離線模式下運行');
  // 不拋出錯誤，讓應用程式可以繼續運行
}

// Export database instance (可能為 undefined)
export { db, firebaseInitialized };