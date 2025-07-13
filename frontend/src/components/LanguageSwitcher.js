import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

const LanguageSwitcher = () => {
  const { language, switchLanguage, isRTL } = useLanguage();

  return (
    <div className="relative">
      <select
        value={language}
        onChange={(e) => switchLanguage(e.target.value)}
        className={`
          bg-transparent border-0 text-sm font-medium cursor-pointer focus:outline-none
          ${isRTL ? 'text-right pl-6 pr-2' : 'text-left pr-6 pl-2'}
          text-gray-700 hover:text-gray-900
        `}
      >
        <option value="en">English</option>
        <option value="ar">العربية</option>
      </select>
      <div className={`absolute top-1/2 transform -translate-y-1/2 pointer-events-none ${isRTL ? 'left-0' : 'right-0'}`}>
        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
        </svg>
      </div>
    </div>
  );
};

export default LanguageSwitcher;