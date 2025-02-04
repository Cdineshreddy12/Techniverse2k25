import React, { useState } from 'react';
import { 
  Trophy, Calendar, Users, ArrowUpRight, IndianRupee,
  Activity, CheckCircle, Clock
} from 'lucide-react';
import EventForm from './EventForm';
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import EventCard from './EventCard';

const StatCard = ({ title, value, icon, trend, trendColor = "text-emerald-500" }) => (
  <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
    <div className="flex justify-between items-start">
      <div>
        <p className="text-sm text-gray-400">{title}</p>
        <h3 className="text-2xl font-semibold text-white mt-1">{value}</h3>
      </div>
      <div className={`p-3 rounded-lg ${trendColor.replace('text-', 'bg-')}/10`}>
        {icon}
      </div>
    </div>
    {trend && (
      <div className="flex items-center gap-1 mt-4 text-sm">
        <ArrowUpRight className={`w-4 h-4 ${trendColor}`} />
        <span className={trendColor}>{trend}</span>
      </div>
    )}
  </div>
);

const DepartmentStatCard = ({ department }) => {
  const { stats } = department;
  
  return (
    <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-white font-medium">{department.name}</h4>
        <span className="text-xs px-2 py-1 bg-slate-800 rounded-full text-slate-300">
          {department.shortName}
        </span>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-slate-400">Events</p>
          <p className="text-lg font-semibold text-white flex items-center gap-2">
            {stats.totalEvents}
            {stats.activeEvents > 0 && (
              <span className="text-xs px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded-full">
                {stats.activeEvents} active
              </span>
            )}
          </p>
          {stats.upcomingEvents > 0 && (
            <p className="text-sm text-amber-500">
              {stats.upcomingEvents} upcoming
            </p>
          )}
        </div>
        
        <div>
          <p className="text-sm text-slate-400">Registrations</p>
          <p className="text-lg font-semibold text-white">{stats.totalRegistrations}</p>
        </div>
        
        <div>
          <p className="text-sm text-slate-400">Revenue</p>
          <p className="text-lg font-semibold text-white">
            ₹{stats.totalRevenue.toLocaleString()}
          </p>
        </div>
        
        <div>
          <p className="text-sm text-slate-400">Prize Pool</p>
          <p className="text-lg font-semibold text-white">
            ₹{stats.totalPrizeMoney.toLocaleString()}
          </p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-4 gap-2">
        {Object.entries(stats.eventsByStatus).map(([status, count]) => (
          <div key={status} className="text-center py-2 px-1 bg-slate-800/50 rounded">
            <div className="text-lg font-semibold text-white">{count}</div>
            <div className="text-xs text-slate-400 capitalize truncate">{status}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

const EventsManager = () => {
  const [selectedDepartment, setSelectedDepartment] = useState('All Departments');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);

  // Fetch overall stats
  const { data: overallStats = null } = useQuery({
    queryKey: ['stats', 'overall'],
    queryFn: async () => {
      const response = await fetch(`${import.meta.env.VITE_APP_BACKEND_URL}/api/departments/stats/overall`);
      const data = await response.json();
      return data.success ? data.stats : null;
    }
  });

  // Fetch department stats
  const { data: departmentStats = [] } = useQuery({
    queryKey: ['stats', 'departments'],
    queryFn: async () => {
      const response = await fetch(`${import.meta.env.VITE_APP_BACKEND_URL}/api/departments/stats`);
      const data = await response.json();
      return data.success ? data.departments : [];
    }
  });

  // Fetch events
  const { data: eventData = { events: [] }, refetch } = useQuery({
    queryKey: ['events', selectedDepartment],
    queryFn: async () => {
      try {
        const response = await fetch(
          selectedDepartment !== 'All Departments'
            ? `${import.meta.env.VITE_APP_BACKEND_URL}/api/departments/${selectedDepartment}/events`
            : `${import.meta.env.VITE_APP_BACKEND_URL}/api/departments/all/events`
        );
        const data = await response.json();
        
        if (!data.success) {
          throw new Error(data.error || 'Failed to fetch events');
        }
        
        return data;
      } catch (error) {
        toast.error(error.message);
        return { events: [] };
      }
    }
  });

  // Handle create event
  const handleCreateEvent = async (data) => {
    try {
      if (selectedDepartment === 'All Departments') {
        throw new Error('Please select a department first');
      }

      const response = await fetch(
        `${import.meta.env.VITE_APP_BACKEND_URL}/api/departments/${selectedDepartment}/events`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        }
      );

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || 'Failed to create event');
      }

      toast.success('Event created successfully');
      refetch();
      setShowCreateForm(false);
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Handle update event
  const handleUpdateEvent = async (data) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_APP_BACKEND_URL}/api/departments/${selectedDepartment}/events/${editingEvent._id}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        }
      );

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || 'Failed to update event');
      }

      toast.success('Event updated successfully');
      refetch();
      setEditingEvent(null);
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Handle delete event
  const handleDeleteEvent = async (eventId) => {
    try {
      if (!window.confirm('Are you sure you want to delete this event?')) {
        return;
      }

      const response = await fetch(
        `${import.meta.env.VITE_APP_BACKEND_URL}/api/departments/${selectedDepartment}/events/${eventId}`,
        {
          method: 'DELETE'
        }
      );

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || 'Failed to delete event');
      }

      toast.success('Event deleted successfully');
      refetch();
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="space-y-8">
      {/* Overall Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Events"
          value={overallStats?.totalEvents || 0}
          icon={<Trophy className="w-6 h-6 text-emerald-500" />}
          trend={`${overallStats?.activeEvents || 0} active events`}
          trendColor="text-emerald-500"
        />
        <StatCard 
          title="Registrations"
          value={overallStats?.totalRegistrations || 0}
          icon={<Users className="w-6 h-6 text-blue-500" />}
          trend={`${overallStats?.upcomingEvents || 0} upcoming events`}
          trendColor="text-blue-500"
        />
        <StatCard 
          title="Total Revenue"
          value={`₹${(overallStats?.totalRevenue || 0).toLocaleString()}`}
          icon={<IndianRupee className="w-6 h-6 text-purple-500" />}
          trend="From all registrations"
          trendColor="text-purple-500"
        />
        <StatCard 
          title="Prize Money"
          value={`₹${(overallStats?.totalPrizeMoney || 0).toLocaleString()}`}
          icon={<Trophy className="w-6 h-6 text-amber-500" />}
          trend="Total prize pool"
          trendColor="text-amber-500"
        />
      </div>

      {/* Department Statistics */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Department Statistics</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {departmentStats.map(dept => (
            <DepartmentStatCard key={dept._id} department={dept} />
          ))}
        </div>
      </div>

      {/* Events List Section */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-white">Events</h3>
          <div className="flex items-center gap-4">
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2 text-white"
            >
              <option value="All Departments">All Departments</option>
              {departmentStats.map(dept => (
                <option key={dept._id} value={dept._id}>
                  {dept.name}
                </option>
              ))}
            </select>
            <button
              onClick={() => setShowCreateForm(true)}
              className="px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 
                transition-colors duration-200"
            >
              Create Event
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {eventData.events.map(event => (
            <EventCard
              key={event._id}
              event={event}
              onEdit={() => setEditingEvent(event)}
              onDelete={() => handleDeleteEvent(event._id)}
            />
          ))}
          
          {eventData.events.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              No events found
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit Form Modal */}
      {(showCreateForm || editingEvent) && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50">
          <div className="container mx-auto h-full flex items-center justify-center p-4">
            <EventForm
              event={editingEvent}
              onClose={() => {
                setShowCreateForm(false);
                setEditingEvent(null);
              }}
              onSubmit={editingEvent ? handleUpdateEvent : handleCreateEvent}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default EventsManager;