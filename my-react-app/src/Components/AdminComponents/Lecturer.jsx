// LecturerForm.jsx
import React from 'react';
import {ImageUpload} from './RoundForm';
import { useState } from 'react';
import SpecificationsList from './Specifications';
const Input = ({ label, type = "text", value, onChange, placeholder }) => (
  <div className="space-y-2">
    <label className="block text-sm font-medium text-gray-400">{label}</label>
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 
        rounded-lg text-white placeholder-slate-400 focus:outline-none 
        focus:ring-2 focus:ring-sky-500 focus:border-transparent"
    />
  </div>
);

const LecturerForm = ({ lecturer, onChange }) => {
  const updateSpecifications = (specs) => {
    onChange({ ...lecturer, specifications: specs });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Name"
          value={lecturer.name}
          onChange={(e) => onChange({ ...lecturer, name: e.target.value })}
        />
        <Input
          label="Title"
          value={lecturer.title}
          onChange={(e) => onChange({ ...lecturer, title: e.target.value })}
        />
      </div>

      <ImageUpload
        label="Photo"
        value={lecturer.photo}
        onChange={(url) => onChange({ ...lecturer, photo: url })}
      />

      <div>
        <label className="block text-sm font-medium text-gray-400 mb-2">
          Specifications/Experience
        </label>
        <SpecificationsList
          items={lecturer.specifications}
          onChange={updateSpecifications}
        />
      </div>
    </div>
  );
};

// ScheduleForm.jsx
const ScheduleForm = ({ schedule, onChange }) => {
  const addScheduleItem = () => {
    onChange([
      ...schedule,
      {
        id: Date.now().toString(),
        time: '',
        activity: ''
      }
    ]);
  };

  const updateScheduleItem = (index, field, value) => {
    const newSchedule = [...schedule];
    newSchedule[index] = { ...newSchedule[index], [field]: value };
    onChange(newSchedule);
  };

  const removeScheduleItem = (index) => {
    onChange(schedule.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      {schedule.map((item, index) => (
        <div key={item.id} className="bg-slate-700/50 rounded-lg p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h5 className="text-white font-medium">Schedule Item {index + 1}</h5>
            <button
              onClick={() => removeScheduleItem(index)}
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
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Time"
              type="time"
              value={item.time}
              onChange={(e) => updateScheduleItem(index, 'time', e.target.value)}
            />
            <Input
              label="Activity"
              value={item.activity}
              onChange={(e) => updateScheduleItem(index, 'activity', e.target.value)}
            />
          </div>
        </div>
      ))}
      
      <button 
        type="button" 
        onClick={addScheduleItem}
        className="w-full px-4 py-2 border border-slate-600 text-white rounded-lg
          hover:bg-slate-700 transition-colors duration-200 flex items-center justify-center"
      >
        <svg
          className="w-4 h-4 mr-2"
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
        Add Schedule Item
      </button>
    </div>
  );
};

// ListEditor.jsx
const ListEditor = ({ items, onChange, placeholder }) => {
  const [newItem, setNewItem] = useState('');

  const addItem = () => {
    if (newItem.trim()) {
      onChange([...items, newItem.trim()]);
      setNewItem('');
    }
  };

  const removeItem = (index) => {
    onChange(items.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <input
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          placeholder={placeholder}
          onKeyPress={(e) => e.key === 'Enter' && addItem()}
          className="flex-1 px-3 py-2 bg-slate-700/50 border border-slate-600 
            rounded-lg text-white placeholder-slate-400 focus:outline-none 
            focus:ring-2 focus:ring-sky-500 focus:border-transparent"
        />
        <button
          type="button"
          onClick={addItem}
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
      
      <div className="space-y-2">
        {items.map((item, index) => (
          <div
            key={index}
            className="flex items-center justify-between bg-slate-700/50 rounded-lg p-2"
          >
            <span className="text-white">{item}</span>
            <button
              className="p-1 hover:bg-slate-600 rounded-lg transition-colors"
              onClick={() => removeItem(index)}
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
    </div>
  );
};

// PrerequisitesList.jsx
const PrerequisitesList = ({ items, onChange }) => (
  <ListEditor
    items={items}
    onChange={onChange}
    placeholder="Add a prerequisite..."
  />
);

// OutcomesList.jsx
const OutcomesList = ({ items, onChange }) => (
  <ListEditor
    items={items}
    onChange={onChange}
    placeholder="Add an outcome..."
  />
);

export {
  LecturerForm,
  ScheduleForm,
  PrerequisitesList,
  OutcomesList
};