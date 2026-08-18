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

  const copyCredentialsToClipboard = (profileItem: Profile) => {
    const text = `Gym: ${selectedCredentialsGym?.name}\nRole: ${profileItem.role.toUpperCase()}\nUser ID / Email: ${profileItem.email}\nPassword: ${profileItem.password || 'Pass@123'}`;
    navigator.clipboard.writeText(text);
    setCopiedId(profileItem.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  // Get profiles assigned to current selected gym
  const currentGymProfiles = selectedCredentialsGym
    ? allDemoProfiles.filter((p) => p.gym_id === selectedCredentialsGym.id)
    : [];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Building className="w-6 h-6 text-emerald-600" />
            <span>NestBeans Superadmin Dashboard</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">Platform management, tenant onboarding, login ID & password assignment, and cross-gym support.</p>
        </div>

        <Button
          onClick={() => setIsAddGymModalOpen(true)}
          variant="primary"
          icon={<Plus className="w-4 h-4" />}
        >
          Onboard New Gym
        </Button>
      </div>

      {/* Platform Overview KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="p-5">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Onboarded Gyms</p>
          <h3 className="text-2xl font-black text-slate-900 mt-1">{gyms.length}</h3>
        </Card>

        <Card className="p-5">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Gyms</p>
          <h3 className="text-2xl font-black text-emerald-700 mt-1">{activeGymsCount}</h3>
        </Card>

        <Card className="p-5">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Suspended Gyms</p>
          <h3 className="text-2xl font-black text-rose-700 mt-1">{suspendedGymsCount}</h3>
        </Card>

        <Card className="p-5">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Platform Security</p>
          <h3 className="text-2xl font-black text-indigo-700 mt-1">RLS Active</h3>
        </Card>
      </div>

      {/* Gym Directory Table */}
      <Card className="p-0 overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Onboarded Gym Tenants</h3>
          <span className="text-xs text-slate-500 font-semibold">Total: {gyms.length}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="p-4">Gym Name & Slug</th>
                <th className="p-4">Contact Info</th>
                <th className="p-4">Status</th>
                <th className="p-4">Feature Flags</th>
                <th className="p-4">Admin & Staff Credentials</th>
                <th className="p-4 text-right">Support Impersonation & Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/80">
              {gyms.map((g) => {
                const gymAccountCount = allDemoProfiles.filter((p) => p.gym_id === g.id).length;
                return (
                  <tr key={g.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4">
                      <p className="font-bold text-slate-900 text-sm">{g.name}</p>
                      <p className="text-[10px] text-emerald-700 font-mono font-bold">slug: {g.slug}</p>
                    </td>
                    <td className="p-4">
                      <p className="text-slate-800 font-medium">{g.email || 'N/A'}</p>
                      <p className="text-[10px] text-slate-500">{g.phone || 'N/A'}</p>
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

                        <button
                          onClick={() => setDeletingGym(g)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Delete Gym Tenant"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
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

      {/* Platform Audit Logs */}
      <Card className="p-6 space-y-4">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3 flex items-center gap-2">
          <ScrollText className="w-4 h-4 text-emerald-600" />
          <span>Platform Audit Logs</span>
        </h3>

        <div className="space-y-2 max-h-60 overflow-y-auto text-xs">
          {auditLogs.map((log, index) => (
            <div key={`${log.id}-${index}`} className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between shadow-2xs">
              <div>
                <span className="font-bold text-emerald-700 font-mono">[{log.action}]</span>{' '}
                <span className="text-slate-900 font-semibold">{log.user_name}</span> in{' '}
                <span className="font-bold text-slate-800">{log.gym_name}</span>
                <p className="text-[10px] text-slate-500 mt-0.5">{JSON.stringify(log.metadata)}</p>
              </div>
              <span className="text-[10px] text-slate-400 font-medium">{new Date(log.created_at).toLocaleString()}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Onboard Gym Modal */}
      <Modal
        isOpen={isAddGymModalOpen}
        onClose={() => setIsAddGymModalOpen(false)}
        title="Onboard New Gym Tenant"
        description="Register a new gym client on NestBeans SaaS platform."
      >
        <form onSubmit={handleCreateGym} className="space-y-4">
          <Input
            label="Gym Name *"
            placeholder="e.g. Yuva Fitness"
            value={formDataGym.name}
            onChange={(e) => setFormDataGym({ ...formDataGym, name: e.target.value })}
            required
          />

          <Input
            label="URL Slug *"
            placeholder="e.g. yuvafit"
            value={formDataGym.slug}
            onChange={(e) => setFormDataGym({ ...formDataGym, slug: e.target.value })}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Contact Email *"
              type="email"
              placeholder="contact@yuvafit.com"
              value={formDataGym.email}
              onChange={(e) => setFormDataGym({ ...formDataGym, email: e.target.value })}
              required
            />

            <Input
              label="Phone Number"
              placeholder="+91 98765 43210"
              value={formDataGym.phone}
              onChange={(e) => setFormDataGym({ ...formDataGym, phone: e.target.value })}
            />
          </div>

          <Input
            label="Address"
            placeholder="e.g. 102 MG Road, Bengaluru, KA"
            value={formDataGym.address}
            onChange={(e) => setFormDataGym({ ...formDataGym, address: e.target.value })}
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <Button type="button" variant="outline" onClick={() => setIsAddGymModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Onboard Gym & Assign Admin Credentials
            </Button>
          </div>
        </form>
      </Modal>

      {/* Gym Login Credentials Manager Portal Modal */}
      {selectedCredentialsGym && (
        <Modal
          isOpen={!!selectedCredentialsGym}
          onClose={() => setSelectedCredentialsGym(null)}
          title={`${selectedCredentialsGym.name} - Login Credentials Manager`}
          description="Manually assign and manage login User IDs and passwords for Gym Admins and Staff members."
          maxWidth="2xl"
        >
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Gym Tenant Overview</h4>
                <p className="text-sm font-black text-slate-900 mt-0.5">{selectedCredentialsGym.name}</p>
                <p className="text-xs text-slate-500 font-mono">slug: {selectedCredentialsGym.slug} • {selectedCredentialsGym.email || 'No email'}</p>
              </div>

              <Button
                size="sm"
                variant="primary"
                onClick={() => openAssignModalForGym(selectedCredentialsGym)}
                icon={<Plus className="w-3.5 h-3.5" />}
              >
                Assign New Login ID & Password
              </Button>
            </div>

            {/* Credentials Table */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Assigned Accounts & Credentials</h4>

              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="p-3.5">Name</th>
                      <th className="p-3.5">Role</th>
                      <th className="p-3.5">User ID / Email</th>
                      <th className="p-3.5">Password</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200/80">
                    {currentGymProfiles.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-6 text-center text-slate-400">
                          No credentials assigned yet. Click "Assign New Login ID & Password" above.
                        </td>
                      </tr>
                    ) : (
                      currentGymProfiles.map((p) => {
                        const isVisible = showPasswordMap[p.id];
                        const passwordText = p.password || `${selectedCredentialsGym.name.replace(/\s+/g, '')}@123`;
                        return (
                          <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                            <td className="p-3.5 font-bold text-slate-900">{p.full_name}</td>
                            <td className="p-3.5">
                              <Badge variant={p.role === 'admin' ? 'emerald' : 'zinc'}>
                                {p.role.toUpperCase()}
                              </Badge>
                            </td>
                            <td className="p-3.5 font-mono text-slate-800 font-medium">{p.email}</td>
                            <td className="p-3.5 font-mono">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-900">
                                  {isVisible ? passwordText : '••••••••••••'}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => togglePasswordVisibility(p.id)}
                                  className="text-slate-400 hover:text-slate-700 transition-colors"
                                  title={isVisible ? 'Hide Password' : 'Show Password'}
                                >
                                  {isVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                </button>
                              </div>
                            </td>
                            <td className="p-3.5 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => copyCredentialsToClipboard(p)}
                                  icon={copiedId === p.id ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                                >
                                  {copiedId === p.id ? 'Copied!' : 'Copy'}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => openAssignModalForGym(selectedCredentialsGym, p)}
                                >
                                  Edit
                                </Button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Assign Credentials Form Modal */}
      {isAssignModalOpen && selectedCredentialsGym && (
        <Modal
          isOpen={isAssignModalOpen}
          onClose={() => setIsAssignModalOpen(false)}
          title={editingProfileId ? 'Edit Login Credentials' : `Assign Credentials for ${selectedCredentialsGym.name}`}
          description="Manually assign User ID and Password credentials for Gym Admin or Staff login."
        >
          <form onSubmit={handleSaveCredentials} className="space-y-4">
            <Input
              label="User Full Name *"
              placeholder="e.g. Yuva Admin"
              value={formDataCredentials.full_name}
              onChange={(e) => setFormDataCredentials({ ...formDataCredentials, full_name: e.target.value })}
              required
            />

            <Select
              label="Account Role *"
              value={formDataCredentials.role}
              onChange={(e: any) => setFormDataCredentials({ ...formDataCredentials, role: e.target.value })}
              options={[
                { label: 'Gym Admin (Full Gym Management)', value: 'admin' },
                { label: 'Gym Staff (Granular Permissions)', value: 'staff' },
              ]}
            />

            <Input
              label="User ID / Login Email *"
              type="email"
              placeholder={`admin@${selectedCredentialsGym.slug}.com`}
              value={formDataCredentials.email}
              onChange={(e) => setFormDataCredentials({ ...formDataCredentials, email: e.target.value })}
              required
            />

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Login Password *
                </label>
                <button
                  type="button"
                  onClick={generateRandomPassword}
                  className="text-[10px] font-bold text-emerald-700 hover:text-emerald-800 uppercase tracking-wider flex items-center gap-1 cursor-pointer"
                >
                  <Sparkles className="w-3 h-3 text-emerald-600" />
                  <span>Auto-Generate Password</span>
                </button>
              </div>

              <Input
                type="text"
                placeholder="e.g. YuvaPass@123"
                value={formDataCredentials.password}
                onChange={(e) => setFormDataCredentials({ ...formDataCredentials, password: e.target.value })}
                required
              />
            </div>

            <Input
              label="Phone Number (Optional)"
              placeholder="+91 98765 43210"
              value={formDataCredentials.phone}
              onChange={(e) => setFormDataCredentials({ ...formDataCredentials, phone: e.target.value })}
            />

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
              <Button type="button" variant="outline" onClick={() => setIsAssignModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Save & Assign Credentials
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Gym Feature Flag Matrix Modal */}
      {selectedFeatureGym && (
        <Modal
          isOpen={!!selectedFeatureGym}
          onClose={() => setSelectedFeatureGym(null)}
          title={`Feature Flags for ${selectedFeatureGym.name}`}
          description="Enable or disable specific CRM modules for this gym subscription tier."
        >
          <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
            {[
              'attendance', 'payments', 'memberships', 'expenses', 
              'enquiries', 'staff_management', 'reports', 'advanced_reports', 'notifications'
            ].map((key) => {
              const featObj = features.find((f) => f.gym_id === selectedFeatureGym.id && f.feature_key === key);
              const enabled = featObj ? featObj.enabled : true;

              return (
                <Switch
                  key={key}
                  label={key.replace('_', ' ').toUpperCase()}
                  description={`Enable ${key} module access`}
                  checked={enabled}
                  onChange={(c) => toggleGymFeature(selectedFeatureGym.id, key, c)}
                />
              );
            })}
          </div>
        </Modal>
      )}
    </div>
  );
}
