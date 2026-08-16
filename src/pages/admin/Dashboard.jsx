import React, { useState, useEffect } from 'react';
import { mockDb } from '../../services/mockDb';
import { Users, Calendar, Activity, CreditCard, Award, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const AdminDashboard = () => {
  const [totalStudents, setTotalStudents] = useState(0);
  const [totalTutors, setTotalTutors] = useState(0);
  const [activeClassesCount, setActiveClassesCount] = useState(0);
  const [monthlyRevenue, setMonthlyRevenue] = useState(0);
  const [pendingPaymentsCount, setPendingPaymentsCount] = useState(0);

  useEffect(() => {
    mockDb.initialize();

    // Students count
    const childrenList = mockDb.getChildren().filter(c => c.active);
    setTotalStudents(childrenList.length);

    // Tutors count
    const tutorsList = mockDb.getTeachers();
    setTotalTutors(tutorsList.length);

    // Active classes count
    const classes = mockDb.getClasses();
    const active = classes.filter(c => c.bookingStatus === 'approved' && (c.status === 'upcoming' || c.status === 'rescheduled'));
    setActiveClassesCount(active.length);

    // Monthly revenue calculation
    const payments = mockDb.getPayments();
    const paidThisMonth = payments.filter(p => {
      if (p.status !== 'paid' || !p.paymentDate) return false;
      const payDate = new Date(p.paymentDate);
      const now = new Date();
      return payDate.getMonth() === now.getMonth() && payDate.getFullYear() === now.getFullYear();
    });
    const revenue = paidThisMonth.reduce((acc, curr) => acc + curr.amount, 0);
    setMonthlyRevenue(revenue);

    // Pending payments count
    const pendingPayments = payments.filter(p => p.status === 'pending' || p.status === 'overdue');
    setPendingPaymentsCount(pendingPayments.length);
  }, []);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        
        {/* Card 1: Total Students */}
        <div className="bg-white p-5 rounded-3xl border border-stone-250 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-stone-400 font-bold text-[10px] uppercase tracking-wider block">Total Students</span>
            <span className="text-2xl font-extrabold text-stone-850">{totalStudents}</span>
          </div>
          <div className="p-2.5 bg-teal-50 text-teal-650 rounded-xl">
            <Users className="w-5.5 h-5.5" />
          </div>
        </div>

        {/* Card 2: Total Teachers */}
        <div className="bg-white p-5 rounded-3xl border border-stone-250 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-stone-400 font-bold text-[10px] uppercase tracking-wider block">Total Teachers</span>
            <span className="text-2xl font-extrabold text-stone-850">{totalTutors}</span>
          </div>
          <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
            <Award className="w-5.5 h-5.5" />
          </div>
        </div>

        {/* Card 3: Active Classes */}
        <div className="bg-white p-5 rounded-3xl border border-stone-250 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-stone-400 font-bold text-[10px] uppercase tracking-wider block">Active Classes</span>
            <span className="text-2xl font-extrabold text-stone-850">{activeClassesCount}</span>
          </div>
          <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
            <Calendar className="w-5.5 h-5.5" />
          </div>
        </div>

        {/* Card 4: Monthly Revenue */}
        <div className="bg-white p-5 rounded-3xl border border-stone-250 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-stone-400 font-bold text-[10px] uppercase tracking-wider block">Monthly Revenue</span>
            <span className="text-2xl font-extrabold text-stone-850">${monthlyRevenue}</span>
          </div>
          <div className="p-2.5 bg-emerald-50 text-emerald-650 rounded-xl">
            <Activity className="w-5.5 h-5.5" />
          </div>
        </div>

        {/* Card 5: Pending Payments */}
        <div className="bg-white p-5 rounded-3xl border border-stone-250 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-stone-400 font-bold text-[10px] uppercase tracking-wider block">Pending Payments</span>
            <span className="text-2xl font-extrabold text-stone-850">{pendingPaymentsCount}</span>
          </div>
          <div className="p-2.5 bg-rose-50 text-rose-600 rounded-xl">
            <CreditCard className="w-5.5 h-5.5" />
          </div>
        </div>

      </div>

      {/* SVG charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* SVG Sales Trend Chart (Left 2 cols) */}
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-stone-100">
            <div>
              <h3 className="text-base font-bold text-stone-850 font-display">Revenue Performance Chart</h3>
              <p className="text-[10px] text-stone-400">Monthly recurring platform lesson revenue volume.</p>
            </div>
            <span className="text-emerald-600 bg-emerald-50 text-xs font-bold px-2 py-0.5 rounded-full flex items-center">
              +14.2% <ArrowUpRight className="w-3 h-3 ml-0.5" />
            </span>
          </div>

          <div className="w-full flex items-center justify-center py-4">
            {/* Embedded SVG chart */}
            <svg viewBox="0 0 500 160" className="w-full h-44 overflow-visible">
              {/* Grids */}
              <line x1="30" y1="20" x2="480" y2="20" stroke="#f4f4f5" strokeWidth="1" />
              <line x1="30" y1="60" x2="480" y2="60" stroke="#f4f4f5" strokeWidth="1" />
              <line x1="30" y1="100" x2="480" y2="100" stroke="#f4f4f5" strokeWidth="1" />
              <line x1="30" y1="140" x2="480" y2="140" stroke="#e4e4e7" strokeWidth="1.5" />

              {/* Data path line */}
              <path 
                d="M 50 120 Q 110 80, 160 90 T 280 40 T 380 60 T 450 30" 
                fill="none" 
                stroke="#14b8a6" 
                strokeWidth="3.5" 
                strokeLinecap="round" 
              />

              {/* Data points */}
              <circle cx="50" cy="120" r="5" fill="#14b8a6" stroke="#fff" strokeWidth="1.5" />
              <circle cx="160" cy="90" r="5" fill="#14b8a6" stroke="#fff" strokeWidth="1.5" />
              <circle cx="280" cy="40" r="5" fill="#14b8a6" stroke="#fff" strokeWidth="1.5" />
              <circle cx="380" cy="60" r="5" fill="#14b8a6" stroke="#fff" strokeWidth="1.5" />
              <circle cx="450" cy="30" r="5" fill="#14b8a6" stroke="#fff" strokeWidth="1.5" />

              {/* Month labels */}
              <text x="50" y="155" fill="#a1a1aa" fontSize="9" textAnchor="middle">Feb</text>
              <text x="160" y="155" fill="#a1a1aa" fontSize="9" textAnchor="middle">Mar</text>
              <text x="280" y="155" fill="#a1a1aa" fontSize="9" textAnchor="middle">Apr</text>
              <text x="380" y="155" fill="#a1a1aa" fontSize="9" textAnchor="middle">May</text>
              <text x="450" y="155" fill="#a1a1aa" fontSize="9" textAnchor="middle">Jun</text>
            </svg>
          </div>
        </div>

        {/* Quick Operations Links */}
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-4">
          <h3 className="text-base font-bold text-stone-850 pb-2 border-b border-stone-100 font-display">System Actions</h3>
          <div className="grid grid-cols-1 gap-2.5 text-xs font-bold text-stone-700">
            <Link 
              to="/admin/users" 
              className="flex items-center justify-between p-3.5 bg-stone-50 hover:bg-teal-50 hover:text-teal-900 border border-stone-100 hover:border-teal-200 rounded-2xl transition-all"
            >
              <span>Create / Manage Users</span>
              <span className="text-teal-600">→</span>
            </Link>
            <Link 
              to="/admin/classes" 
              className="flex items-center justify-between p-3.5 bg-stone-50 hover:bg-teal-50 hover:text-teal-900 border border-stone-100 hover:border-teal-200 rounded-2xl transition-all"
            >
              <span>Approve Pending Bookings</span>
              <span className="text-teal-600">→</span>
            </Link>
            <Link 
              to="/admin/payments" 
              className="flex items-center justify-between p-3.5 bg-stone-50 hover:bg-teal-50 hover:text-teal-900 border border-stone-100 hover:border-teal-200 rounded-2xl transition-all"
            >
              <span>Record Invoice Collections</span>
              <span className="text-teal-600">→</span>
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};
