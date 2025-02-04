import React, { useState } from 'react';
import { X, Info, GraduationCap, Calendar, Image, ListChecks } from 'lucide-react';
import { ImageUpload } from './RoundForm';
import { LecturerForm, ScheduleForm, PrerequisitesList, OutcomesList } from './Lecturer';

const WorkshopForm = ({ workshop, onClose, onSubmit }) => {
  const [activeTab, setActiveTab] = useState('basic');
  const [formData, setFormData] = useState(workshop || {
    title: '',
    bannerMobile: '',
    bannerDesktop: '',
    description: '',
    lecturer: {
      name: '',
      title: '',
      specifications: [],
      photo: ''
    },
    schedule: [],
    prerequisites: [],
    outcomes: [],
    registrationEndTime: ''
  });

  const tabs = [
    { id: 'basic', name: 'Basic Info', icon: <Info className="w-4 h-4" /> },
    { id: 'media', name: 'Media', icon: <Image className="w-4 h-4" /> },
    { id: 'lecturer', name: 'Lecturer', icon: <GraduationCap className="w-4 h-4" /> },
    { id: 'schedule', name: 'Schedule', icon: <Calendar className="w-4 h-4" /> },
    { id: 'details', name: 'Learning', icon: <ListChecks className="w-4 h-4" /> }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit?.(formData);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'basic':
        return (
          <div className="space-y-6">
            <Input
              label="Workshop Title"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
            />
            <Textarea
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            />
            <Input
              label="Registration End Time"
              type="datetime-local"
              value={formData.registrationEndTime}
              onChange={(e) => setFormData({...formData, registrationEndTime: e.target.value})}
            />
          </div>
        );

      case 'media':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ImageUpload
              label="Desktop Banner"
              value={formData.bannerDesktop}
              onChange={(url) => setFormData({...formData, bannerDesktop: url})}
            />
            <ImageUpload
              label="Mobile Banner"
              value={formData.bannerMobile}
              onChange={(url) => setFormData({...formData, bannerMobile: url})}
            />
          </div>
        );

      case 'lecturer':
        return (
          <LecturerForm
            lecturer={formData.lecturer}
            onChange={(lecturer) => setFormData({...formData, lecturer})}
          />
        );

      case 'schedule':
        return (
          <ScheduleForm
            schedule={formData.schedule}
            onChange={(schedule) => setFormData({...formData, schedule})}
          />
        );

      case 'details':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="text-lg font-medium text-white">Prerequisites</h4>
              <PrerequisitesList
                items={formData.prerequisites}
                onChange={(prerequisites) => setFormData({...formData, prerequisites})}
              />
            </div>
            <div className="space-y-4">
              <h4 className="text-lg font-medium text-white">Outcomes</h4>
              <OutcomesList
                items={formData.outcomes}
                onChange={(outcomes) => setFormData({...formData, outcomes})}
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="bg-slate-800/100 backdrop-blur-xl rounded-lg shadow-xl h-[calc(90vh-4rem)] flex flex-col">
      {/* Header with close button */}
      <div className="p-4 border-b border-slate-700 flex justify-between items-center">
        <h3 className="text-xl font-semibold text-white">
          {workshop ? 'Edit Workshop' : 'Create New Workshop'}
        </h3>
        <button
          onClick={onClose}
          className="p-1 hover:bg-slate-700 rounded-lg transition-colors"
        >
          <X className="w-5 h-5 text-gray-400" />
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-700">
        <div className="flex overflow-x-auto no-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap
                ${activeTab === tab.id
                  ? 'text-sky-500 border-sky-500'
                  : 'text-gray-400 border-transparent hover:text-white hover:border-gray-400'
                }`}
            >
              {tab.icon}
              {tab.name}
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-4">
        <form onSubmit={handleSubmit} className="space-y-6">
          {renderTabContent()}
        </form>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-slate-700 flex justify-end gap-3">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 bg-transparent border border-slate-600 text-white 
            rounded-lg hover:bg-slate-700 transition-colors duration-200"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          className="px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 
            transition-colors duration-200"
        >
          Save Workshop
        </button>
      </div>
    </div>
  );
};

// Helper components
const Input = ({ label, type = "text", value, onChange }) => (
  <div className="space-y-2">
    <label className="block text-sm font-medium text-gray-400">{label}</label>
    <input
      type={type}
      value={value}
      onChange={onChange}
      className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 
        rounded-lg text-white placeholder-slate-400 focus:outline-none 
        focus:ring-2 focus:ring-sky-500 focus:border-transparent"
    />
  </div>
);

const Textarea = ({ label, value, onChange }) => (
  <div className="space-y-2">
    <label className="block text-sm font-medium text-gray-400">{label}</label>
    <textarea
      value={value}
      onChange={onChange}
      rows="4"
      className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 
        rounded-lg text-white placeholder-slate-400 focus:outline-none 
        focus:ring-2 focus:ring-sky-500 focus:border-transparent resize-none"
    />
  </div>
);

export default WorkshopForm;