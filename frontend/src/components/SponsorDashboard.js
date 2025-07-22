import React, { useState, useEffect } from 'react';
import { useAuth } from '../App';
import { useLanguage } from '../contexts/LanguageContext';
import axios from 'axios';

const API = process.env.REACT_APP_BACKEND_URL || import.meta.env.REACT_APP_BACKEND_URL;

const SponsorDashboard = () => {
  const { user, token } = useAuth();
  const { t, isRTL } = useLanguage();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  
  // Profile state
  const [profile, setProfile] = useState({
    company_name: '',
    company_logo: null,
    company_description: '',
    website_url: '',
    industry: '',
    contact_person: '',
    contact_email: ''
  });
  
  // Sponsorships state
  const [sponsorships, setSponsorships] = useState([]);
  const [availableEvents, setAvailableEvents] = useState([]);
  const [newSponsorship, setNewSponsorship] = useState({
    event_id: '',
    sponsorship_type: 'bronze',
    amount: 0
  });

  useEffect(() => {
    fetchProfile();
    fetchSponsorships();
    fetchAvailableEvents();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await axios.get(`${API}/api/sponsors/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProfile(response.data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const fetchSponsorships = async () => {
    try {
      const response = await axios.get(`${API}/api/sponsors/sponsorships`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSponsorships(response.data);
    } catch (error) {
      console.error('Error fetching sponsorships:', error);
    }
  };

  const fetchAvailableEvents = async () => {
    try {
      const response = await axios.get(`${API}/api/sponsors/events`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAvailableEvents(response.data);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(`${API}/api/sponsors/profile`, profile, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Error updating profile');
    }
    setLoading(false);
  };

  const handleSponsorshipSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(`${API}/api/sponsors/sponsorships`, newSponsorship, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Sponsorship application submitted successfully!');
      setNewSponsorship({
        event_id: '',
        sponsorship_type: 'bronze',
        amount: 0
      });
      fetchSponsorships();
    } catch (error) {
      console.error('Error submitting sponsorship:', error);
      alert('Error submitting sponsorship application');
    }
    setLoading(false);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setProfile({
          ...profile,
          company_logo: event.target.result
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const getSponsorshipTypeColor = (type) => {
    const colors = {
      title: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      presenting: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
      gold: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      silver: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
      bronze: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
    };
    return colors[type] || 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      approved: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      paid: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  };

  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 ${isRTL ? 'rtl' : 'ltr'}`}>
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Sponsor Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage your sponsorships and company profile
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 dark:border-gray-700 mb-8">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('profile')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'profile'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              Company Profile
            </button>
            <button
              onClick={() => setActiveTab('sponsorships')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'sponsorships'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              Sponsorships ({sponsorships.length})
            </button>
            <button
              onClick={() => setActiveTab('events')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'events'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              Available Events
            </button>
          </nav>
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              Company Profile
            </h2>
            
            <form onSubmit={handleProfileSubmit} className="space-y-6">
              {/* Company Logo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Company Logo
                </label>
                {profile.company_logo && (
                  <div className="mb-4">
                    <img
                      src={profile.company_logo}
                      alt="Company Logo"
                      className="w-32 h-32 rounded-lg object-cover"
                    />
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="block w-full text-sm text-gray-500 dark:text-gray-400
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-md file:border-0
                    file:text-sm file:font-semibold
                    file:bg-blue-50 file:text-blue-700
                    hover:file:bg-blue-100"
                />
              </div>

              {/* Company Name & Industry */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Company Name *
                  </label>
                  <input
                    type="text"
                    value={profile.company_name}
                    onChange={(e) => setProfile({...profile, company_name: e.target.value})}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Your company name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Industry
                  </label>
                  <input
                    type="text"
                    value={profile.industry}
                    onChange={(e) => setProfile({...profile, industry: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Technology, Healthcare, Finance..."
                  />
                </div>
              </div>

              {/* Company Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Company Description
                </label>
                <textarea
                  value={profile.company_description}
                  onChange={(e) => setProfile({...profile, company_description: e.target.value})}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Brief description of your company..."
                />
              </div>

              {/* Contact Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Website URL
                  </label>
                  <input
                    type="url"
                    value={profile.website_url}
                    onChange={(e) => setProfile({...profile, website_url: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="https://yourcompany.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Contact Person
                  </label>
                  <input
                    type="text"
                    value={profile.contact_person}
                    onChange={(e) => setProfile({...profile, contact_person: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Contact person name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Contact Email
                  </label>
                  <input
                    type="email"
                    value={profile.contact_email}
                    onChange={(e) => setProfile({...profile, contact_email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="contact@company.com"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
              >
                {loading ? 'Updating...' : 'Update Profile'}
              </button>
            </form>
          </div>
        )}

        {/* Sponsorships Tab */}
        {activeTab === 'sponsorships' && (
          <div className="space-y-8">
            {/* New Sponsorship */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                Apply for Event Sponsorship
              </h2>
              
              <form onSubmit={handleSponsorshipSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Select Event *
                    </label>
                    <select
                      value={newSponsorship.event_id}
                      onChange={(e) => setNewSponsorship({...newSponsorship, event_id: e.target.value})}
                      required
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="">Choose an event</option>
                      {availableEvents.map((event) => (
                        <option key={event.id} value={event.id}>
                          {event.title} - {new Date(event.start_date).toLocaleDateString()}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Sponsorship Level
                    </label>
                    <select
                      value={newSponsorship.sponsorship_type}
                      onChange={(e) => setNewSponsorship({...newSponsorship, sponsorship_type: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="bronze">Bronze Sponsor</option>
                      <option value="silver">Silver Sponsor</option>
                      <option value="gold">Gold Sponsor</option>
                      <option value="presenting">Presenting Sponsor</option>
                      <option value="title">Title Sponsor</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Amount ($)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={newSponsorship.amount}
                      onChange={(e) => setNewSponsorship({...newSponsorship, amount: parseFloat(e.target.value) || 0})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || !newSponsorship.event_id}
                  className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50"
                >
                  {loading ? 'Submitting...' : 'Submit Sponsorship Application'}
                </button>
              </form>
            </div>

            {/* Current Sponsorships */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                Your Sponsorships ({sponsorships.length})
              </h2>
              
              {sponsorships.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400">No sponsorships yet.</p>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {sponsorships.map((sponsorship) => (
                    <div key={sponsorship.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          {sponsorship.event_title}
                        </h3>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(sponsorship.status)}`}>
                          {sponsorship.status.charAt(0).toUpperCase() + sponsorship.status.slice(1)}
                        </span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Level:</span>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getSponsorshipTypeColor(sponsorship.sponsorship_type)}`}>
                            {sponsorship.sponsorship_type.charAt(0).toUpperCase() + sponsorship.sponsorship_type.slice(1)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Amount:</span>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            ${sponsorship.amount.toLocaleString()}
                          </span>
                        </div>
                        {sponsorship.event_start_date && (
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Event Date:</span>
                            <span className="text-sm text-gray-900 dark:text-white">
                              {new Date(sponsorship.event_start_date).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Applied:</span>
                          <span className="text-sm text-gray-900 dark:text-white">
                            {new Date(sponsorship.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Available Events Tab */}
        {activeTab === 'events' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              Available Events for Sponsorship ({availableEvents.length})
            </h2>
            
            {availableEvents.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400">No events available for sponsorship.</p>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                {availableEvents.map((event) => (
                  <div key={event.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                      {event.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      {event.description.substring(0, 100)}...
                    </p>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Type:</span>
                        <span className="text-gray-900 dark:text-white capitalize">
                          {event.event_type}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Date:</span>
                        <span className="text-gray-900 dark:text-white">
                          {new Date(event.start_date).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Max Attendees:</span>
                        <span className="text-gray-900 dark:text-white">
                          {event.max_attendees}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setNewSponsorship({...newSponsorship, event_id: event.id});
                        setActiveTab('sponsorships');
                      }}
                      className="mt-4 w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-sm"
                    >
                      Sponsor This Event
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SponsorDashboard;