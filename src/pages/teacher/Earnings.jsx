import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { apiClient } from '../../api/apiClient';
import { DollarSign, Award, Clock, ArrowUpRight, AlertCircle } from 'lucide-react';

export const TeacherEarnings = () => {
  const { currentUser } = useAuth();
  
  const [completedClasses, setCompletedClasses] = useState([]);
  const [earningsHistory, setEarningsHistory] = useState([]);
  const [totalEarnings, setTotalEarnings] = useState(0);

  useEffect(() => {
    if (currentUser) {
      const fetchEarnings = async () => {
        try {
          const data = await apiClient.get('/bookings');
          const myClasses = data
            .filter(c => c.teacherId && (c.teacherId._id === currentUser.id || c.teacherId.id === currentUser.id) && c.status === 'completed')
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
          
          setCompletedClasses(myClasses);

          let total = 0;
          const historyList = myClasses.map(c => {
            let rate = 40;
            if (c.activityId && typeof c.activityId === 'object') {
              rate = c.activityId.pricePerClass || 40;
            }
            total += rate;
            
            return {
              id: c._id,
              date: c.date,
              studentName: getStudentName(c.childId),
              activityName: c.activityId && typeof c.activityId === 'object' ? c.activityId.name : 'Extracurricular Class',
              rate,
            };
          });

          setTotalEarnings(total);
          setEarningsHistory(historyList);
        } catch (err) {
          console.error('Failed to load teacher earnings:', err);
        }
      };
      fetchEarnings();
    }
  }, [currentUser]);

  const getStudentName = (child) => {
    if (child && typeof child === 'object') return child.name;
    return 'Student';
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Title */}
      <div>
        <h2 className="text-2xl font-bold text-stone-800">Earnings & Payout Logs</h2>
        <p className="text-stone-550 text-xs mt-1">Review payouts from completed lesson sessions and trace financial credits.</p>
      </div>

      {/* Summary Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl">
        <div className="bg-white p-6 rounded-3xl border border-stone-250 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-stone-400 font-bold text-xs uppercase tracking-wider block">Estimated Total Earnings</span>
            <span className="text-3xl font-extrabold text-stone-850">${totalEarnings}</span>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
            <DollarSign className="w-8 h-8" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-stone-250 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-stone-400 font-bold text-xs uppercase tracking-wider block">Classes Completed</span>
            <span className="text-3xl font-extrabold text-stone-850">{completedClasses.length}</span>
          </div>
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
            <Award className="w-8 h-8" />
          </div>
        </div>
      </div>

      {/* Table grid */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-stone-100 font-display font-bold text-stone-800 text-sm">
          Earnings Breakdown Ledger
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-stone-50 text-stone-400 font-bold uppercase border-b border-stone-100 text-[10px]">
              <tr>
                <th className="px-6 py-3.5">Lesson Date</th>
                <th className="px-6 py-3.5">Student Name</th>
                <th className="px-6 py-3.5">Subject</th>
                <th className="px-6 py-3.5 text-right">Earning Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-stone-700">
              {earningsHistory.map((row) => (
                <tr key={row.id} className="hover:bg-stone-50/30 transition-colors animate-fadeIn">
                  <td className="px-6 py-4 font-semibold">
                    {new Date(row.date).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td className="px-6 py-4 font-bold text-stone-850">{row.studentName}</td>
                  <td className="px-6 py-4">
                    <span className="bg-stone-100 text-stone-800 font-semibold px-2 py-0.5 rounded-full text-[9px] uppercase">
                      {row.activityName}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right font-extrabold text-stone-800">${row.rate}.00</td>
                </tr>
              ))}

              {earningsHistory.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center py-16 text-stone-400 text-xs">
                    No classes have been completed yet to generate payouts.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
