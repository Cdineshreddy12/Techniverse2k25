// SpecificationsList.jsx
import React, { useState } from 'react';

const SpecificationsList = ({ items = [], onChange }) => {
  const [newSpec, setNewSpec] = useState('');

  const addSpecification = () => {
    if (newSpec.trim()) {
      onChange([...items, newSpec.trim()]);
      setNewSpec('');
    }
  };

  const removeSpecification = (index) => {
    onChange(items.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <input
          value={newSpec}
          onChange={(e) => setNewSpec(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && addSpecification()}
          placeholder="Add a specification or experience..."
          className="flex-1 px-3 py-2 bg-slate-700/50 border border-slate-600 
            rounded-lg text-white placeholder-slate-400 focus:outline-none 
            focus:ring-2 focus:ring-sky-500 focus:border-transparent"
        />
        <button
          type="button"
          onClick={addSpecification}
          className="p-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 
            transition-colors duration-200"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 4v16m8-8H4"
            />
          </svg>
        </button>
      </div>

      {items.length > 0 && (
        <div className="space-y-2 mt-3">
          {items.map((spec, index) => (
            <div
              key={index}
              className="flex items-center justify-between bg-slate-700/50 
                rounded-lg p-2 group hover:bg-slate-700 transition-colors"
            >
              <span className="text-white">{spec}</span>
              <button
                onClick={() => removeSpecification(index)}
                className="p-1 hover:bg-slate-600 rounded-lg transition-colors"
              >
                <svg
                  className="w-4 h-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {items.length === 0 && (
        <div className="text-gray-400 text-sm italic text-center py-2">
          No specifications added yet
        </div>
      )}
    </div>
  );
};

export default SpecificationsList;