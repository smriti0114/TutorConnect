import React, { useState, useEffect } from 'react';
import { apiClient } from '../../api/apiClient';
import { Star, AlertCircle } from 'lucide-react';

export const AdminTeachersPerformance = () => {
  const [tutorScores, setTutorScores] = useState([]);

  useEffect(() => {
    const fetchTeacherPerformance = async () => {
      try {
        const teachersList = await apiClient.get('/teachers');
        const classes = await apiClient.get('/bookings');

        const scores = teachersList.map(teacher => {
          const tutorUserId = teacher.userId;
          const myClasses = classes.filter(c => c.teacherId && (c.teacherId._id === tutorUserId || c.teacherId.id === tutorUserId));
          
          const ratedClasses = myClasses.filter(c => c.ratingByParent !== undefined && c.ratingByParent !== null);
          const ratingSum = ratedClasses.reduce((acc, curr) => acc + (curr.ratingByParent || 5), 0);
          const averageRating = ratedClasses.length > 0 ? ratingSum / ratedClasses.length : 5.0;

          const completedClassesCount = myClasses.filter(c => c.status === 'completed').length;

          // Compute avatar fallback or seed URL
          const avatar = `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(teacher.name)}`;

          return {
            id: teacher.id || teacher._id,
            tutorName: teacher.name || 'Tutor',
            avatar: teacher.avatar || avatar,
            rating: averageRating,
            totalClasses: myClasses.length,
            completedClasses: completedClassesCount,
            reviewCount: ratedClasses.length,
          };
        });

        setTutorScores(scores);
      } catch (err) {
        console.error('Failed to load teacher performance logs:', err);
      }
    };
    fetchTeacherPerformance();
  }, []);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Title */}
      <div>
        <h2 className="text-2xl font-bold text-stone-850">Teacher Ratings & Performance</h2>
        <p className="text-stone-500 text-xs mt-1">Review average parent feedback rating metrics and lesson logs volume per teacher.</p>
      </div>

      {/* Grid of Tutors */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tutorScores.map((score) => (
          <div key={score.id} className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xs space-y-4 hover:shadow-md transition-shadow animate-fadeIn">
            <div className="flex items-center space-x-3.5 pb-3 border-b border-stone-100">
              <img src={score.avatar} alt={score.tutorName} className="w-12 h-12 rounded-full object-cover" />
              <div>
                <h3 className="font-bold text-base text-stone-850">{score.tutorName}</h3>
                <p className="text-[10px] text-stone-400">Professional Extracurricular Mentor</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="bg-stone-50 p-3 rounded-2xl border border-stone-100 flex flex-col justify-between">
                <span className="text-stone-405 font-bold uppercase tracking-wider text-[9px]">Average Rating</span>
                <div className="flex items-center space-x-1 mt-1">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-550" />
                  <span className="font-extrabold text-stone-800 text-base">{score.rating.toFixed(1)}</span>
                  <span className="text-stone-405 text-[10px] font-semibold">({score.reviewCount})</span>
                </div>
              </div>
              <div className="bg-stone-50 p-3 rounded-2xl border border-stone-100 flex flex-col justify-between">
                <span className="text-stone-405 font-bold uppercase tracking-wider text-[9px]">Lessons Taught</span>
                <span className="font-extrabold text-stone-800 text-base mt-1">{score.completedClasses}</span>
              </div>
            </div>

            <div className="flex justify-between items-center text-[10px] font-bold text-stone-400 pt-1">
              <span>ACTIVE SCHEDULES:</span>
              <span className="text-stone-700">{score.totalClasses - score.completedClasses} active time slots</span>
            </div>
          </div>
        ))}

        {tutorScores.length === 0 && (
          <div className="col-span-3 text-center py-16 bg-white rounded-3xl border border-stone-200">
            <AlertCircle className="w-12 h-12 text-stone-300 mx-auto mb-3" />
            <p className="text-stone-505 text-sm font-semibold">No tutors registered in the system yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};
