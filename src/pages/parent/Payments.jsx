import React, { useState, useEffect } from 'react';
import { useChild } from '../../context/ChildContext';
import { apiClient } from '../../api/apiClient';
import { CreditCard, CheckCircle } from 'lucide-react';

export const ParentPayments = () => {
  const { activeChild } = useChild();

  const [payments, setPayments] = useState([]);
  const [activeTab, setActiveTab] = useState('pending');

  // Checkout modal
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [txnRef, setTxnRef] = useState('');
  const [isPaying, setIsPaying] = useState(false);
  const [paySuccess, setPaySuccess] = useState(false);

  useEffect(() => {
    if (activeChild) {
      const fetchPayments = async () => {
        try {
          const data = await apiClient.get('/payments');
          const childPayments = data
            .filter(p => p.childId && (p.childId._id === activeChild.id || p.childId.id === activeChild.id))
            .map(p => ({ ...p, id: p._id }));
          setPayments(childPayments);
        } catch (err) {
          console.error('Failed to load payments:', err);
        }
      };
      fetchPayments();
    }
  }, [activeChild, paySuccess]);

  const getActivityName = (classSession) => {
    if (classSession && classSession.activityId && typeof classSession.activityId === 'object') {
      return classSession.activityId.name;
    }
    return 'Extracurricular Class';
  };

  const handleSimulatePayment = async () => {
    if (!selectedPayment) return;
    setIsPaying(true);
    try {
      await apiClient.put(`/payments/${selectedPayment.id || selectedPayment._id}/mark-paid`, {
        paymentMethod,
        paymentReference: txnRef || `TXN-${Math.floor(10000 + Math.random() * 90000)}`,
        paymentDate: new Date().toISOString().split('T')[0],
      });
      setIsPaying(false);
      setPaySuccess(true);
      setTimeout(() => {
        setSelectedPayment(null);
        setPaySuccess(false);
        setTxnRef('');
      }, 1500);
    } catch (err) {
      alert(err.message || 'Failed to process payment.');
      setIsPaying(false);
    }
  };

  const pendingPayments = payments.filter(p => p.status === 'pending' || p.status === 'overdue');
  const paidPayments = payments.filter(p => p.status === 'paid');

  const activePaymentsList = activeTab === 'pending' ? pendingPayments : paidPayments;

  if (!activeChild) {
    return (
      <div className="text-center py-16 bg-white rounded-3xl border border-brand-100 p-8">
        <CreditCard className="w-12 h-12 text-brand-300 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-stone-800">No Child Registered</h3>
        <p className="text-stone-500 text-xs mt-1">Please create a child profile to track billing.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Title */}
      <div>
        <h2 className="text-2xl font-bold text-stone-800">Fees & Invoices</h2>
        <p className="text-stone-550 text-xs mt-1">Track pending tuition dues, make manual simulation payments, and audit payment receipts.</p>
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
          Outstanding Invoices ({pendingPayments.length})
        </button>
        <button
          onClick={() => setActiveTab('paid')}
          className={`pb-3 text-sm font-bold transition-all px-4 ${
            activeTab === 'paid'
              ? 'border-b-2 border-brand-500 text-brand-600'
              : 'text-stone-400 hover:text-stone-605'
          }`}
        >
          Paid Receipts ({paidPayments.length})
        </button>
      </div>

      {/* List */}
      <div className="space-y-4">
        {activePaymentsList.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-stone-150">
            <CheckCircle className="w-12 h-12 text-stone-300 mx-auto mb-3" />
            <p className="text-stone-505 text-sm font-semibold">No invoices found in this category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 animate-fadeIn">
            {activePaymentsList.map((p) => (
              <div key={p.id} className="bg-white rounded-3xl p-6 border border-brand-100 shadow-sm flex flex-col justify-between md:flex-row md:items-center gap-4">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center space-x-2.5">
                    <span className="font-bold text-stone-800 text-sm">{getActivityName(p.enrollmentId)}</span>
                    <span className={`text-[9px] font-extrabold px-2.5 py-0.5 rounded-full uppercase ${
                      p.status === 'overdue' ? 'bg-rose-100 text-rose-805 animate-pulse' :
                      p.status === 'pending' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      {p.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs pt-1">
                    <div>
                      <span className="text-stone-400 block text-[10px]">INVOICE TOTAL</span>
                      <span className="font-extrabold text-stone-800 text-sm mt-0.5">${p.amount}</span>
                    </div>
                    <div>
                      <span className="text-stone-400 block text-[10px]">DUE DATE</span>
                      <span className="font-semibold text-stone-605 mt-0.5">
                        {new Date(p.dueDate).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                    {p.status === 'paid' && (
                      <>
                        <div>
                          <span className="text-stone-400 block text-[10px]">PAID ON</span>
                          <span className="font-semibold text-stone-605 mt-0.5">
                            {p.paymentDate ? new Date(p.paymentDate).toLocaleDateString([], { month: 'short', day: 'numeric' }) : 'N/A'}
                          </span>
                        </div>
                        <div>
                          <span className="text-stone-400 block text-[10px]">METHOD & REF</span>
                          <span className="font-semibold text-stone-605 mt-0.5 truncate block max-w-[120px]" title={p.paymentReference || p.reference}>
                            {p.paymentMethod?.toUpperCase()} - {p.paymentReference || p.reference}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {p.status !== 'paid' && (
                  <button
                    onClick={() => setSelectedPayment(p)}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold text-white transition-all shadow-sm ${
                      p.status === 'overdue' ? 'bg-rose-500 hover:bg-rose-600 shadow-rose-500/10' : 'bg-brand-500 hover:bg-brand-600 shadow-brand-500/10'
                    }`}
                  >
                    Pay Invoice
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Checkout Modal */}
      {selectedPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/55 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-stone-100 animate-scaleUp">
            {paySuccess ? (
              <div className="text-center py-8 space-y-3">
                <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto text-3xl animate-bounce">
                  ✓
                </div>
                <h3 className="text-xl font-bold text-stone-800">Simulated Payment Received!</h3>
                <p className="text-stone-505 text-xs">Payment logged. Invoice updated to paid status.</p>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-stone-800">Complete Invoice Payment</h3>
                  <p className="text-stone-505 text-xs mt-1">This checkout simulation captures payment metrics details for validation.</p>
                </div>

                <div className="bg-stone-50 p-4 rounded-2xl border border-stone-100 flex justify-between items-center text-xs">
                  <div>
                    <span className="text-stone-400 block text-[10px]">TOTAL DUE</span>
                    <span className="font-extrabold text-stone-800 text-lg mt-0.5">${selectedPayment.amount}</span>
                  </div>
                  <span className="text-[10px] font-bold bg-amber-100 text-amber-805 px-2.5 py-0.5 rounded-full uppercase">
                    {selectedPayment.status}
                  </span>
                </div>

                <div className="space-y-2.5 text-xs">
                  <label className="font-bold text-stone-700 block">Mock Checkout Method</label>
                  <div className="grid grid-cols-3 gap-2">
                    <button 
                      type="button"
                      onClick={() => setPaymentMethod('card')} 
                      className={`p-2.5 rounded-xl border font-bold text-center ${paymentMethod === 'card' ? 'border-brand-500 bg-brand-50 text-brand-900' : 'border-stone-200 bg-white text-stone-605'}`}
                    >
                      Credit Card
                    </button>
                    <button 
                      type="button"
                      onClick={() => setPaymentMethod('bank_transfer')} 
                      className={`p-2.5 rounded-xl border font-bold text-center ${paymentMethod === 'bank_transfer' ? 'border-brand-500 bg-brand-50 text-brand-900' : 'border-stone-200 bg-white text-stone-605'}`}
                    >
                      Bank Transfer
                    </button>
                    <button 
                      type="button"
                      onClick={() => setPaymentMethod('cash')} 
                      className={`p-2.5 rounded-xl border font-bold text-center ${paymentMethod === 'cash' ? 'border-brand-500 bg-brand-50 text-brand-900' : 'border-stone-200 bg-white text-stone-605'}`}
                    >
                      Cash
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                    Reference Code / Check Number
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. TXN-198228"
                    value={txnRef}
                    onChange={(e) => setTxnRef(e.target.value)}
                    className="w-full px-4 py-2.5 border border-stone-200 rounded-xl text-sm focus:ring-brand-500 focus:border-brand-500 text-stone-850"
                  />
                </div>

                <div className="flex space-x-3">
                  <button 
                    onClick={() => setSelectedPayment(null)}
                    className="flex-1 py-3 text-sm font-bold text-stone-650 bg-stone-105 hover:bg-stone-200 rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleSimulatePayment}
                    disabled={isPaying}
                    className="flex-1 py-3 text-sm font-bold text-white bg-brand-500 hover:bg-brand-600 rounded-xl transition-colors shadow-md shadow-brand-500/15 flex items-center justify-center"
                  >
                    {isPaying ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      'Simulate Success'
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
