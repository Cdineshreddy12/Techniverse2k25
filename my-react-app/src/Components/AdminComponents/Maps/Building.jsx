import React, { useState, useCallback } from 'react';
import { useMap } from './MapContext';

export const Building = ({ element, onSelect }) => {
  const { selectedElement, showingRooms, currentFloor, updateElement } = useMap();
  const [isHovered, setIsHovered] = useState(false);
  const [resizing, setResizing] = useState(false);
  const [resizeStart, setResizeStart] = useState(null);

  // Get current floor data
  const currentFloorData = element.floors?.find(f => f.level === currentFloor) || element.floors?.[0];
  const isSelected = selectedElement?.id === element.id;

  // Handle resize
  const handleResizeStart = useCallback((e) => {
    e.stopPropagation();
    setResizing(true);
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: element.width,
      height: element.height
    });
  }, [element.width, element.height]);

  const handleResize = useCallback((e) => {
    if (!resizing || !resizeStart) return;

    const deltaX = e.clientX - resizeStart.x;
    const deltaY = e.clientY - resizeStart.y;

    const newWidth = Math.max(150, Math.min(800, resizeStart.width + deltaX));
    const newHeight = Math.max(100, Math.min(600, resizeStart.height + deltaY));

    updateElement(element.id, {
      width: newWidth,
      height: newHeight
    });
  }, [resizing, resizeStart, element.id, updateElement]);

  const handleResizeEnd = useCallback(() => {
    setResizing(false);
    setResizeStart(null);
  }, []);

  // Handle click to select
  const handleClick = useCallback((e) => {
    e.stopPropagation();
    onSelect(e, element);
  }, [onSelect, element]);

  // Effect for resize listeners
  React.useEffect(() => {
    if (resizing) {
      window.addEventListener('mousemove', handleResize);
      window.addEventListener('mouseup', handleResizeEnd);
    }
    return () => {
      window.removeEventListener('mousemove', handleResize);
      window.removeEventListener('mouseup', handleResizeEnd);
    };
  }, [resizing, handleResize, handleResizeEnd]);

  return (
    <div
      className="absolute select-none"
      style={{
        left: element.x,
        top: element.y,
        width: element.width,
        height: element.height,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
    >
      {/* Building Body */}
      <div
        className={`w-full h-full border-2 rounded-md transition-all duration-200 relative
          ${isSelected ? 'border-blue-500 ring-2 ring-blue-200' : 'border-slate-300'}
          ${isHovered ? 'shadow-lg' : ''}`}
        style={{
          backgroundColor: element.color || '#ffffff',
        }}
      >
        {/* Building Label */}
        <div className="p-3">
          <div className="font-medium text-slate-800 mb-1">
            {element.label}
          </div>
          {element.description && (
            <div className="text-xs text-slate-600">
              {element.description}
            </div>
          )}
        </div>

        {/* Floor Indicator */}
        <div className="absolute top-2 right-2 text-xs bg-slate-700 text-white px-2 py-1 rounded">
          Floor {currentFloor + 1} of {element.floors?.length || 1}
        </div>

        {/* Rooms Container */}
        {showingRooms && currentFloorData?.rooms && (
          <div className="absolute inset-4 border border-dashed border-slate-300 rounded">
            {currentFloorData.rooms.map(room => (
              <div
                key={room.id}
                className="absolute border border-slate-300 rounded bg-white shadow-sm
                         hover:shadow-md transition-shadow duration-200"
                style={{
                  left: room.x,
                  top: room.y,
                  width: room.width,
                  height: room.height,
                }}
              >
                <div className="p-1">
                  <div className="text-xs font-medium truncate">{room.label}</div>
                  {room.description && (
                    <div className="text-[10px] text-slate-500 truncate">
                      {room.description}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Hover Description Tooltip */}
        {isHovered && element.description && (
          <div className="absolute z-50 -top-12 left-1/2 transform -translate-x-1/2
                       bg-black bg-opacity-75 text-white p-2 rounded-md text-sm whitespace-nowrap">
            {element.description}
          </div>
        )}

        {/* Resize Handle */}
        {isSelected && (
          <div
            className="absolute bottom-0 right-0 w-4 h-4 bg-blue-500 cursor-se-resize
                     transform translate-x-1/2 translate-y-1/2 rounded-sm"
            onMouseDown={handleResizeStart}
          />
        )}
      </div>
    </div>
  );
};