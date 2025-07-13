import React, { useState, useEffect } from 'react';
import { useAuth } from '../App';
import { useLanguage } from '../contexts/LanguageContext';
import axios from 'axios';
import Navigation from './Navigation';
import Logo from './Logo';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const VenueManager = () => {
  const { user } = useAuth();
  const { t, isRTL } = useLanguage();
  const [venues, setVenues] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [showVenueForm, setShowVenueForm] = useState(false);
  const [showCalendar, setShowCalendar] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [venueForm, setVenueForm] = useState({
    name: '',
    description: '',
    address: '',
    capacity: 100,
    price_per_hour: 50
  });

  useEffect(() => {
    fetchVenues();
  }, []);

  const fetchVenues = async () => {
    try {
      const response = await axios.get(`${API}/venues`);
      setVenues(response.data);
    } catch (error) {
      setError('Failed to fetch venues');
      console.error(error);
    }
    setLoading(false);
  };

  const fetchVenueBookings = async (venueId) => {
    try {
      // For demo purposes, we'll simulate some bookings
      // In a real app, you'd have an endpoint to get venue bookings
      const mockBookings = [
        {
          id: '1',
          title: 'Corporate Meeting',
          start: new Date(2024, 2, 15, 9, 0),
          end: new Date(2024, 2, 15, 17, 0),
          eventId: 'event1'
        },
        {
          id: '2',
          title: 'Wedding Reception',
          start: new Date(2024, 2, 20, 18, 0),
          end: new Date(2024, 2, 20, 23, 0),
          eventId: 'event2'
        }
      ];
      setBookings(mockBookings);
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
    }
  };

  const handleVenueSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      await axios.post(`${API}/venues`, venueForm);
      setShowVenueForm(false);
      setVenueForm({
        name: '',
        description: '',
        address: '',
        capacity: 100,
        price_per_hour: 50
      });
      fetchVenues();
    } catch (error) {
      setError('Failed to create venue');
      console.error(error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    setVenueForm(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) : value
    }));
  };

  const generateCalendarDays = () => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days = [];
    const currentDate = new Date(startDate);

    for (let i = 0; i < 42; i++) {
      const isCurrentMonth = currentDate.getMonth() === month;
      const isToday = currentDate.toDateString() === new Date().toDateString();
      
      days.push({
        date: new Date(currentDate),
        isCurrentMonth,
        isToday,
        bookings: bookings.filter(booking => 
          booking.start.toDateString() === currentDate.toDateString()
        )
      });
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return days;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 dark:border-blue-400"></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200 ${isRTL ? 'font-arabic' : ''}`}>
      <Navigation />
      
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className={`flex justify-between items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
            <div>
              <h1 className={`text-3xl font-bold text-gray-900 dark:text-gray-100 transition-colors duration-200 ${isRTL ? 'text-right' : ''}`}>
                {user.role === 'venue_owner' ? t('nav.myVenues') : t('venues.title')}
              </h1>
              <p className={`text-gray-600 dark:text-gray-400 transition-colors duration-200 ${isRTL ? 'text-right' : ''}`}>
                Manage venue availability and bookings
              </p>
            </div>
            {user.role === 'venue_owner' && (
              <button
                onClick={() => setShowVenueForm(true)}
                className="btn-primary"
              >
                {t('venues.createVenue')}
              </button>
            )}
          </div>
        </div>

        {error && (
          <div className="alert alert-error mb-6">
            {error}
          </div>
        )}

        {/* Venues Grid */}
        {venues.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {venues.map((venue) => (
              <div key={venue.id} className="card">
                <div className="card-body">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2 transition-colors duration-200">
                    {venue.name}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4 transition-colors duration-200">
                    {venue.description}
                  </p>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center text-gray-600 dark:text-gray-400 transition-colors duration-200">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                      </svg>
                      {venue.address}
                    </div>
                    <div className="flex items-center text-gray-600 dark:text-gray-400 transition-colors duration-200">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                      </svg>
                      {venue.capacity} guests
                    </div>
                    <div className="flex items-center text-gray-600 dark:text-gray-400 transition-colors duration-200">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"/>
                      </svg>
                      ${venue.price_per_hour}/hour
                    </div>
                  </div>

                  <div className={`flex gap-2 mt-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <button
                      onClick={() => {
                        setShowCalendar(venue.id);
                        fetchVenueBookings(venue.id);
                      }}
                      className="btn-primary flex-1 text-sm"
                    >
                      View Calendar
                    </button>
                    {user.role === 'organizer' && (
                      <button
                        onClick={() => {
                          alert('Booking functionality would redirect to event creation with this venue pre-selected');
                        }}
                        className="btn-secondary flex-1 text-sm"
                      >
                        Book Venue
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100 transition-colors duration-200">{t('venues.noVenues')}</h3>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 transition-colors duration-200">
              {user.role === 'venue_owner' ? t('venues.createFirstVenue') : 'No venues available yet.'}
            </p>
          </div>
        )}

        {/* Add Venue Modal */}
        {showVenueForm && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-1/2 shadow-lg rounded-md bg-white dark:bg-gray-800 transition-colors duration-200">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4 transition-colors duration-200">
                  {t('venues.createVenue')}
                </h3>
                
                <form onSubmit={handleVenueSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-1 transition-colors duration-200">
                      {t('venues.venueName')}
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={venueForm.name}
                      onChange={handleInputChange}
                      className="form-input"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-1 transition-colors duration-200">
                      {t('venues.description')}
                    </label>
                    <textarea
                      name="description"
                      value={venueForm.description}
                      onChange={handleInputChange}
                      rows="3"
                      className="form-textarea"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-1 transition-colors duration-200">
                      {t('venues.address')}
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={venueForm.address}
                      onChange={handleInputChange}
                      className="form-input"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-1 transition-colors duration-200">
                        {t('venues.capacity')}
                      </label>
                      <input
                        type="number"
                        name="capacity"
                        value={venueForm.capacity}
                        onChange={handleInputChange}
                        min="1"
                        className="form-input"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-1 transition-colors duration-200">
                        {t('venues.pricePerHour')}
                      </label>
                      <input
                        type="number"
                        name="price_per_hour"
                        value={venueForm.price_per_hour}
                        onChange={handleInputChange}
                        min="0"
                        step="0.01"
                        className="form-input"
                        required
                      />
                    </div>
                  </div>

                  <div className={`flex justify-end space-x-3 pt-4 ${isRTL ? 'flex-row-reverse space-x-reverse' : ''}`}>
                    <button
                      type="button"
                      onClick={() => setShowVenueForm(false)}
                      className="btn-secondary"
                    >
                      {t('common.cancel')}
                    </button>
                    <button
                      type="submit"
                      className="btn-primary"
                    >
                      {t('venues.createVenue')}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Calendar Modal */}
        {showCalendar && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-10 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white dark:bg-gray-800 transition-colors duration-200">
              <div className="mt-3">
                <div className={`flex justify-between items-center mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 transition-colors duration-200">
                    {t('venues.availability')}
                  </h3>
                  <button
                    onClick={() => setShowCalendar(null)}
                    className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                  </button>
                </div>

                {/* Calendar Header */}
                <div className={`flex justify-between items-center mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <button
                    onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1, 1))}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors duration-200"
                  >
                    <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
                    </svg>
                  </button>
                  
                  <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 transition-colors duration-200">
                    {selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </h4>
                  
                  <button
                    onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 1))}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors duration-200"
                  >
                    <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                    </svg>
                  </button>
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="p-2 text-center text-sm font-medium text-gray-500 dark:text-gray-400 transition-colors duration-200">
                      {day}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-1">
                  {generateCalendarDays().map((day, index) => (
                    <div
                      key={index}
                      className={`p-2 text-center text-sm rounded transition-colors duration-200 ${
                        day.isCurrentMonth
                          ? day.isToday
                            ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-900 dark:text-blue-100'
                            : 'text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700'
                          : 'text-gray-400 dark:text-gray-600'
                      } ${day.bookings.length > 0 ? 'bg-red-100 dark:bg-red-900/30' : ''}`}
                    >
                      {day.date.getDate()}
                      {day.bookings.length > 0 && (
                        <div className="w-1 h-1 bg-red-500 dark:bg-red-400 rounded-full mx-auto mt-1"></div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="mt-4 text-xs text-gray-500 dark:text-gray-400 transition-colors duration-200">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-red-500 dark:bg-red-400 rounded-full mr-2"></div>
                    Booked dates
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VenueManager;