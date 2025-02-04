import React, { useState } from 'react';
import { useKindeAuth } from '@kinde-oss/kinde-auth-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

const RegistrationForm = () => {
  const { user } = useKindeAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: user?.name || '', // Pre-fill with user name if available
    collegeId: '',
    branch: '',
    collegeName: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isStudentEmail = user?.email?.toLowerCase().startsWith('s');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const response = await fetch(`${import.meta.env.VITE_APP_BACKEND_URL}/api/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kindeId: user.id,
          name:formData.name,
          email: user.email,
          ...formData
        })
      });
      
      if (!response.ok) throw new Error('Registration failed');
      toast.success('Registration completed successfully!');
      // Add a small delay before redirecting to allow the success toast to be visible
      setTimeout(() => {
        navigate('/cart');
      }, 1500);
    } catch (error) {
      toast.error('Failed to register. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
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
                </div>
            )}

            <button 
              type="submit"
              disabled={isSubmitting}
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