import { Course } from '../types';

/**
 * 學習教室課程數據
 * 
 * YouTube 影片網址格式說明：
 * 1. 完整 URL: https://www.youtube.com/watch?v=VIDEO_ID
 * 2. 短網址: https://youtu.be/VIDEO_ID
 * 3. Embed URL: https://www.youtube.com/embed/VIDEO_ID
 * 
 * 系統會自動處理這些格式並轉換為 embed URL 進行內嵌播放
 */
export const courses: Course[] = [
  {
    id: 'course-001',
    title: '滑步車基礎入門',
    description: '學習滑步車的基本操作與平衡技巧，適合完全初學者。',
    content: `
      <h3 class="font-bold text-lg mb-2">課程重點：</h3>
      <ul class="list-disc list-inside space-y-1 mb-4">
        <li>正確的騎乘姿勢</li>
        <li>平衡感訓練</li>
        <li>基本前進技巧</li>
        <li>安全注意事項</li>
      </ul>
      <p>本課程將帶領您從零開始學習滑步車，建立正確的基礎。</p>
    `,
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', // 請替換為實際的影片 ID
    duration: '10:30',
    category: 'basic',
    order: 1
  },
  {
    id: 'course-002',
    title: '進階轉彎技巧',
    description: '掌握流暢轉彎與速度控制，提升騎乘流暢度。',
    content: `
      <h3 class="font-bold text-lg mb-2">課程重點：</h3>
      <ul class="list-disc list-inside space-y-1 mb-4">
        <li>轉彎時的身體重心轉移</li>
        <li>不同角度的轉彎技巧</li>
        <li>速度控制方法</li>
        <li>連續轉彎練習</li>
      </ul>
    `,
    videoUrl: 'https://youtu.be/dQw4w9WgXcQ', // 請替換為實際的影片 ID
    duration: '8:15',
    category: 'advanced',
    order: 2
  },
  {
    id: 'course-003',
    title: '安全騎乘要點',
    description: '了解安全裝備與騎乘注意事項，保護自己與他人。',
    content: `
      <h3 class="font-bold text-lg mb-2">安全裝備：</h3>
      <ul class="list-disc list-inside space-y-1 mb-4">
        <li>安全帽的重要性</li>
        <li>護膝護肘的選擇</li>
        <li>合適的服裝</li>
      </ul>
      <h3 class="font-bold text-lg mb-2">騎乘注意事項：</h3>
      <ul class="list-disc list-inside space-y-1">
        <li>場地選擇</li>
        <li>天氣考量</li>
        <li>交通規則</li>
      </ul>
    `,
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', // 請替換為實際的影片 ID
    duration: '6:45',
    category: 'safety',
    order: 3
  },
  {
    id: 'course-004',
    title: '速度提升訓練',
    description: '透過正確姿勢與訓練方法提升滑行速度。',
    content: `
      <h3 class="font-bold text-lg mb-2">訓練重點：</h3>
      <ul class="list-disc list-inside space-y-1 mb-4">
        <li>正確的起步姿勢</li>
        <li>腿部力量運用</li>
        <li>節奏感訓練</li>
        <li>持續性練習方法</li>
      </ul>
    `,
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', // 請替換為實際的影片 ID
    duration: '12:20',
    category: 'technique',
    order: 4
  },
  {
    id: 'course-005',
    title: '平衡感進階訓練',
    description: '提升平衡感與協調性，讓騎乘更加穩定。',
    content: `
      <h3 class="font-bold text-lg mb-2">訓練方法：</h3>
      <ul class="list-disc list-inside space-y-1 mb-4">
        <li>單腳平衡練習</li>
        <li>慢速騎乘訓練</li>
        <li>障礙物繞行</li>
        <li>協調性遊戲</li>
      </ul>
    `,
    videoUrl: 'https://youtu.be/dQw4w9WgXcQ', // 請替換為實際的影片 ID
    duration: '9:10',
    category: 'technique',
    order: 5
  }
];

/**
 * 根據分類獲取課程
 */
export const getCoursesByCategory = (category: CourseCategory | 'all'): Course[] => {
  if (category === 'all') {
    return courses.sort((a, b) => a.order - b.order);
  }
  return courses.filter(c => c.category === category).sort((a, b) => a.order - b.order);
};

/**
 * 根據 ID 獲取課程
 */
export const getCourseById = (id: string): Course | undefined => {
  return courses.find(c => c.id === id);
};
