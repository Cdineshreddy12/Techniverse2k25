import React from 'react';
import { Trash2 } from 'lucide-react';
import { useMap } from './MapContext';
import { useBuildingManager } from './BuildingManager';
import { roomTypes, pathStyles } from './types';

export const PropertiesPanel = () => {
  const { 
    selectedElement,
    setSelectedElement,
    updateElement,
    deleteElement,
    currentFloor,
    addFloor
  } = useMap();

  const { addRoom, updateRoom, deleteRoom } = useBuildingManager();

  const handleInputChange = (e, field) => {
    e.stopPropagation();
    updateElement(selectedElement.id, { [field]: e.target.value });
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    deleteElement(selectedElement.id);
    setSelectedElement(null);
  };

  if (!selectedElement) return null;

  return (
    <div className="w-80 bg-white rounded-lg shadow-lg p-4 overflow-y-auto">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-slate-800">
          {selectedElement.type.charAt(0).toUpperCase() + selectedElement.type.slice(1)} Properties
        </h3>
        <button
          onClick={handleDelete}
          className="p-2 text-red-500 hover:bg-red-50 rounded"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-4">
        {/* Common Properties */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Name/Label
          </label>
          <input
            type="text"
            value={selectedElement.label || ''}
            onChange={(e) => handleInputChange(e, 'label')}
            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 text-black"
            onClick={(e) => e.stopPropagation()}
          />
        </div>

        {/* Description Field - Common for all elements */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Description
          </label>
          <textarea
            value={selectedElement.description || ''}
            onChange={(e) => handleInputChange(e, 'description')}
            onClick={(e) => e.stopPropagation()}
            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 text-black"
            rows={3}
            placeholder={`Enter ${selectedElement.type} description...`}
          />
        </div>

        {/* Building Specific Properties */}
        {selectedElement.type === 'building' && (
          <>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Size
              </label>
              <div className="flex gap-2">
                <div>
                  <label className="text-xs text-slate-500">Width</label>
                  <input
                    type="number"
                    min="100"
                    max="800"
                    value={selectedElement.width || 150}
                    onChange={(e) => handleInputChange(e, 'width')}
                    onClick={(e) => e.stopPropagation()}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 text-black"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500">Height</label>
                  <input
                    type="number"
                    min="100"
                    max="600"
                    value={selectedElement.height || 100}
                    onChange={(e) => handleInputChange(e, 'height')}
                    onClick={(e) => e.stopPropagation()}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 text-black"
                  />
                </div>
              </div>
            </div>

            {/* Floor Controls */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-slate-700">
                  Floors
                </label>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    addFloor(selectedElement.id);
                  }}
                  className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Add Floor
                </button>
              </div>
              <div className="bg-slate-50 p-2 rounded">
                Current Floor: {currentFloor + 1} of {selectedElement.floors?.length || 1}
              </div>
            </div>

            {/* Room Management */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-slate-700">
                  Rooms (Floor {currentFloor + 1})
                </label>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    addRoom(selectedElement.id);
                  }}
                  className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Add Room
                </button>
              </div>
              <div className="space-y-2">
                {selectedElement.floors?.find(f => f.level === currentFloor)?.rooms?.map(room => (
                  <div key={room.id} className="border rounded-md p-2 bg-white">
                    <input
                      type="text"
                      value={room.label || ''}
                      onChange={(e) => updateRoom(selectedElement.id, room.id, { label: e.target.value })}
                      onClick={(e) => e.stopPropagation()}
                      className="w-full px-2 py-1 mb-1 border border-slate-300 rounded text-sm text-black"
                    />
                    
                    <div className="flex gap-2 mb-2">
                      <select
                        value={room.type || roomTypes[0].label}
                        onChange={(e) => updateRoom(selectedElement.id, room.id, { 
                          type: e.target.value,
                          color: roomTypes.find(t => t.label === e.target.value)?.color
                        })}
                        onClick={(e) => e.stopPropagation()}
                        className="flex-grow px-2 py-1 border border-slate-300 rounded text-sm text-black"
                      >
                        {roomTypes.map(type => (
                          <option key={type.label} value={type.label}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteRoom(selectedElement.id, room.id);
                        }}
                        className="p-1 text-red-500 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Room Description */}
                    <input
                      type="text"
                      value={room.description || ''}
                      onChange={(e) => updateRoom(selectedElement.id, room.id, { 
                        description: e.target.value 
                      })}
                      onClick={(e) => e.stopPropagation()}
                      className="w-full px-2 py-1 border border-slate-300 rounded text-sm text-black mb-2"
                      placeholder="Room description..."
                    />

                    {/* Room Dimensions */}
                    <div className="grid grid-cols-4 gap-1">
                      <div>
                        <label className="text-xs text-slate-500">X</label>
                        <input
                          type="number"
                          value={room.x || 0}
                          onChange={(e) => updateRoom(selectedElement.id, room.id, { x: Number(e.target.value) })}
                          onClick={(e) => e.stopPropagation()}
                          className="w-full px-2 py-1 border border-slate-300 rounded text-sm text-black"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-slate-500">Y</label>
                        <input
                          type="number"
                          value={room.y || 0}
                          onChange={(e) => updateRoom(selectedElement.id, room.id, { y: Number(e.target.value) })}
                          onClick={(e) => e.stopPropagation()}
                          className="w-full px-2 py-1 border border-slate-300 rounded text-sm text-black"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-slate-500">W</label>
                        <input
                          type="number"
                          value={room.width || 50}
                          onChange={(e) => updateRoom(selectedElement.id, room.id, { width: Number(e.target.value) })}
                          onClick={(e) => e.stopPropagation()}
                          className="w-full px-2 py-1 border border-slate-300 rounded text-sm text-black"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-slate-500">H</label>
                        <input
                          type="number"
                          value={room.height || 40}
                          onChange={(e) => updateRoom(selectedElement.id, room.id, { height: Number(e.target.value) })}
                          onClick={(e) => e.stopPropagation()}
                          className="w-full px-2 py-1 border border-slate-300 rounded text-sm text-black"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};