import React, { useState, useEffect } from 'react';
import QRScanner from './QrScanner.jsx';
import { 
  Check, X, AlertCircle, Calendar, 
  UserCheck, Loader, CheckCircle,
  Clock, Users, Tag, Coins,
  ChevronLeft
} from 'lucide-react';

function ValidateInterface() {
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [events, setEvents] = useState([]);
  const [validationResult, setValidationResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_APP_BACKEND_URL}/api/events`);
      const data = await response.json();
      setEvents(data.events);
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
      // First step: Validate registration
      const validateResponse = await fetch(
        `${import.meta.env.VITE_APP_BACKEND_URL}/api/validate-registration`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            qrData,
            eventId: selectedEvent._id 
          })
        }
      );
      
      const validationData = await validateResponse.json();
      
      if (validationData.success) {
        // Second step: Complete check-in
        const checkInResponse = await fetch(
          `${import.meta.env.VITE_APP_BACKEND_URL}/api/check-in`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              qrData,
              eventId: selectedEvent._id 
            })
          }
        );
        
        const checkInData = await checkInResponse.json();
        setValidationResult(checkInData);
      } else {
        setValidationResult(validationData);
      }
      
      // Return to event selection after scan result
      setSelectedEvent(null);
    } catch (error) {
      setValidationResult({
        success: false,
        message: 'Operation failed: ' + error.message
      });
      // Return to event selection on error
      setSelectedEvent(null);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setValidationResult(null);
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
      
      {/* Event Selection - Show when no event is selected */}
      {!selectedEvent && (
        <div className="mb-6">
          <h3 className="text-lg text-white mb-3">Select Event</h3>
          <div className="grid grid-cols-1 gap-3">
            {events.map((event) => (
              <button
                key={event._id}
                onClick={() => {
                  setSelectedEvent(event);
                  setValidationResult(null);
                  setError(null);
                }}
                className="p-4 rounded-lg text-left transition-colors bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700"
              >
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
                    <div className="flex items-center gap-2 text-slate-400">
                      <Users className="w-4 h-4" />
                      <span>{event.registrationCount} / {event.maxRegistrations}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-400">
                      <Coins className="w-4 h-4" />
                      <span>₹{event.registrationFee}</span>
                    </div>
                  </div>

                  {event.departments?.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {event.departments.map((dept) => (
                        <span 
                          key={dept._id}
                          className="px-2 py-1 bg-slate-700/50 rounded-full text-xs text-slate-300"
                        >
                          {dept.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-3 bg-red-500/20 text-red-200 rounded-lg">
          {error}
        </div>
      )}
      
      {/* QR Scanner - Show only when event is selected */}
      {selectedEvent && !validationResult && (
        <div className="mb-8">
          <div className="bg-slate-800 p-4 rounded-lg">
            <div className="mb-3 pb-3 border-b border-slate-700">
              <div className="flex items-center justify-between mb-2">
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="text-slate-400 hover:text-white transition-colors flex items-center gap-2"
                >
                  <ChevronLeft className="w-5 h-5" />
                  <span>Back to Events</span>
                </button>
              </div>
              <h4 className="text-white font-medium">Scanning for: {selectedEvent.title}</h4>
              <p className="text-sm text-slate-400 mt-1">
                Confirm check-in for this event by scanning participant's QR code
              </p>
            </div>
            <QRScanner onScanSuccess={handleQRScan} />
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-4">
          <Loader className="w-8 h-8 animate-spin mx-auto text-cyan-500" />
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
                <Check className="w-5 h-5" />
                <p className="font-medium">Check-in Successful</p>
              </div>
              
              <div className="text-gray-300">
                <p className="mb-2">
                  <span className="text-gray-400">Name:</span> {validationResult.details.name}
                </p>
                <p className="mb-2">
                  <span className="text-gray-400">Event:</span> {validationResult.details.event}
                </p>
                <p className="text-sm text-gray-400">
                  Checked in at: {new Date(validationResult.details.timestamp).toLocaleString()}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-red-400">
              <AlertCircle className="w-5 h-5" />
              <p>{validationResult.message}</p>
            </div>
          )}
        </div>
      )}

      {/* Reset Button */}
      {validationResult && !loading && (
        <button
          onClick={handleReset}
          className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
        >
          <UserCheck className="w-5 h-5" />
          Check in Another Participant
        </button>
      )}
    </div>
  );
}

export default ValidateInterface;