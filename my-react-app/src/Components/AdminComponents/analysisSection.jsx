import React, { useState } from 'react';
import { FileSpreadsheet, ChevronDown, ChevronRight, Loader } from 'lucide-react';
import { useRegistrationAnalysis } from './useAnalysis.jsx';

export const AnalysisSection = () => {
  const [expandedDepts, setExpandedDepts] = useState(new Set());
  const { mutate: analyzeFile, isLoading, data: analysisData } = useRegistrationAnalysis();

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      analyzeFile(file);
    }
  };

  const toggleDepartment = (dept) => {
    const newExpanded = new Set(expandedDepts);
    if (newExpanded.has(dept)) {
      newExpanded.delete(dept);
    } else {
      newExpanded.add(dept);
    }
    setExpandedDepts(newExpanded);
  };

  return (
    <div className="mt-8 bg-gray-800/50 backdrop-blur-xl rounded-lg shadow-lg border border-gray-700">
      <div className="p-6 border-b border-gray-700">
        <h2 className="text-xl font-bold text-white mb-4">Registration Analysis</h2>
        
        <div className="flex items-center space-x-4">
          <label className="flex items-center px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 cursor-pointer">
            <FileSpreadsheet className="w-5 h-5 mr-2" />
            <span>Upload Excel File</span>
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
          {isLoading && (
            <div className="flex items-center text-gray-400">
              <Loader className="w-5 h-5 animate-spin mr-2" />
              <span>Analyzing data...</span>
            </div>
          )}
        </div>
      </div>

      {analysisData && (
        <div className="p-6">
          {/* Overall Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-lg p-6 border border-green-500/20">
              <h3 className="text-gray-400 text-sm mb-2">Total Registered</h3>
              <p className="text-3xl font-bold text-white">
                {analysisData.total.registered}
              </p>
            </div>
            <div className="bg-gradient-to-br from-red-500/10 to-orange-500/10 rounded-lg p-6 border border-red-500/20">
              <h3 className="text-gray-400 text-sm mb-2">Total Unregistered</h3>
              <p className="text-3xl font-bold text-white">
                {analysisData.total.unregistered}
              </p>
            </div>
          </div>

          {/* Department Breakdown */}
          <div className="space-y-4">
            {Object.entries(analysisData.departments).map(([dept, data]) => (
              <div key={dept} className="border border-gray-700 rounded-lg overflow-hidden">
                <div
                  className="flex justify-between items-center p-4 bg-gray-800/50 cursor-pointer hover:bg-gray-700/50"
                  onClick={() => toggleDepartment(dept)}
                >
                  <div className="flex items-center space-x-2">
                    {expandedDepts.has(dept) ? (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    )}
                    <h3 className="text-lg font-semibold text-white">{dept}</h3>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-green-400">
                      {data.departmentTotal.registered} registered
                    </span>
                    <span className="text-red-400">
                      {data.departmentTotal.unregistered} unregistered
                    </span>
                  </div>
                </div>

                {expandedDepts.has(dept) && (
                  <div className="p-4 bg-gray-800/30">
                    {Object.entries(data.years).map(([year, yearData]) => (
                      <div key={year} className="mt-4 first:mt-0">
                        <h4 className="text-lg font-medium text-gray-300 mb-3">
                          Year {year}
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Registered Students */}
                          <div className="bg-green-500/5 rounded-lg p-4">
                            <h5 className="text-sm font-medium text-green-400 mb-2">
                              Registered ({yearData.registered.length})
                            </h5>
                            <div className="max-h-48 overflow-y-auto">
                              {yearData.registered.map(student => (
                                <div
                                  key={student.email}
                                  className="text-sm text-gray-300 p-2 hover:bg-green-500/10 rounded"
                                >
                                  {student.name} ({student.rollNumber})
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Unregistered Students */}
                          <div className="bg-red-500/5 rounded-lg p-4">
                            <h5 className="text-sm font-medium text-red-400 mb-2">
                              Unregistered ({yearData.unregistered.length})
                            </h5>
                            <div className="max-h-48 overflow-y-auto">
                              {yearData.unregistered.map(student => (
                                <div
                                  key={student.email}
                                  className="text-sm text-gray-300 p-2 hover:bg-red-500/10 rounded"
                                >
                                  {student.name} ({student.rollNumber})
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};