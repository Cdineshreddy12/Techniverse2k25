import React, { useState, useEffect } from 'react';
import { useApi } from '../config/useApi';
import API_CONFIG from '../config/api';
const ManualRegistration = () => {
  const api = useApi();
  const [mode, setMode] = useState('register');
  const [formData, setFormData] = useState({
    studentId: '',
    name: '',
    branch: '',
    class: '',
    mobileNo: '',
    registrationType: '',
    registrationFee: '',
    receivedBy: '',
    institute: 'RGUKT Srikakulam'
  });
  const [validationData, setValidationData] = useState({
    query: '',
    validatedBy: '',
    eventName: ''  // Add this field
  });
  const [statsLoading, setStatsLoading] = useState(true);

  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    classWiseStats: [],
    receiverStats: []
  });
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Auto-set registration fee based on type
    if (name === 'registrationType') {
      const fees = {
        'events': 199,
        'workshop': 199,
        'both': 299
      };
      setFormData(prev => ({
        ...prev,
        registrationFee: fees[value] || ''
      }));
    }
  };

  const handleValidationInput = (e) => {
    const { name, value } = e.target;
    setValidationData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const fetchStats = async () => {
    setStatsLoading(true);
    try {
      const response = await api.makeAuthenticatedRequest('registration-stats-offline', {
        method: 'GET'
      });
  
      if (response.success) {
        setStats(response.stats || {
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
      } else {
        throw new Error(response.error || 'Failed to fetch stats');
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      setError('Failed to load statistics');
      setStats({
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
    } finally {
      setStatsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await api.makeAuthenticatedRequest('offline-registration', {
        method: 'POST',
        body: JSON.stringify(formData)
      });

      if (!response.success) {
        throw new Error(response.error || 'Registration failed');
      }

      setSuccess('Registration successful!');
      setError(null);
      setFormData({
        ...formData,
        studentId: '',
        name: '',
        branch: '',
        class: '',
        mobileNo: '',
        registrationType: '',
        registrationFee: '',
        receivedBy: formData.receivedBy // Keep the coordinator name
      });

      window.open(`/adminDashboard/print-receipt/${response.registration.receiptNumber}`, '_blank');
      fetchStats();
    } catch (err) {
      setError(err.message);
      setSuccess(null);
    } finally {
      setLoading(false);
    }
  };

  const handleValidation = async () => {

    console.log('Validation Data:', validationData);
    // First check if all required fields are present
    if (!validationData.query || !validationData.validatedBy || !validationData.eventName) {
      setError('Receipt/ID, validator name, and event name are all required');
      return;
    }
  
    setLoading(true);
    try {
      const response = await api.makeAuthenticatedRequest('validateOffline', {
        method: 'POST',
        body: JSON.stringify({
          receiptNumber: validationData.query,
          studentId: validationData.query,
          validatedBy: validationData.validatedBy,
          eventName: validationData.eventName  // Make sure to include eventName
        })
      });
  
      if (!response.success) {
        throw new Error(response.error || 'Validation failed');
      }
  
      setSuccess('Registration validated and attendance marked successfully!');
      setError(null);
      setValidationData({
        query: '',
        validatedBy: validationData.validatedBy, // Keep the validator name
        eventName: validationData.eventName // Keep the event name for next validation
      });
    } catch (err) {
      setError(err.message);
      setSuccess(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);


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

  const StatsDisplay = ({ stats, loading }) => {
    if (loading) {
      return (
        <div className="mt-8 bg-gray-800 rounded-lg shadow-xl p-6">
          <h2 className="text-xl font-semibold mb-4 text-blue-400">Loading Statistics...</h2>
        </div>
      );
    }
  
    if (!stats?.summary) {
      return (
        <div className="mt-8 bg-gray-800 rounded-lg shadow-xl p-6">
          <h2 className="text-xl font-semibold mb-4 text-blue-400">Registration Statistics</h2>
          <p className="text-gray-400 text-center">No registrations found</p>
        </div>
      );
    }
  
    return (
      <div className="mt-8 space-y-6">
        {/* Overall Summary */}
        <div className="bg-gray-800 rounded-lg shadow-xl p-6">
          <h2 className="text-xl font-semibold mb-4 text-blue-400">Overall Summary</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-700/50 p-4 rounded-lg">
              <p className="text-gray-400 text-sm">Total Registrations</p>
              <p className="text-2xl font-bold text-white">{stats.summary.totalRegistrations}</p>
            </div>
            <div className="bg-gray-700/50 p-4 rounded-lg">
              <p className="text-gray-400 text-sm">Total Amount</p>
              <p className="text-2xl font-bold text-white">₹{stats.summary.totalAmount}</p>
            </div>
            <div className="bg-gray-700/50 p-4 rounded-lg">
              <p className="text-gray-400 text-sm">Events Only</p>
              <p className="text-2xl font-bold text-white">{stats.summary.events}</p>
            </div>
            <div className="bg-gray-700/50 p-4 rounded-lg">
              <p className="text-gray-400 text-sm">Workshops Only</p>
              <p className="text-2xl font-bold text-white">{stats.summary.workshops}</p>
            </div>
          </div>
        </div>
  
        {/* Class-wise Stats */}
        <div className="bg-gray-800 rounded-lg shadow-xl p-6">
          <h2 className="text-xl font-semibold mb-4 text-blue-400">Class-wise Registration</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Branch/Class
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Total Students
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Events
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Workshops
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {stats.classWiseStats.map((stat, index) => (
                  <tr key={index} className="hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                      {stat._id.branch} {stat._id.class}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                      {stat.count}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                      {stat.events}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                      {stat.workshops}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                      ₹{stat.totalAmount}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
  
        {/* Receiver Stats */}
        <div className="bg-gray-800 rounded-lg shadow-xl p-6">
          <h2 className="text-xl font-semibold mb-4 text-blue-400">Coordinator Statistics</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Coordinator
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Total Registrations
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Events
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Workshops
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Amount Collected
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {stats.receiverStats.map((stat, index) => (
                  <tr key={index} className="hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                      {stat._id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                      {stat.count}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                      {stat.events}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                      {stat.workshops}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                      ₹{stat.totalAmount}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };
  


  // Updated frontend validation form component
const ValidationForm = ({ onValidate, loading }) => {
    const [validationData, setValidationData] = useState({
      query: '',
      validatedBy: '',
      eventName: ''
    });
  
    return (
      <div className="bg-gray-800 rounded-lg shadow-xl p-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Enter Receipt Number or Student ID
            </label>
            <input
              type="text"
              name="query"
              value={validationData.query}
              onChange={(e) => setValidationData(prev => ({
                ...prev,
                query: e.target.value
              }))}
              className="w-full p-2 border rounded bg-gray-700 text-white border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Receipt number or Student ID"
              required
            />
          </div>
  
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Event Name
            </label>
            <input
              type="text"
              name="eventName"
              value={validationData.eventName}
              onChange={(e) => setValidationData(prev => ({
                ...prev,
                eventName: e.target.value
              }))}
              className="w-full p-2 border rounded bg-gray-700 text-white border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter event name"
              required
            />
          </div>
  
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Validated By (Your Name)
            </label>
            <input
              type="text"
              name="validatedBy"
              value={validationData.validatedBy}
              onChange={(e) => setValidationData(prev => ({
                ...prev,
                validatedBy: e.target.value
              }))}
              className="w-full p-2 border rounded bg-gray-700 text-white border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your name"
              required
            />
          </div>
  
          <button
            onClick={() => onValidate(validationData)}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {loading ? 'Validating...' : 'Validate & Mark Attendance'}
          </button>
        </div>
      </div>
    );
  };


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

        {mode === 'register' ? (
          // Registration Form
          <form onSubmit={handleSubmit} className="bg-gray-800 rounded-lg shadow-xl p-6">
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
                  <option value="EEE">CHEMICAL</option>
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
          // Validation Form
          <div className="bg-gray-800 rounded-lg shadow-xl p-6">
              <ValidationForm onValidate={handleValidation} loading={loading} />
          </div>
        )}

        {/* Stats Display */}
        {/* Stats Display */}
          
        <div>
            <StatsDisplay stats={stats} loading={statsLoading} />
        </div>

      </div>
    </div>
  );
};

export default ManualRegistration;