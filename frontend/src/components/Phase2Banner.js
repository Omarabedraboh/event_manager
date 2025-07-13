import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

const Phase2Banner = () => {
  const { t, isRTL } = useLanguage();

  return (
    <div className={`bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-700 dark:to-purple-700 text-white py-4 transition-colors duration-200 ${isRTL ? 'font-arabic' : ''}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`flex items-center justify-center text-center ${isRTL ? 'flex-row-reverse' : ''}`}>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/10 rounded-full">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <span className="text-sm font-semibold">
                🌟 {t('brand.name')} - {t('brand.tagline')}
              </span>
              <p className="text-xs opacity-90 mt-1">
                {t('brand.description')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Phase2Banner;