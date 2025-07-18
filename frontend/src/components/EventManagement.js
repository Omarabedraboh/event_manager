import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import { useLanguage } from '../contexts/LanguageContext';
import axios from 'axios';
import Navigation from './Navigation';
import Logo from './Logo';

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
  const [stats, setStats] = useState({});
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [ticketForm, setTicketForm] = useState({
    ticket_type: 'regular',
    price: 0,
    quantity_available: 100
  });

  const [showTicketForm, setShowTicketForm] = useState(false);

  useEffect(() => {
    if (id) {
      fetchEventData();
    }
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
      
      // Calculate stats
      const totalSales = ticketsRes.data.reduce((sum, ticket) => {
        const soldTickets = registrationsRes.data.filter(reg => reg.ticket_id === ticket.id).length;
        return sum + (ticket.price * soldTickets);
      }, 0);

      setStats({
        totalRegistrations: registrationsRes.data.length,
        totalSales,
        totalTickets: ticketsRes.data.length
      });

    } catch (error) {
      setError('Failed to fetch event data');
      console.error(error);
    }
    setLoading(false);
  };

  const handleTicketSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      await axios.post(`${API}/tickets`, {
        ...ticketForm,
        event_id: id
      });
      
      setShowTicketForm(false);
      setTicketForm({
        name: '',
        description: '',
        price: 0,
        quantity: 100,
        sale_starts: '',
        sale_ends: ''
      });
      fetchEventData();
    } catch (error) {
      setError('Failed to create ticket');
      console.error(error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    setTicketForm(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) : value
    }));
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

  const getEventStatusBadge = (event) => {
    if (!event) return null;
    
    const now = new Date();
    const startDate = new Date(event.start_date);
    const endDate = new Date(event.end_date);

    if (now > endDate) {
      return <span className="badge badge-danger">{t('events.status.ended')}</span>;
    } else if (now >= startDate && now <= endDate) {
      return <span className="badge badge-success">{t('events.status.live')}</span>;
    } else if (event.is_published) {
      return <span className="badge badge-primary">{t('events.status.published')}</span>;
    } else {
      return <span className="badge badge-warning">{t('events.status.draft')}</span>;
    }
  };

  const tabs = [
    { id: 'overview', label: t('events.tabs.overview') },
    { id: 'tickets', label: t('events.tabs.tickets') },
    { id: 'registrations', label: t('events.tabs.registrations') }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 dark:border-blue-400"></div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200 ${isRTL ? 'font-arabic' : ''}`}>
        <Navigation />
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 dark:text-red-400 transition-colors duration-200">{t('common.eventNotFound')}</h1>
            <p className="text-gray-600 dark:text-gray-400 transition-colors duration-200">{t('common.eventNotFoundMessage')}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200 ${isRTL ? 'font-arabic' : ''}`}>
      <Navigation />
      
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className={`flex justify-between items-start ${isRTL ? 'flex-row-reverse' : ''}`}>
            <div>
              <div className={`flex items-center space-x-3 ${isRTL ? 'flex-row-reverse space-x-reverse' : ''} mb-2`}>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 transition-colors duration-200">
                  {event.title}
                </h1>
                {getEventStatusBadge(event)}
              </div>
              <p className="text-gray-600 dark:text-gray-400 transition-colors duration-200">
                {event.description}
              </p>
            </div>
            <button
              onClick={() => navigate('/events/create')}
              className="btn-primary"
            >
              {t('events.createAnother')}
            </button>
          </div>
        </div>

        {error && (
          <div className="alert alert-error mb-6">
            {error}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card">
            <div className="card-body">
              <div className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                <div className={`flex-1 ${isRTL ? 'text-right' : ''}`}>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 transition-colors duration-200">{t('events.totalRegistrations')}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 transition-colors duration-200">{stats.totalRegistrations || 0}</p>
                </div>
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full transition-colors duration-200">
                  <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-body">
              <div className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                <div className={`flex-1 ${isRTL ? 'text-right' : ''}`}>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 transition-colors duration-200">{t('events.totalSales')}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 transition-colors duration-200">${stats.totalSales || 0}</p>
                </div>
                <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full transition-colors duration-200">
                  <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z"/>
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.51-1.31c-.562-.649-1.413-1.076-2.353-1.253V5z" clipRule="evenodd"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-body">
              <div className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                <div className={`flex-1 ${isRTL ? 'text-right' : ''}`}>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 transition-colors duration-200">{t('events.totalTickets')}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 transition-colors duration-200">{stats.totalTickets || 0}</p>
                </div>
                <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-full transition-colors duration-200">
                  <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M2 5a2 2 0 012-2h8a2 2 0 012 2v10a2 2 0 002 2H4a2 2 0 01-2-2V5zm3 1h6v4H5V6zm6 6H5v2h6v-2z" clipRule="evenodd"/>
                    <path d="M15 7h1a2 2 0 012 2v5.5a1.5 1.5 0 01-3 0V9a1 1 0 00-1-1h-1v-1z"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="card">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className={`flex space-x-8 ${isRTL ? 'flex-row-reverse space-x-reverse' : ''}`} aria-label="Tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="card-body">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4 transition-colors duration-200">{t('events.eventDetails')}</h3>
                    <div className="space-y-3">
                      <div>
                        <span className="font-medium text-gray-700 dark:text-gray-300 transition-colors duration-200">{t('events.type')}:</span>
                        <span className="ml-2 text-gray-900 dark:text-gray-100 transition-colors duration-200">{t(`events.${event.event_type}`)}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700 dark:text-gray-300 transition-colors duration-200">{t('events.startDate')}:</span>
                        <span className="ml-2 text-gray-900 dark:text-gray-100 transition-colors duration-200">{formatDate(event.start_date)}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700 dark:text-gray-300 transition-colors duration-200">{t('events.endDate')}:</span>
                        <span className="ml-2 text-gray-900 dark:text-gray-100 transition-colors duration-200">{formatDate(event.end_date)}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700 dark:text-gray-300 transition-colors duration-200">{t('events.maxAttendees')}:</span>
                        <span className="ml-2 text-gray-900 dark:text-gray-100 transition-colors duration-200">{event.max_attendees}</span>
                      </div>
                      {event.venue_id && (
                        <div>
                          <span className="font-medium text-gray-700 dark:text-gray-300 transition-colors duration-200">{t('events.venue')}:</span>
                          <span className="ml-2 text-gray-900 dark:text-gray-100 transition-colors duration-200">{event.venue_id}</span>
                        </div>
                      )}
                      {event.virtual_link && (
                        <div>
                          <span className="font-medium text-gray-700 dark:text-gray-300 transition-colors duration-200">{t('events.virtualLink')}:</span>
                          <a href={event.virtual_link} target="_blank" rel="noopener noreferrer" className="ml-2 text-blue-600 dark:text-blue-400 hover:underline transition-colors duration-200">
                            {event.virtual_link}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4 transition-colors duration-200">{t('events.quickActions')}</h3>
                    <div className="space-y-2">
                      {!event.is_published && (
                        <button
                          onClick={async () => {
                            try {
                              await axios.post(`${API}/events/${id}/publish`);
                              fetchEventData();
                            } catch (error) {
                              setError('Failed to publish event');
                            }
                          }}
                          className="btn-success w-full"
                        >
                          {t('events.publishEvent')}
                        </button>
                      )}
                      <button
                        onClick={() => window.open(`/register/${id}`, '_blank')}
                        className="btn-primary w-full"
                      >
                        {t('events.viewRegistrationPage')}
                      </button>
                      <button
                        onClick={() => setActiveTab('tickets')}
                        className="btn-secondary w-full"
                      >
                        {t('events.manageTickets')}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tickets Tab */}
            {activeTab === 'tickets' && (
              <div>
                <div className={`flex justify-between items-center mb-6 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 transition-colors duration-200">{t('events.eventTickets')}</h3>
                  <button
                    onClick={() => setShowTicketForm(true)}
                    className="btn-primary"
                  >
                    {t('events.createTicket')}
                  </button>
                </div>

                {tickets.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {tickets.map((ticket) => {
                      const soldCount = registrations.filter(reg => reg.ticket_id === ticket.id).length;
                      const remainingCount = ticket.quantity - soldCount;
                      
                      return (
                        <div key={ticket.id} className="card">
                          <div className="card-body">
                            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2 transition-colors duration-200">{ticket.name}</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 transition-colors duration-200">{ticket.description}</p>
                            
                            <div className="space-y-2 text-sm">
                              <div className={`flex justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                                <span className="text-gray-600 dark:text-gray-400 transition-colors duration-200">{t('events.price')}:</span>
                                <span className="font-medium text-gray-900 dark:text-gray-100 transition-colors duration-200">${ticket.price}</span>
                              </div>
                              <div className={`flex justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                                <span className="text-gray-600 dark:text-gray-400 transition-colors duration-200">{t('events.sold')}:</span>
                                <span className="font-medium text-gray-900 dark:text-gray-100 transition-colors duration-200">{soldCount}</span>
                              </div>
                              <div className={`flex justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                                <span className="text-gray-600 dark:text-gray-400 transition-colors duration-200">{t('events.remaining')}:</span>
                                <span className="font-medium text-gray-900 dark:text-gray-100 transition-colors duration-200">{remainingCount}</span>
                              </div>
                            </div>

                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-4 transition-colors duration-200">
                              <div 
                                className="bg-blue-600 dark:bg-blue-500 h-2 rounded-full transition-all duration-200" 
                                style={{ width: `${(soldCount / ticket.quantity) * 100}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <svg className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100 transition-colors duration-200">{t('events.noTickets')}</h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 transition-colors duration-200">{t('events.createFirstTicket')}</p>
                  </div>
                )}
              </div>
            )}

            {/* Registrations Tab */}
            {activeTab === 'registrations' && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-6 transition-colors duration-200">{t('events.registrations')}</h3>
                
                {registrations.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider transition-colors duration-200">
                            {t('events.attendee')}
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider transition-colors duration-200">
                            {t('events.ticket')}
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider transition-colors duration-200">
                            {t('events.registrationDate')}
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider transition-colors duration-200">
                            {t('events.status')}
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {registrations.map((registration) => {
                          const ticket = tickets.find(t => t.id === registration.ticket_id);
                          return (
                            <tr key={registration.id}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100 transition-colors duration-200">
                                {registration.attendee_name}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100 transition-colors duration-200">
                                {ticket?.name || 'Unknown'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 transition-colors duration-200">
                                {formatDate(registration.created_at)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="badge badge-success">{t('events.status.confirmed')}</span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <svg className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100 transition-colors duration-200">{t('events.noRegistrations')}</h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 transition-colors duration-200">{t('events.noRegistrationsMessage')}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Create Ticket Modal */}
        {showTicketForm && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-1/2 shadow-lg rounded-md bg-white dark:bg-gray-800 transition-colors duration-200">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4 transition-colors duration-200">
                  {t('events.createTicket')}
                </h3>
                
                <form onSubmit={handleTicketSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors duration-200">
                      {t('events.ticketName')}
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={ticketForm.name}
                      onChange={handleInputChange}
                      className="form-input"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors duration-200">
                      {t('events.description')}
                    </label>
                    <textarea
                      name="description"
                      value={ticketForm.description}
                      onChange={handleInputChange}
                      rows="3"
                      className="form-textarea"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors duration-200">
                        {t('events.price')}
                      </label>
                      <input
                        type="number"
                        name="price"
                        value={ticketForm.price}
                        onChange={handleInputChange}
                        min="0"
                        step="0.01"
                        className="form-input"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors duration-200">
                        {t('events.quantity')}
                      </label>
                      <input
                        type="number"
                        name="quantity"
                        value={ticketForm.quantity}
                        onChange={handleInputChange}
                        min="1"
                        className="form-input"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors duration-200">
                        {t('events.saleStarts')}
                      </label>
                      <input
                        type="datetime-local"
                        name="sale_starts"
                        value={ticketForm.sale_starts}
                        onChange={handleInputChange}
                        className="form-input"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors duration-200">
                        {t('events.saleEnds')}
                      </label>
                      <input
                        type="datetime-local"
                        name="sale_ends"
                        value={ticketForm.sale_ends}
                        onChange={handleInputChange}
                        className="form-input"
                      />
                    </div>
                  </div>

                  <div className={`flex justify-end space-x-3 pt-4 ${isRTL ? 'flex-row-reverse space-x-reverse' : ''}`}>
                    <button
                      type="button"
                      onClick={() => setShowTicketForm(false)}
                      className="btn-secondary"
                    >
                      {t('common.cancel')}
                    </button>
                    <button
                      type="submit"
                      className="btn-primary"
                    >
                      {t('events.createTicket')}
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