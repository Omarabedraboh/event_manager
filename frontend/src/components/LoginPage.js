import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../App';

const LoginPage = () => {
  const { user, login, register } = useAuth();
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">
            Event Management System
          </h2>
          <p className="mt-2 text-gray-600">
            {isLogin ? 'Sign in to your account' : 'Create your account'}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          {/* Demo Users Section */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Quick Demo Access</h3>
            <div className="grid grid-cols-2 gap-2">
              {demoUsers.map((demoUser) => (
                <button
                  key={demoUser.role}
                  onClick={() => createDemoUser(demoUser)}
                  disabled={loading}
                  className="btn-secondary text-xs py-1 px-2 capitalize"
                >
                  {demoUser.role.replace('_', ' ')}
                </button>
              ))}
            </div>
            <div className="mt-2 border-t pt-4">
              <p className="text-xs text-gray-500">
                Click any role above to login instantly with demo credentials
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="form-input"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="form-input"
                placeholder="Enter your password"
              />
            </div>

            {!isLogin && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="form-input"
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Role</label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="form-select"
                  >
                    <option value="attendee">Attendee</option>
                    <option value="organizer">Event Organizer</option>
                    <option value="venue_owner">Venue Owner</option>
                    <option value="speaker">Speaker</option>
                    <option value="sponsor">Sponsor</option>
                    <option value="admin">Admin</option>
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
                  <span className="loading-spinner mr-2"></span>
                  {isLogin ? 'Signing in...' : 'Creating account...'}
                </>
              ) : (
                isLogin ? 'Sign In' : 'Create Account'
              )}
            </button>
          </form>

          <div className="mt-4 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              {isLogin 
                ? "Don't have an account? Sign up" 
                : "Already have an account? Sign in"
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;