/**
 * YouTube URL 處理工具
 * 將各種 YouTube URL 格式轉換為 embed URL
 */

/**
 * 將 YouTube URL 轉換為 embed URL
 * 
 * 支援的格式：
 * 1. 完整 URL: https://www.youtube.com/watch?v=VIDEO_ID
 * 2. 短網址: https://youtu.be/VIDEO_ID
 * 3. Embed URL: https://www.youtube.com/embed/VIDEO_ID
 * 
 * @param url YouTube 影片 URL
 * @returns YouTube embed URL
 */
export const getYouTubeEmbedUrl = (url: string): string => {
  if (!url) return '';
  
  // 如果是完整 URL: https://www.youtube.com/watch?v=VIDEO_ID
  if (url.includes('youtube.com/watch?v=')) {
    const videoId = url.split('v=')[1]?.split('&')[0];
    if (videoId) {
      return `https://www.youtube.com/embed/${videoId}`;
    }
  }
  
  // 如果是短網址: https://youtu.be/VIDEO_ID
  if (url.includes('youtu.be/')) {
    const videoId = url.split('youtu.be/')[1]?.split('?')[0];
    if (videoId) {
      return `https://www.youtube.com/embed/${videoId}`;
    }
  }
  
  // 如果已經是 embed URL
  if (url.includes('youtube.com/embed/')) {
    return url;
  }
  
  // 如果都不符合，返回原 URL（可能是其他影片平台）
  return url;
};

/**
 * 從 YouTube URL 提取影片 ID
 * 
 * @param url YouTube 影片 URL
 * @returns 影片 ID 或 null
 */
export const getYouTubeVideoId = (url: string): string | null => {
  if (!url) return null;
  
  // 完整 URL
  if (url.includes('youtube.com/watch?v=')) {
    return url.split('v=')[1]?.split('&')[0] || null;
  }
  
  // 短網址
  if (url.includes('youtu.be/')) {
    return url.split('youtu.be/')[1]?.split('?')[0] || null;
  }
  
  // Embed URL
  if (url.includes('youtube.com/embed/')) {
    return url.split('embed/')[1]?.split('?')[0] || null;
  }
  
  return null;
};
