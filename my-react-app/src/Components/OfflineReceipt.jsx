import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useApi } from '../config/useApi';
import html2canvas from 'html2canvas';
import { jsPDF } from "jspdf";

const ReceiptPage = () => {
  const { receiptNumber } = useParams();
  const api = useApi();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const receiptRef = useRef(null);

  // Existing data fetching logic remains the same
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.makeAuthenticatedRequest(`offlineregistration/${receiptNumber}`);
        if (!response.success) {
          throw new Error(response.error || 'Failed to fetch receipt');
        }
        if (response.registration) {
          setData(response.registration);
        } else {
          throw new Error('Invalid response format');
        }
      } catch (err) {
        console.error('Receipt fetch error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (receiptNumber && api) {
      fetchData();
    }
  }, [receiptNumber, api]);

  const numberToWords = (num) => {
    // Your existing numberToWords function
  };

  const downloadReceipt = async () => {
    if (!receiptRef.current) return;

    try {
      const button = document.getElementById('downloadButton');
      const originalText = button.innerText;
      button.innerText = 'Generating PDF...';
      button.disabled = true;

      const canvas = await html2canvas(receiptRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      const imgWidth = 210;
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`TECHNIVERSE_Receipt_${data.receiptNumber}.pdf`);

      button.innerText = originalText;
      button.disabled = false;
    } catch (err) {
      console.error('PDF generation error:', err);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  if (!api.isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-bold mb-4">Authentication Required</h1>
          <button
            onClick={() => api.login()}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
          >
            Login
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center text-gray-600">Loading receipt...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center text-red-600 max-w-md mx-auto p-4 bg-white rounded shadow">
          <h2 className="text-lg font-bold mb-2">Error Loading Receipt</h2>
          <p>{error}</p>
          <button
            onClick={() => window.history.back()}
            className="mt-4 bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center text-gray-600">Receipt not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-8">
      {/* Preview Container */}
      <div className="max-w-3xl mx-auto bg-white shadow-xl rounded-lg overflow-hidden mb-6 border border-gray-200">
        <div className="p-6 md:p-8" ref={receiptRef}>
          {/* Header */}
          <div className="text-center mb-8 border-b border-gray-200 pb-6">
            <h1 className="text-xl md:text-2xl font-bold text-gray-800 leading-tight">
              RAJIV GANDHI UNIVERSITY OF KNOWLEDGE TECHNOLOGIES-SRIKAKULAM
            </h1>
            <p className="text-sm mt-2 text-gray-600">
              CATERING TO THE EDUCATIONAL NEEDS OF GIFTED RURAL YOUTH OF ANDHRA PRADESH
            </p>
            <div className="mt-6">
              <h2 className="text-3xl font-bold text-blue-600">TECHNIVERSE</h2>
              <p className="text-lg text-gray-700">NATIONAL TECHNO-MANAGEMENT FEST</p>
            </div>
            <div className="mt-6 flex justify-between text-gray-700">
              <p className="font-medium">Receipt No: {data.receiptNumber}</p>
              <p className="font-medium">2K25</p>
            </div>
            <div className="mt-4">
              <span className="inline-block bg-blue-600 text-white text-xl font-bold px-8 py-2 rounded-full">
                RECEIPT
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="space-y-4">
            {/* Details Grid */}
            <div className="grid gap-4">
              <div className="bg-gray-50 rounded-lg border border-gray-200">
                <div className="grid grid-cols-2">
                  <div className="p-3 font-semibold text-gray-700 bg-gray-100 rounded-l-lg">Student ID & Institute Name</div>
                  <div className="p-3 text-gray-800">{data.studentId}</div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg border border-gray-200">
                <div className="grid grid-cols-2">
                  <div className="p-3 font-semibold text-gray-700 bg-gray-100 rounded-l-lg">Name</div>
                  <div className="p-3 text-gray-800">{data.name}</div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg border border-gray-200">
                <div className="grid grid-cols-2">
                  <div className="p-3 font-semibold text-gray-700 bg-gray-100 rounded-l-lg">Branch</div>
                  <div className="p-3 text-gray-800">{data.branch}</div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg border border-gray-200">
                <div className="grid grid-cols-2">
                  <div className="p-3 font-semibold text-gray-700 bg-gray-100 rounded-l-lg">Class</div>
                  <div className="p-3 text-gray-800">{data.class}</div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg border border-gray-200">
                <div className="grid grid-cols-2">
                  <div className="p-3 font-semibold text-gray-700 bg-gray-100 rounded-l-lg">Mobile No</div>
                  <div className="p-3 text-gray-800">{data.mobileNo}</div>
                </div>
              </div>
            </div>

            {/* Registration Type */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex space-x-8">
                <label className="flex items-center">
                  <input 
                    type="checkbox" 
                    checked={data.registrationType === 'events'} 
                    readOnly
                    className="mr-2 h-4 w-4 text-blue-600"
                  />
                  <span className="text-gray-700">Events</span>
                </label>
                <label className="flex items-center">
                  <input 
                    type="checkbox" 
                    checked={data.registrationType === 'workshop'} 
                    readOnly
                    className="mr-2 h-4 w-4 text-blue-600"
                  />
                  <span className="text-gray-700">Only Workshop</span>
                </label>
                <label className="flex items-center">
                  <input 
                    type="checkbox" 
                    checked={data.registrationType === 'both'} 
                    readOnly
                    className="mr-2 h-4 w-4 text-blue-600"
                  />
                  <span className="text-gray-700">Workshop + Events</span>
                </label>
              </div>
            </div>

            {/* Fee Details */}
            <div className="mt-6 space-y-4">
              <div className="bg-blue-50 rounded-lg border border-blue-200">
                <div className="grid grid-cols-2">
                  <div className="p-3 font-semibold text-blue-700 bg-blue-100 rounded-l-lg">Registration Fees</div>
                  <div className="p-3 text-blue-800 font-medium">₹{data.registrationFee}</div>
                </div>
              </div>

              <div className="bg-blue-50 rounded-lg border border-blue-200">
                <div className="grid grid-cols-2">
                  <div className="p-3 font-semibold text-blue-700 bg-blue-100 rounded-l-lg">Registration Fee(in words)</div>
                  <div className="p-3 text-blue-800">{numberToWords(data.registrationFee)} Rupees Only</div>
                </div>
              </div>
            </div>
          </div>

          {/* Signature */}
          <div className="mt-12 text-right">
            <p className="inline-block border-t-2 border-gray-400 px-4 pt-2 text-gray-700">
              Signature of receiver ({data.receivedBy})
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="max-w-3xl mx-auto flex justify-center space-x-4">
        <button 
          id="downloadButton"
          onClick={downloadReceipt} 
          className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
        >
          Download Receipt
        </button>
        <button 
          onClick={() => window.print()} 
          className="bg-gray-700 text-white px-8 py-3 rounded-lg hover:bg-gray-800 transition-colors shadow-lg"
        >
          Print Receipt
        </button>
      </div>
    </div>
  );
};

export default ReceiptPage;