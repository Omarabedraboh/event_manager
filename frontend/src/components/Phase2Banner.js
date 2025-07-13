import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

const Phase2Banner = () => {
  const { t, isRTL } = useLanguage();

  return (
    <div className={`bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-700 dark:to-purple-700 text-white py-3 transition-colors duration-200 ${isRTL ? 'font-arabic' : ''}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`flex items-center justify-center text-center ${isRTL ? 'flex-row-reverse' : ''}`}>
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2 ml-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <span className="text-sm font-medium">
              🚀 {t('banner.phase2')} - {t('banner.moreFeatures')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Phase2Banner;