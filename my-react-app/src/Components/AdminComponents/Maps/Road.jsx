import React, { useState, useCallback } from 'react';

export const Road = ({ element, isSelected, onSelect }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Constrain coordinates to viewport
  const constrainCoordinate = useCallback((value) => {
    return Math.max(0, Math.min(value, 3000)); // Set reasonable max bounds
  }, []);

  const startX = constrainCoordinate(element.startX);
  const startY = constrainCoordinate(element.startY);
  const endX = constrainCoordinate(element.endX);
  const endY = constrainCoordinate(element.endY);

  // Get center point for label/description
  const centerX = (startX + endX) / 2;
  const centerY = (startY + endY) / 2;

  const handleClick = useCallback((e) => {
    e.stopPropagation();
    if (!isDragging) {
      onSelect(element);
    }
    setIsDragging(false);
  }, [isDragging, onSelect, element]);

  return (
    <div 
      className="absolute top-0 left-0 w-full h-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <svg
        className="absolute top-0 left-0 w-full h-full"
        style={{ pointerEvents: 'none' }}
      >
        <line
          x1={startX}
          y1={startY}
          x2={endX}
          y2={endY}
          stroke={element.color || '#666666'}
          strokeWidth={element.width || 4}
          strokeDasharray={element.dashArray}
          className={`cursor-pointer transition-colors duration-200 
            ${isSelected ? 'filter drop-shadow-md' : ''}`}
          style={{ pointerEvents: 'auto' }}
          onClick={handleClick}
        />

        {/* Label (if exists) */}
        {element.label && (
          <text
            x={centerX}
            y={centerY - 10}
            textAnchor="middle"
            className="text-xs fill-slate-600 pointer-events-none"
          >
            {element.label}
          </text>
        )}
      </svg>
      
      {/* Hover Description */}
      {isHovered && element.description && (
        <div 
          className="absolute z-50 bg-black bg-opacity-75 text-white p-2 
                   rounded-md text-sm transform -translate-x-1/2 -translate-y-full
                   whitespace-nowrap pointer-events-none"
          style={{
            left: centerX,
            top: centerY - 20,
          }}
        >
          {element.description}
        </div>
      )}

      {/* Selection Indicators */}
      {isSelected && (
        <>
          <div 
            className="absolute w-3 h-3 bg-blue-500 rounded-full 
                     transform -translate-x-1/2 -translate-y-1/2"
            style={{ left: startX, top: startY }}
          />
          <div 
            className="absolute w-3 h-3 bg-blue-500 rounded-full 
                     transform -translate-x-1/2 -translate-y-1/2"
            style={{ left: endX, top: endY }}
          />
        </>
      )}
    </div>
  );
};