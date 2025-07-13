import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import { useLanguage } from '../contexts/LanguageContext';
import axios from 'axios';
import Navigation from './Navigation';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const EventWizard = () => {
  const { user } = useAuth();
  const { t, isRTL } = useLanguage();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [eventData, setEventData] = useState({
    title: '',
    description: '',
    event_type: 'physical',
    start_date: '',
    end_date: '',
    venue_id: '',
    virtual_link: '',
    max_attendees: 100
  });

  useEffect(() => {
    fetchVenues();
  }, []);

  const fetchVenues = async () => {
    try {
      const response = await axios.get(`${API}/venues`);
      setVenues(response.data);
    } catch (error) {
      console.error('Failed to fetch venues:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setEventData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) : value
    }));
  };

  const validateStep = (step) => {
    switch (step) {
      case 1:
        return eventData.title && eventData.description && eventData.event_type;
      case 2:
        return eventData.start_date && eventData.end_date;
      case 3:
        if (eventData.event_type === 'physical' || eventData.event_type === 'hybrid') {
          return eventData.venue_id;
        }
        if (eventData.event_type === 'virtual' || eventData.event_type === 'hybrid') {
          return eventData.virtual_link;
        }
        return true;
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
      setError('');
    } else {
      setError(t('events.fillRequiredFields'));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => prev - 1);
    setError('');
  };

  const handleSubmit = async (publish = false) => {
    setLoading(true);
    setError('');

    try {
      // Create event
      const response = await axios.post(`${API}/events`, eventData);
      const eventId = response.data.id;

      // Publish if requested
      if (publish) {
        await axios.post(`${API}/events/${eventId}/publish`);
      }

      navigate(`/events/${eventId}`);
    } catch (error) {
      setError('Failed to create event');
      console.error(error);
    }
    setLoading(false);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2 transition-colors duration-200">
                {t('events.eventTitle')}
              </label>
              <input
                type="text"
                name="title"
                value={eventData.title}
                onChange={handleChange}
                className="form-input"
                placeholder={t('wizard.enterEventTitle')}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2 transition-colors duration-200">
                {t('events.description')}
              </label>
              <textarea
                name="description"
                value={eventData.description}
                onChange={handleChange}
                rows="4"
                className="form-textarea"
                placeholder={t('wizard.describeYourEvent')}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2 transition-colors duration-200">
                {t('events.eventType')}
              </label>
              <select
                name="event_type"
                value={eventData.event_type}
                onChange={handleChange}
                className="form-select"
              >
                <option value="physical">{t('events.physical')}</option>
                <option value="virtual">{t('events.virtual')}</option>
                <option value="hybrid">{t('events.hybrid')}</option>
              </select>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2 transition-colors duration-200">
                {t('events.startDate')}
              </label>
              <input
                type="datetime-local"
                name="start_date"
                value={eventData.start_date}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2 transition-colors duration-200">
                {t('events.endDate')}
              </label>
              <input
                type="datetime-local"
                name="end_date"
                value={eventData.end_date}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2 transition-colors duration-200">
                {t('events.maxAttendees')}
              </label>
              <input
                type="number"
                name="max_attendees"
                value={eventData.max_attendees}
                onChange={handleChange}
                min="1"
                className="form-input"
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            {(eventData.event_type === 'physical' || eventData.event_type === 'hybrid') && (
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2 transition-colors duration-200">
                  {t('events.selectVenue')}
                </label>
                <select
                  name="venue_id"
                  value={eventData.venue_id}
                  onChange={handleChange}
                  className="form-select"
                  required={eventData.event_type === 'physical' || eventData.event_type === 'hybrid'}
                >
                  <option value="">{t('events.selectVenuePlaceholder')}</option>
                  {venues.map(venue => (
                    <option key={venue.id} value={venue.id}>
                      {venue.name} - {venue.address} (${venue.price_per_hour}/{t('events.perHour')})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {(eventData.event_type === 'virtual' || eventData.event_type === 'hybrid') && (
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2 transition-colors duration-200">
                  {t('events.virtualLink')}
                </label>
                <input
                  type="url"
                  name="virtual_link"
                  value={eventData.virtual_link}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="https://zoom.us/j/..."
                  required={eventData.event_type === 'virtual' || eventData.event_type === 'hybrid'}
                />
              </div>
            )}
          </div>
        );

      case 4:
        return (
          <div className="text-center space-y-6">
            <div className="p-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg transition-colors duration-200">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full transition-colors duration-200">
                  <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2 transition-colors duration-200">
                {t('events.reviewEvent')}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 transition-colors duration-200">
                {t('events.reviewEventDescription')}
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 text-left transition-colors duration-200">
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-4 transition-colors duration-200">{t('events.eventDetails')}</h4>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="font-medium text-gray-600 dark:text-gray-400 transition-colors duration-200">{t('events.title')}:</span>
                  <span className="ml-2 text-gray-900 dark:text-gray-100 transition-colors duration-200">{eventData.title}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-600 dark:text-gray-400 transition-colors duration-200">{t('events.type')}:</span>
                  <span className="ml-2 text-gray-900 dark:text-gray-100 transition-colors duration-200">{t(`events.${eventData.event_type}`)}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-600 dark:text-gray-400 transition-colors duration-200">{t('events.startDate')}:</span>
                  <span className="ml-2 text-gray-900 dark:text-gray-100 transition-colors duration-200">{eventData.start_date}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-600 dark:text-gray-400 transition-colors duration-200">{t('events.endDate')}:</span>
                  <span className="ml-2 text-gray-900 dark:text-gray-100 transition-colors duration-200">{eventData.end_date}</span>
                </div>
              </div>
            </div>

            <div className="flex space-x-4 justify-center">
              <button
                onClick={() => handleSubmit(false)}
                disabled={loading}
                className="btn-secondary min-w-[120px]"
              >
                {loading ? t('common.saving') : t('events.saveDraft')}
              </button>
              <button
                onClick={() => handleSubmit(true)}
                disabled={loading}
                className="btn-primary min-w-[120px]"
              >
                {loading ? t('common.publishing') : t('events.saveAndPublish')}
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const steps = [
    { number: 1, title: t('wizard.step1') },
    { number: 2, title: t('wizard.step2') },
    { number: 3, title: t('wizard.step3') },
    { number: 4, title: t('wizard.step4') }
  ];

  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200 ${isRTL ? 'font-arabic' : ''}`}>
      <Navigation />
      
      <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 transition-colors duration-200">
            {t('events.createEvent')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 transition-colors duration-200">
            {t('events.createEventDescription')}
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium transition-colors duration-200 ${
                  currentStep >= step.number
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                }`}>
                  {step.number}
                </div>
                <span className={`ml-2 text-sm font-medium transition-colors duration-200 ${
                  currentStep >= step.number
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-gray-500 dark:text-gray-400'
                }`}>
                  {step.title}
                </span>
                {index < steps.length - 1 && (
                  <div className={`ml-4 h-px w-16 transition-colors duration-200 ${
                    currentStep > step.number
                      ? 'bg-blue-600'
                      : 'bg-gray-200 dark:bg-gray-700'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="alert alert-error mb-6">
            {error}
          </div>
        )}

        {/* Form Content */}
        <div className="card max-w-2xl mx-auto">
          <div className="card-body">
            {renderStep()}
          </div>

          {/* Navigation Buttons */}
          {currentStep < 4 && (
            <div className="card-footer">
              <div className={`flex justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                <button
                  onClick={prevStep}
                  disabled={currentStep === 1}
                  className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t('common.previous')}
                </button>
                <button
                  onClick={nextStep}
                  className="btn-primary"
                >
                  {t('common.next')}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventWizard;