'use client';

import React, { useState } from 'react';
import { useTenant } from '@/lib/context/TenantContext';
import { Enquiry, EnquiryStatus } from '@/lib/types';
import { Card, Button, Input, Select, Badge, Modal } from '@/components/ui';
import { HelpCircle, Plus, UserCheck, Calendar, Phone, Mail, ArrowRight, Sparkles, CheckCircle2, Save } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function EnquiriesPage() {
  const { enquiries, staff, plans, addEnquiry, updateEnquiryStatus, convertEnquiryToMember } = useTenant();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedConvertEnquiry, setSelectedConvertEnquiry] = useState<Enquiry | null>(null);
  const [selectedPlanId, setSelectedPlanId] = useState(plans[0]?.id || '');
  
  // Track status drafts and save feedback
  const [statusDrafts, setStatusDrafts] = useState<Record<string, EnquiryStatus>>({});
  const [recentlySavedId, setRecentlySavedId] = useState<string | null>(null);
  const [statusToast, setStatusToast] = useState<{ type: 'success'; message: string } | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    source: 'walk_in' as const,
    follow_up_date: '',
    notes: '',
    assigned_staff_id: staff[0]?.id || '',
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    addEnquiry({
      name: formData.name,
      phone: formData.phone,
      email: formData.email,
      source: formData.source,
      status: 'new',
      follow_up_date: formData.follow_up_date,
      notes: formData.notes,
      assigned_staff_id: formData.assigned_staff_id,
    });

    setIsAddModalOpen(false);
    setFormData({ name: '', phone: '', email: '', source: 'walk_in', follow_up_date: '', notes: '', assigned_staff_id: staff[0]?.id || '' });
    
    setStatusToast({
      type: 'success',
      message: `New enquiry lead "${formData.name}" logged successfully.`,
    });
    setTimeout(() => setStatusToast(null), 3000);
  };

  const handleStatusChange = (enquiryId: string, newStatus: EnquiryStatus) => {
    setStatusDrafts((prev) => ({ ...prev, [enquiryId]: newStatus }));
  };

  const handleSaveStatus = (enquiry: Enquiry) => {
    const targetStatus = statusDrafts[enquiry.id] || enquiry.status;
    updateEnquiryStatus(enquiry.id, targetStatus);

    // Show instant visual confirmation
    setRecentlySavedId(enquiry.id);
    setStatusToast({
      type: 'success',
      message: `Pipeline status for ${enquiry.name} updated to "${targetStatus.toUpperCase()}"`,
    });

    setTimeout(() => setRecentlySavedId(null), 2500);
    setTimeout(() => setStatusToast(null), 3500);
  };

  const handleConvertConfirm = () => {
    if (!selectedConvertEnquiry) return;
    convertEnquiryToMember(selectedConvertEnquiry.id, selectedPlanId);
    confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
    setSelectedConvertEnquiry(null);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <HelpCircle className="w-6 h-6 text-emerald-600" />
            <span>Enquiry & Lead Funnel</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">Track prospective members, follow-ups, pipeline status, and 1-click lead conversions.</p>
        </div>

        <Button
          onClick={() => setIsAddModalOpen(true)}
          variant="primary"
          icon={<Plus className="w-4 h-4" />}
        >
          Add New Enquiry
        </Button>
      </div>

      {/* Success / Save Toast Feedback Banner */}
      {statusToast && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center justify-between shadow-2xs animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{statusToast.message}</span>
          </div>
          <button onClick={() => setStatusToast(null)} className="text-emerald-700 hover:text-emerald-900 font-bold">
            ✕
          </button>
        </div>
      )}

      {/* Pipeline Table */}
      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="p-4">Lead Name</th>
                <th className="p-4">Contact</th>
                <th className="p-4">Source</th>
                <th className="p-4">Follow-Up Date</th>
                <th className="p-4">Assigned Staff</th>
                <th className="p-4">Pipeline Status & Save</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/80">
              {enquiries.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    No lead enquiries logged.
                  </td>
                </tr>
              ) : (
                enquiries.map((e) => {
                  const currentDraftStatus = statusDrafts[e.id] || e.status;
                  const isModified = currentDraftStatus !== e.status;
                  const isSavedJustNow = recentlySavedId === e.id;

                  return (
                    <tr key={e.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4">
                        <p className="font-bold text-slate-900">{e.name}</p>
                        <p className="text-[10px] text-slate-500 italic">{e.notes || 'No notes'}</p>
                      </td>
                      <td className="p-4">
                        <p className="text-slate-800 font-medium">{e.phone || 'No phone'}</p>
                        <p className="text-[10px] text-slate-500">{e.email || 'No email'}</p>
                      </td>
                      <td className="p-4 capitalize text-slate-700 font-semibold">{e.source.replace('_', ' ')}</td>
                      <td className="p-4 text-amber-700 font-bold">{e.follow_up_date || 'N/A'}</td>
                      <td className="p-4 text-slate-800 font-medium">{e.assigned_staff_name || 'Unassigned'}</td>
                      
                      {/* PIPELINE STATUS + SAVE BUTTON */}
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <select
                            value={currentDraftStatus}
                            onChange={(ev) => handleStatusChange(e.id, ev.target.value as EnquiryStatus)}
                            className={`bg-white border rounded px-2.5 py-1 text-xs text-slate-900 focus:outline-none transition-colors shadow-2xs font-semibold cursor-pointer ${
                              isModified ? 'border-amber-400 ring-2 ring-amber-100' : 'border-slate-300 focus:border-emerald-600'
                            }`}
                          >
                            <option value="new">New</option>
                            <option value="contacted">Contacted</option>
                            <option value="interested">Interested</option>
                            <option value="trial">Trial</option>
                            <option value="converted">Converted</option>
                            <option value="lost">Lost</option>
                          </select>

                          {/* Save Button */}
                          <Button
                            size="sm"
                            variant={isModified ? 'primary' : 'secondary'}
                            onClick={() => handleSaveStatus(e)}
                            icon={isSavedJustNow ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Save className="w-3.5 h-3.5" />}
                          >
                            {isSavedJustNow ? 'Saved!' : 'Save'}
                          </Button>
                        </div>
                      </td>

                      <td className="p-4 text-right">
                        {e.status !== 'converted' ? (
                          <Button
                            size="sm"
                            variant="success"
                            onClick={() => setSelectedConvertEnquiry(e)}
                            icon={<UserCheck className="w-3.5 h-3.5" />}
                          >
                            Convert to Member
                          </Button>
                        ) : (
                          <Badge variant="emerald">Converted ✓</Badge>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add Lead Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Prospective Member Lead"
        description="Record walk-in or online lead information."
      >
        <form onSubmit={handleAddSubmit} className="space-y-4">
          <Input
            label="Lead Full Name *"
            placeholder="e.g. Robert Thorne"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Phone Number"
              placeholder="+91 98765 43250"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />

            <Input
              label="Email Address"
              type="email"
              placeholder="rthorne@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Lead Source"
              value={formData.source}
              onChange={(e: any) => setFormData({ ...formData, source: e.target.value })}
              options={[
                { label: 'Walk In', value: 'walk_in' },
                { label: 'Website', value: 'website' },
                { label: 'Referral', value: 'referral' },
                { label: 'Social Media', value: 'social_media' },
                { label: 'Other', value: 'other' },
              ]}
            />

            <Input
              label="Follow-Up Date"
              type="date"
              value={formData.follow_up_date}
              onChange={(e) => setFormData({ ...formData, follow_up_date: e.target.value })}
            />
          </div>

          <Select
            label="Assign to Staff Member"
            value={formData.assigned_staff_id}
            onChange={(e) => setFormData({ ...formData, assigned_staff_id: e.target.value })}
            options={staff.map((s) => ({ label: s.full_name, value: s.id }))}
          />

          <Input
            label="Notes & Interest Details"
            placeholder="e.g. Inquired about 1-on-1 personal training packages"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Save Lead Enquiry
            </Button>
          </div>
        </form>
      </Modal>

      {/* Convert Lead to Member Modal */}
      {selectedConvertEnquiry && (
        <Modal
          isOpen={!!selectedConvertEnquiry}
          onClose={() => setSelectedConvertEnquiry(null)}
          title={`Convert Lead: ${selectedConvertEnquiry.name}`}
          description="Transform this interested lead into an active gym member and record initial membership payment."
        >
          <div className="space-y-4">
            <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200 space-y-1 text-xs text-slate-800">
              <p className="font-bold text-slate-900">{selectedConvertEnquiry.name}</p>
              <p className="text-[11px] text-slate-600">Phone: {selectedConvertEnquiry.phone || 'N/A'} • Email: {selectedConvertEnquiry.email || 'N/A'}</p>
              <p className="text-[11px] text-emerald-800 font-semibold">Notes: {selectedConvertEnquiry.notes || 'None'}</p>
            </div>

            <Select
              label="Select Membership Plan for Member *"
              value={selectedPlanId}
              onChange={(e) => setSelectedPlanId(e.target.value)}
              options={plans.map((p) => ({ label: `${p.name} (₹${p.price}) - ${p.duration_months} Months`, value: p.id }))}
            />

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
              <Button type="button" variant="outline" onClick={() => setSelectedConvertEnquiry(null)}>
                Cancel
              </Button>
              <Button type="button" variant="success" onClick={handleConvertConfirm} icon={<Sparkles className="w-4 h-4" />}>
                Confirm & Convert Member
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
