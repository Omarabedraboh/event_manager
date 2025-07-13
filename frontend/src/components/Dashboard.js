import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import { useLanguage } from '../contexts/LanguageContext';
import axios from 'axios';
import Navigation from './Navigation';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({});
  const [events, setEvents] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, eventsRes] = await Promise.all([
        axios.get(`${API}/dashboard/stats`),
        axios.get(`${API}/events`)
      ]);

      setStats(statsRes.data);
      setEvents(eventsRes.data);

      // Fetch role-specific data
      if (user.role === 'attendee') {
        const regRes = await axios.get(`${API}/my-registrations`);
        setRegistrations(regRes.data);
      } else if (user.role === 'venue_owner') {
        const venuesRes = await axios.get(`${API}/venues`);
        setVenues(venuesRes.data);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    }
    setLoading(false);
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

  const getEventTypeClass = (type) => {
    switch (type) {
      case 'physical': return 'event-type-physical';
      case 'virtual': return 'event-type-virtual';
      case 'hybrid': return 'event-type-hybrid';
      default: return 'badge-primary';
    }
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
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user.name}!
          </h1>
          <p className="text-gray-600 capitalize">
            {user.role.replace('_', ' ')} Dashboard
          </p>
        </div>

        {/* Stats Cards */}
        <div className="dashboard-grid mb-8">
          {user.role === 'organizer' && (
            <>
              <div className="card">
                <div className="card-body">
                  <div className="flex items-center">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-600">Total Events</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.total_events || 0}</p>
                    </div>
                    <div className="p-3 bg-blue-100 rounded-full">
                      <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zM4 7h12v9H4V7z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="card-body">
                  <div className="flex items-center">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-600">Published Events</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.published_events || 0}</p>
                    </div>
                    <div className="p-3 bg-green-100 rounded-full">
                      <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="card-body">
                  <div className="flex items-center">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-600">Total Registrations</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.total_registrations || 0}</p>
                    </div>
                    <div className="p-3 bg-purple-100 rounded-full">
                      <svg className="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {user.role === 'attendee' && (
            <>
              <div className="card">
                <div className="card-body">
                  <div className="flex items-center">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-600">My Registrations</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.my_registrations || 0}</p>
                    </div>
                    <div className="p-3 bg-blue-100 rounded-full">
                      <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="card-body">
                  <div className="flex items-center">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-600">Available Events</p>
                      <p className="text-2xl font-bold text-gray-900">{events.length}</p>
                    </div>
                    <div className="p-3 bg-green-100 rounded-full">
                      <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zM4 7h12v9H4V7z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {user.role === 'venue_owner' && (
            <>
              <div className="card">
                <div className="card-body">
                  <div className="flex items-center">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-600">My Venues</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.total_venues || 0}</p>
                    </div>
                    <div className="p-3 bg-blue-100 rounded-full">
                      <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm2 3a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="card-body">
                  <div className="flex items-center">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.total_bookings || 0}</p>
                    </div>
                    <div className="p-3 bg-green-100 rounded-full">
                      <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {user.role === 'organizer' && (
            <div className="card">
              <div className="card-header">
                <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
              </div>
              <div className="card-body">
                <div className="space-y-3">
                  <button
                    onClick={() => navigate('/events/create')}
                    className="btn-primary w-full"
                  >
                    Create New Event
                  </button>
                  <button
                    onClick={() => navigate('/venues')}
                    className="btn-secondary w-full"
                  >
                    Manage Venues
                  </button>
                  <button
                    onClick={() => navigate('/analytics')}
                    className="btn-secondary w-full"
                  >
                    View Analytics
                  </button>
                </div>
              </div>
            </div>
          )}

          {user.role === 'venue_owner' && (
            <div className="card">
              <div className="card-header">
                <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
              </div>
              <div className="card-body">
                <div className="space-y-3">
                  <button
                    onClick={() => navigate('/venues')}
                    className="btn-primary w-full"
                  >
                    Manage My Venues
                  </button>
                  <button
                    onClick={() => navigate('/venues')}
                    className="btn-secondary w-full"
                  >
                    Add New Venue
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Recent Events */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-medium text-gray-900">
                {user.role === 'attendee' ? 'Available Events' : 'Recent Events'}
              </h3>
            </div>
            <div className="card-body">
              {events.length > 0 ? (
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {events.slice(0, 5).map((event) => (
                    <div key={event.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{event.title}</h4>
                        <p className="text-sm text-gray-600">{formatDate(event.start_date)}</p>
                        <span className={`badge ${getEventTypeClass(event.event_type)}`}>
                          {event.event_type}
                        </span>
                      </div>
                      <div className="flex space-x-2">
                        {user.role === 'attendee' && (
                          <button
                            onClick={() => navigate(`/register/${event.id}`)}
                            className="btn-primary text-xs py-1 px-2"
                          >
                            Register
                          </button>
                        )}
                        {(user.role === 'organizer' || user.role === 'admin') && (
                          <button
                            onClick={() => navigate(`/events/${event.id}`)}
                            className="btn-secondary text-xs py-1 px-2"
                          >
                            Manage
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">
                  {user.role === 'attendee' ? 'No events available' : 'No events created yet'}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* My Registrations (for attendees) */}
        {user.role === 'attendee' && registrations.length > 0 && (
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-medium text-gray-900">My Registrations</h3>
            </div>
            <div className="card-body">
              <div className="space-y-3">
                {registrations.map((registration) => (
                  <div key={registration.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900">{registration.event?.title}</h4>
                      <p className="text-sm text-gray-600">
                        {formatDate(registration.event?.start_date)} - {registration.ticket?.ticket_type}
                      </p>
                      <span className={`badge ${registration.payment_status === 'completed' ? 'badge-success' : 'badge-warning'}`}>
                        {registration.payment_status}
                      </span>
                    </div>
                    {registration.qr_code && (
                      <button
                        onClick={() => {
                          const newWindow = window.open();
                          newWindow.document.write(`
                            <html>
                              <head><title>Event Ticket</title></head>
                              <body style="text-align: center; padding: 20px;">
                                <h2>${registration.event?.title}</h2>
                                <img src="${registration.qr_code}" alt="QR Code" style="border: 1px solid #ccc; padding: 10px;"/>
                                <p>Show this QR code at the event entrance</p>
                              </body>
                            </html>
                          `);
                        }}
                        className="btn-primary text-xs py-1 px-2"
                      >
                        View Ticket
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;