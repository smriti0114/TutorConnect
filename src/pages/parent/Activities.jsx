import React, { useState, useEffect } from 'react';
import { useChild } from '../../context/ChildContext';
import { useAuth } from '../../context/AuthContext';
import { apiClient } from '../../api/apiClient';
import { Award, Clock, Star, Check } from 'lucide-react';

export const ParentActivities = () => {
  const { activeChild, childrenList } = useChild();
  const { currentUser } = useAuth();

  const [activities, setActivities] = useState([]);
  const [selectedActivity, setSelectedActivity] = useState(null);
  
  const [tutors, setTutors] = useState([]);
  const [selectedTutor, setSelectedTutor] = useState(null);

  // Booking states
  const [selectedDay, setSelectedDay] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [bookingChildId, setBookingChildId] = useState(activeChild?.id || '');
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingError, setBookingError] = useState(null);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const data = await apiClient.get('/activities');
        const formatted = data.map(a => ({
          id: a._id,
          name: a.name,
          description: a.description,
          pricePerClass: a.pricePerClass,
          active: a.active
        }));
        setActivities(formatted.filter(a => a.active));
        if (formatted.filter(a => a.active).length > 0) {
          setSelectedActivity(formatted.filter(a => a.active)[0]);
        }
      } catch (err) {
        console.error('Failed to load activities:', err);
      }
    };
    fetchActivities();
  }, []);

  useEffect(() => {
    const fetchTutors = async () => {
      if (selectedActivity) {
        try {
          const allTutors = await apiClient.get('/teachers');
          const filtered = allTutors
            .filter(t => 
              t.specialtyActivityIds.includes(selectedActivity.name.toLowerCase()) || 
              t.specialtyActivityIds.includes(selectedActivity.id)
            )
            .map(t => ({
              profile: t,
              user: {
                id: t.userId,
                name: t.name,
                email: t.email,
                phone: t.phone
              }
            }));
          setTutors(filtered);
          setSelectedTutor(filtered[0] || null);
          setSelectedDay('');
          setSelectedTime('');
        } catch (err) {
          console.error('Failed to load tutors:', err);
        }
      }
    };
    fetchTutors();
  }, [selectedActivity]);

  useEffect(() => {
    if (activeChild) {
      setBookingChildId(activeChild.id);
    }
  }, [activeChild]);

  const handleBooking = async () => {
    setBookingError(null);
    if (!selectedTutor || !selectedActivity || !selectedDay || !selectedTime || !bookingChildId) {
      setBookingError('Please complete all selection steps.');
      return;
    }

    try {
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const targetDayIndex = days.indexOf(selectedDay);
      const today = new Date();
      const currentDayIndex = today.getDay();
      
      let dayOffset = targetDayIndex - currentDayIndex;
      if (dayOffset <= 0) {
        dayOffset += 7;
      }
      
      const targetDate = new Date();
      targetDate.setDate(today.getDate() + dayOffset);
      const dateStr = targetDate.toISOString().split('T')[0];

      await apiClient.post('/bookings', {
        childId: bookingChildId,
        teacherId: selectedTutor.user.id,
        activityId: selectedActivity.id,
        date: dateStr,
        startTime: selectedTime,
      });

      setBookingSuccess(true);
      setTimeout(() => {
        setBookingSuccess(false);
        setSelectedDay('');
        setSelectedTime('');
      }, 3000);

    } catch (err) {
      setBookingError(err.message || 'Booking slot conflict.');
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Page Title */}
      <div>
        <h2 className="text-2xl font-bold text-stone-800">Browse Activities & Book Tutors</h2>
        <p className="text-stone-505 text-xs mt-1">
          Pick an extracurricular interest, review qualified instructors, and request your weekly time slot.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Subject List */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-stone-500 uppercase tracking-wider mb-2">Step 1: Choose Subject</h3>
          <div className="grid grid-cols-1 gap-2.5">
            {activities.map((act) => (
              <button
                key={act.id}
                onClick={() => setSelectedActivity(act)}
                className={`w-full flex items-center justify-between p-4 rounded-2xl border text-left transition-all duration-200 ${
                  selectedActivity?.id === act.id
                    ? 'border-brand-500 bg-brand-50 text-brand-900 shadow-md shadow-brand-500/5'
                    : 'border-stone-200 bg-white hover:bg-stone-50'
                }`}
              >
                <div className="flex items-center space-x-3.5">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-lg ${
                    selectedActivity?.id === act.id ? 'bg-brand-500 text-white' : 'bg-brand-50 text-brand-600'
                  }`}>
                    {act.id === 'act-guitar' ? '🎸' :
                     act.id === 'act-piano' ? '🎹' :
                     act.id === 'act-violin' ? '🎻' :
                     act.id === 'act-vocals' ? '🎤' :
                     act.id === 'act-dance' ? '💃' : '🎨'}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-stone-800">{act.name}</h4>
                    <p className="text-[10px] text-stone-400 mt-0.5 line-clamp-1">{act.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-extrabold text-stone-800 block">${act.pricePerClass}</span>
                  <span className="text-[9px] text-stone-400">per lesson</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Center & Right Column: Tutors & Scheduling */}
        <div className="lg:col-span-2 space-y-6">
          {selectedActivity && (
            <div className="bg-white rounded-3xl border border-brand-100 p-6 shadow-sm space-y-6">
              
              {/* Tutors grid */}
              <div>
                <h3 className="text-sm font-bold text-stone-500 uppercase tracking-wider mb-3">
                  Step 2: Choose Available Tutor
                </h3>
                {tutors.length === 0 ? (
                  <p className="text-stone-400 text-xs py-4 text-center">No tutors listed for this activity yet.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {tutors.map((t) => (
                      <button
                        key={t.profile.id}
                        onClick={() => setSelectedTutor(t)}
                        className={`flex items-center space-x-3 p-3 rounded-2xl border text-left transition-all ${
                          selectedTutor?.profile.id === t.profile.id
                            ? 'border-brand-500 bg-brand-50/50'
                            : 'border-stone-150 bg-white hover:bg-stone-50'
                        }`}
                      >
                        <img 
                          src={t.user.avatar} 
                          alt={t.user.name} 
                          className="w-11 h-11 rounded-xl object-cover ring-2 ring-stone-50" 
                        />
                        <div className="truncate">
                          <h4 className="font-bold text-sm text-stone-800 truncate">{t.user.name}</h4>
                          <p className="text-[10px] text-stone-500 truncate">{t.profile.experience}</p>
                          <div className="flex items-center space-x-1.5 mt-0.5">
                            <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                            <span className="text-[10px] font-bold text-stone-700">{t.profile.rating.toFixed(1)}</span>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Selected Tutor Bio */}
              {selectedTutor && (
                <div className="p-4 bg-stone-50 rounded-2xl border border-stone-100 text-xs">
                  <div className="flex items-center space-x-2 text-stone-805">
                    <Award className="w-4 h-4 text-brand-500" />
                    <span className="font-bold">About {selectedTutor.user.name}</span>
                  </div>
                  <p className="text-stone-605 mt-2 leading-relaxed">{selectedTutor.profile.bio}</p>
                </div>
              )}

              {/* Booking form */}
              {selectedTutor && (
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-stone-505 uppercase tracking-wider">
                    Step 3: Select Schedule & Child
                  </h3>
                  
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-stone-700 block">Available Days</label>
                    <div className="flex flex-wrap gap-2">
                      {selectedTutor.profile.availability.map((avail) => (
                        <button
                          key={avail.dayOfWeek}
                          type="button"
                          onClick={() => { setSelectedDay(avail.dayOfWeek); setSelectedTime(''); }}
                          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                            selectedDay === avail.dayOfWeek
                              ? 'bg-brand-500 text-white shadow-sm'
                              : 'bg-stone-50 border border-stone-200 text-stone-600 hover:bg-stone-100'
                          }`}
                        >
                          {avail.dayOfWeek}
                        </button>
                      ))}
                    </div>
                  </div>

                  {selectedDay && (
                    <div className="space-y-2 animate-fadeIn">
                      <label className="text-xs font-bold text-stone-700 block">Available Hours</label>
                      <div className="flex flex-wrap gap-2">
                        {selectedTutor.profile.availability
                          .find(a => a.dayOfWeek === selectedDay)
                          ?.timeSlots.map((slot) => (
                            <button
                              key={slot}
                              type="button"
                              onClick={() => setSelectedTime(slot)}
                              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                                selectedTime === slot
                                  ? 'bg-brand-500 text-white shadow-sm'
                                  : 'bg-stone-50 border border-stone-200 text-stone-600 hover:bg-stone-100'
                              }`}
                            >
                              <Clock className="w-3.5 h-3.5 inline mr-1" />
                              {slot}
                            </button>
                          ))}
                      </div>
                    </div>
                  )}

                  {selectedTime && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end pt-4 border-t border-stone-50 animate-fadeIn">
                      <div className="space-y-1.5 text-xs">
                        <label className="font-bold text-stone-700 block">Registering Child</label>
                        <select
                          value={bookingChildId}
                          onChange={(e) => setBookingChildId(e.target.value)}
                          className="w-full px-3 py-2.5 border border-stone-250 rounded-xl bg-white focus:ring-brand-500 focus:border-brand-500 text-sm text-stone-850 font-semibold"
                        >
                          {childrenList.map((ch) => (
                            <option key={ch.id} value={ch.id}>
                              {ch.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        {bookingSuccess ? (
                          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center text-emerald-800 text-xs font-bold">
                            <Check className="w-4 h-4 mr-2" />
                            <span>Booking Request Sent!</span>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={handleBooking}
                            className="w-full py-3 bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm rounded-xl transition-all shadow-md shadow-brand-500/15"
                          >
                            Submit Class Request
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {bookingError && (
                    <p className="text-xs text-rose-600 font-bold mt-2">⚠️ {bookingError}</p>
                  )}
                </div>
              )}

            </div>
          )}
        </div>

      </div>
    </div>
  );
};
