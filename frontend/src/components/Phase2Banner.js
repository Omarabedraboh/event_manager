import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from './Navigation';

const Phase2Banner = ({ feature, description }) => {
  const navigate = useNavigate();

  const features = {
    'Analytics Hub': {
      icon: (
        <svg className="w-16 h-16 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      features: [
        'Real-time attendance tracking',
        'Revenue analytics and ROI reports',
        'Engagement heatmaps',
        'Sponsor lead conversion metrics',
        'Predictive analytics for future events'
      ]
    },
    'AI Matchmaking': {
      icon: (
        <svg className="w-16 h-16 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
        </svg>
      ),
      features: [
        'Smart attendee pairing based on interests',
        'AI-powered networking suggestions',
        'Skill-based professional matching',
        'Automated icebreaker introductions',
        'Post-event connection recommendations'
      ]
    },
    'Marketing Center': {
      icon: (
        <svg className="w-16 h-16 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
        </svg>
      ),
      features: [
        'Automated email campaigns',
        'Social media scheduling',
        'Personalized marketing content',
        'Campaign performance tracking',
        'Multi-channel marketing automation'
      ]
    },
    'Sponsor Dashboard': {
      icon: (
        <svg className="w-16 h-16 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
        </svg>
      ),
      features: [
        'Lead generation and tracking',
        'Virtual booth customization',
        'Sponsor ROI analytics',
        'Attendee engagement metrics',
        'Real-time sponsor reporting'
      ]
    }
  };

  const currentFeature = features[feature] || {
    icon: (
      <svg className="w-16 h-16 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    ),
    features: ['Advanced functionality coming soon']
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="phase2-banner">
        <div className="phase2-content">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            {currentFeature.icon}
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {feature}
          </h1>

          {/* Description */}
          <p className="text-gray-600 mb-6">
            {description}
          </p>

          {/* Coming Soon Badge */}
          <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full text-sm font-medium mb-6">
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
            </svg>
            Phase 2 Feature
          </div>

          {/* Features List */}
          <div className="text-left">
            <h3 className="font-semibold text-gray-900 mb-3">Coming Features:</h3>
            <ul className="space-y-2">
              {currentFeature.features.map((featureItem, index) => (
                <li key={index} className="flex items-center text-gray-600">
                  <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  {featureItem}
                </li>
              ))}
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 space-y-3">
            <button
              onClick={() => navigate('/')}
              className="btn-primary w-full"
            >
              Back to Dashboard
            </button>
            
            <div className="text-center">
              <p className="text-sm text-gray-500">
                This feature will be available in Phase 2 of the MVP development
              </p>
            </div>
          </div>

          {/* Progress Indicator */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="text-center">
              <p className="text-xs text-gray-400 mb-2">Development Progress</p>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '35%' }}></div>
              </div>
              <p className="text-xs text-gray-500 mt-1">Phase 1 Complete • Phase 2 In Planning</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Phase2Banner;