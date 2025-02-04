import React, { useState } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Users, Calendar, Settings, 
  ChevronLeft, ChevronRight, ScrollText, 
  GraduationCap, BadgeCheck, BarChart3,
  Trophy, Bell, LogOut
} from 'lucide-react';

const AdminDashboard = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();

  const navigationItems = [
    {
      group: "Main",
      items: [
        { name: "Analytics", icon: <BarChart3 size={20} />, path: "/adminDashboard/analytics" },
        { name: "Departments", icon: <GraduationCap size={20} />, path: "/adminDashboard/departments" },
        { name: "Registrations", icon: <ScrollText size={20} />, path: "/adminDashboard/registrations" }
      ]
    },
    {
      group: "Management",
      items: [
        { name: "Events", icon: <Trophy size={20} />, path: "/adminDashboard/events" },
        { name: "New Updates", icon: <ScrollText size={20} />, path: "/adminDashboard/news" },
        { name: "Workshops" ,icon: <Users size={20} />, path: "/adminDashboard/workshops" },
        { name: "Schedule", icon: <Calendar size={20} />, path: "/adminDashboard/schedule" }
      ]
    },
    {
      group: "System",
      items: [
        { name: "Notifications", icon: <Bell size={20} />, path: "/adminDashboard/notifications" },
        { name: "Validations", icon: <BadgeCheck size={20} />, path: "/adminDashboard/validations" },
        { name: "Settings", icon: <Settings size={20} />, path: "/adminDashboard/settings" }
      ]
    }
  ];

  const isActivePath = (path) => {
    if (path === '/adminDashboard') {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex">
      {/* Sidebar */}
      <div 
        className={`${
          isCollapsed ? 'w-20' : 'w-64'
        } bg-slate-900/50 border-r border-slate-800 transition-all duration-300 ease-in-out
        fixed h-screen overflow-y-auto`}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center gap-2">
              <Trophy size={24} className="text-cyan-500" />
              <h1 className="font-bold text-lg">Admin Panel</h1>
            </div>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 rounded-lg hover:bg-slate-800 transition-colors"
          >
            {isCollapsed ? (
              <ChevronRight size={20} />
            ) : (
              <ChevronLeft size={20} />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-8">
          {navigationItems.map((group, groupIndex) => (
            <div key={groupIndex}>
              {!isCollapsed && (
                <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
                  {group.group}
                </h2>
              )}
              <ul className="space-y-2">
                {group.items.map((item, itemIndex) => (
                  <li key={itemIndex}>
                    <NavLink
                      to={item.path}
                      className={({ isActive }) => `
                        flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                        ${isActivePath(item.path) 
                          ? 'bg-cyan-500/10 text-cyan-500' 
                          : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
                        }
                      `}
                    >
                      {item.icon}
                      {!isCollapsed && (
                        <span className="text-sm font-medium">{item.name}</span>
                      )}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        {/* Logout Button */}
        <div className="absolute bottom-0 w-full p-4 border-t border-slate-800">
          <button
            className="flex items-center gap-3 px-4 py-3 rounded-lg w-full
                     text-slate-400 hover:bg-slate-800/50 hover:text-white transition-colors"
          >
            <LogOut size={20} />
            {!isCollapsed && (
              <span className="text-sm font-medium">Logout</span>
            )}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div 
        className={`flex-1 transition-all duration-300 ease-in-out
        ${isCollapsed ? 'ml-20' : 'ml-64'}`}
      >
        {/* Content Header */}
        <header className="bg-slate-900/50 border-b border-slate-800 h-16 flex items-center px-6">
          <h1 className="text-xl font-semibold">
            {navigationItems
              .flatMap(group => group.items)
              .find(item => isActivePath(item.path))?.name || 'Dashboard'}
          </h1>
        </header>

        {/* Content Area */}
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;