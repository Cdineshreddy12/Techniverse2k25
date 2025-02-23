import React, { useState, useEffect } from 'react';
import { useApi } from '../config/useApi';
import { offlineEndpoints, makeOfflineRequest } from '../config/offlineAPI';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { AlertCircle, Download, Users, IndianRupee, CalendarClock, CheckCircle } from 'lucide-react';

const StatsDashboard = () => {
  const api = useApi();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState(null);
  const [coordinators, setCoordinators] = useState([]);
  const [classStats, setClassStats] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        await api.detectCoordinator();
        
        const [coordinatorStats, allCoordinators, classWiseStats] = await Promise.all([
          api.getCoordinatorStats(),
          api.getCoordinatorsSummary(),
          makeOfflineRequest(api, offlineEndpoints.getClassWiseStats)
        ]);

        setStats(coordinatorStats.stats);
        setCoordinators(allCoordinators.summary);
        setClassStats(classWiseStats.data);
      } catch (error) {
        console.error('Error fetching stats:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (api?.isAuthenticated) {
      fetchStats();
    }
  }, [api]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-4">
        <div className="max-w-4xl mx-auto bg-red-900/30 border border-red-500 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-red-500" />
          <p>{error}</p>
        </div>
      </div>
    );
  }

  // Format class data for charts
  const classData = classStats?.classWiseData ? Object.entries(classStats.classWiseData).map(([className, data]) => ({
    name: className,
    amount: data.totalAmount,
    registrations: data.registrations,
    events: data.events,
    workshops: data.workshops
  })) : [];

  // Format coordinator data for charts
  const coordinatorData = coordinators.map(coord => ({
    name: coord.name || 'Unknown',
    amount: coord.totalAmount,
    registrations: coord.totalRegistrations,
    checkIns: coord.totalCheckIns
  }));

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold">Statistics Dashboard</h1>

        {/* Overall Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gray-800 rounded-lg p-4 flex items-center gap-3">
            <IndianRupee className="h-8 w-8 text-green-400" />
            <div>
              <p className="text-sm text-gray-400">Total Amount</p>
              <p className="text-xl font-bold">₹{classStats?.totalStats.totalAmount || 0}</p>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-4 flex items-center gap-3">
            <Users className="h-8 w-8 text-blue-400" />
            <div>
              <p className="text-sm text-gray-400">Total Registrations</p>
              <p className="text-xl font-bold">{classStats?.totalStats.registrations || 0}</p>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-4 flex items-center gap-3">
            <CheckCircle className="h-8 w-8 text-cyan-400" />
            <div>
              <p className="text-sm text-gray-400">Total Events</p>
              <p className="text-xl font-bold">{classStats?.totalStats.events || 0}</p>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-4 flex items-center gap-3">
            <CalendarClock className="h-8 w-8 text-purple-400" />
            <div>
              <p className="text-sm text-gray-400">Total Workshops</p>
              <p className="text-xl font-bold">{classStats?.totalStats.workshops || 0}</p>
            </div>
          </div>
        </div>

        {/* Today's Stats */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">Today's Statistics</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-700/50 p-4 rounded-lg">
              <p className="text-gray-400">Registrations</p>
              <p className="text-2xl font-bold">{classStats?.dailyStats.totalRegistrations || 0}</p>
            </div>
            <div className="bg-gray-700/50 p-4 rounded-lg">
              <p className="text-gray-400">Amount Collected</p>
              <p className="text-2xl font-bold">₹{classStats?.dailyStats.totalAmount || 0}</p>
            </div>
            <div className="bg-gray-700/50 p-4 rounded-lg">
              <p className="text-gray-400">Registration Types</p>
              <div className="text-sm space-y-1 mt-2">
                <p>Events: {classStats?.dailyStats.registrationTypes.events || 0}</p>
                <p>Workshops: {classStats?.dailyStats.registrationTypes.workshop || 0}</p>
                <p>Both: {classStats?.dailyStats.registrationTypes.both || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Class-wise Statistics */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">Class-wise Statistics</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={classData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                <XAxis dataKey="name" stroke="#fff" />
                <YAxis stroke="#fff" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f2937', border: 'none' }}
                  labelStyle={{ color: '#fff' }}
                />
                <Legend />
                <Bar name="Amount (₹)" dataKey="amount" fill="#3b82f6" />
                <Bar name="Registrations" dataKey="registrations" fill="#22c55e" />
                <Bar name="Events" dataKey="events" fill="#eab308" />
                <Bar name="Workshops" dataKey="workshops" fill="#ec4899" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Class-wise Detailed Table */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">Detailed Class Statistics</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left border-b border-gray-700">
                  <th className="p-3">Class</th>
                  <th className="p-3">Total Amount</th>
                  <th className="p-3">Registrations</th>
                  <th className="p-3">Events</th>
                  <th className="p-3">Workshops</th>
                  <th className="p-3">Events Only</th>
                  <th className="p-3">Workshops Only</th>
                  <th className="p-3">Both</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(classStats?.classWiseData || {}).map(([className, data]) => (
                  <tr key={className} className="border-b border-gray-700/50">
                    <td className="p-3">{className}</td>
                    <td className="p-3">₹{data.totalAmount}</td>
                    <td className="p-3">{data.registrations}</td>
                    <td className="p-3">{data.events}</td>
                    <td className="p-3">{data.workshops}</td>
                    <td className="p-3">{data.registrationTypes.events}</td>
                    <td className="p-3">{data.registrationTypes.workshop}</td>
                    <td className="p-3">{data.registrationTypes.both}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Coordinator Statistics */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">Coordinator Statistics</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={coordinatorData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                <XAxis dataKey="name" stroke="#fff" />
                <YAxis stroke="#fff" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f2937', border: 'none' }}
                  labelStyle={{ color: '#fff' }}
                />
                <Legend />
                <Bar name="Amount (₹)" dataKey="amount" fill="#3b82f6" />
                <Bar name="Registrations" dataKey="registrations" fill="#22c55e" />
                <Bar name="Check-ins" dataKey="checkIns" fill="#a855f7" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsDashboard;