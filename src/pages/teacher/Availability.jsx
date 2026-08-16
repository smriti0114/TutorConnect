import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { apiClient } from '../../api/apiClient';
import { Clock, Plus, Trash2, CheckCircle } from 'lucide-react';

export const TeacherAvailability = () => {
  const { currentUser } = useAuth();
  
  const [profile, setProfile] = useState(null);
  const [bio, setBio] = useState('');
  const [experience, setExperience] = useState('');
  const [availability, setAvailability] = useState([]);
  
  // States for adding slots
  const [newDay, setNewDay] = useState('Monday');
  const [newTime, setNewTime] = useState('15:00');
  
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (currentUser) {
      const fetchProfile = async () => {
        try {
          const myProfile = await apiClient.get('/teachers/me');
          setProfile(myProfile);
          setBio(myProfile.bio || '');
          setExperience(myProfile.experience || '');
          setAvailability(myProfile.availability || []);
        } catch (err) {
          console.error('Failed to load teacher profile:', err);
        }
      };
      fetchProfile();
    }
  }, [currentUser]);

  const handleAddSlot = () => {
    if (!newDay || !newTime) return;

    // Check if slot already exists
    const dayAvail = availability.find(a => a.dayOfWeek === newDay);
    if (dayAvail) {
      if (dayAvail.timeSlots.includes(newTime)) {
        return; // already exists
      }
      const updated = availability.map(a => 
        a.dayOfWeek === newDay 
          ? { ...a, timeSlots: [...a.timeSlots, newTime].sort() } 
          : a
      );
      setAvailability(updated);
    } else {
      const newAvail = { dayOfWeek: newDay, timeSlots: [newTime] };
      setAvailability([...availability, newAvail]);
    }
  };

  const handleRemoveSlot = (day, slot) => {
    const updated = availability.map(a => {
      if (a.dayOfWeek === day) {
        return { ...a, timeSlots: a.timeSlots.filter(s => s !== slot) };
      }
      return a;
    }).filter(a => a.timeSlots.length > 0);
    setAvailability(updated);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!profile) return;

    try {
      await apiClient.put('/teachers/profile', {
        bio,
        experience,
        availability,
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (err) {
      alert(err.message || 'Failed to save profile.');
    }
  };

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const commonTimeSlots = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Title */}
      <div>
        <h2 className="text-2xl font-bold text-stone-850">Availability & Profile</h2>
        <p className="text-stone-500 text-xs mt-1">
          Customize your bio statement, teaching credentials, and weekly active tutoring slot calendars.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Profile Details (Left 2 cols) */}
        <form onSubmit={handleSave} className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-stone-800 font-display">Tutor Credentials</h3>
            
            {saveSuccess && (
              <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 text-emerald-805 font-bold flex items-center text-xs animate-bounce">
                <CheckCircle className="w-4 h-4 mr-2" />
                <span>Profile parameters updated successfully!</span>
              </div>
            )}

            <div className="space-y-1.5 text-xs">
              <label className="block font-bold text-stone-700 uppercase tracking-wider">Years of Experience / Tagline</label>
              <input
                type="text"
                required
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                placeholder="e.g. 8 years teaching classical violin"
                className="w-full px-4 py-2.5 border border-stone-250 rounded-xl text-sm focus:ring-indigo-500 text-stone-850"
              />
            </div>

            <div className="space-y-1.5 text-xs">
              <label className="block font-bold text-stone-700 uppercase tracking-wider">Biography Summary</label>
              <textarea
                rows={5}
                required
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Introduce yourself to parents, summarize your teaching curriculum, and mention musical/artistic philosophies..."
                className="w-full px-4 py-2.5 border border-stone-200 rounded-xl text-sm focus:ring-indigo-500 text-stone-850 leading-relaxed"
              />
            </div>

            <button
              type="submit"
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-705 text-white font-bold rounded-xl text-xs transition-all shadow-md shadow-indigo-500/10"
            >
              Save Profile Changes
            </button>
          </div>
        </form>

        {/* Schedule Slots (Right 1 col) */}
        <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-xs space-y-6">
          <div>
            <h3 className="text-base font-bold text-stone-800 font-display">Time Slot Builder</h3>
            <p className="text-stone-400 text-[10px] mt-0.5">Define slots where parents can book lessons.</p>
          </div>

          {/* Quick slot adder */}
          <div className="space-y-3.5 border-b border-stone-100 pb-5 text-xs">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="font-bold text-stone-700 block mb-1">Day</label>
                <select 
                  value={newDay} 
                  onChange={(e) => setNewDay(e.target.value)}
                  className="w-full p-2 border border-stone-250 rounded-xl bg-white text-stone-850 font-semibold"
                >
                  {daysOfWeek.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="font-bold text-stone-700 block mb-1">Time</label>
                <select 
                  value={newTime} 
                  onChange={(e) => setNewTime(e.target.value)}
                  className="w-full p-2 border border-stone-250 rounded-xl bg-white text-stone-850 font-semibold"
                >
                  {commonTimeSlots.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>
            <button
              type="button"
              onClick={handleAddSlot}
              className="w-full py-2.5 bg-stone-105 hover:bg-indigo-50 hover:text-indigo-900 text-stone-700 font-bold rounded-xl flex items-center justify-center space-x-1.5 transition-colors border border-stone-200 hover:border-indigo-200"
            >
              <Plus className="w-4 h-4" />
              <span>Add Weekly Slot</span>
            </button>
          </div>

          {/* Slots display */}
          <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
            {availability.map((dayAvail) => (
              <div key={dayAvail.dayOfWeek} className="space-y-1.5 animate-fadeIn">
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                  {dayAvail.dayOfWeek}
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {dayAvail.timeSlots.map((slot) => (
                    <div 
                      key={slot}
                      className="flex items-center space-x-1 px-2.5 py-1 bg-indigo-50/20 text-indigo-900 border border-indigo-100 rounded-xl text-[10px] font-bold"
                    >
                      <Clock className="w-3 h-3 text-indigo-500" />
                      <span>{slot}</span>
                      <button 
                        onClick={() => handleRemoveSlot(dayAvail.dayOfWeek, slot)}
                        className="text-stone-400 hover:text-rose-600 ml-1 transition-colors"
                        title="Remove slot"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {availability.length === 0 && (
              <p className="text-stone-400 text-xs italic text-center py-6">No availability slots set. You will not receive new booking requests.</p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
