const EventList = ({ events, onEdit, onDelete }) => {
  // Helper function to format dates
  const formatDateIST = (dateString) => {
    if (!dateString || isNaN(Date.parse(dateString))) return 'Not specified';
  
    return new Date(dateString).toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur-xl rounded-lg p-6">
      <div className="space-y-4">
        {events.length === 0 ? (
          <div className="text-center text-gray-400 py-8">
            No events found
          </div>
        ) : (
          events.map(event => (
            <div 
              key={event._id} 
              className="bg-slate-700/50 rounded-lg p-4 hover:bg-slate-700/70 transition-colors duration-200"
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-white font-medium">{event.title}</h3>
                    <span className="text-xs px-2 py-1 bg-sky-500/20 text-sky-400 rounded-full">
                      {event.tag || 'Event'}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-x-8 gap-y-1 mt-2">
                    <div className="text-gray-400 text-sm flex items-center">
                      <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth="2" 
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" 
                        />
                      </svg>
                      {formatDateIST(event.startTime)}
                    </div>
                    {event.rounds && event.rounds[0] && (
                      <div className="text-gray-400 text-sm flex items-center">
                        <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth="2" 
                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" 
                          />
                        </svg>
                        {event.rounds[0].venue || 'Venue TBA'}
                      </div>
                    )}
                    <div className="text-gray-400 text-sm flex items-center">
                      <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth="2" 
                          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" 
                        />
                      </svg>
                      Team Size: {event.details?.maxTeamSize || 'Not specified'}
                    </div>
                    <div className="text-gray-400 text-sm flex items-center">
                      <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth="2" 
                          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
                        />
                      </svg>
                      Prize: ₹{(event.details?.prizeMoney || 0).toLocaleString()}
                    </div>
                  </div>
                  {event.departments && event.departments.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {event.departments.map(dept => (
                        <span 
                          key={dept}
                          className="text-xs px-2 py-1 bg-slate-600/50 text-slate-300 rounded-full"
                        >
                          {dept}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onEdit(event)}
                    className="p-2 hover:bg-slate-600 rounded-lg transition-colors"
                  >
                    <svg className="w-4 h-4 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth="2" 
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" 
                      />
                    </svg>
                  </button>
                  <button 
                    onClick={() => onDelete(event._id)}
                    className="p-2 hover:bg-slate-600 rounded-lg transition-colors"
                  >
                    <svg className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth="2" 
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" 
                      />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-slate-600/50 pt-4">
                <div className="flex items-center text-gray-400 text-sm">
                  {event.rounds && (
                    <div className="flex items-center gap-2">
                      {event.rounds.map((_, index) => (
                        <span 
                          key={index}
                          className="px-2 py-1 bg-slate-600/50 rounded-full text-xs"
                        >
                          Round {index + 1}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="text-sm">
                  <span className="text-gray-400">Registration Ends: </span>
                  <span className="text-sky-400">
                    {formatDateIST(event.registrationEndTime)}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default EventList;