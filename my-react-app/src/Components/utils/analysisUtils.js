export const calculateEventParticipation = (registrations) => {
    const eventStats = {};
    let totalEvents = 0;
    let totalWorkshops = 0;
  
    registrations.forEach(reg => {
      // Count events
      if (reg.selectedEvents?.length) {
        totalEvents += reg.selectedEvents.length;
        reg.selectedEvents.forEach(event => {
          if (!eventStats[event.eventName]) {
            eventStats[event.eventName] = {
              count: 0,
              participants: new Set()
            };
          }
          eventStats[event.eventName].count++;
          eventStats[event.eventName].participants.add(reg.student?.email);
        });
      }
  
      // Count workshops
      if (reg.selectedWorkshops?.length) {
        totalWorkshops += reg.selectedWorkshops.length;
        reg.selectedWorkshops.forEach(workshop => {
          if (!eventStats[workshop.workshopName]) {
            eventStats[workshop.workshopName] = {
              count: 0,
              participants: new Set()
            };
          }
          eventStats[workshop.workshopName].count++;
          eventStats[workshop.workshopName].participants.add(reg.student?.email);
        });
      }
    });
  
    // Convert Set to count for participants
    Object.keys(eventStats).forEach(key => {
      eventStats[key].uniqueParticipants = eventStats[key].participants.size;
      delete eventStats[key].participants; // Clean up the Set
    });
  
    return {
      eventStats,
      summary: {
        totalEvents,
        totalWorkshops,
        averageEventsPerStudent: totalEvents / registrations.length || 0,
        averageWorkshopsPerStudent: totalWorkshops / registrations.length || 0
      }
    };
  };
  
  export const getRegistrationTrends = (registrations) => {
    const trends = {
      daily: {},
      weekly: {},
      monthly: {}
    };
  
    registrations.forEach(reg => {
      const date = new Date(reg.createdAt);
      
      // Daily trends
      const dailyKey = date.toISOString().split('T')[0];
      trends.daily[dailyKey] = (trends.daily[dailyKey] || 0) + 1;
  
      // Weekly trends
      const weekKey = getWeekNumber(date);
      trends.weekly[weekKey] = (trends.weekly[weekKey] || 0) + 1;
  
      // Monthly trends
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      trends.monthly[monthKey] = (trends.monthly[monthKey] || 0) + 1;
    });
  
    return trends;
  };
  
  export const getDepartmentStats = (registrations) => {
    const deptStats = {};
  
    registrations.forEach(reg => {
      const dept = reg.student?.branch || 'Unknown';
      
      if (!deptStats[dept]) {
        deptStats[dept] = {
          total: 0,
          completedPayments: 0,
          pendingPayments: 0,
          revenue: 0,
          packages: {}
        };
      }
  
      deptStats[dept].total++;
      if (reg.paymentStatus === 'completed') {
        deptStats[dept].completedPayments++;
        deptStats[dept].revenue += reg.amount || 0;
      } else {
        deptStats[dept].pendingPayments++;
      }
  
      const packageName = reg.combo?.name || 'Unknown';
      deptStats[dept].packages[packageName] = (deptStats[dept].packages[packageName] || 0) + 1;
    });
  
    return deptStats;
  };
  
  // Helper function to get week number
  const getWeekNumber = (date) => {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  };
  
  // Helper function to get percentage
  export const getPercentage = (value, total) => {
    return total ? ((value / total) * 100).toFixed(1) : 0;
  };