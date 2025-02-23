import React, { useState, useEffect } from 'react';
import { QrCode, User, Calendar, CheckCircle, Loader, X, Eye, EyeOff } from 'lucide-react';
import API_CONFIG from '../config/api';
const OfflineDashboard = () => {
  const [userData, setUserData] = useState(null);
  const [checkIns, setCheckIns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showQRModal, setShowQRModal] = useState(false);
  const [showResetForm, setShowResetForm] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resetPassword, setResetPassword] = useState({
    studentId: '',
    email: '',
    newPassword: '',
    confirmPassword: '',
    loading: false,
    error: '',
    success: ''
  });

  useEffect(() => {
    const fetchUserData = async () => {
        try {
            const user = JSON.parse(localStorage.getItem('offlineUser'));
            const token = localStorage.getItem('offlineToken');
            if (!user || !token) throw new Error('Please login again');

            const dashboardResponse = await fetch(
                API_CONFIG.getUrl(`/offline/dashboard/${user._id}`),
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (!dashboardResponse.ok) throw new Error('Failed to fetch dashboard data');
            const dashboardData = await dashboardResponse.json();
            if (!dashboardData.success) throw new Error(dashboardData.error || 'Failed to load data');

            setUserData(dashboardData.data.user);
            setCheckIns(dashboardData.data.checkIns || []);

            if (dashboardData.data.registration) {
                setUserData(prev => ({
                    ...prev,
                    registration: dashboardData.data.registration
                }));
            }
        } catch (error) {
            console.error('Dashboard error:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    fetchUserData();
}, []);


  const validatePassword = (password) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (password.length < minLength) {
      return "Password must be at least 8 characters long";
    }
    if (!hasUpperCase) {
      return "Password must contain at least one uppercase letter";
    }
    if (!hasLowerCase) {
      return "Password must contain at least one lowercase letter";
    }
    if (!hasNumbers) {
      return "Password must contain at least one number";
    }
    if (!hasSpecialChar) {
      return "Password must contain at least one special character";
    }
    return "";
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    
    // Reset error and success states
    setResetPassword(prev => ({ 
        ...prev, 
        error: '', 
        success: '' 
    }));

    // Validate passwords match
    if (resetPassword.newPassword !== resetPassword.confirmPassword) {
        setResetPassword(prev => ({ 
            ...prev, 
            error: 'Passwords do not match' 
        }));
        return;
    }

    // Validate password strength
    const passwordError = validatePassword(resetPassword.newPassword);
    if (passwordError) {
        setResetPassword(prev => ({ 
            ...prev, 
            error: passwordError 
        }));
        return;
    }

    setResetPassword(prev => ({ ...prev, loading: true }));

    try {
        const response = await fetch(API_CONFIG.getUrl('/offline/reset-password'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                studentId: resetPassword.studentId,
                email: resetPassword.email,
                newPassword: resetPassword.newPassword
            })
        });

        const data = await response.json();
        if (!data.success) throw new Error(data.error);

        setResetPassword(prev => ({
            ...prev,
            success: 'Password has been reset successfully! Please log in with your new password.',
            studentId: '',
            email: '',
            newPassword: '',
            confirmPassword: ''
        }));

        // Close modal after 3 seconds on success
        setTimeout(() => {
            closeResetForm();
        }, 3000);

    } catch (error) {
        setResetPassword(prev => ({ 
            ...prev, 
            error: error.message || 'Failed to reset password' 
        }));
    } finally {
        setResetPassword(prev => ({ ...prev, loading: false }));
    }
};


  const closeResetForm = () => {
    setShowResetForm(false);
    setResetPassword({
      studentId: '',
      email: '',
      newPassword: '',
      confirmPassword: '',
      loading: false,
      error: '',
      success: ''
    });
    setShowPassword(false);
    setShowConfirmPassword(false);
  };
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader className="h-12 w-12 text-blue-400 animate-spin mx-auto" />
          <p className="mt-4 text-blue-200 text-lg">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center">
        <div className="text-center p-8 bg-gray-800 rounded-xl shadow-2xl">
          <p className="text-xl text-red-400 mb-4">{error}</p>
          <button
            onClick={() => window.location.href = '/offlineLogin'}
            className="mt-4 bg-blue-600 px-6 py-3 rounded-lg text-white font-semibold hover:bg-blue-700 transition-colors duration-200 shadow-lg hover:shadow-xl"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 text-white p-6">
      <div className="max-w-6xl mx-auto space-y-8">
       

        {/* User Info Section */}
        <div className="bg-gray-800 mt-24 rounded-2xl shadow-2xl p-8 backdrop-blur-lg bg-opacity-50 border border-gray-700">
          <div className="flex items-start justify-between flex-wrap gap-8">
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Welcome, {userData?.name}!
              </h1>
              <div className="grid sm:grid-cols-2 gap-6 text-gray-300">
                <div className="space-y-3">
                  <p className="flex items-center gap-2">
                    <User className="h-5 w-5 text-blue-400" />
                    <span className="text-gray-400">Student ID:</span> {userData?.studentId}
                  </p>
                  <p className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-blue-400" />
                    <span className="text-gray-400">Branch:</span> {userData?.branch}
                  </p>
                </div>
                <div className="space-y-3">
                  <p className="flex items-center gap-2">
                    <QrCode className="h-5 w-5 text-blue-400" />
                    <span className="text-gray-400">Class:</span> {userData?.class}
                  </p>
                  <p className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-blue-400" />
                    <span className="text-gray-400">Email:</span> {userData?.email}
                  </p>
                </div>
                 {/* Header with Reset Password Button */}
                                    <div className="flex  justify-end">
                                    <button
                                        onClick={() => setShowResetForm(true)}
                                        className="bg-blue-600 px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm font-semibold"
                                    >
                                        Reset Password
                                    </button>
                                    </div>
              </div>
            </div>
            {userData?.registration?.qrCode && (
              <div className="text-center">
                <div 
                  className="bg-white p-4 rounded-xl shadow-2xl mb-2 cursor-pointer transform hover:scale-105 transition-transform duration-200"
                  onClick={() => setShowQRModal(true)}
                >
                  <img 
                    src={userData.registration.qrCode} 
                    alt="Registration QR" 
                    className="w-32 h-32"
                  />
                </div>
                <p className="text-sm text-blue-400">
                  Receipt: {userData.registration.receiptNumber}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Events and Workshops Grid */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Events Section */}
          <div className="bg-gray-800 rounded-2xl shadow-2xl p-8 backdrop-blur-lg bg-opacity-50 border border-gray-700 hover:shadow-blue-900/20 transition-shadow duration-300">
            <h2 className="text-2xl font-semibold mb-6 flex items-center gap-3 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              <Calendar className="h-6 w-6 text-blue-400" />
              Registered Events
            </h2>
            <div className="space-y-4">
              {userData.registration?.events.map(event => (
                <div 
                  key={event.id} 
                  className="flex items-center justify-between bg-gray-700 bg-opacity-50 p-4 rounded-xl border border-gray-600 hover:border-blue-500 transition-colors duration-200"
                >
                  <span className="text-gray-200">{event.name}</span>
                  {checkIns.find(c => c.type === 'event' && c.itemName === event.name) ? (
                    <CheckCircle className="h-5 w-5 text-green-400" />
                  ) : (
                    <div className="h-3 w-3 rounded-full bg-yellow-500 animate-pulse" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Workshops Section */}
          <div className="bg-gray-800 rounded-2xl shadow-2xl p-8 backdrop-blur-lg bg-opacity-50 border border-gray-700 hover:shadow-purple-900/20 transition-shadow duration-300">
            <h2 className="text-2xl font-semibold mb-6 flex items-center gap-3 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              <Calendar className="h-6 w-6 text-purple-400" />
              Registered Workshops
            </h2>
            <div className="space-y-4">
              {userData.registration?.workshops.map(workshop => (
                <div 
                  key={workshop.id} 
                  className="flex items-center justify-between bg-gray-700 bg-opacity-50 p-4 rounded-xl border border-gray-600 hover:border-purple-500 transition-colors duration-200"
                >
                  <span className="text-gray-200">{workshop.name}</span>
                  {checkIns.find(c => c.type === 'workshop' && c.itemName === workshop.name) ? (
                    <CheckCircle className="h-5 w-5 text-green-400" />
                  ) : (
                    <div className="h-3 w-3 rounded-full bg-yellow-500 animate-pulse" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Check-in History */}
        <div className="bg-gray-800 rounded-2xl shadow-2xl p-8 backdrop-blur-lg bg-opacity-50 border border-gray-700">
          <h2 className="text-2xl font-semibold mb-6 bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
            Check-in History
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left border-b border-gray-700">
                  <th className="pb-4 text-blue-400">Type</th>
                  <th className="pb-4 text-blue-400">Name</th>
                  <th className="pb-4 text-blue-400">Time</th>
                  <th className="pb-4 text-blue-400">Verified By</th>
                </tr>
              </thead>
              <tbody>
                {checkIns.map((checkIn, index) => (
                  <tr key={index} className="border-b border-gray-700/50 hover:bg-gray-700/30 transition-colors duration-200">
                    <td className="py-4 text-gray-300">{checkIn.type}</td>
                    <td className="py-4 text-gray-300">{checkIn.itemName}</td>
                    <td className="py-4 text-gray-300">
                      {new Date(checkIn.timestamp).toLocaleString()}
                    </td>
                    <td className="py-4 text-gray-300">{checkIn.verifiedBy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {showQRModal && (
          <div className="fixed  inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
            <div className="relative bg-white p-8 rounded-2xl max-w-2xl w-full mx-4">
              <button
                onClick={() => setShowQRModal(false)}
                className="absolute top-4 right-4 text-gray-600 hover:text-gray-800"
              >
                <X className="h-6 w-6" />
              </button>
              <img 
                src={userData.registration.qrCode}
                alt="Registration QR Full"
                className="w-full h-[80vh] object-contain"
              />
              <p className="text-center text-gray-700 mt-4">
                Receipt Number: {userData.registration.receiptNumber}
              </p>
            </div>
          </div>
        )}

        {/* Reset Password Modal */}
        {showResetForm && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-8 rounded-2xl max-w-md w-full mx-4 relative border border-gray-700">
            <button
              onClick={closeResetForm}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors duration-200"
            >
              <X className="h-6 w-6" />
            </button>
            
            <h2 className="text-2xl font-semibold mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Reset Password
            </h2>

            <form onSubmit={handleResetPassword} className="space-y-4 ">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-300">Student ID</label>
                <input
                  type="text"
                  value={resetPassword.studentId}
                  onChange={(e) => setResetPassword(prev => ({ ...prev, studentId: e.target.value }))}
                  className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 focus:border-blue-500 focus:outline-none text-white"
                  placeholder="Enter your student ID"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-300">Email</label>
                <input
                  type="email"
                  value={resetPassword.email}
                  onChange={(e) => setResetPassword(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 focus:border-blue-500 focus:outline-none text-white"
                  placeholder="Enter your email"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-300">New Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={resetPassword.newPassword}
                    onChange={(e) => setResetPassword(prev => ({ ...prev, newPassword: e.target.value }))}
                    className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 focus:border-blue-500 focus:outline-none text-white pr-10"
                    placeholder="Create new password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors duration-200"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-300">Confirm Password</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={resetPassword.confirmPassword}
                    onChange={(e) => setResetPassword(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 focus:border-blue-500 focus:outline-none text-white pr-10"
                    placeholder="Confirm new password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors duration-200"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="text-sm text-gray-400 bg-gray-700/50 p-3 rounded-lg">
                <p className="font-medium text-blue-400 ">Password requirements:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>At least 8 characters long</li>
                  <li>Contains at least one uppercase letter</li>
    
                  <li>Contains at least one number</li>
                  <li>Contains at least one special character</li>
                </ul>
              </div>

              {resetPassword.error && (
                <p className="text-red-400 text-sm bg-red-400/10 p-2 rounded">{resetPassword.error}</p>
              )}
              
              {resetPassword.success && (
                <p className="text-green-400 text-sm bg-green-400/10 p-2 rounded">{resetPassword.success}</p>
              )}

              <button
                type="submit"
                disabled={resetPassword.loading}
                className="w-full bg-blue-600 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {resetPassword.loading ? (
                  <>
                    <Loader className="h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Reset Password'
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      </div>
    </div>
  );
};

export default OfflineDashboard;