import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

const TranslationDebug = () => {
  const { t, language } = useLanguage();
  
  const testKeys = [
    'registration.success',
    'registration.successMessage',
    'registration.when',
    'registration.type',
    'registration.venue',
    'registration.eventDetails',
    'registration.selectTickets'
  ];
  
  return (
    <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
      <h2 className="text-lg font-bold mb-4">Translation Debug</h2>
      <p className="mb-4">Current Language: {language}</p>
      <div className="space-y-2">
        {testKeys.map(key => (
          <div key={key} className="flex justify-between">
            <span className="text-sm text-gray-600">{key}:</span>
            <span className="text-sm font-medium">{t(key)}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TranslationDebug;