import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';

const Phase2Banner = ({ feature, description }) => {
  const { t, isRTL } = useLanguage();
  const navigate = useNavigate();

  const handleBackToDashboard = () => {
    navigate('/');
  };

  // If feature and description are provided, show feature-specific content
  if (feature && description) {
    return (
      <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200 ${isRTL ? 'font-arabic' : ''}`}>
        {/* Back Navigation */}
        <div className="bg-white dark:bg-gray-800 shadow-sm transition-colors duration-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <button
              onClick={handleBackToDashboard}
              className={`flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors duration-200 ${isRTL ? 'flex-row-reverse' : ''}`}
            >
              <svg 
                className={`w-5 h-5 ${isRTL ? 'ml-2 rotate-180' : 'mr-2'}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              {t('events.backToDashboard')}
            </button>
          </div>
        </div>

        {/* Feature Banner */}
        <div className={`bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-700 dark:to-purple-700 text-white py-16 transition-colors duration-200`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className={`text-center ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className="flex items-center justify-center mb-4">
                <div className="p-3 bg-white/10 rounded-full">
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <h1 className="text-3xl font-bold mb-4">
                {t('common.banner.phase2')}: {feature}
              </h1>
              <p className="text-lg opacity-90 mb-6">
                {description}
              </p>
              <p className="text-sm opacity-75 mb-8">
                {t('common.banner.moreFeatures')}
              </p>
              
              {/* Action Button */}
              <button
                onClick={handleBackToDashboard}
                className="bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 backdrop-blur-sm"
              >
                {t('events.backToDashboard')}
              </button>
            </div>
          </div>
        </div>
        
        {/* Content Area */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center text-gray-600 dark:text-gray-400 transition-colors duration-200">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8 transition-colors duration-200">
              <div className="mb-4">
                <svg className="w-16 h-16 mx-auto text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2 transition-colors duration-200">
                {feature} - {t('common.banner.moreFeatures')}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 transition-colors duration-200">
                {description}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Default brand banner
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
                🌟 {t('common.brand.name')} - {t('common.brand.tagline')}
              </span>
              <p className="text-xs opacity-90 mt-1">
                {t('common.brand.description')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Phase2Banner;