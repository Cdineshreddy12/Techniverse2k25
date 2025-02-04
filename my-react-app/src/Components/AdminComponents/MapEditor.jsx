import React, { useState, useCallback } from 'react';
import { MapProvider } from './Maps/MapContext.jsx';
import { ToolsPanel } from './Maps/ToolsPanel.jsx';
import { MapCanvas } from './Maps/MapCanvas.jsx';
import { PropertiesPanel } from './Maps/PropertiesPanel.jsx';
import { FloorControls } from './Maps/floorControls.jsx';

const MapEditor = () => {
  // Local state
  const [selectedTool, setSelectedTool] = useState('select');
  const [newBuildingName, setNewBuildingName] = useState('');
  const [zoom, setZoom] = useState(1);

  const handleZoom = useCallback((delta) => {
    setZoom(prev => Math.min(Math.max(0.5, prev + delta), 2));
  }, []);

  return (
    <MapProvider>
      <div className="bg-slate-100 min-h-screen">
        <div className="max-w-7xl mx-auto p-6">
          {/* Header */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-800 mb-2">
              Interactive Campus Map Editor
            </h2>
            <p className="text-slate-600">
              Create and customize your campus layout with buildings, roads, and more
            </p>
          </div>

          {/* Tools Panel */}
          <ToolsPanel
            selectedTool={selectedTool}
            setSelectedTool={setSelectedTool}
            newBuildingName={newBuildingName}
            setNewBuildingName={setNewBuildingName}
            handleZoom={handleZoom}
            zoom={zoom}
          />

          {/* Main Editor Area */}
          <div className="flex gap-6">
            <MapCanvas
              zoom={zoom}
              selectedTool={selectedTool}
              newBuildingName={newBuildingName}
            />
            <PropertiesPanel />
          </div>
        </div>
      </div>
    </MapProvider>
  );
};

export default MapEditor;