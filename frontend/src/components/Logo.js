import React from 'react';

const Logo = ({ 
  size = 'md', 
  showText = true, 
  className = '', 
  textClassName = '',
  onClick = null 
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
    xl: 'w-20 h-20'
  };

  const textSizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl'
  };

  const logoSrc = size === 'lg' || size === 'xl' ? '/logo-large.svg' : '/logo.svg';

  return (
    <div 
      className={`flex items-center space-x-3 ${className} ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      <img 
        src={logoSrc} 
        alt="EventSphere Logo" 
        className={`${sizeClasses[size]} transition-all duration-200`}
      />
      {showText && (
        <span className={`font-bold text-gray-900 dark:text-gray-100 transition-colors duration-200 ${textSizeClasses[size]} ${textClassName}`}>
          EventSphere
        </span>
      )}
    </div>
  );
};

export default Logo;