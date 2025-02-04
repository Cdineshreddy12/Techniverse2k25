import React, { useState, useMemo } from 'react';
import { 
  Users, Calendar, BookOpen, GraduationCap,
  Clock, ChevronDown, ArrowUpRight
} from 'lucide-react';
import WorkshopForm from './WorkshopForm';

// Initial dummy data
const initialWorkshops = [
  {
    id: 1,
    title: 'React Fundamentals Workshop',
    description: 'Learn the basics of React development',
    registrationEndTime: '2025-02-14T18:00:00',
    departments: ['Computer Science'],
    registrations: 45,
    lecturer: {
      name: 'John Doe',
      title: 'Senior React Developer',
      photo: '',
      specifications: ['10+ years experience', 'Tech Lead at Google']
    },
    schedule: [
      { id: 1, time: '09:00', activity: 'Introduction to React' },
      { id: 2, time: '11:00', activity: 'Hands-on Components' }
    ],
    prerequisites: ['Basic JavaScript', 'HTML & CSS'],
    outcomes: ['Build React Apps', 'Understand Hooks'],
    status: 'upcoming'
  },
  {
    id: 1,
    title: 'React Fundamentals Workshop',
    description: 'Learn the basics of React development',
    registrationEndTime: '2025-02-14T18:00:00',
    departments: ['Computer Science'],
    registrations: 45,
    lecturer: {
      name: 'John Doe',
      title: 'Senior React Developer',
      photo: '',
      specifications: ['10+ years experience', 'Tech Lead at Google']
    },
    schedule: [
      { id: 1, time: '09:00', activity: 'Introduction to React' },
      { id: 2, time: '11:00', activity: 'Hands-on Components' }
    ],
    prerequisites: ['Basic JavaScript', 'HTML & CSS'],
    outcomes: ['Build React Apps', 'Understand Hooks'],
    status: 'upcoming'
  },
  {
    id: 1,
    title: 'React Fundamentals Workshop',
    description: 'Learn the basics of React development',
    registrationEndTime: '2025-02-14T18:00:00',
    departments: ['Computer Science'],
    registrations: 45,
    lecturer: {
      name: 'John Doe',
      title: 'Senior React Developer',
      photo: '',
      specifications: ['10+ years experience', 'Tech Lead at Google']
    },
    schedule: [
      { id: 1, time: '09:00', activity: 'Introduction to React' },
      { id: 2, time: '11:00', activity: 'Hands-on Components' }
    ],
    prerequisites: ['Basic JavaScript', 'HTML & CSS'],
    outcomes: ['Build React Apps', 'Understand Hooks'],
    status: 'upcoming'
  },
  {
    id: 1,
    title: 'React Fundamentals Workshop',
    description: 'Learn the basics of React development',
    registrationEndTime: '2025-02-14T18:00:00',
    departments: ['Computer Science'],
    registrations: 45,
    lecturer: {
      name: 'John Doe',
      title: 'Senior React Developer',
      photo: '',
      specifications: ['10+ years experience', 'Tech Lead at Google']
    },
    schedule: [
      { id: 1, time: '09:00', activity: 'Introduction to React' },
      { id: 2, time: '11:00', activity: 'Hands-on Components' }
    ],
    prerequisites: ['Basic JavaScript', 'HTML & CSS'],
    outcomes: ['Build React Apps', 'Understand Hooks'],
    status: 'upcoming'
  },
  {
    id: 1,
    title: 'React Fundamentals Workshop',
    description: 'Learn the basics of React development',
    registrationEndTime: '2025-02-14T18:00:00',
    departments: ['Computer Science'],
    registrations: 45,
    lecturer: {
      name: 'John Doe',
      title: 'Senior React Developer',
      photo: '',
      specifications: ['10+ years experience', 'Tech Lead at Google']
    },
    schedule: [
      { id: 1, time: '09:00', activity: 'Introduction to React' },
      { id: 2, time: '11:00', activity: 'Hands-on Components' }
    ],
    prerequisites: ['Basic JavaScript', 'HTML & CSS'],
    outcomes: ['Build React Apps', 'Understand Hooks'],
    status: 'upcoming'
  },
  {
    id: 1,
    title: 'React Fundamentals Workshop',
    description: 'Learn the basics of React development',
    registrationEndTime: '2025-02-14T18:00:00',
    departments: ['Computer Science'],
    registrations: 45,
    lecturer: {
      name: 'John Doe',
      title: 'Senior React Developer',
      photo: '',
      specifications: ['10+ years experience', 'Tech Lead at Google']
    },
    schedule: [
      { id: 1, time: '09:00', activity: 'Introduction to React' },
      { id: 2, time: '11:00', activity: 'Hands-on Components' }
    ],
    prerequisites: ['Basic JavaScript', 'HTML & CSS'],
    outcomes: ['Build React Apps', 'Understand Hooks'],
    status: 'upcoming'
  },
  {
    id: 1,
    title: 'React Fundamentals Workshop',
    description: 'Learn the basics of React development',
    registrationEndTime: '2025-02-14T18:00:00',
    departments: ['Computer Science'],
    registrations: 45,
    lecturer: {
      name: 'John Doe',
      title: 'Senior React Developer',
      photo: '',
      specifications: ['10+ years experience', 'Tech Lead at Google']
    },
    schedule: [
      { id: 1, time: '09:00', activity: 'Introduction to React' },
      { id: 2, time: '11:00', activity: 'Hands-on Components' }
    ],
    prerequisites: ['Basic JavaScript', 'HTML & CSS'],
    outcomes: ['Build React Apps', 'Understand Hooks'],
    status: 'upcoming'
  },
  {
    id: 1,
    title: 'React Fundamentals Workshop',
    description: 'Learn the basics of React development',
    registrationEndTime: '2025-02-14T18:00:00',
    departments: ['Computer Science'],
    registrations: 45,
    lecturer: {
      name: 'John Doe',
      title: 'Senior React Developer',
      photo: '',
      specifications: ['10+ years experience', 'Tech Lead at Google']
    },
    schedule: [
      { id: 1, time: '09:00', activity: 'Introduction to React' },
      { id: 2, time: '11:00', activity: 'Hands-on Components' }
    ],
    prerequisites: ['Basic JavaScript', 'HTML & CSS'],
    outcomes: ['Build React Apps', 'Understand Hooks'],
    status: 'upcoming'
  },
  {
    id: 1,
    title: 'React Fundamentals Workshop',
    description: 'Learn the basics of React development',
    registrationEndTime: '2025-02-14T18:00:00',
    departments: ['Computer Science'],
    registrations: 45,
    lecturer: {
      name: 'John Doe',
      title: 'Senior React Developer',
      photo: '',
      specifications: ['10+ years experience', 'Tech Lead at Google']
    },
    schedule: [
      { id: 1, time: '09:00', activity: 'Introduction to React' },
      { id: 2, time: '11:00', activity: 'Hands-on Components' }
    ],
    prerequisites: ['Basic JavaScript', 'HTML & CSS'],
    outcomes: ['Build React Apps', 'Understand Hooks'],
    status: 'upcoming'
  },
  {
    id: 1,
    title: 'React Fundamentals Workshop',
    description: 'Learn the basics of React development',
    registrationEndTime: '2025-02-14T18:00:00',
    departments: ['Computer Science'],
    registrations: 45,
    lecturer: {
      name: 'John Doe',
      title: 'Senior React Developer',
      photo: '',
      specifications: ['10+ years experience', 'Tech Lead at Google']
    },
    schedule: [
      { id: 1, time: '09:00', activity: 'Introduction to React' },
      { id: 2, time: '11:00', activity: 'Hands-on Components' }
    ],
    prerequisites: ['Basic JavaScript', 'HTML & CSS'],
    outcomes: ['Build React Apps', 'Understand Hooks'],
    status: 'upcoming'
  },
  {
    id: 1,
    title: 'React Fundamentals Workshop',
    description: 'Learn the basics of React development',
    registrationEndTime: '2025-02-14T18:00:00',
    departments: ['Computer Science'],
    registrations: 45,
    lecturer: {
      name: 'John Doe',
      title: 'Senior React Developer',
      photo: '',
      specifications: ['10+ years experience', 'Tech Lead at Google']
    },
    schedule: [
      { id: 1, time: '09:00', activity: 'Introduction to React' },
      { id: 2, time: '11:00', activity: 'Hands-on Components' }
    ],
    prerequisites: ['Basic JavaScript', 'HTML & CSS'],
    outcomes: ['Build React Apps', 'Understand Hooks'],
    status: 'upcoming'
  },
  
];

const WorkshopsManager = () => {
  const [workshops, setWorkshops] = useState(initialWorkshops);
  const [selectedDepartment, setSelectedDepartment] = useState('All Departments');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingWorkshop, setEditingWorkshop] = useState(null);

  const departments = [
    'All Departments',
    'Computer Science',
    'Electronics',
    'Mechanical',
    'Civil',
    'Electrical'
  ];

  // Calculate statistics
  const stats = useMemo(() => ({
    totalWorkshops: workshops.length,
    totalRegistrations: workshops.reduce((acc, curr) => acc + curr.registrations, 0),
    upcomingWorkshops: workshops.filter(w => w.status === 'upcoming').length,
    totalLearningHours: workshops.reduce((acc, curr) => acc + curr.schedule?.length || 0, 0) * 2
  }), [workshops]);

  const handleCreateWorkshop = (workshopData) => {
    const newWorkshop = {
      ...workshopData,
      id: workshops.length + 1,
      status: 'upcoming',
      registrations: 0
    };
    setWorkshops(prev => [...prev, newWorkshop]);
    setShowCreateForm(false);
  };

  const handleUpdateWorkshop = (workshopData) => {
    setWorkshops(prev => 
      prev.map(workshop => 
        workshop.id === workshopData.id ? { ...workshop, ...workshopData } : workshop
      )
    );
    setEditingWorkshop(null);
  };

  return (
    <div className="space-y-8">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Workshops"
          value={stats.totalWorkshops}
          icon={<BookOpen className="w-6 h-6 text-emerald-500" />}
          trend="Active workshops"
        />
        <StatCard 
          title="Total Registrations"
          value={stats.totalRegistrations}
          icon={<Users className="w-6 h-6 text-blue-500" />}
          trend="+15% this month"
        />
        <StatCard 
          title="Upcoming Workshops"
          value={stats.upcomingWorkshops}
          icon={<Calendar className="w-6 h-6 text-amber-500" />}
          trend="Next 30 days"
        />
        <StatCard 
          title="Learning Hours"
          value={stats.totalLearningHours}
          icon={<Clock className="w-6 h-6 text-purple-500" />}
          trend="Total hours"
        />
      </div>

      {/* Filters and Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative">
          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="appearance-none pl-4 pr-10 py-2 bg-slate-800 border border-slate-700 
              rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
          >
            {departments.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
          <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 transform -translate-y-1/2" />
        </div>

        <button
          onClick={() => setShowCreateForm(true)}
          className="px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 
            transition-colors flex items-center gap-2"
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
          Create Workshop
        </button>
      </div>

      {/* Workshops Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {workshops.map(workshop => (
          <WorkshopCard 
            key={workshop.id}
            workshop={workshop}
            onEdit={() => setEditingWorkshop(workshop)}
            onDelete={(id) => {
              if (window.confirm('Are you sure you want to delete this workshop?')) {
                setWorkshops(prev => prev.filter(w => w.id !== id));
              }
            }}
          />
        ))}
      </div>

      {/* Create/Edit Modal */}
      {(showCreateForm || editingWorkshop) && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm overflow-y-auto">
          <div className="min-h-screen p-4">
            <div className="w-full max-w-7xl mx-auto my-8">
              <WorkshopForm 
                workshop={editingWorkshop}
                onClose={() => {
                  setShowCreateForm(false);
                  setEditingWorkshop(null);
                }}
                onSubmit={editingWorkshop ? handleUpdateWorkshop : handleCreateWorkshop}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Stat Card Component
const StatCard = ({ title, value, icon, trend }) => (
  <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
    <div className="flex justify-between items-start">
      <div>
        <p className="text-sm text-gray-400">{title}</p>
        <h3 className="text-2xl font-semibold text-white mt-1">{value}</h3>
      </div>
      <div className="bg-slate-700/50 p-3 rounded-lg">
        {icon}
      </div>
    </div>
    <div className="flex items-center gap-1 mt-4 text-sm">
      <ArrowUpRight className="w-4 h-4 text-emerald-500" />
      <span className="text-emerald-500">{trend}</span>
    </div>
  </div>
);

// Workshop Card Component
const WorkshopCard = ({ workshop, onEdit, onDelete }) => {
  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-white">{workshop.title}</h3>
          </div>
          <div className="flex items-center mt-1">
            <GraduationCap className="w-4 h-4 text-sky-400 mr-2" />
            <p className="text-sky-400 text-sm">By {workshop.lecturer.name}</p>
          </div>
          <p className="text-gray-400 text-sm mt-2">{workshop.description}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(workshop)}
            className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <svg className="w-4 h-4 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" 
              />
            </svg>
          </button>
          <button
            onClick={() => onDelete(workshop.id)}
            className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <svg className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" 
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="mt-4 space-y-4">
        {/* Session Info */}
        {workshop.schedule && workshop.schedule.length > 0 && (
          <div className="flex items-center gap-4 text-sm text-gray-400">
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-2" />
              {workshop.schedule.length} Sessions
            </div>
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-2" />
              {workshop.schedule.length * 2} Hours
            </div>
          </div>
        )}

        {/* Prerequisites & Outcomes */}
        <div className="flex flex-wrap gap-2">
          {workshop.prerequisites?.map((prereq, index) => (
            <span key={index} className="text-xs px-2 py-1 bg-purple-500/20 text-purple-400 rounded-full">
              {prereq}
            </span>
          ))}
        </div>

        {/* Registration Status */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-700">
          <div className="flex items-center text-sm text-gray-400">
            <Users className="w-4 h-4 mr-2" />
            {workshop.registrations} Registrations
          </div>
          <div className="text-sm text-gray-400">
            Ends: {formatDate(workshop.registrationEndTime)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkshopsManager;