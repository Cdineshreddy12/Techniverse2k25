import React, { useState, useEffect } from 'react';
import { Award, Calendar, Users, DollarSign, Activity, Clock } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, className = "" }) => (
  <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
    <div className="flex items-center gap-3">
      <div className="p-2 bg-slate-700/50 rounded-lg">
        <Icon className="w-5 h-5 text-sky-500" />
      </div>
      <div>
        <h4 className="text-sm font-medium text-slate-400">{title}</h4>
        <p className="text-xl font-semibold text-white">{value}</p>
      </div>
    </div>
  </div>
);

const DepartmentStats = ({ departmentId }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      if (!departmentId) return;
      
      try {
        setLoading(true);
        const response = await fetch(`${import.meta.env.VITE_APP_BACKEND_URL}/api/departments/${departmentId}/stats`);
        if (!response.ok) throw new Error('Failed to fetch stats');
        const data = await response.json();
        setStats(data.stats);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [departmentId]);

  if (!departmentId) return null;
  if (loading) return <div className="text-slate-400">Loading stats...</div>;
  if (error) return <div className="text-red-400">Error: {error}</div>;
  if (!stats) return null;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-800">
      <h3 className="text-lg font-semibold text-white mb-6">
        {stats.department.name} Statistics
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          title="Total Events"
          value={stats.events.total}
          icon={Calendar}
        />
        <StatCard
          title="Active Events"
          value={stats.events.active}
          icon={Activity}
        />
        <StatCard
          title="Total Registrations"
          value={stats.registration.totalRegistrations}
          icon={Users}
        />
        <StatCard
          title="Total Revenue"
          value={formatCurrency(stats.financial.totalRevenue)}
          icon={DollarSign}
        />
        <StatCard
          title="Prize Money"
          value={formatCurrency(stats.financial.totalPrizeMoney)}
          icon={Award}
        />
        <StatCard
          title="Upcoming Events"
          value={stats.events.upcoming}
          icon={Clock}
        />
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Status Breakdown */}
        <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
          <h4 className="text-sm font-medium text-slate-400 mb-3">Events by Status</h4>
          <div className="space-y-2">
            {Object.entries(stats.events.byStatus).map(([status, count]) => (
              <div key={status} className="flex justify-between items-center">
                <span className="text-slate-300 capitalize">{status}</span>
                <span className="text-white font-medium">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Registration Type Breakdown */}
        <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
          <h4 className="text-sm font-medium text-slate-400 mb-3">Registration Types</h4>
          <div className="space-y-2">
            {Object.entries(stats.registration.byType).map(([type, count]) => (
              <div key={type} className="flex justify-between items-center">
                <span className="text-slate-300 capitalize">{type}</span>
                <span className="text-white font-medium">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Timeline Section */}
      {stats.timeline.nextEvent && (
        <div className="mt-6 bg-slate-800/50 p-4 rounded-lg border border-slate-700">
          <h4 className="text-sm font-medium text-slate-400 mb-3">Next Event</h4>
          <div className="text-white">
            <p className="font-medium">{stats.timeline.nextEvent.title}</p>
            <p className="text-sm text-slate-400">
              {new Date(stats.timeline.nextEvent.startTime).toLocaleDateString()}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default DepartmentStats;