import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { mockDb } from '../../services/mockDb';
import { BookOpen, Plus } from 'lucide-react';

export const TeacherHomework = () => {
  const { currentUser } = useAuth();

  const [homework, setHomework] = useState([]);
  const [students, setStudents] = useState([]);
  
  // Assign Homework Form states
  const [showForm, setShowForm] = useState(false);
  const [selectedChildId, setSelectedChildId] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (currentUser) {
      const allHw = mockDb.getHomework();
      const myHw = allHw.filter(h => h.teacherId === currentUser.id)
        .sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime());
      setHomework(myHw);

      const classes = mockDb.getClasses();
      const myStudentIds = Array.from(new Set(classes.filter(c => c.teacherId === currentUser.id).map(c => c.childId)));
      const children = mockDb.getChildren();
      const myStudents = children.filter(c => myStudentIds.includes(c.id) && c.active);
      setStudents(myStudents);
      if (myStudents.length > 0) {
        setSelectedChildId(myStudents[0].id);
      }
    }
  }, [currentUser, success]);

  const handleAssign = (e) => {
    e.preventDefault();
    if (!currentUser || !selectedChildId || !description || !dueDate) return;

    mockDb.assignHomework(
      currentUser.id,
      selectedChildId,
      `cls-custom-${Date.now()}`,
      description,
      dueDate
    );

    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      setShowForm(false);
      setDescription('');
      setDueDate('');
    }, 1500);
  };

  const getStudentName = (id) => {
    const children = mockDb.getChildren();
    return children.find(c => c.id === id)?.name || 'Student';
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Title */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-stone-800">Homework Assignments</h2>
          <p className="text-stone-505 text-xs mt-1">Review active homework practice guidelines and assign new work.</p>
        </div>
        {!showForm && students.length > 0 && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm px-4 py-2.5 rounded-xl transition-all shadow-md shadow-indigo-600/10"
          >
            <Plus className="w-4 h-4" />
            <span>Assign Homework</span>
          </button>
        )}
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xs max-w-lg animate-fadeIn">
          <h3 className="text-lg font-bold text-stone-850 mb-4">Assign New Homework</h3>
          <form onSubmit={handleAssign} className="space-y-4 text-xs">
            {success && (
              <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 text-emerald-800 font-bold text-center">
                Homework Assigned!
              </div>
            )}
            
            <div>
              <label className="block font-bold text-stone-750 uppercase tracking-wider mb-1.5">Select Student</label>
              <select
                value={selectedChildId}
                onChange={(e) => setSelectedChildId(e.target.value)}
                className="w-full px-3 py-2.5 border border-stone-250 rounded-xl bg-white focus:ring-indigo-500 focus:border-indigo-500 text-sm text-stone-850 font-semibold"
              >
                {students.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-stone-750 uppercase tracking-wider mb-1.5">Practice Guidelines</label>
              <textarea
                required
                rows={3}
                placeholder="Details of what the student needs to practice..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-2.5 border border-stone-200 rounded-xl text-sm focus:ring-indigo-500 focus:border-indigo-500 text-stone-850"
              />
            </div>

            <div>
              <label className="block font-bold text-stone-750 uppercase tracking-wider mb-1.5">Due Date</label>
              <input
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-4 py-2.5 border border-stone-250 rounded-xl text-sm focus:ring-indigo-500 text-stone-850"
              />
            </div>

            <div className="flex space-x-3 pt-2">
              <button
                type="button"
                onClick={() => { setShowForm(false); setDescription(''); setDueDate(''); }}
                className="flex-1 py-3 text-sm font-bold text-stone-650 bg-stone-105 hover:bg-stone-200 rounded-xl transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-3 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-md shadow-indigo-600/10"
              >
                Assign Work
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Homework logs list */}
      <div className="space-y-4">
        {homework.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-stone-200 p-8">
            <BookOpen className="w-12 h-12 text-stone-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-stone-800">No Homework Assigned</h3>
            <p className="text-stone-400 text-xs mt-1">Assignments you give to your students will appear here.</p>
          </div>
        ) : (
          homework.map((hw) => (
            <div key={hw.id} className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xs space-y-4 animate-fadeIn">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-base text-stone-850">
                    Student: {getStudentName(hw.childId)}
                  </h3>
                  <span className="text-[10px] text-stone-400 font-bold block mt-0.5">
                    Due {new Date(hw.dueDate).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
                <span className={`text-[9px] font-extrabold px-2.5 py-0.5 rounded-full uppercase ${
                  hw.status === 'done' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                }`}>
                  {hw.status === 'done' ? 'Completed' : 'Pending Review'}
                </span>
              </div>

              <div className="bg-stone-50 p-4 border border-stone-150 rounded-2xl text-xs space-y-1">
                <span className="text-[10px] text-stone-400 uppercase font-bold tracking-wider">Guidelines</span>
                <p className="text-stone-800 font-semibold leading-relaxed">{hw.description}</p>
              </div>

              {hw.submissionNotes && (
                <div className="bg-indigo-50/20 border border-indigo-100 rounded-2xl p-4 text-xs space-y-1 animate-fadeIn">
                  <span className="text-[10px] text-indigo-800 uppercase font-bold tracking-wider">Student Completion Comments</span>
                  <p className="text-stone-605 italic">"{hw.submissionNotes}"</p>
                  {hw.attachmentName && (
                    <p className="text-[10px] text-indigo-600 font-bold mt-1">
                      📄 Attachment: {hw.attachmentName}
                    </p>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
