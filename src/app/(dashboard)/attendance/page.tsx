'use client';

import React, { useState } from 'react';
import { useTenant } from '@/lib/context/TenantContext';
import { useAuth } from '@/lib/context/AuthContext';
import { Card, Button, Input, Modal, Badge } from '@/components/ui';
import { 
  CalendarCheck, QrCode, Search, Plus, AlertCircle, CheckCircle2, 
  BarChart2, Clock, UserCheck, ShieldAlert, Sparkles, RefreshCw 
} from 'lucide-react';
import Link from 'next/link';

export default function AttendancePage() {
  const { attendance, members, recordAttendance } = useTenant();
  const { currentGym, impersonatedGym } = useAuth();

  const activeGym = impersonatedGym || currentGym;

  const [searchMemberId, setSearchMemberId] = useState('');
  const [selectedMethod, setSelectedMethod] = useState<'qr_code' | 'manual'>('qr_code');
  const [isCheckInModalOpen, setIsCheckInModalOpen] = useState(false);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);

  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleManualCheckIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchMemberId) return;

    const res = recordAttendance(searchMemberId.trim(), selectedMethod);
    if (res.success) {
      setStatusMessage({ type: 'success', text: res.message });
      setSearchMemberId('');
      setIsCheckInModalOpen(false);
    } else {
      setStatusMessage({ type: 'error', text: res.message });
    }
  };

  const simulateQRScan = (memberIdOrCode: string) => {
    const res = recordAttendance(memberIdOrCode, 'qr_code');
    if (res.success) {
      setStatusMessage({ type: 'success', text: res.message });
      setIsQRModalOpen(false);
    } else {
      setStatusMessage({ type: 'error', text: res.message });
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <CalendarCheck className="w-6 h-6 text-emerald-600" />
            <span>Gym Attendance Tracking</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">Single QR code gym verification & real-time member check-in log.</p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            onClick={() => setIsQRModalOpen(true)}
            variant="secondary"
            icon={<QrCode className="w-4 h-4 text-emerald-600" />}
          >
            Display Gym QR
          </Button>

          <Button
            onClick={() => setIsCheckInModalOpen(true)}
            variant="primary"
            icon={<Plus className="w-4 h-4" />}
          >
            Log Check-In
          </Button>
        </div>
      </div>

      {/* Status Feedback Banner */}
      {statusMessage && (
        <div
          className={`p-4 rounded-xl border text-xs font-semibold flex items-center justify-between animate-fadeIn ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {statusMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" /> : <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />}
            <span>{statusMessage.text}</span>
          </div>
          <button onClick={() => setStatusMessage(null)} className="text-slate-400 hover:text-slate-700">
            ✕
          </button>
        </div>
      )}

      {/* Attendance Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Today's Check-Ins</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">{attendance.length}</h3>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
            <UserCheck className="w-5 h-5" />
          </div>
        </Card>

        <Card className="p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">QR Code Scans</p>
            <h3 className="text-2xl font-black text-sky-700 mt-1">
              {attendance.filter((a) => a.method === 'qr_code').length}
            </h3>
          </div>
          <div className="w-10 h-10 rounded-lg bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-600">
            <QrCode className="w-5 h-5" />
          </div>
        </Card>

        <Card className="p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Manual Logs</p>
            <h3 className="text-2xl font-black text-amber-700 mt-1">
              {attendance.filter((a) => a.method === 'manual').length}
            </h3>
          </div>
          <div className="w-10 h-10 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
            <Clock className="w-5 h-5" />
          </div>
        </Card>
      </div>

      {/* Attendance Log Table */}
      <Card className="p-0 overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Today's Attendance Register</h3>
          <span className="text-xs text-slate-500 font-mono font-medium">Tenant: {activeGym?.name}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="p-4">Member Name</th>
                <th className="p-4">Member Code</th>
                <th className="p-4">Check-In Time</th>
                <th className="p-4">Verification Method</th>
                <th className="p-4">Tenant Scope Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/80">
              {attendance.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400">
                    No check-ins logged for today yet.
                  </td>
                </tr>
              ) : (
                attendance.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-bold text-slate-900">{a.member_name || 'Member'}</td>
                    <td className="p-4 font-mono font-bold text-emerald-700">{a.member_code || 'CODE'}</td>
                    <td className="p-4 font-mono text-slate-700 font-medium">
                      {new Date(a.check_in_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </td>
                    <td className="p-4">
                      <Badge variant={a.method === 'qr_code' ? 'emerald' : 'sky'}>
                        {a.method.toUpperCase().replace('_', ' ')}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <span className="text-emerald-700 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Gym Verification Passed</span>
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Log Check-In Modal */}
      <Modal
        isOpen={isCheckInModalOpen}
        onClose={() => setIsCheckInModalOpen(false)}
        title="Check-In Member"
        description="Enter member code or select a member from this gym to verify and log attendance."
      >
        <form onSubmit={handleManualCheckIn} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Select Gym Member *
            </label>
            <select
              value={searchMemberId}
              onChange={(e) => setSearchMemberId(e.target.value)}
              className="w-full p-3 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-emerald-600"
              required
            >
              <option value="">-- Choose Member from {activeGym?.name} --</option>
              {members.map((m) => (
                <option key={m.id} value={m.member_code}>
                  {m.full_name} ({m.member_code}) - Status: {m.status}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <Button type="button" variant="outline" onClick={() => setIsCheckInModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Verify & Check-In
            </Button>
          </div>
        </form>
      </Modal>

      {/* Gym Single QR Display & Scan Simulation Modal */}
      <Modal
        isOpen={isQRModalOpen}
        onClose={() => setIsQRModalOpen(false)}
        title={`${activeGym?.name} - Member Entrance QR Code`}
        description="Place this QR code at your gym front desk. Members scan this QR to open their mobile attendance portal."
        maxWidth="md"
      >
        <div className="space-y-6 text-center">
          {/* Generated QR Card */}
          <div className="bg-slate-900 p-6 rounded-2xl inline-block shadow-2xl border-4 border-emerald-600/30">
            <div className="w-56 h-56 bg-white flex flex-col items-center justify-center text-slate-900 rounded-xl p-4 space-y-2">
              <QrCode className="w-28 h-28 text-slate-900" />
              <p className="text-[10px] font-mono tracking-wider text-emerald-700 font-extrabold break-all">
                /attendance/{activeGym?.slug}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs text-slate-600">
              Scans directly to: <strong className="text-emerald-700 font-bold font-mono">/attendance/{activeGym?.slug}</strong>
            </p>
            <div className="flex justify-center gap-2">
              <Link href={`/attendance/${activeGym?.slug || 'btc-gym'}`} target="_blank">
                <Button size="sm" variant="primary" icon={<Sparkles className="w-3.5 h-3.5" />}>
                  Open Member Portal
                </Button>
              </Link>
            </div>
          </div>

          {/* Quick Simulation Scanner Buttons */}
          <div className="pt-4 border-t border-slate-200 text-left space-y-2">
            <p className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Simulate Member QR Check-In</span>
            </p>
            <div className="grid grid-cols-1 gap-2">
              {members.map((m) => (
                <button
                  key={m.id}
                  onClick={() => simulateQRScan(m.member_code)}
                  className="p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-left text-xs flex items-center justify-between text-slate-800 cursor-pointer shadow-2xs"
                >
                  <div>
                    <span className="font-bold text-slate-900">{m.full_name}</span>
                    <span className="text-[10px] text-slate-500 block font-mono font-medium">{m.member_code}</span>
                  </div>
                  <Badge variant="emerald">Simulate Scan</Badge>
                </button>
              ))}
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
