'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/context/AuthContext';
import { useTenant } from '@/lib/context/TenantContext';
import { Card, Button, Input, Badge } from '@/components/ui';
import { Settings, Building2, Sparkles, ShieldCheck } from 'lucide-react';

export default function SettingsPage() {
  const { currentGym, impersonatedGym } = useAuth();
  const { features } = useTenant();

  const activeGym = impersonatedGym || currentGym;

  const [formData, setFormData] = useState({
    name: activeGym?.name || '',
    phone: activeGym?.phone || '',
    email: activeGym?.email || '',
    address: activeGym?.address || '',
  });

  const [isSaved, setIsSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl animate-fadeIn">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <Settings className="w-6 h-6 text-emerald-600" />
          <span>Gym Profile & CRM Settings</span>
        </h1>
        <p className="text-xs text-slate-500 mt-1">Manage gym location details, contact info, and active module flags.</p>
      </div>

      {/* Gym Metadata Form */}
      <Card className="p-6 space-y-4">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3 flex items-center gap-2">
          <Building2 className="w-4 h-4 text-emerald-600" />
          <span>Gym Location Profile</span>
        </h3>

        <form onSubmit={handleSave} className="space-y-4">
          <Input
            label="Gym Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Phone Number"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />

            <Input
              label="Contact Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <Input
            label="Address"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          />

          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            {isSaved && <span className="text-xs text-emerald-700 font-bold">✓ Settings updated successfully</span>}
            <Button type="submit" variant="primary" className="ml-auto">
              Save Changes
            </Button>
          </div>
        </form>
      </Card>

      {/* Enabled Feature Flags Matrix */}
      <Card className="p-6 space-y-4">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-600" />
          <span>Enabled CRM Feature Flags</span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
          {features.map((f) => (
            <div key={f.id} className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between shadow-2xs">
              <span className="font-semibold text-slate-800 capitalize">{f.feature_key.replace('_', ' ')}</span>
              <Badge variant={f.enabled ? 'emerald' : 'zinc'}>{f.enabled ? 'Enabled' : 'Disabled'}</Badge>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
