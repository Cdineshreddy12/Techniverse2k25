import React, { useState, useCallback } from 'react';

export const Room = ({ 
  room,
  isSelected,
  onSelect,
  onDragStart,
  currentFloor = 0
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = useCallback(() => setIsHovered(true), []);
  const handleMouseLeave = useCallback(() => setIsHovered(false), []);

  return (
    <div
      className={`absolute border rounded transition-all duration-200 group
        ${isSelected ? 'ring-2 ring-blue-400 shadow-lg' : 'hover:shadow-md'}
        ${isHovered ? 'z-10' : ''}`}
      style={{
        left: room.x,
        top: room.y,
        width: room.width,
        height: room.height,
        backgroundColor: room.color || '#ffffff',
        transform: `translate(${currentFloor * 1}px, ${currentFloor * 1}px)`,
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseDown={(e) => onDragStart?.(e, room)}
      onClick={(e) => {
        e.stopPropagation();
        onSelect?.(room);
      }}
    >
      {/* Room Label */}
      <div className="p-2 flex flex-col">
        <span className="text-xs font-medium truncate">
          {room.label}
        </span>
        {room.type && (
          <span className="text-[10px] text-slate-500 truncate">
            {room.type}
          </span>
        )}
      </div>

      {/* Room Description Tooltip */}
      {(isHovered || isSelected) && room.description && (
        <div className="absolute left-0 right-0 -top-8 mx-1 z-50
                      bg-black bg-opacity-75 text-white p-1.5 rounded
                      text-[10px] transform -translate-y-1 pointer-events-none">
          {room.description}
        </div>
      )}

      {/* Corner Resize Handle */}
      {isSelected && (
        <div className="absolute bottom-0 right-0 w-3 h-3 
                      bg-blue-500 cursor-se-resize
                      transform translate-x-1/2 translate-y-1/2
                      rounded-sm opacity-0 group-hover:opacity-100
                      transition-opacity duration-200" />
      )}
    </div>
  );
};