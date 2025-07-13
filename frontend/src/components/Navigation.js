import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../App';
import { useLanguage } from '../contexts/LanguageContext';
import LanguageSwitcher from './LanguageSwitcher';
import ThemeToggle from './ThemeToggle';

const Navigation = () => {
  const { user, logout } = useAuth();
  const { t, isRTL } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getNavItems = () => {
    if (!user) return [];

    const baseItems = [
      { path: '/', label: t('nav.dashboard'), roles: ['all'] }
    ];

    const roleSpecificItems = {
      organizer: [
        { path: '/events/create', label: t('nav.createEvent') },
        { path: '/venues', label: t('nav.venues') },
        { path: '/analytics', label: t('nav.analytics') },
        { path: '/marketing', label: t('nav.marketing') }
      ],
      attendee: [
        { path: '/networking', label: t('nav.networking') }
      ],
      venue_owner: [
        { path: '/venues', label: t('nav.myVenues') }
      ],
      admin: [
        { path: '/events/create', label: t('nav.createEvent') },
        { path: '/venues', label: t('nav.venues') },
        { path: '/analytics', label: t('nav.analytics') },
        { path: '/marketing', label: t('nav.marketing') }
      ],
      speaker: [
        { path: '/networking', label: t('nav.networking') }
      ],
      sponsor: [
        { path: '/sponsors', label: t('nav.sponsorDashboard') }
      ]
    };

    return [...baseItems, ...(roleSpecificItems[user.role] || [])];
  };

  const isActiveLink = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="navbar shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and brand */}
          <div className="flex items-center">
            <Link to="/" className={`navbar-brand text-xl font-bold text-blue-600 ${isRTL ? 'font-arabic' : ''}`}>
              {t('nav.brand')}
            </Link>
          </div>

          {/* Desktop navigation */}
          <div className="hidden md:flex items-center space-x-4 rtl:space-x-reverse">
            {getNavItems().map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-link px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                  isActiveLink(item.path) 
                    ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20' 
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-900'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* User menu, theme toggle and language switcher */}
          <div className="flex items-center space-x-4 rtl:space-x-reverse">
            <ThemeToggle />
            <LanguageSwitcher />
            
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center space-x-2 rtl:space-x-reverse text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
              >
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <span className="hidden md:block">{user?.name}</span>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>

              {isDropdownOpen && (
                <div className={`absolute mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-10 border border-gray-200 dark:border-gray-700 transition-colors duration-200 ${
                  isRTL ? 'left-0' : 'right-0'
                }`}>
                  <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{user?.name}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">{t(`roles.${user?.role}`)}</p>
                  </div>
                  
                  <Link
                    to="/profile"
                    className="block px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors duration-200"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    {t('nav.profile')}
                  </Link>
                  
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900 rtl:text-right transition-colors duration-200"
                  >
                    {t('nav.signOut')}
                  </button>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden ml-2 rtl:ml-0 rtl:mr-2 p-2 rounded-md text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors duration-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile navigation menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 transition-colors duration-200">
              {getNavItems().map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${
                    isActiveLink(item.path)
                      ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                      : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;