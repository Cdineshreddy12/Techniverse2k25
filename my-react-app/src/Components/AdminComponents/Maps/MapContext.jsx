// src/Components/AdminComponents/Maps/MapContext.jsx
import React, { createContext, useContext, useState, useCallback } from 'react';
import { roomTypes, pathStyles } from './types';
import { useEffect } from 'react';
const MapContext = createContext(null);

export const MapProvider = ({ children }) => {
  const [elements, setElements] = useState([]);
  const [selectedElement, setSelectedElement] = useState(null);
  const [currentFloor, setCurrentFloor] = useState(0);
  const [showingRooms, setShowingRooms] = useState(false);
  const [gridSize] = useState(20);
  const [snapToGrid, setSnapToGrid] = useState(true);
  const [isDrawing, setIsDrawing] = useState(false);
  const [pathStart, setPathStart] = useState(null);

  // Helper function to snap values to grid
  const snapToGridValue = useCallback((value) => {
    if (!snapToGrid) return value;
    return Math.round(value / gridSize) * gridSize;
  }, [snapToGrid, gridSize]);

  // Add element with proper initialization
  const addElement = useCallback((type, x, y, label = '') => {
    const snappedX = snapToGridValue(x);
    const snappedY = snapToGridValue(y);

    const newElement = {
      id: Date.now(),
      type,
      x: snappedX,
      y: snappedY,
      label: label || 'New Element',
      description: '',
    };

    switch (type) {
      case 'building':
        Object.assign(newElement, {
          width: 150,
          height: 100,
          color: '#ffffff',
          floors: [{
            level: 0,
            rooms: []
          }],
        });
        break;
      case 'tree':
        Object.assign(newElement, {
          width: 30,
          height: 30,
          color: '#4CAF50',
        });
        break;
      case 'road':
        if (!pathStart) return null;
        Object.assign(newElement, {
          startX: pathStart.x,
          startY: pathStart.y,
          endX: snappedX,
          endY: snappedY,
          width: 4,
          color: '#666666',
          dashArray: ''
        });
        break;
    }

    setElements(prev => [...prev, newElement]);
    return newElement;
  }, [pathStart, snapToGridValue]);

  // Update element with proper size constraints
  const updateElement = useCallback((id, updates) => {
    console.log('Updating element:', id, updates); // Debug log
    setElements(prev => prev.map(el => {
      if (el.id !== id) return el;
  
      // Create a new element with all previous properties
      const newEl = { ...el };
  
      // Handle description updates immediately
      if ('description' in updates) {
        newEl.description = updates.description;
      }
  
      // Handle label updates
      if ('label' in updates) {
        newEl.label = updates.label;
      }
  
      // Handle size updates with constraints
      if ('width' in updates) {
        newEl.width = Math.max(100, Math.min(800, updates.width));
      }
      if ('height' in updates) {
        newEl.height = Math.max(100, Math.min(600, updates.height));
      }
  
      // Handle position updates with grid snapping
      if ('x' in updates) {
        newEl.x = snapToGridValue(updates.x);
      }
      if ('y' in updates) {
        newEl.y = snapToGridValue(updates.y);
      }
  
      // Handle floor updates
      if ('floors' in updates) {
        newEl.floors = updates.floors.map(floor => ({
          ...floor,
          rooms: (floor.rooms || []).map(room => ({
            ...room,
            width: Math.min(room.width || 50, newEl.width - 20),
            height: Math.min(room.height || 40, newEl.height - 20),
            x: Math.min(room.x || 10, newEl.width - (room.width || 50)),
            y: Math.min(room.y || 10, newEl.height - (room.height || 40))
          }))
        }));
      }
  
      // Handle all other updates
      return { ...newEl, ...updates };
    }));
  }, [snapToGridValue]);
  
  // Add this debug useEffect
  useEffect(() => {
    console.log('Current elements:', elements);
  }, [elements]);

  // Add floor with proper initialization
  const addFloor = useCallback((buildingId) => {
    setElements(prev => {
      const buildingIndex = prev.findIndex(el => el.id === buildingId);
      if (buildingIndex === -1) return prev;

      const building = prev[buildingIndex];
      const floors = building.floors || [];
      const newFloor = {
        level: floors.length,
        rooms: []
      };

      const updatedBuilding = {
        ...building,
        floors: [...floors, newFloor]
      };

      const newElements = [...prev];
      newElements[buildingIndex] = updatedBuilding;

      // Update selected element if it's the current building
      if (selectedElement?.id === buildingId) {
        setSelectedElement(updatedBuilding);
      }

      return newElements;
    });

    // Switch to new floor
    setCurrentFloor(prev => prev + 1);
  }, [selectedElement]);

  const contextValue = {
    elements,
    setElements,
    selectedElement,
    setSelectedElement,
    currentFloor,
    setCurrentFloor,
    showingRooms,
    setShowingRooms,
    gridSize,
    snapToGrid,
    setSnapToGrid,
    isDrawing,
    setIsDrawing,
    pathStart,
    setPathStart,
    addElement,
    updateElement,
    addFloor,
  };

  return (
    <MapContext.Provider value={contextValue}>
      {children}
    </MapContext.Provider>
  );
};

export const useMap = () => {
  const context = useContext(MapContext);
  if (!context) {
    throw new Error('useMap must be used within a MapProvider');
  }
  return context;
};