import React, { useState, useMemo,useEffect } from 'react';
import { 
  Users, Calendar, BookOpen, GraduationCap,
  Clock, ChevronDown, ArrowUpRight
} from 'lucide-react';
import WorkshopForm from './WorkshopForm';
import { workshopService } from '../../../services/workshopService';
import { useQuery } from '@tanstack/react-query';

const WorkshopsManager = () => {
  const [workshops, setWorkshops] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingWorkshop, setEditingWorkshop] = useState(null);

    // Fetch departments using React Query
    const { data: departmentsData, isLoading: isLoadingDepartments } = useQuery({
      queryKey: ['departments'],
      queryFn: () => departmentService.getAll(),
      staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    });

  const [stats, setStats] = useState({
    totalWorkshops: 0,
    totalRegistrations: 0,
    upcomingWorkshops: 0,
    totalLearningHours: 0
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch workshops and stats
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [workshopsData, statsData] = await Promise.all([
        workshopService.getAll(),
        workshopService.getStats()
      ]);

      setWorkshops(workshopsData || []);
      // Add default values for stats to prevent undefined errors
      setStats({
        totalWorkshops: statsData?.stats?.totalWorkshops || 0,
        totalRegistrations: statsData?.stats?.totalRegistrations || 0,
        upcomingWorkshops: statsData?.stats?.activeWorkshops || 0,
        totalLearningHours: statsData?.stats?.totalLearningHours || 0
      });
    } catch (err) {
      setError('Failed to load workshops. Please try again later.');
      console.error('Error loading workshops:', err);
      // Set default stats on error
      setStats({
        totalWorkshops: 0,
        totalRegistrations: 0,
        upcomingWorkshops: 0,
        totalLearningHours: 0
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedDepartment === 'all') {
      fetchData();
      return;
    }
  
    const fetchDepartmentData = async () => {
      try {
        setLoading(true);
        const [workshops, departmentStats] = await Promise.all([
          workshopService.getAll(),
          workshopService.getDepartmentStats(selectedDepartment)
        ]);
        
        // Filter workshops by department
        const filteredWorkshops = workshops.filter(workshop => 
          workshop.departments.some(dept => dept._id === selectedDepartment)
        );
        
        setWorkshops(filteredWorkshops);
        setStats({
          totalWorkshops: departmentStats.totalWorkshops || 0,
          totalRegistrations: departmentStats.totalRegistrations || 0,
          upcomingWorkshops: departmentStats.activeWorkshops || 0,
          totalLearningHours: departmentStats.totalLearningHours || 0
        });
      } catch (err) {
        setError('Failed to load department data. Please try again later.');
        console.error('Error loading department data:', err);
      } finally {
        setLoading(false);
      }
    };
  
    if (selectedDepartment !== 'all') {
      fetchDepartmentData();
    }
  }, [selectedDepartment]);


  const handleCreateWorkshop = async (workshopData) => {
    try {
      setLoading(true);
      // Ensure price and duration are included
      const completeWorkshopData = {
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
      };

      const newWorkshop = await workshopService.createWorkshop(completeWorkshopData);
      setWorkshops(prev => [...prev, newWorkshop.workshop]);
      setShowCreateForm(false);
      
      // Refresh stats
      const newStats = await workshopService.getStats();
      setStats({
        totalWorkshops: newStats?.stats?.totalWorkshops || 0,
        totalRegistrations: newStats?.stats?.totalRegistrations || 0,
        upcomingWorkshops: newStats?.stats?.activeWorkshops || 0,
        totalLearningHours: newStats?.stats?.totalLearningHours || 0
      });
    } catch (err) {
      setError('Failed to create workshop. Please try again.');
      console.error('Error creating workshop:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateWorkshop = async (workshopData) => {
    try {
      setLoading(true);
      const result = await workshopService.updateWorkshop(workshopData._id, workshopData);
      setWorkshops(prev => 
        prev.map(workshop => 
          workshop._id === result.workshop._id ? result.workshop : workshop
        )
      );
      setEditingWorkshop(null);
      
      // Refresh stats
      const newStats = await workshopService.getStats();
      setStats(newStats);
    } catch (err) {
      setError('Failed to update workshop. Please try again.');
      console.error('Error updating workshop:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteWorkshop = async (id) => {
    if (!window.confirm('Are you sure you want to delete this workshop?')) {
      return;
    }

    try {
      setLoading(true);
      await workshopService.deleteWorkshop(id);
      setWorkshops(prev => prev.filter(w => w.id !== id));
      
      // Refresh stats
      const newStats = await workshopService.getStats();
      setStats(newStats);
    } catch (err) {
      setError('Failed to delete workshop. Please try again.');
      console.error('Error deleting workshop:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && workshops.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500"></div>
      </div>
    );
  }

  if (error && workshops.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-red-500">
          {error}
        </div>
      )}

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
          trend={`${stats.totalRegistrations} enrolled`}
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
          disabled={loading}
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
            onDelete={() => handleDeleteWorkshop(workshop.id)}
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
    <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden"> {/* Added overflow-hidden */}
      {/* Banner Image */}
      {(workshop.bannerDesktop || workshop.bannerMobile) && (
        <div className="relative h-32 w-full">
          <img
            src={workshop.bannerDesktop || workshop.bannerMobile}
            alt={workshop.title}
            className="w-full h-full object-cover"
          />
          {/* Gradient overlay for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 to-transparent" />
        </div>
      )}

      {/* Content */}
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold text-white">{workshop.title}</h3>
            </div>
            <div className="flex items-center mt-1">
              {workshop.lecturer?.photo && (
                <div className="w-16 h-16 rounded-full overflow-hidden mr-2">
                  <img
                    src={workshop.lecturer.photo}
                    alt={workshop.lecturer.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
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

        {/* Session Info */}
        {workshop.schedule && workshop.schedule.length > 0 && (
          <div className="flex items-center gap-4 text-sm text-gray-400 mt-4">
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
        <div className="flex flex-wrap gap-2 mt-4">
          {workshop.prerequisites?.map((prereq, index) => (
            <span key={index} className="text-xs px-2 py-1 bg-purple-500/20 text-purple-400 rounded-full">
              {prereq}
            </span>
          ))}
        </div>

        {/* Registration Status */}
        <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-700">
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