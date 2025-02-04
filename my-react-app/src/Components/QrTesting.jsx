import React, { useState, useEffect } from 'react';
import { useZxing } from "react-zxing";
import { 
  CheckCircle, AlertCircle, RefreshCw, Camera,
  Calendar, Clock, User, School
} from 'lucide-react';

const QRScanner = () => {
  const [validationResult, setValidationResult] = useState(null);
  const [error, setError] = useState('');
  const [isScanning, setIsScanning] = useState(true);
  const [lastScannedData, setLastScannedData] = useState(null);
  const [cameraPermission, setCameraPermission] = useState(true);

  const { ref } = useZxing({
    onDecodeResult: async (result) => {
      const scannedData = result.getText();
      console.log('Scanned Data:', scannedData);
      
      // Prevent duplicate scans
      if (scannedData === lastScannedData) {
        return;
      }

      setLastScannedData(scannedData);
      setIsScanning(false);

      try {
        const response = await fetch(`${import.meta.env.VITE_APP_BACKEND_URL}/api/validate-qr`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ qrData: scannedData })
        });

        const data = await response.json();
        console.log('Server Response:', data);

        if (data.success) {
          setValidationResult(data);
          if (navigator.vibrate) {
            navigator.vibrate(200);
          }
        } else {
          throw new Error(data.error || 'Validation failed');
        }
      } catch (err) {
        console.error('Validation Error:', err);
        setError(err.message);
      }
    },
    onError: (error) => {
      if (error.name !== 'NotFoundException') {
        if (error.name === 'NotAllowedError') {
          setCameraPermission(false);
        } else {
          setError('Scanner error: ' + error.message);
        }
      }
    },
    paused: !isScanning
  });

  const resetScanner = () => {
    setValidationResult(null);
    setError('');
    setLastScannedData(null);
    setIsScanning(true);
  };

  // Request camera permission on mount
  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(() => setCameraPermission(true))
      .catch(() => setCameraPermission(false));
  }, []);

  if (!cameraPermission) {
    return (
      <div className="min-h-screen bg-slate-950 text-white p-8">
        <div className="max-w-2xl mx-auto text-center">
          <Camera className="w-16 h-16 mx-auto mb-4 text-red-500" />
          <h2 className="text-2xl font-bold mb-4">Camera Access Required</h2>
          <p className="text-gray-400 mb-6">Please allow camera access to scan QR codes.</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-cyan-500 rounded-lg hover:bg-cyan-600"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">
      <div className="max-w-2xl mx-auto">
        <h2 className="text-3xl font-bold mb-6">QR Code Scanner</h2>
        
        {/* Scanner */}
        {isScanning && (
          <div className="relative">
            <video
              ref={ref}
              className="w-full rounded-lg border-2 border-cyan-500/30"
            />
            <div className="absolute inset-0 border-2 border-cyan-500/50 rounded-lg">
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
                            w-48 h-48 border-2 border-cyan-400 rounded-lg">
                <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-cyan-400" />
                <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-cyan-400" />
                <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-cyan-400" />
                <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-cyan-400" />
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        {validationResult && validationResult.registration && (
          <div className="mt-8 bg-slate-800/50 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-6">
              <CheckCircle className="w-8 h-8 text-green-500" />
              <div>
                <h3 className="text-xl font-bold text-green-400">Validation Successful</h3>
                <p className="text-sm text-gray-400">Registration verified</p>
              </div>
            </div>

            <div className="space-y-6">
              {/* Personal Details */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-700/30 p-4 rounded-lg">
                  <div className="flex items-center gap-2 text-gray-300 mb-2">
                    <User className="w-4 h-4" />
                    <span className="text-sm">Name</span>
                  </div>
                  <p className="font-semibold">{validationResult.registration.name}</p>
                </div>

                <div className="bg-slate-700/30 p-4 rounded-lg">
                  <div className="flex items-center gap-2 text-gray-300 mb-2">
                    <School className="w-4 h-4" />
                    <span className="text-sm">College</span>
                  </div>
                  <p className="font-semibold">{validationResult.registration.college}</p>
                </div>
              </div>

              {/* Events */}
              {validationResult.registration.events && 
                validationResult.registration.events.length > 0 && (
                <div>
                  <p className="text-gray-400 text-sm mb-2">Registered Events</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {validationResult.registration.events.map((event, index) => (
                      <div key={index} className="bg-slate-700/50 p-4 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-cyan-400" />
                          <span>{event.name}</span>
                        </div>
                        <p className="text-sm text-gray-400 mt-1">{event.type}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Workshops */}
              {validationResult.registration.workshops && 
                validationResult.registration.workshops.length > 0 && (
                <div>
                  <p className="text-gray-400 text-sm mb-2">Registered Workshops</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {validationResult.registration.workshops.map((workshop, index) => (
                      <div key={index} className="bg-slate-700/50 p-4 rounded-lg">
                        <div className="flex items-center gap-2">
                          <School className="w-4 h-4 text-purple-400" />
                          <span>{workshop.name}</span>
                        </div>
                        <p className="text-sm text-gray-400 mt-1">Workshop</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Check-in Time */}
              <div className="bg-slate-700/30 p-4 rounded-lg">
                <div className="flex items-center gap-2 text-gray-300 mb-2">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm">Check-in Time</span>
                </div>
                <p className="font-semibold">
                  {new Date().toLocaleTimeString()}
                </p>
              </div>

              {/* Scan Another Button */}
              <div className="flex justify-end">
                <button
                  onClick={resetScanner}
                  className="flex items-center gap-2 px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600"
                >
                  <RefreshCw className="w-4 h-4" />
                  Scan Another
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="mt-8 bg-red-500/10 rounded-lg p-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-8 h-8 text-red-500" />
              <div>
                <h3 className="text-xl font-bold text-red-400">Validation Failed</h3>
                <p className="text-sm text-red-200/60">{error}</p>
              </div>
            </div>
            <div className="flex justify-end mt-6">
              <button
                onClick={resetScanner}
                className="flex items-center gap-2 px-4 py-2 bg-red-500/20 rounded-lg hover:bg-red-500/30"
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QRScanner;