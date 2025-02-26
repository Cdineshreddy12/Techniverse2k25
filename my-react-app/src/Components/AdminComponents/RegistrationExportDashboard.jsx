import React, { useState, useEffect } from 'react';
import { registrationEndpoints } from '../../config/RegistrationExportService';
import { useAuth } from '../../contexts/AuthContext';
import { useApi } from '../../config/useApi';
import API_CONFIG from '../../config/api';
import { useKindeAuth } from '@kinde-oss/kinde-auth-react';
const RegistrationExportDashboard = () => {
  // Use authentication context
  const auth = useAuth();
  const api = useApi();
  const kindeAuth = useKindeAuth();
  // State variables
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [items, setItems] = useState({ events: [], workshops: [], classes: [] });
  const [selectedType, setSelectedType] = useState('event');
  const [selectedItem, setSelectedItem] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [exportFormat, setExportFormat] = useState('json');
  const [previewData, setPreviewData] = useState(null);
  const [stats, setStats] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Fetch available events/workshops on component mount
  useEffect(() => {
    const fetchItems = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await api.makeAuthenticatedRequest('registrations/list-items');
        
        if (response.success) {
          setItems(response);
        } else {
          setError(response.error || 'Failed to fetch items');
        }
      } catch (err) {
        setError(err.message || 'Error fetching data');
      } finally {
        setLoading(false);
      }
    };

    if (auth.isAuthenticated && !auth.isLoading) {
      fetchItems();
    }
  }, [auth.isAuthenticated, auth.isLoading, api]);

  // Build query string helper
  const buildQueryString = (params) => {
    const queryParams = [];
    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        queryParams.push(`${key}=${encodeURIComponent(value)}`);
      }
    });
    return queryParams.length > 0 ? `?${queryParams.join('&')}` : '';
  };

  // Handle preview request
  const handlePreview = async () => {
    if (!selectedItem) {
      setError('Please select an item to export');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Build query parameters
      const queryParams = {
        format: 'json',
        class: selectedClass,
        startDate,
        endDate
      };

      const queryString = buildQueryString(queryParams);
      
      // Make API request
      const endpoint = selectedType === 'event' 
        ? `registrations/event/${selectedItem}${queryString}`
        : `registrations/workshop/${selectedItem}${queryString}`;
      
      const response = await api.makeAuthenticatedRequest(endpoint);

      if (response.success) {
        setPreviewData(response.registrations);
        setStats(response.stats);
      } else {
        setError(response.error || 'Failed to fetch preview data');
      }
    } catch (err) {
      setError(err.message || 'Error fetching preview data');
    } finally {
      setLoading(false);
    }
  };

  // Download file with proper authentication
  // Download file using fetch with proper headers then create a blob URL download
  const downloadWithAuth = async (endpoint, format) => {
    try {
      if (!auth.isAuthenticated) {
        throw new Error('Authentication required');
      }
      
      setLoading(true);
      setError(null);
      
      try {
        // Get token directly from Kinde - this is the key change
        const token = await kindeAuth.getToken();
        
        if (!token) {
          throw new Error('Authentication token not available');
        }
        
        // Ensure format parameter is included
        if (!endpoint.includes('format=')) {
          endpoint = endpoint + (endpoint.includes('?') ? '&' : '?') + 'format=' + format;
        }
        
        // Create full URL
        const url = `${API_CONFIG.baseURL}/api/${endpoint}`;
        
        console.log('Making authenticated download request to:', url);
        
        // Set the proper headers that your KindeAuth middleware expects
        const headers = {
          'Authorization': `Bearer ${token}`,
          'X-Coordinator-ID': localStorage.getItem('coordinatorId') || '',
          'X-Coordinator-Name': localStorage.getItem('coordinatorName') || ''
        };
        
        // Make fetch request with the correct headers
        const response = await fetch(url, {
          method: 'GET',
          headers: headers
        });
        
        if (!response.ok) {
          const errText = await response.text();
          throw new Error(`Server responded with ${response.status}: ${errText}`);
        }
        
        // Get the blob from the response
        const blob = await response.blob();
        
        // Create download link
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = downloadUrl;
        
        // Set filename
        const date = new Date().toISOString().split('T')[0];
        const itemName = getSelectedItemName().replace(/[^\w]/g, '_').toLowerCase();
        a.download = `${itemName}_${date}.${format}`;
        
        // Trigger download
        document.body.appendChild(a);
        a.click();
        
        // Clean up
        window.URL.revokeObjectURL(downloadUrl);
        document.body.removeChild(a);
        
        return true;
      } catch (error) {
        console.error('Download error:', error);
        throw error;
      } finally {
        setLoading(false);
      }
    } catch (error) {
      console.error('Error downloading export:', error);
      setError(error.message || 'Error downloading file');
      return false;
    }
  };

  // Export data in selected format
  const handleExport = async () => {
    if (!selectedItem) {
      setError('Please select an item to export');
      return;
    }

    // Build query parameters
    const queryParams = {
      class: selectedClass,
      startDate,
      endDate,
      format: exportFormat
    };

    const queryString = buildQueryString(queryParams);
    
    // Create export endpoint
    const endpoint = selectedType === 'event' 
      ? `registrations/event/${selectedItem}${queryString}`
      : `registrations/workshop/${selectedItem}${queryString}`;
    
    // For CSV and Excel, use download with auth
    if (exportFormat === 'csv' || exportFormat === 'excel') {
      await downloadWithAuth(endpoint, exportFormat);
    } else {
      // For JSON, show preview
      handlePreview();
    }
  };

  // Get selected item name
  const getSelectedItemName = () => {
    if (!selectedItem) return '';
    
    const itemArray = selectedType === 'event' ? items.events : items.workshops;
    const item = itemArray?.find(i => i.id === selectedItem);
    return item ? item.title : '';
  };

  // Pagination handlers
  const handleNextPage = () => {
    if (previewData && (page + 1) * rowsPerPage < previewData.length) {
      setPage(page + 1);
    }
  };

  const handlePrevPage = () => {
    if (page > 0) {
      setPage(page - 1);
    }
  };

  // Calculate pagination info
  const startIndex = page * rowsPerPage;
  const endIndex = Math.min(startIndex + rowsPerPage, previewData?.length || 0);
  const totalPages = previewData ? Math.ceil(previewData.length / rowsPerPage) : 0;

  return (
    <div className="min-h-screen bg-gray-50 text-black py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Registration Export Dashboard</h1>
        
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}
        
        {/* Configuration Panel */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
          <div className="px-4 py-5 sm:px-6">
            <h2 className="text-lg font-medium text-gray-900">Export Configuration</h2>
            <p className="mt-1 text-sm text-gray-500">Select options to export registrations</p>
          </div>
          
          <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              {/* Type Selection */}
              <div className="sm:col-span-2">
                <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                  Type
                </label>
                <select
                  id="type"
                  name="type"
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  value={selectedType}
                  onChange={(e) => {
                    setSelectedType(e.target.value);
                    setSelectedItem('');
                    setPreviewData(null);
                    setStats(null);
                  }}
                >
                  <option value="event">Events</option>
                  <option value="workshop">Workshops</option>
                </select>
              </div>
              
              {/* Item Selection */}
              <div className="sm:col-span-4">
                <label htmlFor="item" className="block text-sm font-medium text-gray-700">
                  {selectedType === 'event' ? 'Event' : 'Workshop'}
                </label>
                <select
                  id="item"
                  name="item"
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  value={selectedItem}
                  onChange={(e) => {
                    setSelectedItem(e.target.value);
                    setPreviewData(null);
                  }}
                  disabled={loading || !items[selectedType === 'event' ? 'events' : 'workshops']?.length}
                >
                  <option value="">Select {selectedType === 'event' ? 'an event' : 'a workshop'}</option>
                  {items[selectedType === 'event' ? 'events' : 'workshops']?.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.title} {item.departments ? `(${item.departments.join(', ')})` : ''}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Class Filter */}
              <div className="sm:col-span-2">
                <label htmlFor="class" className="block text-sm font-medium text-gray-700">
                  Class Filter (Optional)
                </label>
                <select
                  id="class"
                  name="class"
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                >
                  <option value="">All Classes</option>
                  {items.classes?.map((className) => (
                    <option key={className} value={className}>
                      {className}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Date Range */}
              <div className="sm:col-span-2">
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
                  Start Date (Optional)
                </label>
                <input
                  type="date"
                  id="startDate"
                  name="startDate"
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              
              <div className="sm:col-span-2">
                <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
                  End Date (Optional)
                </label>
                <input
                  type="date"
                  id="endDate"
                  name="endDate"
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
              
              {/* Export Format */}
              <div className="sm:col-span-2">
                <label htmlFor="format" className="block text-sm font-medium text-gray-700">
                  Export Format
                </label>
                <select
                  id="format"
                  name="format"
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  value={exportFormat}
                  onChange={(e) => setExportFormat(e.target.value)}
                >
                  <option value="json">JSON</option>
                  <option value="csv">CSV</option>
                  <option value="excel">Excel</option>
                </select>
              </div>
              
              {/* Action Buttons */}
              <div className="sm:col-span-2">
                <button
                  type="button"
                  onClick={handlePreview}
                  disabled={loading || !selectedItem}
                  className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-gray-700 bg-gray-200 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50"
                >
                  Preview Data
                </button>
              </div>
              
              <div className="sm:col-span-2">
                <button
                  type="button"
                  onClick={handleExport}
                  disabled={loading || !selectedItem}
                  className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Export Data
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Loading Indicator */}
        {loading && (
          <div className="flex justify-center my-8">
            <svg className="animate-spin h-10 w-10 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        )}
        
        {/* Statistics */}
        {stats && (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
            <div className="px-4 py-5 sm:px-6">
              <h2 className="text-lg font-medium text-gray-900">Statistics</h2>
              <p className="mt-1 text-sm text-gray-500">Registration summary for {getSelectedItemName()}</p>
            </div>
            
            <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {/* Total Registrations */}
                <div className="bg-gray-50 overflow-hidden shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Registrations</dt>
                    <dd className="mt-1 text-3xl font-semibold text-gray-900">{stats.totalRegistrations}</dd>
                  </div>
                </div>
                
                {/* Total Amount (workshops only) */}
                {selectedType === 'workshop' && stats.totalAmount !== undefined && (
                  <div className="bg-gray-50 overflow-hidden shadow rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Amount</dt>
                      <dd className="mt-1 text-3xl font-semibold text-gray-900">₹{stats.totalAmount}</dd>
                    </div>
                  </div>
                )}
                
                {/* Status Breakdown */}
                <div className="bg-gray-50 overflow-hidden shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <dt className="text-sm font-medium text-gray-500 truncate">Status Breakdown</dt>
                    <dd className="mt-2">
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(stats.statusBreakdown || {}).map(([status, count]) => (
                          <div 
                            key={status}
                            className={`px-2 py-1 text-xs rounded-full ${
                              status === 'completed' 
                                ? 'bg-green-100 text-green-800'
                                : status === 'attended' 
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {status}: {count}
                          </div>
                        ))}
                      </div>
                    </dd>
                  </div>
                </div>
              </div>
              
              {/* Class Breakdown */}
              <div className="mt-6">
                <h3 className="text-md font-medium text-gray-700 mb-3">Class Breakdown</h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                  {Object.entries(stats.classBreakdown || {}).map(([className, data]) => (
                    <div key={className} className="bg-white border border-gray-200 rounded-md p-4">
                      <h4 className="font-medium text-gray-900">{className}</h4>
                      <div className="mt-2 space-y-1">
                        <p className="text-sm text-gray-500">Count: {data.count}</p>
                        <p className="text-sm text-gray-500">Attended: {data.attended}</p>
                        {data.amount !== undefined && (
                          <p className="text-sm text-gray-500">Amount: ₹{data.amount}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Data Preview */}
        {previewData && (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
              <div>
                <h2 className="text-lg font-medium text-gray-900">Preview Data</h2>
                <p className="mt-1 text-sm text-gray-500">{getSelectedItemName()}</p>
              </div>
              <div className="bg-indigo-100 text-indigo-800 py-1 px-3 rounded-full text-sm">
                {previewData.length} records
              </div>
            </div>
            
            <div className="border-t border-gray-200">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Receipt #
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Student ID
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Class
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Branch
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Registered At
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {previewData.slice(startIndex, endIndex).map((registration) => (
                      <tr key={registration.receiptNumber}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {registration.receiptNumber}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {registration.studentId}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {registration.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {registration.class}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {registration.branch}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(registration.registeredAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs rounded-full 
                            ${registration.status === 'completed' 
                              ? 'bg-green-100 text-green-800' 
                              : registration.status === 'attended' 
                                ? 'bg-blue-100 text-blue-800' 
                                : 'bg-gray-100 text-gray-800'}`}>
                            {registration.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          ₹{registration.amount}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Pagination */}
              {previewData.length > 0 && (
                <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                  <div className="flex-1 flex justify-between sm:hidden">
                    <button
                      onClick={handlePrevPage}
                      disabled={page === 0}
                      className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <button
                      onClick={handleNextPage}
                      disabled={(page + 1) * rowsPerPage >= previewData.length}
                      className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-700">
                        Showing <span className="font-medium">{startIndex + 1}</span> to <span className="font-medium">{endIndex}</span> of{' '}
                        <span className="font-medium">{previewData.length}</span> results
                      </p>
                    </div>
                    <div>
                      <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                        <button
                          onClick={handlePrevPage}
                          disabled={page === 0}
                          className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                        >
                          <span className="sr-only">Previous</span>
                          <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </button>
                        
                        {/* Page numbers - simplified for brevity */}
                        <div className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                          Page {page + 1} of {totalPages}
                        </div>
                        
                        <button
                          onClick={handleNextPage}
                          disabled={(page + 1) * rowsPerPage >= previewData.length}
                          className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                        >
                          <span className="sr-only">Next</span>
                          <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </nav>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RegistrationExportDashboard;