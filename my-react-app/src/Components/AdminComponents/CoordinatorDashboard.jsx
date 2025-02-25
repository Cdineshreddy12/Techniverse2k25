// src/pages/CoordinatorDashboard.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { createApiClient } from '../../config/kindeAPI';
import { useAuth } from '../../contexts/AuthContext';
const CoordinatorDashboard = () => {

    const api = createApiClient(); 
  // State
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState([]);
  const [workshops, setWorkshops] = useState([]);
  const [activeTab, setActiveTab] = useState('events');
  const [selectedItem, setSelectedItem] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  
  const { isAdmin, user } = useAuth();

  useEffect(() => {
    if (isAdmin && user) {
      localStorage.setItem('coordinatorId', user.id);
      localStorage.setItem('coordinatorName', user.name);
      localStorage.setItem('coordinatorEmail', user.email);
    }
  }, [isAdmin, user]);
  
  // Fetch events and workshops on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch events using your API client
        const eventsResponse = await api.getCoordinatorEvents();
        
        if (eventsResponse.success) {
          setEvents(eventsResponse.events);
        }
        
        // Fetch workshops using your API client
        const workshopsResponse = await api.getCoordinatorWorkshops();
        
        if (workshopsResponse.success) {
          setWorkshops(workshopsResponse.workshops);
        }
        
        setError(null);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data. Please check your connection and try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [api]);


  // Fetch registrations when an item is selected
 useEffect(() => {
    const fetchRegistrations = async () => {
      if (!selectedItem) return;
      
      try {
        setLoading(true);
        setIsSearching(false);
        setSearchResults([]);
        
        let response;
        if (selectedItem.type === 'event') {
          response = await api.getEventRegistrations(selectedItem.id);
        } else {
          response = await api.getWorkshopRegistrations(selectedItem.id);
        }
        
        if (response.success) {
          setRegistrations(response.registrations);
          setCurrentPage(1);
        } else {
          setError('Failed to load registrations');
          setRegistrations([]);
        }
      } catch (err) {
        console.error('Error fetching registrations:', err);
        setError('Error loading registrations. Please try again.');
        setRegistrations([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchRegistrations();
  }, [selectedItem, api]);

  
  // Handle tab change
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSelectedItem(null);
    setRegistrations([]);
    setSearchResults([]);
    setIsSearching(false);
    setCurrentPage(1);
  };
  
  // Handle item selection
  const handleSelectItem = (id, type, title) => {
    setSelectedItem({ id, type, title });
  };
  
  // Handle search
  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!searchQuery.trim() || searchQuery.length < 3) {
      setError('Please enter at least 3 characters to search');
      return;
    }
    
    try {
      setLoading(true);
      setIsSearching(true);
      
      const response = await api.searchRegistrations(searchQuery);
      
      if (response.success) {
        setSearchResults(response.results);
        setCurrentPage(1);
        setError(null);
      } else {
        setError('Search failed');
        setSearchResults([]);
      }
    } catch (err) {
      console.error('Search error:', err);
      setError('Error performing search. Please try again.');
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle export
  // Handle export
const handleExport = async () => {
    if (!selectedItem) {
      setError('Please select an item to export');
      return;
    }
    
    try {
      setLoading(true);
      
      // Create proper URL for direct fetch
      const token = localStorage.getItem('token');
      const baseUrl = import.meta.env.VITE_APP_BACKEND_URL || window.location.origin;
      const url = selectedItem.type === 'event'
        ? `${baseUrl}/api/coordinator/export/event/${selectedItem.id}`
        : `${baseUrl}/api/coordinator/export/workshop/${selectedItem.id}`;
      
      // Perform direct fetch for the blob data
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'text/csv',
          'X-Coordinator-ID': localStorage.getItem('coordinatorId'),
          'X-Coordinator-Name': localStorage.getItem('coordinatorName'),
          'X-Coordinator-Email': localStorage.getItem('coordinatorEmail')
        }
      });
      
      if (!response.ok) {
        throw new Error('Export failed');
      }
      
      // Get blob from response
      const blob = await response.blob();
      
      // Create download link
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', `${selectedItem.title.replace(/\s+/g, '_')}_registrations.csv`);
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      window.URL.revokeObjectURL(downloadUrl);
      document.body.removeChild(link);
      setError(null);
      
    } catch (err) {
      console.error('Export error:', err);
      setError('Failed to export. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };
  
  // Pagination logic
  const currentData = isSearching ? searchResults : registrations;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = currentData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(currentData.length / itemsPerPage);
  
  // Handle page change
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };
  
  // Render event card
  const EventCard = ({ item, isSelected, type }) => (
    <div 
      className={`p-4 mb-3 rounded-lg border cursor-pointer transition ${
        isSelected 
          ? 'bg-blue-50 border-blue-500' 
          : 'bg-white border-gray-200 hover:bg-gray-50'
      }`}
      onClick={() => handleSelectItem(item._id, type, item.title)}
    >
      <h3 className="font-medium text-lg truncate">{item.title}</h3>
      <div className="flex items-center mt-2 text-sm text-gray-600">
        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
        </svg>
        <span>{type === 'event' 
          ? formatDate(item.startTime).split(' ')[0] 
          : formatDate(item.workshopTiming?.startDate).split(' ')[0]
        }</span>
      </div>
      <div className="flex justify-between mt-2">
        <span className={`px-2 py-1 text-xs rounded-full ${
          type === 'event' ? 'bg-green-100 text-green-800' : 'bg-purple-100 text-purple-800'
        }`}>
          {type === 'event' ? 'Event' : 'Workshop'}
        </span>
        <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
          {type === 'event' 
            ? `${item.registrationCount || 0} registered` 
            : `${item.registration?.registeredCount || 0} registered`
          }
        </span>
      </div>
    </div>
  );
  
  // Loading spinner
  if (loading && !events.length && !workshops.length) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Event Coordinator Dashboard</h1>
      
      {/* Error message */}
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
          <p>{error}</p>
        </div>
      )}
      
      {/* Search bar */}
      <div className="mb-6">
        <form onSubmit={handleSearch} className="flex">
          <input
            type="text"
            placeholder="Search by name, email, or mobile..."
            className="flex-1 p-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded-r-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          </button>
        </form>
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Sidebar for events/workshops */}
        <div className="md:col-span-1">
          {/* Tabs */}
          <div className="flex mb-4 border-b">
            <button
              className={`flex-1 py-2 font-medium ${activeTab === 'events' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => handleTabChange('events')}
            >
              Events
            </button>
            <button
              className={`flex-1 py-2 font-medium ${activeTab === 'workshops' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => handleTabChange('workshops')}
            >
              Workshops
            </button>
          </div>
          
          {/* Event List */}
          {activeTab === 'events' && (
            <div className="overflow-y-auto max-h-[70vh]">
              <h2 className="text-xl font-semibold mb-4">Your Events</h2>
              {events.length === 0 ? (
                <p className="text-gray-500">No events assigned to you</p>
              ) : (
                events.map(event => (
                  <EventCard
                    key={event._id}
                    item={event}
                    isSelected={selectedItem?.id === event._id && selectedItem?.type === 'event'}
                    type="event"
                  />
                ))
              )}
            </div>
          )}
          
          {/* Workshop List */}
          {activeTab === 'workshops' && (
            <div className="overflow-y-auto max-h-[70vh]">
              <h2 className="text-xl font-semibold mb-4">Your Workshops</h2>
              {workshops.length === 0 ? (
                <p className="text-gray-500">No workshops assigned to you</p>
              ) : (
                workshops.map(workshop => (
                  <EventCard
                    key={workshop._id}
                    item={workshop}
                    isSelected={selectedItem?.id === workshop._id && selectedItem?.type === 'workshop'}
                    type="workshop"
                  />
                ))
              )}
            </div>
          )}
        </div>
        
        {/* Registration table section */}
        <div className="md:col-span-3">
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">
                {isSearching 
                  ? 'Search Results' 
                  : selectedItem 
                    ? `Registrations for ${selectedItem.title}` 
                    : 'Registrations'
                }
              </h2>
              
              {selectedItem && (
                <button
                  onClick={handleExport}
                  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 flex items-center"
                  disabled={loading}
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                  </svg>
                  Export CSV
                </button>
              )}
            </div>
            
            {/* Loading indicator */}
            {loading && (
              <div className="flex justify-center my-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            )}
            
            {/* No selection message */}
            {!loading && !selectedItem && !isSearching && (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                </svg>
                <h3 className="mt-2 text-lg font-medium text-gray-900">No registrations selected</h3>
                <p className="mt-1 text-sm text-gray-500">Select an event or workshop to view registrations, or use the search bar.</p>
              </div>
            )}
            
            {/* Registration table */}
            {!loading && (isSearching || selectedItem) && currentItems.length > 0 && (
              <>
                <div className="overflow-x-auto mt-4">
                  <table className="min-w-full border-collapse">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">College</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">College ID</th>
                        {isSearching && (
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registration</th>
                        )}
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment ID</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Date</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {currentItems.map((item, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{item.student?.name || item.name}</div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="text-sm text-gray-500">{item.student?.email || item.email}</div>
                            <div className="text-sm text-gray-500">{item.student?.mobile || item.mobile}</div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{item.student?.college || item.college}</div>
                            <div className="text-sm text-gray-500">{item.student?.branch || item.branch}</div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                            {item.student?.collegeId || item.collegeId || 'External'}
                          </td>
                          {isSearching && (
                            <td className="px-4 py-3 whitespace-nowrap">
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                item.registrationType === 'Event' 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-purple-100 text-purple-800'
                              }`}>
                                {item.registrationType}
                              </span>
                              <div className="text-sm text-gray-500 mt-1">{item.itemName}</div>
                            </td>
                          )}
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                            {item.paymentDetails?.paymentId || item.paymentId || 'N/A'}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="text-sm text-gray-900">₹{item.paymentDetails?.amount || item.amount || 0}</div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(item.paymentDetails?.paymentDate || item.paymentDate).split(' ')[0]}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center mt-6">
                    <nav className="flex items-center">
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="px-3 py-1 rounded-md mr-2 bg-white border border-gray-300 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>
                      
                      {[...Array(totalPages)].map((_, i) => (
                        <button
                          key={i}
                          onClick={() => handlePageChange(i + 1)}
                          className={`px-3 py-1 rounded-md mx-1 ${
                            currentPage === i + 1
                              ? 'bg-blue-500 text-white'
                              : 'bg-white border border-gray-300 text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          {i + 1}
                        </button>
                      ))}
                      
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="px-3 py-1 rounded-md ml-2 bg-white border border-gray-300 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                      </button>
                    </nav>
                  </div>
                )}
              </>
            )}
            
            {/* No results message */}
            {!loading && (isSearching || selectedItem) && currentItems.length === 0 && (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                </svg>
                <h3 className="mt-2 text-lg font-medium text-gray-900">No registrations found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {isSearching ? 'Try a different search term.' : 'No students have registered for this item yet.'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoordinatorDashboard;