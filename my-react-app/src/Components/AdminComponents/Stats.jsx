import React from 'react';
import { Loader } from 'lucide-react';

export const StatsSection = ({ stats, isLoading, error }) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-32">
        <Loader className="w-6 h-6 animate-spin text-sky-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 p-4">
        Failed to load stats: {error.message}
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div className="bg-gradient-to-br from-sky-500/10 to-purple-500/10 rounded-lg p-6 border border-sky-500/20">
        <h3 className="text-gray-400 text-sm mb-2">Total Registrations</h3>
        <p className="text-3xl font-bold text-white">{stats.totalRegistrations}</p>
      </div>
      <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-lg p-6 border border-purple-500/20">
        <h3 className="text-gray-400 text-sm mb-2">Total Revenue</h3>
        <p className="text-3xl font-bold text-white">₹{stats.totalRevenue}</p>
      </div>
      <div className="bg-gradient-to-br from-emerald-500/10 to-sky-500/10 rounded-lg p-6 border border-emerald-500/20">
        <h3 className="text-gray-400 text-sm mb-2">Completed Payments</h3>
        <p className="text-3xl font-bold text-white">{stats.completedPayments}</p>
      </div>
      <div className="bg-gradient-to-br from-orange-500/10 to-red-500/10 rounded-lg p-6 border border-orange-500/20">
        <h3 className="text-gray-400 text-sm mb-2">Pending Payments</h3>
        <p className="text-3xl font-bold text-white">{stats.pendingPayments}</p>
      </div>
    </div>
  );
};