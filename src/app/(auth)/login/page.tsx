'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Input, Button, Card, Badge } from '@/components/ui';
import { Lock, Mail, Building2, ShieldCheck, ArrowRight, Sparkles } from 'lucide-react';

export default function LoginPage() {
  const { loginAsDemoUser, allDemoProfiles } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState('admin@btcgym.com');
  const [password, setPassword] = useState('••••••••••••');
  const [error, setError] = useState('');

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your account email address');
      return;
    }

    loginAsDemoUser(email);
    const profile = allDemoProfiles.find((p) => p.email.toLowerCase() === email.toLowerCase());
    if (profile?.role === 'superadmin') {
      router.push('/superadmin');
    } else {
      router.push('/dashboard');
    }
  };

  const handleQuickLogin = (emailTarget: string, role: string) => {
    loginAsDemoUser(emailTarget);
    if (role === 'superadmin') {
      router.push('/superadmin');
    } else {
      router.push('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Soft Glow Blobs */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md space-y-6 z-10 animate-fadeIn">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-600 text-white font-bold text-2xl shadow-lg shadow-blue-600/20 mb-2">
            N
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">NestBeans Gym CRM</h1>
          <p className="text-xs text-slate-500 font-normal">Multi-Tenant SaaS Platform with Database RLS Isolation</p>
        </div>

        {/* Login Form Card */}
        <Card className="p-6 md:p-8 space-y-6 bg-white border-slate-200/90 shadow-xl rounded-2xl">
          <form onSubmit={handleFormSubmit} className="space-y-4">
            <Input
              label="Work Email"
              type="email"
              placeholder="name@btcgym.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            {error && <p className="text-xs text-rose-600 font-medium">{error}</p>}

            <Button type="submit" variant="primary" className="w-full py-3 bg-blue-600 hover:bg-blue-700" icon={<ArrowRight className="w-4 h-4" />}>
              Sign In to CRM
            </Button>
          </form>

          {/* Quick Demo Login Preset Matrix */}
          <div className="pt-4 border-t border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>One-Click Demo Roles</span>
              </span>
              <span className="text-[10px] text-slate-400 font-medium">Auto RLS Context</span>
            </div>

            <div className="grid grid-cols-1 gap-2">
              {allDemoProfiles.map((p) => {
                const gymLabel = p.gym_id ? (p.gym_id.includes('1111') ? 'BTC Gym' : 'XYZ Gym') : 'NestBeans Platform';
                return (
                  <button
                    key={p.id}
                    onClick={() => handleQuickLogin(p.email, p.role)}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 text-left transition-all cursor-pointer group shadow-2xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                          {p.full_name}
                        </span>
                        <Badge variant={p.role === 'superadmin' ? 'indigo' : p.role === 'admin' ? 'blue' : 'zinc'}>
                          {p.role}
                        </Badge>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        {p.email} • <span className="text-slate-700 font-medium">{gymLabel}</span>
                      </p>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 transition-colors" />
                  </button>
                );
              })}
            </div>
          </div>
        </Card>

        {/* Security Footer Notice */}
        <div className="text-center text-xs text-slate-500 flex items-center justify-center gap-2">
          <ShieldCheck className="w-4 h-4 text-blue-600" />
          <span>Tenant isolation enforced automatically by PostgreSQL RLS.</span>
        </div>
      </div>
    </div>
  );
}
