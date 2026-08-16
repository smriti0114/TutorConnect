import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { mockDb } from '../../services/mockDb';
import { Users, Search, ChevronRight, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';

export const TeacherStudents = () => {
  const { currentUser } = useAuth();
  
  const [students, setStudents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (currentUser) {
      const classes = mockDb.getClasses();
      const myClasses = classes.filter(c => c.teacherId === currentUser.id);
      
      const uniqueChildIds = Array.from(new Set(myClasses.map(c => c.childId)));
      const children = mockDb.getChildren();
      
      const myStudents = children.filter(c => uniqueChildIds.includes(c.id) && c.active);
      setStudents(myStudents);
    }
  }, [currentUser]);

  const getStudentActivities = (childId) => {
    const enrollments = mockDb.getEnrollments();
    const myEnroll = enrollments.filter(e => e.childId === childId && e.teacherId === currentUser?.id);
    const activities = mockDb.getActivities();
    
    return myEnroll.map(e => {
      const act = activities.find(a => a.id === e.activityId);
      return act ? act.name : '';
    }).filter(name => name !== '').join(', ');
  };

  const getNextClassString = (childId) => {
    const classes = mockDb.getClasses();
    const upcoming = classes
      .filter(c => c.childId === childId && c.teacherId === currentUser?.id && c.status === 'upcoming' && c.bookingStatus === 'approved')
      .sort((a, b) => new Date(`${a.date}T${a.startTime}`).getTime() - new Date(`${b.date}T${b.startTime}`).getTime());

    if (upcoming.length > 0) {
      const cls = upcoming[0];
      return `${new Date(cls.date).toLocaleDateString([], { month: 'short', day: 'numeric' })} at ${cls.startTime}`;
    }
    return 'No upcoming class scheduled';
  };

  const getLatestNotesPreview = (childId) => {
    const classes = mockDb.getClasses();
    const completed = classes
      .filter(c => c.childId === childId && c.teacherId === currentUser?.id && c.status === 'completed' && c.teacherNotes)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    if (completed.length > 0) {
      return completed[0].teacherNotes;
    }
    return 'No previous session notes logged.';
  };

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-stone-850">My Students</h2>
          <p className="text-stone-500 text-xs mt-1">Review active student enrollments, notes, and individual practice indicators.</p>
        </div>

        {/* Search */}
        <div className="relative max-w-xs w-full self-start">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-stone-400">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="Search students..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-stone-250 rounded-xl text-xs bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-stone-850"
          />
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredStudents.map((child) => (
          <div key={child.id} className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xs flex items-start justify-between hover:shadow-md transition-shadow animate-fadeIn">
            <div className="flex items-start space-x-4 flex-1 min-w-0">
              <img 
                src={child.avatar} 
                alt={child.name} 
                className="w-14 h-14 rounded-2xl object-cover ring-4 ring-indigo-50" 
              />
              <div className="space-y-1.5 flex-1 min-w-0">
                <h3 className="text-base font-bold text-stone-850 truncate">{child.name}</h3>
                
                <div className="flex flex-wrap gap-1.5 pt-0.5">
                  <span className="bg-indigo-50 text-indigo-900 font-bold text-[9px] px-2 py-0.5 rounded-full uppercase">
                    Age {child.age}
                  </span>
                  <span className="bg-stone-55 border border-stone-150 text-stone-600 font-semibold text-[9px] px-2 py-0.5 rounded-full uppercase truncate max-w-[150px]" title={getStudentActivities(child.id)}>
                    {getStudentActivities(child.id) || 'Enrolled'}
                  </span>
                </div>
                
                <p className="text-[10px] text-stone-400 mt-2 font-medium">
                  Next Class: <span className="text-stone-605 font-bold">{getNextClassString(child.id)}</span>
                </p>
                <p className="text-[10px] text-stone-400 mt-1 italic truncate max-w-[220px]" title={getLatestNotesPreview(child.id)}>
                  Latest Notes: <span className="text-stone-500 font-medium">"{getLatestNotesPreview(child.id)}"</span>
                </p>
              </div>
            </div>

            <Link 
              to={`/teacher/students/${child.id}`}
              className="p-2 bg-stone-50 hover:bg-indigo-50 rounded-xl border border-stone-150 hover:border-indigo-200 text-stone-505 hover:text-indigo-600 transition-colors ml-4 self-center"
              title="View student profile detail"
            >
              <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
        ))}

        {filteredStudents.length === 0 && (
          <div className="col-span-2 text-center py-16 bg-white rounded-3xl border border-stone-200 p-8 animate-fadeIn">
            <Users className="w-12 h-12 text-stone-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-stone-800">No Students Found</h3>
            <p className="text-stone-400 text-xs mt-1">Try refining your search query.</p>
          </div>
        )}
      </div>
    </div>
  );
};
