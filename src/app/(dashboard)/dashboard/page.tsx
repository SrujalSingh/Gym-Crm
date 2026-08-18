'use client';

import React from 'react';
import { useAuth } from '@/lib/context/AuthContext';
import { useTenant } from '@/lib/context/TenantContext';
import { Card, Button, Badge } from '@/components/ui';
import { 
  Users, UserCheck, CalendarCheck, DollarSign, Clock, AlertTriangle, 
  HelpCircle, TrendingUp, Plus, QrCode, CreditCard, ArrowRight, ShieldCheck 
} from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const { profile, currentGym, impersonatedGym } = useAuth();
  const { members, attendance, payments, enquiries } = useTenant();

  const activeGym = impersonatedGym || currentGym;

  // Calculate Gym Dashboard Metrics (Always filtered by current gym_id)
  const totalMembersCount = members.length;
  const activeMembersCount = members.filter((m) => m.status === 'active').length;
  const expiringMembers = members.filter((m) => m.status === 'expiring_soon');
  
  const todayStr = new Date().toISOString().split('T')[0];
  const todayAttendanceCount = attendance.filter((a) => a.attendance_date === todayStr).length;

  const todayRevenue = payments
    .filter((p) => p.payment_date === todayStr && p.status === 'paid')
    .reduce((sum, p) => sum + Number(p.amount), 0);

  const monthlyRevenue = payments
    .filter((p) => p.status === 'paid')
    .reduce((sum, p) => sum + Number(p.amount), 0);

  const newEnquiriesCount = enquiries.filter((e) => e.status === 'new' || e.status === 'contacted').length;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>Welcome back, {profile?.full_name}</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time multi-tenant operations overview for <span className="text-indigo-600 font-bold">{activeGym?.name}</span>.
          </p>
        </div>

        {/* Quick Actions Bar */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <Link href="/members">
            <button className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer">
              <Plus className="w-4 h-4" />
              <span>Add Member</span>
            </button>
          </Link>
          <Link href="/attendance">
            <button className="px-3.5 py-2 bg-cyan-50 hover:bg-cyan-100 text-cyan-800 border border-cyan-200 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs">
              <QrCode className="w-4 h-4 text-cyan-600" />
              <span>QR Attendance</span>
            </button>
          </Link>
          <Link href="/payments">
            <button className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs">
              <CreditCard className="w-4 h-4 text-indigo-600" />
              <span>Record Payment</span>
            </button>
          </Link>
        </div>
      </div>

      {/* Primary Metrics Grid (4 KPI Cards with Multi-Accent Palettes) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Stat 1: Total Members (Indigo Accent) */}
        <Card className="flex items-center justify-between p-5 border-slate-200/90 hover:border-indigo-300 transition-all shadow-xs group">
          <div>
            <p className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Total Members</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">{totalMembersCount}</h3>
            <p className="text-[11px] text-indigo-700 mt-1 flex items-center gap-1 font-bold">
              <UserCheck className="w-3.5 h-3.5 text-indigo-600" />
              <span>{activeMembersCount} Active Subscriptions</span>
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-200/80 flex items-center justify-center text-indigo-600 shadow-2xs group-hover:scale-105 transition-transform">
            <Users className="w-6 h-6" />
          </div>
        </Card>

        {/* Stat 2: Today Check-Ins (Cyan Accent) */}
        <Card className="flex items-center justify-between p-5 border-slate-200/90 hover:border-cyan-300 transition-all shadow-xs group">
          <div>
            <p className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Today Check-Ins</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">{todayAttendanceCount}</h3>
            <p className="text-[11px] text-cyan-700 mt-1 flex items-center gap-1 font-bold">
              <Clock className="w-3.5 h-3.5 text-cyan-600" />
              <span>Single Gym QR Verified</span>
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-cyan-50 border border-cyan-200/80 flex items-center justify-center text-cyan-600 shadow-2xs group-hover:scale-105 transition-transform">
            <CalendarCheck className="w-6 h-6" />
          </div>
        </Card>

        {/* Stat 3: Today Revenue (Emerald Accent) */}
        <Card className="flex items-center justify-between p-5 border-slate-200/90 hover:border-emerald-300 transition-all shadow-xs group">
          <div>
            <p className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Today Revenue</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">₹{todayRevenue.toFixed(2)}</h3>
            <p className="text-[11px] text-emerald-700 mt-1 flex items-center gap-1 font-bold">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
              <span>₹{monthlyRevenue.toFixed(2)} Total Revenue</span>
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-emerald-600 shadow-2xs group-hover:scale-105 transition-transform">
            <DollarSign className="w-6 h-6" />
          </div>
        </Card>

        {/* Stat 4: Active Leads (Amber Accent) */}
        <Card className="flex items-center justify-between p-5 border-slate-200/90 hover:border-amber-300 transition-all shadow-xs group">
          <div>
            <p className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Active Leads</p>
            <h3 className="text-2xl font-black text-amber-700 mt-1">{newEnquiriesCount}</h3>
            <p className="text-[11px] text-amber-700 mt-1 flex items-center gap-1 font-bold">
              <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
              <span>Enquiry Funnel Pipeline</span>
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200/80 flex items-center justify-center text-amber-600 shadow-2xs group-hover:scale-105 transition-transform">
            <HelpCircle className="w-6 h-6" />
          </div>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Recent Check-ins & Payments Stream */}
        <div className="lg:col-span-2 space-y-6">
          {/* Today Attendance Stream */}
          <Card className="p-6 border-slate-200/90">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2 tracking-tight">
                  <CalendarCheck className="w-4 h-4 text-indigo-600" />
                  <span>Today's Check-In Activity</span>
                </h3>
                <p className="text-xs text-slate-500">Members currently checked in via QR / Manual verification</p>
              </div>
              <Link href="/attendance">
                <Button size="sm" variant="ghost" icon={<ArrowRight className="w-3.5 h-3.5" />}>
                  View All Log
                </Button>
              </Link>
            </div>

            <div className="mt-4 space-y-3">
              {attendance.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">No check-in records for today yet.</div>
              ) : (
                attendance.slice(0, 5).map((att) => (
                  <div key={att.id} className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/80 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 font-extrabold flex items-center justify-center text-xs">
                        {att.member_code?.slice(-2) || 'QR'}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900">{att.member_name}</p>
                        <p className="text-[10px] text-slate-500">{att.member_code} • Check-in via <span className="uppercase text-indigo-700 font-bold">{att.method}</span></p>
                      </div>
                    </div>
                    <span className="text-xs text-slate-600 font-mono font-bold">
                      {new Date(att.check_in_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* Recent Payment Stream */}
          <Card className="p-6 border-slate-200/90">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2 tracking-tight">
                  <CreditCard className="w-4 h-4 text-indigo-600" />
                  <span>Recent Payment Transactions</span>
                </h3>
                <p className="text-xs text-slate-500">Latest financial receipts recorded</p>
              </div>
              <Link href="/payments">
                <Button size="sm" variant="ghost" icon={<ArrowRight className="w-3.5 h-3.5" />}>
                  View Payments
                </Button>
              </Link>
            </div>

            <div className="mt-4 space-y-3">
              {payments.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">No payment records found.</div>
              ) : (
                payments.slice(0, 5).map((pay) => (
                  <div key={pay.id} className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/80 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-900">{pay.member_name || 'Member'}</p>
                      <p className="text-[10px] text-slate-500">{pay.plan_name || 'Membership'} • Method: <span className="uppercase font-semibold text-slate-700">{pay.payment_method}</span></p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-black text-slate-900">₹{Number(pay.amount).toFixed(2)}</p>
                      <span className="text-[10px] text-slate-400 font-mono">{pay.payment_date}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>

        {/* Right Col: Expiry Alerts & Security Status */}
        <div className="space-y-6">
          {/* Membership Expiry Alerts Widget */}
          <Card className="p-6 border-amber-200/80 bg-amber-50/20">
            <div className="flex items-center justify-between pb-4 border-b border-amber-100">
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Expiring Memberships</span>
              </h3>
              <Badge variant="amber">{expiringMembers.length} Alerts</Badge>
            </div>

            <div className="mt-4 space-y-3">
              {expiringMembers.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-4">No memberships expiring soon!</p>
              ) : (
                expiringMembers.map((m) => (
                  <div key={m.id} className="p-3 rounded-xl bg-white border border-amber-200 flex items-center justify-between shadow-2xs">
                    <div>
                      <p className="text-xs font-bold text-slate-900">{m.full_name}</p>
                      <p className="text-[10px] text-amber-700 font-bold">Expires: {m.membership_end}</p>
                    </div>
                    <Link href="/members">
                      <Button size="sm" variant="outline">
                        Renew
                      </Button>
                    </Link>
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* Multi-Tenant RLS Security Status Card */}
          <Card className="p-6 border-slate-200/90 bg-slate-50/80 space-y-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-indigo-600" />
              <h4 className="text-xs font-extrabold text-slate-900 tracking-wider uppercase">MULTI-TENANT RLS STATUS</h4>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Your active workspace is securely scoped to <span className="font-bold text-slate-900">{activeGym?.name}</span>. Cross-gym data access is strictly blocked by PostgreSQL RLS policies.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
