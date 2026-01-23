import React from 'react';
import { ArrowLeft, Clock, Play } from 'lucide-react';
import { Course } from '../types';
import { Theme, themes } from '../themes';
import { getTextColor, getTextSecondaryColor } from '../themeUtils';
import { getYouTubeEmbedUrl } from '../utils/youtubeUtils';

interface CourseDetailProps {
  course: Course;
  onBack: () => void;
  theme: Theme;
}

const CourseDetail: React.FC<CourseDetailProps> = ({ course, onBack, theme }) => {
  const currentTheme = themes[theme] || themes['light'];
  const embedUrl = getYouTubeEmbedUrl(course.videoUrl);

  return (
    <div className="animate-fade-in">
      {/* 返回按鈕 */}
      <button
        onClick={onBack}
        className={`flex items-center gap-2 mb-6 text-sm font-medium hover:underline ${
          theme === 'cute' ? 'text-pink-600 hover:text-pink-700' :
          theme === 'tech' ? 'text-cyan-400 hover:text-cyan-300' :
          theme === 'dark' ? 'text-gray-300 hover:text-gray-100' :
          'text-gray-700 hover:text-gray-900'
        }`}
      >
        <ArrowLeft size={18} />
        返回課程列表
      </button>

      {/* 課程標題 */}
      <h2 className={`text-2xl font-bold mb-4 ${getTextColor(theme)}`}>
        {course.title}
      </h2>

      {/* 課程描述 */}
      <p className={`text-base mb-4 ${getTextSecondaryColor(theme)}`}>
        {course.description}
      </p>

      {/* 詳細內容（如果有） */}
      {course.content && (
        <div 
          className={`${currentTheme.styles.cardBg} p-4 rounded-xl shadow-sm border ${currentTheme.colors.border} mb-6 ${getTextColor(theme)}`}
          dangerouslySetInnerHTML={{ __html: course.content }}
        />
      )}

      {/* YouTube 影片播放器（16:9 比例） */}
      <div className={`${currentTheme.styles.cardBg} rounded-xl shadow-lg border ${currentTheme.colors.border} overflow-hidden mb-6`}>
        <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
          <iframe
            className="absolute top-0 left-0 w-full h-full"
            src={embedUrl}
            title={course.title}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>

      {/* 課程資訊 */}
      <div className={`${currentTheme.styles.cardBg} p-4 rounded-xl shadow-sm border ${currentTheme.colors.border}`}>
        <div className="flex items-center gap-4 text-sm">
          {course.duration && (
            <div className={`flex items-center gap-2 ${getTextSecondaryColor(theme)}`}>
              <Clock size={16} />
              <span>時長：{course.duration}</span>
            </div>
          )}
          <div className={`flex items-center gap-2 ${getTextSecondaryColor(theme)}`}>
            <Play size={16} />
            <span>YouTube 影片</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;
