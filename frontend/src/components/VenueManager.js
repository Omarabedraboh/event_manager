import React, { useState, useEffect } from 'react';
import { useAuth } from '../App';
import axios from 'axios';
import Navigation from './Navigation';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const VenueManager = () => {
  const { user } = useAuth();
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
          venue_id: venueId,
          start_time: new Date(2025, 2, 15, 10, 0).toISOString(),
          end_time: new Date(2025, 2, 15, 14, 0).toISOString(),
          event_title: 'Tech Conference 2025'
        },
        {
          id: '2',
          venue_id: venueId,
          start_time: new Date(2025, 2, 20, 16, 0).toISOString(),
          end_time: new Date(2025, 2, 20, 20, 0).toISOString(),
          event_title: 'Product Launch Event'
        }
      ];
      setBookings(mockBookings);
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
    }
  };

  const handleVenueSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API}/venues`, venueForm);
      setVenues([...venues, response.data]);
      setVenueForm({
        name: '',
        description: '',
        address: '',
        capacity: 100,
        price_per_hour: 50
      });
      setShowVenueForm(false);
      setError('');
    } catch (error) {
      setError(error.response?.data?.detail || 'Failed to create venue');
    }
  };

  const checkAvailability = async (venueId, date, time) => {
    try {
      const startDate = new Date(date);
      startDate.setHours(parseInt(time.split(':')[0]), parseInt(time.split(':')[1]));
      const endDate = new Date(startDate);
      endDate.setHours(endDate.getHours() + 2); // Check 2-hour slot

      const response = await axios.get(`${API}/venues/${venueId}/availability`, {
        params: {
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString()
        }
      });

      return response.data.available;
    } catch (error) {
      console.error('Failed to check availability:', error);
      return false;
    }
  };

  const generateCalendarDays = () => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days = [];
    for (let i = 0; i < 42; i++) {
      const day = new Date(startDate);
      day.setDate(startDate.getDate() + i);
      
      const isCurrentMonth = day.getMonth() === month;
      const isToday = day.toDateString() === new Date().toDateString();
      const hasBooking = bookings.some(booking => {
        const bookingDate = new Date(booking.start_time);
        return bookingDate.toDateString() === day.toDateString();
      });

      days.push({
        date: day,
        isCurrentMonth,
        isToday,
        hasBooking
      });
    }

    return days;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {user.role === 'venue_owner' ? 'My Venues' : 'Venue Management'}
              </h1>
              <p className="text-gray-600">Manage venue availability and bookings</p>
            </div>
            {user.role === 'venue_owner' && (
              <button
                onClick={() => setShowVenueForm(true)}
                className="btn-primary"
              >
                Add New Venue
              </button>
            )}
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="alert alert-error mb-6">
            {error}
          </div>
        )}

        {/* Venues Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {venues.map(venue => (
            <div key={venue.id} className="card">
              <div className="card-header">
                <h3 className="text-lg font-medium text-gray-900">{venue.name}</h3>
                <p className="text-sm text-gray-500">{venue.address}</p>
              </div>
              <div className="card-body">
                <p className="text-gray-600 mb-4">{venue.description}</p>
                
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Capacity:</span>
                    <span className="font-medium">{venue.capacity} people</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Price per hour:</span>
                    <span className="font-medium">${venue.price_per_hour}</span>
                  </div>
                </div>

                <div className="flex space-x-2">
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
                      Book Now
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {venues.length === 0 && (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No venues</h3>
            <p className="mt-1 text-sm text-gray-500">
              {user.role === 'venue_owner' ? 'Get started by creating your first venue.' : 'No venues available yet.'}
            </p>
          </div>
        )}

        {/* Add Venue Modal */}
        {showVenueForm && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border max-w-md shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Venue</h3>
                <form onSubmit={handleVenueSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Venue Name</label>
                    <input
                      type="text"
                      value={venueForm.name}
                      onChange={(e) => setVenueForm({...venueForm, name: e.target.value})}
                      required
                      className="form-input"
                      placeholder="Enter venue name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea
                      value={venueForm.description}
                      onChange={(e) => setVenueForm({...venueForm, description: e.target.value})}
                      rows="3"
                      className="form-textarea"
                      placeholder="Describe the venue"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Address</label>
                    <input
                      type="text"
                      value={venueForm.address}
                      onChange={(e) => setVenueForm({...venueForm, address: e.target.value})}
                      required
                      className="form-input"
                      placeholder="Enter venue address"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Capacity</label>
                      <input
                        type="number"
                        min="1"
                        value={venueForm.capacity}
                        onChange={(e) => setVenueForm({...venueForm, capacity: parseInt(e.target.value)})}
                        className="form-input"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Price/Hour ($)</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={venueForm.price_per_hour}
                        onChange={(e) => setVenueForm({...venueForm, price_per_hour: parseFloat(e.target.value)})}
                        className="form-input"
                      />
                    </div>
                  </div>
                  
                  <div className="flex space-x-3">
                    <button type="submit" className="btn-primary flex-1">Add Venue</button>
                    <button
                      type="button"
                      onClick={() => setShowVenueForm(false)}
                      className="btn-secondary flex-1"
                    >
                      Cancel
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
            <div className="relative top-10 mx-auto p-5 border max-w-4xl shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    {venues.find(v => v.id === showCalendar)?.name} - Availability Calendar
                  </h3>
                  <button
                    onClick={() => setShowCalendar(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Calendar Header */}
                <div className="flex justify-between items-center mb-4">
                  <button
                    onClick={() => {
                      const newDate = new Date(selectedDate);
                      newDate.setMonth(newDate.getMonth() - 1);
                      setSelectedDate(newDate);
                    }}
                    className="btn-secondary"
                  >
                    Previous
                  </button>
                  <h4 className="text-xl font-semibold">
                    {selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </h4>
                  <button
                    onClick={() => {
                      const newDate = new Date(selectedDate);
                      newDate.setMonth(newDate.getMonth() + 1);
                      setSelectedDate(newDate);
                    }}
                    className="btn-secondary"
                  >
                    Next
                  </button>
                </div>

                {/* Calendar Grid */}
                <div className="calendar-grid">
                  {/* Day headers */}
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="calendar-cell text-center font-medium text-gray-700 bg-gray-100">
                      {day}
                    </div>
                  ))}
                  
                  {/* Calendar days */}
                  {generateCalendarDays().map((day, index) => (
                    <div
                      key={index}
                      className={`calendar-cell ${
                        !day.isCurrentMonth ? 'text-gray-400 bg-gray-100' :
                        day.isToday ? 'bg-blue-100 text-blue-900' :
                        day.hasBooking ? 'occupied' : ''
                      }`}
                    >
                      <div className="font-medium">{day.date.getDate()}</div>
                      {day.hasBooking && day.isCurrentMonth && (
                        <div className="text-xs mt-1">
                          <div className="bg-red-200 text-red-800 px-1 rounded">Booked</div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Legend */}
                <div className="mt-4 flex justify-center space-x-6 text-sm">
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-white border border-gray-300 mr-2"></div>
                    Available
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-red-100 border border-red-300 mr-2"></div>
                    Booked
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-blue-100 border border-blue-300 mr-2"></div>
                    Today
                  </div>
                </div>

                {/* Upcoming Bookings */}
                {bookings.length > 0 && (
                  <div className="mt-6">
                    <h4 className="font-medium text-gray-900 mb-3">Upcoming Bookings</h4>
                    <div className="space-y-2">
                      {bookings.map(booking => (
                        <div key={booking.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <h5 className="font-medium text-gray-900">{booking.event_title}</h5>
                            <p className="text-sm text-gray-600">
                              {formatDate(booking.start_time)} - {formatDate(booking.end_time)}
                            </p>
                          </div>
                          <span className="badge badge-success">Confirmed</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VenueManager;