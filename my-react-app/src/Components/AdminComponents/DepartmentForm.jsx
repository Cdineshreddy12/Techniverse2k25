import React, { useState, useEffect } from 'react';
import { 
  Monitor, CircuitBoard, Zap, Building2, Cog, Terminal,
  Cpu, Database, Globe, Radio, Smartphone, Wifi, Server,
  Atom, Award, Rocket, Book, GraduationCap, BrainCircuit,
  Binary, Calculator, Code, ArrowRight
} from 'lucide-react';
import toast from 'react-hot-toast';
import { DepartmentList } from './DepartmentList';
const DepartmentForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    shortName: '',
    description: '',
    selectedIcon: 'Monitor',
    totalEvents: 0,
    registrationDeadline: ''
  });

  const [preview, setPreview] = useState(null);

  // Predefined color schemes
  const colorSchemes = [
    { name: 'Blue Ocean', from: 'from-cyan-500', to: 'to-blue-500', hover: 'hover:from-cyan-600 hover:to-blue-600' },
    { name: 'Purple Dream', from: 'from-purple-500', to: 'to-pink-500', hover: 'hover:from-purple-600 hover:to-pink-600' },
    { name: 'Sunset Orange', from: 'from-amber-500', to: 'to-orange-500', hover: 'hover:from-amber-600 hover:to-orange-600' },
    { name: 'Forest Green', from: 'from-emerald-500', to: 'to-green-500', hover: 'hover:from-emerald-600 hover:to-green-600' },
    { name: 'Ruby Red', from: 'from-red-500', to: 'to-rose-500', hover: 'hover:from-red-600 hover:to-rose-600' },
    { name: 'Royal Purple', from: 'from-indigo-500', to: 'to-purple-500', hover: 'hover:from-indigo-600 hover:to-purple-600' }
  ];

  // Available icons with labels
  const availableIcons = {
    Monitor: <Monitor className="w-6 h-6" />,
    CircuitBoard: <CircuitBoard className="w-6 h-6" />,
    Zap: <Zap className="w-6 h-6" />,
    Building2: <Building2 className="w-6 h-6" />,
    Cog: <Cog className="w-6 h-6" />,
    Terminal: <Terminal className="w-6 h-6" />,
    Cpu: <Cpu className="w-6 h-6" />,
    Database: <Database className="w-6 h-6" />,
    Globe: <Globe className="w-6 h-6" />,
    Radio: <Radio className="w-6 h-6" />,
    Smartphone: <Smartphone className="w-6 h-6" />,
    Wifi: <Wifi className="w-6 h-6" />,
    Server: <Server className="w-6 h-6" />,
    Book: <Book className="w-6 h-6" />,
    GraduationCap: <GraduationCap className="w-6 h-6" />,
    BrainCircuit: <BrainCircuit className="w-6 h-6" />,
    Calculator: <Calculator className="w-6 h-6" />,
    Code: <Code className="w-6 h-6" />
  };

  const [selectedScheme, setSelectedScheme] = useState(colorSchemes[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [editingId, setEditingId] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');
    setSuccessMessage('');
    
    const departmentData = {
      ...formData,
      color: `${selectedScheme.from} ${selectedScheme.to}`,
      hoverColor: selectedScheme.hover,
      icon: formData.selectedIcon
    };

    try {
      const url = editingId 
        ? `${import.meta.env.VITE_APP_BACKEND_URL}/api/departments/${editingId}`
        : `${import.meta.env.VITE_APP_BACKEND_URL}/api/departments`;

      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(departmentData),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(editingId ? 'Department updated successfully!' : 'Department created successfully!');
        setSuccessMessage(editingId ? 'Department updated successfully!' : 'Department created successfully!');
        // Reset form
        setFormData({
          name: '',
          shortName: '',
          description: '',
          selectedIcon: 'Monitor',
          totalEvents: 0,
          registrationDeadline: ''
        });
        setEditingId(null); // Reset editing state
      } else {
        throw new Error(data.error || 'Operation failed');
      }
    } catch (error) {
      setErrorMessage(`${editingId ? 'Error updating' : 'Error creating'} department: ${error.message}`);
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <header className="bg-slate-900/50 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center  justify-center">
            <div className="flex items-center  space-x-3">
              <Atom className="w-8 h-8 text-cyan-500" />
              <h1 className="text-2xl font-bold  text-white">Department Dashboard</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form Section */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
            <h2 className="text-xl font-semibold text-white mb-6">Create Department</h2>
            
            {successMessage && (
              <div className="mb-4 p-4 bg-green-500/20 border border-green-500 rounded-lg text-green-400">
                {successMessage}
              </div>
            )}
            
            {errorMessage && (
              <div className="mb-4 p-4 bg-red-500/20 border border-red-500 rounded-lg text-red-400">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Department Name */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Department Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg 
                           text-white placeholder-gray-500 focus:outline-none focus:ring-2 
                           focus:ring-cyan-500 focus:border-transparent"
                  placeholder="e.g., Computer Science"
                  required
                />
              </div>

              {/* Short Name */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Short Name
                </label>
                <input
                  type="text"
                  name="shortName"
                  value={formData.shortName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg 
                           text-white placeholder-gray-500 focus:outline-none focus:ring-2 
                           focus:ring-cyan-500 focus:border-transparent"
                  placeholder="e.g., CSE"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg 
                           text-white placeholder-gray-500 focus:outline-none focus:ring-2 
                           focus:ring-cyan-500 focus:border-transparent resize-none"
                  placeholder="Enter department description"
                  required
                />
              </div>

              {/* Icon Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Select Icon
                </label>
                <div className="grid grid-cols-4 gap-3 p-3 bg-slate-800/50 border border-slate-700 rounded-lg">
                  {Object.entries(availableIcons).map(([name, icon]) => (
                    <div
                      key={name}
                      onClick={() => setFormData(prev => ({ ...prev, selectedIcon: name }))}
                      className={`flex flex-col items-center p-3 rounded-lg cursor-pointer
                                transition-all duration-200 hover:bg-slate-700
                                ${formData.selectedIcon === name 
                                  ? 'bg-slate-700 ring-2 ring-cyan-500' 
                                  : 'bg-slate-800'}`}
                    >
                      <div className="text-white mb-2">{icon}</div>
                      <span className="text-xs text-gray-400 text-center">{name}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Color Scheme Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Color Scheme
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {colorSchemes.map((scheme, index) => (
                    <div
                      key={index}
                      onClick={() => setSelectedScheme(scheme)}
                      className={`cursor-pointer rounded-lg border border-slate-700 overflow-hidden
                                transition-all duration-200
                                ${selectedScheme === scheme ? 'ring-2 ring-cyan-500' : ''}`}
                    >
                      <div className={`h-12 bg-gradient-to-r ${scheme.from} ${scheme.to}`} />
                      <div className="p-2 bg-slate-800">
                        <p className="text-xs text-center text-gray-400">{scheme.name}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Events and Deadline */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Total Events
                  </label>
                  <input
                    type="number"
                    name="totalEvents"
                    value={formData.totalEvents}
                    onChange={handleInputChange}
                    min="0"
                    className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg 
                             text-white placeholder-gray-500 focus:outline-none focus:ring-2 
                             focus:ring-cyan-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Registration Deadline
                  </label>
                  <input
                    type="date"
                    name="registrationDeadline"
                    value={formData.registrationDeadline}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg 
                             text-white placeholder-gray-500 focus:outline-none focus:ring-2 
                             focus:ring-cyan-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-3 px-4 rounded-lg font-medium text-white
                          transition-all duration-200 
                          ${isSubmitting 
                            ? 'bg-slate-700 cursor-not-allowed' 
                            : 'bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600'
                          }`}
              >
                {isSubmitting ? 'Creating...' : 'Create Department'}
              </button>
            </form>
          </div>

          {/* Preview Section */}
          <div>
            <h2 className="text-xl font-semibold text-white mb-6">Preview</h2>
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden">
              <div className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${selectedScheme.from} ${selectedScheme.to}
                                transition-all duration-300`}>
                    {availableIcons[formData.selectedIcon]}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">
                      {formData.name || 'Department Name'}
                    </h2>
                    <p className="text-gray-400 text-sm">
                      ({formData.shortName || 'SHORT'})
                    </p>
                  </div>
                </div>
                <p className="text-gray-400 text-sm mb-6">
                  {formData.description || 'Department description will appear here'}
                </p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">
                    {formData.totalEvents || 0} Events Available
                  </span>
                  <div className="flex items-center gap-2 text-cyan-400">
                    <span>View Events</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </div>

            {/* Preview Info */}
            <div className="mt-6 p-4 bg-slate-900/50 border border-slate-800 rounded-lg">
              <h3 className="text-lg font-medium text-white mb-3">Preview Information</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-cyan-400"></div>
                  <p className="text-sm text-gray-400">
                    This is how your department card will appear on the main page
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-cyan-400"></div>
                  <p className="text-sm text-gray-400">
                    Color scheme and icon changes are reflected in real-time
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-cyan-400"></div>
                  <p className="text-sm text-gray-400">
                    Registration deadline: {formData.registrationDeadline || 'Not set'}
                  </p>
                </div>
              </div>
            </div>

             {/* Department List */}
             <DepartmentList
            availableIcons={availableIcons}
            colorSchemes={colorSchemes}
            onEdit={(department) => {
              window.scrollTo({ top: 0, behavior: 'smooth' });
              setFormData({
                name: department.name,
                shortName: department.shortName,
                description: department.description,
                selectedIcon: department.icon,
                totalEvents: department.totalEvents,
                registrationDeadline: department.registrationDeadline?.split('T')[0]
              });
              const scheme = colorSchemes.find(s => 
                `${s.from} ${s.to}` === department.color
              );
              if (scheme) setSelectedScheme(scheme);
            }}
            onUpdate={(id) => setEditingId(id)}
          />
        
          </div>
        </div>
      </main>
    </div>
  );
};

export default DepartmentForm;