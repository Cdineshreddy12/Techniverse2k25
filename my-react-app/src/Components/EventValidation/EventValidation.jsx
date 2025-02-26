import React, { useState, useEffect } from 'react';
import QRScanner from './QrScanner.jsx';
import { 
  Check, X, AlertCircle, Calendar, 
  UserCheck, Loader, CheckCircle,
  Clock, Users, Tag, Coins,
  ChevronLeft, Search, Book,
  Bookmark, MapPin
} from 'lucide-react';

function ValidateInterface() {
  const [selectedItem, setSelectedItem] = useState(null);
  const [itemType, setItemType] = useState(null); // 'event' or 'workshop'
  const [events, setEvents] = useState([]);
  const [workshops, setWorkshops] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [validationResult, setValidationResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentStep, setCurrentStep] = useState('select'); // 'select', 'scan', 'result'
  const [currentTab, setCurrentTab] = useState('events'); // 'events' or 'workshops'

  useEffect(() => {
    fetchEvents();
    fetchWorkshops();
  }, []);

  useEffect(() => {
    if (currentTab === 'events') {
      const filtered = events.filter(event => 
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.tag?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.departments?.some(dept => 
          dept.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
      setFilteredItems(filtered);
    } else {
      const filtered = workshops.filter(workshop => 
        workshop.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        workshop.instructor?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        workshop.venue?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredItems(filtered);
    }
  }, [searchQuery, events, workshops, currentTab]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching events from:', `${import.meta.env.VITE_APP_BACKEND_URL}/api/events`);
      
      const response = await fetch(`${import.meta.env.VITE_APP_BACKEND_URL}/api/events`);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error fetching events: ${response.status} ${errorText}`);
      }
      
      const data = await response.json();
      console.log('Received events:', data);
      
      if (!data.events || !Array.isArray(data.events)) {
        throw new Error('Invalid response format: events array not found');
      }
      
      setEvents(data.events);
      if (currentTab === 'events') {
        setFilteredItems(data.events);
      }
    } catch (error) {
      console.error('Failed to fetch events:', error);
      setError(`Failed to fetch events: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchWorkshops = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_APP_BACKEND_URL}/api/workshops`);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error fetching workshops: ${response.status} ${errorText}`);
      }
      
      const data = await response.json();
      console.log('Received workshops:', data);
      
      if (!data.workshops || !Array.isArray(data.workshops)) {
        throw new Error('Invalid response format: workshops array not found');
      }
      
      setWorkshops(data.workshops);
      if (currentTab === 'workshops') {
        setFilteredItems(data.workshops);
      }
    } catch (error) {
      console.error('Failed to fetch workshops:', error);
      if (!error.message.includes('events')) { // Don't overwrite event errors
        setError(`Failed to fetch workshops: ${error.message}`);
      }
    }
  };

  const handleQRScan = async (qrData) => {
    if (!selectedItem) {
      setError('Please select an item first');
      return;
    }

    setLoading(true);
    try {
      if (itemType === 'event') {
        await processEventQRScan(qrData);
      } else if (itemType === 'workshop') {
        await processWorkshopQRScan(qrData);
      }
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

  const processEventQRScan = async (qrData) => {
    // Validate event registration first
    const validateResponse = await fetch(
      `${import.meta.env.VITE_APP_BACKEND_URL}/api/validate-registration`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qrData, eventId: selectedItem._id })
      }
    );
    
    const validationData = await validateResponse.json();
    
    if (validationData.success) {
      // Then check in if validation succeeds
      const checkInResponse = await fetch(
        `${import.meta.env.VITE_APP_BACKEND_URL}/api/check-in`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ qrData, eventId: selectedItem._id })
        }
      );
      
      const checkInData = await checkInResponse.json();
      setValidationResult(checkInData);
    } else {
      setValidationResult(validationData);
    }
    setCurrentStep('result');
  };

  const processWorkshopQRScan = async (qrData) => {
    // Validate workshop registration first
    const validateResponse = await fetch(
      `${import.meta.env.VITE_APP_BACKEND_URL}/api/validate-workshop-registration`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qrData, workshopId: selectedItem._id })
      }
    );
    
    const validationData = await validateResponse.json();
    
    if (validationData.success) {
      // Then check in if validation succeeds
      const checkInResponse = await fetch(
        `${import.meta.env.VITE_APP_BACKEND_URL}/api/workshop-check-in`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ qrData, workshopId: selectedItem._id })
        }
      );
      
      const checkInData = await checkInResponse.json();
      setValidationResult(checkInData);
    } else {
      setValidationResult(validationData);
    }
    setCurrentStep('result');
  };

  const handleTabChange = (tab) => {
    setCurrentTab(tab);
    setSearchQuery('');
    setError(null);
  };

  const handleReset = () => {
    setValidationResult(null);
    setSelectedItem(null);
    setItemType(null);
    setCurrentStep('select');
  };

  const handleBackButton = () => {
    switch (currentStep) {
      case 'scan':
        setSelectedItem(null);
        setItemType(null);
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
      <h2 className="text-2xl text-white font-bold mb-6">Event & Workshop Check-in</h2>
      
      {/* Item Selection Step */}
      {currentStep === 'select' && (
        <div className="mb-6">
          {/* Tabs */}
          <div className="flex border-b border-slate-700 mb-4">
            <button
              onClick={() => handleTabChange('events')}
              className={`py-2 px-4 ${currentTab === 'events' 
                ? 'text-blue-400 border-b-2 border-blue-400' 
                : 'text-slate-400 hover:text-white'}`}
            >
              Events
            </button>
            <button
              onClick={() => handleTabChange('workshops')}
              className={`py-2 px-4 ${currentTab === 'workshops' 
                ? 'text-blue-400 border-b-2 border-blue-400' 
                : 'text-slate-400 hover:text-white'}`}
            >
              Workshops
            </button>
          </div>

          {/* Error message */}
          {error && (
            <div className="p-3 mb-4 rounded-lg bg-red-900/30 border border-red-500/50 text-red-400">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                <span>{error}</span>
              </div>
            </div>
          )}

          {/* Loading state */}
          {loading && filteredItems.length === 0 && (
            <div className="p-8 text-center">
              <Loader className="w-8 h-8 animate-spin mx-auto text-blue-500 mb-2" />
              <p className="text-slate-400">Loading {currentTab}...</p>
            </div>
          )}

          {/* Search input */}
          <div className="mb-4">
            <div className="relative">
              <input
                type="text"
                placeholder={`Search ${currentTab}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full p-3 pl-10 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
              />
              <Search className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
            </div>
          </div>

          {/* Refresh button */}
          <div className="flex justify-end mb-4">
            <button
              onClick={() => currentTab === 'events' ? fetchEvents() : fetchWorkshops()}
              className="text-sm bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1 rounded flex items-center gap-1"
              disabled={loading}
            >
              {loading ? <Loader className="w-3 h-3 animate-spin" /> : <span>↻</span>}
              Refresh {currentTab}
            </button>
          </div>

          {/* Items list */}
          <div className="grid grid-cols-1 gap-3">
            {filteredItems.length === 0 && !loading && (
              <div className="p-4 text-center text-slate-400 border border-dashed border-slate-700 rounded-lg">
                {searchQuery 
                  ? `No ${currentTab} found matching "${searchQuery}"`
                  : `No ${currentTab} available. Try refreshing.`}
              </div>
            )}
            
            {currentTab === 'events' && filteredItems.map((event) => (
              <button
                key={event._id}
                onClick={() => {
                  setSelectedItem(event);
                  setItemType('event');
                  setCurrentStep('scan');
                  setError(null);
                }}
                className="p-4 rounded-lg text-left transition-colors bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700"
              >
                {/* Event card content */}
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
                      <span>{formatDate(event.startTime || event.date)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-400">
                      <Clock className="w-4 h-4" />
                      <span>{formatTime(event.startTime || event.date)}</span>
                    </div>
                  </div>
                </div>
              </button>
            ))}

            {currentTab === 'workshops' && filteredItems.map((workshop) => (
              <button
                key={workshop._id}
                onClick={() => {
                  setSelectedItem(workshop);
                  setItemType('workshop');
                  setCurrentStep('scan');
                  setError(null);
                }}
                className="p-4 rounded-lg text-left transition-colors bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700"
              >
                {/* Workshop card content */}
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h4 className="font-medium text-lg">{workshop.title}</h4>
                      <div className="flex items-center gap-2 text-sm text-slate-400 mt-1">
                        <Book className="w-4 h-4" />
                        <span>{workshop.instructor || 'Instructor TBA'}</span>
                      </div>
                    </div>
                    <span className="px-2 py-1 bg-blue-800/50 text-blue-300 rounded text-xs">
                      Workshop
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center gap-2 text-slate-400">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(workshop.date)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-400">
                      <MapPin className="w-4 h-4" />
                      <span>{workshop.venue || 'TBA'}</span>
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
            {/* Header */}
            <div className="mb-4">
              <button
                onClick={handleBackButton}
                className="mb-2 text-slate-400 hover:text-white transition-colors flex items-center gap-2"
              >
                <ChevronLeft className="w-5 h-5" />
                <span>Back to {currentTab === 'events' ? 'Events' : 'Workshops'}</span>
              </button>
              <h4 className="text-white font-medium text-lg">
                Scanning for: {selectedItem.title}
                <span className="ml-2 px-2 py-0.5 bg-slate-800 text-slate-300 rounded text-xs">
                  {itemType === 'event' ? 'Event' : 'Workshop'}
                </span>
              </h4>
              <p className="text-sm text-slate-400">
                Confirm check-in by scanning participant's QR code
              </p>
            </div>

            {/* Results display at top */}
            {validationResult && (
              <div className={`mb-4 p-4 rounded-lg ${
                validationResult.success 
                  ? 'bg-green-900/30 border border-green-500/50' 
                  : 'bg-red-900/30 border border-red-500/50'
              }`}>
                {validationResult.success ? (
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0" />
                    <div>
                      <p className="text-green-400 font-medium">Check-in Successful</p>
                      <p className="text-gray-300 text-sm mt-1">
                        {validationResult.details?.name || validationResult.registration?.name}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <AlertCircle className="w-6 h-6 text-red-400 flex-shrink-0" />
                    <p className="text-red-400">{validationResult.message}</p>
                  </div>
                )}
              </div>
            )}

            {/* Scanner */}
            <div className="bg-slate-800 p-4 rounded-lg flex-1">
              <QRScanner onScanSuccess={handleQRScan} />
            </div>

            {/* Bottom Actions */}
            {validationResult && (
              <div className="mt-4">
                <button
                  onClick={() => setValidationResult(null)}
                  className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  <UserCheck className="w-5 h-5" />
                  Scan Next Participant
                </button>
              </div>
            )}
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
                <div className="space-y-6">
                  <div className="flex items-center gap-2 text-green-400">
                    <CheckCircle className="w-6 h-6" />
                    <p className="text-lg font-medium">Check-in Successful</p>
                  </div>
                  
                  {/* Student Details */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <h3 className="text-gray-400 text-sm font-medium uppercase">Student Details</h3>
                      <div className="grid grid-cols-2 gap-3 text-gray-300">
                        <p><span className="text-gray-400">Name:</span> {validationResult.details?.name || 'N/A'}</p>
                        <p><span className="text-gray-400">Student ID:</span> {validationResult.details?.studentId || 'N/A'}</p>
                        <p><span className="text-gray-400">Email:</span> {validationResult.details?.email || 'N/A'}</p>
                        <p><span className="text-gray-400">Mobile:</span> {validationResult.details?.mobileNumber || 'N/A'}</p>
                      </div>
                    </div>

                    {/* Item Details (Event or Workshop) */}
                    <div className="space-y-2">
                      <h3 className="text-gray-400 text-sm font-medium uppercase">
                        {validationResult.isWorkshop ? 'Workshop Details' : 'Event Details'}
                      </h3>
                      <div className="grid grid-cols-2 gap-3 text-gray-300">
                        {validationResult.isWorkshop ? (
                          // Workshop Details
                          <>
                            <p><span className="text-gray-400">Workshop:</span> {validationResult.details?.workshopDetails?.name || 'N/A'}</p>
                            <p><span className="text-gray-400">Instructor:</span> {validationResult.details?.workshopDetails?.instructor || 'N/A'}</p>
                            <p><span className="text-gray-400">Date:</span> {
                              validationResult.details?.workshopDetails?.date ? 
                              formatDate(validationResult.details.workshopDetails.date) : 'N/A'
                            }</p>
                            <p><span className="text-gray-400">Venue:</span> {validationResult.details?.workshopDetails?.venue || 'N/A'}</p>
                          </>
                        ) : (
                          // Event Details
                          <>
                            <p><span className="text-gray-400">Event:</span> {validationResult.details?.eventDetails?.name || 'N/A'}</p>
                            <p><span className="text-gray-400">Tag:</span> {validationResult.details?.eventDetails?.tag || 'N/A'}</p>
                            <p><span className="text-gray-400">Date:</span> {
                              validationResult.details?.eventDetails?.date ? 
                              formatDate(validationResult.details.eventDetails.date) : 'N/A'
                            }</p>
                            <p><span className="text-gray-400">Type:</span> {validationResult.details?.eventDetails?.registrationType || 'Individual'}</p>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Registration Details */}
                    <div className="space-y-2">
                      <h3 className="text-gray-400 text-sm font-medium uppercase">Registration Details</h3>
                      <div className="grid grid-cols-2 gap-3 text-gray-300">
                        <p><span className="text-gray-400">Registration ID:</span> {validationResult.details?.registration?.id || 'N/A'}</p>
                        <p><span className="text-gray-400">Amount Paid:</span> ₹{validationResult.details?.registration?.amount || 'N/A'}</p>
                        <p className="col-span-2 truncate">
                          <span className="text-gray-400">Payment ID:</span> {validationResult.details?.registration?.paymentId || 'N/A'}
                        </p>
                        <p className="col-span-2 truncate">
                          <span className="text-gray-400">Order ID:</span> {validationResult.details?.registration?.orderId || 'N/A'}
                        </p>
                      </div>
                    </div>

                    {/* Check-in Details */}
                    <div className="space-y-2">
                      <h3 className="text-gray-400 text-sm font-medium uppercase">Check-in Details</h3>
                      <div className="text-gray-300">
                        <p>
                          <span className="text-gray-400">Time:</span> {
                            validationResult.details?.checkIn?.timestamp ? 
                            new Date(validationResult.details.checkIn.timestamp).toLocaleString() : 'N/A'
                          }
                        </p>
                      </div>
                    </div>
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