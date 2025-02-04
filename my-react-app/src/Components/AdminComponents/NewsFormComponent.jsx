import React, { useState, useEffect } from 'react';
import { X, Info, Calendar, Tags, Image, Users } from 'lucide-react';
import { ImageUpload } from './RoundForm';

// Form Components
const Input = ({ label, type = "text", value, onChange, className = "" }) => (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-slate-400">{label}</label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        className={`w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg 
          text-white placeholder-slate-400 focus:outline-none focus:ring-2 
          focus:ring-sky-500 focus:border-transparent ${className}`}
      />
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
  
  const Select = ({ label, value, onChange, options }) => (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-slate-400">{label}</label>
      <select
        value={value}
        onChange={onChange}
        className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg 
          text-white placeholder-slate-400 focus:outline-none focus:ring-2 
          focus:ring-sky-500 focus:border-transparent"
      >
        <option value="">Select {label}</option>
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
  
  const TagInput = ({ tags, onChange }) => {
    const [input, setInput] = useState('');
  
    const handleKeyDown = (e) => {
      if (e.key === 'Enter' && input.trim()) {
        e.preventDefault();
        const newTag = input.trim().toLowerCase();
        if (!tags.includes(newTag)) {
          onChange([...tags, newTag]);
        }
        setInput('');
      }
    };
  
    const removeTag = (tagToRemove) => {
      onChange(tags.filter(tag => tag !== tagToRemove));
    };
  
    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-400">Tags</label>
        <div className="space-y-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type and press Enter to add tags"
            className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg 
              text-white placeholder-slate-400 focus:outline-none focus:ring-2 
              focus:ring-sky-500 focus:border-transparent"
          />
          <div className="flex flex-wrap gap-2">
            {tags.map(tag => (
              <span
                key={tag}
                className="px-2 py-1 bg-sky-500/20 text-sky-400 rounded-full 
                        text-sm flex items-center gap-1"
              >
                {tag}
                <button
                  onClick={() => removeTag(tag)}
                  className="hover:text-sky-300"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>
      </div>
    );
  };

const NewsForm = ({ news, onClose, onSubmitSuccess }) => {
  const defaultFormData = {
    title: '',
    content: '',
    summary: '',
    category: 'general',
    thumbnail: null,
    thumbnailFile: null,
    important: false,
    status: 'draft',
    publishDate: new Date().toISOString().slice(0, 16),
    expiryDate: '',
    author: {
      name: '',
      role: ''
    },
    departments: [],
    relatedEvents: [],
    tags: []
  };

  const [formData, setFormData] = useState(news || defaultFormData);
  const [activeTab, setActiveTab] = useState('basic');
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [events, setEvents] = useState([]);

  // Fetch departments and events
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch departments
        const deptResponse = await fetch(`${import.meta.env.VITE_APP_BACKEND_URL}/api/departments`);
        const deptData = await deptResponse.json();
        setDepartments(deptData.departments);

        // Fetch events
        const eventResponse = await fetch(`${import.meta.env.VITE_APP_BACKEND_URL}api/departments/all/events`);
        const eventData = await eventResponse.json();
        setEvents(eventData.events);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formDataToSend = new FormData();
      
      // Add thumbnail if it exists
      if (formData.thumbnailFile) {
        formDataToSend.append('thumbnail', formData.thumbnailFile);
      }

      // Prepare news data
      const newsData = {
        ...formData,
        publishDate: new Date(formData.publishDate).toISOString(),
        expiryDate: formData.expiryDate ? new Date(formData.expiryDate).toISOString() : null
      };

      // Remove file objects before stringifying
      delete newsData.thumbnailFile;
      
      formDataToSend.append('newsData', JSON.stringify(newsData));

      const url = news 
        ? `${import.meta.env.VITE_APP_BACKEND_URL}/api/news/${news._id}`
        : `${import.meta.env.VITE_APP_BACKEND_URL}/api/news`;

      const response = await fetch(url, {
        method: news ? 'PUT' : 'POST',
        body: formDataToSend
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save news');
      }

      if (onSubmitSuccess) {
        onSubmitSuccess();
      }
      onClose();
    } catch (error) {
      console.error('Error saving news:', error);
      alert(error.message || 'Failed to save news. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'basic', name: 'Basic Info', icon: <Info className="w-4 h-4" /> },
    { id: 'media', name: 'Media', icon: <Image className="w-4 h-4" /> },
    { id: 'relations', name: 'Relations', icon: <Users className="w-4 h-4" /> },
    { id: 'schedule', name: 'Schedule', icon: <Calendar className="w-4 h-4" /> },
    { id: 'tags', name: 'Tags', icon: <Tags className="w-4 h-4" /> }
  ];

  const renderBasicTab = () => (
    <div className="space-y-6">
      <Input
        label="Title"
        value={formData.title}
        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
      />

      <Textarea
        label="Content"
        value={formData.content}
        onChange={(e) => setFormData({ ...formData, content: e.target.value })}
        rows={6}
      />

      <Textarea
        label="Summary"
        value={formData.summary}
        onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
        rows={3}
      />

      <div className="grid grid-cols-2 gap-4">
        <Select
          label="Category"
          value={formData.category}
          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          options={[
            { value: 'announcement', label: 'Announcement' },
            { value: 'update', label: 'Update' },
            { value: 'result', label: 'Result' },
            { value: 'general', label: 'General' }
          ]}
        />

        <Select
          label="Status"
          value={formData.status}
          onChange={(e) => setFormData({ ...formData, status: e.target.value })}
          options={[
            { value: 'draft', label: 'Draft' },
            { value: 'published', label: 'Published' },
            { value: 'archived', label: 'Archived' }
          ]}
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="important"
          checked={formData.important}
          onChange={(e) => setFormData({ ...formData, important: e.target.checked })}
          className="w-4 h-4 rounded border-slate-600 bg-slate-700/50 
                    text-sky-500 focus:ring-sky-500"
        />
        <label htmlFor="important" className="text-sm font-medium text-slate-400">
          Mark as Important
        </label>
      </div>
    </div>
  );

  const renderMediaTab = () => (
    <div className="space-y-6">
      <ImageUpload
        label="Thumbnail"
        value={formData.thumbnail}
        onChange={(file) => setFormData({
          ...formData,
          thumbnailFile: file,
          thumbnail: file ? URL.createObjectURL(file) : null
        })}
      />
    </div>
  );

  const renderRelationsTab = () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-400">Related Departments</label>
        <div className="grid grid-cols-2 gap-2">
          {departments.map(dept => (
            <label key={dept._id} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.departments.includes(dept._id)}
                onChange={(e) => {
                  const newDepts = e.target.checked
                    ? [...formData.departments, dept._id]
                    : formData.departments.filter(id => id !== dept._id);
                  setFormData({ ...formData, departments: newDepts });
                }}
                className="w-4 h-4 rounded border-slate-600 bg-slate-700/50 
                          text-sky-500 focus:ring-sky-500"
              />
              <span className="text-sm text-slate-300">{dept.name}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-400">Related Events</label>
        <div className="grid grid-cols-2 gap-2">
          {events.map(event => (
            <label key={event._id} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.relatedEvents.includes(event._id)}
                onChange={(e) => {
                  const newEvents = e.target.checked
                    ? [...formData.relatedEvents, event._id]
                    : formData.relatedEvents.filter(id => id !== event._id);
                  setFormData({ ...formData, relatedEvents: newEvents });
                }}
                className="w-4 h-4 rounded border-slate-600 bg-slate-700/50 
                          text-sky-500 focus:ring-sky-500"
              />
              <span className="text-sm text-slate-300">{event.title}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );

  const renderScheduleTab = () => (
    <div className="space-y-6">
      <Input
        label="Publish Date"
        type="datetime-local"
        value={formData.publishDate}
        onChange={(e) => setFormData({ ...formData, publishDate: e.target.value })}
      />

      <Input
        label="Expiry Date (Optional)"
        type="datetime-local"
        value={formData.expiryDate}
        onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
      />

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Author Name"
          value={formData.author.name}
          onChange={(e) => setFormData({
            ...formData,
            author: { ...formData.author, name: e.target.value }
          })}
        />
        <Input
          label="Author Role"
          value={formData.author.role}
          onChange={(e) => setFormData({
            ...formData,
            author: { ...formData.author, role: e.target.value }
          })}
        />
      </div>
    </div>
  );

  const renderTagsTab = () => (
    <div className="space-y-6">
      <TagInput
        tags={formData.tags}
        onChange={(tags) => setFormData({ ...formData, tags })}
      />
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'basic': return renderBasicTab();
      case 'media': return renderMediaTab();
      case 'relations': return renderRelationsTab();
      case 'schedule': return renderScheduleTab();
      case 'tags': return renderTagsTab();
      default: return null;
    }
  };

  return (
    <div className="bg-slate-800 rounded-lg shadow-xl h-[100vh] w-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-slate-700 flex justify-between items-center">
        <h3 className="text-xl font-semibold text-white">
          {news ? 'Edit News' : 'Create News'}
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
                   rounded-lg hover:bg-slate-700 transition-colors"
          disabled={loading}
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          className="px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 
                   transition-colors disabled:opacity-50 disabled:cursor-not-allowed
                   flex items-center gap-2"
          disabled={loading}
        >
          {loading && (
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          )}
          Save News
        </button>
      </div>
    </div>
  );
};

export default NewsForm;