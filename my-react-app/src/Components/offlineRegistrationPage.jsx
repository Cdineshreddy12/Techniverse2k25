import React, { useState, useEffect } from 'react';
import { useApi } from '../config/useApi';
import API_CONFIG from '../config/api';

// Item Selection Component for Events/Workshops
const ItemSelection = ({ title, items, selectedIds, onChange }) => (
  <div className="mt-4">
    <h3 className="text-lg font-medium text-gray-300 mb-2">{title}</h3>
    <div className="space-y-2 max-h-48 overflow-y-auto bg-gray-700/50 p-4 rounded-lg">
      {items.map(item => (
        <label key={item._id} className="flex items-center p-2 hover:bg-gray-600 rounded">
          <input
            type="checkbox"
            checked={selectedIds.includes(item._id)}
            onChange={(e) => {
              const updated = e.target.checked
                ? [...selectedIds, item._id]
                : selectedIds.filter(id => id !== item._id);
              onChange(updated);
            }}
            className="mr-2 h-4 w-4 text-blue-600"
          />
          <span className="text-gray-300">{item.title}</span>
        </label>
      ))}
      {items.length === 0 && (
        <p className="text-gray-400 text-center py-2">No items available</p>
      )}
    </div>
  </div>
);

// Validation Form Component
const ValidationForm = ({ onValidate, loading, events, workshops }) => {
  const [validationData, setValidationData] = useState({
    query: '',
    validatedBy: '',
    itemType: 'event',
    itemId: '',
    itemName: ''
  });

  const items = validationData.itemType === 'event' ? events : workshops;

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Validation Type
        </label>
        <select
          value={validationData.itemType}
          onChange={(e) => setValidationData(prev => ({
            ...prev,
            itemType: e.target.value,
            itemId: '',
            itemName: ''
          }))}
          className="w-full p-2 border rounded bg-gray-700 text-white border-gray-600"
        >
          <option value="event">Event</option>
          <option value="workshop">Workshop</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Enter Receipt Number or Student ID
        </label>
        <input
          type="text"
          value={validationData.query}
          onChange={(e) => setValidationData(prev => ({
            ...prev,
            query: e.target.value
          }))}
          className="w-full p-2 border rounded bg-gray-700 text-white border-gray-600"
          placeholder="Receipt number or Student ID"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Select {validationData.itemType === 'event' ? 'Event' : 'Workshop'}
        </label>
        <select
          value={validationData.itemId}
          onChange={(e) => {
            const selected = items.find(item => item._id === e.target.value);
            setValidationData(prev => ({
              ...prev,
              itemId: e.target.value,
              itemName: selected?.title || ''
            }));
          }}
          className="w-full p-2 border rounded bg-gray-700 text-white border-gray-600"
          required
        >
          <option value="">Select {validationData.itemType === 'event' ? 'an Event' : 'a Workshop'}</option>
          {items.map(item => (
            <option key={item._id} value={item._id}>
              {item.title}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Validated By (Your Name)
        </label>
        <input
          type="text"
          value={validationData.validatedBy}
          onChange={(e) => setValidationData(prev => ({
            ...prev,
            validatedBy: e.target.value
          }))}
          className="w-full p-2 border rounded bg-gray-700 text-white border-gray-600"
          placeholder="Enter your name"
          required
        />
      </div>

      <button
        onClick={() => onValidate(validationData)}
        disabled={loading || !validationData.query || !validationData.validatedBy || !validationData.itemId}
        className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Validating...' : 'Validate & Mark Attendance'}
      </button>
    </div>
  );
};

const ManualRegistration = () => {
  const api = useApi();
  const [mode, setMode] = useState('register');
  const [events, setEvents] = useState([]);
  const [workshops, setWorkshops] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [stats, setStats] = useState({
    classWiseStats: [],
    receiverStats: [],
    summary: {
      totalRegistrations: 0,
      totalAmount: 0,
      events: 0,
      workshops: 0,
      both: 0
    }
  });

  const [formData, setFormData] = useState({
    studentId: '',
    name: '',
    branch: '',
    class: '',
    mobileNo: '',
    registrationType: '',
    registrationFee: '',
    receivedBy: '',
    institute: 'RGUKT Srikakulam',
    selectedEvents: [],
    selectedWorkshops: []
  });

  // Fetch events and workshops
  useEffect(() => {
    const fetchItems = async () => {
      try {
        const [eventsRes, workshopsRes] = await Promise.all([
          api.makeAuthenticatedRequest('events'),
          api.makeAuthenticatedRequest('workshops')
        ]);

        setEvents(eventsRes.events || []);
        setWorkshops(workshopsRes.workshops || []);
      } catch (error) {
        console.error('Error fetching items:', error);
        setError('Failed to fetch events and workshops');
      }
    };

    fetchItems();
  }, []);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const updated = { ...prev, [name]: value };
      
      // Auto-set registration fee
      if (name === 'registrationType') {
        const fees = {
          'events': 199,
          'workshop': 199,
          'both': 299
        };
        updated.registrationFee = fees[value] || '';
        
        // Reset selections when type changes
        if (value === 'events') {
          updated.selectedWorkshops = [];
        } else if (value === 'workshop') {
          updated.selectedEvents = [];
        }
      }
      
      return updated;
    });
  };

  // Handle registration submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Transform selected events and workshops
      const selectedEvents = formData.selectedEvents.map(eventId => {
        const event = events.find(e => e._id === eventId);
        return {
          eventId,
          eventName: event.title
        };
      });

      const selectedWorkshops = formData.selectedWorkshops.map(workshopId => {
        const workshop = workshops.find(w => w._id === workshopId);
        return {
          workshopId,
          workshopName: workshop.title
        };
      });

      // Validate selections based on registration type
      if (formData.registrationType === 'events' && selectedEvents.length === 0) {
        throw new Error('Please select at least one event');
      }
      if (formData.registrationType === 'workshop' && selectedWorkshops.length === 0) {
        throw new Error('Please select at least one workshop');
      }
      if (formData.registrationType === 'both' && 
          selectedEvents.length === 0 && selectedWorkshops.length === 0) {
        throw new Error('Please select at least one event or workshop');
      }

      const response = await api.makeAuthenticatedRequest('offline-registration', {
        method: 'POST',
        body: JSON.stringify({
          ...formData,
          selectedEvents,
          selectedWorkshops
        })
      });

      if (!response.success) {
        throw new Error(response.error || 'Registration failed');
      }

      setSuccess('Registration successful!');
      window.open(`/adminDashboard/print-receipt/${response.registration.receiptNumber}`, '_blank');
      
      // Reset form but keep receiver name
      setFormData(prev => ({
        ...prev,
        studentId: '',
        name: '',
        branch: '',
        class: '',
        mobileNo: '',
        registrationType: '',
        registrationFee: '',
        selectedEvents: [],
        selectedWorkshops: []
      }));

      // Refresh stats
      fetchStats();
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle validation
  const handleValidation = async (validationData) => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await api.makeAuthenticatedRequest('offline/validate', {
        method: 'POST',
        body: JSON.stringify({
          query: validationData.query,
          itemId: validationData.itemId,
          itemType: validationData.itemType,
          validatedBy: validationData.validatedBy
        })
      });

      if (!response.success) {
        throw new Error(response.error || 'Validation failed');
      }

      setSuccess('Attendance marked successfully!');
      fetchStats();
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch stats
  const fetchStats = async () => {
    setStatsLoading(true);
    try {
      const response = await api.makeAuthenticatedRequest('registration-stats-offline');
      if (response.success) {
        setStats(response.stats);
      } else {
        throw new Error(response.error || 'Failed to fetch stats');
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setStatsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  // Authentication check
  if (!api.isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Authentication Required</h1>
          <button
            onClick={() => api.login()}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white py-6 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-400">Techniverse 2K25</h1>
          <p className="text-gray-400">Registration System</p>
        </div>

        {/* Mode Selection */}
        <div className="flex justify-center space-x-4 mb-8">
          <button
            onClick={() => setMode('register')}
            className={`px-6 py-2 rounded-lg ${
              mode === 'register'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300'
            }`}
          >
            Register
          </button>
          <button
            onClick={() => setMode('validate')}
            className={`px-6 py-2 rounded-lg ${
              mode === 'validate'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300'
            }`}
          >
            Validate
          </button>
          <button
            onClick={() => window.open(API_CONFIG.getUrl('export-excel'), '_blank')}
            className="px-6 py-2 rounded-lg bg-green-600 text-white"
          >
            Export Excel
          </button>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-4 p-4 bg-red-900 border border-red-600 text-red-200 rounded">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-4 bg-green-900 border border-green-600 text-green-200 rounded">
            {success}
          </div>
        )}

        {/* Main Content */}
        <div className="bg-gray-800 rounded-lg shadow-xl p-6">
          {mode === 'register' ? (
            <form onSubmit={handleSubmit}>
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Existing form fields... */}
              </div>

              {/* Event/Workshop Selection */}
              {formData.registrationType && (
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  {(formData.registrationType === 'events' || formData.registrationType === 'both') && (
                    <ItemSelection
                      title="Select Events"
                      items={events}
                      selectedIds={formData.selectedEvents}
                      onChange={(ids) => setFormData(prev => ({
                        ...prev,
                        selectedEvents: ids
                      }))}
                    />
                  )}
                  
                  {(formData.registrationType === 'workshop' || formData.registrationType === 'both') && (
                    <ItemSelection
                      title="Select Workshops"
                      items={workshops}
                      selectedIds={formData.selectedWorkshops}
                      onChange={(ids) => setFormData(prev => ({
                        ...prev,
                        selectedWorkshops: ids
                      }))}
                    />
                  )}
                </div>
              )}

              {/* Basic Information Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Student ID
                  </label>
                  <input
                    type="text"
                    name="studentId"
                    value={formData.studentId}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded bg-gray-700 text-white border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded bg-gray-700 text-white border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Branch
                  </label>
                  <select
                    name="branch"
                    value={formData.branch}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded bg-gray-700 text-white border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Select Branch</option>
                    <option value="CSE">CSE</option>
                    <option value="ECE">ECE</option>
                    <option value="CIVIL">CIVIL</option>
                    <option value="MECH">MECH</option>
                    <option value="CHEMICAL">CHEMICAL</option>
                    <option value="PUC">PUC</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Class (e.g., CSE-1A)
                  </label>
                  <input
                    type="text"
                    name="class"
                    value={formData.class}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded bg-gray-700 text-white border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Mobile No
                  </label>
                  <input
                    type="tel"
                    name="mobileNo"
                    value={formData.mobileNo}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded bg-gray-700 text-white border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                    pattern="[0-9]{10}"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Registration Type
                  </label>
                  <select
                    name="registrationType"
                    value={formData.registrationType}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded bg-gray-700 text-white border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Select Type</option>
                    <option value="events">Events (₹199)</option>
                    <option value="workshop">Only Workshop (₹199)</option>
                    <option value="both">Workshop + Events (₹299)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Registration Fee
                  </label>
                  <input
                    type="number"
                    name="registrationFee"
                    value={formData.registrationFee}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded bg-gray-700 text-white border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                    readOnly
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Received By (Your Name)
                  </label>
                  <input
                    type="text"
                    name="receivedBy"
                    value={formData.receivedBy}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded bg-gray-700 text-white border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="mt-6">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                >
                  {loading ? 'Processing...' : 'Register & Generate Receipt'}
                </button>
              </div>
            </form>
          ) : (
            <ValidationForm 
              onValidate={handleValidation} 
              loading={loading}
              events={events}
              workshops={workshops}
            />
          )}
        </div>

        {/* Include the StatsDisplay component here
        {!statsLoading && stats && (
          <div className="mt-8">
            <StatsDisplay stats={stats} loading={statsLoading} />
          </div>
        )} */}
      </div>
    </div>
  );
};

export default ManualRegistration;