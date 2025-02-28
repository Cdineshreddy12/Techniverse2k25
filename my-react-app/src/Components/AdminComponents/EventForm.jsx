import React, { useState,useEffect,useRef } from 'react';
import {RoundForm} from './RoundForm';
import {CoordinatorForm} from './RoundForm';

import { X,Info,Trophy,Image,Calendar,Users,Upload } from 'lucide-react';


const ImageUpload = ({ label, value, onChange }) => {
  const [preview, setPreview] = useState(value || null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleFile = (file) => {
    // Create preview URL
    const previewUrl = URL.createObjectURL(file);
    setPreview(previewUrl);
    
    // Call onChange with the file
    onChange(file);

    // Clean up old preview URL
    return () => URL.revokeObjectURL(previewUrl);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      handleFile(file);
    }
  };

  const handleRemove = (e) => {
    e.stopPropagation();
    setPreview(null);
    onChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-slate-400">{label}</label>
      
      <div
        onClick={() => fileInputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative group cursor-pointer border-2 border-dashed rounded-lg 
                   transition-all duration-300 overflow-hidden
                   ${isDragging 
                     ? 'border-sky-500 bg-sky-500/10' 
                     : 'border-slate-600 hover:border-sky-500/50 hover:bg-slate-700/50'
                   }
                   ${preview ? 'h-48' : 'h-32'}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />

        {preview ? (
          // Preview container
          <div className="relative h-full">
            <img
              src={preview}
              alt={`${label} preview`}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 
                         transition-opacity duration-300">
              <div className="absolute inset-0 flex items-center justify-center">
                <button
                  onClick={handleRemove}
                  className="p-2 bg-red-500 rounded-full text-white 
                           hover:bg-red-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          // Upload prompt
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="p-3 bg-slate-700 rounded-full mb-2">
              <Upload className="w-5 h-5 text-sky-400" />
            </div>
            <div className="text-sm font-medium text-slate-300">
              Drop image here or click to upload
            </div>
            <div className="text-xs text-slate-400 mt-1">
              Supported: JPG, PNG, WebP (max 5MB)
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const Input = ({ label, type = "text", value, onChange, className = "" }) => {
  const handleChange = (e) => {
    let newValue = e.target.value;
    
    // For number inputs, ensure empty string is passed instead of 0
    if (type === "number" && newValue === "") {
      onChange({ target: { value: "" } });
      return;
    }
    
    // For number inputs, parse the value
    if (type === "number") {
      // Allow decimal points and negative signs while typing
      if (newValue === "-" || newValue === ".") {
        onChange(e);
        return;
      }
      const parsed = parseFloat(newValue);
      if (!isNaN(parsed)) {
        onChange({ target: { value: parsed } });
        return;
      }
    }
    
    onChange(e);
  };

  // Convert number to string for display
  const displayValue = type === "number" ? (value?.toString() || "") : value;

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-slate-400">{label}</label>
      <input
        type={type === "number" ? "text" : type}
        value={displayValue}
        onChange={handleChange}
        className={`w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg 
          text-white placeholder-slate-400 focus:outline-none focus:ring-2 
          focus:ring-sky-500 focus:border-transparent ${className}`}
      />
    </div>
  );
};


const Select = ({ label, value, onChange, options, className = "" }) => (
  <div className="space-y-2">
    <label className="block text-sm font-medium text-slate-400">{label}</label>
    <select
      value={value || ""}
      onChange={onChange}
      className={`w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg 
        text-white placeholder-slate-400 focus:outline-none focus:ring-2 
        focus:ring-sky-500 focus:border-transparent ${className}`}
    >
      <option value="">Select {label}</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  </div>
);


const Textarea = ({ label, value, onChange, rows = 4 }) => (
  <div className="space-y-2">
    <label className="block text-sm font-medium text-slate-400">{label}</label>
    <textarea
      value={value}
      onChange={onChange}
      rows={rows}
      className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg 
        text-white placeholder-slate-400 focus:outline-none focus:ring-2 
        focus:ring-sky-500 focus:border-transparent resize-none"
    />
  </div>
);


const DepartmentSelect = ({ selectedDepartment, onChange }) => {
  const [departments, setDepartments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_APP_BACKEND_URL}/api/departments`);
        if (!response.ok) throw new Error('Failed to fetch departments');
        const data = await response.json();
        setDepartments(data.departments);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDepartments();
  }, []);

  if (isLoading) return <div className="text-slate-400">Loading departments...</div>;
  if (error) return <div className="text-red-400">Error: {error}</div>;

  return (
    <Select
      label="Department"
      value={selectedDepartment}
      onChange={onChange}
      options={departments.map(dept => ({
        value: dept._id,
        label: dept.name
      }))}
    />
  );
};


const PrizeStructureInput = ({ prizes, onChange }) => {
  const addPrize = () => {
    onChange([...prizes, { position: prizes.length + 1, amount: "", description: "" }]);
  };


  const updatePrize = (index, field, value) => {
    const updated = [...prizes];
    if (field === "amount" || field === "position") {
      value = value === "" ? "" : parseFloat(value);
    }
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const removePrize = (index) => {
    onChange(prizes.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <label className="block text-sm font-medium text-slate-400">Prize Structure</label>
        <button
          type="button"
          onClick={addPrize}
          className="text-sm text-sky-400 hover:text-sky-300"
        >
          + Add Prize
        </button>
      </div>
      {prizes.map((prize, index) => (
        <div key={index} className="grid grid-cols-4 gap-4 items-start">
          <Input
            type="number"
            value={prize.position}
            onChange={(e) => updatePrize(index, 'position', parseInt(e.target.value))}
            className="col-span-1"
            label="Position"
          />
          <Input
            type="number"
            value={prize.amount}
            onChange={(e) => updatePrize(index, 'amount', parseInt(e.target.value))}
            className="col-span-1"
            label="Amount (₹)"
          />
          <Input
            value={prize.description}
            onChange={(e) => updatePrize(index, 'description', e.target.value)}
            className="col-span-1"
            label="Description"
          />
          <button
            type="button"
            onClick={() => removePrize(index)}
            className="mt-8 text-red-400 hover:text-red-300"
          >
            Remove
          </button>
        </div>
      ))}
    </div>
  );
};

const EventForm = ({ event, onClose }) => {

  const [activeTab, setActiveTab] = useState('basic');

  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return ''; // Return empty string if invalid date
    
    // Convert to local timezone for input
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };
  const defaultRound = {
    roundNumber: 1,
    name: '',
    description: '',
    duration: '',
    startTime: '',
    endTime: '',
    venue: '',
    sections: [],
    requirements: [],
    specialRules: [],
    qualificationCriteria: '',
    eliminationType: 'score',
    status: 'upcoming'
  };
  // Define default values
  const defaultValues = {
    title: '',
    tag: '',
    startTime: '',
    registrationEndTime: '',
    duration: '',
    bannerMobile: '',
    bannerDesktop: '',
    status: 'draft',
    registrationType: 'team', // Changed default to team for TechSquid
    department: '',
    registrationCount: 0,
    maxRegistrations: 100,
    registrationFee: 0,
    details: {
      prizeStructure: [],
      maxTeamSize: 1,
      eventDate: '',
      duration: '',
      description: '',
      venue: '',
      requirements: []
    },
    rounds: [defaultRound],
    coordinators: []
  };


  const [formData, setFormData] = useState(() => {
    if (event) {
      // Format existing event data
      const departmentId = Array.isArray(event.departments) && event.departments[0]?._id 
        ? event.departments[0]._id 
        : event.departments?.[0] || '';

      return {
        ...defaultValues,
        ...event,
        department: departmentId,
        startTime: formatDateForInput(event.startTime),
        registrationEndTime: formatDateForInput(event.registrationEndTime),
        details: {
          ...defaultValues.details,
          ...(event.details || {}),
          eventDate: event.details?.eventDate ? formatDateForInput(event.details.eventDate) : ''
        },
        rounds: event.rounds?.map(round => ({
          ...defaultRound,
          ...round,
          startTime: formatDateForInput(round.startTime),
          endTime: formatDateForInput(round.endTime),
          sections: round.sections?.map(section => ({
            name: section.name || '',
            description: section.description || '',
            duration: section.duration || '',
            requirements: section.requirements || []
          })) || []
        })) || [defaultRound]
      };
    }
    return defaultValues;
  });
  
const formatDateForSubmit = (dateTimeString) => {
  if (!dateTimeString) return null;
  // Create date object (browser will interpret as local time)
  const date = new Date(dateTimeString);
  if (isNaN(date.getTime())) return null;
  // Return ISO string (which is in UTC)
  return date.toISOString();
};


  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.department) {
      alert('Please select a department');
      return;
    }
    
    try {
      const baseUrl = `${import.meta.env.VITE_APP_BACKEND_URL}/api/departments`;
      const departmentId = typeof formData.department === 'object' 
        ? formData.department._id 
        : formData.department;
        
      const url = event 
        ? `${baseUrl}/${departmentId}/events/${event._id}`
        : `${baseUrl}/${departmentId}/events`;
  
      // Create FormData object
      const formDataToSend = new FormData();
  
      // Add the images if they exist
      if (formData.bannerDesktopFile) {
        formDataToSend.append('bannerDesktop', formData.bannerDesktopFile);
      }
      if (formData.bannerMobileFile) {
        formDataToSend.append('bannerMobile', formData.bannerMobileFile);
      }
  
      // Process coordinator photos - convert blob URLs to files and append to FormData
      if (formData.coordinators && formData.coordinators.length > 0) {
        for (const coordinator of formData.coordinators) {
          if (coordinator.photo && typeof coordinator.photo === 'object' && coordinator.photo.url) {
            if (coordinator.photo.url.startsWith('blob:')) {
              try {
                // Fetch the blob URL
                const response = await fetch(coordinator.photo.url);
                const blob = await response.blob();
                
                // Create a file with coordinator ID as the filename
                const filename = `${coordinator._id || coordinator.id}.jpg`;
                const file = new File([blob], filename, { type: 'image/jpeg' });
                
                // Add to FormData
                formDataToSend.append('coordinatorPhotos', file);
                console.log(`Added photo for coordinator ${coordinator._id || coordinator.id}`);
              } catch (error) {
                console.error('Failed to process coordinator photo:', error);
              }
            }
          }
        }
      }
  
      // Process rounds data
      const processedRounds = formData.rounds.map(round => ({
        ...round,
        sections: round.sections.map(section => ({
          name: section.name,
          description: section.description,
          duration: section.duration,
          requirements: section.requirements || []
        })),
        requirements: round.requirements || [],
        specialRules: round.specialRules || [],
        qualificationCriteria: round.qualificationCriteria || ''
      }));
            
      // Create a clean version of the event data for JSON
      const eventData = {
        ...formData,
        departments: [departmentId],
        startTime: formatDateForSubmit(formData.startTime),
        registrationEndTime: formatDateForSubmit(formData.registrationEndTime),
        registrationFee: parseFloat(formData.registrationFee) || 0,
        maxRegistrations: parseFloat(formData.maxRegistrations) || null,
        
        // Process rounds data with properly formatted dates
        rounds: processedRounds.map(round => ({
          ...round,
          roundNumber: parseInt(round.roundNumber) || 1,
          startTime: formatDateForSubmit(round.startTime),
          endTime: formatDateForSubmit(round.endTime),
          sections: round.sections.map(section => ({
            ...section,
            requirements: Array.isArray(section.requirements) ? section.requirements : []
          })),
          requirements: Array.isArray(round.requirements) ? round.requirements : [],
          specialRules: Array.isArray(round.specialRules) ? round.specialRules : [],
          qualificationCriteria: round.qualificationCriteria || ''
        })),
        
        details: {
          ...formData.details,
          maxTeamSize: parseFloat(formData.details.maxTeamSize) || 1,
          prizeStructure: formData.details.prizeStructure.map(prize => ({
            ...prize,
            amount: parseFloat(prize.amount) || 0,
            position: parseFloat(prize.position) || 0
          })) || []
        },
        
        // Process coordinator data - replace blob URLs with nulls for JSON
        coordinators: formData.coordinators.map(coordinator => ({
          ...coordinator,
          name: coordinator.name || '',
          email: coordinator.email || '',
          phone: coordinator.phone || '',
          photo: typeof coordinator.photo === 'string' ? coordinator.photo : 
                 (coordinator.photo && typeof coordinator.photo === 'object' && 
                  coordinator.photo.url && !coordinator.photo.url.startsWith('blob:')) ?
                 coordinator.photo.url : null,
          role: coordinator.role || '',
          studentId: coordinator.studentId || '',
          department: coordinator.department || '',
          class: coordinator.class || ''
        })),
        
        // Set status and registrationType
        status: formData.status || 'draft',
        registrationType: formData.registrationType || 'team'
      };
      
  
      // Remove the file objects before stringifying
      delete eventData.bannerDesktopFile;
      delete eventData.bannerMobileFile;
      
      formDataToSend.append('eventData', JSON.stringify(eventData));
    
      const response = await fetch(url, {
        method: event ? 'PUT' : 'POST',
        body: formDataToSend 
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save event');
      }
    
      onClose();
    } catch (error) {
      console.error('Error saving event:', error);
      alert(error.message || 'Failed to save event. Please try again.');
    }
  };

  const tabs = [
    { id: 'basic', name: 'Basic Info', icon: <Info className="w-4 h-4" /> },
    { id: 'registration', name: 'Registration', icon: <Users className="w-4 h-4" /> },
    { id: 'prizes', name: 'Prizes', icon: <Trophy className="w-4 h-4" /> },
    { id: 'rounds', name: 'Rounds', icon: <Calendar className="w-4 h-4" /> },
    { id: 'media', name: 'Media', icon: <Image className="w-4 h-4" /> },
    { id: 'coordinators', name: 'Coordinators', icon: <Users className="w-4 h-4" /> }
  ];


  const renderBasicTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input 
          label="Event Title"
          value={formData.title}
          onChange={(e) => setFormData({...formData, title: e.target.value})}
        />
        <Input 
          label="Tag"
          value={formData.tag}
          onChange={(e) => setFormData({...formData, tag: e.target.value})}
        />
        <Input 
          label="Start Time"
          type="datetime-local"
          value={formData.startTime}
          onChange={(e) => setFormData({...formData, startTime: e.target.value})}
        />
        <Input 
          label="Duration"
          value={formData.duration}
          onChange={(e) => setFormData({...formData, duration: e.target.value})}
        />
        <Select
          label="Status"
          value={formData.status}
          onChange={(e) => setFormData({...formData, status: e.target.value})}
          options={[
            { value: 'draft', label: 'Draft' },
            { value: 'published', label: 'Published' },
            { value: 'cancelled', label: 'Cancelled' },
            { value: 'completed', label: 'Completed' }
          ]}
        />
        <DepartmentSelect
          selectedDepartment={formData.department}
          onChange={(e) => {
            const departmentId = e.target.value;
            setFormData(prev => ({
              ...prev,
              department: departmentId
            }));
          }}
        />
        <Input
          label="Venue"
          value={formData.details.venue}
          onChange={(e) => setFormData({
            ...formData,
            details: { ...formData.details, venue: e.target.value }
          })}
        />
      </div>
      <Textarea
        label="Description"
        value={formData.details.description}
        onChange={(e) => setFormData({
          ...formData,
          details: { ...formData.details, description: e.target.value }
        })}
      />
    </div>
  );


  const renderTabContent = () => {
    switch (activeTab) {
      case 'basic':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input 
                label="Event Title"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
              />
              <Input 
                label="Tag"
                value={formData.tag}
                onChange={(e) => setFormData({...formData, tag: e.target.value})}
              />
              <Input 
                label="Start Time"
                type="datetime-local"
                value={formData.startTime}
                onChange={(e) => setFormData({...formData, startTime: e.target.value})}
              />
              <Input 
                label="Duration"
                value={formData.duration}
                onChange={(e) => setFormData({...formData, duration: e.target.value})}
              />
              <Select
                label="Status"
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
                options={[
                  { value: 'draft', label: 'Draft' },
                  { value: 'published', label: 'Published' },
                  { value: 'cancelled', label: 'Cancelled' },
                  { value: 'completed', label: 'Completed' }
                ]}
              />
              <DepartmentSelect
                selectedDepartment={formData.department}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  department: e.target.value
                }))}
              />
              <Input
                label="Venue"
                value={formData.details.venue}
                onChange={(e) => setFormData({
                  ...formData,
                  details: { ...formData.details, venue: e.target.value }
                })}
              />
            </div>
            <Textarea
              label="Description"
              value={formData.details.description}
              onChange={(e) => setFormData({
                ...formData,
                details: { ...formData.details, description: e.target.value }
              })}
            />
          </div>
        );

      case 'registration':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input 
                type="number"
                label="Registration Fee"
                value={formData.registrationFee}
                onChange={(e) => setFormData({
                  ...formData, 
                  registrationFee: e.target.value
                })}
              />
              <Input 
                type="number"
                label="Maximum Registrations"
                value={formData.maxRegistrations}
                onChange={(e) => setFormData({
                  ...formData, 
                  maxRegistrations: e.target.value
                })}
              />
              <Input 
                label="Registration End Time"
                type="datetime-local"
                value={formData.registrationEndTime}
                onChange={(e) => setFormData({
                  ...formData, 
                  registrationEndTime: e.target.value
                })}
              />
              <Select
                label="Registration Type"
                value={formData.registrationType}
                onChange={(e) => setFormData({...formData, registrationType: e.target.value})}
                options={[
                  { value: 'individual', label: 'Individual' },
                  { value: 'team', label: 'Team' }
                ]}
              />
              {formData.registrationType === 'team' && (
                <Input 
                  type="number"
                  label="Maximum Team Size"
                  value={formData.details.maxTeamSize}
                  onChange={(e) => setFormData({
                    ...formData, 
                    details: { ...formData.details, maxTeamSize: e.target.value }
                  })}
                />
              )}
            </div>
          </div>
        );

      case 'prizes':
        return (
          <div className="space-y-6">
            <PrizeStructureInput
              prizes={formData.details.prizeStructure}
              onChange={(prizeStructure) => setFormData({
                ...formData,
                details: { ...formData.details, prizeStructure }
              })}
            />
          </div>
        );

      case 'rounds':
        return (
          <RoundForm
            rounds={formData.rounds}
            onChange={(rounds) => setFormData({...formData, rounds})}
          />
        );

      case 'media':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ImageUpload
              label="Desktop Banner"
              value={formData.bannerDesktop}
              onChange={(file) => {
                setFormData(prev => ({
                  ...prev,
                  bannerDesktopFile: file,
                  bannerDesktop: file ? URL.createObjectURL(file) : null
                }));
              }}
            />
            <ImageUpload
              label="Mobile Banner"
              value={formData.bannerMobile}
              onChange={(file) => {
                setFormData(prev => ({
                  ...prev,
                  bannerMobileFile: file,
                  bannerMobile: file ? URL.createObjectURL(file) : null
                }));
              }}
            />
          </div>
        );

      case 'coordinators':
        return (
          <CoordinatorForm
            coordinators={formData.coordinators}
            onChange={(coordinators) => setFormData({...formData, coordinators})}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="bg-slate-800/100 backdrop-blur-xl rounded-lg shadow-xl h-[100vh] w-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-slate-700 flex justify-between items-center">
        <h3 className="text-xl font-semibold text-white">
          {event ? 'Edit Event' : 'Create New Event'}
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

      {/* Content */}
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
          Save Event
        </button>
      </div>
    </div>
  );
};

export default EventForm;