'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/context/AuthContext';
import { useTenant } from '@/lib/context/TenantContext';
import { Gym, Profile } from '@/lib/types';
import { Card, Button, Input, Select, Modal, Badge, Switch } from '@/components/ui';
import { 
  Building, ShieldAlert, Plus, Users, KeyRound, Sparkles, 
  Eye, EyeOff, ScrollText, Ban, CheckCircle2, Copy, Check, Lock, Mail, Phone, Trash2 
} from 'lucide-react';

export default function SuperadminPage() {
  const { profile, impersonateGym, allDemoProfiles, addOrUpdateProfile } = useAuth();
  const { gyms, addGym, updateGymStatus, deleteGym, toggleGymFeature, features, auditLogs } = useTenant();

  const [isAddGymModalOpen, setIsAddGymModalOpen] = useState(false);
  const [selectedFeatureGym, setSelectedFeatureGym] = useState<Gym | null>(null);
  const [deletingGym, setDeletingGym] = useState<Gym | null>(null);

  // Credentials Portal State
  const [selectedCredentialsGym, setSelectedCredentialsGym] = useState<Gym | null>(null);
  const [showPasswordMap, setShowPasswordMap] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Assign New Account Credentials Form State
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [editingProfileId, setEditingProfileId] = useState<string | null>(null);
  const [formDataCredentials, setFormDataCredentials] = useState({
    full_name: '',
    email: '',
    password: '',
    phone: '',
    role: 'admin' as 'admin' | 'staff',
  });

  const [formDataGym, setFormDataGym] = useState({
    name: '',
    slug: '',
    email: '',
    phone: '',
    address: '',
    logo_url: '',
  });

  if (profile?.role !== 'superadmin') {
    return (
      <Card className="p-8 text-center space-y-3">
        <ShieldAlert className="w-8 h-8 text-rose-600 mx-auto" />
        <h2 className="text-lg font-bold text-slate-900">Superadmin Access Required</h2>
        <p className="text-xs text-slate-500">Only platform administrators can access the NestBeans Superadmin panel.</p>
      </Card>
    );
  }

  const activeGymsCount = gyms.filter((g) => g.status === 'active').length;
  const suspendedGymsCount = gyms.filter((g) => g.status === 'suspended').length;

  const handleCreateGym = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formDataGym.name || !formDataGym.slug) return;

    const newGym = addGym({
      name: formDataGym.name,
      slug: formDataGym.slug.toLowerCase().replace(/\s+/g, '-'),
      email: formDataGym.email,
      phone: formDataGym.phone,
      address: formDataGym.address,
      logo_url: formDataGym.logo_url,
      status: 'active',
    });

    // Auto-create initial Admin credentials for the newly onboarded gym (e.g. Yuva Fitness)
    const adminEmail = formDataGym.email || `admin@${newGym.slug}.com`;
    const adminPass = `${newGym.name.replace(/\s+/g, '')}@123`;
    
    addOrUpdateProfile({
      gym_id: newGym.id,
      full_name: `${newGym.name} Admin`,
      email: adminEmail,
      password: adminPass,
      phone: formDataGym.phone || '+91 98765 43210',
      role: 'admin',
      status: 'active',
    });

    setIsAddGymModalOpen(false);
    setFormDataGym({ name: '', slug: '', email: '', phone: '', address: '', logo_url: '' });

    // Open Credentials Manager immediately for the new gym
    setSelectedCredentialsGym(newGym);
  };

  const openCredentialsManager = (gym: Gym) => {
    setSelectedCredentialsGym(gym);
  };

  const openAssignModalForGym = (gym: Gym, existingProfile?: Profile) => {
    if (existingProfile) {
      setEditingProfileId(existingProfile.id);
      setFormDataCredentials({
        full_name: existingProfile.full_name,
        email: existingProfile.email,
        password: existingProfile.password || 'Pass@123',
        phone: existingProfile.phone || gym.phone || '',
        role: existingProfile.role === 'admin' ? 'admin' : 'staff',
      });
    } else {
      setEditingProfileId(null);
      setFormDataCredentials({
        full_name: `${gym.name} Staff`,
        email: `staff@${gym.slug}.com`,
        password: `${gym.name.replace(/\s+/g, '')}Staff@123`,
        phone: gym.phone || '+91 98765 43210',
        role: 'staff',
      });
    }
    setIsAssignModalOpen(true);
  };

  const handleSaveCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCredentialsGym || !formDataCredentials.email || !formDataCredentials.password) return;

    addOrUpdateProfile({
      id: editingProfileId || undefined,
      gym_id: selectedCredentialsGym.id,
      full_name: formDataCredentials.full_name,
      email: formDataCredentials.email,
      password: formDataCredentials.password,
      phone: formDataCredentials.phone,
      role: formDataCredentials.role,
      status: 'active',
    });

    setIsAssignModalOpen(false);
    setEditingProfileId(null);
  };

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789@#$';
    let pass = '';
    for (let i = 0; i < 10; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormDataCredentials({ ...formDataCredentials, password: pass });
  };

  const togglePasswordVisibility = (id: string) => {
    setShowPasswordMap((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div className="space-y-1">
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Building className="w-6 h-6 text-emerald-600" />
            <span>NestBeans Superadmin Dashboard</span>
          </h1>
          <p className="text-xs text-slate-500 font-normal">
            Platform management, tenant onboarding, login ID & password assignment, and cross-gym support.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() => setIsAddGymModalOpen(true)}
          icon={<Plus className="w-4 h-4" />}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold"
        >
          Onboard New Gym
        </Button>
      </div>

      {/* Overview Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Total Onboarded Gyms</span>
          <p className="text-2xl font-extrabold text-slate-900">{gyms.length}</p>
        </Card>
        <Card className="p-5 space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Active Gyms</span>
          <p className="text-2xl font-extrabold text-emerald-600">{activeGymsCount}</p>
        </Card>
        <Card className="p-5 space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Suspended Gyms</span>
          <p className="text-2xl font-extrabold text-rose-600">{suspendedGymsCount}</p>
        </Card>
        <Card className="p-5 space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Platform Security</span>
          <p className="text-2xl font-extrabold text-indigo-600">RLS Active</p>
        </Card>
      </div>

      {/* Onboarded Gym Tenants Table */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Onboarded Gym Tenants
          </h3>
          <span className="text-xs text-slate-500 font-medium">Total: {gyms.length}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200/80 bg-slate-50/50 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="p-4">Gym Name & Slug</th>
                <th className="p-4">Contact Info</th>
                <th className="p-4">Status</th>
                <th className="p-4">Feature Flags</th>
                <th className="p-4">Admin & Staff Credentials</th>
                <th className="p-4 text-right">Support Impersonation & Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {gyms.map((g) => {
                const gymAccounts = allDemoProfiles.filter((p) => p.gym_id === g.id);
                const gymAccountCount = gymAccounts.length;

                return (
                  <tr key={g.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4">
                      <div className="space-y-0.5">
                        <p className="font-bold text-slate-900 text-sm">{g.name}</p>
                        <p className="text-[11px] text-emerald-700 font-mono">slug: {g.slug}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="space-y-0.5 text-slate-600">
                        <p className="font-medium text-slate-800">{g.email || 'N/A'}</p>
                        <p className="text-[11px] text-slate-500">{g.phone || 'N/A'}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge variant={g.status === 'active' ? 'emerald' : 'rose'}>{g.status.toUpperCase()}</Badge>
                    </td>
                    <td className="p-4">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setSelectedFeatureGym(g)}
                        icon={<Sparkles className="w-3.5 h-3.5 text-emerald-600" />}
                      >
                        Manage Flags
                      </Button>
                    </td>
                    <td className="p-4">
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => openCredentialsManager(g)}
                        icon={<KeyRound className="w-3.5 h-3.5" />}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold"
                      >
                        Assign ID & Password ({gymAccountCount})
                      </Button>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => impersonateGym(g)}
                          icon={<Eye className="w-3.5 h-3.5 text-amber-600" />}
                        >
                          Support View
                        </Button>

                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => setDeletingGym(g)}
                          icon={<Trash2 className="w-3.5 h-3.5" />}
                        >
                          Delete Gym
                        </Button>

                        {g.status === 'active' ? (
                          <button
                            onClick={() => updateGymStatus(g.id, 'suspended')}
                            className="p-1.5 text-slate-400 hover:text-amber-600 rounded-lg hover:bg-amber-50 transition-colors cursor-pointer"
                            title="Suspend Gym"
                          >
                            <Ban className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => updateGymStatus(g.id, 'active')}
                            className="p-1.5 text-slate-400 hover:text-emerald-600 rounded-lg hover:bg-emerald-50 transition-colors cursor-pointer"
                            title="Activate Gym"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Delete Gym Confirmation Modal */}
      <Modal
        isOpen={!!deletingGym}
        onClose={() => setDeletingGym(null)}
        title="Delete Gym Tenant"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-700 font-medium leading-relaxed">
            Are you sure you want to permanently delete <strong className="text-slate-900 font-bold">{deletingGym?.name}</strong>?
          </p>
          <p className="text-xs text-rose-700 bg-rose-50 border border-rose-200/80 p-3.5 rounded-xl font-normal leading-relaxed">
            This will permanently remove all associated members, plans, payments, attendance records, and staff accounts. This action cannot be undone.
          </p>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setDeletingGym(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                if (deletingGym) {
                  deleteGym(deletingGym.id);
                  setDeletingGym(null);
                }
              }}
            >
              Delete Gym Tenant
            </Button>
          </div>
        </div>
      </Modal>

      {/* Onboard New Gym Modal */}
      <Modal
        isOpen={isAddGymModalOpen}
        onClose={() => setIsAddGymModalOpen(false)}
        title="Onboard New Gym Tenant"
      >
        <form onSubmit={handleCreateGym} className="space-y-4">
          <Input
            label="Gym Name"
            placeholder="e.g. Yuva Fitness Club"
            value={formDataGym.name}
            onChange={(e) => {
              const name = e.target.value;
              const autoSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
              setFormDataGym({ ...formDataGym, name, slug: autoSlug });
            }}
            required
          />

          <Input
            label="Tenant Subdomain / Slug"
            placeholder="e.g. yuva-fitness"
            value={formDataGym.slug}
            onChange={(e) => setFormDataGym({ ...formDataGym, slug: e.target.value })}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Contact Email"
              type="email"
              placeholder="admin@yuvafitness.com"
              value={formDataGym.email}
              onChange={(e) => setFormDataGym({ ...formDataGym.email, email: e.target.value })}
            />

            <Input
              label="Contact Phone"
              placeholder="+91 98765 43210"
              value={formDataGym.phone}
              onChange={(e) => setFormDataGym({ ...formDataGym, phone: e.target.value })}
            />
          </div>

          <Input
            label="Address"
            placeholder="City, State"
            value={formDataGym.address}
            onChange={(e) => setFormDataGym({ ...formDataGym, address: e.target.value })}
          />

          <div className="pt-2 flex justify-end gap-3 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setIsAddGymModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" className="bg-blue-600 hover:bg-blue-700 text-white font-bold">
              Onboard & Generate Credentials
            </Button>
          </div>
        </form>
      </Modal>

      {/* Assign Credentials & Accounts Portal Modal */}
      {selectedCredentialsGym && (
        <Modal
          isOpen={!!selectedCredentialsGym}
          onClose={() => setSelectedCredentialsGym(null)}
          title={`Credentials & Login Accounts (${selectedCredentialsGym.name})`}
        >
          <div className="space-y-6">
            <div className="flex items-center justify-between bg-blue-50/50 p-4 rounded-xl border border-blue-200/80">
              <div>
                <p className="text-xs font-bold text-slate-900">Manage Tenant Accounts</p>
                <p className="text-[11px] text-slate-500">Create, view, and reset passwords for this gym's admin and staff.</p>
              </div>
              <Button
                size="sm"
                variant="primary"
                onClick={() => openAssignModalForGym(selectedCredentialsGym)}
                icon={<Plus className="w-3.5 h-3.5" />}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold"
              >
                Assign New Account
              </Button>
            </div>

            {/* List of Accounts */}
            <div className="space-y-3 max-h-72 overflow-y-auto">
              {allDemoProfiles.filter((p) => p.gym_id === selectedCredentialsGym.id).length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  No login accounts assigned yet. Click "Assign New Account" to generate credentials.
                </div>
              ) : (
                allDemoProfiles.filter((p) => p.gym_id === selectedCredentialsGym.id).map((p) => {
                  const showPass = showPasswordMap[p.id] || false;
                  return (
                    <div key={p.id} className="p-3.5 rounded-xl border border-slate-200/80 bg-white space-y-2 shadow-2xs">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <p className="text-xs font-bold text-slate-900 flex items-center gap-2">
                            <span>{p.full_name}</span>
                            <Badge variant={p.role === 'admin' ? 'emerald' : 'zinc'}>
                              {p.role.toUpperCase()}
                            </Badge>
                          </p>
                          <p className="text-[11px] text-slate-500 font-mono">{p.email}</p>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openAssignModalForGym(selectedCredentialsGym, p)}
                        >
                          Edit Credentials
                        </Button>
                      </div>

                      {/* Password Pill */}
                      <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                        <div className="flex items-center gap-2 font-mono text-slate-700">
                          <Lock className="w-3.5 h-3.5 text-slate-400" />
                          <span>{showPass ? (p.password || 'Pass@123') : '••••••••••••'}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => togglePasswordVisibility(p.id)}
                            className="p-1 text-slate-400 hover:text-slate-600 rounded transition-colors"
                            title="Toggle Password"
                          >
                            {showPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                          <button
                            onClick={() => copyToClipboard(`Email: ${p.email}\nPassword: ${p.password || 'Pass@123'}`, p.id)}
                            className="p-1 text-slate-400 hover:text-blue-600 rounded transition-colors flex items-center gap-1 text-[10px] font-bold"
                            title="Copy Credentials"
                          >
                            {copiedId === p.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* Assign Credentials Form Modal */}
      <Modal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        title={editingProfileId ? 'Update Credentials' : 'Assign New Account Credentials'}
      >
        <form onSubmit={handleSaveCredentials} className="space-y-4">
          <Input
            label="Full Name"
            placeholder="John Doe"
            value={formDataCredentials.full_name}
            onChange={(e) => setFormDataCredentials({ ...formDataCredentials, full_name: e.target.value })}
            required
          />

          <Input
            label="Email Address (Login ID)"
            type="email"
            placeholder="admin@gym.com"
            value={formDataCredentials.email}
            onChange={(e) => setFormDataCredentials({ ...formDataCredentials, email: e.target.value })}
            required
          />

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700">Password</label>
              <button
                type="button"
                onClick={generateRandomPassword}
                className="text-[11px] text-blue-600 font-bold hover:underline"
              >
                Generate Password
              </button>
            </div>
            <Input
              type="text"
              placeholder="Pass@123"
              value={formDataCredentials.password}
              onChange={(e) => setFormDataCredentials({ ...formDataCredentials, password: e.target.value })}
              required
            />
          </div>

          <Select
            label="Account Role"
            value={formDataCredentials.role}
            onChange={(e) => setFormDataCredentials({ ...formDataCredentials, role: e.target.value as any })}
            options={[
              { value: 'admin', label: 'Gym Admin (Full Control)' },
              { value: 'staff', label: 'Gym Staff (Granular Control)' },
            ]}
          />

          <div className="pt-2 flex justify-end gap-3 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setIsAssignModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" className="bg-blue-600 hover:bg-blue-700 text-white font-bold">
              Save Account Credentials
            </Button>
          </div>
        </form>
      </Modal>

      {/* Feature Flags Modal */}
      {selectedFeatureGym && (
        <Modal
          isOpen={!!selectedFeatureGym}
          onClose={() => setSelectedFeatureGym(null)}
          title={`Feature Flags (${selectedFeatureGym.name})`}
        >
          <div className="space-y-4">
            <p className="text-xs text-slate-500">
              Enable or disable specific CRM modules for this tenant in real-time.
            </p>

            <div className="space-y-3">
              {features
                .filter((f) => f.gym_id === selectedFeatureGym.id)
                .map((feat) => (
                  <div
                    key={feat.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200"
                  >
                    <div>
                      <p className="text-xs font-bold text-slate-900 capitalize">
                        {feat.feature_key.replace('_', ' ')}
                      </p>
                      <p className="text-[10px] text-slate-500">
                        {feat.enabled ? 'Module Enabled' : 'Module Restricted'}
                      </p>
                    </div>
                    <Switch
                      checked={feat.enabled}
                      onChange={(checked) => toggleGymFeature(selectedFeatureGym.id, feat.feature_key, checked)}
                    />
                  </div>
                ))}
            </div>
          </div>
        </Modal>
      )}

      {/* Platform Audit Logs */}
      <Card className="p-6 space-y-4">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3 flex items-center gap-2">
          <ScrollText className="w-4 h-4 text-emerald-600" />
          <span>Platform Audit Logs</span>
        </h3>

        <div className="space-y-2 max-h-60 overflow-y-auto text-xs">
          {auditLogs.map((log, index) => (
            <div key={`${log.id}-${index}`} className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between shadow-2xs">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900">{log.user_name}</span>
                  <Badge variant="zinc">{log.action}</Badge>
                </div>
                <p className="text-[11px] text-slate-500 font-mono">
                  Gym: {log.gym_name} | Entity: {log.entity} #{log.entity_id}
                </p>
              </div>
              <span className="text-[10px] text-slate-400 font-medium">
                {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
