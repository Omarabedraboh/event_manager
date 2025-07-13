import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import {jwtDecode} from 'jwt-decode';
import './App.css';
import { LanguageProvider } from './contexts/LanguageContext';
import { ThemeProvider } from './contexts/ThemeContext';
import LoginPage from './components/LoginPage';
import Dashboard from './components/Dashboard';
import EventWizard from './components/EventWizard';
import EventManagement from './components/EventManagement';
import VenueManager from './components/VenueManager';
import RegistrationPage from './components/RegistrationPage';
import Phase2Banner from './components/Phase2Banner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Auth Context
const AuthContext = React.createContext();

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        if (decoded.exp * 1000 > Date.now()) {
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          fetchUserProfile();
        } else {
          localStorage.removeItem('token');
        }
      } catch (error) {
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await axios.get(`${API}/auth/me`);
      setUser(response.data);
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      logout();
    }
  };

  const login = async (email, password) => {
    try {
      const response = await axios.post(`${API}/auth/login`, { email, password });
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(user);
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.detail || 'Login failed' };
    }
  };

  const register = async (email, password, name, role) => {
    try {
      const response = await axios.post(`${API}/auth/register`, {
        email,
        password,
        name,
        role
      });
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(user);
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.detail || 'Registration failed' };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };

  const value = {
    user,
    login,
    register,
    logout,
    loading
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Protected Route Component
const ProtectedRoute = ({ children, requiredRoles = [] }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRoles.length > 0 && !requiredRoles.includes(user.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
          <p className="text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return children;
};

// Main App Component
function App() {
  return (
    <LanguageProvider>
      <ThemeProvider>
        <AuthProvider>
          <BrowserRouter>
            <div className="App min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
              <Routes>
              <Route path="/login" element={<LoginPage />} />
              
              {/* Dashboard Routes */}
              <Route path="/" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              
              {/* Event Management Routes */}
              <Route path="/events/create" element={
                <ProtectedRoute requiredRoles={['organizer', 'admin']}>
                  <EventWizard />
                </ProtectedRoute>
              } />
              
              <Route path="/events/:id" element={
                <ProtectedRoute requiredRoles={['organizer', 'admin']}>
                  <EventManagement />
                </ProtectedRoute>
              } />
              
              {/* Venue Management */}
              <Route path="/venues" element={
                <ProtectedRoute requiredRoles={['venue_owner', 'admin']}>
                  <VenueManager />
                </ProtectedRoute>
              } />
              
              {/* Registration */}
              <Route path="/register/:eventId" element={
                <ProtectedRoute requiredRoles={['attendee', 'admin']}>
                  <RegistrationPage />
                </ProtectedRoute>
              } />
              
              {/* Phase 2 Features */}
              <Route path="/analytics" element={
                <ProtectedRoute>
                  <Phase2Banner feature="Analytics Hub" description="Advanced analytics and reporting dashboard" />
                </ProtectedRoute>
              } />
              
              <Route path="/networking" element={
                <ProtectedRoute>
                  <Phase2Banner feature="AI Matchmaking" description="Intelligent networking and attendee matching" />
                </ProtectedRoute>
              } />
              
              <Route path="/marketing" element={
                <ProtectedRoute>
                  <Phase2Banner feature="Marketing Center" description="Email campaigns and social media automation" />
                </ProtectedRoute>
              } />
              
              <Route path="/sponsors" element={
                <ProtectedRoute>
                  <Phase2Banner feature="Sponsor Dashboard" description="Sponsor management and lead tracking" />
                </ProtectedRoute>
              } />
              
              {/* Redirect to login if not authenticated */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </BrowserRouter>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;