import React, { useState } from 'react';
import QRScanner from './QrScanner.jsx';

function validateInterface() {
  const [validationResult, setValidationResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleQRScan = async (qrData) => {
    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_APP_BACKEND_URL}/api/check-in`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ qrData })
      });
      
      const data = await response.json();
      setValidationResult(data);
    } catch (error) {
      setValidationResult({
        success: false,
        message: 'Check-in failed: ' + error.message
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-4">
      <h2 className="text-2xl text-white font-bold mb-6">Event Check-in</h2>
      
      {/* QR Scanner */}
      <div className="mb-8">
        <div className="bg-gray-800 p-4 rounded-lg">
          <QRScanner onScan={handleQRScan} />
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
          <p className="text-gray-300 mt-2">Processing check-in...</p>
        </div>
      )}

      {/* Results Display */}
      {validationResult && !loading && (
        <div className={`p-4 rounded-lg ${
          validationResult.success ? 'bg-green-900/30 border border-green-500/50' : 'bg-red-900/30 border border-red-500/50'
        }`}>
          {validationResult.success ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-green-400 mb-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <p className="font-medium">Check-in Successful</p>
              </div>
              
              <div className="text-gray-300">
                <p className="mb-2"><span className="text-gray-400">Name:</span> {validationResult.details.name}</p>
                {validationResult.details.events && (
                  <p className="mb-2"><span className="text-gray-400">Events:</span> {validationResult.details.events}</p>
                )}
                {validationResult.details.workshops && (
                  <p className="mb-2"><span className="text-gray-400">Workshops:</span> {validationResult.details.workshops}</p>
                )}
                <p className="text-sm text-gray-400">
                  Checked in at: {new Date(validationResult.details.timestamp).toLocaleString()}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-red-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
              <p>{validationResult.message}</p>
            </div>
          )}
        </div>
      )}

      {/* Reset Button */}
      {validationResult && !loading && (
        <button
          onClick={() => setValidationResult(null)}
          className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          Check in Another Participant
        </button>
      )}
    </div>
  );
}

export default validateInterface;