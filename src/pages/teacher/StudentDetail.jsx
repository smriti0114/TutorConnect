import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { apiClient } from '../../api/apiClient';
import { 
  ChevronLeft, Plus, AlertCircle 
} from 'lucide-react';

export const TeacherStudentDetail = () => {
  const { studentId } = useParams();
  const { currentUser } = useAuth();

  const [student, setStudent] = useState(null);
  const [parent, setParent] = useState(null);
  const [studentClasses, setStudentClasses] = useState([]);
  const [studentHomework, setStudentHomework] = useState([]);
  const [isAuthorized, setIsAuthorized] = useState(true);

  // Assign Homework form state
  const [showHwForm, setShowHwForm] = useState(false);
  const [hwDescription, setHwDescription] = useState('');
  const [hwDueDate, setHwDueDate] = useState('');
  const [hwClassSessionId, setHwClassSessionId] = useState('');
  const [assignSuccess, setAssignSuccess] = useState(false);

  useEffect(() => {
    if (studentId && currentUser) {
      const fetchStudentDetails = async () => {
        try {
          // 1. Fetch child by ID (which includes populated parent details)
          const child = await apiClient.get(`/children/${studentId}`);
          if (child) {
            setStudent({ ...child, id: child._id });
            setParent(child.parentId || null);

            // 2. Fetch classes to check authorization & list sessions
            const bookings = await apiClient.get('/bookings');
            const childClasses = bookings
              .filter(c => c.childId && (c.childId._id === studentId || c.childId.id === studentId) && c.teacherId && (c.teacherId._id === currentUser.id || c.teacherId.id === currentUser.id))
              .map(c => ({ ...c, id: c._id }))
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

            // Authorization: teacher must be assigned to at least one class
            if (childClasses.length === 0) {
              setIsAuthorized(false);
              return;
            }

            setIsAuthorized(true);
            setStudentClasses(childClasses);

            // 3. Fetch homework
            const homework = await apiClient.get('/homework');
            const childHw = homework
              .filter(h => h.childId && (h.childId._id === studentId || h.childId.id === studentId) && h.teacherId && (h.teacherId._id === currentUser.id || h.teacherId.id === currentUser.id))
              .map(h => ({ ...h, id: h._id }))
              .sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime());
            setStudentHomework(childHw);
          } else {
            setIsAuthorized(false);
          }
        } catch (err) {
          console.error('Failed to fetch student details:', err);
          setIsAuthorized(false);
        }
      };
      fetchStudentDetails();
    }
  }, [studentId, currentUser, assignSuccess]);

  const handleAssignHw = async (e) => {
    e.preventDefault();
    if (!student || !currentUser || !hwDescription || !hwDueDate) return;

    try {
      await apiClient.post('/homework', {
        childId: student.id || student._id,
        description: hwDescription,
        dueDate: hwDueDate,
        classSessionId: hwClassSessionId || undefined,
      });

      setAssignSuccess(true);
      setTimeout(() => {
        setAssignSuccess(false);
        setShowHwForm(false);
        setHwDescription('');
        setHwDueDate('');
        setHwClassSessionId('');
      }, 1500);
    } catch (err) {
      alert(err.message || 'Failed to assign homework.');
    }
  };

  const getActivityName = (act) => {
    if (act && typeof act === 'object') return act.name;
    return 'Extracurricular';
  };

  if (!isAuthorized) {
    return (
      <div className="text-center py-16 bg-white rounded-3xl border border-stone-200 p-8 animate-fadeIn">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-stone-850">Unauthorized Access</h3>
        <p className="text-stone-500 text-xs mt-1">You are not registered as an extracurricular tutor for this child.</p>
        <Link to="/teacher/students" className="text-indigo-600 font-bold hover:underline mt-4 inline-block">
          Return to Student Directory
        </Link>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="text-center py-16 bg-white rounded-3xl border border-stone-200 p-8 animate-fadeIn">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-stone-850">Student Profile Not Found</h3>
        <Link to="/teacher/students" className="text-indigo-600 font-bold hover:underline mt-2 inline-block">
          Return to Student Directory
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Breadcrumb Nav */}
      <div className="flex items-center space-x-2">
        <Link to="/teacher/students" className="text-stone-400 hover:text-indigo-600 transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <span className="text-xs font-bold text-stone-404 font-display">Student Directory / {student.name}</span>
      </div>

      {/* Student Profile Card */}
      <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start space-x-4">
          <img src={student.avatar} alt={student.name} className="w-20 h-20 rounded-3xl object-cover ring-4 ring-indigo-50" />
          <div className="space-y-1.5">
            <h2 className="text-2xl font-bold text-stone-850">{student.name}</h2>
            <div className="flex space-x-2">
              <span className="bg-indigo-50 text-indigo-900 font-extrabold text-[10px] px-2.5 py-0.5 rounded-full uppercase">
                Age {student.age}
              </span>
            </div>
            {parent && (
              <p className="text-[10px] text-stone-505 font-semibold">
                Parent: <span className="text-stone-700 font-bold">{parent.name}</span> ({parent.phone})
              </p>
            )}
          </div>
        </div>

        {student.notes && (
          <div className="max-w-md bg-stone-50 p-4 border border-stone-150 rounded-2xl text-xs flex-1">
            <span className="font-bold text-stone-700 block mb-1">Tutor Tips & Profile Notes:</span>
            <p className="text-stone-605 leading-relaxed italic">"{student.notes}"</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Classes History */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-6">
            <div className="flex justify-between items-center pb-4 border-b border-stone-100">
              <h3 className="text-base font-bold text-stone-800 font-display">Lesson & Attendance Log ({studentClasses.length})</h3>
            </div>
            
            <div className="space-y-4">
              {studentClasses.map((cls) => (
                <div key={cls.id} className="p-4 border border-stone-100 rounded-2xl text-xs space-y-3 hover:bg-stone-50/30 transition-colors animate-fadeIn">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <span className="inline-block bg-indigo-50 text-indigo-900 font-extrabold text-[9px] px-2 py-0.5 rounded-full uppercase">
                        {getActivityName(cls.activityId)}
                      </span>
                      <span className="text-stone-400 font-bold text-[10px]">
                        {new Date(cls.date).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                    <span className={`font-bold px-2 py-0.5 rounded-full uppercase text-[9px] ${
                      cls.status === 'completed' ? 'bg-emerald-50 text-emerald-700' :
                      cls.status === 'upcoming' ? 'bg-indigo-50 text-indigo-700' : 'bg-rose-50 text-rose-700'
                    }`}>
                      {cls.status}
                    </span>
                  </div>

                  {cls.teacherNotes && (
                    <div className="bg-stone-50/50 p-3 rounded-xl border border-stone-100/50 italic text-stone-600">
                      "{cls.teacherNotes}"
                    </div>
                  )}

                  {cls.parentFeedback && (
                    <div className="bg-amber-50/30 border border-amber-100 rounded-xl p-3 flex items-center space-x-1.5 animate-fadeIn">
                      <span className="text-[9px] text-amber-700 font-bold uppercase">Parent Feedback:</span>
                      <span className="text-stone-605 italic">"{cls.parentFeedback}"</span>
                    </div>
                  )}
                </div>
              ))}

              {studentClasses.length === 0 && (
                <p className="text-stone-400 py-6 text-center text-xs">No lessons logged with this tutor.</p>
              )}
            </div>
          </div>
        </div>

        {/* Homework log & form */}
        <div className="space-y-6">
          
          {showHwForm ? (
            <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-4 animate-fadeIn">
              <div className="flex justify-between items-center pb-2 border-b border-stone-100">
                <h3 className="text-sm font-bold text-stone-800">Assign New Task</h3>
                <button onClick={() => setShowHwForm(false)} className="text-xs text-stone-400 hover:text-stone-600">
                  Cancel
                </button>
              </div>

              <form onSubmit={handleAssignHw} className="space-y-4 text-xs">
                {assignSuccess && (
                  <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-2.5 text-emerald-800 font-bold text-center">
                    Homework Assigned Successfully!
                  </div>
                )}
                
                <div>
                  <label className="block font-bold text-stone-750 uppercase tracking-wider mb-1">Goal Description</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Describe practice instructions (e.g. Practice G scale with metronome)..."
                    value={hwDescription}
                    onChange={(e) => setHwDescription(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-250 rounded-xl text-sm focus:ring-indigo-500 text-stone-850"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-755 uppercase tracking-wider mb-1">Due Date</label>
                  <input
                    type="date"
                    required
                    value={hwDueDate}
                    onChange={(e) => setHwDueDate(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-250 rounded-xl text-sm focus:ring-indigo-500 text-stone-850"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-750 uppercase tracking-wider mb-1">Associated Class Date</label>
                  <select
                    value={hwClassSessionId}
                    onChange={(e) => setHwClassSessionId(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-250 rounded-xl bg-white focus:ring-indigo-500 text-stone-850"
                  >
                    <option value="">Select class (Optional)</option>
                    {studentClasses.slice(0, 5).map(c => (
                      <option key={c.id} value={c.id}>
                        {c.date} - {getActivityName(c.activityId)}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-md shadow-indigo-600/10"
                >
                  Create Assignment
                </button>
              </form>
            </div>
          ) : (
            <button
              onClick={() => setShowHwForm(true)}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl flex items-center justify-center space-x-2 transition-all shadow-md shadow-indigo-600/10"
            >
              <Plus className="w-4 h-4" />
              <span>Assign New Homework</span>
            </button>
          )}

          {/* Homework list log */}
          <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-stone-500 uppercase tracking-wider pb-2 border-b border-stone-100 font-display">
              Practice Tasks ({studentHomework.length})
            </h3>
            
            <div className="space-y-4">
              {studentHomework.map((hw) => (
                <div key={hw.id} className="text-xs space-y-2 border-b border-stone-50 pb-3 last:border-b-0 last:pb-0 animate-fadeIn">
                  <div className="flex justify-between items-center">
                    <span className={`font-bold px-2 py-0.5 rounded-full uppercase text-[8px] ${
                      hw.status === 'done' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                    }`}>
                      {hw.status === 'done' ? 'Done' : 'Pending'}
                    </span>
                    <span className="text-stone-400 text-[10px]">
                      Due {new Date(hw.dueDate).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  <p className="text-stone-700 font-semibold leading-relaxed">
                    {hw.description}
                  </p>
                  
                  {hw.submissionNotes && (
                    <div className="bg-stone-50 p-2 border border-stone-100 rounded-lg text-[10px] text-stone-500">
                      <span className="font-bold text-stone-750 block mb-0.5">Student comments:</span>
                      "{hw.submissionNotes}"
                    </div>
                  )}
                </div>
              ))}

              {studentHomework.length === 0 && (
                <p className="text-stone-400 py-4 text-center text-xs">No assignments logged.</p>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
