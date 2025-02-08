import React, { useState,useEffect } from 'react';
import { useKindeAuth } from '@kinde-oss/kinde-auth-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { createApiClient } from '../config/kindeAPI';
const RegistrationForm = () => {
  const { user } = useKindeAuth();
  const navigate = useNavigate();
  const api = createApiClient();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    collegeId: '',
    branch: '',
    collegeName: '',
    mobileNumber: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isStudentEmail = user?.email?.toLowerCase().startsWith('s');

  useEffect(() => {
    const checkRegistration = async () => {
        if (!user?.id) {
            setIsLoading(false);
            return;
        }

        try {
            const data = await api.getUser(user.id);
            console.log('Registration check response:', data); // Debug log

            if (data.success && data.user) {
                // User exists and is registered
                toast.success('Already registered!');
                navigate('/cart');
            } else if (data.needsRegistration) {
                // User needs to complete registration
                setIsLoading(false);
            }
        } catch (error) {
            console.error('Failed to check registration:', error);
            toast.error('Failed to verify registration status');
            setIsLoading(false);
        }
    };

    checkRegistration();
}, [user?.id, navigate, api]);

 
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      if (!formData.name || !user?.email || !formData.mobileNumber) {
        throw new Error('Please fill in all required fields');
      }
  
      const registrationData = {
        kindeId: user.id,
        name: formData.name,
        email: user.email,
        mobileNumber: formData.mobileNumber,
        registrationType: isStudentEmail ? 'student' : 'other', // Add this
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
  
      console.log('Sending registration data:', registrationData);
      await api.registerUser(registrationData);
      
      toast.success('Registration completed successfully!');
      setTimeout(() => navigate('/cart'), 1500);
    } catch (error) {
      console.error('Registration error:', error);
      toast.error(error.message || 'Failed to register. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

    // Form validation
    const validateForm = () => {
      if (!formData.name?.trim()) return false;
      if (!formData.mobileNumber?.match(/^[6-9]\d{9}$/)) return false;
      
      if (isStudentEmail) {
        if (!formData.collegeId?.trim()) return false;
        if (!formData.branch) return false;
      } else {
        if (!formData.collegeName?.trim()) return false;
      }
      
      return true;
    };


  // Rest of your component remains the same
  return (
    <div className="min-h-screen bg-slate-900 pt-24 pb-12 px-4">
      <div className="max-w-md mx-auto">
        {/* Title Section */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent mb-2">
            Techni<span className="text-indigo-400">V</span>erse
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
            {isStudentEmail ? (
              <>
                <div className="space-y-4">
                <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                        Full Name
                    </label>
                    <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full bg-slate-900 text-white rounded-lg px-4 py-3 border border-slate-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all duration-200"
                        required
                        placeholder="Enter your full name"
                    />
                </div>

                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      College ID Number
                    </label>
                    <input
                      type="text"
                      value={formData.collegeId}
                      onChange={(e) => setFormData({...formData, collegeId: e.target.value})}
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
                      onChange={(e) => setFormData({...formData, branch: e.target.value})}
                      className="w-full bg-slate-900 text-white rounded-lg px-4 py-3 border border-slate-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all duration-200"
                      required
                    >
                      <option value="" className="bg-slate-800">Select Branch</option>
                      <option value="CSE" className="bg-slate-800">Computer Science</option>
                      <option value="ECE" className="bg-slate-800">Electronics</option>
                      <option value="MECH" className="bg-slate-800">Mechanical</option>
                      <option value="CIVIL" className="bg-slate-800">Civil</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      Mobile Number
                    </label>
                    <input
                      type="tel"
                      value={formData.mobileNumber}
                      onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value })}
                      className="w-full bg-slate-900 text-white rounded-lg px-4 py-3 border border-slate-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all duration-200"
                      required
                      placeholder="Enter your mobile number"
                      pattern="[0-9]{10}"
                      title="Please enter a valid 10-digit mobile number"
                    />
                  </div>

                </div>
              </>
            ) : (

                <div>
                       <div>
                            <label className="block text-gray-300 text-sm font-medium mb-2">
                                Full Name
                            </label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full bg-slate-900 text-white rounded-lg px-4 py-3 border border-slate-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all duration-200"
                                required
                                placeholder="Enter your full name"
                            />
                            </div>

                        <div>
                            <label className="block text-gray-300 text-sm font-medium mb-2">
                            College Name
                            </label>
                            <input
                            type="text"
                            value={formData.collegeName}
                            onChange={(e) => setFormData({...formData, collegeName: e.target.value})}
                            className="w-full bg-slate-900 text-white rounded-lg px-4 py-3 border border-slate-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all duration-200"
                            required
                            placeholder="Enter your college name"
                            />
                        </div>

                        <div>
                        <label className="block text-gray-300 text-sm font-medium mb-2">
                          Mobile Number
                        </label>
                        <input
                          type="tel"
                          value={formData.mobileNumber}
                          onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value })}
                          className="w-full bg-slate-900 text-white rounded-lg px-4 py-3 border border-slate-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all duration-200"
                          required
                          placeholder="Enter your mobile number"
                          pattern="[0-9]{10}"
                          title="Please enter a valid 10-digit mobile number"
                        />
                      </div>
                </div>
            )}

              <button 
                      type="submit"
                      disabled={isSubmitting || !validateForm()}
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
};

export default RegistrationForm;