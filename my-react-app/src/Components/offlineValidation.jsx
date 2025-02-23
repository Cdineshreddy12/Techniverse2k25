import React, { useState, useEffect } from 'react';
import { QrCode, CheckCircle, X, Search, ChevronLeft, Calendar, Clock, Tag, AlertCircle, UserCheck, Loader, ClipboardCheck } from 'lucide-react';
import QRScanner from '../Components/EventValidation/QrScanner.jsx';
import API_CONFIG from '../config/api.js';
import {useApi} from '../config/useApi.js';
import { makeOfflineRequest } from '../config/offlineAPI.js';
import { offlineEndpoints } from '../config/offlineAPI.js';
const OfflineValidation = () => {
  const [selectedType, setSelectedType] = useState('event');
  const [events, setEvents] = useState([]);
  const [workshops, setWorkshops] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [lastCheckIn, setLastCheckIn] = useState(null);
  const [scannedData, setScannedData] = useState(null);
  const [currentStep, setCurrentStep] = useState('select');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [filteredItems, setFilteredItems] = useState([]);
  const [validationMethod, setValidationMethod] = useState(null);
  const [manualCode, setManualCode] = useState('');
  const api = useApi();
  useEffect(() => {
    const fetchItems = async () => {
      try {
        // Ensure coordinator info is set first
        await api.detectCoordinator();
        
        const [eventsRes, workshopsRes] = await Promise.all([
          makeOfflineRequest(api, offlineEndpoints.getEvents),
          makeOfflineRequest(api, offlineEndpoints.getWorkshops)
        ]);
        
        setEvents(eventsRes.events || []);
        setWorkshops(workshopsRes.workshops || []);
        setFilteredItems(selectedType === 'event' ? eventsRes.events : workshopsRes.workshops);
      } catch (error) {
        setError('Failed to fetch items. Please try again.');
      }
    };
  
    if (api?.isAuthenticated) {
      fetchItems();
    }
  }, [api, selectedType]);


  useEffect(() => {
    const items = selectedType === 'event' ? events : workshops;
    const filtered = items.filter(item => 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.tag && item.tag.toLowerCase().includes(searchQuery.toLowerCase()))
    );
    setFilteredItems(filtered);
  }, [searchQuery, selectedType, events, workshops]);

  const handleScanSuccess = async (qrData) => {
    if (!selectedItem) {
      setError('Please select an item first');
      return;
    }

    await processCheckIn(qrData, 'qr');
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    if (!manualCode.trim()) {
      setError('Please enter a receipt number');
      return;
    }

    // For manual validation, just pass the receipt number directly
    await processCheckIn(manualCode.trim(), 'manual');
  };

  const processCheckIn = async (qrData, method = 'qr') => {
    setLoading(true);
    setError('');
    try {
      const validationData = await makeOfflineRequest(api, offlineEndpoints.checkIn, {
        method: 'POST',
        body: JSON.stringify({
          qrData,
          itemId: selectedItem._id,
          type: selectedType,
          verifiedBy: localStorage.getItem('coordinatorName'),
          validationMethod: method
        })
      });

      if (validationData.success) {
        setSuccess('Check-in successful!');
        setLastCheckIn(validationData.checkIn);
        setCurrentStep('result');
        setManualCode('');
      } else {
        setError(validationData.error || 'Check-in failed');
      }
    } catch (error) {
      setError(error.message || 'Check-in failed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initialize = async () => {
      try {
        // Ensure coordinator info is set
        await api.detectCoordinator();
        
        const [eventsRes, workshopsRes] = await Promise.all([
          makeOfflineRequest(api, offlineEndpoints.getEvents),
          makeOfflineRequest(api, offlineEndpoints.getWorkshops)
        ]);

        setEvents(eventsRes.events || []);
        setWorkshops(workshopsRes.workshops || []);
        setFilteredItems(selectedType === 'event' ? eventsRes.events : workshopsRes.workshops);
      } catch (error) {
        setError('Failed to fetch items. Please try again.');
      }
    };

    if (api?.isAuthenticated) {
      initialize();
    }
  }, [api]);


  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleReset = () => {
    setScannedData(null);
    setSelectedItem(null);
    setCurrentStep('select');
    setError('');
    setSuccess('');
    setManualCode('');
    setValidationMethod(null);
  };

  const handleBack = () => {
    switch (currentStep) {
      case 'scan':
        if (validationMethod) {
          setValidationMethod(null);
        } else {
          setSelectedItem(null);
          setCurrentStep('select');
        }
        break;
      case 'result':
        setCurrentStep('scan');
        break;
      default:
        break;
    }
    setError('');
  };

  if (!api?.isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Authentication Required</h1>
          <p className="text-gray-400 mb-4">Please login to access check-in validation.</p>
          <button
            onClick={() => api?.login()}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Login
          </button>
        </div>
      </div>
    );
  }

  const ValidationMethodSelector = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Choose Validation Method</h3>
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => setValidationMethod('qr')}
          className="p-6 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors flex flex-col items-center gap-3"
        >
          <QrCode className="w-8 h-8 text-blue-400" />
          <span>Scan QR Code</span>
        </button>
        <button
          onClick={() => setValidationMethod('manual')}
          className="p-6 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors flex flex-col items-center gap-3"
        >
          <ClipboardCheck className="w-8 h-8 text-green-400" />
          <span>Manual Entry</span>
        </button>
      </div>
    </div>
  );

  const ManualEntryForm = () => (
    <form onSubmit={handleManualSubmit} className="space-y-4">
      <div>
        <label htmlFor="receiptNumber" className="block text-sm font-medium text-slate-300 mb-2">
          Receipt Number
        </label>
        <input
          type="text"
          id="receiptNumber"
          value={manualCode}
          onChange={(e) => setManualCode(e.target.value.toUpperCase())}
          placeholder="Enter receipt number (e.g., OFF-1234AB)"
          className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
        />
      </div>
      <button
        type="submit"
        className="w-full p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        Validate Check-in
      </button>
    </form>
  );

  return (
    <div className="min-h-screen mt-16 bg-slate-900 text-white">
      <div className="max-w-2xl mx-auto p-4">
        <h2 className="text-2xl font-bold mb-6">Check-in Validation</h2>

        {/* Selection Step */}
        {currentStep === 'select' && (
          <div className="space-y-6">
            <div className="flex gap-4">
              <button
                onClick={() => {
                  setSelectedType('event');
                  setFilteredItems(events);
                }}
                className={`flex-1 p-3 rounded transition-colors ${
                  selectedType === 'event'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                Events
              </button>
              <button
                onClick={() => {
                  setSelectedType('workshop');
                  setFilteredItems(workshops);
                }}
                className={`flex-1 p-3 rounded transition-colors ${
                  selectedType === 'workshop'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                Workshops
              </button>
            </div>

            <div className="relative">
              <input
                type="text"
                placeholder={`Search ${selectedType}s...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full p-3 pl-10 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
              />
              <Search className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
            </div>

            <div className="grid grid-cols-1 gap-3">
              {filteredItems.map((item) => (
                <button
                  key={item._id}
                  onClick={() => {
                    setSelectedItem(item);
                    setCurrentStep('scan');
                    setError('');
                  }}
                  className="p-4 rounded-lg text-left transition-colors bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h4 className="font-medium text-lg">{item.title}</h4>
                        {item.tag && (
                          <div className="flex items-center gap-2 text-sm text-slate-400 mt-1">
                            <Tag className="w-4 h-4" />
                            <span>{item.tag}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex items-center gap-2 text-slate-400">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(item.startTime)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-400">
                        <Clock className="w-4 h-4" />
                        <span>{formatTime(item.startTime)}</span>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Scanning Step */}
        {currentStep === 'scan' && (
          <div className="fixed inset-0 bg-slate-900 z-50">
            <div className="max-w-2xl mx-auto h-full flex flex-col p-4">
              <div className="mb-4">
                <button
                  onClick={handleBack}
                  className="mb-2 text-slate-400 hover:text-white transition-colors flex items-center gap-2"
                >
                  <ChevronLeft className="w-5 h-5" />
                  <span>Back</span>
                </button>
                <h4 className="text-white font-medium text-lg">
                  Checking in for: {selectedItem?.title}
                </h4>
              </div>

              <div className="flex-1 flex flex-col">
                {!validationMethod ? (
                  <ValidationMethodSelector />
                ) : (
                  <div className="flex-1 bg-slate-800 p-4 rounded-lg">
                    {validationMethod === 'qr' ? (
                      <QRScanner onScanSuccess={handleScanSuccess} />
                    ) : (
                      <ManualEntryForm />
                    )}
                  </div>
                )}

                {error && (
                  <div className="mt-4 p-4 bg-red-900/30 border border-red-500/50 rounded-lg flex items-center gap-3">
                    <AlertCircle className="w-6 h-6 text-red-400 flex-shrink-0" />
                    <p className="text-red-400">{error}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Result Step */}
        {currentStep === 'result' && lastCheckIn && (
          <div className="fixed inset-0 bg-slate-900 z-50 p-4">
            <div className="max-w-2xl mx-auto">
              <button
                onClick={handleBack}
                className="mb-4 text-slate-400 hover:text-white transition-colors flex items-center gap-2"
              >
                <ChevronLeft className="w-5 h-5" />
                <span>Back to Scanner</span>
              </button>

              <div className="p-6 rounded-lg bg-green-900/30 border border-green-500/50">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-green-400">
                    <CheckCircle className="w-6 h-6" />
                    <p className="text-lg font-medium">Check-in Successful</p>
                  </div>
                  
                  <div className="space-y-2 text-gray-300">
                    <p>
                      <span className="text-gray-400">Name:</span> {lastCheckIn.studentName}
                    </p>
                    <p>
                      <span className="text-gray-400">Student ID:</span> {lastCheckIn.studentId}
                    </p>
                    <p>
                      <span className="text-gray-400">Receipt:</span> {lastCheckIn.receiptNumber}
                    </p>
                    <p className="text-sm text-gray-400">
                      Checked in at: {new Date(lastCheckIn.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={handleReset}
                className="w-full mt-4 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                <UserCheck className="w-5 h-5" />
                Check in Another Participant
              </button>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="fixed inset-0 bg-slate-900/80 flex items-center justify-center z-50">
            <div className="text-center">
              <Loader className="w-8 h-8 animate-spin mx-auto text-cyan-500" />
              <p className="text-gray-300 mt-2">Processing check-in...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OfflineValidation;