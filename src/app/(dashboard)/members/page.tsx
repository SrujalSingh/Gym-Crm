'use client';

import React, { useState } from 'react';
import { useTenant } from '@/lib/context/TenantContext';
import { useAuth } from '@/lib/context/AuthContext';
import { Member, MemberStatus } from '@/lib/types';
import { Card, Button, Input, Select, Badge, Modal } from '@/components/ui';
import { 
  Users, Search, Plus, Filter, UserCheck, AlertTriangle, XCircle, 
  Eye, Edit3, Trash2, ArrowUpRight, Phone, Mail 
} from 'lucide-react';
import Link from 'next/link';

export default function MembersPage() {
  const { members, plans, addMember, updateMember, deleteMember, addPlan } = useTenant();
  const { profile } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    member_code: '',
    full_name: '',
    phone: '',
    email: '',
    gender: 'male' as const,
    date_of_birth: '',
    address: '',
    membership_plan_id: plans[0]?.id || '',
    emergency_contact: '',
    notes: '',
  });

  const filteredMembers = members.filter((m) => {
    const matchesSearch =
      m.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.member_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.phone && m.phone.includes(searchQuery)) ||
      (m.email && m.email.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || m.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.full_name) return;

    let targetPlanId = formData.membership_plan_id || plans[0]?.id;
    let plan = plans.find((p) => p.id === targetPlanId);

    if (!plan) {
      // Auto-create default monthly plan for newly onboarded gym if no plan exists yet
      const defaultPlan = addPlan({
        name: 'Standard Monthly Pass',
        duration_months: 1,
        price: 1000,
        description: 'Standard 1-month gym membership',
        status: 'active',
      });
      targetPlanId = defaultPlan.id;
      plan = defaultPlan;
    }

    const startDate = new Date();
    const endDate = new Date(startDate);
    if (plan) endDate.setMonth(endDate.getMonth() + plan.duration_months);

    addMember({
      member_code: formData.member_code,
      full_name: formData.full_name,
      phone: formData.phone,
      email: formData.email,
      gender: formData.gender,
      date_of_birth: formData.date_of_birth,
      address: formData.address,
      joining_date: startDate.toISOString().split('T')[0],
      membership_plan_id: targetPlanId,
      membership_start: startDate.toISOString().split('T')[0],
      membership_end: endDate.toISOString().split('T')[0],
      status: 'active',
      emergency_contact: formData.emergency_contact,
      notes: formData.notes,
    });

    setIsAddModalOpen(false);
    setFormData({
      member_code: '',
      full_name: '',
      phone: '',
      email: '',
      gender: 'male',
      date_of_birth: '',
      address: '',
      membership_plan_id: '',
      emergency_contact: '',
      notes: '',
    });
  };

  const getStatusBadge = (status: MemberStatus) => {
    switch (status) {
      case 'active':
        return <Badge variant="emerald">Active</Badge>;
      case 'expiring_soon':
        return <Badge variant="amber">Expiring Soon</Badge>;
      case 'expired':
        return <Badge variant="rose">Expired</Badge>;
      case 'frozen':
        return <Badge variant="sky">Frozen</Badge>;
      default:
        return <Badge variant="zinc">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Title & Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-indigo-600" />
            <span>Member Directory</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">Manage gym memberships, member profiles, and status updates.</p>
        </div>

        <Button
          onClick={() => setIsAddModalOpen(true)}
          variant="primary"
          icon={<Plus className="w-4 h-4" />}
        >
          Add New Member
        </Button>
      </div>

      {/* Search & Filter Bar */}
      <Card className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-slate-200/90">
        <div className="w-full sm:w-80 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search by name, code, phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 shadow-2xs transition-all"
          />
        </div>

        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          {['all', 'active', 'expiring_soon', 'expired', 'frozen'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold capitalize whitespace-nowrap transition-all cursor-pointer ${
                statusFilter === st
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-transparent'
              }`}
            >
              {st.replace('_', ' ')}
            </button>
          ))}
        </div>
      </Card>

      {/* Members Table */}
      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="p-4">Member</th>
                <th className="p-4">Code</th>
                <th className="p-4">Contact</th>
                <th className="p-4">Plan & Expiry</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/80">
              {filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    No member records match the filter criteria.
                  </td>
                </tr>
              ) : (
                filteredMembers.map((m) => {
                  const plan = plans.find((p) => p.id === m.membership_plan_id);
                  return (
                    <tr key={m.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                            {m.profile_photo ? (
                              <img src={m.profile_photo} alt={m.full_name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center font-bold text-slate-500 text-xs">
                                {m.full_name.charAt(0)}
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 text-sm">{m.full_name}</p>
                            <p className="text-[10px] text-slate-400">Joined: {m.joining_date}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 font-mono font-bold text-indigo-600">{m.member_code}</td>
                      <td className="p-4">
                        <p className="text-slate-800 font-medium">{m.phone || 'N/A'}</p>
                        <p className="text-[10px] text-slate-500">{m.email || 'N/A'}</p>
                      </td>
                      <td className="p-4">
                        <p className="font-medium text-slate-800">{plan?.name || 'Standard'}</p>
                        <p className="text-[10px] text-slate-500">Expires: {m.membership_end || 'N/A'}</p>
                      </td>
                      <td className="p-4">{getStatusBadge(m.status)}</td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/members/${m.id}`}>
                            <Button size="sm" variant="ghost" icon={<Eye className="w-3.5 h-3.5" />}>
                              View
                            </Button>
                          </Link>
                          {profile?.role !== 'staff' && (
                            <button
                              onClick={() => deleteMember(m.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                              title="Delete Member"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add Member Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Register New Gym Member"
        description="Add a member to the current gym database."
        maxWidth="lg"
      >
        <form onSubmit={handleAddSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Full Name *"
              placeholder="e.g. Marcus Vance"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              required
            />

            <Input
              label="Member Code (Optional)"
              placeholder="Auto-generated if left blank"
              value={formData.member_code}
              onChange={(e) => setFormData({ ...formData, member_code: e.target.value })}
            />

            <Input
              label="Phone Number"
              placeholder="+91 98765 43210"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />

            <Input
              label="Email Address"
              type="email"
              placeholder="marcus@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />

            <Select
              label="Gender"
              value={formData.gender}
              onChange={(e: any) => setFormData({ ...formData, gender: e.target.value })}
              options={[
                { label: 'Male', value: 'male' },
                { label: 'Female', value: 'female' },
                { label: 'Other', value: 'other' },
              ]}
            />

            <Select
              label="Initial Membership Plan *"
              value={formData.membership_plan_id}
              onChange={(e) => setFormData({ ...formData, membership_plan_id: e.target.value })}
              options={
                plans.length > 0
                  ? plans.map((p) => ({ label: `${p.name} (₹${p.price})`, value: p.id }))
                  : [{ label: 'Standard Monthly Pass (₹1,000/mo - Default)', value: 'auto' }]
              }
            />
          </div>

          <Input
            label="Emergency Contact"
            placeholder="e.g. Elena Vance (+91 98765 43293)"
            value={formData.emergency_contact}
            onChange={(e) => setFormData({ ...formData, emergency_contact: e.target.value })}
          />

          <Input
            label="Notes / Special Instructions"
            placeholder="Medical conditions, fitness goals, etc."
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Create Member Profile
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
