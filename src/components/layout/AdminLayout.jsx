import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { apiClient } from '../../api/apiClient';
import { 
  BarChart, Users, Calendar, Activity, CreditCard, Award, 
  Bell, LogOut, Menu, X
} from 'lucide-react';

export const AdminLayout = ({ children }) => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [notifications, setNotifications] = useState([]);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const fetchNotifs = async () => {
    if (currentUser) {
      try {
        const data = await apiClient.get('/notifications');
        setNotifications(data.map(n => ({ ...n, id: n._id })));
      } catch (err) {
        console.error('Failed to load layout notifications:', err);
      }
    }
  };

  useEffect(() => {
    fetchNotifs();
  }, [currentUser, location]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAsRead = async (id) => {
    try {
      await apiClient.put(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  const navItems = [
    { label: 'Overview', path: '/admin/dashboard', icon: BarChart },
    { label: 'User Directory', path: '/admin/users', icon: Users },
    { label: 'Schedule & Bookings', path: '/admin/classes', icon: Calendar },
    { label: 'Activity Pricing', path: '/admin/activities', icon: Activity },
    { label: 'Financial Tracking', path: '/admin/payments', icon: CreditCard },
    { label: 'Teacher Ratings', path: '/admin/teachers/performance', icon: Award },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-stone-100/40 flex flex-col md:flex-row">
      {/* Mobile Header */}
      <header className="md:hidden sticky top-0 z-40 bg-stone-900 border-b border-stone-850 px-4 py-3 flex items-center justify-between shadow-md">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-teal-500 flex items-center justify-center text-white font-bold text-lg">
            A
          </div>
          <span className="font-display font-bold text-lg text-white">
            AdminControl
          </span>
        </div>

        <div className="flex items-center space-x-3">
          {/* Notifications bell */}
          <div className="relative">
            <button 
              onClick={() => setShowNotifDropdown(!showNotifDropdown)}
              className="p-1.5 rounded-full text-stone-400 hover:text-white"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-teal-500 rounded-full"></span>
              )}
            </button>
            {showNotifDropdown && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl border border-stone-250 shadow-lg z-50 py-1 text-xs">
                <div className="px-3 py-2 border-b border-stone-100 font-semibold text-stone-700">Notifications</div>
                <div className="max-h-48 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <p className="text-center text-stone-400 py-4">No notifications</p>
                  ) : (
                    notifications.map(n => (
                      <div key={n.id} onClick={() => handleMarkAsRead(n.id)} className="p-3 border-b border-stone-50 cursor-pointer">
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
            className="p-1.5 rounded-lg text-stone-400 hover:bg-stone-800"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-stone-950 text-stone-200 p-4 flex flex-col transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:h-screen
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Brand */}
        <div className="hidden md:flex items-center space-x-2.5 mb-8 px-2 py-1">
          <div className="w-9 h-9 rounded-xl bg-teal-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-teal-500/20">
            ★
          </div>
          <span className="font-display font-bold text-xl tracking-tight text-white">
            Admin<span className="text-teal-400">Panel</span>
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
                    ? 'bg-teal-600 text-white shadow-md' 
                    : 'text-stone-400 hover:bg-stone-900 hover:text-stone-100'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User detail & logout */}
        <div className="pt-4 border-t border-stone-900">
          <div className="flex items-center justify-between px-2 mb-2">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-teal-700 flex items-center justify-center text-white font-bold text-xs uppercase">
                {currentUser?.name.substring(0, 2)}
              </div>
              <div className="truncate w-32">
                <p className="text-xs font-bold text-white truncate">{currentUser?.name}</p>
                <p className="text-[10px] text-stone-605 truncate">Administrator</p>
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2.5 w-full text-left px-3 py-2 rounded-xl text-stone-400 hover:bg-stone-900 hover:text-rose-400 text-xs font-semibold transition-all"
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
              Operations Center
            </h1>
            <p className="text-xs text-stone-500">Platform status, financial summary, and user access oversight.</p>
          </div>
          
          {/* Header Actions */}
          <div className="flex items-center space-x-4">
            <div className="relative">
              <button 
                onClick={() => setShowNotifDropdown(!showNotifDropdown)}
                className="p-2 rounded-full text-stone-500 hover:text-teal-600 hover:bg-stone-50 transition-colors"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-teal-500 rounded-full"></span>
                )}
              </button>
              {showNotifDropdown && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl border border-stone-200 shadow-xl z-50 py-2">
                  <div className="px-4 py-2 border-b border-stone-100 font-semibold text-stone-800 text-sm">System Alerts</div>
                  <div className="max-h-64 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <p className="text-center text-stone-400 py-6 text-xs">No pending admin events</p>
                    ) : (
                      notifications.map(n => (
                        <div 
                          key={n.id} 
                          onClick={() => handleMarkAsRead(n.id)} 
                          className={`px-4 py-3 border-b border-stone-50 hover:bg-stone-50 cursor-pointer text-xs ${!n.read ? 'bg-teal-50/10 font-medium' : ''}`}
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
            
            <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold text-xs">
              AD
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
