import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { mockDb } from '../../services/mockDb';
import { CheckCircle2 } from 'lucide-react';

export const TeacherAttendance = () => {
  const { currentUser } = useAuth();
  
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  
  // Attendance log states
  const [status, setStatus] = useState('completed');
  const [notes, setNotes] = useState('');
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filters
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (currentUser) {
      const allClass = mockDb.getClasses();
      const myClasses = allClass.filter(c => c.teacherId === currentUser.id && c.bookingStatus === 'approved')
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setClasses(myClasses);
    }
  }, [currentUser, success]);

  const handleLog = () => {
    if (!selectedClass) return;
    setIsSubmitting(true);
    setTimeout(() => {
      const statusValue = status === 'absent' ? 'completed' : status;
      const notesValue = status === 'absent' ? `[STUDENT ABSENT] ${notes}` : notes;
      mockDb.logClassAttendance(selectedClass.id, statusValue, notesValue);
      setIsSubmitting(false);
      setSuccess(true);
      setTimeout(() => {
        setSelectedClass(null);
        setSuccess(false);
        setNotes('');
      }, 1500);
    }, 1200);
  };

  const getStudentName = (id) => {
    const children = mockDb.getChildren();
    return children.find(c => c.id === id)?.name || 'Student';
  };

  const getActivityName = (id) => {
    const activities = mockDb.getActivities();
    return activities.find(a => a.id === id)?.name || 'Extracurricular';
  };

  const filteredClasses = classes.filter(c => {
    if (filter === 'upcoming') return c.status === 'upcoming' || c.status === 'rescheduled';
    if (filter === 'completed') return c.status === 'completed';
    return true;
  });

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-stone-800">Attendance & Lesson Logs</h2>
          <p className="text-stone-550 text-xs mt-1">Audit scheduled sessions, log student attendance, and submit lesson summaries.</p>
        </div>

        {/* Filter Tabs */}
        <div className="flex bg-white border border-stone-200 p-1 rounded-xl shadow-xs self-start text-xs font-semibold text-stone-605">
          <button 
            onClick={() => setFilter('all')} 
            className={`px-3 py-1.5 rounded-lg transition-all ${filter === 'all' ? 'bg-indigo-600 text-white shadow-sm' : 'text-stone-500 hover:text-stone-850'}`}
          >
            All Logs
          </button>
          <button 
            onClick={() => setFilter('upcoming')} 
            className={`px-3 py-1.5 rounded-lg transition-all ${filter === 'upcoming' ? 'bg-indigo-600 text-white shadow-sm' : 'text-stone-500 hover:text-stone-850'}`}
          >
            Upcoming
          </button>
          <button 
            onClick={() => setFilter('completed')} 
            className={`px-3 py-1.5 rounded-lg transition-all ${filter === 'completed' ? 'bg-indigo-600 text-white shadow-sm' : 'text-stone-505 hover:text-stone-855'}`}
          >
            Completed
          </button>
        </div>
      </div>

      {/* Grid of classes */}
      <div className="space-y-4">
        {filteredClasses.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-stone-200">
            <CheckCircle2 className="w-12 h-12 text-stone-300 mx-auto mb-3" />
            <p className="text-stone-505 text-sm font-semibold">No lesson logs found in this category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredClasses.map((cls) => (
              <div key={cls.id} className="bg-white rounded-3xl p-5 border border-stone-200 shadow-xs space-y-4 flex flex-col justify-between animate-fadeIn">
                <div className="space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="inline-block bg-indigo-50 text-indigo-900 font-extrabold text-[9px] px-2.5 py-0.5 rounded-full uppercase">
                        {getActivityName(cls.activityId)}
                      </span>
                      <h3 className="font-bold text-base text-stone-855 mt-1.5">
                        {getStudentName(cls.childId)}
                      </h3>
                    </div>
                    <span className={`text-[9px] font-extrabold px-2.5 py-0.5 rounded-full uppercase ${
                      cls.status === 'completed' ? 'bg-emerald-50 text-emerald-700' :
                      cls.status === 'upcoming' ? 'bg-indigo-50 text-indigo-700' : 'bg-rose-50 text-rose-700'
                    }`}>
                      {cls.status}
                    </span>
                  </div>

                  <div className="text-stone-500 text-xs bg-stone-50 p-3 rounded-xl border border-stone-150 space-y-1">
                    <p className="font-bold text-stone-700">Class Details:</p>
                    <p>{new Date(cls.date).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</p>
                    <p>{cls.startTime} - {cls.endTime}</p>
                  </div>

                  {cls.teacherNotes && (
                    <div className="bg-stone-50 p-3 rounded-xl border border-stone-100 italic text-stone-605 text-xs">
                      <span className="font-bold text-stone-700 block mb-0.5 not-italic text-[10px]">Lesson notes:</span>
                      "{cls.teacherNotes}"
                    </div>
                  )}
                </div>

                {cls.status === 'upcoming' && (
                  <button
                    onClick={() => setSelectedClass(cls)}
                    className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-indigo-600/10"
                  >
                    Log Attendance & Progress
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Log Modal */}
      {selectedClass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/55 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-stone-100 animate-scaleUp">
            {success ? (
              <div className="text-center py-8 space-y-3">
                <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto text-3xl animate-bounce">
                  ✓
                </div>
                <h3 className="text-xl font-bold text-stone-850">Class Logged!</h3>
                <p className="text-stone-505 text-xs">Student details have been successfully synchronized.</p>
              </div>
            ) : (
              <div className="space-y-5">
                <div>
                  <h3 className="text-xl font-bold text-stone-800 font-display">Mark Class Complete</h3>
                  <p className="text-stone-505 text-xs mt-1">Log attendance and submit class notes for {getStudentName(selectedClass.childId)}.</p>
                </div>

                <div className="space-y-1.5 text-xs">
                  <label className="font-bold text-stone-700 block">Class Status</label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setStatus('completed')}
                      className={`p-2.5 rounded-xl border font-bold text-center ${status === 'completed' ? 'border-indigo-600 bg-indigo-50 text-indigo-900' : 'border-stone-200 bg-white text-stone-605'}`}
                    >
                      Completed
                    </button>
                    <button
                      type="button"
                      onClick={() => setStatus('absent')}
                      className={`p-2.5 rounded-xl border font-bold text-center ${status === 'absent' ? 'border-indigo-600 bg-indigo-50 text-indigo-900' : 'border-stone-200 bg-white text-stone-605'}`}
                    >
                      Student Absent
                    </button>
                    <button
                      type="button"
                      onClick={() => setStatus('canceled')}
                      className={`p-2.5 rounded-xl border font-bold text-center ${status === 'canceled' ? 'border-indigo-600 bg-indigo-50 text-indigo-900' : 'border-stone-250 bg-white text-stone-655'}`}
                    >
                      Canceled
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs">
                  <label className="font-bold text-stone-700 block">Teacher Progress Feedback Notes</label>
                  <textarea
                    rows={4}
                    placeholder="E.g. Played major chords, will focus on transition speed next time..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-4 py-2.5 border border-stone-200 rounded-xl text-sm focus:ring-indigo-500 focus:border-indigo-500 text-stone-850"
                  />
                </div>

                <div className="flex space-x-3 pt-2">
                  <button 
                    onClick={() => setSelectedClass(null)}
                    className="flex-1 py-3 text-sm font-bold text-stone-650 bg-stone-105 hover:bg-stone-200 rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleLog}
                    disabled={isSubmitting}
                    className="flex-1 py-3 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-md shadow-indigo-600/10 flex items-center justify-center"
                  >
                    {isSubmitting ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      'Log Class'
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
