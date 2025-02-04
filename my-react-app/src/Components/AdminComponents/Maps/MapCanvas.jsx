import React, { useRef, useCallback } from 'react';
import { TreePine } from 'lucide-react';
import { useMap } from './MapContext';
import { Building } from './Building';
import { Road } from './Road';

export const MapCanvas = ({
  zoom,
  selectedTool,
  newBuildingName
}) => {
  const canvasRef = useRef(null);
  const { 
    elements,
    selectedElement,
    setSelectedElement,
    addElement,
    updateElement,
    isDrawing,
    setIsDrawing,
    pathStart,
    setPathStart,
    gridSize,
    snapToGrid
  } = useMap();

  // Transform and grid functions
  const getTransformStyle = useCallback(() => ({
    transform: `scale(${zoom})`,
    transformOrigin: '0 0',
  }), [zoom]);

  const snapToGridFunc = useCallback((value) => {
    if (!snapToGrid) return value;
    return Math.round(value / gridSize) * gridSize;
  }, [snapToGrid, gridSize]);

  // Handle canvas click for deselection and element creation
  const handleCanvasClick = useCallback((e) => {
    // Only deselect if clicking directly on canvas
    if (e.target === canvasRef.current) {
      setSelectedElement(null);
      return;
    }

    if (selectedTool === 'select' || selectedTool === 'road') return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = snapToGridFunc((e.clientX - rect.left) / zoom);
    const y = snapToGridFunc((e.clientY - rect.top) / zoom);
    
    if (selectedTool === 'building' && !newBuildingName.trim()) {
      alert('Please enter a building name first');
      return;
    }

    const newElement = addElement(selectedTool, x, y, newBuildingName);
    if (newElement) {
      setSelectedElement(newElement);
    }
  }, [selectedTool, zoom, snapToGridFunc, addElement, setSelectedElement, newBuildingName]);

  // Handle element dragging
  const handleDragStart = useCallback((e, element) => {
    if (selectedTool !== 'select') return;
    e.stopPropagation();
    
    const startX = e.clientX;
    const startY = e.clientY;
    const startElementX = element.x;
    const startElementY = element.y;
    
    const handleDrag = (moveEvent) => {
      const dx = moveEvent.clientX - startX;
      const dy = moveEvent.clientY - startY;
      
      const newX = snapToGridFunc(startElementX + dx / zoom);
      const newY = snapToGridFunc(startElementY + dy / zoom);
      
      updateElement(element.id, { x: newX, y: newY });
    };
    
    const handleDragEnd = () => {
      document.removeEventListener('mousemove', handleDrag);
      document.removeEventListener('mouseup', handleDragEnd);
    };
    
    document.addEventListener('mousemove', handleDrag);
    document.addEventListener('mouseup', handleDragEnd);
  }, [selectedTool, zoom, snapToGridFunc, updateElement]);

  // Road drawing
  const startDrawingPath = useCallback((e) => {
    if (selectedTool !== 'road') return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = snapToGridFunc((e.clientX - rect.left) / zoom);
    const y = snapToGridFunc((e.clientY - rect.top) / zoom);
    
    setPathStart({ x, y });
    setIsDrawing(true);
  }, [selectedTool, zoom, snapToGridFunc, setPathStart, setIsDrawing]);

  const handleMouseMove = useCallback((e) => {
    if (!isDrawing || !pathStart || selectedTool !== 'road') return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = snapToGridFunc((e.clientX - rect.left) / zoom);
    const y = snapToGridFunc((e.clientY - rect.top) / zoom);
    
    const tempElement = elements.find(el => el.id === 'tempPath');
    if (tempElement) {
      updateElement('tempPath', { endX: x, endY: y });
    } else {
      addElement('road', x, y, '', {
        id: 'tempPath',
        startX: pathStart.x,
        startY: pathStart.y,
        endX: x,
        endY: y,
        temporary: true
      });
    }
  }, [isDrawing, pathStart, selectedTool, zoom, snapToGridFunc, addElement, elements, updateElement]);

  const finishDrawingPath = useCallback(() => {
    if (!isDrawing || selectedTool !== 'road') return;
    
    const tempPath = elements.find(el => el.id === 'tempPath');
    if (tempPath) {
      const newPath = {
        ...tempPath,
        id: Date.now(),
        temporary: false
      };
      addElement('road', newPath.endX, newPath.endY, '', newPath);
    }
    
    setIsDrawing(false);
    setPathStart(null);
  }, [isDrawing, selectedTool, elements, addElement, setIsDrawing, setPathStart]);

  return (
    <div className="flex-grow bg-white rounded-lg shadow-lg p-4">
      <div
        className="relative"
        style={{
          height: '600px',
          overflow: 'auto'
        }}
      >
        <div
          ref={canvasRef}
          className="w-full h-full border-2 border-slate-200 rounded-lg bg-slate-50 relative"
          style={{
            ...getTransformStyle(),
            width: `${100 / zoom}%`,
            height: `${100 / zoom}%`,
          }}
          onClick={handleCanvasClick}
          onMouseDown={startDrawingPath}
          onMouseMove={handleMouseMove}
          onMouseUp={finishDrawingPath}
          onMouseLeave={finishDrawingPath}
        >
          {/* Grid */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: snapToGrid 
                ? 'linear-gradient(#e5e7eb 1px, transparent 1px), linear-gradient(90deg, #e5e7eb 1px, transparent 1px)'
                : 'none',
              backgroundSize: `${gridSize}px ${gridSize}px`
            }}
          />

          {/* Elements */}
          {elements.map(element => {
            if (element.temporary) return null;

            switch (element.type) {
              case 'building':
                return (
                  <Building
                    key={element.id}
                    element={element}
                    onSelect={(e) => {
                      handleDragStart(e, element);
                      setSelectedElement(element);
                    }}
                  />
                );
              case 'tree':
                return (
                  <div
                    key={element.id}
                    className={`absolute flex items-center justify-center cursor-move 
                      transition-all duration-200 ${
                        selectedElement?.id === element.id ? 'ring-2 ring-blue-500' : ''
                      }`}
                    style={{
                      left: element.x,
                      top: element.y,
                      width: element.width,
                      height: element.height,
                    }}
                    onMouseDown={(e) => {
                      handleDragStart(e, element);
                      setSelectedElement(element);
                    }}
                  >
                    <TreePine className="w-full h-full text-green-600" />
                  </div>
                );
              case 'road':
                return (
                  <Road
                    key={element.id}
                    element={element}
                    isSelected={selectedElement?.id === element.id}
                    onSelect={() => setSelectedElement(element)}
                  />
                );
              default:
                return null;
            }
          })}

          {/* Path Preview */}
          {isDrawing && pathStart && (
            <svg className="absolute inset-0 pointer-events-none">
              <line
                x1={pathStart.x}
                y1={pathStart.y}
                x2={pathStart.x}
                y2={pathStart.y}
                stroke="#666666"
                strokeWidth="4"
                strokeDasharray="4"
                className="animate-pulse"
              />
            </svg>
          )}
        </div>
      </div>
    </div>
  );
};