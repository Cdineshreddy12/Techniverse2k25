import React, { useState } from 'react';
import { 
  Users, Calendar, BookOpen, GraduationCap,
  Clock, ChevronDown, ArrowUpRight
} from 'lucide-react';
import WorkshopForm from './WorkshopForm';
import { workshopService } from '../../../services/workshopService';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const WorkshopsManager = () => {
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingWorkshop, setEditingWorkshop] = useState(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  
  const queryClient = useQueryClient();

  // Fetch departments
  const { data: departmentsData, isLoading: isLoadingDepartments } = useQuery({
    queryKey: ['departments'],
    queryFn: () => departmentService.getAll(),
    staleTime: 5 * 60 * 1000,
  });

  // Fetch workshops
  const { data: workshopsData, isLoading: isLoadingWorkshops } = useQuery({
    queryKey: ['workshops', selectedDepartment, page, search, status],
    queryFn: async () => {
      if (selectedDepartment === 'all') {
        return workshopService.getAll({
          page,
          limit: 10,
          search,
          status
        });
      }
      return workshopService.getWorkshopsByDepartment(selectedDepartment, {
        page,
        limit: 10,
        search,
        status
      });
    },
    keepPreviousData: true // Add this to prevent flickering
  });

  // Fetch stats
  const { data: statsData, isLoading: isLoadingStats } = useQuery({
    queryKey: ['workshopStats', selectedDepartment],
    queryFn: () => selectedDepartment === 'all' 
      ? workshopService.getStats()
      : workshopService.getDepartmentStats(selectedDepartment)
  });

  console.log('workshops data',workshopsData);
  // Mutations
  const createMutation = useMutation({
    mutationFn: workshopService.createWorkshop,
    onSuccess: () => {
      queryClient.invalidateQueries(['workshops']);
      queryClient.invalidateQueries(['workshopStats']);
      setShowCreateForm(false);
    }
  });

  const updateMutation = useMutation({
    mutationFn: (data) => workshopService.updateWorkshop(data._id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['workshops']);
      queryClient.invalidateQueries(['workshopStats']);
      setEditingWorkshop(null);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: workshopService.deleteWorkshop,
    onSuccess: () => {
      queryClient.invalidateQueries(['workshops']);
      queryClient.invalidateQueries(['workshopStats']);
    }
  });

  const handleCreateWorkshop = async (workshopData) => {
    createMutation.mutate({
      ...workshopData,
      price: parseFloat(workshopData.price) || 0,
      duration: {
        total: parseInt(workshopData.duration?.total) || 1,
        unit: workshopData.duration?.unit || 'hours'
      },
      registration: {
        ...workshopData.registration,
        totalSlots: parseInt(workshopData.registration?.totalSlots) || 30,
        registeredCount: 0,
        isOpen: Boolean(workshopData.registration?.isOpen)
      }
    });
  };

  const handleUpdateWorkshop = (workshopData) => {
    updateMutation.mutate(workshopData);
  };

  const handleDeleteWorkshop = (id) => {
    if (window.confirm('Are you sure you want to delete this workshop?')) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoadingWorkshops && !workshopsData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500"></div>
      </div>
    );
  }

  const stats = statsData?.stats || {
    totalWorkshops: 0,
    totalRegistrations: 0,
    activeWorkshops: 0,
    totalLearningHours: 0
  };


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
  
    console.log('workshop in card',workshop);
    // Convert single lecturer to array format for consistency
    const lecturers = workshop.lecturers || (workshop.lecturer ? [workshop.lecturer] : []);
  
    return (
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
        {/* Banner Image */}
        {(workshop.bannerDesktop || workshop.bannerMobile) && (
          <div className="relative h-32 w-full">
            <img
              src={workshop.bannerDesktop || workshop.bannerMobile}
              alt={workshop.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 to-transparent" />
          </div>
        )}
  
        {/* Content */}
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-white">{workshop.title}</h3>
              
              {/* Lecturers */}
              <div className="mt-4 space-y-3">
                {lecturers.map((lecturer, index) => (
                  <div key={index} className="flex items-center gap-2">
                    {lecturer.photo && (
                      <div className="w-10 h-10 rounded-full overflow-hidden shrink-0">
                        <img
                          src={lecturer.photo}
                          alt={lecturer.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-sky-400 text-sm truncate">{lecturer.name}</p>
                      <p className="text-gray-400 text-xs truncate">{lecturer.title}</p>
                    </div>
                  </div>
                ))}
              </div>
  
              <p className="text-gray-400 text-sm mt-3">{workshop.description}</p>
            </div>
            
            <div className="flex gap-2 ml-4">
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
                onClick={() => onDelete(workshop._id)}
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
  
          {/* Session Info */}
          <div className="flex items-center gap-4 text-sm text-gray-400 mt-4">
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-2" />
              {workshop.schedule?.length || 0} Sessions
            </div>
            {workshop.duration?.total && (
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-2" />
                {workshop.duration.total} {workshop.duration.unit}
              </div>
            )}
          </div>
  
          {/* Prerequisites */}
          {workshop.prerequisites && workshop.prerequisites.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {workshop.prerequisites.map((prereq, index) => (
                <span key={index} className="text-xs px-2 py-1 bg-purple-500/20 text-purple-400 rounded-full">
                  {prereq}
                </span>
              ))}
            </div>
          )}
  
          {/* Registration Stats & Status */}
          <div className="mt-4 pt-4 border-t border-slate-700">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-gray-400" />
                <div className="text-sm">
                  <p className="text-gray-400">Registrations</p>
                  <p className="text-white font-medium">
                    {workshop.registration?.registeredCount || 0}/{workshop.registration?.totalSlots || 0}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-400" />
                <div className="text-sm">
                  <p className="text-gray-400">Registration Ends</p>
                  <p className="text-white font-medium">
                    {formatDate(workshop.registrationEndTime)}
                  </p>
                </div>
              </div>
            </div>
  
            <div className="flex items-center justify-between mt-4">
              <span className={`px-2 py-1 text-xs rounded-full ${
                workshop.status === 'upcoming' ? 'bg-sky-500/20 text-sky-500' :
                workshop.status === 'ongoing' ? 'bg-green-500/20 text-green-500' :
                workshop.status === 'completed' ? 'bg-slate-500/20 text-slate-500' :
                'bg-red-500/20 text-red-500'
              }`}>
                {workshop.status?.charAt(0).toUpperCase() + workshop.status?.slice(1)}
              </span>
              <span className={`px-2 py-1 text-xs rounded-full ${
                workshop.registrationStatus === 'open' ? 'bg-green-500/20 text-green-500' :
                workshop.registrationStatus === 'upcoming' ? 'bg-sky-500/20 text-sky-500' :
                workshop.registrationStatus === 'full' ? 'bg-orange-500/20 text-orange-500' :
                'bg-slate-500/20 text-slate-500'
              }`}>
                Registration {workshop.registrationStatus}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };


  return (
    <div className="space-y-8">
      {(createMutation.error || updateMutation.error || deleteMutation.error) && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-red-500">
          {createMutation.error?.message || updateMutation.error?.message || deleteMutation.error?.message}
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Workshops"
          value={stats.totalWorkshops}
          icon={<BookOpen className="w-6 h-6 text-emerald-500" />}
          trend="Active workshops"
          loading={isLoadingStats}
        />
        <StatCard 
          title="Total Registrations"
          value={stats.totalRegistrations}
          icon={<Users className="w-6 h-6 text-blue-500" />}
          trend={`${stats.totalRegistrations} enrolled`}
          loading={isLoadingStats}
        />
        <StatCard 
          title="Upcoming Workshops"
          value={stats.activeWorkshops}
          icon={<Calendar className="w-6 h-6 text-amber-500" />}
          trend="Next 30 days"
          loading={isLoadingStats}
        />
        <StatCard 
          title="Learning Hours"
          value={stats.totalLearningHours}
          icon={<Clock className="w-6 h-6 text-purple-500" />}
          trend="Total hours"
          loading={isLoadingStats}
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
            <option value="all">All Departments</option>
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
          <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 transform -translate-y-1/2" />
        </div>

        <button
          onClick={() => setShowCreateForm(true)}
          className="px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 
            transition-colors flex items-center gap-2"
          disabled={createMutation.isPending}
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
        {workshopsData?.map(workshop => (
          <WorkshopCard 
            key={workshop._id}
            workshop={workshop}
            onEdit={() => setEditingWorkshop(workshop)}
            onDelete={() => handleDeleteWorkshop(workshop._id)}
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
const StatCard = ({ title, value, icon, trend, loading }) => (
  <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
    <div className="flex justify-between items-start">
      <div>
        <p className="text-sm text-gray-400">{title}</p>
        <h3 className="text-2xl font-semibold text-white mt-1">
          {loading ? (
            <div className="h-8 w-16 bg-slate-700 animate-pulse rounded"></div>
          ) : value}
        </h3>
      </div>
      <div className="bg-slate-700/50 p-3 rounded-lg">
        {icon}
      </div>
    </div>
    <div className="flex items-center gap-1 mt-4 text-sm">
      <ArrowUpRight className="w-4 h-4 text-emerald-500" />
      <span className="text-emerald-500">
        {loading ? (
          <div className="h-4 w-20 bg-slate-700 animate-pulse rounded"></div>
        ) : trend}
      </span>
    </div>
  </div>
);

// Workshop Card Component


export default WorkshopsManager;