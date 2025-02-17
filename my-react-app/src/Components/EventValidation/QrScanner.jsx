import React, { useState, useEffect } from 'react';
import { useZxing } from "react-zxing";
import { Camera, CameraOff } from 'lucide-react';

const QRScanner = ({ onScanSuccess }) => {
  const [error, setError] = useState('');
  const [lastScannedData, setLastScannedData] = useState(null);
  const [lastScanTime, setLastScanTime] = useState(0);
  const [isCameraActive, setIsCameraActive] = useState(true);
  const SCAN_DELAY = 2000; // 2 seconds delay between scans

  const { ref } = useZxing({
    paused: !isCameraActive,
    onDecodeResult(result) {
      const currentTime = Date.now();
      if (currentTime - lastScanTime < SCAN_DELAY) {
        return; // Ignore scan if it's too soon after the last one
      }

      const scannedData = result.getText();
      setLastScanTime(currentTime);
      setLastScannedData(scannedData);

      try {
        // Validate JSON format
        JSON.parse(scannedData); 
        setError(''); // Clear any previous errors
        onScanSuccess(scannedData);
      } catch (err) {
        setError('Invalid QR code format: Not valid JSON');
      }
    },
    onError(err) {
      // Only set error if it's not a typical scanning error
      if (!err.message.includes('No MultiFormat Readers were able to detect the code.')) {
        console.error('Scan error:', err);
        setError(`Scanner error: ${err?.message || 'Unknown error'}`);
      }
    },
  });

  // Clean up error message after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  return (
    <div className="qr-scanner-container">
      {error && (
        <div className="mb-4 p-3 bg-red-500/20 text-red-200 rounded-lg">
          {error}
        </div>
      )}

      <div className="relative w-full max-w-md mx-auto">
        <button
          onClick={() => setIsCameraActive(!isCameraActive)}
          className="absolute top-2 right-2 z-10 p-2 bg-slate-800 rounded-full text-white hover:bg-slate-700 transition-colors"
        >
          {isCameraActive ? <CameraOff size={20} /> : <Camera size={20} />}
        </button>

        <div className="aspect-square rounded-lg overflow-hidden bg-slate-900">
          {isCameraActive ? (
            <video
              ref={ref}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-500">
              Camera is off
            </div>
          )}
        </div>
        
        {isCameraActive && (
          <div className="overlay absolute inset-0 pointer-events-none">
            <div className="scanning-area border-2 border-cyan-400 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2/3 h-2/3 rounded-lg">
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-cyan-400 animate-scan" />
            </div>
          </div>
        )}
      </div>

      <div className="space-y-2 mt-4">
        <p className="text-center text-sm text-gray-400">
          {isCameraActive ? 'Position QR code within the frame to scan' : 'Camera is currently disabled'}
        </p>
        {lastScannedData && (
          <p className="text-center text-xs text-gray-500">
            Last scanned: {new Date(lastScanTime).toLocaleTimeString()}
          </p>
        )}
      </div>

      <style jsx>{`
        @keyframes scan {
          0% { transform: translateY(0); }
          50% { transform: translateY(100%); }
          100% { transform: translateY(0); }
        }
        .animate-scan {
          animation: scan 2s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default QRScanner;