'use client';

import React, { useState } from 'react';
import { useTenant } from '@/lib/context/TenantContext';
import { useAuth } from '@/lib/context/AuthContext';
import { Card, Button, Input, Modal, Badge } from '@/components/ui';
import { Layers, Plus, CheckCircle2, DollarSign, Clock, Edit3 } from 'lucide-react';

export default function MembershipsPage() {
  const { plans, addPlan, members } = useTenant();
  const { profile } = useAuth();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    duration_months: 1,
    price: 49.99,
    description: '',
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    addPlan({
      name: formData.name,
      duration_months: Number(formData.duration_months),
      price: Number(formData.price),
      description: formData.description,
      status: 'active',
    });

    setIsAddModalOpen(false);
    setFormData({ name: '', duration_months: 1, price: 49.99, description: '' });
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Layers className="w-6 h-6 text-indigo-600" />
            <span>Membership Plans</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">Configure subscription packages, prices, and durations for your gym.</p>
        </div>

        {profile?.role === 'admin' && (
          <Button
            onClick={() => setIsAddModalOpen(true)}
            variant="primary"
            icon={<Plus className="w-4 h-4" />}
          >
            Create New Plan
          </Button>
        )}
      </div>

      {/* Plans Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((p) => {
          const subscriberCount = members.filter((m) => m.membership_plan_id === p.id).length;
          const badgeVariant = p.duration_months === 1 ? 'indigo' : p.duration_months === 3 ? 'sky' : 'amber';

          return (
            <Card key={p.id} className="p-6 space-y-4 border-slate-200/90 hover:border-indigo-300 transition-all flex flex-col justify-between shadow-xs hover:shadow-md">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Badge variant={badgeVariant}>{p.duration_months} Month{p.duration_months > 1 ? 's' : ''}</Badge>
                  <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider">{subscriberCount} Active Members</span>
                </div>

                <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">{p.name}</h3>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">{p.description || 'Full gym access package.'}</p>

                <div className="pt-2 flex items-baseline gap-1">
                  <span className="text-3xl font-black text-slate-900 tracking-tight">₹{Number(p.price).toFixed(2)}</span>
                  <span className="text-xs text-slate-500 font-bold">/ {p.duration_months} mo</span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                <span className="flex items-center gap-1 font-bold text-slate-700">
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Status: Active</span>
                </span>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Create Plan Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Create Membership Plan"
        description="Add a new subscription tier for your gym."
      >
        <form onSubmit={handleAddSubmit} className="space-y-4">
          <Input
            label="Plan Name *"
            placeholder="e.g. Annual Elite Pass"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Duration (Months) *"
              type="number"
              min={1}
              max={36}
              value={formData.duration_months}
              onChange={(e) => setFormData({ ...formData, duration_months: Number(e.target.value) })}
              required
            />

            <Input
              label="Price (₹) *"
              type="number"
              step="0.01"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
              required
            />
          </div>

          <Input
            label="Description"
            placeholder="e.g. Includes group classes, sauna, and locker room access"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Save Plan
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
