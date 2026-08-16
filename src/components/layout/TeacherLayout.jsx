import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { mockDb } from '../../services/mockDb';
import { 
  Home, Calendar, Users, BookOpen, Clock, DollarSign, 
  Bell, LogOut, Menu, X, ChevronRight, Sliders
} from 'lucide-react';

export const TeacherLayout = ({ children }) => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [notifications, setNotifications] = useState([]);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (currentUser) {
      const allNotifs = mockDb.getNotifications();
      const teacherNotifs = allNotifs.filter(n => n.recipientUserId === currentUser.id);
      setNotifications(teacherNotifs);
    }
  }, [currentUser, location]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAsRead = (id) => {
    mockDb.markNotificationRead(id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const navItems = [
    { label: 'Dashboard', path: '/teacher/dashboard', icon: Home },
    { label: 'Schedule', path: '/teacher/calendar', icon: Calendar },
    { label: 'Students', path: '/teacher/students', icon: Users },
    { label: 'Homework', path: '/teacher/homework', icon: BookOpen },
    { label: 'Attendance', path: '/teacher/attendance', icon: Clock },
    { label: 'Earnings', path: '/teacher/earnings', icon: DollarSign },
    { label: 'Availability', path: '/teacher/availability', icon: Sliders },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-stone-50/50 flex flex-col md:flex-row">
      {/* Mobile Header */}
      <header className="md:hidden sticky top-0 z-40 bg-white border-b border-stone-200 px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-lg">
            T
          </div>
          <span className="font-display font-bold text-lg text-stone-900">
            TeacherPortal
          </span>
        </div>

        <div className="flex items-center space-x-3">
          {/* Notifications bell */}
          <div className="relative">
            <button 
              onClick={() => setShowNotifDropdown(!showNotifDropdown)}
              className="p-1.5 rounded-full text-stone-500 hover:text-indigo-600"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-indigo-600 rounded-full"></span>
              )}
            </button>
            {showNotifDropdown && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl border border-stone-200 shadow-lg z-50 py-1 text-xs">
                <div className="px-3 py-2 border-b border-stone-100 font-semibold text-stone-700">Notifications</div>
                <div className="max-h-48 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <p className="text-center text-stone-400 py-4">No notifications</p>
                  ) : (
                    notifications.map(n => (
                      <div key={n.id} onClick={() => handleMarkAsRead(n.id)} className={`p-3 border-b border-stone-50 cursor-pointer ${!n.read ? 'bg-indigo-50/20' : ''}`}>
                        <p className="font-bold text-stone-800">{n.title}</p>
                        <p className="text-stone-600 mt-0.5">{n.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 rounded-lg text-stone-600 hover:bg-stone-100"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-stone-900 text-stone-200 p-4 flex flex-col transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:h-screen
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Brand */}
        <div className="hidden md:flex items-center space-x-2.5 mb-8 px-2 py-1">
          <div className="w-9 h-9 rounded-xl bg-indigo-500 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-indigo-500/20">
            ★
          </div>
          <span className="font-display font-bold text-xl tracking-tight text-white">
            Teacher<span className="text-indigo-400">Hub</span>
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-150 ${
                  isActive 
                    ? 'bg-indigo-600 text-white shadow-md' 
                    : 'text-stone-400 hover:bg-stone-800 hover:text-stone-100'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User detail & logout */}
        <div className="pt-4 border-t border-stone-800">
          <div className="flex items-center justify-between px-2 mb-2">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-indigo-700 flex items-center justify-center text-white font-bold text-xs uppercase">
                {currentUser?.name.substring(0, 2)}
              </div>
              <div className="truncate w-32">
                <p className="text-xs font-bold text-white truncate">{currentUser?.name}</p>
                <p className="text-[10px] text-stone-505 truncate">{currentUser?.email}</p>
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2.5 w-full text-left px-3 py-2 rounded-xl text-stone-405 hover:bg-stone-800 hover:text-rose-400 text-xs font-semibold transition-all"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Overlay for mobile drawer */}
      {mobileMenuOpen && (
        <div 
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-black/40 z-30 md:hidden"
        ></div>
      )}

      {/* Page Content wrapper */}
      <div className="flex-1 flex flex-col min-h-0 overflow-y-auto">
        {/* Desktop Header */}
        <header className="hidden md:flex bg-white border-b border-stone-200 px-8 py-4 justify-between items-center shadow-xs">
          <div>
            <h1 className="text-xl font-bold text-stone-850">
              Welcome back, {currentUser?.name.split(' ')[0]}
            </h1>
            <p className="text-xs text-stone-500">Here is your schedule overview for today.</p>
          </div>
          
          {/* Header Actions */}
          <div className="flex items-center space-x-4">
            <div className="relative">
              <button 
                onClick={() => setShowNotifDropdown(!showNotifDropdown)}
                className="p-2 rounded-full text-stone-500 hover:text-indigo-600 hover:bg-stone-50 transition-colors"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-600 rounded-full"></span>
                )}
              </button>
              {showNotifDropdown && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl border border-stone-200 shadow-xl z-50 py-2">
                  <div className="px-4 py-2 border-b border-stone-100 font-semibold text-stone-800 text-sm">Notifications</div>
                  <div className="max-h-64 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <p className="text-center text-stone-400 py-6 text-xs">All caught up!</p>
                    ) : (
                      notifications.map(n => (
                        <div 
                          key={n.id} 
                          onClick={() => handleMarkAsRead(n.id)} 
                          className={`px-4 py-3 border-b border-stone-50 hover:bg-stone-50 cursor-pointer text-xs ${!n.read ? 'bg-indigo-50/10 font-medium' : ''}`}
                        >
                          <p className="text-stone-800">{n.title}</p>
                          <p className="text-stone-500 mt-0.5">{n.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
            
            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs">
              {currentUser?.name.substring(0, 2).toUpperCase()}
            </div>
          </div>
        </header>

        {/* Content body */}
        <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
