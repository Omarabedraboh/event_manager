import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../App';
import { useLanguage } from '../contexts/LanguageContext';
import LanguageSwitcher from './LanguageSwitcher';

const LoginPage = () => {
  const { user, login, register } = useAuth();
  const { t, isRTL } = useLanguage();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    role: 'attendee'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Redirect if already authenticated
  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let result;
      if (isLogin) {
        result = await login(formData.email, formData.password);
      } else {
        result = await register(formData.email, formData.password, formData.name, formData.role);
      }

      if (!result.success) {
        setError(result.error);
      }
    } catch (err) {
      setError('An unexpected error occurred');
    }
    
    setLoading(false);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const demoUsers = [
    { email: 'organizer@demo.com', password: 'demo123', role: 'organizer', name: 'Demo Organizer' },
    { email: 'attendee@demo.com', password: 'demo123', role: 'attendee', name: 'Demo Attendee' },
    { email: 'venue@demo.com', password: 'demo123', role: 'venue_owner', name: 'Demo Venue Owner' },
    { email: 'admin@demo.com', password: 'demo123', role: 'admin', name: 'Demo Admin' }
  ];

  const createDemoUser = async (demoUser) => {
    setLoading(true);
    setError('');
    
    const result = await register(demoUser.email, demoUser.password, demoUser.name, demoUser.role);
    if (!result.success && result.error?.includes('already registered')) {
      // User exists, try to login
      const loginResult = await login(demoUser.email, demoUser.password);
      if (!loginResult.success) {
        setError(loginResult.error);
      }
    } else if (!result.success) {
      setError(result.error);
    }
    
    setLoading(false);
  };

  return (
    <div className={`min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 transition-colors duration-200 ${isRTL ? 'font-arabic' : ''}`}>
      <div className="max-w-md w-full space-y-8 p-8">
        {/* Language Switcher */}
        <div className={`flex ${isRTL ? 'justify-start' : 'justify-end'} mb-4`}>
          <LanguageSwitcher />
        </div>
        
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 transition-colors duration-200">
            {t('nav.brand')}
          </h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400 transition-colors duration-200">
            {isLogin ? t('auth.loginSubtitle') : t('auth.registerSubtitle')}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 transition-colors duration-200">
          {/* Demo Users Section */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-3 transition-colors duration-200">Quick Demo Access</h3>
            <div className="grid grid-cols-2 gap-2">
              {demoUsers.map((demoUser) => (
                <button
                  key={demoUser.role}
                  onClick={() => createDemoUser(demoUser)}
                  disabled={loading}
                  className="btn-secondary text-xs py-1 px-2 capitalize"
                >
                  {t(`roles.${demoUser.role}`)}
                </button>
              ))}
            </div>
            <div className="mt-2 border-t border-gray-200 dark:border-gray-600 pt-4 transition-colors duration-200">
              <p className="text-xs text-gray-500 dark:text-gray-400 transition-colors duration-200">
                Click any role above to login instantly with demo credentials
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className={`block text-sm font-medium text-gray-700 ${isRTL ? 'text-right' : 'text-left'}`}>
                {t('auth.email')}
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="form-input"
                placeholder={t('auth.email')}
                dir={isRTL ? 'rtl' : 'ltr'}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium text-gray-700 ${isRTL ? 'text-right' : 'text-left'}`}>
                {t('auth.password')}
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="form-input"
                placeholder={t('auth.password')}
                dir={isRTL ? 'rtl' : 'ltr'}
              />
            </div>

            {!isLogin && (
              <>
                <div>
                  <label className={`block text-sm font-medium text-gray-700 ${isRTL ? 'text-right' : 'text-left'}`}>
                    {t('auth.name')}
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="form-input"
                    placeholder={t('auth.name')}
                    dir={isRTL ? 'rtl' : 'ltr'}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium text-gray-700 ${isRTL ? 'text-right' : 'text-left'}`}>
                    {t('auth.role')}
                  </label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="form-select"
                  >
                    <option value="attendee">{t('roles.attendee')}</option>
                    <option value="organizer">{t('roles.organizer')}</option>
                    <option value="venue_owner">{t('roles.venue_owner')}</option>
                    <option value="speaker">{t('roles.speaker')}</option>
                    <option value="sponsor">{t('roles.sponsor')}</option>
                    <option value="admin">{t('roles.admin')}</option>
                  </select>
                </div>
              </>
            )}

            {error && (
              <div className="alert alert-error">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading ? (
                <>
                  <span className={`loading-spinner ${isRTL ? 'ml-2' : 'mr-2'}`}></span>
                  {isLogin ? t('auth.loginButton') + '...' : t('auth.registerButton') + '...'}
                </>
              ) : (
                isLogin ? t('auth.loginButton') : t('auth.registerButton')
              )}
            </button>
          </form>

          <div className="mt-4 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              {isLogin 
                ? t('auth.noAccount') + ' ' + t('auth.registerHere')
                : t('auth.haveAccount') + ' ' + t('auth.signInHere')
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;