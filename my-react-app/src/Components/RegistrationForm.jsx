// RegistrationForm.js
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useApi } from '../config/useApi';
import { toast } from 'react-hot-toast';

const RegistrationForm = () => {
  const { user, isAdmin, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const api = useApi();

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [initialCheckDone, setInitialCheckDone] = useState(false);

  const [formData, setFormData] = useState({
    name: user?.name || '',
    collegeId: '',
    branch: '',
    collegeName: '',
    mobileNumber: ''
  });

  // Update form data when user info is available
  useEffect(() => {
    if (user?.name) {
      setFormData(prev => ({
        ...prev,
        name: user.name
      }));
    }
  }, [user?.name]);

  const isStudentEmail = useMemo(() => {
    if (!user?.email) return false;
    return /^s\d{6}@rguktsklm\.ac\.in$/.test(user.email.toLowerCase());
  }, [user?.email]);

  // Handle initial auth and registration check
  useEffect(() => {
    let isMounted = true;

    const initializeRegistration = async () => {
      // Only proceed if we have authentication and haven't done the initial check
      if (!isAuthenticated || !user?.id || initialCheckDone) {
        setIsLoading(false);
        return;
      }

      try {
        // Handle admin case first
        if (isAdmin) {
          navigate('/adminDashboard');
          return;
        }

        const data = await api.getUser(user.id);
        
        if (!isMounted) return;

        if (data.success && data.user && !data.needsRegistration) {
          // User is registered, navigate to intended destination
          const returnPath = location.state?.from?.pathname || '/cart';
          navigate(returnPath, { replace: true }); // Use replace to prevent back navigation
        } else {
          // User needs registration, stay on form
          setIsLoading(false);
        }
        
        setInitialCheckDone(true);
      } catch (error) {
        console.error('Registration check failed:', error);
        if (isMounted) {
          setError(error.message);
          setIsLoading(false);
          setInitialCheckDone(true);
        }
      }
    };

    initializeRegistration();

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, user?.id, isAdmin, initialCheckDone]);

  // Form validation
  const isFormValid = useMemo(() => {
    const validation = {
      mobileValid: /^[6-9]\d{9}$/.test(formData.mobileNumber),
      nameValid: formData.name?.trim().length > 0,
      collegeIdValid: isStudentEmail ? Boolean(formData.collegeId?.trim()) : true,
      branchValid: isStudentEmail ? Boolean(formData.branch?.trim()) : true,
      collegeNameValid: !isStudentEmail ? Boolean(formData.collegeName?.trim()) : true
    };

    return Object.values(validation).every(Boolean);
  }, [formData, isStudentEmail]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      const registrationData = {
        kindeId: user.id,
        name: formData.name,
        email: user.email,
        mobileNumber: formData.mobileNumber,
        registrationType: isStudentEmail ? 'student' : 'other',
        ...(isStudentEmail 
          ? { 
              collegeId: formData.collegeId,
              branch: formData.branch
            } 
          : { 
              collegeName: formData.collegeName 
            }
        )
      };

      const response = await api.registerUser(registrationData);
      
      if (response.success) {
        toast.success('Registration successful!');
        navigate('/cart', { replace: true }); // Use replace to prevent back navigation
      } else {
        throw new Error(response.error || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      setError(error.message || 'Registration failed. Please try again.');
      toast.error(error.message || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  if (isLoading) {
    console.log('Showing loading state');
    return (
      <div className="min-h-screen bg-slate-900 pt-24 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-slate-900 pt-24 pb-12 px-4">
      <div className="max-w-md mx-auto">
        {/* Title Section */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent mb-2">
            Techni<span className="text-indigo-300">V</span>erse
          </h1>
          <p className="text-gray-400 text-lg">Complete Your Registration</p>
        </div>
  
        {/* Form Card */}
        <div className="bg-slate-800 rounded-2xl shadow-xl p-8 backdrop-blur-lg border border-slate-700">
          {/* User Info Display */}
          <div className="mb-6 p-4 bg-slate-900 rounded-lg">
            <p className="text-gray-400 text-sm">Logged in as:</p>
            <p className="text-white font-medium truncate">{user?.email}</p>
          </div>
  
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Common Fields */}
            <div className="space-y-4">
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full bg-slate-900 text-white rounded-lg px-4 py-3 border border-slate-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all duration-200"
                  required
                  placeholder="Enter your full name"
                />
              </div>
  
              {/* Conditional Fields */}
              {isStudentEmail ? (
                <>
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      College ID Number
                    </label>
                    <input
                      type="text"
                      value={formData.collegeId}
                      onChange={(e) => setFormData(prev => ({ ...prev, collegeId: e.target.value }))}
                      className="w-full bg-slate-900 text-white rounded-lg px-4 py-3 border border-slate-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all duration-200"
                      required
                      placeholder="Enter your college ID"
                    />
                  </div>
  
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      Branch
                    </label>
                    <select
                      value={formData.branch}
                      onChange={(e) => setFormData(prev => ({ ...prev, branch: e.target.value }))}
                      className="w-full bg-slate-900 text-white rounded-lg px-4 py-3 border border-slate-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all duration-200"
                      required
                    >
                      <option value="" className="bg-slate-800">Select Branch</option>
                      <option value="CSE" className="bg-slate-800">Computer Science</option>
                      <option value="ECE" className="bg-slate-800">Electronics</option>
                      <option value="EEE" className="bg-slate-800">EEE</option>
                      <option value="MECH" className="bg-slate-800">Mechanical</option>
                      <option value="CIVIL" className="bg-slate-800">Civil</option>
                      
                    </select>
                  </div>
                </>
              ) : (
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    College Name
                  </label>
                  <input
                    type="text"
                    value={formData.collegeName}
                    onChange={(e) => setFormData(prev => ({ ...prev, collegeName: e.target.value }))}
                    className="w-full bg-slate-900 text-white rounded-lg px-4 py-3 border border-slate-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all duration-200"
                    required
                    placeholder="Enter your college name"
                  />
                </div>
              )}
  
              {/* Mobile Number Field */}
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Mobile Number
                </label>
                <input
                  type="tel"
                  value={formData.mobileNumber}
                  onChange={(e) => setFormData(prev => ({ ...prev, mobileNumber: e.target.value }))}
                  className="w-full bg-slate-900 text-white rounded-lg px-4 py-3 border border-slate-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all duration-200"
                  required
                  placeholder="Enter your mobile number"
                  pattern="[0-9]{10}"
                  title="Please enter a valid 10-digit mobile number"
                />
              </div>
            </div>
  
            {/* Submit Button */}
            <button 
              type="submit"
              disabled={isSubmitting || !isFormValid}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Processing...
                </div>
              ) : (
                'Complete Registration'
              )}
            </button>
          </form>
  
          {/* Bottom Info */}
          <div className="mt-6 text-center text-sm text-gray-400">
            <p>Need help? Contact support@techniverse.com</p>
          </div>
        </div>
      </div>
    </div>
  );
  }
  
  export default React.memo(RegistrationForm);