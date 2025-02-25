// src/pages/ExportDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useKindeAuth } from '@kinde-oss/kinde-auth-react';
import API_CONFIG from '../../config/api';

const ExportDashboard = () => {
  const { isAdmin, isAuthenticated } = useAuth();
  const kindeAuth = useKindeAuth();
  const [events, setEvents] = useState([]);
  const [workshops, setWorkshops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('events');
  const [exportStatus, setExportStatus] = useState({ message: '', type: '' });
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch events and workshops on component mount
  useEffect(() => {
    const fetchData = async () => {
      if (!isAuthenticated || !isAdmin) {
        setError('You must be an administrator to access this page');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Fetch events
        const eventsResponse = await fetch(API_CONFIG.getUrl('departments/all/events'), {
          headers: {
            'Authorization': `Bearer ${await getAuthToken()}`,
            'Content-Type': 'application/json'
          }
        });
        
        const eventsData = await eventsResponse.json();
        
        if (!eventsResponse.ok) {
          throw new Error(eventsData.error || 'Failed to fetch events');
        }
        
        // Fetch workshops
        const workshopsResponse = await fetch(API_CONFIG.getUrl('workshops'), {
          headers: {
            'Authorization': `Bearer ${await getAuthToken()}`,
            'Content-Type': 'application/json'
          }
        });
        
        const workshopsData = await workshopsResponse.json();
        
        if (!workshopsResponse.ok) {
          throw new Error(workshopsData.error || 'Failed to fetch workshops');
        }
        
        setEvents(eventsData.events || []);
        setWorkshops(workshopsData.workshops || []);
        setLoading(false);
      } catch (error) {
        console.error('Data fetch error:', error);
        setError(error.message || 'Failed to load data');
        setLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated, isAdmin]);

  // Helper function to get auth token
  const getAuthToken = async () => {
    try {
      const token = await kindeAuth.getToken();
      return token;
    } catch (error) {
      console.error('Token retrieval error:', error);
      return null;
    }
  };

  // Function to handle exporting event registrations
  const handleExportEvent = async (eventId, eventName) => {
    try {
      setExportStatus({ message: `Exporting registrations for ${eventName}...`, type: 'info' });
      
      // Make a request to the export endpoint
      const response = await fetch(API_CONFIG.getUrl(`export/event/${eventId}`), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${await getAuthToken()}`,
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Export failed');
      }
      
      // Get the blob data
      const blob = await response.blob();
      
      // Create a download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `${eventName.replace(/\s+/g, '_')}_registrations.xlsx`;
      
      // Add to DOM, trigger click, and clean up
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      setExportStatus({ message: `Export successful for ${eventName}`, type: 'success' });
      
      // Clear status message after 3 seconds
      setTimeout(() => {
        setExportStatus({ message: '', type: '' });
      }, 3000);
      
    } catch (error) {
      console.error('Export error:', error);
      setExportStatus({ message: `Export failed: ${error.message}`, type: 'error' });
    }
  };

  // Function to handle exporting workshop registrations
  const handleExportWorkshop = async (workshopId, workshopName) => {
    try {
      setExportStatus({ message: `Exporting registrations for ${workshopName}...`, type: 'info' });
      
      // Make a request to the export endpoint
      const response = await fetch(API_CONFIG.getUrl(`export/workshop/${workshopId}`), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${await getAuthToken()}`,
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Export failed');
      }
      
      // Get the blob data
      const blob = await response.blob();
      
      // Create a download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `${workshopName.replace(/\s+/g, '_')}_registrations.xlsx`;
      
      // Add to DOM, trigger click, and clean up
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      setExportStatus({ message: `Export successful for ${workshopName}`, type: 'success' });
      
      // Clear status message after 3 seconds
      setTimeout(() => {
        setExportStatus({ message: '', type: '' });
      }, 3000);
      
    } catch (error) {
      console.error('Export error:', error);
      setExportStatus({ message: `Export failed: ${error.message}`, type: 'error' });
    }
  };

  // Function to handle exporting all student data
  const handleExportAllStudents = async () => {
    try {
      setExportStatus({ message: 'Exporting all student registrations...', type: 'info' });
      
      // Make a request to the export endpoint
      const response = await fetch(API_CONFIG.getUrl('export/students/all'), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${await getAuthToken()}`,
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Export failed');
      }
      
      // Get the blob data
      const blob = await response.blob();
      
      // Create a download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = 'all_student_registrations.xlsx';
      
      // Add to DOM, trigger click, and clean up
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      setExportStatus({ message: 'Export successful for all student registrations', type: 'success' });
      
      // Clear status message after 3 seconds
      setTimeout(() => {
        setExportStatus({ message: '', type: '' });
      }, 3000);
      
    } catch (error) {
      console.error('Export error:', error);
      setExportStatus({ message: `Export failed: ${error.message}`, type: 'error' });
    }
  };

  // Function to handle exporting financial data
  const handleExportFinancial = async () => {
    try {
      setExportStatus({ message: 'Exporting financial report...', type: 'info' });
      
      // Make a request to the export endpoint
      const response = await fetch(API_CONFIG.getUrl('export/registrations/financial'), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${await getAuthToken()}`,
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Export failed');
      }
      
      // Get the blob data
      const blob = await response.blob();
      
      // Create a download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = 'financial_report.xlsx';
      
      // Add to DOM, trigger click, and clean up
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      setExportStatus({ message: 'Export successful for financial report', type: 'success' });
      
      // Clear status message after 3 seconds
      setTimeout(() => {
        setExportStatus({ message: '', type: '' });
      }, 3000);
      
    } catch (error) {
      console.error('Export error:', error);
      setExportStatus({ message: `Export failed: ${error.message}`, type: 'error' });
    }
  };

  // Function to handle exporting department summary
  const handleExportDepartmentSummary = async () => {
    try {
      setExportStatus({ message: 'Exporting department summary...', type: 'info' });
      
      // Make a request to the export endpoint
      const response = await fetch(API_CONFIG.getUrl('export/departments/summary'), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${await getAuthToken()}`,
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Export failed');
      }
      
      // Get the blob data
      const blob = await response.blob();
      
      // Create a download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = 'department_summary.xlsx';
      
      // Add to DOM, trigger click, and clean up
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      setExportStatus({ message: 'Export successful for department summary', type: 'success' });
      
      // Clear status message after 3 seconds
      setTimeout(() => {
        setExportStatus({ message: '', type: '' });
      }, 3000);
      
    } catch (error) {
      console.error('Export error:', error);
      setExportStatus({ message: `Export failed: ${error.message}`, type: 'error' });
    }
  };

  // Filter events/workshops based on search term
  const filteredEvents = events.filter(event => 
    event.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const filteredWorkshops = workshops.filter(workshop => 
    workshop.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Check access permission
  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-gray-700">Please log in to access this page.</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-gray-700">You must have administrator privileges to access this page.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mb-4"></div>
          <p className="text-gray-700">Loading export dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-gray-700">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Registration Export Dashboard</h1>
        
        {/* Status message */}
        {exportStatus.message && (
          <div className={`mb-6 p-4 rounded-md ${
            exportStatus.type === 'success' ? 'bg-green-100 text-green-800 border border-green-200' : 
            exportStatus.type === 'error' ? 'bg-red-100 text-red-800 border border-red-200' : 
            'bg-blue-100 text-blue-800 border border-blue-200'
          }`}>
            {exportStatus.message}
          </div>
        )}
        
        {/* Export Options */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Global Export Options</h2>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={handleExportAllStudents}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md transition duration-200"
            >
              Export All Students
            </button>
            <button
              onClick={handleExportFinancial}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 px-4 rounded-md transition duration-200"
            >
              Export Financial Report
            </button>
            <button
              onClick={handleExportDepartmentSummary}
              className="bg-amber-600 hover:bg-amber-700 text-white font-medium py-2 px-4 rounded-md transition duration-200"
            >
              Export Department Summary
            </button>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="flex border-b">
            <button
              className={`flex-1 py-3 px-4 font-medium text-sm focus:outline-none ${
                activeTab === 'events' 
                  ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600' 
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
              onClick={() => setActiveTab('events')}
            >
              Events ({events.length})
            </button>
            <button
              className={`flex-1 py-3 px-4 font-medium text-sm focus:outline-none ${
                activeTab === 'workshops' 
                  ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600' 
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
              onClick={() => setActiveTab('workshops')}
            >
              Workshops ({workshops.length})
            </button>
          </div>
          
          {/* Search */}
          <div className="p-4 border-b">
            <input
              type="text"
              placeholder={`Search ${activeTab}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-black px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          {/* Events Tab */}
          {activeTab === 'events' && (
            <div className="overflow-x-auto">
              {filteredEvents.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  {searchTerm ? 'No events found matching your search.' : 'No events available.'}
                </div>
              ) : (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Event Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registrations</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredEvents.map((event) => (
                      <tr key={event._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{event.title}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {event.departments?.map(dept => dept.name).join(', ') || 'N/A'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{event.registrationCount || 0}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            event.status === 'published' ? 'bg-green-100 text-green-800' :
                            event.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                            event.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {event.status || 'Unknown'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => handleExportEvent(event._id, event.title)}
                            className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 px-3 py-1 rounded-md transition duration-200"
                            disabled={!event.registrationCount}
                          >
                            Export
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
          
          {/* Workshops Tab */}
          {activeTab === 'workshops' && (
            <div className="overflow-x-auto">
              {filteredWorkshops.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  {searchTerm ? 'No workshops found matching your search.' : 'No workshops available.'}
                </div>
              ) : (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Workshop Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registrations</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredWorkshops.map((workshop) => (
                      <tr key={workshop._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{workshop.title}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {workshop.departments?.map(dept => dept.name).join(', ') || 'N/A'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {workshop.registration?.registeredCount || 0}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            workshop.status === 'upcoming' ? 'bg-yellow-100 text-yellow-800' :
                            workshop.status === 'ongoing' ? 'bg-green-100 text-green-800' :
                            workshop.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {workshop.status || 'Unknown'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => handleExportWorkshop(workshop._id, workshop.title)}
                            className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 px-3 py-1 rounded-md transition duration-200"
                            disabled={!(workshop.registration?.registeredCount)}
                          >
                            Export
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExportDashboard;