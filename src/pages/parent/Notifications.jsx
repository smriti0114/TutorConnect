import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { apiClient } from '../../api/apiClient';
import { Bell, Check, Trash2, Clock } from 'lucide-react';

export const ParentNotifications = () => {
  const { currentUser } = useAuth();
  const [notifications, setNotifications] = useState([]);

  const fetchNotifs = async () => {
    if (currentUser) {
      try {
        const data = await apiClient.get('/notifications');
        const formatted = data.map(n => ({ ...n, id: n._id }));
        setNotifications(formatted);
      } catch (err) {
        console.error('Failed to load notifications:', err);
      }
    }
  };

  useEffect(() => {
    fetchNotifs();
  }, [currentUser]);

  const handleMarkRead = async (id) => {
    try {
      await apiClient.put(`/notifications/${id}/read`);
      fetchNotifs();
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await apiClient.put('/notifications/read-all');
      fetchNotifs();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await apiClient.delete(`/notifications/${id}`);
      fetchNotifs();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-stone-800">Notifications</h2>
          <p className="text-stone-500 text-xs mt-1">Stay updated with homework releases, scheduling changes, and invoice reminders.</p>
        </div>
        {notifications.some(n => !n.read) && (
          <button 
            onClick={handleMarkAllRead}
            className="flex items-center space-x-1.5 text-xs font-bold text-brand-600 hover:text-brand-700 bg-brand-50 hover:bg-brand-100/50 px-3 py-1.5 rounded-xl transition-all"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Mark all read</span>
          </button>
        )}
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {notifications.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-stone-150 p-8">
            <Bell className="w-12 h-12 text-stone-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-stone-850">No notifications</h3>
            <p className="text-stone-405 text-xs mt-1">You are all caught up!</p>
          </div>
        ) : (
          notifications.map((n) => (
            <div 
              key={n.id} 
              className={`bg-white rounded-3xl p-5 border border-brand-100 shadow-sm flex items-start justify-between gap-4 transition-all ${
                !n.read ? 'bg-brand-50/15 border-brand-200' : ''
              }`}
            >
              <div className="flex items-start space-x-3.5 text-xs">
                <div className={`p-2.5 rounded-xl mt-0.5 ${
                  n.type === 'payment' ? 'bg-rose-50 text-rose-600' :
                  n.type === 'homework' ? 'bg-amber-50 text-amber-600' :
                  n.type === 'class' ? 'bg-indigo-50 text-indigo-600' : 'bg-brand-50 text-brand-600'
                }`}>
                  {n.type === 'payment' ? '💰' : n.type === 'homework' ? '📝' : '📅'}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className={`font-bold text-stone-850 text-sm ${!n.read ? 'text-brand-900' : ''}`}>
                      {n.title}
                    </h3>
                    {!n.read && (
                      <span className="w-1.5 h-1.5 bg-brand-500 rounded-full"></span>
                    )}
                  </div>
                  <p className="text-stone-605 mt-1 leading-relaxed text-xs">
                    {n.message}
                  </p>
                  <span className="text-[10px] text-stone-400 mt-2 flex items-center">
                    <Clock className="w-3 h-3 mr-1" />
                    {new Date(n.createdAt).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>

              <div className="flex space-x-1.5">
                {!n.read && (
                  <button 
                    onClick={() => handleMarkRead(n.id)}
                    className="p-2 rounded-xl text-stone-400 hover:text-brand-600 hover:bg-brand-50 transition-colors"
                    title="Mark as read"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                )}
                <button 
                  onClick={() => handleDelete(n.id)}
                  className="p-2 rounded-xl text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
