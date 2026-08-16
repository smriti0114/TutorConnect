import React, { useState, useEffect } from 'react';
import { apiClient } from '../../api/apiClient';
import { Calendar, Check, X, Clock, Edit2 } from 'lucide-react';

export const AdminClasses = () => {
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [activeTab, setActiveTab] = useState('pending');

  // Reschedule & Reassign states
  const [selectedClass, setSelectedClass] = useState(null);
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [newTeacherId, setNewTeacherId] = useState('');
  const [successMsg, setSuccessMsg] = useState(null);

  const fetchClasses = async () => {
    try {
      const bookingsData = await apiClient.get('/bookings');
      setClasses(bookingsData.map(c => ({ ...c, id: c._id })));

      const teachersData = await apiClient.get('/teachers');
      setTeachers(teachersData);
    } catch (err) {
      console.error('Failed to load classes or teachers catalog:', err);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  const handleApprove = async (id) => {
    try {
      await apiClient.put(`/bookings/${id}/approve`);
      fetchClasses();
    } catch (err) {
      alert(err.message || 'Failed to approve booking.');
    }
  };

  const handleReject = async (id) => {
    if (window.confirm('Are you sure you want to decline this booking request? This will notify the parent.')) {
      try {
        await apiClient.put(`/bookings/${id}/reject`);
        fetchClasses();
      } catch (err) {
        alert(err.message || 'Failed to reject booking.');
      }
    }
  };

  const handleRescheduleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedClass) return;

    try {
      if (newDate && newTime) {
        await apiClient.put(`/bookings/${selectedClass.id || selectedClass._id}/reschedule`, {
          date: newDate,
          startTime: newTime,
        });
      }

      if (newTeacherId) {
        await apiClient.put(`/bookings/${selectedClass.id || selectedClass._id}/reassign`, {
          teacherId: newTeacherId,
        });
      }

      setSuccessMsg('Booking adjustments updated successfully.');
      fetchClasses();
      
      setTimeout(() => {
        setSelectedClass(null);
        setSuccessMsg(null);
        setNewDate('');
        setNewTime('');
        setNewTeacherId('');
      }, 1500);
    } catch (err) {
      alert(err.message || 'Failed to update schedule parameters.');
    }
  };

  const getStudentName = (child) => {
    if (child && typeof child === 'object') return child.name;
    return 'Student';
  };

  const getTeacherName = (teacher) => {
    if (teacher && typeof teacher === 'object') return teacher.name;
    return 'Tutor';
  };

  const getActivityName = (act) => {
    if (act && typeof act === 'object') return act.name;
    return 'Extracurricular';
  };

  const filteredClasses = classes.filter(c => {
    if (activeTab === 'pending') return c.bookingStatus === 'pending';
    if (activeTab === 'scheduled') return c.bookingStatus === 'approved' && (c.status === 'upcoming' || c.status === 'rescheduled');
    if (activeTab === 'history') return c.status === 'completed' || c.status === 'canceled';
    return true;
  });

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Title */}
      <div>
        <h2 className="text-2xl font-bold text-stone-850">Class Schedule & Booking Approvals</h2>
        <p className="text-stone-500 text-xs mt-1">Review student scheduling requests, reassign tutors, or reschedule active sessions.</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-stone-200">
        <button
          onClick={() => setActiveTab('pending')}
          className={`pb-3 text-sm font-bold transition-all px-4 ${activeTab === 'pending' ? 'border-b-2 border-teal-500 text-teal-650' : 'text-stone-400 hover:text-stone-605'}`}
        >
          Approval Requests ({classes.filter(c => c.bookingStatus === 'pending').length})
        </button>
        <button
          onClick={() => setActiveTab('scheduled')}
          className={`pb-3 text-sm font-bold transition-all px-4 ${activeTab === 'scheduled' ? 'border-b-2 border-teal-500 text-teal-650' : 'text-stone-400 hover:text-stone-605'}`}
        >
          Scheduled Classes ({classes.filter(c => c.bookingStatus === 'approved' && (c.status === 'upcoming' || c.status === 'rescheduled')).length})
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`pb-3 text-sm font-bold transition-all px-4 ${activeTab === 'history' ? 'border-b-2 border-teal-500 text-teal-655' : 'text-stone-400 hover:text-stone-605'}`}
        >
          Completed logs ({classes.filter(c => c.status === 'completed' || c.status === 'canceled').length})
        </button>
      </div>

      {/* List */}
      <div className="space-y-4">
        {filteredClasses.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-stone-200">
            <Calendar className="w-12 h-12 text-stone-300 mx-auto mb-3" />
            <p className="text-stone-505 text-sm font-semibold">No classes found in this category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredClasses.map((cls) => (
              <div key={cls.id} className="bg-white rounded-3xl p-5 border border-stone-200 shadow-xs space-y-4 flex flex-col justify-between animate-fadeIn">
                <div className="space-y-2.5">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="inline-block bg-teal-50 text-teal-900 font-extrabold text-[9px] px-2.5 py-0.5 rounded-full uppercase">
                        {getActivityName(cls.activityId)}
                      </span>
                      <h3 className="font-bold text-base text-stone-850 mt-1.5">
                        Student: {getStudentName(cls.childId)}
                      </h3>
                      <p className="text-[10px] text-stone-405 font-bold mt-0.5">
                        Tutor: {getTeacherName(cls.teacherId)}
                      </p>
                    </div>
                    <span className={`text-[9px] font-extrabold px-2.5 py-0.5 rounded-full uppercase ${
                      cls.bookingStatus === 'pending' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-50 text-emerald-705'
                    }`}>
                      {cls.bookingStatus}
                    </span>
                  </div>

                  <div className="text-xs text-stone-500 bg-stone-50 p-3 rounded-xl border border-stone-150 space-y-1">
                    <p className="font-bold text-stone-700">Scheduled slot:</p>
                    <p>{new Date(cls.date).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</p>
                    <p>{cls.startTime} - {cls.endTime}</p>
                  </div>
                </div>

                {/* Operations Actions */}
                <div className="pt-2 flex items-center justify-end space-x-2">
                  {cls.bookingStatus === 'pending' && (
                    <>
                      <button
                        onClick={() => handleReject(cls.id)}
                        className="p-2 border border-stone-200 hover:bg-rose-50 text-stone-500 hover:text-rose-600 rounded-xl transition-all"
                        title="Decline request"
                      >
                        <X className="w-4.5 h-4.5" />
                      </button>
                      <button
                        onClick={() => handleApprove(cls.id)}
                        className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl transition-all shadow-sm flex items-center space-x-1.5"
                      >
                        <Check className="w-4 h-4" />
                        <span>Approve Class</span>
                      </button>
                    </>
                  )}
                  {cls.bookingStatus === 'approved' && (cls.status === 'upcoming' || cls.status === 'rescheduled') && (
                    <button
                      onClick={() => setSelectedClass(cls)}
                      className="px-4 py-2 border border-stone-200 hover:bg-stone-50 text-stone-705 text-xs font-bold rounded-xl transition-all flex items-center space-x-1.5"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Adjust / Reassign</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Adjust Reschedule Modal */}
      {selectedClass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/55 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-stone-100 animate-scaleUp">
            {successMsg ? (
              <div className="text-center py-8 space-y-3">
                <div className="w-16 h-16 bg-emerald-50 text-emerald-505 rounded-full flex items-center justify-center mx-auto text-3xl animate-bounce">
                  ✓
                </div>
                <h3 className="text-xl font-bold text-stone-800">Adjustments Saved!</h3>
                <p className="text-stone-505 text-xs">{successMsg}</p>
              </div>
            ) : (
              <form onSubmit={handleRescheduleSubmit} className="space-y-5 text-xs">
                <div>
                  <h3 className="text-xl font-bold text-stone-800">Adjust Class Parameters</h3>
                  <p className="text-stone-505 text-xs mt-1">Reschedule classes or reassign teachers for student {getStudentName(selectedClass.childId)}.</p>
                </div>

                <div>
                  <label className="block font-bold text-stone-750 uppercase tracking-wider mb-1">Reassign Teacher</label>
                  <select
                    value={newTeacherId}
                    onChange={(e) => setNewTeacherId(e.target.value)}
                    className="w-full px-3 py-2.5 border border-stone-250 rounded-xl bg-white focus:ring-teal-500 text-stone-850"
                  >
                    <option value="">Keep current tutor ({getTeacherName(selectedClass.teacherId)})</option>
                    {teachers
                      .filter(t => t.specialtyActivityIds.includes(selectedClass.activityId?._id || selectedClass.activityId) && t.userId !== (selectedClass.teacherId?._id || selectedClass.teacherId))
                      .map(t => (
                        <option key={t.userId} value={t.userId}>
                          {t.name}
                        </option>
                      ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-stone-750 uppercase tracking-wider mb-1">New Date</label>
                    <input
                      type="date"
                      value={newDate}
                      onChange={(e) => setNewDate(e.target.value)}
                      className="w-full px-3 py-2 border border-stone-250 rounded-xl text-stone-850 focus:ring-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-stone-750 uppercase tracking-wider mb-1">New Time</label>
                    <input
                      type="time"
                      value={newTime}
                      onChange={(e) => setNewTime(e.target.value)}
                      className="w-full px-3 py-2 border border-stone-250 rounded-xl text-stone-850 focus:ring-teal-500"
                    />
                  </div>
                </div>

                <div className="flex space-x-3 pt-2">
                  <button 
                    type="button"
                    onClick={() => setSelectedClass(null)}
                    className="flex-1 py-3 text-sm font-bold text-stone-650 bg-stone-105 hover:bg-stone-200 rounded-xl transition-colors"
                  >
                    Close
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-3 text-sm font-bold text-white bg-teal-650 hover:bg-teal-700 rounded-xl transition-colors shadow-md shadow-teal-500/15"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
