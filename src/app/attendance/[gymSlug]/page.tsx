'use client';

import React, { useState, use } from 'react';
import { useTenant } from '@/lib/context/TenantContext';
import { useAuth } from '@/lib/context/AuthContext';
import { Member, Attendance } from '@/lib/types';
import { Card, Button, Input, Badge } from '@/components/ui';
import { 
  Building2, CheckCircle2, AlertCircle, Clock, Calendar, 
  UserCheck, ArrowRight, RefreshCw, Sparkles, ShieldCheck, LogOut 
} from 'lucide-react';

export default function MemberAttendancePortalPage({ params }: { params: Promise<{ gymSlug: string }> }) {
  // Unwrap params using React.use() for Next.js 15 App Router
  const resolvedParams = use(params);
  const gymSlug = resolvedParams.gymSlug;

  const { members, attendance, recordAttendance, gyms } = useTenant();
  const { allGyms } = useAuth();

  // Combine gyms from TenantContext and AuthContext to ensure new gyms like Yuva Fitness resolve cleanly
  const combinedGyms = React.useMemo(() => {
    const list = [...gyms];
    allGyms.forEach((g) => {
      if (!list.some((existing) => existing.id === g.id)) {
        list.push(g);
      }
    });
    return list;
  }, [gyms, allGyms]);

  // Resolve target gym from URL slug (/attendance/btc, /attendance/btc-gym, /attendance/yuvafit etc.)
  const targetGym = React.useMemo(() => {
    const cleanSlug = gymSlug.toLowerCase().trim();
    return combinedGyms.find(
      (g) => g.slug.toLowerCase() === cleanSlug || g.slug.toLowerCase().replace(/-gym$/, '') === cleanSlug
    );
  }, [gymSlug, combinedGyms]);

  // Verification & Portal States
  const [searchInput, setSearchInput] = useState('');
  const [verifiedMember, setVerifiedMember] = useState<Member | null>(null);
  const [verificationError, setVerificationError] = useState<string | null>(null);

  // Check-In Action Result State
  const [checkInState, setCheckInState] = useState<{
    status: 'idle' | 'success' | 'duplicate' | 'expired' | 'error';
    message: string;
    checkInTime?: string;
  }>({ status: 'idle', message: '' });

  // Handle Member Verification Submission
  const handleVerifyMember = (e: React.FormEvent) => {
    e.preventDefault();
    setVerificationError(null);
    setCheckInState({ status: 'idle', message: '' });

    if (!searchInput.trim() || !targetGym) return;

    const query = searchInput.trim().toLowerCase();
    const cleanQueryPhone = query.replace(/\D/g, '');

    // Search members belonging ONLY to targetGym.id
    const found = members.find((m) => {
      if (m.gym_id !== targetGym.id) return false;

      const matchesCode = m.member_code.toLowerCase() === query;
      const matchesPhone = m.phone ? m.phone.replace(/\D/g, '').includes(cleanQueryPhone) && cleanQueryPhone.length >= 4 : false;
      const matchesEmail = m.email ? m.email.toLowerCase() === query : false;

      return matchesCode || matchesPhone || matchesEmail;
    });

    if (!found) {
      setVerificationError('Member not found. Please check your mobile number or member code.');
      return;
    }

    setVerifiedMember(found);
  };

  // Handle Check-In Button Tap
  const handleCheckInTap = () => {
    if (!verifiedMember || !targetGym) return;

    // 1. Check if membership is expired
    if (verifiedMember.status === 'expired') {
      setCheckInState({
        status: 'expired',
        message: 'Your membership has expired. Please contact the gym.',
      });
      return;
    }

    // 2. Execute Check-in with 15-minute duplicate throttling
    const res = recordAttendance(verifiedMember.id, 'qr', targetGym.id);

    if (res.success && res.record) {
      const formattedTime = new Date(res.record.check_in_time).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });

      setCheckInState({
        status: 'success',
        message: `Good workout, ${verifiedMember.full_name.split(' ')[0]}!`,
        checkInTime: formattedTime,
      });
    } else if (res.record) {
      // Already checked in within 15 minutes
      const formattedTime = new Date(res.record.check_in_time).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });

      setCheckInState({
        status: 'duplicate',
        message: 'Attendance already marked.',
        checkInTime: formattedTime,
      });
    } else {
      setCheckInState({
        status: 'error',
        message: res.message || 'Unable to record check-in. Please try again.',
      });
    }
  };

  // Compute Statistics for Verified Member
  const memberAttendanceHistory = React.useMemo(() => {
    if (!verifiedMember) return [];
    return attendance
      .filter((a) => a.member_id === verifiedMember.id)
      .sort((a, b) => new Date(b.check_in_time).getTime() - new Date(a.check_in_time).getTime());
  }, [verifiedMember, attendance]);

  const stats = React.useMemo(() => {
    if (!verifiedMember) return { total: 0, thisMonth: 0, lastMonth: 0 };

    const total = memberAttendanceHistory.length;

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonth = lastMonthDate.getMonth();
    const lastMonthYear = lastMonthDate.getFullYear();

    let thisMonth = 0;
    let lastMonthCount = 0;

    memberAttendanceHistory.forEach((rec) => {
      const d = new Date(rec.check_in_time);
      if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
        thisMonth++;
      } else if (d.getMonth() === lastMonth && d.getFullYear() === lastMonthYear) {
        lastMonthCount++;
      }
    });

    return { total, thisMonth, lastMonth: lastMonthCount };
  }, [verifiedMember, memberAttendanceHistory]);

  // Helper for Formatting Date Labels in Recent Attendance (Today, Yesterday, Aug 14)
  const formatAttendanceDate = (isoString: string) => {
    const d = new Date(isoString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    const isToday = d.toDateString() === today.toDateString();
    const isYesterday = d.toDateString() === yesterday.toDateString();

    const timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });

    if (isToday) return { label: 'Today', time: timeStr };
    if (isYesterday) return { label: 'Yesterday', time: timeStr };

    const monthStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return { label: monthStr, time: timeStr };
  };

  // If Gym Slug in URL is invalid
  if (!targetGym) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center mb-4 border border-rose-500/30">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h1 className="text-xl font-extrabold tracking-tight">Gym Not Found</h1>
        <p className="text-xs text-slate-400 mt-2 max-w-xs">
          The requested gym slug <code className="text-emerald-400 font-mono font-bold">/{gymSlug}</code> is not registered on NestBeans Platform.
        </p>
        <p className="text-[11px] text-slate-500 mt-4">Please scan a valid gym entrance QR code.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col items-center justify-between p-4 sm:p-6 font-sans select-none">
      <div className="w-full max-w-md mx-auto space-y-6 animate-fadeIn">
        {/* Top Gym Header */}
        <div className="text-center pt-2 pb-1 space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white font-black text-2xl flex items-center justify-center shadow-lg shadow-emerald-600/20 mx-auto">
            {targetGym.name.charAt(0)}
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">{targetGym.name}</h1>
            <p className="text-[11px] text-emerald-700 font-bold uppercase tracking-widest mt-0.5">
              Member Attendance Portal
            </p>
          </div>
        </div>

        {/* STEP 1: MEMBER VERIFICATION FORM */}
        {!verifiedMember ? (
          <Card className="p-6 shadow-xl border-slate-200/80 space-y-5 bg-white rounded-3xl">
            <div className="text-center space-y-1">
              <h2 className="text-base font-extrabold text-slate-900">Verify Your Membership</h2>
              <p className="text-xs text-slate-500">Enter your registered mobile number or member code to check in.</p>
            </div>

            <form onSubmit={handleVerifyMember} className="space-y-4">
              <Input
                label="Registered Mobile or Member Code *"
                placeholder="e.g. +91 98765 43210 or BTC-1001"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                required
                className="text-center font-medium text-base py-3"
              />

              {verificationError && (
                <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{verificationError}</span>
                </div>
              )}

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full py-3.5 text-base font-extrabold shadow-lg shadow-emerald-600/20 rounded-2xl"
              >
                Verify & Continue <ArrowRight className="w-5 h-5 ml-1" />
              </Button>
            </form>

            {/* Quick Demo Hint */}
            <div className="pt-3 border-t border-slate-100 text-center">
              <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Quick Demo Verification</p>
              <div className="flex flex-wrap justify-center gap-1.5 mt-2">
                {members
                  .filter((m) => m.gym_id === targetGym.id)
                  .slice(0, 3)
                  .map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setSearchInput(m.member_code)}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-mono font-bold rounded-lg transition-colors cursor-pointer"
                    >
                      {m.member_code}
                    </button>
                  ))}
              </div>
            </div>
          </Card>
        ) : (
          /* STEP 2: MEMBER ATTENDANCE DASHBOARD */
          <div className="space-y-5 animate-fadeIn">
            {/* Member Profile Header Card */}
            <Card className="p-5 shadow-lg border-slate-200 bg-white rounded-3xl space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-black text-slate-900 tracking-tight">
                    Welcome, {verifiedMember.full_name}
                  </h2>
                  <p className="text-xs font-mono font-bold text-emerald-700 mt-0.5">
                    {verifiedMember.member_code}
                  </p>
                </div>

                <Badge
                  variant={
                    verifiedMember.status === 'active'
                      ? 'emerald'
                      : verifiedMember.status === 'expiring_soon'
                      ? 'amber'
                      : 'rose'
                  }
                >
                  Membership: {verifiedMember.status.replace('_', ' ').toUpperCase()}
                </Badge>
              </div>
            </Card>

            {/* Three Simple Statistics Cards */}
            <div className="grid grid-cols-3 gap-2.5">
              {/* TOTAL ATTENDANCE */}
              <div className="bg-white border border-slate-200 rounded-2xl p-3 text-center shadow-xs flex flex-col justify-between min-h-[90px]">
                <p className="text-[9px] font-extrabold text-slate-500 uppercase tracking-wider">TOTAL</p>
                <h3 className="text-2xl font-black text-slate-900">{stats.total}</h3>
                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-tight">ATTENDANCE</p>
              </div>

              {/* THIS MONTH */}
              <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-3 text-center shadow-xs flex flex-col justify-between min-h-[90px]">
                <p className="text-[9px] font-extrabold text-emerald-800 uppercase tracking-wider">THIS MONTH</p>
                <h3 className="text-2xl font-black text-emerald-700">{stats.thisMonth}</h3>
                <p className="text-[8px] font-bold text-emerald-600 uppercase tracking-tight">ATTENDANCE</p>
              </div>

              {/* LAST MONTH */}
              <div className="bg-white border border-slate-200 rounded-2xl p-3 text-center shadow-xs flex flex-col justify-between min-h-[90px]">
                <p className="text-[9px] font-extrabold text-slate-500 uppercase tracking-wider">LAST MONTH</p>
                <h3 className="text-2xl font-black text-slate-700">{stats.lastMonth}</h3>
                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-tight">ATTENDANCE</p>
              </div>
            </div>

            {/* CHECK-IN ACTION RESULTS DISPLAY */}
            {checkInState.status === 'success' && (
              <div className="p-5 rounded-3xl bg-emerald-500 text-white shadow-xl space-y-2 text-center animate-fadeIn">
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-lg font-black tracking-tight">✓ Attendance Marked</h3>
                <p className="text-xs font-semibold text-emerald-100">{checkInState.message}</p>
                <p className="text-xs font-mono font-bold pt-1 text-emerald-50">
                  Check-in time: <span className="underline">{checkInState.checkInTime}</span>
                </p>
              </div>
            )}

            {checkInState.status === 'duplicate' && (
              <div className="p-5 rounded-3xl bg-amber-500 text-white shadow-xl space-y-2 text-center animate-fadeIn">
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center mx-auto">
                  <Clock className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-lg font-black tracking-tight">Attendance Already Marked</h3>
                <p className="text-xs font-semibold text-amber-100">
                  You have already checked in recently.
                </p>
                {checkInState.checkInTime && (
                  <p className="text-xs font-mono font-bold pt-1 text-amber-50">
                    Previous check-in time: <span className="underline">{checkInState.checkInTime}</span>
                  </p>
                )}
              </div>
            )}

            {checkInState.status === 'expired' && (
              <div className="p-5 rounded-3xl bg-rose-500 text-white shadow-xl space-y-2 text-center animate-fadeIn">
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center mx-auto">
                  <AlertCircle className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-lg font-black tracking-tight">Membership Expired</h3>
                <p className="text-xs font-semibold text-rose-100">{checkInState.message}</p>
              </div>
            )}

            {/* MAIN CHECK IN BUTTON (Large & Easy to Press) */}
            <button
              type="button"
              onClick={handleCheckInTap}
              className="w-full py-5 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-black text-xl rounded-3xl shadow-xl shadow-emerald-600/30 flex items-center justify-center gap-3 transition-all cursor-pointer border-2 border-emerald-400/40"
            >
              <CheckCircle2 className="w-7 h-7" />
              <span>✓ CHECK IN</span>
            </button>

            {/* RECENT ATTENDANCE HISTORY LIST */}
            <Card className="p-5 shadow-sm border-slate-200 bg-white rounded-3xl space-y-3">
              <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2.5 flex items-center justify-between">
                <span>Recent Attendance</span>
                <span className="text-[10px] text-slate-400 font-semibold">{memberAttendanceHistory.length} Total</span>
              </h3>

              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {memberAttendanceHistory.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-4">No attendance records yet.</p>
                ) : (
                  memberAttendanceHistory.map((rec) => {
                    const formatted = formatAttendanceDate(rec.check_in_time);
                    return (
                      <div
                        key={rec.id}
                        className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs"
                      >
                        <span className="font-bold text-slate-800">{formatted.label}</span>
                        <span className="font-mono font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200/60">
                          {formatted.time}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            </Card>

            {/* Switch Account Option */}
            <div className="text-center pt-1 pb-4">
              <button
                type="button"
                onClick={() => {
                  setVerifiedMember(null);
                  setSearchInput('');
                  setCheckInState({ status: 'idle', message: '' });
                }}
                className="text-xs text-slate-400 hover:text-slate-700 font-medium transition-colors cursor-pointer flex items-center justify-center gap-1 mx-auto"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Not {verifiedMember.full_name.split(' ')[0]}? Switch Member</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer Branding */}
      <footer className="text-center text-[10px] text-slate-400 pt-6 pb-2 font-mono">
        POWERED BY NESTBEANS GYM CRM • TENANT SECURED
      </footer>
    </div>
  );
}
