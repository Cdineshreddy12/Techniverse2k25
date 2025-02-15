import React, { useState } from 'react';

const ValidationPage = () => {
  const [searchType, setSearchType] = useState('receipt'); // 'receipt' or 'qr'
  const [searchQuery, setSearchQuery] = useState('');
  const [validationResult, setValidationResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleValidation = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:4000/api/validateOffline', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          receiptNumber: searchQuery,
          studentId: searchQuery
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Validation failed');
      }

      setValidationResult({
        success: true,
        data: data
      });
    } catch (error) {
      setValidationResult({
        success: false,
        error: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-blue-600 px-6 py-4">
            <h1 className="text-2xl font-bold text-white text-center">
              Event Check-in Validation
            </h1>
          </div>

          {/* Search Type Toggle */}
          <div className="flex border-b">
            <button
              onClick={() => setSearchType('receipt')}
              className={`flex-1 py-3 text-center font-medium ${
                searchType === 'receipt'
                  ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Receipt Number
            </button>
            <button
              onClick={() => setSearchType('qr')}
              className={`flex-1 py-3 text-center font-medium ${
                searchType === 'qr'
                  ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              QR Code
            </button>
          </div>

          {/* Search Input */}
          <div className="p-6">
            {searchType === 'receipt' ? (
              <div className="space-y-4">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Enter Receipt Number or Student ID"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <button
                  onClick={handleValidation}
                  disabled={loading}
                  className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                >
                  {loading ? 'Validating...' : 'Validate'}
                </button>
              </div>
            ) : (
              <div className="text-center p-8 border-2 border-dashed rounded-lg">
                <p className="text-gray-500">QR Scanner would be integrated here</p>
              </div>
            )}

            {/* Validation Result */}
            {validationResult && (
              <div className={`mt-6 p-4 rounded-lg ${
                validationResult.success 
                  ? 'bg-green-50 border border-green-200' 
                  : 'bg-red-50 border border-red-200'
              }`}>
                {validationResult.success ? (
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-green-500 rounded-full mr-2"></div>
                      <p className="text-green-700 font-medium">Registration Verified</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Name</p>
                        <p className="font-medium">{validationResult.data.name}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Student ID</p>
                        <p className="font-medium">{validationResult.data.studentId}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Registration Type</p>
                        <p className="font-medium">{validationResult.data.registrationType}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Amount Paid</p>
                        <p className="font-medium">₹{validationResult.data.registrationFee}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-red-500 rounded-full mr-2"></div>
                    <p className="text-red-700">{validationResult.error}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ValidationPage;