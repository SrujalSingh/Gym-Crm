'use client';

import React, { useState } from 'react';
import { useTenant } from '@/lib/context/TenantContext';
import { useAuth } from '@/lib/context/AuthContext';
import { StaffMember, StaffPermissions } from '@/lib/types';
import { Card, Button, Input, Modal, Badge, Switch } from '@/components/ui';
import { ShieldCheck, Plus, KeyRound, CheckCircle2, XCircle, Mail, Phone } from 'lucide-react';

export default function StaffPage() {
  const { staff, addStaff, updateStaffPermissions } = useTenant();
  const { profile, currentGym, impersonatedGym, addOrUpdateProfile } = useAuth();
  const activeGym = impersonatedGym || currentGym;

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingPermissionsStaff, setEditingPermissionsStaff] = useState<StaffMember | null>(null);

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    phone: '',
    designation: 'Front Desk Executive',
  });

  const [permissionsState, setPermissionsState] = useState<StaffPermissions>({
    members: true,
    attendance: true,
    payments: false,
    expenses: false,
    reports: false,
    enquiries: true,
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.full_name || !formData.email) return;

    const newStaff = addStaff({
      full_name: formData.full_name,
      email: formData.email,
      phone: formData.phone,
      designation: formData.designation,
      status: 'active',
      permissions: permissionsState,
    });

    // Automatically provision login credentials in AuthContext
    addOrUpdateProfile({
      gym_id: activeGym?.id,
      full_name: formData.full_name,
      email: formData.email,
      password: formData.password || `${activeGym?.name.replace(/\s+/g, '') || 'Staff'}@123`,
      phone: formData.phone,
      role: 'staff',
      status: 'active',
    });

    setIsAddModalOpen(false);
    setFormData({ full_name: '', email: '', password: '', phone: '', designation: 'Front Desk Executive' });
  };

  const handleSavePermissions = () => {
    if (!editingPermissionsStaff) return;
    updateStaffPermissions(editingPermissionsStaff.id, permissionsState);
    setEditingPermissionsStaff(null);
  };

  const openPermissionEditor = (s: StaffMember) => {
    setEditingPermissionsStaff(s);
    setPermissionsState(s.permissions);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-emerald-600" />
            <span>Staff Management & Access Control</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">Manage staff login accounts and configure granular permission access matrices.</p>
        </div>

        {profile?.role === 'admin' && (
          <Button
            onClick={() => setIsAddModalOpen(true)}
            variant="primary"
            icon={<Plus className="w-4 h-4" />}
          >
            Add New Staff Account
          </Button>
        )}
      </div>

      {/* Staff Table */}
      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="p-4">Staff Name</th>
                <th className="p-4">Designation</th>
                <th className="p-4">User ID / Email</th>
                <th className="p-4">Permissions Matrix</th>
                <th className="p-4">Account Status</th>
                <th className="p-4 text-right">Configure Permissions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/80">
              {staff.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    No staff accounts created yet.
                  </td>
                </tr>
              ) : (
                staff.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-bold text-slate-900">{s.full_name}</td>
                    <td className="p-4 text-slate-800 font-medium">{s.designation || 'Staff Member'}</td>
                    <td className="p-4">
                      <p className="text-slate-900 font-mono font-medium">{s.email}</p>
                      <p className="text-[10px] text-slate-500">{s.phone || 'No phone'}</p>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-wrap gap-1">
                        {Object.entries(s.permissions).map(([key, val]) => (
                          <span
                            key={key}
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              val ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-400 line-through'
                            }`}
                          >
                            {key}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge variant={s.status === 'active' ? 'emerald' : 'rose'}>{s.status}</Badge>
                    </td>
                    <td className="p-4 text-right">
                      {profile?.role === 'admin' && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => openPermissionEditor(s)}
                          icon={<KeyRound className="w-3.5 h-3.5" />}
                        >
                          Permissions
                        </Button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add Staff Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Gym Staff Account"
        description="Create a staff login User ID & password and assign module access permissions."
      >
        <form onSubmit={handleAddSubmit} className="space-y-4">
          <Input
            label="Staff Full Name *"
            placeholder="e.g. John Frontdesk"
            value={formData.full_name}
            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
            required
          />

          <Input
            label="Login User ID / Email *"
            type="email"
            placeholder={`staff@${activeGym?.slug || 'gym'}.com`}
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />

          <Input
            label="Initial Login Password"
            placeholder="e.g. StaffPass@123"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Phone Number"
              placeholder="+91 98765 43214"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />

            <Input
              label="Designation"
              placeholder="e.g. Front Desk Executive"
              value={formData.designation}
              onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
            />
          </div>

          <div className="pt-2 border-t border-slate-200 space-y-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Grant Module Permissions
            </label>
            <div className="space-y-1 bg-slate-50 p-3 rounded-lg border border-slate-200">
              <Switch
                label="Members Module"
                description="View member directory and register members"
                checked={permissionsState.members}
                onChange={(c) => setPermissionsState({ ...permissionsState, members: c })}
              />
              <Switch
                label="Attendance Module"
                description="Verify and log attendance check-ins"
                checked={permissionsState.attendance}
                onChange={(c) => setPermissionsState({ ...permissionsState, attendance: c })}
              />
              <Switch
                label="Payments Module"
                description="Record payments and view receipts"
                checked={permissionsState.payments}
                onChange={(c) => setPermissionsState({ ...permissionsState, payments: c })}
              />
              <Switch
                label="Expenses Module"
                description="Log operational expenses"
                checked={permissionsState.expenses}
                onChange={(c) => setPermissionsState({ ...permissionsState, expenses: c })}
              />
              <Switch
                label="Enquiries Lead Funnel"
                description="Handle prospective member enquiries"
                checked={permissionsState.enquiries}
                onChange={(c) => setPermissionsState({ ...permissionsState, enquiries: c })}
              />
              <Switch
                label="Reports Module"
                description="View financial and attendance reports"
                checked={permissionsState.reports}
                onChange={(c) => setPermissionsState({ ...permissionsState, reports: c })}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Create Staff Account
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Permissions Matrix Modal */}
      {editingPermissionsStaff && (
        <Modal
          isOpen={!!editingPermissionsStaff}
          onClose={() => setEditingPermissionsStaff(null)}
          title={`Configure Access for ${editingPermissionsStaff.full_name}`}
          description="Grant or revoke specific CRM features for this staff member."
        >
          <div className="space-y-4">
            <div className="space-y-1 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <Switch
                label="Members Directory"
                checked={permissionsState.members}
                onChange={(c) => setPermissionsState({ ...permissionsState, members: c })}
              />
              <Switch
                label="Attendance Scanner"
                checked={permissionsState.attendance}
                onChange={(c) => setPermissionsState({ ...permissionsState, attendance: c })}
              />
              <Switch
                label="Payments & Receipts"
                checked={permissionsState.payments}
                onChange={(c) => setPermissionsState({ ...permissionsState, payments: c })}
              />
              <Switch
                label="Expenses Tracker"
                checked={permissionsState.expenses}
                onChange={(c) => setPermissionsState({ ...permissionsState, expenses: c })}
              />
              <Switch
                label="Enquiries Pipeline"
                checked={permissionsState.enquiries}
                onChange={(c) => setPermissionsState({ ...permissionsState, enquiries: c })}
              />
              <Switch
                label="Analytics & Reports"
                checked={permissionsState.reports}
                onChange={(c) => setPermissionsState({ ...permissionsState, reports: c })}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
              <Button type="button" variant="outline" onClick={() => setEditingPermissionsStaff(null)}>
                Cancel
              </Button>
              <Button type="button" variant="primary" onClick={handleSavePermissions}>
                Save Permissions
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
