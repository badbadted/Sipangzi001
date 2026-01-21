export interface Racer {
  id: string;
  name: string;
  avatarColor: string;
  avatar?: string; // 大頭貼圖片 URL 或 base64
  createdAt: number;
  password?: string; // 4位數字密碼（選填）
  requirePassword?: boolean; // 是否需要密碼才能異動
  isPublic?: boolean; // 測秒資料是否公開
}

export type Distance = 10 | 30 | 50;

export interface Record {
  id: string;
  racerId: string;
  distance: Distance;
  timeSeconds: number;
  timestamp: number;
  dateStr: string; // YYYY-MM-DD for easier grouping
}

export interface GroupedRecords {
  [date: string]: Record[];
}

export type TrainingType = 'sprint' | 'endurance' | 'start_practice';

export interface TrainingSession {
  id: string;
  racerId: string;
  type: TrainingType;
  durationSeconds: number;
  note?: string;
  timestamp: number;
  dateStr: string;
}

export type CourseCategory = 'basic' | 'advanced' | 'technique' | 'safety';

export interface Course {
  id: string;
  title: string;
  description: string;
  content?: string; // 詳細內容描述（可選，支援 HTML）
  videoUrl: string; // YouTube 影片網址（完整 URL 或 embed URL）
  thumbnail?: string; // 課程縮圖 URL（可選）
  duration?: string; // 影片時長，例如 "10:30"（可選）
  category: CourseCategory; // 課程分類
  order: number; // 排序順序
  createdAt?: number; // 建立時間戳（可選）
  password?: string; // 4位數字密碼（選填）
  requirePassword?: boolean; // 是否需要密碼才能進入課程
}

export const AVATAR_COLORS = [
  'bg-red-500', 'bg-orange-500', 'bg-amber-500', 
  'bg-green-500', 'bg-emerald-500', 'bg-teal-500', 
  'bg-cyan-500', 'bg-sky-500', 'bg-blue-500', 
  'bg-indigo-500', 'bg-violet-500', 'bg-purple-500', 
  'bg-fuchsia-500', 'bg-pink-500', 'bg-rose-500'
];
