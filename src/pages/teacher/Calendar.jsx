import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { mockDb } from '../../services/mockDb';
import { Clock, ChevronLeft, ChevronRight } from 'lucide-react';

export const TeacherCalendar = () => {
  const { currentUser } = useAuth();
  const [classes, setClasses] = useState([]);
  const [currentWeekOffset, setCurrentWeekOffset] = useState(0);

  useEffect(() => {
    if (currentUser) {
      const allClass = mockDb.getClasses();
      const myClasses = allClass.filter(
        c => c.teacherId === currentUser.id && c.bookingStatus === 'approved'
      );
      setClasses(myClasses);
    }
  }, [currentUser]);

  const getWeekDates = (offsetWeeks) => {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1) + (offsetWeeks * 7);
    const monday = new Date(today.setDate(diff));

    const week = [];
    for (let i = 0; i < 7; i++) {
      const nextDay = new Date(monday);
      nextDay.setDate(monday.getDate() + i);
      week.push(nextDay);
    }
    return week;
  };

  const weekDates = getWeekDates(currentWeekOffset);
  const startOfWeekStr = weekDates[0].toLocaleDateString([], { month: 'short', day: 'numeric' });
  const endOfWeekStr = weekDates[6].toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });

  const getClassesForDate = (dateStr) => {
    return classes
      .filter(c => c.date === dateStr)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  };

  const getStudentName = (id) => {
    const children = mockDb.getChildren();
    return children.find(c => c.id === id)?.name || 'Student';
  };

  const getActivityName = (id) => {
    const activities = mockDb.getActivities();
    return activities.find(a => a.id === id)?.name || 'Extracurricular';
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header controls */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-stone-800">Weekly Schedule</h2>
          <p className="text-stone-500 text-xs mt-1">Review lesson slots and student placements in weekly perspective grids.</p>
        </div>

        {/* Date navigators */}
        <div className="flex items-center space-x-3 bg-white p-2 rounded-2xl border border-stone-200 shadow-xs self-start">
          <button 
            onClick={() => setCurrentWeekOffset(prev => prev - 1)}
            className="p-1.5 rounded-xl hover:bg-stone-50 text-stone-600"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-xs font-bold text-stone-700 min-w-[180px] text-center">
            {startOfWeekStr} – {endOfWeekStr}
          </span>
          <button 
            onClick={() => setCurrentWeekOffset(prev => prev + 1)}
            className="p-1.5 rounded-xl hover:bg-stone-50 text-stone-600"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Week Calendar Grid */}
      <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
        {weekDates.map((day) => {
          const dateString = day.toISOString().split('T')[0];
          const daysClasses = getClassesForDate(dateString);
          const isToday = new Date().toISOString().split('T')[0] === dateString;

          return (
            <div 
              key={dateString} 
              className={`bg-white rounded-3xl border p-4 shadow-xs min-h-[350px] flex flex-col transition-all ${
                isToday ? 'border-indigo-500 ring-2 ring-indigo-500/10 scale-[1.02]' : 'border-stone-200'
              }`}
            >
              <div className="text-center pb-3 border-b border-stone-100 flex flex-col items-center">
                <span className="text-[10px] font-bold text-stone-404 uppercase tracking-wider">
                  {day.toLocaleDateString([], { weekday: 'short' })}
                </span>
                <span className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-sm mt-1 ${
                  isToday ? 'bg-indigo-600 text-white' : 'text-stone-800'
                }`}>
                  {day.getDate()}
                </span>
              </div>

              <div className="flex-1 space-y-2 mt-4">
                {daysClasses.map((cls) => (
                  <div 
                    key={cls.id} 
                    className={`p-3 rounded-2xl border text-xs text-left space-y-1.5 transition-all hover:shadow-xs animate-fadeIn ${
                      cls.status === 'completed' 
                        ? 'bg-emerald-50/30 border-emerald-100 text-emerald-800' 
                        : cls.status === 'canceled'
                        ? 'bg-stone-50 border-stone-150 text-stone-400 line-through'
                        : 'bg-indigo-50/20 border-indigo-100 text-indigo-905'
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold text-[10px]">
                      <span className="flex items-center">
                        <Clock className="w-3 h-3 mr-0.5" />
                        {cls.startTime}
                      </span>
                      <span className="uppercase text-[8px] bg-white/60 px-1.5 py-0.5 rounded-full">
                        {getActivityName(cls.activityId)}
                      </span>
                    </div>
                    <p className="font-bold text-xs truncate leading-tight">
                      {getStudentName(cls.childId)}
                    </p>
                    {cls.status === 'rescheduled' && (
                      <span className="text-[8px] font-bold uppercase tracking-wider text-indigo-600 block">Rescheduled</span>
                    )}
                  </div>
                ))}
                {daysClasses.length === 0 && (
                  <div className="h-full flex items-center justify-center py-12">
                    <p className="text-[10px] text-stone-400 italic">No Lessons</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
