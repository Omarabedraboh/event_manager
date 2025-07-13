import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import { useLanguage } from '../contexts/LanguageContext';
import axios from 'axios';
import Navigation from './Navigation';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const EventManagement = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { t, isRTL } = useLanguage();
  const navigate = useNavigate();
  
  const [event, setEvent] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTicketForm, setShowTicketForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [error, setError] = useState('');

  const [ticketForm, setTicketForm] = useState({
    ticket_type: 'regular',
    price: 0,
    quantity_available: 50
  });

  const [editForm, setEditForm] = useState({
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
    fetchEventData();
    fetchVenues();
  }, [id]);

  const fetchEventData = async () => {
    try {
      const [eventRes, ticketsRes, registrationsRes] = await Promise.all([
        axios.get(`${API}/events/${id}`),
        axios.get(`${API}/events/${id}/tickets`),
        axios.get(`${API}/events/${id}/registrations`)
      ]);

      setEvent(eventRes.data);
      setTickets(ticketsRes.data);
      setRegistrations(registrationsRes.data);
      
      // Set edit form with current event data
      const eventData = eventRes.data;
      setEditForm({
        title: eventData.title,
        description: eventData.description,
        event_type: eventData.event_type,
        start_date: eventData.start_date.slice(0, 16), // Format for datetime-local
        end_date: eventData.end_date.slice(0, 16),
        venue_id: eventData.venue_id || '',
        virtual_link: eventData.virtual_link || '',
        max_attendees: eventData.max_attendees
      });
    } catch (error) {
      setError('Failed to fetch event data');
      console.error(error);
    }
    setLoading(false);
  };

  const fetchVenues = async () => {
    try {
      const response = await axios.get(`${API}/venues`);
      setVenues(response.data);
    } catch (error) {
      console.error('Failed to fetch venues:', error);
    }
  };

  const handleTicketSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API}/tickets`, {
        ...ticketForm,
        event_id: id
      });
      
      setTickets([...tickets, response.data]);
      setTicketForm({ ticket_type: 'regular', price: 0, quantity_available: 50 });
      setShowTicketForm(false);
      setError('');
    } catch (error) {
      setError(error.response?.data?.detail || 'Failed to create ticket');
    }
  };

  const handleEventUpdate = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${API}/events/${id}`, editForm);
      await fetchEventData(); // Refresh data
      setShowEditForm(false);
      setError('');
    } catch (error) {
      setError(error.response?.data?.detail || 'Failed to update event');
    }
  };

  const handlePublish = async () => {
    try {
      await axios.post(`${API}/events/${id}/publish`);
      await fetchEventData();
      setError('');
    } catch (error) {
      setError(error.response?.data?.detail || 'Failed to publish event');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
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

  const totalRevenue = tickets.reduce((sum, ticket) => sum + (ticket.price * ticket.quantity_sold), 0);
  const totalRegistrations = registrations.length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className={`min-h-screen bg-gray-50 ${isRTL ? 'font-arabic' : ''}`}>
        <Navigation />
        <div className="max-w-4xl mx-auto py-6 px-4">
          <div className={`text-center ${isRTL ? 'text-right' : ''}`}>
            <h1 className="text-2xl font-bold text-red-600">{t('events.eventNotFound')}</h1>
            <button onClick={() => navigate('/')} className="btn-primary mt-4">
              {t('events.backToDashboard')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gray-50 ${isRTL ? 'font-arabic' : ''}`}>
      <Navigation />
      
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className={`breadcrumb ${isRTL ? 'flex-row-reverse' : ''}`}>
          <span className="breadcrumb-item">{t('nav.dashboard')}</span>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-item">{t('events.title')}</span>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-item">{event.title}</span>
        </div>

        {/* Header */}
        <div className="mb-8">
          <div className={`flex justify-between items-start ${isRTL ? 'flex-row-reverse' : ''}`}>
            <div>
              <h1 className={`text-3xl font-bold text-gray-900 ${isRTL ? 'text-right' : ''}`}>
                {event.title}
              </h1>
              <div className={`flex items-center space-x-4 rtl:space-x-reverse mt-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <span className={`badge ${getEventTypeClass(event.event_type)}`}>
                  {t(`events.${event.event_type}`)}
                </span>
                <span className={`badge ${event.is_published ? 'badge-success' : 'badge-warning'}`}>
                  {event.is_published ? t('events.published') : t('events.draft')}
                </span>
              </div>
            </div>
            <div className={`flex space-x-3 rtl:space-x-reverse ${isRTL ? 'flex-row-reverse' : ''}`}>
              <button
                onClick={() => setShowEditForm(true)}
                className="btn-secondary"
              >
                {t('events.editEvent')}
              </button>
              {!event.is_published && (
                <button
                  onClick={handlePublish}
                  className="btn-success"
                >
                  {t('events.publishEvent')}
                </button>
              )}
              <button
                onClick={() => navigate(`/register/${event.id}`)}
                className="btn-primary"
              >
                {t('events.viewRegistrationPage')}
              </button>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="alert alert-error mb-6">
            {error}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card">
            <div className="card-body">
              <div className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                <div className={`flex-1 ${isRTL ? 'text-right' : ''}`}>
                  <p className="text-sm font-medium text-gray-600">{t('events.totalRegistrationsStats')}</p>
                  <p className="text-2xl font-bold text-gray-900">{totalRegistrations}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-body">
              <div className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                <div className={`flex-1 ${isRTL ? 'text-right' : ''}`}>
                  <p className="text-sm font-medium text-gray-600">{t('events.capacity')}</p>
                  <p className="text-2xl font-bold text-gray-900">{event.max_attendees}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V8zm0 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-body">
              <div className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                <div className={`flex-1 ${isRTL ? 'text-right' : ''}`}>
                  <p className="text-sm font-medium text-gray-600">{t('events.revenueStats')}</p>
                  <p className="text-2xl font-bold text-gray-900">${totalRevenue.toFixed(2)}</p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-full">
                  <svg className="w-6 h-6 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-body">
              <div className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                <div className={`flex-1 ${isRTL ? 'text-right' : ''}`}>
                  <p className="text-sm font-medium text-gray-600">{t('events.attendanceRate')}</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {event.max_attendees > 0 ? Math.round((totalRegistrations / event.max_attendees) * 100) : 0}%
                  </p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <svg className="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Event Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Event Information */}
            <div className="card">
              <div className="card-header">
                <h3 className={`text-lg font-medium text-gray-900 ${isRTL ? 'text-right' : ''}`}>
                  {t('events.eventDetails')}
                </h3>
              </div>
              <div className="card-body space-y-4">
                <div>
                  <h4 className={`font-medium text-gray-900 ${isRTL ? 'text-right' : ''}`}>
                    {t('events.description')}
                  </h4>
                  <p className={`text-gray-600 ${isRTL ? 'text-right' : ''}`}>{event.description}</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className={`font-medium text-gray-900 ${isRTL ? 'text-right' : ''}`}>
                      {t('events.startDateLabel')}
                    </h4>
                    <p className={`text-gray-600 ${isRTL ? 'text-right' : ''}`}>
                      {formatDate(event.start_date)}
                    </p>
                  </div>
                  <div>
                    <h4 className={`font-medium text-gray-900 ${isRTL ? 'text-right' : ''}`}>
                      {t('events.endDateLabel')}
                    </h4>
                    <p className={`text-gray-600 ${isRTL ? 'text-right' : ''}`}>
                      {formatDate(event.end_date)}
                    </p>
                  </div>
                </div>

                {event.venue_id && (
                  <div>
                    <h4 className={`font-medium text-gray-900 ${isRTL ? 'text-right' : ''}`}>
                      {t('events.venueLabel')}
                    </h4>
                    <p className={`text-gray-600 ${isRTL ? 'text-right' : ''}`}>
                      {venues.find(v => v.id === event.venue_id)?.name || t('events.venueInfo')}
                    </p>
                  </div>
                )}

                {event.virtual_link && (
                  <div>
                    <h4 className={`font-medium text-gray-900 ${isRTL ? 'text-right' : ''}`}>
                      {t('events.virtualLinkLabel')}
                    </h4>
                    <a href={event.virtual_link} target="_blank" rel="noopener noreferrer" className={`text-blue-600 hover:text-blue-800 break-all ${isRTL ? 'text-right' : ''}`}>
                      {event.virtual_link}
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Tickets Management */}
            <div className="card">
              <div className="card-header">
                <div className={`flex justify-between items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <h3 className={`text-lg font-medium text-gray-900 ${isRTL ? 'text-right' : ''}`}>
                    {t('tickets.title')}
                  </h3>
                  <button
                    onClick={() => setShowTicketForm(true)}
                    className="btn-primary"
                  >
                    {t('events.addTicketType')}
                  </button>
                </div>
              </div>
              <div className="card-body">
                {tickets.length > 0 ? (
                  <div className="space-y-3">
                    {tickets.map(ticket => (
                      <div key={ticket.id} className={`flex items-center justify-between p-4 bg-gray-50 rounded-lg ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <div className={isRTL ? 'text-right' : ''}>
                          <h4 className="font-medium text-gray-900 capitalize">
                            {t(`tickets.${ticket.ticket_type}`)}
                          </h4>
                          <p className="text-sm text-gray-600">
                            ${ticket.price} • {ticket.quantity_sold} / {ticket.quantity_available} {t('events.sold')}
                          </p>
                        </div>
                        <div className={`text-right ${isRTL ? 'text-left' : ''}`}>
                          <p className="font-medium text-gray-900">
                            ${(ticket.price * ticket.quantity_sold).toFixed(2)}
                          </p>
                          <p className="text-sm text-gray-500">{t('events.revenueStats')}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className={`text-gray-500 text-center py-4 ${isRTL ? 'text-right' : ''}`}>
                    {t('events.noTicketsCreated')}
                  </p>
                )}
              </div>
            </div>

            {/* Registrations List */}
            <div className="card">
              <div className="card-header">
                <h3 className={`text-lg font-medium text-gray-900 ${isRTL ? 'text-right' : ''}`}>
                  {t('events.recentRegistrations')}
                </h3>
              </div>
              <div className="card-body">
                {registrations.length > 0 ? (
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {registrations.slice(0, 10).map(registration => (
                      <div key={registration.id} className={`flex items-center justify-between p-3 bg-gray-50 rounded-lg ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <div className={isRTL ? 'text-right' : ''}>
                          <h4 className="font-medium text-gray-900">{registration.attendee?.name}</h4>
                          <p className="text-sm text-gray-600">{registration.attendee?.email}</p>
                        </div>
                        <div className={`text-right ${isRTL ? 'text-left' : ''}`}>
                          <span className={`badge ${registration.payment_status === 'completed' ? 'badge-success' : 'badge-warning'}`}>
                            {registration.payment_status}
                          </span>
                          <p className="text-sm text-gray-500 mt-1">
                            {new Date(registration.registration_date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className={`text-gray-500 text-center py-4 ${isRTL ? 'text-right' : ''}`}>
                    {t('events.noRegistrationsYet')}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="card">
              <div className="card-header">
                <h3 className={`text-lg font-medium text-gray-900 ${isRTL ? 'text-right' : ''}`}>
                  {t('dashboard.quickActions')}
                </h3>
              </div>
              <div className="card-body space-y-3">
                <button
                  onClick={() => navigate(`/register/${event.id}`)}
                  className="btn-primary w-full"
                >
                  {t('events.viewRegistrationPage')}
                </button>
                <button
                  onClick={() => {
                    const registrationsData = registrations.map(reg => ({
                      name: reg.attendee?.name,
                      email: reg.attendee?.email,
                      ticket_type: reg.ticket?.ticket_type,
                      registration_date: new Date(reg.registration_date).toLocaleDateString()
                    }));
                    
                    const csvContent = "data:text/csv;charset=utf-8," + 
                      "Name,Email,Ticket Type,Registration Date\n" +
                      registrationsData.map(row => 
                        `"${row.name}","${row.email}","${row.ticket_type}","${row.registration_date}"`
                      ).join("\n");
                    
                    const link = document.createElement("a");
                    link.setAttribute("href", encodeURI(csvContent));
                    link.setAttribute("download", `${event.title}_registrations.csv`);
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }}
                  className="btn-secondary w-full"
                  disabled={registrations.length === 0}
                >
                  {t('events.exportAttendees')}
                </button>
                <button
                  onClick={() => navigate('/analytics')}
                  className="btn-secondary w-full"
                >
                  {t('events.viewAnalytics')}
                </button>
              </div>
            </div>

            {/* Event Status */}
            <div className="card">
              <div className="card-header">
                <h3 className={`text-lg font-medium text-gray-900 ${isRTL ? 'text-right' : ''}`}>
                  {t('events.eventStatus')}
                </h3>
              </div>
              <div className="card-body">
                <div className="space-y-3">
                  <div className={`flex justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <span className="text-gray-600">{t('events.status')}:</span>
                    <span className={`badge ${event.is_published ? 'badge-success' : 'badge-warning'}`}>
                      {event.is_published ? t('events.published') : t('events.draft')}
                    </span>
                  </div>
                  <div className={`flex justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <span className="text-gray-600">{t('events.type')}:</span>
                    <span className={`badge ${getEventTypeClass(event.event_type)}`}>
                      {t(`events.${event.event_type}`)}
                    </span>
                  </div>
                  <div className={`flex justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <span className="text-gray-600">{t('events.created')}:</span>
                    <span className="text-gray-900">
                      {new Date(event.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Add Ticket Modal */}
        {showTicketForm && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className={`text-lg font-medium text-gray-900 mb-4 ${isRTL ? 'text-right' : ''}`}>
                  {t('events.addTicketType')}
                </h3>
                <form onSubmit={handleTicketSubmit} className="space-y-4">
                  <div>
                    <label className={`block text-sm font-medium text-gray-700 ${isRTL ? 'text-right' : ''}`}>
                      {t('tickets.ticketType')}
                    </label>
                    <select
                      value={ticketForm.ticket_type}
                      onChange={(e) => setTicketForm({...ticketForm, ticket_type: e.target.value})}
                      className="form-select"
                    >
                      <option value="early_bird">{t('tickets.earlyBird')}</option>
                      <option value="regular">{t('tickets.regular')}</option>
                      <option value="vip">{t('tickets.vip')}</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className={`block text-sm font-medium text-gray-700 ${isRTL ? 'text-right' : ''}`}>
                      {t('tickets.priceLabel')}
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={ticketForm.price}
                      onChange={(e) => setTicketForm({...ticketForm, price: parseFloat(e.target.value)})}
                      className="form-input"
                    />
                  </div>
                  
                  <div>
                    <label className={`block text-sm font-medium text-gray-700 ${isRTL ? 'text-right' : ''}`}>
                      {t('tickets.quantityAvailable')}
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={ticketForm.quantity_available}
                      onChange={(e) => setTicketForm({...ticketForm, quantity_available: parseInt(e.target.value)})}
                      className="form-input"
                    />
                  </div>
                  
                  <div className={`flex space-x-3 ${isRTL ? 'space-x-reverse flex-row-reverse' : ''}`}>
                    <button type="submit" className="btn-primary flex-1">
                      {t('tickets.addTicket')}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowTicketForm(false)}
                      className="btn-secondary flex-1"
                    >
                      {t('common.cancel')}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Edit Event Modal */}
        {showEditForm && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-10 mx-auto p-5 border max-w-2xl shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className={`text-lg font-medium text-gray-900 mb-4 ${isRTL ? 'text-right' : ''}`}>
                  {t('events.editEvent')}
                </h3>
                <form onSubmit={handleEventUpdate} className="space-y-4">
                  <div>
                    <label className={`block text-sm font-medium text-gray-700 ${isRTL ? 'text-right' : ''}`}>
                      {t('events.eventTitle')}
                    </label>
                    <input
                      type="text"
                      value={editForm.title}
                      onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                      className="form-input"
                      dir={isRTL ? 'rtl' : 'ltr'}
                    />
                  </div>
                  
                  <div>
                    <label className={`block text-sm font-medium text-gray-700 ${isRTL ? 'text-right' : ''}`}>
                      {t('events.description')}
                    </label>
                    <textarea
                      value={editForm.description}
                      onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                      rows="3"
                      className="form-textarea"
                      dir={isRTL ? 'rtl' : 'ltr'}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm font-medium text-gray-700 ${isRTL ? 'text-right' : ''}`}>
                        {t('events.startDateLabel')}
                      </label>
                      <input
                        type="datetime-local"
                        value={editForm.start_date}
                        onChange={(e) => setEditForm({...editForm, start_date: e.target.value})}
                        className="form-input"
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium text-gray-700 ${isRTL ? 'text-right' : ''}`}>
                        {t('events.endDateLabel')}
                      </label>
                      <input
                        type="datetime-local"
                        value={editForm.end_date}
                        onChange={(e) => setEditForm({...editForm, end_date: e.target.value})}
                        className="form-input"
                      />
                    </div>
                  </div>
                  
                  <div className={`flex space-x-3 ${isRTL ? 'space-x-reverse flex-row-reverse' : ''}`}>
                    <button type="submit" className="btn-primary flex-1">
                      {t('common.update')} {t('events.title')}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowEditForm(false)}
                      className="btn-secondary flex-1"
                    >
                      {t('common.cancel')}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventManagement;