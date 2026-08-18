'use client';

import React, { useState } from 'react';
import { useTenant } from '@/lib/context/TenantContext';
import { useAuth } from '@/lib/context/AuthContext';
import { Payment, PaymentMethod } from '@/lib/types';
import { Card, Button, Input, Select, Badge, Modal } from '@/components/ui';
import { CreditCard, Plus, Printer, CheckCircle2, DollarSign, Search, Building2 } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function PaymentsPage() {
  const { payments, members, plans, recordPayment } = useTenant();
  const { currentGym, impersonatedGym } = useAuth();
  const activeGym = impersonatedGym || currentGym;

  const [searchQuery, setSearchQuery] = useState('');
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<Payment | null>(null);

  const [formData, setFormData] = useState({
    member_id: '',
    membership_plan_id: '',
    amount: 49.99,
    payment_method: 'card' as PaymentMethod,
    transaction_id: '',
    notes: '',
  });

  const filteredPayments = payments.filter((p) => {
    return (
      (p.member_name && p.member_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.member_code && p.member_code.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.transaction_id && p.transaction_id.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  });

  const handleMemberChange = (memberId: string) => {
    const member = members.find((m) => m.id === memberId);
    const plan = plans.find((p) => p.id === member?.membership_plan_id) || plans[0];
    setFormData({
      ...formData,
      member_id: memberId,
      membership_plan_id: plan?.id || '',
      amount: plan ? Number(plan.price) : 49.99,
    });
  };

  const handleRecordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.member_id) return;

    const newPayment = recordPayment({
      member_id: formData.member_id,
      membership_plan_id: formData.membership_plan_id,
      amount: Number(formData.amount),
      payment_method: formData.payment_method,
      payment_date: new Date().toISOString().split('T')[0],
      transaction_id: formData.transaction_id || `TXN-${Math.floor(100000 + Math.random() * 900000)}`,
      status: 'paid',
      notes: formData.notes,
    });

    confetti({ particleCount: 60, spread: 60, origin: { y: 0.7 } });

    setIsRecordModalOpen(false);
    setSelectedReceipt(newPayment);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-indigo-600" />
            <span>Payments & Revenue</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">Record member transactions, generate receipts, and track gym revenue.</p>
        </div>

        <Button
          onClick={() => setIsRecordModalOpen(true)}
          variant="primary"
          icon={<Plus className="w-4 h-4" />}
        >
          Record New Payment
        </Button>
      </div>

      {/* Search Bar */}
      <Card className="p-4">
        <div className="w-full sm:w-80 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search by member or transaction ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600"
          />
        </div>
      </Card>

      {/* Payments History Table */}
      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="p-4">Member</th>
                <th className="p-4">Plan / Package</th>
                <th className="p-4">Transaction ID</th>
                <th className="p-4">Method</th>
                <th className="p-4">Date</th>
                <th className="p-4">Amount</th>
                <th className="p-4 text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/80">
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    No payment records found.
                  </td>
                </tr>
              ) : (
                filteredPayments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4">
                      <p className="font-bold text-slate-900">{p.member_name || 'Member'}</p>
                      <p className="text-[10px] text-indigo-600 font-mono font-bold">{p.member_code || 'CODE'}</p>
                    </td>
                    <td className="p-4 font-medium text-slate-800">{p.plan_name || 'Membership Fee'}</td>
                    <td className="p-4 font-mono text-slate-500 font-medium">{p.transaction_id || 'N/A'}</td>
                    <td className="p-4">
                      <Badge variant="indigo">{p.payment_method.toUpperCase()}</Badge>
                    </td>
                    <td className="p-4 text-slate-700 font-medium">{p.payment_date}</td>
                    <td className="p-4 font-black text-slate-900 text-sm font-mono">₹{Number(p.amount).toFixed(2)}</td>
                    <td className="p-4 text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setSelectedReceipt(p)}
                        icon={<Printer className="w-3.5 h-3.5" />}
                      >
                        Receipt
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Record Payment Modal */}
      <Modal
        isOpen={isRecordModalOpen}
        onClose={() => setIsRecordModalOpen(false)}
        title="Record Membership Payment"
        description="Select a gym member and record transaction details."
      >
        <form onSubmit={handleRecordSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Select Gym Member *
            </label>
            <select
              value={formData.member_id}
              onChange={(e) => handleMemberChange(e.target.value)}
              className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-emerald-600"
              required
            >
              <option value="">-- Choose Member --</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.full_name} ({m.member_code})
                </option>
              ))}
            </select>
          </div>

          <Select
            label="Membership Plan"
            value={formData.membership_plan_id}
            onChange={(e) => setFormData({ ...formData, membership_plan_id: e.target.value })}
            options={plans.map((p) => ({ label: `${p.name} (₹${p.price})`, value: p.id }))}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Amount Paid (₹) *"
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
              required
            />

            <Select
              label="Payment Method *"
              value={formData.payment_method}
              onChange={(e: any) => setFormData({ ...formData, payment_method: e.target.value })}
              options={[
                { label: 'Credit/Debit Card', value: 'card' },
                { label: 'Cash', value: 'cash' },
                { label: 'UPI / Online', value: 'upi' },
                { label: 'Bank Transfer', value: 'bank_transfer' },
              ]}
            />
          </div>

          <Input
            label="Transaction Reference ID (Optional)"
            placeholder="e.g. TXN-9021-CARD"
            value={formData.transaction_id}
            onChange={(e) => setFormData({ ...formData, transaction_id: e.target.value })}
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <Button type="button" variant="outline" onClick={() => setIsRecordModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Record & Generate Receipt
            </Button>
          </div>
        </form>
      </Modal>

      {/* Printable Receipt Modal */}
      {selectedReceipt && (
        <Modal
          isOpen={!!selectedReceipt}
          onClose={() => setSelectedReceipt(null)}
          title="Payment Tax Receipt"
          description={`Official invoice for ${selectedReceipt.member_name}`}
          maxWidth="lg"
        >
          <div className="space-y-6">
            {/* Printable Receipt Card Body */}
            <div id="printable-receipt" className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 space-y-6 text-xs text-slate-900 shadow-sm">
              {/* Gym Branding Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-5 gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white font-black text-2xl flex items-center justify-center shadow-md shrink-0">
                    {activeGym?.name.charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-slate-900 tracking-tight">{activeGym?.name}</h2>
                    <p className="text-xs text-slate-500 font-medium">{activeGym?.address || '100 Metro Plaza, Suite 4A, Mumbai, MH'}</p>
                    <p className="text-[10px] text-slate-400 font-mono">Phone: {activeGym?.phone || '+91 98765 43210'}</p>
                  </div>
                </div>

                <div className="text-left sm:text-right">
                  <span className="inline-block px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full font-black text-[10px] uppercase tracking-wider mb-1">
                    OFFICIAL TAX INVOICE
                  </span>
                  <p className="font-mono font-bold text-slate-900 text-sm">{selectedReceipt.transaction_id || 'TXN-BTC-901'}</p>
                  <p className="text-[10px] text-slate-500 font-semibold">Date: {selectedReceipt.payment_date}</p>
                </div>
              </div>

              {/* Billed To & Payment Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div>
                  <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Billed To (Member)</p>
                  <p className="font-bold text-slate-900 text-sm mt-0.5">{selectedReceipt.member_name}</p>
                  <p className="text-xs font-mono font-bold text-emerald-700">{selectedReceipt.member_code}</p>
                </div>

                <div className="text-left sm:text-right">
                  <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Payment Method & Status</p>
                  <p className="font-bold text-slate-900 text-xs mt-0.5">Method: {selectedReceipt.payment_method.toUpperCase()}</p>
                  <p className="text-xs font-bold text-emerald-600">Status: FULLY PAID ✓</p>
                </div>
              </div>

              {/* Invoice Particulars Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100/80 text-slate-700 font-extrabold uppercase text-[10px] tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="p-3">#</th>
                      <th className="p-3">Particulars / Package</th>
                      <th className="p-3 text-right">Amount (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr>
                      <td className="p-3 font-mono font-bold text-slate-400">1</td>
                      <td className="p-3">
                        <p className="font-bold text-slate-900">{selectedReceipt.plan_name || 'Membership Subscription'}</p>
                        <p className="text-[10px] text-slate-500">Gym Access & Fitness Facilities Pass</p>
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-slate-900">
                        ₹{Number(selectedReceipt.amount).toFixed(2)}
                      </td>
                    </tr>
                  </tbody>
                  <tfoot className="bg-slate-50 border-t border-slate-200 font-bold">
                    <tr>
                      <td colSpan={2} className="p-3 text-right text-slate-600 uppercase text-[10px] tracking-wider">
                        Total Amount Paid:
                      </td>
                      <td className="p-3 text-right font-black text-emerald-700 text-base font-mono">
                        ₹{Number(selectedReceipt.amount).toFixed(2)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Terms & Authorized Stamp */}
              <div className="flex flex-col sm:flex-row items-end justify-between pt-4 border-t border-slate-200 gap-4">
                <div className="text-[10px] text-slate-400 space-y-1">
                  <p className="font-bold text-slate-600">Thank you for choosing {activeGym?.name}!</p>
                  <p>• Membership fees are non-refundable once issued.</p>
                  <p>• Computer generated tax receipt. No physical signature required.</p>
                </div>

                <div className="text-center shrink-0">
                  <div className="w-32 border-b border-slate-400 pb-1 mb-1">
                    <span className="text-[9px] font-mono text-emerald-700 font-black tracking-widest uppercase">NESTBEANS VERIFIED</span>
                  </div>
                  <p className="text-[10px] font-bold text-slate-700">Authorized Signature</p>
                </div>
              </div>
            </div>

            {/* Modal Action Buttons (Excluded from Print via no-print class) */}
            <div className="flex justify-end gap-3 pt-2 no-print">
              <Button
                size="sm"
                variant="primary"
                onClick={() => window.print()}
                icon={<Printer className="w-4 h-4" />}
              >
                Print / Download Invoice
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setSelectedReceipt(null)}
              >
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
