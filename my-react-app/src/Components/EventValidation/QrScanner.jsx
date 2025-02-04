import React, { useState } from 'react';
import { useZxing } from "react-zxing";

const QRScanner = ({ onScanSuccess }) => {
  const [error, setError] = useState('');
  const [lastScannedData, setLastScannedData] = useState(null);

  const { ref } = useZxing({
    onDecodeResult(result) {
      const scannedData = result.getText();
      console.log('Scanned data:', scannedData);
      setLastScannedData(scannedData);

      try {
        // Validate JSON format
        const parsed = JSON.parse(scannedData);
        onScanSuccess(scannedData);
      } catch (err) {
        setError('Invalid QR code format: Not valid JSON');
      }
    },
    onError(err) {
      console.error('Scan error:', err);
      setError(`Scanner error: ${err?.message || 'Unknown error'}`);
    },
  });

  return (
    <div className="qr-scanner-container">
      {error && (
        <div className="mb-4 p-3 bg-red-500/20 text-red-200 rounded-lg">
          {error}
        </div>
      )}

      <div className="relative w-full max-w-md mx-auto">
        <div className="aspect-square rounded-lg overflow-hidden bg-slate-900">
          <video
            ref={ref}
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className="overlay absolute inset-0 pointer-events-none">
          <div className="scanning-area border-2 border-cyan-400 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2/3 h-2/3 rounded-lg" />
        </div>
      </div>

      <div className="space-y-2 mt-4">
        <p className="text-center text-sm text-gray-400">
          Position QR code within the frame to scan
        </p>
        {lastScannedData && (
          <p className="text-center text-xs text-gray-500">
            Last scanned: {lastScannedData.substring(0, 50)}...
          </p>
        )}
      </div>
    </div>
  );
};

export default QRScanner;