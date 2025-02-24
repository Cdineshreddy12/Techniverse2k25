import React, { useState } from 'react';
import { 
  X, Info, GraduationCap, Calendar, Image, ListChecks, 
  IndianRupee, Users, Clock
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { ImageUpload } from './RoundForm';
import { LecturerForm, ScheduleForm, PrerequisitesList, OutcomesList } from './Lecturer';
import { departmentService } from '../../../services/departmentService';

const WorkshopForm = ({ workshop, onClose, onSubmit }) => {

  const getInitialFormData = (workshop) => {
    const now = new Date();
    const oneWeekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  
    if (workshop) {
      return {
        ...workshop,
        bannerDesktop: workshop.bannerDesktop ? { url: workshop.bannerDesktop } : '',
        bannerMobile: workshop.bannerMobile ? { url: workshop.bannerMobile } : '',
        // Convert single lecturer to lecturers array if needed
        lecturers: workshop.lecturers ? workshop.lecturers.map(lecturer => ({
          ...lecturer,
          photo: lecturer.photo ? { url: lecturer.photo } : ''
        })) : workshop.lecturer ? [{
          ...workshop.lecturer,
          photo: workshop.lecturer.photo ? { url: workshop.lecturer.photo } : '',
          role: workshop.lecturer.role || 'Main Lecturer',
          order: 0
        }] : [],
        workshopTiming: workshop.workshopTiming || {
          startDate: now.toISOString().split('T')[0],
          endDate: oneWeekFromNow.toISOString().split('T')[0],
          dailyStartTime: '09:00',
          dailyEndTime: '17:00',
          timeZone: 'Asia/Kolkata'
        },
        departments: workshop.departments || [],
        price: workshop.price || 0,
        duration: workshop.duration || { total: 2, unit: 'hours' },
        registration: {
          isOpen: workshop.registration?.isOpen || false,
          totalSlots: workshop.registration?.totalSlots || 30,
          registeredCount: workshop.registration?.registeredCount || 0,
          startTime: workshop.registration?.startTime || now.toISOString(),
          endTime: workshop.registration?.endTime || oneWeekFromNow.toISOString()
        },
        registrationEndTime: workshop.registrationEndTime || oneWeekFromNow.toISOString()
      };
    }
  
    return {
      title: '',
      bannerMobile: '',
      bannerDesktop: '',
      description: '',
      departments: [],
      lecturers: [], // Initialize empty lecturers array
      schedule: [],
      prerequisites: [],
      outcomes: [],
      price: 0,
      duration: {
        total: 2,
        unit: 'hours'
      },
      workshopTiming: {
        startDate: now.toISOString().split('T')[0],
        endDate: oneWeekFromNow.toISOString().split('T')[0],
        dailyStartTime: '09:00',
        dailyEndTime: '17:00',
        timeZone: 'Asia/Kolkata'
      },
      registration: {
        isOpen: false,
        totalSlots: 30,
        registeredCount: 0,
        startTime: now.toISOString(),
        endTime: oneWeekFromNow.toISOString()
      },
      registrationEndTime: oneWeekFromNow.toISOString()
    };
  };

  const [activeTab, setActiveTab] = useState('basic');
  const [formData, setFormData] = useState(() => getInitialFormData(workshop));

  const { data: departmentsData, isLoading: isLoadingDepartments } = useQuery({
    queryKey: ['departments'],
    queryFn: () => departmentService.getAll(),
    staleTime: 5 * 60 * 1000,
  });

  const tabs = [
    { id: 'basic', name: 'Basic Info', icon: <Info className="w-4 h-4" /> },
    {    id: 'timing', 
      name: 'Workshop Timing', 
      icon: <Clock className="w-4 h-4" /> 
    },
    { id: 'registration', name: 'Registration', icon: <Users className="w-4 h-4" /> },
    { id: 'media', name: 'Media', icon: <Image className="w-4 h-4" /> },
    { id: 'lecturer', name: 'Lecturer', icon: <GraduationCap className="w-4 h-4" /> },
    { id: 'schedule', name: 'Schedule', icon: <Calendar className="w-4 h-4" /> },
    { id: 'details', name: 'Learning', icon: <ListChecks className="w-4 h-4" /> }
  ];




  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate lecturers first
    if (!formData.lecturers || formData.lecturers.length === 0) {
      alert('Please add at least one lecturer');
      setActiveTab('lecturer');
      return;
    }
  
    // Validate lecturer fields
    const lecturerValidation = formData.lecturers.every((lecturer, index) => {
      if (!lecturer.name || !lecturer.title || !lecturer.role) {
        alert(`Please fill in all required fields for Lecturer ${index + 1} (Name, Title, and Role)`);
        setActiveTab('lecturer');
        return false;
      }
      return true;
    });
  
    if (!lecturerValidation) return;
  
    // Prepare the data with validated lecturers
    const preparedData = {
      ...formData,
      price: parseFloat(formData.price) || 0,
      duration: {
        total: parseInt(formData.duration.total) || 1,
        unit: formData.duration.unit || 'hours'
      },
      registration: {
        ...formData.registration,
        totalSlots: parseInt(formData.registration.totalSlots) || 30,
        isOpen: Boolean(formData.registration.isOpen),
        startTime: formData.registration.startTime || new Date().toISOString(),
        endTime: formData.registration.endTime || new Date().toISOString()
      },
      registrationEndTime: formData.registration.endTime || new Date().toISOString(),
      // Clean up lecturer photos and ensure they are in the correct format
      lecturers: formData.lecturers.map(lecturer => ({
        ...lecturer,
        photo: lecturer.photo?.file ? lecturer.photo : { url: lecturer.photo },
        specifications: lecturer.specifications || []
      }))
    };
  
    // Validate other required fields
    const requiredFields = ['title', 'description', 'departments'];
    const missingFields = requiredFields.filter(field => !preparedData[field]);
  
    if (missingFields.length > 0) {
      alert(`Please fill in all required fields: ${missingFields.join(', ')}`);
      setActiveTab('basic');
      return;
    }
  
    onSubmit?.(preparedData);
  };
  
  const handleDepartmentChange = (e) => {
    const options = e.target.options;
    const selectedDepartments = [];
    for (let i = 0; i < options.length; i++) {
      if (options[i].selected) {
        selectedDepartments.push(options[i].value);
      }
    }
    setFormData({ ...formData, departments: selectedDepartments });
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
              required
            />
            <Textarea
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              required
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Price (₹)"
                type="number"
                min="0"
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value) || 0})}
                required
              />
              <div className="flex gap-4">
                <Input
                  label="Duration"
                  type="number"
                  min="1"
                  value={formData.duration.total}
                  onChange={(e) => setFormData({
                    ...formData, 
                    duration: {
                      ...formData.duration,
                      total: parseInt(e.target.value) || 1
                    }
                  })}
                  required
                />
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-400 mb-2">Unit</label>
                  <select
                    value={formData.duration.unit}
                    onChange={(e) => setFormData({
                      ...formData,
                      duration: {
                        ...formData.duration,
                        unit: e.target.value
                      }
                    })}
                    className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 
                      rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  >
                    <option value="hours">Hours</option>
                    <option value="days">Days</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-400">Departments</label>
              <select
                multiple
                value={formData.departments}
                onChange={handleDepartmentChange}
                className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 
                  rounded-lg text-white placeholder-slate-400 focus:outline-none 
                  focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                size={4}
                required
              >
                {isLoadingDepartments ? (
                  <option disabled>Loading departments...</option>
                ) : (
                  departmentsData?.departments?.map(dept => (
                    <option key={dept._id} value={dept._id}>
                      {dept.name}
                    </option>
                  ))
                )}
              </select>
              <p className="text-xs text-gray-400 mt-1">
                Hold Ctrl/Cmd to select multiple departments
              </p>
            </div>
          </div>
        );

        case 'timing':
          return (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Workshop Start Date"
                  type="date"
                  value={formData.workshopTiming.startDate}
                  onChange={(e) => setFormData({
                    ...formData,
                    workshopTiming: {
                      ...formData.workshopTiming,
                      startDate: e.target.value
                    }
                  })}
                  required
                />
                <Input
                  label="Workshop End Date"
                  type="date"
                  value={formData.workshopTiming.endDate}
                  onChange={(e) => setFormData({
                    ...formData,
                    workshopTiming: {
                      ...formData.workshopTiming,
                      endDate: e.target.value
                    }
                  })}
                  required
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Daily Start Time"
                  type="time"
                  value={formData.workshopTiming.dailyStartTime}
                  onChange={(e) => setFormData({
                    ...formData,
                    workshopTiming: {
                      ...formData.workshopTiming,
                      dailyStartTime: e.target.value
                    }
                  })}
                  required
                />
                <Input
                  label="Daily End Time"
                  type="time"
                  value={formData.workshopTiming.dailyEndTime}
                  onChange={(e) => setFormData({
                    ...formData,
                    workshopTiming: {
                      ...formData.workshopTiming,
                      dailyEndTime: e.target.value
                    }
                  })}
                  required
                />
              </div>
              <select
                value={formData.workshopTiming.timeZone}
                onChange={(e) => setFormData({
                  ...formData,
                  workshopTiming: {
                    ...formData.workshopTiming,
                    timeZone: e.target.value
                  }
                })}
                className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 
                  rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                <option value="Asia/Kolkata">India (IST)</option>
                <option value="UTC">UTC</option>
                {/* Add more timezone options as needed */}
              </select>
            </div>
          );

      case 'registration':
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.registration.isOpen}
                  onChange={(e) => setFormData({
                    ...formData,
                    registration: {
                      ...formData.registration,
                      isOpen: e.target.checked
                    }
                  })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none peer-focus:ring-4 
                  peer-focus:ring-sky-500/25 rounded-full peer peer-checked:after:translate-x-full 
                  peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] 
                  after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full 
                  after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-500"></div>
                <span className="ml-3 text-sm font-medium text-white">
                  Registration Open
                </span>
              </label>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Total Slots"
                type="number"
                min="1"
                value={formData.registration.totalSlots}
                onChange={(e) => setFormData({
                  ...formData,
                  registration: {
                    ...formData.registration,
                    totalSlots: parseInt(e.target.value) || 1
                  }
                })}
                required
              />
              <Input
                label="Current Registrations"
                type="number"
                value={formData.registration.registeredCount}
                disabled
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Registration Start Time"
                type="datetime-local"
                value={formData.registration.startTime}
                onChange={(e) => setFormData({
                  ...formData,
                  registration: {
                    ...formData.registration,
                    startTime: e.target.value
                  }
                })}
                required
              />
              <Input
                label="Registration End Time"
                type="datetime-local"
                value={formData.registration.endTime}
                onChange={(e) => setFormData({
                  ...formData,
                  registration: {
                    ...formData.registration,
                    endTime: e.target.value
                  }
                })}
                required
              />
            </div>
          </div>
        );

      case 'media':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ImageUpload
              label="Desktop Banner"
              value={formData.bannerDesktop || ''}
              onChange={(value) => setFormData({...formData, bannerDesktop: value})}
            />
            <ImageUpload
              label="Mobile Banner"
              value={formData.bannerMobile || ''}
              onChange={(value) => setFormData({...formData, bannerMobile: value})}
            />
          </div>
        );

      case 'lecturer':
      return (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-white">Workshop Lecturers</h3>
            <span className="text-sm text-gray-400">
              {formData.lecturers?.length || 0} Lecturer(s)
            </span>
          </div>
          
          <LecturerForm
            lecturers={formData.lecturers || []}
            onChange={(lecturers) => setFormData({...formData, lecturers})}
          />
          
          {formData.lecturers?.length === 0 && (
            <p className="text-amber-500 text-sm">
              Please add at least one lecturer for the workshop
            </p>
          )}
        </div>
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

      <div className="flex-1 overflow-y-auto p-4">
        <form onSubmit={handleSubmit} className="space-y-6">
          {renderTabContent()}
        </form>
      </div>

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

const Input = ({ label, type = "text", value, onChange, required = false, disabled = false }) => (
  <div className="space-y-2">
    <label className="block text-sm font-medium text-gray-400">{label}</label>
    <input
      type={type}
      value={value}
      onChange={onChange}
      required={required}
      disabled={disabled}
      className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 
        rounded-lg text-white placeholder-slate-400 focus:outline-none 
        focus:ring-2 focus:ring-sky-500 focus:border-transparent disabled:opacity-50
        disabled:cursor-not-allowed"
    />
  </div>
);

const Textarea = ({ label, value, onChange, required = false }) => (
  <div className="space-y-2">
    <label className="block text-sm font-medium text-gray-400">{label}</label>
    <textarea
      value={value}
      onChange={onChange}
      required={required}
      rows="4"
      className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 
        rounded-lg text-white placeholder-slate-400 focus:outline-none 
        focus:ring-2 focus:ring-sky-500 focus:border-transparent resize-none"
    />
  </div>
);

export default WorkshopForm;