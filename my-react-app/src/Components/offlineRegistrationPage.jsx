import React, { useState, useEffect } from 'react';
import { User, QrCode, Plus, Save, X, ChevronDown, CheckCircle, ChevronUp, AlertCircle } from 'lucide-react';
import { useApi } from '../config/useApi';
import { offlineEndpoints, makeOfflineRequest } from '../config/offlineAPI';
import { toast } from 'react-hot-toast';
import SearchForm from './SearchForm';
const OfflineRegistrationSystem = () => {
  const api = useApi();
  const [formData, setFormData] = useState({
    studentId: '',
    name: '',
    email: '',
    branch: '',
    class: '',
    mobileNo: '',
    registrationType: '',
    events: [],
    workshops: []
  });
  
  const [sections, setSections] = useState({
    personal: true,
    type: false,
    selection: false
  });
  
  const [isUpdateMode, setIsUpdateMode] = useState(false);
  const [registrationId, setRegistrationId] = useState(null);
  const [searchData, setSearchData] = useState({ studentId: '', email: '' });
  const [availableEvents, setAvailableEvents] = useState({});
  const [availableWorkshops, setAvailableWorkshops] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [coordinatorInfo, setCoordinatorInfo] = useState(null);
  

  // Fee structure
  const FEES = {
    events: 199,
    workshop: 199,
    both: 299
  };

  useEffect(() => {
    const initializeCoordinator = async () => {
      if (api?.isAuthenticated) {
        try {
          await api.detectCoordinator();
          const stats = await api.getCoordinatorStats();
          setCoordinatorInfo(stats);
        } catch (error) {
          console.error('Coordinator initialization error:', error);
          toast.error('Failed to initialize coordinator');
        }
      }
    };

    initializeCoordinator();
  }, [api?.isAuthenticated]);

  useEffect(() => {
    const fetchData = async () => {
      if (!api?.isAuthenticated) return;
      
      try {
        setLoading(true);
        const [eventsRes, workshopsRes] = await Promise.all([
          makeOfflineRequest(api, offlineEndpoints.getEvents),
          makeOfflineRequest(api, offlineEndpoints.getWorkshops)
        ]);

        if (eventsRes.events) {
          const groupedEvents = groupEventsByDepartment(eventsRes.events);
          setAvailableEvents(groupedEvents);
        }
        if (workshopsRes.workshops) {
          setAvailableWorkshops(workshopsRes.workshops);
        }
      } catch (error) {
        console.error('Data fetching error:', error);
        setError('Failed to fetch events and workshops: ' + error.message);
        toast.error('Failed to load events and workshops');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [api?.isAuthenticated]);

  const groupEventsByDepartment = (events) => {
    return events.reduce((acc, event) => {
      event.departments.forEach(dept => {
        if (!acc[dept.name]) {
          acc[dept.name] = [];
        }
        acc[dept.name].push(event);
      });
      return acc;
    }, {});
  };

  const calculateTotalAmount = () => {
    return FEES[formData.registrationType] || 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleEventSelection = (event) => {
    if (!formData.events.find(e => e.eventId === event._id)) {
      setFormData(prev => ({
        ...prev,
        events: [...prev.events, { eventId: event._id, title: event.title }]
      }));
    }
  };

  const handleWorkshopSelection = (workshop) => {
    if (!formData.workshops.find(w => w.workshopId === workshop._id)) {
      setFormData(prev => ({
        ...prev,
        workshops: [...prev.workshops, { workshopId: workshop._id, title: workshop.title }]
      }));
    }
  };

  const removeEvent = (eventId) => {
    setFormData(prev => ({
      ...prev,
      events: prev.events.filter(e => e.eventId !== eventId)
    }));
  };

  const removeWorkshop = (workshopId) => {
    setFormData(prev => ({
      ...prev,
      workshops: prev.workshops.filter(w => w.workshopId !== workshopId)
    }));
  };

  const toggleSection = (sectionName) => {
    setSections(prev => ({
      ...prev,
      [sectionName]: !prev[sectionName]
    }));
  };

  const handleUpdateRegistration = async () => {
    try {
      setLoading(true);
      const response = await makeOfflineRequest(api, offlineEndpoints.updateRegistration(registrationId), {
        method: 'PUT',
        body: JSON.stringify({
          events: formData.events,
          workshops: formData.workshops,
          registrationType: formData.registrationType,
          amount: calculateTotalAmount()
        })
      });
      
      toast.success('Registration updated successfully');
      resetForm();
      return response;
    } catch (error) {
      console.error('Update error:', error);
      toast.error('Failed to update registration');
      setError('Update failed: ' + error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      studentId: '',
      name: '',
      email: '',
      branch: '',
      class: '',
      mobileNo: '',
      registrationType: '',
      events: [],
      workshops: []
    });
    setIsUpdateMode(false);
    setRegistrationId(null);
    setSearchData({ studentId: '', email: '' });
    setSections({ personal: true, type: false, selection: false });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
  
    try {
      if (isUpdateMode) {
        await handleUpdateRegistration();
      } else {
        // Create user
        const userResponse = await makeOfflineRequest(api, offlineEndpoints.createUser, {
          method: 'POST',
          body: JSON.stringify({
            studentId: formData.studentId,
            name: formData.name,
            email: formData.email,
            branch: formData.branch,
            class: formData.class,
            mobileNo: formData.mobileNo
          })
        });
  
        // Create registration
        await makeOfflineRequest(api, offlineEndpoints.createRegistration, {
          method: 'POST',
          body: JSON.stringify({
            userId: userResponse.userId,
            events: formData.events,
            workshops: formData.workshops,
            amount: calculateTotalAmount(),
            registrationType: formData.registrationType,
            receivedBy: localStorage.getItem('coordinatorName') || 'Unknown'
          })
        });
        
        toast.success('Registration complete! Credentials sent via email');
        resetForm();
      }
    } catch (error) {
      console.error('Submit error:', error);
      setError(error.message);
      toast.error(isUpdateMode ? 'Update failed' : 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Component renderers
  const EventSelectionItem = ({ event, onSelect, isSelected }) => (
    <button
      type="button"
      onClick={() => onSelect(event)}
      disabled={isSelected}
      className="w-full p-2 text-left rounded-lg bg-gray-600 hover:bg-gray-500 
                 disabled:opacity-50 disabled:cursor-not-allowed flex justify-between 
                 items-center transition-colors text-sm"
    >
      <span className="truncate flex-1 mr-2">{event.title}</span>
      <Plus className="h-4 w-4 flex-shrink-0" />
    </button>
  );

  const SelectedItemChip = ({ item, onRemove }) => (
    <span className="inline-flex items-center gap-1 bg-blue-600/50 text-white 
                     px-2 py-1 rounded-full text-xs max-w-full">
      <span className="truncate">{item.title}</span>
      <button
        type="button"
        onClick={onRemove}
        className="text-white hover:text-red-300 transition-colors flex-shrink-0"
      >
        <X className="h-3 w-3" />
      </button>
    </span>
  );

  const SectionHeader = ({ title, sectionKey, badge }) => (
    <button
      onClick={() => toggleSection(sectionKey)}
      className="w-full flex items-center justify-between p-4 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
    >
      <span className="font-semibold">{title}</span>
      <div className="flex items-center gap-2">
        {badge && <span className="bg-blue-600 px-2 py-1 rounded text-sm">{badge}</span>}
        {sections[sectionKey] ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
      </div>
    </button>
  );


 

  if (!api?.isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Authentication Required</h1>
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 sm:p-6">
      <div className="max-w-4xl mx-auto">

      <SearchForm 
  onSubmit={async (data) => {
    if (!data.studentId || !data.email) {
      toast.error('Please enter both Student ID and Email');
      return;
    }
    
    try {
      setLoading(true);
      const response = await makeOfflineRequest(api, offlineEndpoints.searchRegistration, {
        method: 'POST',
        body: JSON.stringify(data)
      });
      
      if (response.registration) {
        const { user, events, workshops, registrationType, _id } = response.registration;
        setFormData({
          studentId: user.studentId,
          name: user.name,
          email: user.email,
          branch: user.branch,
          class: user.class,
          mobileNo: user.mobileNo,
          events: events.map(e => ({ 
            eventId: e.id, 
            title: e.name // Changed from e.title to e.name to match the response format
          })),
          workshops: workshops.map(w => ({ 
            workshopId: w.id, 
            title: w.name // Changed from w.title to w.name to match the response format
          })),
          registrationType
        });
        setRegistrationId(_id);
        setIsUpdateMode(true);
        setSections({ personal: false, type: false, selection: true });
        toast.success('Registration found! You can now update events/workshops.');
      } else {
        toast.error('No registration found with these details');
      }
    } catch (error) {
      console.error('Search error:', error);
      toast.error(error.message || 'Failed to find registration');
      setError('Could not find registration');
    } finally {
      setLoading(false);
    }
  }}
  loading={loading}
  isUpdateMode={isUpdateMode}
  resetForm={resetForm}
/>

        {/* Main Registration Form */}
        <div className="bg-gray-800 rounded-lg shadow-xl overflow-hidden mb-6">
          <div className="p-4 sm:p-6 border-b border-gray-700">
            <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
              <User className="h-6 w-6" />
              {isUpdateMode ? 'Update Registration' : 'New Registration'}
            </h1>
          </div>

          <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-6">
            {/* Personal Information Section */}
            <div className="space-y-4">
              <SectionHeader
                title="Personal Information"
                sectionKey="personal"
                badge={formData.name ? '✓' : null}
              />
              
              {sections.personal && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-gray-700/50 rounded-lg">
                  <div className="space-y-2">
                    <label className="text-sm text-gray-300">Student ID</label>
                    <input
                      type="text"
                      name="studentId"
                      placeholder="Enter Student ID"
                      value={formData.studentId}
                      onChange={handleInputChange}
                      className="w-full p-3 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                      disabled={isUpdateMode}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm text-gray-300">Full Name</label>
                    <input
                      type="text"
                      name="name"
                      placeholder="Enter Full Name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full p-3 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                      disabled={isUpdateMode}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm text-gray-300">Email Address</label>
                    <input
                      type="email"
                      name="email"
                      placeholder="Enter Email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full p-3 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                      disabled={isUpdateMode}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm text-gray-300">Branch</label>
                    <select
                      name="branch"
                      value={formData.branch}
                      onChange={handleInputChange}
                      className="w-full p-3 bg-gray-700 border border-gray-600 rounded text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                      disabled={isUpdateMode}
                    >
                      <option value="">Select Branch</option>
                      <option value="CSE">CSE</option>
                      <option value="ECE">ECE</option>
                      <option value="EEE">EEE</option>
                      <option value="CIVIL">CIVIL</option>
                      <option value="MECH">MECH</option>
                      <option value="CHEMICAL">CHEMICAL</option>
                      <option value="PUC">PUC</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm text-gray-300">Class</label>
                    <input
                      type="text"
                      name="class"
                      placeholder="e.g., CSE-1A"
                      value={formData.class}
                      onChange={handleInputChange}
                      className="w-full p-3 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                      disabled={isUpdateMode}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm text-gray-300">Mobile Number</label>
                    <input
                      type="tel"
                      name="mobileNo"
                      placeholder="10-digit mobile number"
                      value={formData.mobileNo}
                      onChange={handleInputChange}
                      pattern="[0-9]{10}"
                      className="w-full p-3 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                      disabled={isUpdateMode}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Registration Type Section */}
            {(!isUpdateMode || !formData.registrationType) && (
              <div className="space-y-4">
                <SectionHeader
                  title="Registration Type"
                  sectionKey="type"
                  badge={formData.registrationType ? '✓' : null}
                />
                
                {sections.type && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-gray-700/50 rounded-lg">
                    {['events', 'workshop', 'both'].map(type => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => {
                          setFormData(prev => ({...prev, registrationType: type}));
                          setSections(prev => ({...prev, selection: true}));
                        }}
                        className={`p-4 rounded-lg transition-all transform hover:scale-105 ${
                          formData.registrationType === type
                            ? 'bg-blue-600 text-white ring-2 ring-blue-400'
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                      >
                        <div className="text-center">
                          <div className="font-semibold mb-2">
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                          </div>
                          <div className="text-sm opacity-75">
                            ₹{FEES[type]}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Events & Workshops Selection Section */}
            {formData.registrationType && (
              <div className="space-y-4">
                <SectionHeader
                  title="Select Events & Workshops"
                  sectionKey="selection"
                  badge={
                    formData.events.length > 0 || formData.workshops.length > 0 
                      ? `${formData.events.length + formData.workshops.length} selected` 
                      : null
                  }
                />
                
                {sections.selection && (
                  <div className="space-y-6 p-4 bg-gray-700/50 rounded-lg">
                    {/* Events Selection */}
                    {(formData.registrationType === 'events' || formData.registrationType === 'both') && (
                      <div className="space-y-4">
                        <h3 className="text-base font-semibold lg:text-lg">Events</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {Object.entries(availableEvents).map(([dept, events]) => (
                            <div key={dept} className="bg-gray-700 p-3 rounded-lg">
                              <h4 className="font-medium mb-2 text-blue-400 text-sm">{dept}</h4>
                              <div className="space-y-2">
                                {events.map(event => (
                                  <EventSelectionItem
                                    key={event._id}
                                    event={event}
                                    onSelect={handleEventSelection}
                                    isSelected={formData.events.some(e => e.eventId === event._id)}
                                  />
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Workshops Selection */}
                    {(formData.registrationType === 'workshop' || formData.registrationType === 'both') && (
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Workshops</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {availableWorkshops.map(workshop => (
                            <button
                              key={workshop._id}
                              type="button"
                              onClick={() => handleWorkshopSelection(workshop)}
                              disabled={formData.workshops.some(w => w.workshopId === workshop._id)}
                              className="w-full p-3 text-left rounded-lg bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed flex justify-between items-center transition-colors"
                            >
                              <span className="line-clamp-1">{workshop.title}</span>
                              <Plus className="h-4 w-4 flex-shrink-0" />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Selected Items */}
                    <div className="space-y-3 mt-4">
                      <h3 className="text-sm font-semibold sm:text-base">Selected Items</h3>
                      <div className="flex flex-wrap gap-2">
                        {formData.events.map(event => (
                          <SelectedItemChip
                            key={event.eventId}
                            item={event}
                            onRemove={() => removeEvent(event.eventId)}
                          />
                        ))}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {formData.workshops.map(workshop => (
                          <SelectedItemChip
                            key={workshop.workshopId}
                            item={workshop}
                            onRemove={() => removeWorkshop(workshop.workshopId)}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Summary Section */}
            {formData.registrationType && (
              <div className="bg-gray-700 p-4 rounded-lg space-y-3">
                <h3 className="font-semibold">Registration Summary</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-400">Registration Type:</p>
                    <p className="font-medium">{formData.registrationType.charAt(0).toUpperCase() + formData.registrationType.slice(1)}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Total Amount:</p>
                    <p className="font-medium">₹{calculateTotalAmount()}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Selected Events:</p>
                    <p className="font-medium">{formData.events.length}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Selected Workshops:</p>
                    <p className="font-medium">{formData.workshops.length}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Error Messages */}
            {error && (
              <div className="bg-red-900/50 border-l-4 border-red-500 p-4 rounded-lg flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-red-200">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !formData.registrationType || 
                (formData.registrationType === 'events' && formData.events.length === 0) ||
                (formData.registrationType === 'workshop' && formData.workshops.length === 0) ||
                (formData.registrationType === 'both' && (formData.events.length === 0 || formData.workshops.length === 0))}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 
                disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                  Processing...
                </>
              ) : (
                <>
                  <Save className="h-5 w-5" />
                  {isUpdateMode ? 'Update Registration' : 'Register & Send Email'}
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default OfflineRegistrationSystem;