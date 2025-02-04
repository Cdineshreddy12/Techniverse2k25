import React from 'react';
import { CheckSquare, Square } from 'lucide-react';

export const ColumnSelection = ({ availableColumns, selectedColumns, setSelectedColumns }) => {
  const toggleColumn = (column) => {
    setSelectedColumns(prev => 
      prev.includes(column)
        ? prev.filter(col => col !== column)
        : [...prev, column]
    );
  };

  return (
    <div className="p-6 border-b border-gray-700">
      <h3 className="text-white font-semibold mb-4">Select Columns to Export</h3>
      <div className="flex flex-wrap gap-3">
        {availableColumns.map(column => (
          <button
            key={column}
            onClick={() => toggleColumn(column)}
            className={`px-3 py-1.5 rounded-lg flex items-center space-x-2 text-sm ${
              selectedColumns.includes(column)
                ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                : 'bg-gray-700 text-gray-400 border border-gray-600'
            }`}
          >
            {selectedColumns.includes(column) ? (
              <CheckSquare className="w-4 h-4" />
            ) : (
              <Square className="w-4 h-4" />
            )}
            <span>{column}</span>
          </button>
        ))}
      </div>
    </div>
  );
};