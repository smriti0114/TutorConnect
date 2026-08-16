import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { mockDb } from '../../services/mockDb';
import { Clock, Users, DollarSign, CheckCircle2, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const TeacherDashboard = () => {
  const { currentUser } = useAuth();
  
  const [todayClasses, setTodayClasses] = useState([]);
  const [nextClass, setNextClass] = useState(null);
  const [pendingRequests, setPendingRequests] = useState([]);
  
  // Stats
  const [monthlyEarnings, setMonthlyEarnings] = useState(0);
  const [totalStudents, setTotalStudents] = useState(0);
  const [classesTaughtThisMonth, setClassesTaughtThisMonth] = useState(0);

  // Attendance log state
  const [selectedClass, setSelectedClass] = useState(null);
  const [attendanceStatus, setAttendanceStatus] = useState('completed');
  const [feedbackNotes, setFeedbackNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    if (currentUser) {
      const classes = mockDb.getClasses();
      const myClasses = classes.filter(c => c.teacherId === currentUser.id);

      const todayStr = new Date().toISOString().split('T')[0];
      const todaySessions = myClasses.filter(c => c.date === todayStr && c.bookingStatus === 'approved');
      setTodayClasses(todaySessions);

      const upcoming = myClasses
        .filter(c => c.status === 'upcoming' && c.bookingStatus === 'approved')
        .sort((a, b) => new Date(`${a.date}T${a.startTime}`).getTime() - new Date(`${b.date}T${b.startTime}`).getTime());
      setNextClass(upcoming[0] || null);

      const pending = myClasses.filter(c => c.bookingStatus === 'pending');
      setPendingRequests(pending);

      const completedThisMonth = myClasses.filter(c => {
        if (c.status !== 'completed') return false;
        const classDate = new Date(c.date);
        const now = new Date();
        return classDate.getMonth() === now.getMonth() && classDate.getFullYear() === now.getFullYear();
      });
      setClassesTaughtThisMonth(completedThisMonth.length);

      const activities = mockDb.getActivities();
      let earnings = 0;
      completedThisMonth.forEach(c => {
        const act = activities.find(a => a.id === c.activityId);
        earnings += act ? act.pricePerClass : 40;
      });
      setMonthlyEarnings(earnings);

      const uniqueChildIds = new Set(myClasses.map(c => c.childId));
      setTotalStudents(uniqueChildIds.size);
    }
  }, [currentUser, submitSuccess]);

  const handleLogAttendance = () => {
    if (!selectedClass) return;
    setIsSubmitting(true);
    setTimeout(() => {
      const statusValue = attendanceStatus === 'absent' ? 'completed' : attendanceStatus;
      const notesValue = attendanceStatus === 'absent' ? `[STUDENT ABSENT] ${feedbackNotes}` : feedbackNotes;
      mockDb.logClassAttendance(selectedClass.id, statusValue, notesValue);
      setIsSubmitting(false);
      setSubmitSuccess(true);
      setTimeout(() => {
        setSelectedClass(null);
        setSubmitSuccess(false);
        setFeedbackNotes('');
      }, 1500);
    }, 1200);
  };



  const getStudentName = (id) => {
    const children = mockDb.getChildren();
    return children.find(c => c.id === id)?.name || 'Student';
  };

  const getStudentAge = (id) => {
    const children = mockDb.getChildren();
    return children.find(c => c.id === id)?.age || 8;
  };

  const getActivityName = (id) => {
    const activities = mockDb.getActivities();
    return activities.find(a => a.id === id)?.name || 'Extracurricular';
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-stone-250 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-stone-400 font-bold text-xs uppercase tracking-wider block">Assigned Students</span>
            <span className="text-2xl font-extrabold text-stone-800">{totalStudents}</span>
          </div>
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-stone-250 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-stone-400 font-bold text-xs uppercase tracking-wider block">Lessons Taught (Month)</span>
            <span className="text-2xl font-extrabold text-stone-800">{classesTaughtThisMonth}</span>
          </div>
          <div className="p-3 bg-teal-50 text-teal-600 rounded-2xl">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-stone-255 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-stone-400 font-bold text-xs uppercase tracking-wider block">Est. Earnings (Month)</span>
            <span className="text-2xl font-extrabold text-stone-800">${monthlyEarnings}</span>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main dashboard body */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Next class card (left 2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Incoming Requests Section */}
          {pendingRequests.length > 0 && (
            <div className="bg-white p-6 rounded-3xl border border-stone-250 shadow-xs space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <h3 className="text-base font-bold text-stone-850 font-display flex items-center">
                  <span className="w-2.5 h-2.5 bg-amber-500 rounded-full mr-2.5 animate-pulse"></span>
                  Incoming Class Requests
                </h3>
                <span className="bg-amber-50 text-amber-805 font-bold text-[10px] px-2.5 py-0.5 rounded-full uppercase">
                  {pendingRequests.length} pending
                </span>
              </div>
              <div className="space-y-4">
                {pendingRequests.map(req => (
                  <div key={req.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 border border-stone-150 rounded-2xl gap-4 hover:shadow-xs transition-shadow animate-fadeIn">
                    <div className="flex items-start space-x-3.5">
                      <div className="w-10 h-10 bg-indigo-50 text-indigo-650 rounded-xl flex items-center justify-center font-bold text-lg">
                        ★
                      </div>
                      <div>
                        <span className="bg-indigo-50 text-indigo-900 font-bold text-[9px] px-2 py-0.5 rounded-full uppercase">
                          {getActivityName(req.activityId)}
                        </span>
                        <h4 className="text-sm font-bold text-stone-850 mt-1">
                          {getStudentName(req.childId)} (Age {getStudentAge(req.childId)})
                        </h4>
                        <p className="text-stone-500 text-[11px] mt-0.5 flex items-center">
                          <Clock className="w-3.5 h-3.5 mr-1 text-stone-400" />
                          {new Date(req.date).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })} at {req.startTime}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center self-end sm:self-center">
                      <span className="bg-amber-50 text-amber-800 border border-amber-250 font-extrabold text-[10px] px-3 py-1.5 rounded-xl uppercase tracking-wider shadow-xs animate-pulse">
                        Pending Admin Approval
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-6 animate-fadeIn">
            <div className="flex justify-between items-center pb-4 border-b border-stone-100">
              <h3 className="text-base font-bold text-stone-800 font-display">Next Upcoming Lesson</h3>
              <Link to="/teacher/calendar" className="text-xs font-bold text-indigo-600 hover:text-indigo-700">
                Full Schedule →
              </Link>
            </div>

            {nextClass ? (
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center font-bold text-2xl animate-pulse">
                    ★
                  </div>
                  <div>
                    <span className="inline-block bg-indigo-50 text-indigo-900 font-bold text-[10px] px-2.5 py-0.5 rounded-full uppercase">
                      {getActivityName(nextClass.activityId)}
                    </span>
                    <h4 className="text-lg font-bold text-stone-850 mt-1">
                      {getStudentName(nextClass.childId)} (Age {getStudentAge(nextClass.childId)})
                    </h4>
                    <p className="text-stone-500 text-xs mt-0.5 flex items-center">
                      <Clock className="w-3.5 h-3.5 mr-1" />
                      {new Date(nextClass.date).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })} at {nextClass.startTime}
                    </p>
                  </div>
                </div>
                
                <button
                  onClick={() => setSelectedClass(nextClass)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all self-start sm:self-center shadow-md shadow-indigo-600/10"
                >
                  Log Attendance & Notes
                </button>
              </div>
            ) : (
              <p className="text-stone-400 text-xs py-6 text-center">No upcoming lessons scheduled.</p>
            )}
          </div>

          {/* Today's list */}
          <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-stone-800 mb-2 font-display">Today's Lessons ({todayClasses.length})</h3>
            <div className="space-y-2.5">
              {todayClasses.map(cls => (
                <div key={cls.id} className="flex justify-between items-center p-4 border border-stone-100 rounded-2xl hover:bg-stone-50/50 transition-colors animate-fadeIn">
                  <div className="flex items-center space-x-3">
                    <span className="text-xs font-bold text-stone-700 bg-stone-100 px-2.5 py-1 rounded-xl">
                      {cls.startTime}
                    </span>
                    <div>
                      <p className="font-bold text-sm text-stone-850">{getStudentName(cls.childId)}</p>
                      <p className="text-[10px] text-stone-400">{getActivityName(cls.activityId)} Lesson</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setSelectedClass(cls)}
                    className="text-xs font-bold text-indigo-600 hover:underline"
                  >
                    Log Class
                  </button>
                </div>
              ))}
              {todayClasses.length === 0 && (
                <p className="text-stone-400 text-xs py-6 text-center">No classes scheduled for today.</p>
              )}
            </div>
          </div>
        </div>

        {/* Assigned Students panel (right 1 col) */}
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs flex flex-col">
          <h3 className="text-base font-bold text-stone-800 mb-4 pb-2 border-b border-stone-100 font-display">Assigned Students</h3>
          <div className="flex-1 space-y-4">
            {mockDb.getChildren().slice(0, 4).map(child => (
              <div key={child.id} className="flex items-center justify-between text-xs animate-fadeIn">
                <div className="flex items-center space-x-2.5">
                  <img src={child.avatar} alt={child.name} className="w-8 h-8 rounded-full object-cover" />
                  <div>
                    <p className="font-bold text-stone-800">{child.name}</p>
                    <p className="text-[10px] text-stone-400">Age {child.age}</p>
                  </div>
                </div>
                <Link to={`/teacher/students/${child.id}`} className="text-stone-400 hover:text-indigo-600">
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Attendance log modal */}
      {selectedClass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/55 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-stone-100 animate-scaleUp">
            {submitSuccess ? (
              <div className="text-center py-8 space-y-3">
                <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto text-3xl animate-bounce">
                  ✓
                </div>
                <h3 className="text-xl font-bold text-stone-800">Class Session Logged!</h3>
                <p className="text-stone-505 text-xs">Attendance status and review notes have been saved.</p>
              </div>
            ) : (
              <div className="space-y-5">
                <div>
                  <h3 className="text-xl font-bold text-stone-800 font-display">Log Class Session</h3>
                  <p className="text-stone-505 text-xs mt-1">Submit attendance and practice feedback for {getStudentName(selectedClass.childId)}.</p>
                </div>

                <div className="space-y-1.5 text-xs">
                  <label className="font-bold text-stone-700 block">Class Attendance Status</label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setAttendanceStatus('completed')}
                      className={`p-2.5 rounded-xl border font-bold text-center ${attendanceStatus === 'completed' ? 'border-indigo-600 bg-indigo-50 text-indigo-900' : 'border-stone-200 bg-white text-stone-605'}`}
                    >
                      Completed
                    </button>
                    <button
                      type="button"
                      onClick={() => setAttendanceStatus('absent')}
                      className={`p-2.5 rounded-xl border font-bold text-center ${attendanceStatus === 'absent' ? 'border-indigo-600 bg-indigo-50 text-indigo-900' : 'border-stone-200 bg-white text-stone-605'}`}
                    >
                      Student Absent
                    </button>
                    <button
                      type="button"
                      onClick={() => setAttendanceStatus('canceled')}
                      className={`p-2.5 rounded-xl border font-bold text-center ${attendanceStatus === 'canceled' ? 'border-indigo-600 bg-indigo-50 text-indigo-900' : 'border-stone-200 bg-white text-stone-655'}`}
                    >
                      Canceled
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs">
                  <label className="font-bold text-stone-700 block">Lesson Progress & Feedback Notes</label>
                  <textarea
                    rows={4}
                    placeholder="Describe what the student practiced today, chord structures learned, or home-practice goals for the parent..."
                    value={feedbackNotes}
                    onChange={(e) => setFeedbackNotes(e.target.value)}
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
                    onClick={handleLogAttendance}
                    disabled={isSubmitting}
                    className="flex-1 py-3 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-md shadow-indigo-600/10 flex items-center justify-center"
                  >
                    {isSubmitting ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      'Save Session'
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
