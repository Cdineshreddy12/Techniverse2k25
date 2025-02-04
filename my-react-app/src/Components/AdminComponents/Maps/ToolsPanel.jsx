// src/Components/AdminComponents/Maps/ToolsPanel.jsx
import React, { useCallback } from 'react';
import { 
  TreePine, Building2, Route, CircleDot, 
  Plus, Minus, Save, FolderOpen, Grid, HomeIcon 
} from 'lucide-react';
import { useMap } from './MapContext';

const ToolButton = ({ selected, onClick, icon, label, className = '' }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 text-sm rounded-md flex items-center gap-2 
      transition-all duration-200 ${className}
      ${selected 
        ? 'bg-blue-500 text-white shadow-md transform scale-105' 
        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
  >
    {icon}
    <span>{label}</span>
  </button>
);

export const ToolsPanel = ({
  selectedTool,
  setSelectedTool,
  newBuildingName,
  setNewBuildingName,
  handleZoom,
  zoom
}) => {
  const { 
    showingRooms, 
    setShowingRooms, 
    snapToGrid, 
    setSnapToGrid,
    saveMap,
    loadMap
  } = useMap();

  const elementTypeButtons = [
    { id: 'select', icon: <CircleDot className="w-4 h-4" />, label: 'Select' },
    { id: 'building', icon: <Building2 className="w-4 h-4" />, label: 'Building' },
    { id: 'road', icon: <Route className="w-4 h-4" />, label: 'Road' },
    { id: 'tree', icon: <TreePine className="w-4 h-4" />, label: 'Tree' },
  ];

  const handleSave = useCallback(async () => {
    try {
      await saveMap();
      alert('Map saved successfully!');
    } catch (error) {
      console.error('Error saving map:', error);
      alert('Failed to save map. Please try again.');
    }
  }, [saveMap]);

  const handleLoad = useCallback(async () => {
    try {
      await loadMap();
    } catch (error) {
      console.error('Error loading map:', error);
      alert('Failed to load map. Please try again.');
    }
  }, [loadMap]);

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 mb-6">
      <div className="flex flex-col gap-4">
        {/* Top Row: Tool Selection */}
        <div className="flex items-center gap-4">
          <div className="flex-grow">
            <input
              type="text"
              value={newBuildingName}
              onChange={(e) => setNewBuildingName(e.target.value)}
              placeholder={selectedTool === 'building' ? 'Enter building name...' : 'Enter element name...'}
              className="w-full px-4 py-2 text-sm border border-slate-300 rounded-md 
                       focus:outline-none focus:ring-2 focus:ring-blue-500 text-black
                       transition-colors duration-200"
            />
          </div>

          <div className="flex gap-2">
            {elementTypeButtons.map(type => (
              <ToolButton
                key={type.id}
                selected={selectedTool === type.id}
                onClick={() => setSelectedTool(type.id)}
                icon={type.icon}
                label={type.label}
              />
            ))}
          </div>
        </div>

        {/* Bottom Row: Controls */}
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <ToolButton
              selected={showingRooms}
              onClick={() => setShowingRooms(!showingRooms)}
              icon={<HomeIcon className="w-4 h-4" />}
              label="Show Rooms"
            />
            <ToolButton
              selected={snapToGrid}
              onClick={() => setSnapToGrid(!snapToGrid)}
              icon={<Grid className="w-4 h-4" />}
              label="Grid Snap"
            />
          </div>

          <div className="flex items-center gap-4">
            {/* Map Controls */}
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                className="px-4 py-2 text-sm bg-green-500 text-white rounded-md 
                         hover:bg-green-600 transition-colors duration-200
                         flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Save
              </button>
              <button
                onClick={handleLoad}
                className="px-4 py-2 text-sm bg-blue-500 text-white rounded-md 
                         hover:bg-blue-600 transition-colors duration-200
                         flex items-center gap-2"
              >
                <FolderOpen className="w-4 h-4" />
                Load
              </button>
            </div>

            {/* Zoom Controls */}
            <div className="flex items-center gap-2 bg-slate-100 rounded-md p-1">
              <button
                onClick={() => handleZoom(-0.1)}
                className="p-1.5 text-slate-700 hover:bg-slate-200 rounded
                         transition-colors duration-200"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="text-sm font-medium text-slate-600 min-w-[3rem] text-center">
                {(zoom * 100).toFixed(0)}%
              </span>
              <button
                onClick={() => handleZoom(0.1)}
                className="p-1.5 text-slate-700 hover:bg-slate-200 rounded
                         transition-colors duration-200"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};