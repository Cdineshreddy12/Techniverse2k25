import React, { useState, useEffect } from 'react';
import QRScanner from './QrScanner.jsx';
import { 
  Check, X, AlertCircle, Calendar, 
  UserCheck, Loader, CheckCircle,
  Clock, Users, Tag, Coins,
  ChevronLeft, Search
} from 'lucide-react';

function ValidateInterface() {
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [validationResult, setValidationResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentStep, setCurrentStep] = useState('select'); // 'select', 'scan', 'result'

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    const filtered = events.filter(event => 
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.tag?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.departments?.some(dept => 
        dept.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
    setFilteredEvents(filtered);
  }, [searchQuery, events]);

  const fetchEvents = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_APP_BACKEND_URL}/api/events`);
      const data = await response.json();
      setEvents(data.events);
      setFilteredEvents(data.events);
    } catch (error) {
      setError('Failed to fetch events');
    }
  };

  const handleQRScan = async (qrData) => {
    if (!selectedEvent) {
      setError('Please select an event first');
      return;
    }

    setLoading(true);
    try {
      const validateResponse = await fetch(
        `${import.meta.env.VITE_APP_BACKEND_URL}/api/validate-registration`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ qrData, eventId: selectedEvent._id })
        }
      );
      
      const validationData = await validateResponse.json();
      
      if (validationData.success) {
        const checkInResponse = await fetch(
          `${import.meta.env.VITE_APP_BACKEND_URL}/api/check-in`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ qrData, eventId: selectedEvent._id })
          }
        );
        
        const checkInData = await checkInResponse.json();
        setValidationResult(checkInData);
      } else {
        setValidationResult(validationData);
      }
      setCurrentStep('result');
    } catch (error) {
      setValidationResult({
        success: false,
        message: 'Operation failed: ' + error.message
      });
      setCurrentStep('result');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setValidationResult(null);
    setSelectedEvent(null);
    setCurrentStep('select');
  };

  const handleBackButton = () => {
    switch (currentStep) {
      case 'scan':
        setSelectedEvent(null);
        setCurrentStep('select');
        break;
      case 'result':
        setValidationResult(null);
        setCurrentStep('scan');
        break;
      default:
        break;
    }
  };

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

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h2 className="text-2xl text-white font-bold mb-6">Event Check-in</h2>
      
      {/* Event Selection Step */}
      {currentStep === 'select' && (
        <div className="mb-6">
          <div className="mb-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full p-3 pl-10 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
              />
              <Search className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {filteredEvents.map((event) => (
              <button
                key={event._id}
                onClick={() => {
                  setSelectedEvent(event);
                  setCurrentStep('scan');
                  setError(null);
                }}
                className="p-4 rounded-lg text-left transition-colors bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700"
              >
                {/* Event card content remains the same */}
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h4 className="font-medium text-lg">{event.title}</h4>
                      <div className="flex items-center gap-2 text-sm text-slate-400 mt-1">
                        <Tag className="w-4 h-4" />
                        <span>{event.tag}</span>
                      </div>
                    </div>
                    {event.registrationType === 'team' && (
                      <span className="px-2 py-1 bg-slate-700 text-slate-300 rounded text-xs">
                        Team Event
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center gap-2 text-slate-400">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(event.startTime)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-400">
                      <Clock className="w-4 h-4" />
                      <span>{formatTime(event.startTime)}</span>
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
        <div className="fixed inset-0 bg-slate-900 z-50 p-4">
          <div className="max-w-2xl mx-auto">
            <button
              onClick={handleBackButton}
              className="mb-4 text-slate-400 hover:text-white transition-colors flex items-center gap-2"
            >
              <ChevronLeft className="w-5 h-5" />
              <span>Back to Events</span>
            </button>

            <div className="bg-slate-800 p-4 rounded-lg">
              <h4 className="text-white font-medium mb-2">Scanning for: {selectedEvent.title}</h4>
              <p className="text-sm text-slate-400 mb-4">
                Confirm check-in by scanning participant's QR code
              </p>
              <QRScanner onScanSuccess={handleQRScan} />
            </div>
          </div>
        </div>
      )}

      {/* Results Step */}
      {currentStep === 'result' && (
        <div className="fixed inset-0 bg-slate-900 z-50 p-4">
          <div className="max-w-2xl mx-auto">
            <button
              onClick={handleBackButton}
              className="mb-4 text-slate-400 hover:text-white transition-colors flex items-center gap-2"
            >
              <ChevronLeft className="w-5 h-5" />
              <span>Back to Scanner</span>
            </button>

            <div className={`p-6 rounded-lg ${
              validationResult.success ? 'bg-green-900/30 border border-green-500/50' : 'bg-red-900/30 border border-red-500/50'
            }`}>
              {validationResult.success ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-green-400">
                    <CheckCircle className="w-6 h-6" />
                    <p className="text-lg font-medium">Check-in Successful</p>
                  </div>
                  
                  <div className="space-y-2 text-gray-300">
                    <p>
                      <span className="text-gray-400">Name:</span> {validationResult.details.name}
                    </p>
                    <p>
                      <span className="text-gray-400">Event:</span> {validationResult.details.event}
                    </p>
                    <p className="text-sm text-gray-400">
                      Checked in at: {new Date(validationResult.details.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-red-400">
                  <AlertCircle className="w-6 h-6" />
                  <p className="text-lg">{validationResult.message}</p>
                </div>
              )}
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
  );
}

export default ValidateInterface;