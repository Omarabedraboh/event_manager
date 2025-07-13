import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import { useLanguage } from '../contexts/LanguageContext';
import axios from 'axios';
import Navigation from './Navigation';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const RegistrationPage = () => {
  const { eventId } = useParams();
  const { user } = useAuth();
  const { t, isRTL } = useLanguage();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [selectedTickets, setSelectedTickets] = useState({});
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [qrCode, setQrCode] = useState('');

  useEffect(() => {
    if (eventId) {
      fetchEventData();
    }
  }, [eventId]);

  const fetchEventData = async () => {
    try {
      const [eventRes, ticketsRes] = await Promise.all([
        axios.get(`${API}/events/${eventId}`),
        axios.get(`${API}/tickets?event_id=${eventId}`)
      ]);

      setEvent(eventRes.data);
      setTickets(ticketsRes.data);
    } catch (error) {
      setError('Failed to fetch event data');
      console.error(error);
    }
    setLoading(false);
  };

  const handleTicketQuantityChange = (ticketId, quantity) => {
    setSelectedTickets(prev => ({
      ...prev,
      [ticketId]: Math.max(0, quantity)
    }));
  };

  const calculateTotal = () => {
    return tickets.reduce((total, ticket) => {
      const quantity = selectedTickets[ticket.id] || 0;
      return total + (ticket.price * quantity);
    }, 0);
  };

  const getTotalTickets = () => {
    return Object.values(selectedTickets).reduce((sum, quantity) => sum + quantity, 0);
  };

  const handleRegister = async () => {
    const totalTickets = getTotalTickets();
    if (totalTickets === 0) {
      setError(t('registration.selectTickets'));
      return;
    }

    setRegistering(true);
    setError('');

    try {
      // Register for each selected ticket
      const registrations = [];
      for (const [ticketId, quantity] of Object.entries(selectedTickets)) {
        if (quantity > 0) {
          for (let i = 0; i < quantity; i++) {
            const registrationData = {
              event_id: eventId,
              ticket_id: ticketId,
              attendee_name: user.name,
              attendee_email: user.email
            };
            
            const response = await axios.post(`${API}/register`, registrationData);
            registrations.push(response.data);
          }
        }
      }

      // Generate QR code for the first registration
      if (registrations.length > 0) {
        const qrData = {
          registration_id: registrations[0].id,
          event_id: eventId,
          attendee_name: user.name,
          attendee_email: user.email
        };
        
        // Simple QR code simulation (in real app, use a QR library)
        setQrCode(`QR_${registrations[0].id}_${eventId}`);
      }

      setSuccess(true);
    } catch (error) {
      setError('Failed to register for event');
      console.error(error);
    }
    setRegistering(false);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

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

  if (success) {
    return (
      <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200 ${isRTL ? 'font-arabic' : ''}`}>
        <Navigation />
        <div className="max-w-2xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="mb-8">
              <div className="p-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg transition-colors duration-200">
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full transition-colors duration-200">
                    <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                  </div>
                </div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4 transition-colors duration-200">
                  {t('registration.success')}
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mb-6 transition-colors duration-200">
                  {t('registration.successMessage')}
                </p>
              </div>
            </div>

            {/* Event Details */}
            <div className="card mb-8">
              <div className="card-body">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4 transition-colors duration-200">
                  {event.title}
                </h2>
                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400 transition-colors duration-200">
                  <p><strong className="text-gray-900 dark:text-gray-100 transition-colors duration-200">{t('registration.when')}:</strong> {formatDate(event.start_date)}</p>
                  <p><strong className="text-gray-900 dark:text-gray-100 transition-colors duration-200">{t('registration.type')}:</strong> {t(`events.types.${event.event_type}`)}</p>
                  {event.venue_id && (
                    <p><strong className="text-gray-900 dark:text-gray-100 transition-colors duration-200">{t('registration.venue')}:</strong> {event.venue_id}</p>
                  )}
                  {event.virtual_link && (
                    <p>
                      <strong className="text-gray-900 dark:text-gray-100 transition-colors duration-200">{t('registration.joinLink')}:</strong>
                      <a href={event.virtual_link} target="_blank" rel="noopener noreferrer" className="ml-2 text-blue-600 dark:text-blue-400 hover:underline transition-colors duration-200">
                        {t('registration.joinEvent')}
                      </a>
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* QR Code */}
            {qrCode && (
              <div className="card mb-8">
                <div className="card-body">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4 transition-colors duration-200">
                    {t('registration.yourTicket')}
                  </h3>
                  <div className="flex justify-center mb-4">
                    <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg transition-colors duration-200">
                      <div className="w-32 h-32 bg-white dark:bg-gray-200 border-2 border-gray-300 dark:border-gray-600 rounded flex items-center justify-center transition-colors duration-200">
                        <span className="text-xs text-gray-500 dark:text-gray-600 text-center p-2 transition-colors duration-200">
                          QR Code<br/>{qrCode}
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-200">
                    {t('registration.qrCodeInfo')}
                  </p>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-4">
              <button
                onClick={() => navigate('/')}
                className="btn-primary w-full"
              >
                {t('registration.backToDashboard')}
              </button>
              <button
                onClick={() => window.print()}
                className="btn-secondary w-full"
              >
                {t('registration.printTicket')}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200 ${isRTL ? 'font-arabic' : ''}`}>
      <Navigation />
      
      <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 transition-colors duration-200">
            {t('registration.registerFor')} {event.title}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 transition-colors duration-200">
            {event.description}
          </p>
        </div>

        {error && (
          <div className="alert alert-error mb-6">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Event Details */}
          <div className="lg:col-span-2">
            <div className="card mb-8">
              <div className="card-header">
                <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 transition-colors duration-200">
                  {t('registration.eventDetails')}
                </h2>
              </div>
              <div className="card-body">
                <div className="space-y-4">
                  <div>
                    <span className="font-medium text-gray-700 dark:text-gray-300 transition-colors duration-200">{t('registration.when')}:</span>
                    <p className="text-gray-900 dark:text-gray-100 transition-colors duration-200">
                      {formatDate(event.start_date)} - {formatDate(event.end_date)}
                    </p>
                  </div>
                  
                  <div>
                    <span className="font-medium text-gray-700 dark:text-gray-300 transition-colors duration-200">{t('registration.type')}:</span>
                    <p className="text-gray-900 dark:text-gray-100 transition-colors duration-200">
                      {t(`events.types.${event.event_type}`)}
                    </p>
                  </div>

                  {event.venue_id && (
                    <div>
                      <span className="font-medium text-gray-700 dark:text-gray-300 transition-colors duration-200">{t('registration.venue')}:</span>
                      <p className="text-gray-900 dark:text-gray-100 transition-colors duration-200">{event.venue_id}</p>
                    </div>
                  )}

                  {event.virtual_link && (
                    <div>
                      <span className="font-medium text-gray-700 dark:text-gray-300 transition-colors duration-200">{t('registration.joinLink')}:</span>
                      <a href={event.virtual_link} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline transition-colors duration-200">
                        {event.virtual_link}
                      </a>
                    </div>
                  )}

                  <div>
                    <span className="font-medium text-gray-700 dark:text-gray-300 transition-colors duration-200">{t('registration.maxAttendees')}:</span>
                    <p className="text-gray-900 dark:text-gray-100 transition-colors duration-200">{event.max_attendees}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Ticket Selection */}
            <div className="card">
              <div className="card-header">
                <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 transition-colors duration-200">
                  {t('registration.selectTickets')}
                </h2>
              </div>
              <div className="card-body">
                {tickets.length > 0 ? (
                  <div className="space-y-4">
                    {tickets.map((ticket) => (
                      <div key={ticket.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg transition-colors duration-200">
                        <div className={`flex justify-between items-start mb-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                          <div>
                            <h3 className="font-medium text-gray-900 dark:text-gray-100 transition-colors duration-200">{ticket.name}</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-200">{ticket.description}</p>
                          </div>
                          <span className="text-lg font-bold text-gray-900 dark:text-gray-100 transition-colors duration-200">
                            ${ticket.price}
                          </span>
                        </div>
                        
                        <div className={`flex items-center justify-between mt-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                          <div className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-200">
                            {ticket.quantity} {t('registration.available')}
                          </div>
                          
                          <div className={`flex items-center space-x-2 ${isRTL ? 'flex-row-reverse space-x-reverse' : ''}`}>
                            <button
                              onClick={() => handleTicketQuantityChange(ticket.id, (selectedTickets[ticket.id] || 0) - 1)}
                              disabled={(selectedTickets[ticket.id] || 0) === 0}
                              className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                            >
                              -
                            </button>
                            
                            <span className="w-8 text-center text-gray-900 dark:text-gray-100 transition-colors duration-200">
                              {selectedTickets[ticket.id] || 0}
                            </span>
                            
                            <button
                              onClick={() => handleTicketQuantityChange(ticket.id, (selectedTickets[ticket.id] || 0) + 1)}
                              disabled={(selectedTickets[ticket.id] || 0) >= ticket.quantity}
                              className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-600 dark:text-gray-400 transition-colors duration-200">{t('registration.noTicketsAvailable')}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Registration Summary */}
          <div className="lg:col-span-1">
            <div className="card sticky top-6">
              <div className="card-header">
                <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 transition-colors duration-200">
                  {t('registration.summary')}
                </h2>
              </div>
              <div className="card-body">
                <div className="space-y-3">
                  {tickets.map((ticket) => {
                    const quantity = selectedTickets[ticket.id] || 0;
                    if (quantity === 0) return null;
                    
                    return (
                      <div key={ticket.id} className={`flex justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <span className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-200">
                          {ticket.name} x {quantity}
                        </span>
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100 transition-colors duration-200">
                          ${(ticket.price * quantity).toFixed(2)}
                        </span>
                      </div>
                    );
                  })}
                  
                  {getTotalTickets() > 0 && (
                    <>
                      <div className="border-t border-gray-200 dark:border-gray-700 pt-3 transition-colors duration-200">
                        <div className={`flex justify-between font-medium ${isRTL ? 'flex-row-reverse' : ''}`}>
                          <span className="text-gray-900 dark:text-gray-100 transition-colors duration-200">{t('registration.total')}</span>
                          <span className="text-gray-900 dark:text-gray-100 transition-colors duration-200">${calculateTotal().toFixed(2)}</span>
                        </div>
                      </div>
                      
                      <button
                        onClick={handleRegister}
                        disabled={registering || getTotalTickets() === 0}
                        className="btn-primary w-full mt-4"
                      >
                        {registering ? t('registration.registering') : t('registration.registerNow')}
                      </button>
                    </>
                  )}
                  
                  {getTotalTickets() === 0 && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 text-center py-4 transition-colors duration-200">
                      {t('registration.selectTicketsToStart')}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegistrationPage;