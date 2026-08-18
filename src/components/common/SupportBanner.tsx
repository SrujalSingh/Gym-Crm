'use client';

import React from 'react';
import { useAuth } from '@/lib/context/AuthContext';
import { ShieldAlert, X } from 'lucide-react';

export function SupportBanner() {
  const { profile, impersonatedGym, impersonateGym } = useAuth();

  if (profile?.role !== 'superadmin' || !impersonatedGym) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-amber-600 via-amber-700 to-amber-600 text-amber-95 px-4 py-2 text-xs font-semibold flex items-center justify-between shadow-md border-b border-amber-500/30">
      <div className="flex items-center gap-2 text-white">
        <ShieldAlert className="w-4 h-4 shrink-0 text-amber-200 animate-pulse" />
        <span>
          <strong>SUPERADMIN SUPPORT MODE ACTIVE:</strong> You are currently viewing data for{' '}
          <span className="underline decoration-amber-300 font-bold">{impersonatedGym.name}</span> ({impersonatedGym.slug}).
        </span>
      </div>
      <button
        onClick={() => impersonateGym(null)}
        className="flex items-center gap-1 bg-black/30 hover:bg-black/50 text-white px-2.5 py-1 rounded transition-colors"
      >
        <span>Exit Support View</span>
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
