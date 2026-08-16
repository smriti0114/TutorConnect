import React, { useState, useEffect } from 'react';
import { mockDb } from '../../services/mockDb';
import { useAuth } from '../../context/AuthContext';
import { Search, Clipboard } from 'lucide-react';

export const AdminPayments = () => {
  const { currentUser } = useAuth();
  
  const [payments, setPayments] = useState([]);
  const [children, setChildren] = useState([]);
  const [users, setUsers] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Mark Paid dialog state
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [txnRef, setTxnRef] = useState('');
  const [txnDate, setTxnDate] = useState(new Date().toISOString().split('T')[0]);
  const [success, setSuccess] = useState(false);

  const fetchPayments = () => {
    setPayments(mockDb.getPayments());
    setChildren(mockDb.getChildren());
    setUsers(mockDb.getUsers());
  };

  useEffect(() => {
    fetchPayments();
  }, [success]);

  const handleMarkPaidSubmit = (e) => {
    e.preventDefault();
    if (!selectedPayment) return;

    // Enforce authorization
    if (currentUser?.role !== 'admin') {
      alert('Permission Denied: Only administrators can record manual payments.');
      return;
    }

    // Require confirmation before changing status
    if (window.confirm(`Are you sure you want to mark this payment of $${selectedPayment.amount} as Paid?`)) {
      mockDb.markPaymentPaid(
        selectedPayment.id,
        paymentMethod,
        txnRef || `MANUAL-${Date.now()}`,
        txnDate
      );

      setSuccess(true);
      fetchPayments();

      setTimeout(() => {
        setSuccess(false);
        setSelectedPayment(null);
        setTxnRef('');
      }, 1500);
    }
  };

  const getStudentName = (childId) => {
    return children.find(c => c.id === childId)?.name || 'Student';
  };

  const getParentName = (parentId) => {
    return users.find(u => u.id === parentId)?.name || 'Parent';
  };

  const getActivityName = (enrollmentId) => {
    if (!enrollmentId) return 'General Tuition';
    const enrollments = mockDb.getEnrollments();
    const enroll = enrollments.find(e => e.id === enrollmentId);
    if (!enroll) return 'Extracurricular Class';
    const activities = mockDb.getActivities();
    return activities.find(a => a.id === enroll.activityId)?.name || 'Extracurricular';
  };

  const filteredPayments = payments.filter(p => {
    const sName = getStudentName(p.childId).toLowerCase();
    const pName = getParentName(p.parentId).toLowerCase();
    const matchesSearch = sName.includes(searchQuery.toLowerCase()) || pName.includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    if (activeTab === 'pending') return p.status === 'pending';
    if (activeTab === 'overdue') return p.status === 'overdue';
    if (activeTab === 'paid') return p.status === 'paid';
    return true;
  });

  const exportCSV = () => {
    const headers = 'Payment ID,Student Name,Parent Name,Activity,Amount,Status,Due Date,Payment Date,Method,Reference\n';
    const rows = payments.map(p => {
      const sName = getStudentName(p.childId);
      const pName = getParentName(p.parentId);
      const activity = getActivityName(p.enrollmentId);
      return `${p.id},"${sName}","${pName}","${activity}",${p.amount},${p.status},${p.dueDate},${p.paymentDate || ''},${p.paymentMethod || ''},"${p.reference || ''}"`;
    }).join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `stellartutors_ledger_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-stone-850">Financial Tracking Ledger</h2>
          <p className="text-stone-500 text-xs mt-1">Audit outstanding tuition payments, mark collections as paid, and export spreadsheets.</p>
        </div>
        
        <button
          onClick={exportCSV}
          className="flex items-center space-x-2 bg-teal-650 hover:bg-teal-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-md shadow-teal-500/10 self-start"
        >
          <Clipboard className="w-4.5 h-4.5" />
          <span>Export Ledger (CSV)</span>
        </button>
      </div>

      {/* Tabs and filters */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-stone-200">
        <div className="flex space-x-6">
          <button
            onClick={() => setActiveTab('all')}
            className={`pb-3 text-sm font-bold transition-all ${activeTab === 'all' ? 'border-b-2 border-teal-500 text-teal-600' : 'text-stone-400 hover:text-stone-605'}`}
          >
            All Ledger Logs
          </button>
          <button
            onClick={() => setActiveTab('paid')}
            className={`pb-3 text-sm font-bold transition-all ${activeTab === 'paid' ? 'border-b-2 border-teal-500 text-teal-600' : 'text-stone-400 hover:text-stone-605'}`}
          >
            Paid
          </button>
          <button
            onClick={() => setActiveTab('pending')}
            className={`pb-3 text-sm font-bold transition-all ${activeTab === 'pending' ? 'border-b-2 border-teal-500 text-teal-600' : 'text-stone-400 hover:text-stone-605'}`}
          >
            Pending
          </button>
          <button
            onClick={() => setActiveTab('overdue')}
            className={`pb-3 text-sm font-bold transition-all ${activeTab === 'overdue' ? 'border-b-2 border-teal-500 text-teal-600' : 'text-stone-400 hover:text-stone-605'}`}
          >
            Overdue
          </button>
        </div>

        <div className="relative max-w-xs w-full pb-2 sm:pb-0">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-stone-400">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="Search student or parent..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-stone-250 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-teal-505 text-stone-850 bg-white"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-stone-50 text-stone-400 font-bold uppercase border-b border-stone-100 text-[10px]">
              <tr>
                <th className="px-6 py-3.5">Student & Parent</th>
                <th className="px-6 py-3.5">Extracurricular</th>
                <th className="px-6 py-3.5">Due Date</th>
                <th className="px-6 py-3.5 text-right">Fee Due</th>
                <th className="px-6 py-3.5 text-center">Status</th>
                <th className="px-6 py-3.5 text-right">Collection Log</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-stone-700">
              {filteredPayments.map((p) => (
                <tr key={p.id} className="hover:bg-stone-50/20 transition-all animate-fadeIn">
                  <td className="px-6 py-4">
                    <p className="font-bold text-stone-850">{getStudentName(p.childId)}</p>
                    <p className="text-stone-400 text-[10px] mt-0.5">Parent: {getParentName(p.parentId)}</p>
                  </td>
                  <td className="px-6 py-4 font-bold text-stone-800">
                    {getActivityName(p.enrollmentId)}
                  </td>
                  <td className="px-6 py-4 font-semibold text-stone-600">
                    {new Date(p.dueDate).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td className="px-6 py-4 font-extrabold text-stone-900 text-right text-sm">
                    ${p.amount}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`font-bold px-2.5 py-0.5 rounded-full uppercase text-[9px] ${
                      p.status === 'paid' ? 'bg-emerald-50 text-emerald-705' :
                      p.status === 'overdue' ? 'bg-rose-50 text-rose-705 animate-pulse' :
                      'bg-amber-50 text-amber-705'
                    }`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {p.status !== 'paid' ? (
                      <button
                        onClick={() => setSelectedPayment(p)}
                        className="px-3.5 py-1.5 bg-teal-50 hover:bg-teal-100 border border-teal-200 text-teal-700 font-bold rounded-xl transition-all shadow-xs"
                      >
                        Mark as Paid
                      </button>
                    ) : (
                      <span className="text-[10px] text-stone-400 italic">
                        {p.paymentMethod} ({p.reference?.substring(0, 10)})
                      </span>
                    )}
                  </td>
                </tr>
              ))}

              {filteredPayments.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-16 text-stone-400 text-xs">
                    No matching billing entries found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mark paid Modal */}
      {selectedPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/55 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-stone-100 animate-scaleUp">
            {success ? (
              <div className="text-center py-8 space-y-3">
                <div className="w-16 h-16 bg-emerald-50 text-emerald-505 rounded-full flex items-center justify-center mx-auto text-3xl animate-bounce">
                  ✓
                </div>
                <h3 className="text-xl font-bold text-stone-800">Tuition Payment Logged!</h3>
                <p className="text-stone-505 text-xs">Invoice status updated to paid successfully.</p>
              </div>
            ) : (
              <form onSubmit={handleMarkPaidSubmit} className="space-y-5 text-xs animate-scaleUp">
                <div>
                  <h3 className="text-xl font-bold text-stone-800 font-display">Record Manual Collection</h3>
                  <p className="text-stone-550 text-xs mt-1">Mark this fee as collected by an administrator.</p>
                </div>

                <div className="bg-stone-50 p-4 rounded-2xl border border-stone-150 flex justify-between items-center text-xs">
                  <div>
                    <span className="text-stone-400 block text-[10px]">TOTAL COLLECTED</span>
                    <span className="font-extrabold text-stone-800 text-lg mt-0.5">${selectedPayment.amount}</span>
                  </div>
                  <span className="text-[10px] font-bold bg-amber-100 text-amber-805 px-2.5 py-0.5 rounded-full uppercase">
                    {selectedPayment.status}
                  </span>
                </div>

                <div>
                  <label className="block font-bold text-stone-750 uppercase tracking-wider mb-1.5">Collection Method</label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('cash')}
                      className={`p-2 py-2.5 rounded-xl border font-bold text-center ${paymentMethod === 'cash' ? 'border-teal-500 bg-teal-50 text-teal-900' : 'border-stone-200 bg-white text-stone-605'}`}
                    >
                      Cash
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('check')}
                      className={`p-2 py-2.5 rounded-xl border font-bold text-center ${paymentMethod === 'check' ? 'border-teal-500 bg-teal-50 text-teal-900' : 'border-stone-200 bg-white text-stone-605'}`}
                    >
                      Check
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('stripe')}
                      className={`p-2 py-2.5 rounded-xl border font-bold text-center ${paymentMethod === 'stripe' ? 'border-teal-500 bg-teal-50 text-teal-900' : 'border-stone-200 bg-white text-stone-605'}`}
                    >
                      Stripe Portal
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-stone-750 uppercase tracking-wider mb-1.5">Transaction Reference</label>
                    <input
                      type="text"
                      placeholder="Check number/ID"
                      required
                      value={txnRef}
                      onChange={(e) => setTxnRef(e.target.value)}
                      className="w-full px-4 py-2.5 border border-stone-250 rounded-xl text-stone-850"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-stone-750 uppercase tracking-wider mb-1.5">Date Collected</label>
                    <input
                      type="date"
                      required
                      value={txnDate}
                      onChange={(e) => setTxnDate(e.target.value)}
                      className="w-full px-4 py-2.5 border border-stone-250 rounded-xl text-stone-850"
                    />
                  </div>
                </div>

                <div className="flex space-x-3 pt-2">
                  <button 
                    type="button"
                    onClick={() => setSelectedPayment(null)}
                    className="flex-1 py-3 text-sm font-bold text-stone-650 bg-stone-105 hover:bg-stone-200 rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-3 text-sm font-bold text-white bg-teal-650 hover:bg-teal-700 rounded-xl transition-colors shadow-md shadow-teal-500/15"
                  >
                    Confirm Collection
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
