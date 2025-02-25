import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Users, Calendar, Settings, 
  ChevronLeft, ChevronRight, ScrollText, 
  GraduationCap, BadgeCheck, BarChart3,
  Trophy, Bell, LogOut, Menu, X
} from 'lucide-react';

const AdminDashboard = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  // Close mobile menu when screen size increases
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 500) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const navigationItems = [
    {
      group: "Main",
      items: [
  
        { name: "Departments", icon: <GraduationCap size={20} />, path: "/adminDashboard/departments" },
        { name: "Stats", icon: <GraduationCap size={20} />, path: "/adminDashboard/stats"},
        { name: "Coordinator Dashboard", icon: <GraduationCap size={20} />, path: "/adminDashboard/coordinator"},
      ]
    },
    {
      group: "Management",
      items: [
        { name: "Events", icon: <Trophy size={20} />, path: "/adminDashboard/events" },
        { name: "New Updates", icon: <ScrollText size={20} />, path: "/adminDashboard/news" },
        { name: "Workshops", icon: <Users size={20} />, path: "/adminDashboard/workshops" },
        { name: "Validation", icon: <Users size={20} />, path: "/adminDashboard/validation" },
        { name: "Offline Registration", icon: <Calendar size={20} />, path: "/adminDashboard/registerOffline" },
        { name: "Offline  Validation", icon: <Calendar size={20} />, path: "/adminDashboard/validateOffline" }
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
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div 
        className={`
          ${isCollapsed ? 'w-20' : 'w-64'} 
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          bg-slate-900/50 border-r border-slate-800 transition-all duration-300 ease-in-out
          fixed h-screen overflow-y-auto z-50
        `}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center gap-2">
              <Trophy size={24} className="text-cyan-500" />
              <h1 className="font-bold text-lg">Admin Panel</h1>
            </div>
          )}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-2 rounded-lg hover:bg-slate-800 transition-colors"
            >
              {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
            </button>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 rounded-lg hover:bg-slate-800 transition-colors lg:hidden"
            >
              <X size={20} />
            </button>
          </div>
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
      </div>

      {/* Main Content */}
      <div 
        className={`flex-1 transition-all duration-300 ease-in-out
        ${isCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}
      >
        {/* Content Header */}
        <header className="bg-slate-900/50 border-b border-slate-800 h-16 flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            {/* Mobile menu buttons */}
            <div className="flex items-center gap-2 lg:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="p-2 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <Menu size={20} />
              </button>
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="p-2 rounded-lg hover:bg-slate-800 transition-colors"
              >
                {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
              </button>
            </div>
            <h1 className="text-xl font-semibold">
              {navigationItems
                .flatMap(group => group.items)
                .find(item => isActivePath(item.path))?.name || 'Dashboard'}
            </h1>
          </div>
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