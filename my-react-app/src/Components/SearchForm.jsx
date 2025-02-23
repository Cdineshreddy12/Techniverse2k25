// SearchForm.jsx
import React, { useState } from 'react';

const SearchForm = ({ onSubmit, loading, isUpdateMode, resetForm }) => {
  const [localSearchData, setLocalSearchData] = useState({ studentId: '', email: '' });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setLocalSearchData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(localSearchData);
  };

  return (
    <div className="bg-gray-800 rounded-lg shadow-xl overflow-hidden mb-6">
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-lg font-semibold">Update Existing Registration</h2>
      </div>
      <div className="p-4">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm text-gray-300">Student ID</label>
              <input
                type="text"
                name="studentId"
                placeholder="Enter Student ID"
                value={localSearchData.studentId}
                onChange={handleInputChange}
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400"
                required
                disabled={loading || isUpdateMode}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-gray-300">Email Address</label>
              <input
                type="email"
                name="email"
                placeholder="Enter Email"
                value={localSearchData.email}
                onChange={handleInputChange}
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400"
                required
                disabled={loading || isUpdateMode}
              />
            </div>
          </div>
          <div className="mt-4 flex justify-end gap-3">
            {isUpdateMode && (
              <button
                type="button"
                onClick={() => {
                  resetForm();
                  setLocalSearchData({ studentId: '', email: '' });
                }}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500"
                disabled={loading}
              >
                Cancel Update
              </button>
            )}
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
              disabled={loading || isUpdateMode || !localSearchData.studentId || !localSearchData.email}
            >
              {loading ? (
                <><div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>Searching...</>
              ) : (
                'Search Registration'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SearchForm;
