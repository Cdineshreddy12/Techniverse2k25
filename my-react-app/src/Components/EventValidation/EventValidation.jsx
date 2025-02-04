import React, { useState } from 'react';
import QRScanner from './QrScanner.jsx';

function ValidationInterface({ eventId }) {
  const [validationResult, setValidationResult] = useState(null);
  const [manualCode, setManualCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleValidation = async (code) => {
    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_APP_BACKEND_URL}/api/validate-registration`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code,
          eventId
        })
      });
      
      const data = await response.json();
      setValidationResult(data);
    } catch (error) {
      setValidationResult({
        isValid: false,
        message: 'Validation failed: ' + error.message
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
        <h3 className="text-lg font-semibold text-white mb-4">Scan QR Code</h3>
        <QRScanner onValidationComplete={handleValidation} />
      </div>

      {/* Manual Entry */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-white mb-4">Manual Code Entry</h3>
        <div className="flex gap-4">
          <input
            type="text"
            value={manualCode}
            onChange={(e) => setManualCode(e.target.value)}
            className="flex-1 p-2 border rounded"
            placeholder="Enter registration code"
          />
          <button
            onClick={() => handleValidation(manualCode)}
            className="px-4 py-2 bg-blue-500 text-white rounded"
            disabled={loading}
          >
            Validate
          </button>
        </div>
      </div>

      {/* Results Display */}
      {validationResult && (
        <div className={`p-4 rounded ${
          validationResult.isValid ? 'bg-green-100' : 'bg-red-100'
        }`}>
          <p className="font-bold">{validationResult.message}</p>
          {validationResult.isValid && validationResult.participant && (
            <div className="mt-2">
              <p>Name: {validationResult.participant.name}</p>
              <p>Package: {validationResult.participant.comboName}</p>
              <p>Event: {validationResult.participant.eventName}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ValidationInterface;