'use client';

import React from 'react';
import { useTenant } from '@/lib/context/TenantContext';
import { Card, Button, Badge } from '@/components/ui';
import { Bell, CheckCircle2 } from 'lucide-react';

export default function NotificationsPage() {
  const { notifications, markNotificationRead } = useTenant();

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <Bell className="w-6 h-6 text-emerald-600" />
          <span>Notifications & Alerts</span>
        </h1>
        <p className="text-xs text-slate-500 mt-1">System reminders for expiring memberships, enquiries, and system updates.</p>
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="divide-y divide-slate-100">
          {notifications.length === 0 ? (
            <p className="p-8 text-center text-xs text-slate-400">No notifications found.</p>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => markNotificationRead(n.id)}
                className={`p-4 flex items-center justify-between transition-colors cursor-pointer ${
                  n.read_status ? 'bg-slate-50/50 text-slate-500' : 'bg-emerald-50/40 text-slate-900 font-medium'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900">{n.title}</span>
                    <Badge variant={n.type === 'expiry_alert' ? 'amber' : 'emerald'}>{n.type}</Badge>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">{n.message}</p>
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    {new Date(n.created_at).toLocaleString()}
                  </span>
                </div>
                {!n.read_status && <span className="w-2.5 h-2.5 bg-emerald-600 rounded-full" />}
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}
