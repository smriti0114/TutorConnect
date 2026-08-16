import React, { useState, useEffect } from 'react';
import { useChild } from '../../context/ChildContext';
import { mockDb } from '../../services/mockDb';
import { Calendar, Clipboard, AlertCircle, Star } from 'lucide-react';

export const ParentClasses = () => {
  const { activeChild } = useChild();
  
  const [upcomingClasses, setUpcomingClasses] = useState([]);
  const [completedClasses, setCompletedClasses] = useState([]);
  const [activeTab, setActiveTab] = useState('upcoming');

  // Review states
  const [selectedReviewSession, setSelectedReviewSession] = useState(null);
  const [rating, setRating] = useState(5);
  const [feedbackText, setFeedbackText] = useState('');
  const [reviewSaved, setReviewSaved] = useState(false);

  useEffect(() => {
    if (activeChild) {
      const classes = mockDb.getClasses();
      const childSessions = classes.filter(c => c.childId === activeChild.id);
      
      const upcoming = childSessions
        .filter(c => c.status === 'upcoming' || c.status === 'rescheduled')
        .sort((a, b) => new Date(`${a.date}T${a.startTime}`).getTime() - new Date(`${b.date}T${b.startTime}`).getTime());

      const past = childSessions
        .filter(c => c.status === 'completed' || c.status === 'canceled')
        .sort((a, b) => new Date(`${b.date}T${a.startTime}`).getTime() - new Date(`${a.date}T${a.startTime}`).getTime());

      setUpcomingClasses(upcoming);
      setCompletedClasses(past);
    }
  }, [activeChild, reviewSaved]);

  const getActivityName = (id) => {
    const activities = mockDb.getActivities();
    return activities.find(a => a.id === id)?.name || 'Extracurricular';
  };

  const getTeacherName = (id) => {
    const users = mockDb.getUsers();
    return users.find(u => u.id === id)?.name || 'Tutor';
  };

  const handleFeedbackSubmit = () => {
    if (!selectedReviewSession) return;
    
    const classes = mockDb.getClasses();
    const updated = classes.map(c => 
      c.id === selectedReviewSession.id 
        ? { ...c, ratingByParent: rating, parentFeedback: feedbackText } 
        : c
    );
    mockDb.saveClasses(updated);

    mockDb.addNotification(
      selectedReviewSession.teacherId,
      'class',
      'New Student Feedback Received',
      `Parent of ${activeChild.name} left a ${rating}-star review for the class on ${selectedReviewSession.date}.`
    );

    setReviewSaved(true);
    setTimeout(() => {
      setSelectedReviewSession(null);
      setReviewSaved(false);
      setFeedbackText('');
      setRating(5);
    }, 1500);
  };

  if (!activeChild) {
    return (
      <div className="text-center py-16 bg-white rounded-3xl border border-brand-100 p-8">
        <AlertCircle className="w-12 h-12 text-brand-400 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-stone-800">No Active Child Profile</h2>
        <p className="text-stone-500 text-xs mt-2">Switch or create a child profile in settings.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Title */}
      <div>
        <h2 className="text-2xl font-bold text-stone-800">My Classes & History</h2>
        <p className="text-stone-500 text-xs mt-1">
          Monitor scheduled sessions, view instructor notes, and leave feedback.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-stone-200">
        <button
          onClick={() => setActiveTab('upcoming')}
          className={`pb-3 text-sm font-bold transition-all px-4 ${
            activeTab === 'upcoming'
              ? 'border-b-2 border-brand-500 text-brand-600'
              : 'text-stone-400 hover:text-stone-605'
          }`}
        >
          Upcoming Lessons ({upcomingClasses.length})
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`pb-3 text-sm font-bold transition-all px-4 ${
            activeTab === 'history'
              ? 'border-b-2 border-brand-500 text-brand-600'
              : 'text-stone-400 hover:text-stone-605'
          }`}
        >
          Lesson History ({completedClasses.length})
        </button>
      </div>

      {/* Content */}
      <div className="space-y-4">
        {activeTab === 'upcoming' ? (
          upcomingClasses.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-stone-150">
              <Calendar className="w-12 h-12 text-stone-300 mx-auto mb-3" />
              <p className="text-stone-505 text-sm font-semibold">No upcoming classes scheduled.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {upcomingClasses.map((cls) => (
                <div key={cls.id} className="bg-white rounded-3xl p-5 border border-brand-100 shadow-sm space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="inline-block bg-brand-50 text-brand-900 font-extrabold text-[10px] px-2.5 py-0.5 rounded-full uppercase">
                        {getActivityName(cls.activityId)}
                      </span>
                      <h3 className="text-lg font-bold text-stone-800 mt-2">
                        {getTeacherName(cls.teacherId)}
                      </h3>
                    </div>
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase ${
                      cls.bookingStatus === 'pending' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {cls.bookingStatus === 'pending' ? 'Pending Approval' : 'Confirmed'}
                    </span>
                  </div>

                  <div className="text-xs text-stone-505 space-y-1 bg-stone-50 p-3 rounded-2xl border border-stone-100">
                    <p className="font-bold text-stone-700">Schedule:</p>
                    <p>{new Date(cls.date).toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}</p>
                    <p>{cls.startTime} - {cls.endTime}</p>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          completedClasses.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-stone-150">
              <Clipboard className="w-12 h-12 text-stone-300 mx-auto mb-3" />
              <p className="text-stone-505 text-sm font-semibold">No past classes recorded.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {completedClasses.map((cls) => (
                <div key={cls.id} className="bg-white rounded-3xl p-6 border border-brand-100 shadow-sm space-y-4">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                    <div>
                      <span className="inline-block bg-stone-100 text-stone-800 font-bold text-[10px] px-2.5 py-0.5 rounded-full uppercase">
                        {getActivityName(cls.activityId)}
                      </span>
                      <h3 className="text-lg font-bold text-stone-800 mt-1">
                        Taught by {getTeacherName(cls.teacherId)}
                      </h3>
                      <p className="text-stone-400 text-xs mt-0.5">
                        {new Date(cls.date).toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase ${
                        cls.status === 'completed' ? 'bg-emerald-50 text-emerald-700' : 'bg-stone-105 text-stone-600'
                      }`}>
                        {cls.status}
                      </span>
                    </div>
                  </div>

                  {cls.teacherNotes && (
                    <div className="bg-brand-50/30 p-4 rounded-2xl border border-brand-100/50 text-xs">
                      <span className="font-bold text-brand-900 block mb-1">Tutor Feedback & Notes:</span>
                      <p className="text-stone-705 leading-relaxed italic">"{cls.teacherNotes}"</p>
                    </div>
                  )}

                  {cls.status === 'completed' && (
                    <div className="pt-2">
                      {cls.ratingByParent ? (
                        <div className="flex items-center space-x-2 bg-stone-50 p-3 rounded-xl border border-stone-100">
                          <span className="text-[10px] text-stone-505 font-semibold">Your Review:</span>
                          <div className="flex items-center space-x-0.5">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star key={star} className={`w-3.5 h-3.5 ${star <= (cls.ratingByParent || 5) ? 'text-amber-505 fill-amber-500' : 'text-stone-200'}`} />
                            ))}
                          </div>
                          {cls.parentFeedback && (
                            <span className="text-[11px] text-stone-600 truncate ml-2 italic">"{cls.parentFeedback}"</span>
                          )}
                        </div>
                      ) : (
                        <button
                          onClick={() => setSelectedReviewSession(cls)}
                          className="text-xs font-bold text-brand-600 hover:text-brand-700 hover:underline"
                        >
                          + Leave Tutor Rating & Feedback
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )
        )}
      </div>

      {/* Review Modal */}
      {selectedReviewSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/55 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-stone-100 animate-scaleUp">
            {reviewSaved ? (
              <div className="text-center py-8 space-y-3">
                <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto text-3xl animate-bounce">
                  ✓
                </div>
                <h3 className="text-xl font-bold text-stone-800">Feedback Submitted!</h3>
                <p className="text-stone-505 text-xs">Thank you for helping us improve our tutors.</p>
              </div>
            ) : (
              <div className="space-y-5">
                <div>
                  <h3 className="text-xl font-bold text-stone-800 font-display">Rate Your Experience</h3>
                  <p className="text-stone-505 text-xs mt-1">Provide feedback on the lesson with {getTeacherName(selectedReviewSession.teacherId)}.</p>
                </div>

                <div className="space-y-1.5 text-xs">
                  <label className="font-bold text-stone-700 block text-center">Score</label>
                  <div className="flex justify-center space-x-1.5 py-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="p-1 text-stone-300 hover:scale-110 transition-transform"
                      >
                        <Star className={`w-8 h-8 ${star <= rating ? 'text-amber-505 fill-amber-500' : 'text-stone-200'}`} />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5 text-xs">
                  <label className="font-bold text-stone-700 block">Comments or Notes</label>
                  <textarea
                    rows={3}
                    placeholder="Share what went well or what we can work on..."
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    className="w-full px-4 py-2.5 border border-stone-200 rounded-xl text-sm focus:ring-brand-500 focus:border-brand-500 text-stone-850"
                  />
                </div>

                <div className="flex space-x-3 pt-2">
                  <button 
                    onClick={() => setSelectedReviewSession(null)}
                    className="flex-1 py-3 text-sm font-bold text-stone-650 bg-stone-105 hover:bg-stone-200 rounded-xl transition-colors"
                  >
                    Close
                  </button>
                  <button 
                    onClick={handleFeedbackSubmit}
                    className="flex-1 py-3 text-sm font-bold text-white bg-brand-500 hover:bg-brand-600 rounded-xl transition-colors shadow-md shadow-brand-500/15"
                  >
                    Submit Review
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
