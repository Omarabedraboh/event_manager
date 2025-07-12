import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import axios from 'axios';
import Navigation from './Navigation';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const EventWizard = () => {
  const { user } = useAuth();
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
      setError('Please fill in all required fields');
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
        <h3 className="text-lg font-medium text-gray-900 mb-4">Event Details</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Event Title *</label>
            <input
              type="text"
              name="title"
              value={eventData.title}
              onChange={handleChange}
              placeholder="Enter event title"
              className="form-input"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Description *</label>
            <textarea
              name="description"
              value={eventData.description}
              onChange={handleChange}
              rows="4"
              placeholder="Describe your event"
              className="form-textarea"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Event Type *</label>
            <select
              name="event_type"
              value={eventData.event_type}
              onChange={handleChange}
              className="form-select"
            >
              <option value="physical">Physical Event</option>
              <option value="virtual">Virtual Event</option>
              <option value="hybrid">Hybrid Event (Physical + Virtual)</option>
            </select>
            <p className="mt-1 text-sm text-gray-500">
              {eventData.event_type === 'hybrid' && 'Hybrid events allow both in-person and virtual attendance'}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Maximum Attendees</label>
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
        <h3 className="text-lg font-medium text-gray-900 mb-4">Event Schedule</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Start Date & Time *</label>
            <input
              type="datetime-local"
              name="start_date"
              value={eventData.start_date}
              onChange={handleChange}
              className="form-input"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">End Date & Time *</label>
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
            <p className="text-sm text-blue-700">
              Event duration: {Math.round((new Date(eventData.end_date) - new Date(eventData.start_date)) / (1000 * 60 * 60))} hours
            </p>
          </div>
        )}
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Event Location</h3>
        
        {(eventData.event_type === 'physical' || eventData.event_type === 'hybrid') && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Physical Venue {eventData.event_type === 'hybrid' ? '(Required for hybrid)' : '*'}
            </label>
            <select
              name="venue_id"
              value={eventData.venue_id}
              onChange={handleChange}
              className="form-select"
            >
              <option value="">Select a venue</option>
              {venues.map(venue => (
                <option key={venue.id} value={venue.id}>
                  {venue.name} - {venue.address} (Capacity: {venue.capacity})
                </option>
              ))}
            </select>
            
            {venues.length === 0 && (
              <p className="mt-2 text-sm text-yellow-600">
                No venues available. Contact venue owners to add venues.
              </p>
            )}
          </div>
        )}

        {(eventData.event_type === 'virtual' || eventData.event_type === 'hybrid') && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Virtual Meeting Link {eventData.event_type === 'hybrid' ? '(Required for hybrid)' : '*'}
            </label>
            <input
              type="url"
              name="virtual_link"
              value={eventData.virtual_link}
              onChange={handleChange}
              placeholder="https://zoom.us/j/123456789 or https://meet.google.com/abc-defg-hij"
              className="form-input"
            />
            <p className="mt-1 text-sm text-gray-500">
              Enter the virtual meeting link (Zoom, Google Meet, Teams, etc.)
            </p>
          </div>
        )}

        {eventData.event_type === 'hybrid' && (
          <div className="mt-6 p-4 bg-purple-50 rounded-lg">
            <h4 className="font-medium text-purple-900 mb-2">Hybrid Event Benefits</h4>
            <ul className="text-sm text-purple-700 space-y-1">
              <li>• Reach wider audience with virtual attendance</li>
              <li>• Provide flexible attendance options</li>
              <li>• Increase event accessibility</li>
              <li>• Maximize venue utilization</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Review & Publish</h3>
        
        <div className="bg-gray-50 rounded-lg p-6 space-y-4">
          <div>
            <h4 className="font-medium text-gray-900">Event Details</h4>
            <p className="text-gray-600">{eventData.title}</p>
            <p className="text-sm text-gray-500">{eventData.description}</p>
          </div>

          <div>
            <h4 className="font-medium text-gray-900">Type & Capacity</h4>
            <div className="flex space-x-4">
              <span className={`badge ${
                eventData.event_type === 'physical' ? 'event-type-physical' :
                eventData.event_type === 'virtual' ? 'event-type-virtual' :
                'event-type-hybrid'
              }`}>
                {eventData.event_type}
              </span>
              <span className="text-sm text-gray-600">Max: {eventData.max_attendees} attendees</span>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-gray-900">Schedule</h4>
            <p className="text-gray-600">
              {new Date(eventData.start_date).toLocaleString()} - {new Date(eventData.end_date).toLocaleString()}
            </p>
          </div>

          {eventData.venue_id && (
            <div>
              <h4 className="font-medium text-gray-900">Venue</h4>
              <p className="text-gray-600">
                {venues.find(v => v.id === eventData.venue_id)?.name}
              </p>
            </div>
          )}

          {eventData.virtual_link && (
            <div>
              <h4 className="font-medium text-gray-900">Virtual Link</h4>
              <p className="text-gray-600 break-all">{eventData.virtual_link}</p>
            </div>
          )}
        </div>

        <div className="bg-blue-50 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">Publishing Options</h4>
          <p className="text-sm text-blue-700 mb-4">
            You can save as draft for later editing or publish immediately to make it visible to attendees.
          </p>
          
          <div className="flex space-x-3">
            <button
              onClick={() => handleSubmit(false)}
              disabled={loading}
              className="btn-secondary"
            >
              {loading ? 'Saving...' : 'Save as Draft'}
            </button>
            <button
              onClick={() => handleSubmit(true)}
              disabled={loading}
              className="btn-primary"
            >
              {loading ? 'Publishing...' : 'Save & Publish'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const steps = [
    { number: 1, title: 'Event Details', component: renderStep1 },
    { number: 2, title: 'Schedule', component: renderStep2 },
    { number: 3, title: 'Location', component: renderStep3 },
    { number: 4, title: 'Review', component: renderStep4 }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="breadcrumb">
          <span className="breadcrumb-item">Dashboard</span>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-item">Create Event</span>
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Create New Event</h1>
          <p className="text-gray-600">Set up your event with our step-by-step wizard</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                  currentStep >= step.number
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-300 text-gray-600'
                }`}>
                  {step.number}
                </div>
                <div className="ml-2 text-sm font-medium text-gray-900">
                  {step.title}
                </div>
                {index < steps.length - 1 && (
                  <div className={`ml-4 w-12 h-1 ${
                    currentStep > step.number ? 'bg-blue-600' : 'bg-gray-300'
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
        <div className="flex justify-between">
          <button
            onClick={prevStep}
            disabled={currentStep === 1}
            className={`btn-secondary ${currentStep === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            Previous
          </button>
          
          {currentStep < steps.length ? (
            <button
              onClick={nextStep}
              className="btn-primary"
            >
              Next
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default EventWizard;