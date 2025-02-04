import React from 'react';
import { 
  Calendar, Users, IndianRupee, Clock, Edit2, 
  Trash2, Star, Timer, AlertCircle ,Trophy
} from 'lucide-react';

const EventCard = ({ event, onEdit, onDelete }) => {
  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      draft: 'bg-gray-500/20 text-gray-400',
      published: 'bg-green-500/20 text-green-400',
      cancelled: 'bg-red-500/20 text-red-400',
      completed: 'bg-blue-500/20 text-blue-400'
    };
    return colors[status] || colors.draft;
  };

  const getRemainingSpots = () => {
    if (!event.maxRegistrations) return 'Unlimited spots';
    const remaining = event.maxRegistrations - (event.registrationCount || 0);
    return `${remaining} spots left`;
  };

  return (
    <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6 hover:border-slate-600 transition-colors">
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-semibold text-white">
              {event.title}
            </h3>
            {event.tag && (
              <span className="px-2 py-1 bg-indigo-500/20 text-indigo-400 text-xs rounded-full">
                {event.tag}
              </span>
            )}
            <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(event.status)}`}>
              {event.status}
            </span>
            {event.isPremium && (
              <Star className="w-4 h-4 text-amber-400" />
            )}
          </div>
          <p className="text-gray-400 text-sm line-clamp-2">
            {event.details?.description || 'No description available'}
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => onEdit(event)}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <Edit2 className="w-4 h-4 text-sky-400" />
          </button>
          <button
            onClick={() => onDelete(event._id)}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4 text-red-400" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Calendar className="w-4 h-4 text-sky-400" />
          <span>{formatDate(event.startTime)}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Timer className="w-4 h-4 text-emerald-400" />
          <span>{event.duration || 'Duration not set'}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Users className="w-4 h-4 text-purple-400" />
          <span>{event.registrationType === 'team' 
            ? `Teams (max ${event.details?.maxTeamSize || 1})` 
            : 'Individual'}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <IndianRupee className="w-4 h-4 text-amber-400" />
          <span>₹{event.registrationFee?.toLocaleString() || 0}</span>
        </div>
      </div>

      {/* Prize and Registration Info */}
      <div className="mt-4 pt-4 border-t border-slate-700 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {event.details?.prizeStructure?.length > 0 && (
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-400" />
              <span className="text-sm text-gray-400">
                Prize pool: ₹{event.details.prizeStructure.reduce((sum, p) => sum + p.amount, 0).toLocaleString()}
              </span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-sky-400" />
            <span className="text-sm text-gray-400">
              {getRemainingSpots()}
            </span>
          </div>
        </div>

        {/* Registration Status */}
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-indigo-400" />
          <span className="text-sm text-gray-400">
            Registration ends: {formatDate(event.registrationEndTime)}
          </span>
        </div>
      </div>

      {/* Rounds */}
      {event.rounds?.length > 0 && (
        <div className="mt-4 pt-4 border-t border-slate-700">
          <div className="flex flex-wrap gap-2">
            {event.rounds.map((round, index) => (
              <div key={index} 
                className="text-xs px-3 py-1 bg-slate-800 rounded-full text-gray-300 flex items-center gap-2">
                <span>Round {round.roundNumber}</span>
                {round.venue && (
                  <span className="text-gray-500">@ {round.venue}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Departments */}
      {event.departments?.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {event.departments.map((dept, index) => (
            <span key={index} 
              className="text-xs px-2 py-1 bg-slate-800/80 rounded-full text-gray-400">
              {dept.name || dept}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default EventCard;