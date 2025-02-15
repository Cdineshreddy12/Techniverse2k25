// pages/ClassRegistration.js
import React, { useState, useEffect, useRef } from 'react';
import { useApi } from '../config/useApi';
import * as XLSX from 'xlsx';

const ClassRegistration = () => {
  const api = useApi();
  const fileInputRef = useRef(null);
  
  // States
  const [selectedBranch, setSelectedBranch] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [events, setEvents] = useState([]);
  const [workshops, setWorkshops] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState({});
  const [bulkType, setBulkType] = useState('events');
  const [uploadData, setUploadData] = useState(null);
  const [allowedBranches, setAllowedBranches] = useState([]);
  const [allowedClasses, setAllowedClasses] = useState([]);
  const [categorizedData, setCategorizedData] = useState({});
  const [currentView, setCurrentView] = useState('excel'); // 'excel' or 'class'
  // Fetch coordinator permissions on mount
useEffect(() => {
    const fetchCoordinatorData = async () => {
      try {
        const response = await api.makeAuthenticatedRequest('coordinator/permissions');
        if (response.success) {
          setAllowedBranches(response.permissions.assignedBranches);
          setAllowedClasses(response.permissions.assignedClasses);
        }
      } catch (error) {
        setError('Failed to load coordinator permissions');
      }
    };
    fetchCoordinatorData();
  }, []);

  
  // Excel upload handling
// Update handleExcelUpload to show more detailed errors
const handleExcelUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
  
    try {
      setLoading(true);
      const { flat, categorized } = await readExcelFile(file);
      
      if (!flat.length) {
        throw new Error('No valid data found in Excel file');
      }
  
      // Set both flat and categorized data
      setUploadData(flat);
      setCategorizedData(categorized);
  
      setSuccess(`Found ${flat.length} valid student records in ${Object.keys(categorized).length} branches`);
      
      // Debug log
      console.log('Upload Preview:', {
        totalStudents: flat.length,
        branches: Object.keys(categorized),
        sampleStudent: flat[0]
      });
  
    } catch (error) {
      setError('Excel Processing Error: ' + error.message);
      console.error('Excel Upload Error:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const readExcelFile = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const workbook = XLSX.read(e.target.result, { type: 'binary' });
          const worksheet = workbook.Sheets[workbook.SheetNames[0]];
          
          // Get the data as rows with original headers
          const rawData = XLSX.utils.sheet_to_json(worksheet, {
            raw: true,
            defval: '',
            blankrows: false
          });
  
          // Process and format the data
          const formattedData = rawData.map(row => {
            // Extract ID, Name, and Class from your Excel columns
            // Adjust these keys to match your Excel column headers exactly
            const studentId = row['ID'] || row['STUDENT ID'] || row['id'] || '';
            const name = row['NAME'] || row['name'] || '';
            const classInfo = row['CLASS'] || row['class'] || '';
  
            // Split class into branch and section (e.g., "CSE-2A")
            const [branch, section] = classInfo.split('-');
  
            return {
              studentId: studentId.toString().trim(),
              name: name.toString().trim(),
              branch: branch?.trim() || '',
              class: classInfo.trim(),
              email: `${studentId.toString().toLowerCase().trim()}@rguktsklm.ac.in`,
              registrationType: 'pending',
              paymentStatus: 'PENDING'
            };
          });
  
          // Filter out any invalid entries
          const validData = formattedData.filter(
            item => item.studentId && item.name && item.class
          );
  
          // Group by branch and class
          const categorizedData = validData.reduce((acc, student) => {
            const branch = student.branch;
            const className = student.class;
            
            if (!acc[branch]) acc[branch] = {};
            if (!acc[branch][className]) acc[branch][className] = [];
            
            acc[branch][className].push(student);
            return acc;
          }, {});
  
          console.log('Processed Data:', {
            raw: rawData[0], // Log first raw row to debug
            formatted: validData[0], // Log first formatted row
            categorized: Object.keys(categorizedData) // Log available branches
          });
  
          return resolve({
            flat: validData,
            categorized: categorizedData
          });
  
        } catch (error) {
          console.error('Excel Processing Error:', error);
          reject(new Error(`Failed to process Excel: ${error.message}`));
        }
      };
      reader.onerror = (error) => reject(error);
      reader.readAsBinaryString(file);
    });
  };

  // Import Excel data
  const handleImportData = async () => {
    if (!uploadData) return;
  
    // Validate data against coordinator permissions
    const invalidStudents = uploadData.filter(student => 
      !allowedBranches.includes(student.branch?.toUpperCase()) ||
      !allowedClasses.includes(`${student.branch?.toUpperCase()}-${student.class}`)
    );
  
    if (invalidStudents.length > 0) {
      setError(`Unauthorized to register students from: ${
        invalidStudents.map(s => `${s.branch}-${s.class}`).join(', ')
      }`);
      return;
    }
  
    setLoading(true);
    try {
      const response = await api.makeAuthenticatedRequest('offline-registration/bulk-upload', {
        method: 'POST',
        body: JSON.stringify({
          students: uploadData,
          receivedBy: api.coordinator.name
        })
      });
  
      if (response.success) {
        setSuccess(`Imported ${response.results.successful.length} students! Failed: ${response.results.failed.length}`);
        setUploadData(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        fetchStudents();
      }
    } catch (error) {
      setError('Failed to import students: ' + error.message);
    } finally {
      setLoading(false);
    }
  };
  
  const handleEventSelection = async (studentId, eventId, type) => {
    setSelectedStudents(prev => {
      const newState = { ...prev };
      const studentSelections = newState[studentId] || {};
      const currentSelections = studentSelections[type] || [];
      
      if (currentSelections.includes(eventId)) {
        studentSelections[type] = currentSelections.filter(id => id !== eventId);
      } else {
        studentSelections[type] = [...currentSelections, eventId];
      }
      
      newState[studentId] = studentSelections;
      return newState;
    });
  
    try {
      const response = await api.makeAuthenticatedRequest(
        `offline-registration/update-selections/${studentId}`,
        {
          method: 'PUT',
          body: JSON.stringify({
            [type]: selectedStudents[studentId][type]
          })
        }
      );
  
      if (!response.success) {
        throw new Error(response.error);
      }
    } catch (error) {
      setError(`Failed to update ${type}: ` + error.message);
      // Revert the change if the API call failed
      fetchStudents();
    }
  };

  // Fetch events and workshops
  useEffect(() => {
    const fetchEventsAndWorkshops = async () => {
      try {
        const [eventsRes, workshopsRes] = await Promise.all([
          api.makeAuthenticatedRequest('departments/all/events'),
          api.makeAuthenticatedRequest('workshops')
        ]);
        
        if (eventsRes.success) setEvents(eventsRes.events);
        if (workshopsRes.success) setWorkshops(workshopsRes.workshops);
      } catch (error) {
        setError('Failed to load events and workshops');
      }
    };

    fetchEventsAndWorkshops();
  }, []);

  // Fetch students for selected class
  const fetchStudents = async () => {
    if (!selectedBranch || !selectedClass) return;

    setLoading(true);
    try {
      const response = await api.makeAuthenticatedRequest(
        `offline-registration/class-students?branch=${selectedBranch}&class=${selectedClass}`
      );

      if (response.success) {
        setStudents(response.students);
        // Initialize selections
        const initialSelections = {};
        response.students.forEach(student => {
          initialSelections[student.studentId] = {
            selected: false,
            events: student.selectedEvents?.map(e => e.eventId) || [],
            workshops: student.selectedWorkshops?.map(w => w.workshopId) || [],
            paymentStatus: student.paymentStatus || 'PENDING'
          };
        });
        setSelectedStudents(initialSelections);
      }
    } catch (error) {
      setError('Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [selectedBranch, selectedClass]);

  // Bulk update handlers
  const handleBulkSelect = (isSelected) => {
    setSelectedStudents(prev => {
      const newSelections = { ...prev };
      students.forEach(student => {
        newSelections[student.studentId] = {
          ...newSelections[student.studentId],
          selected: isSelected
        };
      });
      return newSelections;
    });
  };

  const handleBulkTypeUpdate = async () => {
    const selectedIds = Object.entries(selectedStudents)
      .filter(([_, data]) => data.selected)
      .map(([id]) => id);
  
    if (!selectedIds.length) {
      setError('No students selected');
      return;
    }
  
    setLoading(true);
    try {
      // First update registration type
      const typeResponse = await api.makeAuthenticatedRequest(
        'offline-registration/update-selections',
        {
          method: 'PUT',
          body: JSON.stringify({
            studentIds: selectedIds,
            registrationType: bulkType,
            receivedBy: api.coordinator.name
          })
        }
      );
  
      if (!typeResponse.success) {
        throw new Error(typeResponse.error);
      }
  
      // Then update payment status
      const paymentResponse = await api.makeAuthenticatedRequest(
        'offline-registration/bulk-payment-update',
        {
          method: 'POST',
          body: JSON.stringify({
            studentIds: selectedIds,
            paymentStatus: 'PAID',
            receivedBy: api.coordinator.name
          })
        }
      );
  
      if (!paymentResponse.success) {
        throw new Error(paymentResponse.error);
      }
  
      setSuccess('Updated registrations and sent QR codes!');
      fetchStudents();
    } catch (error) {
      setError('Update failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <div className="min-h-screen bg-gray-900 text-white py-6 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-400">Class Registration Management</h1>
          <p className="text-gray-400">Upload Excel or manage registrations</p>
        </div>

        {/* Excel Upload Section */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Excel Upload</h2>
          <div className="flex flex-col gap-4">
            <input
              type="file"
              ref={fileInputRef}
              accept=".xlsx,.xls"
              onChange={handleExcelUpload}
              className="block w-full text-sm text-gray-400
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-600 file:text-white
                hover:file:bg-blue-700"
            />
            {uploadData && (
                    <div className="mt-4">
                        <h3 className="text-lg font-semibold mb-2">Data Preview</h3>
                        <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-700">
                            <thead className="bg-gray-700">
                            <tr>
                                <th className="px-4 py-2 text-left text-xs">Student ID</th>
                                <th className="px-4 py-2 text-left text-xs">Name</th>
                                <th className="px-4 py-2 text-left text-xs">Branch</th>
                                <th className="px-4 py-2 text-left text-xs">Class</th>
                                <th className="px-4 py-2 text-left text-xs">Email</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-700">
                            {uploadData.slice(0, 5).map((student, index) => (
                                <tr key={index} className="hover:bg-gray-700">
                                <td className="px-4 py-2">{student.studentId}</td>
                                <td className="px-4 py-2">{student.name}</td>
                                <td className="px-4 py-2">{student.branch}</td>
                                <td className="px-4 py-2">{student.class}</td>
                                <td className="px-4 py-2">{student.email}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                        {uploadData.length > 5 && (
                            <p className="mt-2 text-sm text-gray-400">
                            Showing first 5 of {uploadData.length} records
                            </p>
                        )}
                        </div>
                        <div className="mt-4 flex gap-4">
                        <button
                            onClick={handleImportData}
                            disabled={loading}
                            className="px-4 py-2 bg-green-600 rounded hover:bg-green-700 disabled:opacity-50"
                        >
                            {loading ? 'Importing...' : 'Import Students'}
                        </button>
                        <button
                            onClick={() => {
                            setUploadData(null);
                            if (fileInputRef.current) {
                                fileInputRef.current.value = '';
                            }
                            }}
                            className="px-4 py-2 bg-red-600 rounded hover:bg-red-700"
                        >
                            Cancel
                        </button>
                        </div>
                    </div>
                    )}
          </div>
        </div>

{/* Add this after the Excel upload section */}
<div className="mb-6">
  <div className="flex justify-between items-center mb-4">
    <h2 className="text-xl font-semibold">Class-wise Summary</h2>
    <div className="flex gap-4">
      <button
        onClick={() => setCurrentView('excel')}
        className={`px-4 py-2 rounded ${
          currentView === 'excel' ? 'bg-blue-600' : 'bg-gray-700'
        }`}
      >
        Excel View
      </button>
      <button
        onClick={() => setCurrentView('class')}
        className={`px-4 py-2 rounded ${
          currentView === 'class' ? 'bg-blue-600' : 'bg-gray-700'
        }`}
      >
        Class View
      </button>
    </div>
  </div>

  {currentView === 'class' && (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Object.entries(categorizedData).map(([branch, classes]) => (
        <div key={branch} className="bg-gray-800 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-2">{branch}</h3>
          {Object.entries(classes).map(([className, students]) => (
            <div key={className} className="mb-2">
              <div className="flex justify-between items-center mb-1">
                <span>{className}</span>
                <span className="text-sm text-gray-400">
                  {students.length} students
                </span>
              </div>
              <div className="text-sm text-gray-400">
                Pending: {students.filter(s => s.paymentStatus === 'PENDING').length}
                &nbsp;|&nbsp;
                Paid: {students.filter(s => s.paymentStatus === 'PAID').length}
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  )}
</div>

        {/* Class Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <select
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
            className="p-2 rounded bg-gray-800 border border-gray-700 text-white"
          >
            <option value="">Select Branch</option>
            <option value="CSE">CSE</option>
            <option value="ECE">ECE</option>
            <option value="CIVIL">CIVIL</option>
            <option value="MECH">MECH</option>
            <option value="CHEMICAL">CHEMICAL</option>
            <option value="PUC">PUC</option>
          </select>

          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="p-2 rounded bg-gray-800 border border-gray-700 text-white"
          >
            <option value="">Select Class</option>
            {/* Generate class options based on branch */}
            {selectedBranch && [...Array(4)].map((_, i) => (
              <option key={i} value={`${selectedBranch}-${i+1}`}>
                {`${selectedBranch}-${i+1}`}
              </option>
            ))}
          </select>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-4 p-4 bg-red-900 border border-red-600 text-red-200 rounded">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-4 bg-green-900 border border-green-600 text-green-200 rounded">
            {success}
          </div>
        )}

        {/* Bulk Actions */}
        {/* Bulk Actions */}
<div className="bg-gray-800 rounded-lg p-4 mb-6">
    <div className="flex flex-wrap gap-4 items-center">
        <button
        onClick={() => handleBulkSelect(true)}
        className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700"
        >
        Select All
        </button>
        <button
        onClick={() => handleBulkSelect(false)}
        className="px-4 py-2 bg-gray-600 rounded hover:bg-gray-700"
        >
        Deselect All
        </button>
        <select
        value={bulkType}
        onChange={(e) => setBulkType(e.target.value)}
        className="px-4 py-2 rounded bg-gray-700 border border-gray-600"
        >
        <option value="events">Events (₹199)</option>
        <option value="workshop">Workshop (₹199)</option>
        <option value="both">Both (₹299)</option>
        </select>
        <button
        onClick={handleBulkTypeUpdate}
        disabled={loading}
        className="px-4 py-2 bg-green-600 rounded hover:bg-green-700 disabled:opacity-50"
        >
        {loading ? 'Updating...' : 'Update & Mark as Paid'}
        </button>
    </div>
    </div>

        {/* Students Table */}
        <div className="bg-gray-800 rounded-lg shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">
                    Select
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">
                    Student ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">
                    Events
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">
                    Workshops
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">
                    Payment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {students.map(student => (
                  <tr key={student.studentId} className="hover:bg-gray-700">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedStudents[student.studentId]?.selected || false}
                        onChange={() => handleStudentSelect(student.studentId)}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                      {student.studentId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                      {student.name}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-2">
                        {events.map(event => (
                          <label key={event._id} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={selectedStudents[student.studentId]?.events.includes(event._id)}
                              onChange={() => handleEventSelection(student.studentId, event._id, 'events')}
                              className="h-4 w-4 rounded border-gray-300"
                            />
                            <span className="text-sm text-gray-300">{event.name}</span>
                          </label>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-2">
                        {workshops.map(workshop => (
                          <label key={workshop._id} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={selectedStudents[student.studentId]?.workshops.includes(workshop._id)}
                              onChange={() => handleEventSelection(student.studentId, workshop._id, 'workshops')}
                              className="h-4 w-4 rounded border-gray-300"
                            />
                            <span className="text-sm text-gray-300">{workshop.name}</span>
                          </label>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handlePaymentStatus(student.studentId)}
                        className={`px-3 py-1 rounded text-sm ${
                          selectedStudents[student.studentId]?.paymentStatus === 'PAID'
                            ? 'bg-green-600 hover:bg-green-700'
                            : 'bg-yellow-600 hover:bg-yellow-700'
                        }`}
                      >
                        {selectedStudents[student.studentId]?.paymentStatus}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-gray-300">
                      {selectedStudents[student.studentId]?.qrGenerated ? 'QR Sent' : 'Pending'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClassRegistration;