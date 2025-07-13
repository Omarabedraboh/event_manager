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
      setError(error.response?.data?.detail || 'Failed to create event');
    }
    setLoading(false);
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <h3 className={`text-lg font-medium text-gray-900 dark:text-gray-100 transition-colors duration-200 mb-4 ${isRTL ? 'text-right' : ''}`}>
          {t('events.eventDetails')}
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className={`block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-200 ${isRTL ? 'text-right' : ''}`}>
              {t('events.eventTitle')} {t('wizard.requiredField')}
            </label>
            <input
              type="text"
              name="title"
              value={eventData.title}
              onChange={handleChange}
              placeholder={t('wizard.enterEventTitle')}
              className="form-input"
              dir={isRTL ? 'rtl' : 'ltr'}
            />
          </div>

          <div>
            <label className={`block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-200 ${isRTL ? 'text-right' : ''}`}>
              {t('events.description')} {t('wizard.requiredField')}
            </label>
            <textarea
              name="description"
              value={eventData.description}
              onChange={handleChange}
              rows="4"
              placeholder={t('wizard.describeYourEvent')}
              className="form-textarea"
              dir={isRTL ? 'rtl' : 'ltr'}
            />
          </div>

          <div>
            <label className={`block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-200 ${isRTL ? 'text-right' : ''}`}>
              {t('events.eventType')} {t('wizard.requiredField')}
            </label>
            <select
              name="event_type"
              value={eventData.event_type}
              onChange={handleChange}
              className="form-select"
            >
              <option value="physical">{t('events.physicalEvent')}</option>
              <option value="virtual">{t('events.virtualEvent')}</option>
              <option value="hybrid">{t('events.hybridEvent')}</option>
            </select>
            <p className={`mt-1 text-sm text-gray-500 ${isRTL ? 'text-right' : ''}`}>
              {eventData.event_type === 'hybrid' && t('wizard.hybridEventNote')}
            </p>
          </div>

          <div>
            <label className={`block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-200 ${isRTL ? 'text-right' : ''}`}>
              {t('wizard.maximumAttendeesLabel')}
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
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div>
        <h3 className={`text-lg font-medium text-gray-900 dark:text-gray-100 transition-colors duration-200 mb-4 ${isRTL ? 'text-right' : ''}`}>
          {t('events.eventSchedule')}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={`block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-200 ${isRTL ? 'text-right' : ''}`}>
              {t('wizard.startDateTime')} {t('wizard.requiredField')}
            </label>
            <input
              type="datetime-local"
              name="start_date"
              value={eventData.start_date}
              onChange={handleChange}
              className="form-input"
            />
          </div>

          <div>
            <label className={`block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-200 ${isRTL ? 'text-right' : ''}`}>
              {t('wizard.endDateTime')} {t('wizard.requiredField')}
            </label>
            <input
              type="datetime-local"
              name="end_date"
              value={eventData.end_date}
              onChange={handleChange}
              className="form-input"
            />
          </div>
        </div>

        {eventData.start_date && eventData.end_date && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <p className={`text-sm text-blue-700 ${isRTL ? 'text-right' : ''}`}>
              {t('events.eventDuration')}: {Math.round((new Date(eventData.end_date) - new Date(eventData.start_date)) / (1000 * 60 * 60))} {t('events.hours')}
            </p>
          </div>
        )}
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div>
        <h3 className={`text-lg font-medium text-gray-900 dark:text-gray-100 transition-colors duration-200 mb-4 ${isRTL ? 'text-right' : ''}`}>
          {t('events.eventLocation')}
        </h3>
        
        {(eventData.event_type === 'physical' || eventData.event_type === 'hybrid') && (
          <div className="mb-6">
            <label className={`block text-sm font-medium text-gray-700 mb-2 ${isRTL ? 'text-right' : ''}`}>
              {t('wizard.physicalVenue')} {eventData.event_type === 'hybrid' ? t('wizard.requiredForHybrid') : t('wizard.requiredField')}
            </label>
            <select
              name="venue_id"
              value={eventData.venue_id}
              onChange={handleChange}
              className="form-select"
            >
              <option value="">{t('events.selectVenue')}</option>
              {venues.map(venue => (
                <option key={venue.id} value={venue.id}>
                  {venue.name} - {venue.address} ({t('venues.capacity')}: {venue.capacity})
                </option>
              ))}
            </select>
            
            {venues.length === 0 && (
              <p className={`mt-2 text-sm text-yellow-600 ${isRTL ? 'text-right' : ''}`}>
                {t('events.noVenuesAvailable')}
              </p>
            )}
          </div>
        )}

        {(eventData.event_type === 'virtual' || eventData.event_type === 'hybrid') && (
          <div>
            <label className={`block text-sm font-medium text-gray-700 mb-2 ${isRTL ? 'text-right' : ''}`}>
              {t('wizard.virtualMeetingLink')} {eventData.event_type === 'hybrid' ? t('wizard.requiredForHybrid') : t('wizard.requiredField')}
            </label>
            <input
              type="url"
              name="virtual_link"
              value={eventData.virtual_link}
              onChange={handleChange}
              placeholder={t('wizard.enterMeetingLink')}
              className="form-input"
              dir={isRTL ? 'rtl' : 'ltr'}
            />
            <p className={`mt-1 text-sm text-gray-500 ${isRTL ? 'text-right' : ''}`}>
              {t('events.enterVirtualLink')}
            </p>
          </div>
        )}

        {eventData.event_type === 'hybrid' && (
          <div className="mt-6 p-4 bg-purple-50 rounded-lg">
            <h4 className={`font-medium text-purple-900 mb-2 ${isRTL ? 'text-right' : ''}`}>
              {t('events.hybridBenefits')}
            </h4>
            <ul className={`text-sm text-purple-700 space-y-1 ${isRTL ? 'text-right' : ''}`}>
              <li>{t('events.reachWiderAudience')}</li>
              <li>{t('events.flexibleOptions')}</li>
              <li>{t('events.increaseAccessibility')}</li>
              <li>{t('events.maximizeVenue')}</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <div>
        <h3 className={`text-lg font-medium text-gray-900 dark:text-gray-100 transition-colors duration-200 mb-4 ${isRTL ? 'text-right' : ''}`}>
          {t('events.reviewPublish')}
        </h3>
        
        <div className="bg-gray-50 rounded-lg p-6 space-y-4">
          <div>
            <h4 className={`font-medium text-gray-900 dark:text-gray-100 transition-colors duration-200 ${isRTL ? 'text-right' : ''}`}>
              {t('events.eventDetails')}
            </h4>
            <p className={`text-gray-600 dark:text-gray-400 transition-colors duration-200 ${isRTL ? 'text-right' : ''}`}>{eventData.title}</p>
            <p className={`text-sm text-gray-500 ${isRTL ? 'text-right' : ''}`}>{eventData.description}</p>
          </div>

          <div>
            <h4 className={`font-medium text-gray-900 dark:text-gray-100 transition-colors duration-200 ${isRTL ? 'text-right' : ''}`}>
              {t('events.type')} & {t('events.capacity')}
            </h4>
            <div className={`flex space-x-4 ${isRTL ? 'space-x-reverse flex-row-reverse' : ''}`}>
              <span className={`badge ${
                eventData.event_type === 'physical' ? 'event-type-physical' :
                eventData.event_type === 'virtual' ? 'event-type-virtual' :
                'event-type-hybrid'
              }`}>
                {t(`events.${eventData.event_type}`)}
              </span>
              <span className="text-sm text-gray-600">
                {t('events.maxAttendees')}: {eventData.max_attendees}
              </span>
            </div>
          </div>

          <div>
            <h4 className={`font-medium text-gray-900 dark:text-gray-100 transition-colors duration-200 ${isRTL ? 'text-right' : ''}`}>
              {t('events.eventSchedule')}
            </h4>
            <p className={`text-gray-600 dark:text-gray-400 transition-colors duration-200 ${isRTL ? 'text-right' : ''}`}>
              {new Date(eventData.start_date).toLocaleString()} - {new Date(eventData.end_date).toLocaleString()}
            </p>
          </div>

          {eventData.venue_id && (
            <div>
              <h4 className={`font-medium text-gray-900 dark:text-gray-100 transition-colors duration-200 ${isRTL ? 'text-right' : ''}`}>
                {t('events.venue')}
              </h4>
              <p className={`text-gray-600 dark:text-gray-400 transition-colors duration-200 ${isRTL ? 'text-right' : ''}`}>
                {venues.find(v => v.id === eventData.venue_id)?.name}
              </p>
            </div>
          )}

          {eventData.virtual_link && (
            <div>
              <h4 className={`font-medium text-gray-900 dark:text-gray-100 transition-colors duration-200 ${isRTL ? 'text-right' : ''}`}>
                {t('events.virtualLinkLabel')}
              </h4>
              <p className={`text-gray-600 dark:text-gray-400 transition-colors duration-200 break-all ${isRTL ? 'text-right' : ''}`}>
                {eventData.virtual_link}
              </p>
            </div>
          )}
        </div>

        <div className="bg-blue-50 rounded-lg p-4">
          <h4 className={`font-medium text-blue-900 mb-2 ${isRTL ? 'text-right' : ''}`}>
            {t('events.publishingOptions')}
          </h4>
          <p className={`text-sm text-blue-700 mb-4 ${isRTL ? 'text-right' : ''}`}>
            {t('events.saveAsDraft')}
          </p>
          
          <div className={`flex space-x-3 ${isRTL ? 'space-x-reverse flex-row-reverse' : ''}`}>
            <button
              onClick={() => handleSubmit(false)}
              disabled={loading}
              className="btn-secondary"
            >
              {loading ? t('events.saving') : t('events.saveAsDraftBtn')}
            </button>
            <button
              onClick={() => handleSubmit(true)}
              disabled={loading}
              className="btn-primary"
            >
              {loading ? t('events.publishing') : t('events.saveAndPublish')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const steps = [
    { number: 1, title: t('wizard.step1'), component: renderStep1 },
    { number: 2, title: t('wizard.step2'), component: renderStep2 },
    { number: 3, title: t('wizard.step3'), component: renderStep3 },
    { number: 4, title: t('wizard.step4'), component: renderStep4 }
  ];

  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200 ${isRTL ? 'font-arabic' : ''}`}>
      <Navigation />
      
      <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className={`breadcrumb ${isRTL ? 'flex-row-reverse' : ''}`}>
          <span className="breadcrumb-item">{t('nav.dashboard')}</span>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-item">{t('nav.createEvent')}</span>
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className={`text-3xl font-bold text-gray-900 dark:text-gray-100 transition-colors duration-200 ${isRTL ? 'text-right' : ''}`}>
            {t('wizard.createNewEvent')}
          </h1>
          <p className={`text-gray-600 dark:text-gray-400 transition-colors duration-200 ${isRTL ? 'text-right' : ''}`}>
            {t('wizard.stepByStepWizard')}
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium transition-colors duration-200 ${
                  currentStep >= step.number
                    ? 'bg-blue-600 dark:bg-blue-500 text-white'
                    : 'bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-400'
                }`}>
                  {step.number}
                </div>
                <div className={`${isRTL ? 'mr-2' : 'ml-2'} text-sm font-medium text-gray-900 dark:text-gray-100 transition-colors duration-200`}>
                  {step.title}
                </div>
                {index < steps.length - 1 && (
                  <div className={`${isRTL ? 'mr-4' : 'ml-4'} w-12 h-1 transition-colors duration-200 ${
                    currentStep > step.number ? 'bg-blue-600 dark:bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="alert alert-error mb-6">
            {error}
          </div>
        )}

        {/* Step Content */}
        <div className="card mb-6">
          <div className="card-body">
            {steps[currentStep - 1].component()}
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className={`flex justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
          <button
            onClick={prevStep}
            disabled={currentStep === 1}
            className={`btn-secondary ${currentStep === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {t('wizard.previous')}
          </button>
          
          {currentStep < steps.length ? (
            <button
              onClick={nextStep}
              className="btn-primary"
            >
              {t('wizard.next')}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default EventWizard;