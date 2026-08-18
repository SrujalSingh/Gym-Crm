'use client';

import React from 'react';
import { useAuth } from '@/lib/context/AuthContext';
import { Card, Badge } from '@/components/ui';
import { Users, ShieldCheck } from 'lucide-react';

export default function SuperadminUsersPage() {
  const { allDemoProfiles, allGyms } = useAuth();

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <Users className="w-6 h-6 text-emerald-600" />
          <span>Platform User Directory</span>
        </h1>
        <p className="text-xs text-slate-500 mt-1">Cross-gym user accounts, administrators, and staff profiles.</p>
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="p-4">User Name</th>
                <th className="p-4">Email</th>
                <th className="p-4">Role</th>
                <th className="p-4">Assigned Gym</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/80">
              {allDemoProfiles.map((p) => {
                const gym = allGyms.find((g) => g.id === p.gym_id);
                return (
                  <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-bold text-slate-900">{p.full_name}</td>
                    <td className="p-4 font-mono text-slate-600 font-medium">{p.email}</td>
                    <td className="p-4">
                      <Badge variant={p.role === 'superadmin' ? 'indigo' : p.role === 'admin' ? 'emerald' : 'zinc'}>
                        {p.role.toUpperCase()}
                      </Badge>
                    </td>
                    <td className="p-4 font-medium text-slate-800">{gym?.name || 'NestBeans Platform'}</td>
                    <td className="p-4">
                      <Badge variant={p.status === 'active' ? 'emerald' : 'rose'}>{p.status}</Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
