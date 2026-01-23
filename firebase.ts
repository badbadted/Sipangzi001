import { initializeApp, FirebaseApp } from "firebase/app";
import { getDatabase, Database } from "firebase/database";

// 使用 Vite 標準方式讀取環境變數
const getEnvVar = (key: string, defaultValue: string = ''): string => {
  const value = import.meta.env[key];
  return value || defaultValue;
};

// Firebase 配置：優先使用環境變數，如果沒有則使用預設值
const firebaseConfig = {
  apiKey: getEnvVar('VITE_FIREBASE_API_KEY', "AIzaSyDQbjvYe91kC2MwUv30OXiAEgbUc8fo-dc"),
  authDomain: getEnvVar('VITE_FIREBASE_AUTH_DOMAIN', "sipangzi001-4a02b.firebaseapp.com"),
  databaseURL: getEnvVar('VITE_FIREBASE_DATABASE_URL', "https://sipangzi001-4a02b-default-rtdb.firebaseio.com"),
  projectId: getEnvVar('VITE_FIREBASE_PROJECT_ID', "sipangzi001-4a02b"),
  storageBucket: getEnvVar('VITE_FIREBASE_STORAGE_BUCKET', "sipangzi001-4a02b.firebasestorage.app"),
  messagingSenderId: getEnvVar('VITE_FIREBASE_MESSAGING_SENDER_ID', "385081445098"),
  appId: getEnvVar('VITE_FIREBASE_APP_ID', "1:385081445098:web:8880d3a08728966434a593"),
  measurementId: getEnvVar('VITE_FIREBASE_MEASUREMENT_ID', "G-DWX8FECVZ3")
};

// Initialize Firebase
let app: FirebaseApp | undefined;
let db: Database | undefined;
let firebaseInitialized = false;

try {
  // 檢查必要的配置值是否存在
  const requiredConfigKeys = ['apiKey', 'authDomain', 'projectId', 'databaseURL'];
  const missingConfig = requiredConfigKeys.filter(
    key => !firebaseConfig[key as keyof typeof firebaseConfig]
  );
  
  if (missingConfig.length > 0) {
    console.error('缺少必要的 Firebase 配置：', missingConfig);
    console.warn('應用程式將在離線模式下運行');
  } else {
    // 初始化 Firebase
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