import React, { useState } from 'react';
import { BookOpen, Play, Clock, ArrowRight, Lock } from 'lucide-react';
import { Course, CourseCategory } from '../types';
import { Theme, themes } from '../themes';
import { getTextColor, getTextSecondaryColor, getPrimaryColor } from '../themeUtils';
import PasswordModal from './PasswordModal';

interface LearningClassroomProps {
  courses: Course[];
  onSelectCourse: (courseId: string) => void;
  theme: Theme;
}

const LearningClassroom: React.FC<LearningClassroomProps> = ({ 
  courses, 
  onSelectCourse, 
  theme 
}) => {
  const currentTheme = themes[theme] || themes['light'];
  const [selectedCategory, setSelectedCategory] = useState<CourseCategory | 'all'>('all');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [pendingCourseId, setPendingCourseId] = useState<string | null>(null);

  const categories: { id: CourseCategory | 'all'; label: string }[] = [
    { id: 'all', label: '全部' },
    { id: 'basic', label: '基礎' },
    { id: 'advanced', label: '進階' },
    { id: 'technique', label: '技巧' },
    { id: 'safety', label: '安全' }
  ];

  const filteredCourses = selectedCategory === 'all' 
    ? courses.sort((a, b) => a.order - b.order)
    : courses.filter(c => c.category === selectedCategory).sort((a, b) => a.order - b.order);

  const getCategoryColor = (category: CourseCategory) => {
    switch (category) {
      case 'basic':
        return 'bg-blue-100 text-blue-700';
      case 'advanced':
        return 'bg-purple-100 text-purple-700';
      case 'technique':
        return 'bg-green-100 text-green-700';
      case 'safety':
        return 'bg-orange-100 text-orange-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const handleCourseClick = (courseId: string) => {
    const course = courses.find(c => c.id === courseId);
    if (!course) return;

    // 檢查是否需要密碼
    if (course.requirePassword && course.password) {
      setPendingCourseId(courseId);
      setShowPasswordModal(true);
    } else {
      // 不需要密碼，直接進入
      onSelectCourse(courseId);
    }
  };

  const handlePasswordVerify = (inputPassword: string): boolean => {
    if (!pendingCourseId) return false;
    
    const course = courses.find(c => c.id === pendingCourseId);
    if (!course) return false;
    
    // 檢查課程密碼（不支援超級權限）
    if (course.password && inputPassword === course.password) {
      onSelectCourse(pendingCourseId);
      setPendingCourseId(null);
      return true;
    }
    
    return false;
  };

  return (
    <div className="animate-fade-in">
      <h2 className={`text-xl font-bold mb-6 flex items-center gap-2 ${
        theme === 'cute' ? 'text-gray-800' :
        theme === 'tech' ? 'text-slate-200' :
        theme === 'dark' ? 'text-gray-200' :
        'text-gray-900'
      }`}>
        <BookOpen className={
          theme === 'cute' ? 'text-pink-500' :
          theme === 'tech' ? 'text-cyan-400' :
          theme === 'dark' ? 'text-gray-400' :
          'text-gray-700'
        } />
        學習教室
      </h2>

      {/* 分類篩選 */}
      <div className={`${currentTheme.styles.cardBg} p-4 rounded-xl shadow-sm border ${currentTheme.colors.border} mb-6`}>
        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat.id
                  ? theme === 'cute' ? 'bg-pink-100 text-pink-700 border border-pink-200' :
                    theme === 'tech' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' :
                    theme === 'dark' ? 'bg-gray-600/30 text-gray-200 border border-gray-500/30' :
                    'bg-gray-100 text-gray-700 border border-gray-300'
                  : theme === 'cute' ? 'bg-white border border-gray-200 text-gray-600' :
                    theme === 'tech' ? 'bg-slate-700 border border-slate-600 text-slate-400' :
                    theme === 'dark' ? 'bg-gray-700 border border-gray-600 text-gray-400' :
                    'bg-white border border-gray-200 text-gray-600'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* 課程列表 */}
      {filteredCourses.length === 0 ? (
        <div className={`text-center py-12 ${getTextSecondaryColor(theme)}`}>
          <BookOpen size={48} className={`mx-auto mb-4 ${getPrimaryColor(theme)} opacity-50`} />
          <p>尚無課程</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredCourses.map(course => (
            <div
              key={course.id}
              onClick={() => handleCourseClick(course.id)}
              className={`${currentTheme.styles.cardBg} p-4 rounded-xl shadow-sm border ${currentTheme.colors.border} cursor-pointer hover:shadow-md transition-all active:scale-95`}
            >
              <div className="flex items-start gap-4">
                {/* 縮圖或圖示 */}
                <div className={`w-20 h-20 rounded-lg flex items-center justify-center flex-shrink-0 relative ${
                  theme === 'cute' ? 'bg-pink-100' :
                  theme === 'tech' ? 'bg-cyan-500/20' :
                  theme === 'dark' ? 'bg-gray-700' :
                  'bg-gray-100'
                }`}>
                  {course.thumbnail ? (
                    <img 
                      src={course.thumbnail} 
                      alt={course.title}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <Play className={
                      theme === 'cute' ? 'text-pink-500' :
                      theme === 'tech' ? 'text-cyan-400' :
                      theme === 'dark' ? 'text-gray-400' :
                      'text-gray-600'
                    } size={32} />
                  )}
                  {/* 鎖定圖示（如果有密碼） */}
                  {course.requirePassword && course.password && (
                    <div className={`absolute top-1 right-1 w-6 h-6 rounded-full flex items-center justify-center ${
                      theme === 'cute' ? 'bg-pink-500' :
                      theme === 'tech' ? 'bg-cyan-500' :
                      theme === 'dark' ? 'bg-gray-600' :
                      'bg-gray-700'
                    }`}>
                      <Lock size={12} className="text-white" />
                    </div>
                  )}
                </div>

                {/* 課程資訊 */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className={`font-bold text-lg ${getTextColor(theme)}`}>
                      {course.title}
                    </h3>
                    {course.requirePassword && course.password && (
                      <Lock className={
                        theme === 'cute' ? 'text-pink-500' :
                        theme === 'tech' ? 'text-cyan-400' :
                        theme === 'dark' ? 'text-gray-400' :
                        'text-gray-600'
                      } size={16} />
                    )}
                  </div>
                  <p className={`text-sm mb-2 line-clamp-2 ${getTextSecondaryColor(theme)}`}>
                    {course.description}
                  </p>
                  <div className="flex items-center gap-4 text-xs">
                    {course.duration && (
                      <div className={`flex items-center gap-1 ${getTextSecondaryColor(theme)}`}>
                        <Clock size={14} />
                        <span>{course.duration}</span>
                      </div>
                    )}
                    <span className={`px-2 py-0.5 rounded text-xs ${getCategoryColor(course.category)}`}>
                      {categories.find(c => c.id === course.category)?.label || course.category}
                    </span>
                    {course.requirePassword && course.password && (
                      <span className={`text-xs ${getTextSecondaryColor(theme)}`}>
                        需要密碼
                      </span>
                    )}
                  </div>
                </div>

                {/* 進入按鈕 */}
                <div className="flex items-center">
                  <ArrowRight className={
                    theme === 'cute' ? 'text-pink-500' :
                    theme === 'tech' ? 'text-cyan-400' :
                    theme === 'dark' ? 'text-gray-400' :
                    'text-gray-600'
                  } size={20} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 密碼驗證彈窗 */}
      <PasswordModal
        isOpen={showPasswordModal}
        onClose={() => {
          setShowPasswordModal(false);
          setPendingCourseId(null);
        }}
        onVerify={handlePasswordVerify}
        title={pendingCourseId ? `請輸入 ${courses.find(c => c.id === pendingCourseId)?.title || '課程'} 的密碼` : '請輸入密碼'}
        theme={theme}
      />
    </div>
  );
};

export default LearningClassroom;
