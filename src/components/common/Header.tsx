'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/context/AuthContext';
import { useTenant } from '@/lib/context/TenantContext';
import { Badge, Button, Modal } from '@/components/ui';
import { 
  Bell, User, LogOut, Shield, Building2, UserCheck, ChevronDown, CheckCircle2, Menu 
} from 'lucide-react';
import Link from 'next/link';

interface HeaderProps {
  onToggleMobileMenu?: () => void;
}

export function Header({ onToggleMobileMenu }: HeaderProps) {
  const { profile, currentGym, impersonatedGym, logout, loginAsDemoUser, allDemoProfiles } = useAuth();
  const { notifications, markNotificationRead } = useTenant();

  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const notifRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const activeGymName = impersonatedGym ? impersonatedGym.name : currentGym ? currentGym.name : 'NestBeans Platform';
  const unreadNotifs = notifications.filter((n) => !n.read_status);

  return (
    <header className="h-16 bg-white/90 border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-40 backdrop-blur-md">
      {/* Left Section: Mobile Menu Toggle + Gym Indicator */}
      <div className="flex items-center gap-3">
        {onToggleMobileMenu && (
          <button
            onClick={onToggleMobileMenu}
            className="md:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors shrink-0 cursor-pointer"
            title="Open Navigation Menu"
          >
            <Menu className="w-5.5 h-5.5" />
          </button>
        )}

        <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 font-bold shrink-0 shadow-2xs">
          <Building2 className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 truncate">
            <span className="truncate">{activeGymName}</span>
            {profile?.role === 'superadmin' && !impersonatedGym && (
              <Badge variant="indigo">Platform</Badge>
            )}
          </h2>
          <p className="text-xs text-slate-500 font-normal truncate hidden sm:block">
            <span>Workspace:</span> <span className="font-semibold text-slate-700">{activeGymName}</span>
          </p>
        </div>
      </div>

      {/* Right Action Bar */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Quick Account Switcher */}
        <button
          onClick={() => setIsDemoModalOpen(true)}
          className="flex items-center gap-2 px-2.5 sm:px-3.5 py-2 bg-slate-100/90 hover:bg-slate-200/80 border border-slate-200 text-xs text-slate-700 font-medium rounded-xl transition-all cursor-pointer shadow-2xs"
        >
          <UserCheck className="w-4 h-4 text-blue-600 shrink-0" />
          <span className="hidden sm:inline">Switch Account</span>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        </button>

        {/* Notifications Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors relative cursor-pointer"
          >
            <Bell className="w-5 h-5" />
            {unreadNotifs.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-white" />
            )}
          </button>

          {isNotifOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-2xl shadow-xl p-4 z-50 animate-fadeIn">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Notifications</h4>
                <span className="text-xs text-blue-600 font-bold">{unreadNotifs.length} Unread</span>
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-4">No notifications</p>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => markNotificationRead(n.id)}
                      className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-colors ${
                        n.read_status ? 'bg-slate-50 border-slate-100 text-slate-500' : 'bg-blue-50/50 border-blue-200 text-slate-900 font-medium'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-slate-900">{n.title}</span>
                        {!n.read_status && <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />}
                      </div>
                      <p className="text-[11px] text-slate-600">{n.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Pill & Logout */}
        <div className="flex items-center gap-3 pl-2 sm:pl-3 border-l border-slate-200">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-slate-800 hidden sm:inline-block truncate max-w-[120px]">{profile?.full_name}</span>
            <span className="px-2.5 py-0.5 bg-blue-600 text-white rounded-md text-xs font-semibold capitalize tracking-wide shadow-2xs">
              {profile?.role || 'Admin'}
            </span>
          </div>

          <button
            onClick={logout}
            title="Log Out Session"
            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
          >
            <LogOut className="w-4.5 h-4.5" />
          </button>
        </div>
      </div>

      {/* Account Switcher Modal */}
      <Modal
        isOpen={isDemoModalOpen}
        onClose={() => setIsDemoModalOpen(false)}
        title="Switch Account (Demo RLS)"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600">
            Select a tenant account profile to test real-time Row-Level Security isolation.
          </p>

          <div className="space-y-2 max-h-80 overflow-y-auto">
            {allDemoProfiles.map((p) => {
              const isSelected = profile?.id === p.id;
              return (
                <div
                  key={p.id}
                  onClick={() => {
                    loginAsDemoUser(p.email);
                    setIsDemoModalOpen(false);
                  }}
                  className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                    isSelected 
                      ? 'bg-blue-50 border-blue-300 ring-2 ring-blue-500/20' 
                      : 'bg-white border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="space-y-0.5">
                    <p className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <span>{p.full_name}</span>
                      <span className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-600 font-bold uppercase rounded-md">
                        {p.role}
                      </span>
                    </p>
                    <p className="text-xs text-slate-500">{p.email}</p>
                  </div>

                  {isSelected && <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0" />}
                </div>
              );
            })}
          </div>
        </div>
      </Modal>
    </header>
  );
}
