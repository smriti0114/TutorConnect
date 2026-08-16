import React, { useState, useEffect } from 'react';
import { useChild } from '../../context/ChildContext';
import { mockDb } from '../../services/mockDb';
import { BookOpen, Clock, FileText, AlertCircle } from 'lucide-react';

export const ParentHomework = () => {
  const { activeChild } = useChild();

  const [homeworkList, setHomeworkList] = useState([]);
  const [activeTab, setActiveTab] = useState('pending');

  // Homework submit Modal state
  const [selectedHw, setSelectedHw] = useState(null);
  const [notes, setNotes] = useState('');
  const [fileName, setFileName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    if (activeChild) {
      const allHomework = mockDb.getHomework();
      const childHw = allHomework.filter(h => h.childId === activeChild.id);
      setHomeworkList(childHw);
    }
  }, [activeChild, submitSuccess]);

  const getActivityName = (id) => {
    const activities = mockDb.getActivities();
    return activities.find(a => a.id === id)?.name || 'Extracurricular';
  };

  const getTeacherName = (id) => {
    const users = mockDb.getUsers();
    return users.find(u => u.id === id)?.name || 'Tutor';
  };

  const handleSubmit = () => {
    if (!selectedHw) return;
    setIsSubmitting(true);
    setTimeout(() => {
      mockDb.submitHomework(selectedHw.id, notes, fileName || 'uploaded_work.pdf');
      setIsSubmitting(false);
      setSubmitSuccess(true);
      setTimeout(() => {
        setSelectedHw(null);
        setSubmitSuccess(false);
        setNotes('');
        setFileName('');
      }, 1500);
    }, 1200);
  };

  const filteredHw = homeworkList.filter(h => 
    activeTab === 'pending' ? h.status === 'pending' : h.status === 'done'
  );

  if (!activeChild) {
    return (
      <div className="text-center py-16 bg-white rounded-3xl border border-brand-100 p-8">
        <AlertCircle className="w-12 h-12 text-brand-400 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-stone-800">No Active Child Profile</h2>
        <p className="text-stone-500 text-xs mt-2">Create child profiles in user settings.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Title */}
      <div>
        <h2 className="text-2xl font-bold text-stone-800">Homework & Practice Goals</h2>
        <p className="text-stone-500 text-xs mt-1">Review lesson tasks assigned by teachers to practice at home.</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-stone-200">
        <button
          onClick={() => setActiveTab('pending')}
          className={`pb-3 text-sm font-bold transition-all px-4 ${
            activeTab === 'pending'
              ? 'border-b-2 border-brand-500 text-brand-600'
              : 'text-stone-400 hover:text-stone-605'
          }`}
        >
          To Practice ({homeworkList.filter(h => h.status === 'pending').length})
        </button>
        <button
          onClick={() => setActiveTab('completed')}
          className={`pb-3 text-sm font-bold transition-all px-4 ${
            activeTab === 'completed'
              ? 'border-b-2 border-brand-500 text-brand-600'
              : 'text-stone-400 hover:text-stone-655'
          }`}
        >
          Completed Practice ({homeworkList.filter(h => h.status === 'done').length})
        </button>
      </div>

      {/* Homework List */}
      <div className="space-y-4">
        {filteredHw.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-stone-150">
            <BookOpen className="w-12 h-12 text-stone-300 mx-auto mb-3" />
            <p className="text-stone-505 text-sm font-semibold">No assignments found in this section.</p>
          </div>
        ) : (
          filteredHw.map((hw) => (
            <div key={hw.id} className="bg-white rounded-3xl p-6 border border-brand-100 shadow-sm space-y-4 flex flex-col justify-between md:flex-row md:items-center md:space-y-0 md:space-x-6 animate-fadeIn">
              <div className="space-y-2 flex-1">
                <div className="flex flex-wrap gap-2 items-center">
                  <span className="inline-block bg-brand-50 text-brand-900 font-extrabold text-[10px] px-2.5 py-0.5 rounded-full uppercase">
                    {getActivityName(hw.activityId || '')}
                  </span>
                  <span className="text-[10px] text-stone-400 font-bold flex items-center">
                    <Clock className="w-3 h-3 mr-1" />
                    Due {new Date(hw.dueDate).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-stone-850 leading-relaxed">
                  {hw.description}
                </h3>
                <p className="text-[10px] text-stone-405">Assigned by {getTeacherName(hw.teacherId)}</p>

                {hw.status === 'done' && (
                  <div className="bg-stone-50 p-3 rounded-2xl border border-stone-100 text-xs text-stone-600 space-y-1 mt-2">
                    <p className="font-bold text-stone-700">Practice Submission notes:</p>
                    <p className="italic">"{hw.submissionNotes || 'Completed without comments.'}"</p>
                    {hw.attachmentName && (
                      <p className="text-[10px] text-brand-600 flex items-center font-semibold mt-1">
                        <FileText className="w-3 h-3 mr-1" />
                        Attachment: {hw.attachmentName}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {hw.status === 'pending' && (
                <button
                  onClick={() => setSelectedHw(hw)}
                  className="bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all self-start md:self-center shadow-md shadow-brand-500/10"
                >
                  Mark Complete
                </button>
              )}
            </div>
          ))
        )}
      </div>

      {/* Homework submission Modal */}
      {selectedHw && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/55 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-stone-100 animate-scaleUp">
            {submitSuccess ? (
              <div className="text-center py-8 space-y-3">
                <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto text-3xl animate-bounce">
                  ✓
                </div>
                <h3 className="text-xl font-bold text-stone-800">Homework Submitted!</h3>
                <p className="text-stone-505 text-xs">Instructor has been notified.</p>
              </div>
            ) : (
              <div className="space-y-5">
                <div>
                  <h3 className="text-xl font-bold text-stone-800">Submit Homework</h3>
                  <p className="text-stone-505 text-xs mt-1">Share text feedback or link static work details.</p>
                </div>

                <div className="bg-stone-55 p-4 rounded-2xl border border-stone-100 text-xs space-y-1">
                  <span className="text-[10px] text-stone-400 uppercase font-bold tracking-wider">Assignment details</span>
                  <p className="text-stone-850 font-semibold leading-relaxed">{selectedHw.description}</p>
                </div>

                <div className="space-y-1.5 text-xs">
                  <label className="font-bold text-stone-700 block">Comments for Tutor</label>
                  <textarea
                    rows={3}
                    placeholder="Describe how practice went (e.g. Leo mastered the tempo, struggled with the minor scale transition)..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-4 py-2.5 border border-stone-200 rounded-xl text-sm focus:ring-brand-500 focus:border-brand-500 text-stone-850"
                  />
                </div>

                <div className="space-y-1.5 text-xs">
                  <label className="font-bold text-stone-700 block">Mock File Name (e.g. video.mp4, sheet_music.pdf)</label>
                  <input
                    type="text"
                    placeholder="practice_notes.jpg"
                    value={fileName}
                    onChange={(e) => setFileName(e.target.value)}
                    className="w-full px-4 py-2.5 border border-stone-200 rounded-xl text-sm focus:ring-brand-500 focus:border-brand-500 text-stone-850"
                  />
                </div>

                <div className="flex space-x-3 pt-2">
                  <button 
                    onClick={() => setSelectedHw(null)}
                    className="flex-1 py-3 text-sm font-bold text-stone-650 bg-stone-105 hover:bg-stone-200 rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="flex-1 py-3 text-sm font-bold text-white bg-brand-500 hover:bg-brand-600 rounded-xl transition-colors shadow-md shadow-brand-500/15 disabled:opacity-50 flex items-center justify-center"
                  >
                    {isSubmitting ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      'Mark as Complete'
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
