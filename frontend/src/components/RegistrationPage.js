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
  const [venue, setVenue] = useState(null);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [registrationData, setRegistrationData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchEventData();
    checkExistingRegistration();
  }, [eventId]);

  const fetchEventData = async () => {
    try {
      const [eventRes, ticketsRes] = await Promise.all([
        axios.get(`${API}/events/${eventId}`),
        axios.get(`${API}/events/${eventId}/tickets`)
      ]);

      setEvent(eventRes.data);
      setTickets(ticketsRes.data);

      // Fetch venue details if event has a venue
      if (eventRes.data.venue_id) {
        const venuesRes = await axios.get(`${API}/venues`);
        const eventVenue = venuesRes.data.find(v => v.id === eventRes.data.venue_id);
        setVenue(eventVenue);
      }
    } catch (error) {
      setError('Failed to fetch event data');
      console.error(error);
    }
    setLoading(false);
  };

  const checkExistingRegistration = async () => {
    try {
      const response = await axios.get(`${API}/my-registrations`);
      const existingRegistration = response.data.find(reg => reg.event_id === eventId);
      if (existingRegistration) {
        setIsRegistered(true);
        setRegistrationData(existingRegistration);
      }
    } catch (error) {
      console.error('Failed to check existing registration:', error);
    }
  };

  const handleRegister = async () => {
    if (!selectedTicket) {
      setError(t('registration.selectTicket'));
      return;
    }

    setRegistering(true);
    setError('');

    try {
      const response = await axios.post(`${API}/register`, {
        event_id: eventId,
        ticket_id: selectedTicket
      });

      setIsRegistered(true);
      setRegistrationData(response.data);
      
      // Refresh tickets to update availability
      const ticketsRes = await axios.get(`${API}/events/${eventId}/tickets`);
      setTickets(ticketsRes.data);
    } catch (error) {
      setError(error.response?.data?.detail || 'Registration failed');
    }
    setRegistering(false);
  };

  const downloadQRCode = () => {
    if (registrationData?.qr_code) {
      const newWindow = window.open();
      newWindow.document.write(`
        <html>
          <head>
            <title>Event Ticket - ${event?.title}</title>
            <style>
              body { 
                font-family: Arial, sans-serif; 
                text-align: center; 
                padding: 20px; 
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                min-height: 100vh;
                margin: 0;
                display: flex;
                align-items: center;
                justify-content: center;
              }
              .ticket {
                background: white;
                border-radius: 15px;
                padding: 30px;
                box-shadow: 0 10px 30px rgba(0,0,0,0.3);
                max-width: 400px;
                margin: 0 auto;
              }
              .ticket-header {
                border-bottom: 2px dashed #ccc;
                padding-bottom: 20px;
                margin-bottom: 20px;
              }
              .qr-code {
                border: 3px solid #667eea;
                border-radius: 10px;
                padding: 10px;
                margin: 20px 0;
              }
              .event-title {
                color: #667eea;
                font-size: 24px;
                font-weight: bold;
                margin-bottom: 10px;
              }
              .ticket-info {
                color: #666;
                margin: 10px 0;
              }
              .important {
                background: #f0f9ff;
                border: 1px solid #0ea5e9;
                border-radius: 8px;
                padding: 15px;
                margin-top: 20px;
                color: #0c4a6e;
              }
              @media print {
                body { background: white; }
                .ticket { box-shadow: none; }
              }
            </style>
          </head>
          <body>
            <div class="ticket">
              <div class="ticket-header">
                <div class="event-title">${event?.title}</div>
                <div class="ticket-info">
                  <strong>Date:</strong> ${new Date(event?.start_date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
                ${venue ? `<div class="ticket-info"><strong>Venue:</strong> ${venue.name}</div>` : ''}
                ${event?.virtual_link ? `<div class="ticket-info"><strong>Virtual Link:</strong> Available in registration confirmation</div>` : ''}
              </div>
              
              <div class="qr-code-container">
                <img src="${registrationData.qr_code}" alt="QR Code" class="qr-code" />
                <div class="ticket-info">
                  <strong>Attendee:</strong> ${user?.name}<br>
                  <strong>Ticket Type:</strong> ${tickets.find(t => t.id === registrationData.ticket_id)?.ticket_type?.replace('_', ' ') || 'Standard'}
                </div>
              </div>
              
              <div class="important">
                <strong>Important:</strong> Present this QR code at the event entrance. Screenshot or print this ticket for your records.
              </div>
            </div>
            
            <script>
              // Auto-print on load
              window.onload = function() {
                setTimeout(function() {
                  window.print();
                }, 500);
              }
            </script>
          </body>
        </html>
      `);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
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

  const getTicketTypeIcon = (type) => {
    switch (type) {
      case 'early_bird':
        return <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>;
      case 'vip':
        return <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>;
      default:
        return <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
        </svg>;
    }
  };

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
      
      <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Success Registration */}
        {isRegistered && registrationData ? (
          <div className={`text-center ${isRTL ? 'text-right' : ''}`}>
            <div className="qr-code-container mx-auto mb-8">
              <div className={`text-center mb-6 ${isRTL ? 'text-right' : ''}`}>
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                  <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h1 className="text-3xl font-bold text-green-600">
                  {t('registration.registrationSuccessful')}
                </h1>
                <p className="text-gray-600 mt-2">
                  You're all set for {event.title}
                </p>
              </div>

              {registrationData.qr_code && (
                <div className="bg-white p-6 rounded-lg shadow-lg max-w-md mx-auto">
                  <h3 className={`text-lg font-medium text-gray-900 mb-4 ${isRTL ? 'text-right' : ''}`}>
                    Your Event Ticket
                  </h3>
                  <img
                    src={registrationData.qr_code}
                    alt="QR Code"
                    className="qr-code-image mx-auto"
                  />
                  <p className={`text-sm text-gray-600 mb-4 ${isRTL ? 'text-right' : ''}`}>
                    Present this QR code at the event entrance
                  </p>
                  <button
                    onClick={downloadQRCode}
                    className="btn-primary w-full"
                  >
                    {t('registration.downloadTicket')} & Print Ticket
                  </button>
                </div>
              )}
            </div>

            <div className="card max-w-2xl mx-auto">
              <div className="card-header">
                <h3 className={`text-lg font-medium text-gray-900 ${isRTL ? 'text-right' : ''}`}>
                  {t('events.eventDetails')}
                </h3>
              </div>
              <div className={`card-body text-left ${isRTL ? 'text-right' : ''}`}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-gray-900">{t('events.title')}</h4>
                    <p className="text-gray-600">{event.title}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{t('common.date')} & {t('common.time')}</h4>
                    <p className="text-gray-600">{formatDate(event.start_date)}</p>
                  </div>
                  {venue && (
                    <div>
                      <h4 className="font-medium text-gray-900">{t('events.venue')}</h4>
                      <p className="text-gray-600">{venue.name}</p>
                      <p className="text-sm text-gray-500">{venue.address}</p>
                    </div>
                  )}
                  {event.virtual_link && (
                    <div>
                      <h4 className="font-medium text-gray-900">Virtual Access</h4>
                      <a href={event.virtual_link} target="_blank" rel="noopener noreferrer" className={`text-blue-600 hover:text-blue-800 break-all ${isRTL ? 'text-right' : ''}`}>
                        {event.virtual_link}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className={`mt-8 ${isRTL ? 'space-x-reverse flex-row-reverse' : ''}`}>
              <button onClick={() => navigate('/')} className={`btn-secondary ${isRTL ? 'ml-4' : 'mr-4'}`}>
                {t('events.backToDashboard')}
              </button>
              <button onClick={downloadQRCode} className="btn-primary">
                {t('registration.downloadTicket')} Again
              </button>
            </div>
          </div>
        ) : (
          /* Registration Form */
          <div>
            {/* Event Header */}
            <div className="card mb-8">
              <div className="card-body">
                <div className={`flex items-start justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <div className="flex-1">
                    <h1 className={`text-3xl font-bold text-gray-900 mb-2 ${isRTL ? 'text-right' : ''}`}>
                      {event.title}
                    </h1>
                    <p className={`text-gray-600 mb-4 ${isRTL ? 'text-right' : ''}`}>
                      {event.description}
                    </p>
                    
                    <div className={`flex items-center space-x-4 rtl:space-x-reverse mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <span className={`badge ${getEventTypeClass(event.event_type)}`}>
                        {t(`events.${event.event_type}`)}
                      </span>
                      <span className="text-gray-600">
                        <svg className="w-4 h-4 inline mr-1 rtl:mr-0 rtl:ml-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zM4 7h12v9H4V7z" clipRule="evenodd" />
                        </svg>
                        {formatDate(event.start_date)}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {venue && (
                        <div>
                          <h4 className={`font-medium text-gray-900 ${isRTL ? 'text-right' : ''}`}>
                            {t('events.venue')}
                          </h4>
                          <p className={`text-gray-600 ${isRTL ? 'text-right' : ''}`}>{venue.name}</p>
                          <p className={`text-sm text-gray-500 ${isRTL ? 'text-right' : ''}`}>{venue.address}</p>
                        </div>
                      )}
                      {event.virtual_link && (
                        <div>
                          <h4 className={`font-medium text-gray-900 ${isRTL ? 'text-right' : ''}`}>
                            Virtual Access
                          </h4>
                          <p className={`text-gray-600 ${isRTL ? 'text-right' : ''}`}>
                            Link will be provided after registration
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Error Alert */}
            {error && (
              <div className="alert alert-error mb-6">
                {error}
              </div>
            )}

            {/* Ticket Selection */}
            <div className="card mb-8">
              <div className="card-header">
                <h3 className={`text-lg font-medium text-gray-900 ${isRTL ? 'text-right' : ''}`}>
                  {t('registration.selectTicket')}
                </h3>
              </div>
              <div className="card-body">
                {tickets.length > 0 ? (
                  <div className="space-y-4">
                    {tickets.map(ticket => {
                      const isAvailable = ticket.quantity_sold < ticket.quantity_available;
                      return (
                        <div
                          key={ticket.id}
                          className={`border rounded-lg p-4 cursor-pointer transition-all ${
                            selectedTicket === ticket.id
                              ? 'border-blue-500 bg-blue-50'
                              : isAvailable
                              ? 'border-gray-300 hover:border-gray-400'
                              : 'border-gray-200 bg-gray-50 cursor-not-allowed'
                          }`}
                          onClick={() => isAvailable && setSelectedTicket(ticket.id)}
                        >
                          <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                            <div className={`flex items-center space-x-3 ${isRTL ? 'space-x-reverse flex-row-reverse' : ''}`}>
                              <input
                                type="radio"
                                name="ticket"
                                value={ticket.id}
                                checked={selectedTicket === ticket.id}
                                onChange={() => setSelectedTicket(ticket.id)}
                                disabled={!isAvailable}
                                className="text-blue-600"
                              />
                              <div className={`flex items-center space-x-2 ${isRTL ? 'space-x-reverse flex-row-reverse' : ''}`}>
                                {getTicketTypeIcon(ticket.ticket_type)}
                                <div className={isRTL ? 'text-right' : ''}>
                                  <h4 className={`font-medium capitalize ${isAvailable ? 'text-gray-900' : 'text-gray-500'}`}>
                                    {t(`tickets.${ticket.ticket_type}`)}
                                  </h4>
                                  <p className={`text-sm ${isAvailable ? 'text-gray-600' : 'text-gray-400'}`}>
                                    {ticket.quantity_available - ticket.quantity_sold} of {ticket.quantity_available} available
                                  </p>
                                </div>
                              </div>
                            </div>
                            <div className={`text-right ${isRTL ? 'text-left' : ''}`}>
                              <p className={`text-2xl font-bold ${isAvailable ? 'text-gray-900' : 'text-gray-500'}`}>
                                ${ticket.price}
                              </p>
                              {!isAvailable && (
                                <span className="badge badge-danger text-xs">{t('registration.ticketSoldOut')}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className={`text-gray-500 text-center py-8 ${isRTL ? 'text-right' : ''}`}>
                    No tickets available for this event
                  </p>
                )}
              </div>
            </div>

            {/* Registration Action */}
            {tickets.length > 0 && (
              <div className="card">
                <div className="card-body">
                  <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <div className={isRTL ? 'text-right' : ''}>
                      <h3 className="text-lg font-medium text-gray-900">
                        {t('registration.confirmRegistration')}
                      </h3>
                      <p className="text-gray-600">
                        {selectedTicket ? 'Proceed with payment to secure your spot' : 'Select a ticket type to continue'}
                      </p>
                    </div>
                    <button
                      onClick={handleRegister}
                      disabled={!selectedTicket || registering}
                      className="btn-primary"
                    >
                      {registering ? (
                        <>
                          <span className={`loading-spinner ${isRTL ? 'ml-2' : 'mr-2'}`}></span>
                          Processing...
                        </>
                      ) : (
                        t('registration.confirmRegistration')
                      )}
                    </button>
                  </div>
                  
                  {selectedTicket && (
                    <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                      <p className={`text-sm text-blue-700 ${isRTL ? 'text-right' : ''}`}>
                        <strong>Note:</strong> This is a demo payment system. Your registration will be confirmed immediately with a QR code ticket.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default RegistrationPage;