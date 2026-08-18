'use client';

import React, { use } from 'react';
import { useTenant } from '@/lib/context/TenantContext';
import { Card, Button, Badge } from '@/components/ui';
import { 
  Users, CalendarCheck, CreditCard, ArrowLeft, Phone, Mail, 
  MapPin, ShieldAlert, CheckCircle2, Clock, Calendar 
} from 'lucide-react';
import Link from 'next/link';

export default function MemberProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { members, plans, attendance, payments } = useTenant();

  const member = members.find((m) => m.id === id);

  if (!member) {
    return (
      <div className="space-y-6">
        <Link href="/members">
          <Button variant="outline" size="sm" icon={<ArrowLeft className="w-4 h-4" />}>
            Back to Directory
          </Button>
        </Link>
        <Card className="p-8 text-center text-slate-500">
          <p>Member profile not found in your gym's tenant scope.</p>
        </Card>
      </div>
    );
  }

  const currentPlan = plans.find((p) => p.id === member.membership_plan_id);
  const memberAttendance = attendance.filter((a) => a.member_id === member.id);
  const memberPayments = payments.filter((p) => p.member_id === member.id);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Back Button & Header */}
      <div className="flex items-center justify-between">
        <Link href="/members">
          <Button variant="outline" size="sm" icon={<ArrowLeft className="w-4 h-4" />}>
            Back to Directory
          </Button>
        </Link>

        <Badge variant={member.status === 'active' ? 'emerald' : member.status === 'expiring_soon' ? 'amber' : 'rose'}>
          {member.status.toUpperCase().replace('_', ' ')}
        </Badge>
      </div>

      {/* Member Hero Header */}
      <Card className="p-6 md:p-8 flex flex-col md:flex-row items-center md:items-start gap-6 border-slate-200 shadow-sm">
        <div className="w-24 h-24 rounded-2xl bg-slate-100 overflow-hidden shrink-0 border-2 border-emerald-200">
          {member.profile_photo ? (
            <img src={member.profile_photo} alt={member.full_name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center font-black text-2xl text-emerald-700">
              {member.full_name.charAt(0)}
            </div>
          )}
        </div>

        <div className="flex-1 text-center md:text-left space-y-2">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
            <div>
              <h1 className="text-2xl font-black text-slate-900">{member.full_name}</h1>
              <p className="text-xs font-mono font-bold text-emerald-700 mt-0.5">Code: {member.member_code}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 text-xs text-slate-600">
            <div className="flex items-center justify-center md:justify-start gap-2">
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              <span>{member.phone || 'No phone'}</span>
            </div>
            <div className="flex items-center justify-center md:justify-start gap-2">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              <span>{member.email || 'No email'}</span>
            </div>
            <div className="flex items-center justify-center md:justify-start gap-2">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span>{member.address || 'No address'}</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Grid: Plan Overview & Emergency Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 md:col-span-2 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-3">
            <Calendar className="w-4 h-4 text-emerald-600" />
            <span>Active Membership Details</span>
          </h3>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <p className="text-slate-500 font-semibold">Active Plan</p>
              <p className="text-sm font-bold text-slate-900 mt-1">{currentPlan?.name || 'Standard Plan'}</p>
            </div>
            <div>
              <p className="text-slate-500 font-semibold">Monthly Price</p>
              <p className="text-sm font-black text-emerald-700 mt-1">₹{currentPlan?.price || '0.00'}</p>
            </div>
            <div>
              <p className="text-slate-500 font-semibold">Start Date</p>
              <p className="text-sm font-medium text-slate-800 mt-1">{member.membership_start || 'N/A'}</p>
            </div>
            <div>
              <p className="text-slate-500 font-semibold">Expiration Date</p>
              <p className="text-sm font-bold text-amber-700 mt-1">{member.membership_end || 'N/A'}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-3">
            <ShieldAlert className="w-4 h-4 text-rose-600" />
            <span>Emergency & Notes</span>
          </h3>
          <div className="text-xs space-y-3">
            <div>
              <p className="text-slate-500 font-semibold">Emergency Contact</p>
              <p className="text-slate-800 font-medium mt-0.5">{member.emergency_contact || 'None specified'}</p>
            </div>
            <div>
              <p className="text-slate-500 font-semibold">Special Notes</p>
              <p className="text-slate-600 italic mt-0.5">{member.notes || 'No notes added.'}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Tabs: Attendance Log & Payments History */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance History */}
        <Card className="p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-3">
            <CalendarCheck className="w-4 h-4 text-emerald-600" />
            <span>Attendance History ({memberAttendance.length})</span>
          </h3>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {memberAttendance.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">No attendance check-ins logged.</p>
            ) : (
              memberAttendance.map((a) => (
                <div key={a.id} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-900">{a.attendance_date}</span>
                    <span className="text-[10px] text-slate-500 block">Method: {a.method}</span>
                  </div>
                  <span className="text-xs text-emerald-700 font-mono font-bold">
                    {new Date(a.check_in_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Payments History */}
        <Card className="p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-3">
            <CreditCard className="w-4 h-4 text-emerald-600" />
            <span>Payment Transactions ({memberPayments.length})</span>
          </h3>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {memberPayments.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">No payment transactions recorded.</p>
            ) : (
              memberPayments.map((p) => (
                <div key={p.id} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-900">{p.payment_date}</span>
                    <span className="text-[10px] text-slate-500 block">Txn: {p.transaction_id || 'N/A'} • {p.payment_method}</span>
                  </div>
                  <span className="font-black text-emerald-700 text-sm">₹{Number(p.amount).toFixed(2)}</span>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
