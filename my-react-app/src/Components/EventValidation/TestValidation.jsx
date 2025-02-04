import React, { useState, useCallback } from 'react';
import QRCode from 'react-qr-code';
import QRScanner from './QrScanner';

function TestValidation() {
  const [generatedCode, setGeneratedCode] = useState('');
  const [scannedCode, setScannedCode] = useState('');
  const [validationResult, setValidationResult] = useState(null);
  const [debugLog, setDebugLog] = useState([]);

  // Add debug log entry
  const addDebugLog = useCallback((message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setDebugLog(prev => [...prev, { timestamp, message, type }]);
  }, []);

  // Generate a sample registration QR code
  const generateTestCode = () => {
    try {
      const registrationData = {
        registrationId: 'TECH-' + Math.random().toString(36).substr(2, 6).toUpperCase(),
        studentName: 'Test Student',
        eventName: 'Hackathon',
        eventId: 'HACK-001',
        timestamp: new Date().toISOString(),
        registrationType: 'Pro Package'
      };

      const codeString = JSON.stringify(registrationData);
      setGeneratedCode(codeString);
      addDebugLog('Generated new QR code data: ' + codeString.substring(0, 50) + '...', 'success');
    } catch (error) {
      addDebugLog('Error generating QR code: ' + error.message, 'error');
    }
  };

  // Handle QR code scan
  const handleScanSuccess = (result) => {
    addDebugLog('Scan detected. Raw data: ' + result.substring(0, 50) + '...', 'info');
    setScannedCode(result);
    
    try {
      // Try to parse the scanned data
      const parsedData = JSON.parse(result);
      addDebugLog('Successfully parsed JSON data', 'success');
      
      // Validate the data structure
      if (parsedData.registrationId && parsedData.eventId) {
        addDebugLog('Valid registration data format detected', 'success');
        setValidationResult({
          isValid: true,
          message: 'Valid registration found!',
          data: parsedData
        });
      } else {
        addDebugLog('Missing required fields in scanned data', 'error');
        setValidationResult({
          isValid: false,
          message: 'Invalid registration format - Missing required fields',
          data: parsedData
        });
      }
    } catch (error) {
      addDebugLog('Failed to parse scanned data: ' + error.message, 'error');
      setValidationResult({
        isValid: false,
        message: 'Invalid QR code format: ' + error.message,
        data: result
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-8">
      {/* Generator Section */}
      <div className="bg-slate-800 p-6 rounded-lg">
        <h2 className="text-xl font-bold mb-4">Test Registration Generator</h2>
        <button
          onClick={generateTestCode}
          className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 rounded text-white"
        >
          Generate Test Registration
        </button>

        {generatedCode && (
          <div className="mt-4 space-y-4">
            <div className="bg-white p-4 inline-block rounded-lg">
              <QRCode value={generatedCode} />
            </div>
            <div>
              <h3 className="font-bold text-gray-300">Generated Data:</h3>
              <pre className="bg-slate-900 p-4 rounded-lg overflow-auto mt-2 text-sm">
                {JSON.stringify(JSON.parse(generatedCode), null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>

      {/* Scanner Section */}
      <div className="bg-slate-800 p-6 rounded-lg">
        <h2 className="text-xl font-bold mb-4">Registration Scanner</h2>
        <QRScanner onScanSuccess={handleScanSuccess} />
        
        {/* Debug Log */}
        <div className="mt-4 p-4 bg-slate-900 rounded-lg">
          <h3 className="font-bold text-gray-300 mb-2">Debug Log</h3>
          <div className="space-y-1 text-sm max-h-40 overflow-y-auto">
            {debugLog.map((log, index) => (
              <div 
                key={index} 
                className={`py-1 ${
                  log.type === 'error' ? 'text-red-400' :
                  log.type === 'success' ? 'text-green-400' :
                  'text-gray-400'
                }`}
              >
                [{log.timestamp}] {log.message}
              </div>
            ))}
          </div>
        </div>
        
        {/* Validation Results */}
        {validationResult && (
          <div className={`mt-4 p-4 rounded-lg ${
            validationResult.isValid ? 'bg-green-500/20' : 'bg-red-500/20'
          }`}>
            <h3 className="font-bold mb-2">{validationResult.message}</h3>
            {validationResult.isValid && (
              <div className="space-y-2 text-white text-sm">
                <p><span className="font-bold">Registration ID:</span> {validationResult.data.registrationId}</p>
                <p><span className="font-bold">Student:</span> {validationResult.data.studentName}</p>
                <p><span className="font-bold">Event:</span> {validationResult.data.eventName}</p>
                <p><span className="font-bold">Package:</span> {validationResult.data.registrationType}</p>
                <p><span className="font-bold">Time:</span> {new Date(validationResult.data.timestamp).toLocaleString()}</p>
              </div>
            )}
            <pre className="mt-4 bg-slate-100 p-4 rounded-lg overflow-auto text-xs">
              {JSON.stringify(validationResult.data, null, 2)}
            </pre>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="bg-slate-800 p-6 rounded-lg">
        <h2 className="text-xl font-bold mb-4">Testing Instructions</h2>
        <ol className="list-decimal list-inside space-y-2 text-gray-300">
          <li>Click "Generate Test Registration" to create a sample QR code</li>
          <li>Use your phone camera or webcam to scan the generated QR code</li>
          <li>Watch the debug log for scan events and validation status</li>
          <li>Verify that the scanned data matches the generated data</li>
          <li>Check if the validation results are correct</li>
        </ol>
      </div>
    </div>
  );
}

export default TestValidation;