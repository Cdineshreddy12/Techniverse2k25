// src/Components/AdminComponents/Maps/FloorControls.jsx
import React from 'react';
import { ChevronUp, ChevronDown, Plus } from 'lucide-react';

export const FloorControls = ({ 
  currentFloor, 
  setCurrentFloor, 
  totalFloors,
  onAddFloor 
}) => {
  const handleFloorChange = (newFloor) => {
    if (newFloor >= 0 && newFloor < totalFloors) {
      setCurrentFloor(newFloor);
    }
  };

  const handleAddFloor = (e) => {
    e.stopPropagation();
    onAddFloor();
  };

  return (
    <div className="fixed top-20 right-4 bg-white rounded-lg shadow-lg p-3 z-50">
      <div className="flex flex-col gap-2">
        <div className="text-center font-medium text-sm text-slate-600 pb-2 border-b">
          Floor Controls
        </div>
        
        <div className="flex flex-col gap-1 items-center">
          {/* Up Button */}
          <button
            onClick={() => handleFloorChange(currentFloor + 1)}
            disabled={currentFloor === totalFloors - 1}
            className="p-2 text-slate-700 hover:bg-slate-100 rounded disabled:opacity-50
                     disabled:cursor-not-allowed transition-all duration-200"
          >
            <ChevronUp className="w-4 h-4" />
          </button>
          
          {/* Floor Buttons */}
          <div className="flex flex-col gap-1 max-h-48 overflow-y-auto w-full">
            {Array.from({ length: totalFloors }, (_, i) => (
              <button
                key={i}
                onClick={() => handleFloorChange(i)}
                className={`px-4 py-2 text-sm rounded transition-all duration-200
                  ${currentFloor === i 
                    ? 'bg-blue-500 text-white shadow-md transform scale-105'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
              >
                Floor {i + 1}
              </button>
            ))}
          </div>
          
          {/* Down Button */}
          <button
            onClick={() => handleFloorChange(currentFloor - 1)}
            disabled={currentFloor === 0}
            className="p-2 text-slate-700 hover:bg-slate-100 rounded disabled:opacity-50
                     disabled:cursor-not-allowed transition-all duration-200"
          >
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>

        {/* Add Floor Button */}
        <button
          onClick={handleAddFloor}
          className="mt-2 px-4 py-2 text-sm bg-green-500 text-white rounded hover:bg-green-600 
                   flex items-center justify-center gap-2 transition-all duration-200"
        >
          <Plus className="w-4 h-4" />
          Add Floor
        </button>

        {/* Floor Counter */}
        <div className="text-xs text-center text-slate-500 pt-2 border-t">
          Floor {currentFloor + 1} of {totalFloors}
        </div>
      </div>
    </div>
  );
};