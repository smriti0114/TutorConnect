import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useChild } from '../../context/ChildContext';
import { apiClient } from '../../api/apiClient';
import { 
  Home, Search, Calendar, BookOpen, CreditCard, Users, 
  Bell, LogOut, Menu, X, ChevronDown
} from 'lucide-react';

export const ParentLayout = ({ children }) => {
  const { currentUser, logout } = useAuth();
  const { childrenList, activeChild, setActiveChild } = useChild();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [notifications, setNotifications] = useState([]);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);

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
    { label: 'Dashboard', path: '/parent/dashboard', icon: Home },
    { label: 'Find Tutors', path: '/parent/activities', icon: Search },
    { label: 'My Classes', path: '/parent/classes', icon: Calendar },
    { label: 'Homework', path: '/parent/homework', icon: BookOpen },
    { label: 'Fees & Payments', path: '/parent/payments', icon: CreditCard },
    { label: 'Child Profiles', path: '/parent/children', icon: Users },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-brand-50/30 flex flex-col pb-16 md:pb-0">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-brand-100 px-4 py-3 flex items-center justify-between shadow-sm">
        {/* Brand & Logo */}
        <div className="flex items-center space-x-2">
          <div className="w-9 h-9 rounded-xl bg-brand-500 flex items-center justify-center text-white font-bold text-xl shadow-md shadow-brand-500/20">
            ★
          </div>
          <span className="font-display font-bold text-xl tracking-tight text-brand-900">
            Stellar<span className="text-brand-500">Tutors</span>
          </span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-3">
          {/* Child Profile Switcher */}
          {activeChild && (
            <div className="relative flex items-center bg-brand-50 border border-brand-100 rounded-full px-3 py-1 text-sm font-medium">
              <img 
                src={activeChild.avatar} 
                alt={activeChild.name} 
                className="w-5 h-5 rounded-full mr-2 object-cover" 
              />
              <select
                value={activeChild.id}
                onChange={(e) => setActiveChild(e.target.value)}
                className="bg-transparent text-brand-900 border-none outline-none pr-1 py-0.5 cursor-pointer font-semibold focus:ring-0 text-xs"
              >
                {childrenList.map((child) => (
                  <option key={child.id} value={child.id}>
                    {child.name} (Age {child.age})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Notifications Bell */}
          <div className="relative">
            <button 
              onClick={() => setShowNotifDropdown(!showNotifDropdown)}
              className="p-2 rounded-full text-stone-500 hover:text-brand-600 hover:bg-brand-50 transition-colors relative"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white"></span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifDropdown && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl border border-stone-100 shadow-xl z-50 py-2">
                <div className="px-4 py-2 border-b border-stone-50 flex justify-between items-center">
                  <span className="font-semibold text-stone-800 text-sm">Notifications</span>
                  {unreadCount > 0 && (
                    <span className="text-xs bg-rose-50 text-rose-600 px-2 py-0.5 rounded-full font-medium">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <p className="text-center text-stone-400 text-xs py-8">No notifications yet!</p>
                  ) : (
                    notifications.map((n) => (
                      <div 
                        key={n.id} 
                        onClick={() => handleMarkAsRead(n.id)}
                        className={`px-4 py-3 border-b border-stone-50 hover:bg-stone-50 cursor-pointer transition-colors ${!n.read ? 'bg-brand-50/20' : ''}`}
                      >
                        <div className="flex justify-between items-start">
                          <h4 className="font-semibold text-xs text-stone-800">{n.title}</h4>
                          <span className="text-[10px] text-stone-400">
                            {new Date(n.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                        <p className="text-[11px] text-stone-600 mt-1">{n.message}</p>
                        {!n.read && (
                          <span className="inline-block w-1.5 h-1.5 bg-brand-500 rounded-full mt-2"></span>
                        )}
                      </div>
                    ))
                  )}
                </div>
                <div className="px-4 py-1 border-t border-stone-50 text-center">
                  <Link 
                    to="/parent/notifications" 
                    onClick={() => setShowNotifDropdown(false)}
                    className="text-xs font-semibold text-brand-600 hover:text-brand-700 block w-full py-1.5"
                  >
                    View all notifications
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Desktop User Info & Logout */}
          <div className="hidden md:flex items-center space-x-3 border-l border-stone-100 pl-3">
            <span className="text-xs font-semibold text-stone-700">{currentUser?.name}</span>
            <button
              onClick={handleLogout}
              className="p-2 rounded-full text-stone-400 hover:text-rose-600 hover:bg-rose-55 transition-colors"
              title="Logout"
            >
              <LogOut className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex flex-col w-64 bg-white border-r border-brand-100 p-4 space-y-6">
          <nav className="flex-1 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname.startsWith(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    isActive 
                      ? 'bg-brand-500 text-white shadow-md shadow-brand-500/20' 
                      : 'text-stone-600 hover:bg-brand-50/50 hover:text-brand-600'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
          
          {/* User profile section at bottom */}
          <div className="p-3 bg-stone-50 rounded-2xl flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-full bg-brand-200 flex items-center justify-center text-brand-800 font-bold text-xs uppercase">
                {currentUser?.name.substring(0, 2)}
              </div>
              <div className="truncate">
                <p className="text-xs font-bold text-stone-850 truncate">{currentUser?.name}</p>
                <p className="text-[10px] text-stone-500 truncate">{currentUser?.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="text-stone-400 hover:text-rose-500 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full overflow-y-auto">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-brand-100 flex justify-around py-2 z-40 shadow-[0_-4px_12px_rgba(0,0,0,0.03)]">
        {navItems.slice(0, 5).map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname.startsWith(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center py-1 px-3 rounded-xl transition-colors ${
                isActive ? 'text-brand-500 font-bold' : 'text-stone-400 hover:text-stone-600'
              }`}
            >
              <Icon className="w-5.5 h-5.5" />
              <span className="text-[9px] mt-1 font-medium">{item.label.split(' ')[0]}</span>
            </Link>
          );
        })}
        <button
          onClick={handleLogout}
          className="flex flex-col items-center py-1 px-3 text-stone-400 hover:text-rose-605"
        >
          <LogOut className="w-5.5 h-5.5" />
          <span className="text-[9px] mt-1 font-medium">Logout</span>
        </button>
      </nav>
    </div>
  );
};
