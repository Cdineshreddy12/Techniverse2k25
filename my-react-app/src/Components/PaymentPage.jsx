import React, { useState } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { 
  CreditCard, Wallet, Building2, ChevronRight, Shield, 
  CheckCircle, AlertCircle, QrCode, User, Mail, Phone
} from 'lucide-react';

const PaymentPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { combo, selectedEvents, selectedWorkshops } = location.state || {};
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    college: '',
    department: '',
    year: ''
  });

  // Calculate totals
  const calculatePricing = () => {
    if (!combo) return { subtotal: 0, discount: 0, total: 0 };
    
    const subtotal = combo.originalPrice || combo.price;
    const discount = combo.savings || 0;
    const total = combo.price;

    return { subtotal, discount, total };
  };

  const { subtotal, discount, total } = calculatePricing();

  const handleInputChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handlePayment = async () => {
    setLoading(true);
    setError('');

    // Validate form
    const requiredFields = ['name', 'email', 'phone', 'college', 'department', 'year'];
    const emptyFields = requiredFields.filter(field => !formData[field]);
    
    if (emptyFields.length > 0) {
      setError('Please fill in all required fields');
      setLoading(false);
      return;
    }

    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Navigate to success page
      navigate('/registration-success', {
        state: {
          registrationData: {
            ...formData,
            combo,
            selectedEvents,
            selectedWorkshops,
            paymentAmount: total,
            paymentMethod,
            transactionId: 'TXN' + Math.random().toString(36).substr(2, 9).toUpperCase()
          }
        }
      });
    } catch (err) {
      setError('Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!combo) {
    return (
      <div className="min-h-screen bg-slate-950 text-white p-8">
        <div className="max-w-4xl mx-auto text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-4">No Package Selected</h1>
          <Link to="/" className="text-cyan-400 hover:underline">
            Return to Package Selection
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Complete Registration</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Personal Details and Payment Form */}
          <div className="lg:col-span-2 space-y-8">
            {/* Personal Details */}
            <div className="bg-slate-800/50 rounded-lg p-6">
              <h2 className="text-xl font-bold mb-4">Personal Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full bg-slate-900 rounded-lg px-4 py-2 border border-slate-700 focus:border-cyan-500 focus:outline-none"
                    placeholder="Full Name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full bg-slate-900 rounded-lg px-4 py-2 border border-slate-700 focus:border-cyan-500 focus:outline-none"
                    placeholder="email@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full bg-slate-900 rounded-lg px-4 py-2 border border-slate-700 focus:border-cyan-500 focus:outline-none"
                    placeholder="Phone Number"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">College</label>
                  <input
                    type="text"
                    name="college"
                    value={formData.college}
                    onChange={handleInputChange}
                    className="w-full bg-slate-900 rounded-lg px-4 py-2 border border-slate-700 focus:border-cyan-500 focus:outline-none"
                    placeholder="College Name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Department</label>
                  <input
                    type="text"
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    className="w-full bg-slate-900 rounded-lg px-4 py-2 border border-slate-700 focus:border-cyan-500 focus:outline-none"
                    placeholder="Your Department"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Year</label>
                  <select
                    name="year"
                    value={formData.year}
                    onChange={handleInputChange}
                    className="w-full bg-slate-900 rounded-lg px-4 py-2 border border-slate-700 focus:border-cyan-500 focus:outline-none"
                  >
                    <option value="">Select Year</option>
                    <option value="1">First Year</option>
                    <option value="2">Second Year</option>
                    <option value="3">Third Year</option>
                    <option value="4">Fourth Year</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Payment Methods */}
            <div className="bg-slate-800/50 rounded-lg p-6">
              <h2 className="text-xl font-bold mb-4">Payment Method</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => setPaymentMethod('card')}
                  className={`p-4 rounded-lg border transition-all ${
                    paymentMethod === 'card'
                      ? 'border-cyan-500 bg-cyan-900/20'
                      : 'border-slate-700 hover:border-cyan-500/50'
                  }`}
                >
                  <CreditCard className="w-6 h-6 mb-2" />
                  <div className="text-sm font-medium">Credit/Debit Card</div>
                </button>
                <button
                  onClick={() => setPaymentMethod('upi')}
                  className={`p-4 rounded-lg border transition-all ${
                    paymentMethod === 'upi'
                      ? 'border-cyan-500 bg-cyan-900/20'
                      : 'border-slate-700 hover:border-cyan-500/50'
                  }`}
                >
                  <QrCode className="w-6 h-6 mb-2" />
                  <div className="text-sm font-medium">UPI</div>
                </button>
                <button
                  onClick={() => setPaymentMethod('netbanking')}
                  className={`p-4 rounded-lg border transition-all ${
                    paymentMethod === 'netbanking'
                      ? 'border-cyan-500 bg-cyan-900/20'
                      : 'border-slate-700 hover:border-cyan-500/50'
                  }`}
                >
                  <Building2 className="w-6 h-6 mb-2" />
                  <div className="text-sm font-medium">Net Banking</div>
                </button>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-slate-800/50 rounded-lg p-6 sticky top-8">
              <h2 className="text-xl font-bold mb-4">Order Summary</h2>
              
              {/* Package Details */}
              <div className="mb-6">
                <h3 className="font-bold mb-2">{combo.name}</h3>
                <p className="text-sm text-gray-400">{combo.subtitle}</p>
              </div>

              {/* Selected Events */}
              <div className="mb-6">
                <h3 className="font-bold mb-2">Selected Items:</h3>
                <ul className="space-y-2 text-sm">
                  {selectedEvents?.map((event, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>{event.name}</span>
                    </li>
                  ))}
                  {selectedWorkshops?.map((workshop, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-purple-500" />
                      <span>{workshop.name}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Pricing */}
              <div className="border-t border-slate-700 pt-4 mb-6">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-400">Subtotal</span>
                  <span>₹{subtotal}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-400">Discount</span>
                  <span className="text-green-400">-₹{discount}</span>
                </div>
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>₹{total}</span>
                </div>
              </div>

              {/* Payment Button */}
              <button
                onClick={handlePayment}
                disabled={loading}
                className="w-full py-3 rounded-lg font-bold bg-gradient-to-r from-cyan-500 to-purple-500 
                         hover:from-cyan-600 hover:to-purple-600 transition-all duration-300 
                         flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                ) : (
                  <>
                    Pay ₹{total}
                    <ChevronRight className="w-5 h-5" />
                  </>
                )}
              </button>

              {error && (
                <div className="mt-4 text-red-500 text-sm flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </div>
              )}

              {/* Security Note */}
              <div className="mt-4 flex items-center gap-2 text-sm text-gray-400">
                <Shield className="w-4 h-4" />
                <span>Secure payment powered by Razorpay</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;