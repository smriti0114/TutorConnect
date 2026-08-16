import React, { useState, useEffect } from 'react';
import { useChild } from '../../context/ChildContext';
import { useAuth } from '../../context/AuthContext';
import { apiClient } from '../../api/apiClient';
import { 
  Calendar, BookOpen, CreditCard, Clock, 
  ChevronRight, PlusCircle, AlertCircle
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export const ParentDashboard = () => {
  const { activeChild } = useChild();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [nextClass, setNextClass] = useState(null);
  const [pendingHomework, setPendingHomework] = useState([]);
  const [pendingPayment, setPendingPayment] = useState(null);
  const [recentNotifications, setRecentNotifications] = useState([]);
  
  // Payment Modal State
  const [showPayModal, setShowPayModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [payReference, setPayReference] = useState('');
  const [isPaying, setIsPaying] = useState(false);
  const [paySuccess, setPaySuccess] = useState(false);

  // Homework Modal State
  const [selectedHw, setSelectedHw] = useState(null);
  const [hwNotes, setHwNotes] = useState('');
  const [hwFile, setHwFile] = useState('');
  const [isSubmittingHw, setIsSubmittingHw] = useState(false);
  const [hwSuccess, setHwSuccess] = useState(false);

  useEffect(() => {
    if (activeChild) {
      const loadDashboardData = async () => {
        try {
          // Fetch Bookings
          const bookings = await apiClient.get('/bookings');
          const childClasses = bookings.filter(
            c => c.childId && (c.childId._id === activeChild.id || c.childId.id === activeChild.id) && c.status === 'upcoming' && c.bookingStatus === 'approved'
          );
          const sortedClasses = childClasses.sort((a, b) => {
            const dateTimeA = new Date(`${a.date}T${a.startTime}`).getTime();
            const dateTimeB = new Date(`${b.date}T${b.startTime}`).getTime();
            return dateTimeA - dateTimeB;
          });
          setNextClass(sortedClasses[0] || null);

          // Fetch Homework
          const homework = await apiClient.get('/homework');
          const childHw = homework.filter(
            h => h.childId && (h.childId._id === activeChild.id || h.childId.id === activeChild.id) && h.status === 'pending'
          );
          setPendingHomework(childHw.map(h => ({ ...h, id: h._id })));

          // Fetch Payments
          const payments = await apiClient.get('/payments');
          const childPayments = payments.filter(
            p => p.childId && (p.childId._id === activeChild.id || p.childId.id === activeChild.id) && p.status !== 'paid'
          );
          const activePayment = childPayments.find(p => p.status === 'overdue') || childPayments.find(p => p.status === 'pending');
          setPendingPayment(activePayment ? { ...activePayment, id: activePayment._id } : null);
        } catch (err) {
          console.error('Failed to load parent dashboard statistics:', err);
        }
      };
      loadDashboardData();
    }
  }, [activeChild, paySuccess, hwSuccess]);

  useEffect(() => {
    if (currentUser) {
      const loadNotifications = async () => {
        try {
          const notifs = await apiClient.get('/notifications');
          setRecentNotifications(notifs.slice(0, 3));
        } catch (err) {
          console.error('Failed to load dashboard notifications:', err);
        }
      };
      loadNotifications();
    }
  }, [currentUser]);

  const handlePay = async () => {
    if (!pendingPayment) return;
    setIsPaying(true);
    try {
      await apiClient.put(`/payments/${pendingPayment.id || pendingPayment._id}/mark-paid`, {
        paymentMethod,
        paymentReference: payReference || `TXN-${Math.floor(10000 + Math.random() * 90000)}`,
        paymentDate: new Date().toISOString().split('T')[0],
      });
      setIsPaying(false);
      setPaySuccess(true);
      setTimeout(() => {
        setShowPayModal(false);
        setPaySuccess(false);
      }, 1500);
    } catch (err) {
      alert(err.message || 'Payment simulation failed.');
      setIsPaying(false);
    }
  };

  const handleHwSubmit = async () => {
    if (!selectedHw) return;
    setIsSubmittingHw(true);
    try {
      await apiClient.put(`/homework/${selectedHw.id || selectedHw._id}/complete`, {
        submissionNotes: hwNotes,
        attachmentName: hwFile || 'my_practice_notes.jpg',
      });
      setIsSubmittingHw(false);
      setHwSuccess(true);
      setTimeout(() => {
        setSelectedHw(null);
        setHwSuccess(false);
        setHwNotes('');
        setHwFile('');
      }, 1500);
    } catch (err) {
      alert(err.message || 'Failed to submit homework.');
      setIsSubmittingHw(false);
    }
  };

  const getActivityName = (act) => {
    if (act && typeof act === 'object') return act.name;
    return 'Extracurricular';
  };

  const getTeacherName = (tutor) => {
    if (tutor && typeof tutor === 'object') return tutor.name;
    return 'Tutor';
  };

  if (!activeChild) {
    return (
      <div className="text-center py-16 bg-white rounded-3xl border border-brand-100 p-8">
        <AlertCircle className="w-12 h-12 text-brand-400 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-stone-800">No Child Profile Added</h2>
        <p className="text-stone-505 text-sm mt-2 max-w-sm mx-auto">
          Please add a child profile to StellarTutors to view class schedules and assignments.
        </p>
        <Link 
          to="/parent/children" 
          className="inline-flex items-center space-x-2 mt-6 px-5 py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl text-sm transition-colors shadow-lg shadow-brand-500/20"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add Child Profile</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-brand-500 to-brand-400 rounded-3xl p-6 md:p-8 text-white relative overflow-hidden shadow-lg shadow-brand-500/10">
        <div className="relative z-10 max-w-md">
          <span className="bg-white/20 text-white text-[11px] font-bold tracking-wider px-3 py-1 rounded-full uppercase">
            Parent Portal
          </span>
          <h2 className="text-2xl md:text-3xl font-extrabold mt-3">
            Hi, {currentUser?.name.split(' ')[0]}!
          </h2>
          <p className="text-brand-5/90 text-sm mt-2 font-medium">
            You are managing learning schedules for <span className="underline decoration-2 underline-offset-2 font-bold">{activeChild.name}</span>. Explore activities or check on their homework below.
          </p>
        </div>
        <div className="absolute right-0 bottom-0 w-44 h-44 bg-white/10 rounded-full translate-x-12 translate-y-12 blur-xs"></div>
        <div className="absolute right-20 top-0 w-24 h-24 bg-brand-200/20 rounded-full -translate-y-8 blur-2xs"></div>
      </div>

      {/* Primary Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Card 1: Next Scheduled Class */}
        <div className="bg-white rounded-3xl p-6 border border-brand-100 shadow-sm flex flex-col justify-between group hover:shadow-md transition-shadow">
          <div>
            <div className="flex justify-between items-center mb-4">
              <span className="text-stone-400 font-bold text-xs uppercase tracking-wider">Next Lesson</span>
              <div className="p-2 rounded-xl bg-brand-50 text-brand-600">
                <Calendar className="w-4.5 h-4.5" />
              </div>
            </div>
            {nextClass ? (
              <div className="space-y-3">
                <span className="inline-block bg-brand-100 text-brand-900 font-extrabold text-[10px] px-2.5 py-0.5 rounded-full uppercase">
                  {getActivityName(nextClass.activityId)}
                </span>
                <h3 className="text-xl font-bold text-stone-800">{getTeacherName(nextClass.teacherId)}</h3>
                <div className="space-y-1 text-stone-500 text-xs">
                  <p className="flex items-center">
                    <Clock className="w-3.5 h-3.5 mr-1.5 text-stone-400" />
                    {new Date(nextClass.date).toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })}
                  </p>
                  <p className="pl-5">{nextClass.startTime} - {nextClass.endTime}</p>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center">
                <p className="text-stone-400 text-xs font-semibold">No upcoming classes booked.</p>
                <Link to="/parent/activities" className="text-brand-600 hover:text-brand-700 text-xs font-bold mt-2 inline-block">
                  Browse Tutors & Book →
                </Link>
              </div>
            )}
          </div>
          {nextClass && (
            <div className="mt-6 pt-4 border-t border-stone-50">
              <Link 
                to="/parent/classes" 
                className="flex items-center justify-between text-xs font-bold text-brand-600 group-hover:text-brand-700 transition-colors"
              >
                <span>View Class Schedule</span>
                <ChevronRight className="w-4 h-4 transform group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          )}
        </div>

        {/* Card 2: Homework/Practice Tasks */}
        <div className="bg-white rounded-3xl p-6 border border-brand-100 shadow-sm flex flex-col justify-between group hover:shadow-md transition-shadow">
          <div>
            <div className="flex justify-between items-center mb-4">
              <span className="text-stone-400 font-bold text-xs uppercase tracking-wider">Practice Goals</span>
              <div className="p-2 rounded-xl bg-brand-50 text-brand-600">
                <BookOpen className="w-4.5 h-4.5" />
              </div>
            </div>
            {pendingHomework.length > 0 ? (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="inline-block bg-brand-100 text-brand-900 font-extrabold text-[10px] px-2.5 py-0.5 rounded-full uppercase">
                    {getActivityName(pendingHomework[0].activityId || '')}
                  </span>
                  <span className="text-[10px] text-amber-600 font-bold bg-amber-55 px-2 py-0.5 rounded-full">
                    Due {new Date(pendingHomework[0].dueDate).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                  </span>
                </div>
                <p className="text-stone-700 text-sm font-semibold line-clamp-2">
                  {pendingHomework[0].description}
                </p>
                <p className="text-[10px] text-stone-400">Assigned by {getTeacherName(pendingHomework[0].teacherId)}</p>
              </div>
            ) : (
              <div className="py-8 text-center">
                <div className="text-2xl mb-1">🎉</div>
                <p className="text-stone-400 text-xs font-semibold">All practice goals completed!</p>
                <p className="text-[10px] text-stone-400 mt-1">Keep up the wonderful work.</p>
              </div>
            )}
          </div>
          {pendingHomework.length > 0 && (
            <div className="mt-6 pt-4 border-t border-stone-50 flex items-center justify-between">
              <button 
                onClick={() => setSelectedHw(pendingHomework[0])}
                className="text-xs font-bold text-white bg-brand-500 hover:bg-brand-600 px-3.5 py-1.5 rounded-lg transition-colors shadow-sm shadow-brand-500/10"
              >
                Mark Complete
              </button>
              <Link to="/parent/homework" className="text-xs font-bold text-stone-500 hover:text-stone-700">
                All Homework ({pendingHomework.length})
              </Link>
            </div>
          )}
        </div>

        {/* Card 3: Payments & Fees */}
        <div className="bg-white rounded-3xl p-6 border border-brand-100 shadow-sm flex flex-col justify-between group hover:shadow-md transition-shadow">
          <div>
            <div className="flex justify-between items-center mb-4">
              <span className="text-stone-400 font-bold text-xs uppercase tracking-wider">Payments Due</span>
              <div className="p-2 rounded-xl bg-brand-50 text-brand-600">
                <CreditCard className="w-4.5 h-4.5" />
              </div>
            </div>
            {pendingPayment ? (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className={`inline-block font-extrabold text-[10px] px-2.5 py-0.5 rounded-full uppercase ${
                    pendingPayment.status === 'overdue' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-805'
                  }`}>
                    {pendingPayment.status}
                  </span>
                  <span className="text-stone-400 text-[10px] font-bold">
                    Due {new Date(pendingPayment.dueDate).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                  </span>
                </div>
                <h3 className="text-2xl font-extrabold text-stone-800">${pendingPayment.amount}</h3>
                <p className="text-[10px] text-stone-400">Class tuition balance for {activeChild.name}</p>
              </div>
            ) : (
              <div className="py-8 text-center">
                <div className="text-2xl mb-1">👍</div>
                <p className="text-stone-400 text-xs font-semibold">Account fully paid up!</p>
                <p className="text-[10px] text-stone-400 mt-1">No pending fees due.</p>
              </div>
            )}
          </div>
          {pendingPayment && (
            <div className="mt-6 pt-4 border-t border-stone-50 flex items-center justify-between">
              <button 
                onClick={() => setShowPayModal(true)}
                className={`text-xs font-bold text-white px-4 py-2 rounded-lg transition-all ${
                  pendingPayment.status === 'overdue' ? 'bg-rose-500 hover:bg-rose-600 shadow-rose-500/10' : 'bg-brand-500 hover:bg-brand-600'
                }`}
              >
                Pay Outstanding Fee
              </button>
              <Link to="/parent/payments" className="text-xs font-bold text-stone-500 hover:text-stone-700">
                Billing History
              </Link>
            </div>
          )}
        </div>

      </div>

      {/* Activity quick book teaser & Notification Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Discovery Highlights */}
        <div className="bg-white rounded-3xl p-6 border border-brand-100 shadow-sm lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-bold text-stone-800">Discover New Activities</h3>
              <p className="text-stone-505 text-xs">Expose your child to music, arts, and physical coordination.</p>
            </div>
            <Link to="/parent/activities" className="text-xs font-bold text-brand-600 hover:text-brand-700">
              Browse All
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div 
              onClick={() => navigate('/parent/activities')}
              className="bg-brand-50/50 hover:bg-brand-50 border border-brand-100 rounded-2xl p-4 text-center cursor-pointer transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-brand-500 text-white flex items-center justify-center mx-auto mb-3 font-bold text-lg">🎸</div>
              <h4 className="font-bold text-sm text-stone-800">Guitar</h4>
              <p className="text-stone-500 text-[10px] mt-1">$40 per class</p>
            </div>
            <div 
              onClick={() => navigate('/parent/activities')}
              className="bg-indigo-50/20 hover:bg-indigo-50 border border-indigo-100/50 rounded-2xl p-4 text-center cursor-pointer transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-indigo-500 text-white flex items-center justify-center mx-auto mb-3 font-bold text-lg">🎹</div>
              <h4 className="font-bold text-sm text-stone-800">Piano</h4>
              <p className="text-stone-500 text-[10px] mt-1">$45 per class</p>
            </div>
            <div 
              onClick={() => navigate('/parent/activities')}
              className="bg-teal-50/30 hover:bg-teal-50 border border-teal-100/50 rounded-2xl p-4 text-center cursor-pointer transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-teal-500 text-white flex items-center justify-center mx-auto mb-3 font-bold text-lg">🎨</div>
              <h4 className="font-bold text-sm text-stone-805">Drawing</h4>
              <p className="text-stone-505 text-[10px] mt-1">$30 per class</p>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Recent Alerts Panel */}
        <div className="bg-white rounded-3xl p-6 border border-brand-100 shadow-sm">
          <h3 className="text-lg font-bold text-stone-800 mb-5">Recent Updates</h3>
          <div className="space-y-4">
            {recentNotifications.length === 0 ? (
              <p className="text-stone-400 text-xs py-8 text-center">No recent alerts.</p>
            ) : (
              recentNotifications.map(n => (
                <div key={n.id} className="flex items-start space-x-3 text-xs">
                  <div className={`p-1.5 rounded-lg mt-0.5 ${
                    n.type === 'payment' ? 'bg-rose-50 text-rose-600' :
                    n.type === 'homework' ? 'bg-amber-50 text-amber-600' :
                    n.type === 'class' ? 'bg-indigo-50 text-indigo-600' : 'bg-brand-50 text-brand-600'
                  }`}>
                    {n.type === 'payment' ? '💰' : n.type === 'homework' ? '📝' : '📅'}
                  </div>
                  <div>
                    <h4 className="font-bold text-stone-800">{n.title}</h4>
                    <p className="text-stone-505 mt-0.5 text-[11px] leading-relaxed">{n.message}</p>
                    <span className="text-[10px] text-stone-400 block mt-1">
                      {new Date(n.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* Pay Fees Modal */}
      {showPayModal && pendingPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/55 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-stone-100 animate-scaleUp">
            {paySuccess ? (
              <div className="text-center py-8 space-y-3">
                <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto text-3xl animate-bounce">
                  ✓
                </div>
                <h3 className="text-xl font-bold text-stone-800">Payment Successful!</h3>
                <p className="text-stone-500 text-xs">A transaction reference has been logged.</p>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-stone-800">Simulate Payment Checkout</h3>
                  <p className="text-stone-505 text-xs mt-1">Simulate marking invoice as paid. In production, this launches Stripe checkout.</p>
                </div>
                
                <div className="bg-stone-50 p-4 rounded-2xl border border-stone-100 flex justify-between items-center text-xs">
                  <div>
                    <span className="text-stone-500 block">Tuition invoice amount</span>
                    <span className="font-extrabold text-stone-800 text-base mt-0.5">${pendingPayment.amount}</span>
                  </div>
                  <span className="text-[10px] font-bold bg-amber-100 text-amber-808 px-2.5 py-0.5 rounded-full uppercase">
                    {pendingPayment.status}
                  </span>
                </div>

                <div className="space-y-3 text-xs">
                  <label className="font-bold text-stone-700 block">Payment Method Selector</label>
                  <div className="grid grid-cols-3 gap-2">
                    <button 
                      onClick={() => setPaymentMethod('card')} 
                      className={`p-2.5 rounded-xl border font-bold text-center ${paymentMethod === 'card' ? 'border-brand-500 bg-brand-50 text-brand-900' : 'border-stone-200 bg-white text-stone-605'}`}
                    >
                      Credit Card
                    </button>
                    <button 
                      onClick={() => setPaymentMethod('bank_transfer')} 
                      className={`p-2.5 rounded-xl border font-bold text-center ${paymentMethod === 'bank_transfer' ? 'border-brand-500 bg-brand-50 text-brand-900' : 'border-stone-200 bg-white text-stone-605'}`}
                    >
                      Bank Transfer
                    </button>
                    <button 
                      onClick={() => setPaymentMethod('cash')} 
                      className={`p-2.5 rounded-xl border font-bold text-center ${paymentMethod === 'cash' ? 'border-brand-500 bg-brand-50 text-brand-900' : 'border-stone-200 bg-white text-stone-605'}`}
                    >
                      Cash
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                    Reference Code (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. TXN-12345"
                    value={payReference}
                    onChange={(e) => setPayReference(e.target.value)}
                    className="w-full px-4 py-2.5 border border-stone-200 rounded-xl text-sm focus:ring-brand-500 focus:border-brand-500 text-stone-850"
                  />
                </div>

                <div className="flex space-x-3">
                  <button 
                    onClick={() => setShowPayModal(false)}
                    className="flex-1 py-3 text-sm font-bold text-stone-650 bg-stone-105 hover:bg-stone-200 rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handlePay}
                    disabled={isPaying}
                    className="flex-1 py-3 text-sm font-bold text-white bg-brand-500 hover:bg-brand-600 rounded-xl transition-colors shadow-md shadow-brand-500/20 disabled:opacity-50 flex items-center justify-center"
                  >
                    {isPaying ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      'Confirm Payment'
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Homework Completion Modal */}
      {selectedHw && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/55 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-stone-100 animate-scaleUp">
            {hwSuccess ? (
              <div className="text-center py-8 space-y-3">
                <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto text-3xl animate-bounce">
                  ✓
                </div>
                <h3 className="text-xl font-bold text-stone-800">Homework Submitted!</h3>
                <p className="text-stone-500 text-xs">Tutor has been notified of completion.</p>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-stone-800">Mark Homework Complete</h3>
                  <p className="text-stone-505 text-xs mt-1">Upload practice sheets or submit notes for tutor review.</p>
                </div>

                <div className="bg-stone-50 p-4 rounded-2xl border border-stone-100 text-xs space-y-2">
                  <span className="text-[10px] text-stone-400 uppercase font-bold tracking-wider">Assignment details</span>
                  <p className="text-stone-800 font-semibold">{selectedHw.description}</p>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
                    Notes for Teacher
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Write a message about how practice went (e.g. Leo spent 2 hours practicing fingering...)"
                    value={hwNotes}
                    onChange={(e) => setHwNotes(e.target.value)}
                    className="w-full px-4 py-2.5 border border-stone-200 rounded-xl text-sm focus:ring-brand-500 focus:border-brand-500 text-stone-850"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
                    Mock File Attachment
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. practice_video.mp4 or photo.jpg"
                    value={hwFile}
                    onChange={(e) => setHwFile(e.target.value)}
                    className="w-full px-4 py-2.5 border border-stone-200 rounded-xl text-sm focus:ring-brand-500 focus:border-brand-500 text-stone-850"
                  />
                </div>

                <div className="flex space-x-3">
                  <button 
                    onClick={() => setSelectedHw(null)}
                    className="flex-1 py-3 text-sm font-bold text-stone-650 bg-stone-105 hover:bg-stone-200 rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleHwSubmit}
                    disabled={isSubmittingHw}
                    className="flex-1 py-3 text-sm font-bold text-white bg-brand-500 hover:bg-brand-600 rounded-xl transition-colors shadow-md shadow-brand-500/20 disabled:opacity-50 flex items-center justify-center"
                  >
                    {isSubmittingHw ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      'Submit Practice'
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
