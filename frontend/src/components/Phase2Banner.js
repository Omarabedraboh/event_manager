import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import Navigation from './Navigation';

const Phase2Banner = ({ feature, description }) => {
  const { t, isRTL } = useLanguage();

  return (
    <div className={`min-h-screen bg-gray-50 ${isRTL ? 'font-arabic' : ''}`}>
      <Navigation />
      <div className="phase2-banner">
        <div className="phase2-content">
          <div className={`text-center ${isRTL ? 'text-right' : ''}`}>
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 mb-4">
              <svg className="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{feature}</h1>
            <p className="text-lg text-gray-600 mb-8">{description}</p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">
                Coming Soon in Phase 2
              </h3>
              <p className="text-blue-700">
                This feature is planned for the next development phase. Stay tuned for advanced functionality and enhanced user experience!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Phase2Banner;