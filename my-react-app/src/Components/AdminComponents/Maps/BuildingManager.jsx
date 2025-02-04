import { useCallback } from 'react';
import { useMap } from './MapContext';
import { roomTypes } from './types';

export const useBuildingManager = () => {
  const { 
    elements, 
    setElements, 
    currentFloor, 
    setCurrentFloor,
    setSelectedElement 
  } = useMap();

  // Add floor with proper initialization
  const addFloor = useCallback((buildingId) => {
    console.log('Adding floor to building:', buildingId);
    setElements(prev => {
      const building = prev.find(el => el.id === buildingId);
      if (!building) return prev;

      const floors = building.floors || [];
      const newFloor = {
        level: floors.length,
        rooms: []
      };

      const updatedBuilding = {
        ...building,
        floors: [...floors, newFloor]
      };

      // Update the state and selected element
      const newElements = prev.map(el => 
        el.id === buildingId ? updatedBuilding : el
      );

      // Update selected element to reflect changes
      setSelectedElement(updatedBuilding);
      
      // Switch to new floor
      setCurrentFloor(newFloor.level);

      return newElements;
    });
  }, [setElements, setSelectedElement, setCurrentFloor]);

  // Add room with proper initialization
  const addRoom = useCallback((buildingId) => {
    console.log('Adding room to building:', buildingId, 'on floor:', currentFloor);
    setElements(prev => {
      const building = prev.find(el => el.id === buildingId);
      if (!building) return prev;

      const newRoom = {
        id: Date.now(),
        label: 'New Room',
        type: roomTypes[0].label,
        color: roomTypes[0].color,
        width: 50,
        height: 40,
        x: 10,
        y: 10,
        description: ''
      };

      const updatedFloors = (building.floors || []).map(floor => {
        if (floor.level !== currentFloor) return floor;
        return {
          ...floor,
          rooms: [...(floor.rooms || []), newRoom]
        };
      });

      const updatedBuilding = {
        ...building,
        floors: updatedFloors
      };

      // Update state and selected element
      const newElements = prev.map(el => 
        el.id === buildingId ? updatedBuilding : el
      );

      setSelectedElement(updatedBuilding);
      return newElements;
    });
  }, [currentFloor, setElements, setSelectedElement]);

  // Update room with proper state management
  const updateRoom = useCallback((buildingId, roomId, updates) => {
    setElements(prev => prev.map(el => {
      if (el.id !== buildingId) return el;

      const updatedFloors = el.floors.map(floor => {
        if (floor.level !== currentFloor) return floor;

        const updatedRooms = floor.rooms.map(room => {
          if (room.id !== roomId) return room;

          // Create new room with updates
          const newRoom = { ...room, ...updates };
          
          // Apply constraints
          newRoom.width = Math.min(newRoom.width, el.width - newRoom.x - 10);
          newRoom.height = Math.min(newRoom.height, el.height - newRoom.y - 10);
          newRoom.x = Math.min(Math.max(0, newRoom.x), el.width - newRoom.width - 10);
          newRoom.y = Math.min(Math.max(0, newRoom.y), el.height - newRoom.height - 10);

          return newRoom;
        });

        return { ...floor, rooms: updatedRooms };
      });

      const updatedBuilding = { ...el, floors: updatedFloors };
      setSelectedElement(updatedBuilding);
      return updatedBuilding;
    }));
  }, [currentFloor, setElements, setSelectedElement]);

  // Delete room with proper cleanup
  const deleteRoom = useCallback((buildingId, roomId) => {
    setElements(prev => prev.map(el => {
      if (el.id !== buildingId) return el;

      const updatedFloors = el.floors.map(floor => {
        if (floor.level !== currentFloor) return floor;
        return {
          ...floor,
          rooms: floor.rooms.filter(r => r.id !== roomId)
        };
      });

      const updatedBuilding = { ...el, floors: updatedFloors };
      setSelectedElement(updatedBuilding);
      return updatedBuilding;
    }));
  }, [currentFloor, setElements, setSelectedElement]);

  return {
    addFloor,
    addRoom,
    updateRoom,
    deleteRoom
  };
};