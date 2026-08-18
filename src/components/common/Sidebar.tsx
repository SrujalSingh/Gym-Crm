'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import { hasPermission, isFeatureEnabled } from '@/lib/permissions';
import { 
  LayoutDashboard, Users, CalendarCheck, CreditCard, Layers, 
  HelpCircle, ShieldCheck, DollarSign, BarChart3, Bell, 
  Settings, Building, KeyRound, ScrollText, Sparkles, Headphones,
  LogOut, X
} from 'lucide-react';

interface SidebarProps {
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export function Sidebar({ isMobileOpen = false, onCloseMobile }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { profile, staffRecord, enabledFeatures, logout } = useAuth();

  const role = profile?.role;

  const handleLogout = () => {
    logout();
    if (onCloseMobile) onCloseMobile();
    router.push('/login');
  };

  // Build Navigation Items based on Role and Feature Flags
  let navItems: { label: string; href: string; icon: React.ReactNode; feature?: any; permission?: any }[] = [];

  if (role === 'superadmin') {
    navItems = [
      { label: 'Platform Overview', href: '/superadmin', icon: <LayoutDashboard className="w-4 h-4" /> },
      { label: 'Gyms Management', href: '/superadmin/gyms', icon: <Building className="w-4 h-4" /> },
      { label: 'Platform Users', href: '/superadmin/users', icon: <Users className="w-4 h-4" /> },
      { label: 'Feature Flags', href: '/superadmin/features', icon: <Sparkles className="w-4 h-4" /> },
      { label: 'Audit Logs', href: '/superadmin/audit-logs', icon: <ScrollText className="w-4 h-4" /> },
    ];
  } else {
    // Admin or Staff navigation
    navItems = [
      { label: 'Dashboard', href: '/dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
      { 
        label: 'Members', 
        href: '/members', 
        icon: <Users className="w-4 h-4" />, 
        permission: 'members' 
      },
      { 
        label: 'Attendance', 
        href: '/attendance', 
        icon: <CalendarCheck className="w-4 h-4" />, 
        feature: 'attendance', 
        permission: 'attendance' 
      },
      { 
        label: 'Memberships', 
        href: '/memberships', 
        icon: <Layers className="w-4 h-4" />, 
        feature: 'memberships' 
      },
      { 
        label: 'Payments', 
        href: '/payments', 
        icon: <CreditCard className="w-4 h-4" />, 
        feature: 'payments', 
        permission: 'payments' 
      },
      { 
        label: 'Enquiries / Leads', 
        href: '/enquiries', 
        icon: <HelpCircle className="w-4 h-4" />, 
        feature: 'enquiries', 
        permission: 'enquiries' 
      },
    ];

    if (role === 'admin') {
      navItems.push(
        { 
          label: 'Staff Management', 
          href: '/staff', 
          icon: <ShieldCheck className="w-4 h-4" />, 
          feature: 'staff_management' 
        },
        { 
          label: 'Expenses', 
          href: '/expenses', 
          icon: <DollarSign className="w-4 h-4" />, 
          feature: 'expenses' 
        },
        { 
          label: 'Reports', 
          href: '/reports', 
          icon: <BarChart3 className="w-4 h-4" />, 
          feature: 'reports' 
        },
        { 
          label: 'Notifications', 
          href: '/notifications', 
          icon: <Bell className="w-4 h-4" />, 
          feature: 'notifications' 
        },
        { label: 'Gym Settings', href: '/settings', icon: <Settings className="w-4 h-4" /> },
        { label: 'Support & Updates', href: '/support', icon: <Headphones className="w-4 h-4 text-indigo-600" /> }
      );
    } else if (role === 'staff') {
      if (hasPermission(profile, staffRecord, 'expenses')) {
        navItems.push({ label: 'Expenses', href: '/expenses', icon: <DollarSign className="w-4 h-4" />, feature: 'expenses' });
      }
      if (hasPermission(profile, staffRecord, 'reports')) {
        navItems.push({ label: 'Reports', href: '/reports', icon: <BarChart3 className="w-4 h-4" />, feature: 'reports' });
      }
      navItems.push(
        { label: 'Notifications', href: '/notifications', icon: <Bell className="w-4 h-4" />, feature: 'notifications' },
        { label: 'Support & Updates', href: '/support', icon: <Headphones className="w-4 h-4 text-indigo-600" /> }
      );
    }
  }

  // Filter items based on Feature Flags and Staff permissions
  const filteredItems = navItems.filter((item) => {
    if (item.feature && !isFeatureEnabled(enabledFeatures, item.feature)) {
      return false;
    }
    if (role === 'staff' && item.permission) {
      return hasPermission(profile, staffRecord, item.permission);
    }
    return true;
  });

  const sidebarContent = (
    <aside className="w-68 bg-white border-r border-slate-200/90 flex flex-col h-full select-none shadow-xs">
      {/* Brand Header */}
      <div className="h-16 px-6 border-b border-slate-200/80 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-lg tracking-tight shadow-sm">
            N
          </div>
          <div>
            <h1 className="font-bold text-slate-900 text-sm tracking-tight">NestBeans</h1>
            <p className="text-[10px] text-slate-500 font-semibold tracking-wider uppercase">Gym CRM SaaS</p>
          </div>
        </div>

        {/* Mobile Close Button */}
        {onCloseMobile && (
          <button 
            onClick={onCloseMobile}
            className="md:hidden p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation List */}
      <div className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          {role === 'superadmin' ? 'Superadmin Platform' : 'Gym Operations'}
        </div>

        {filteredItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => {
                if (onCloseMobile) onCloseMobile();
              }}
              className={`flex items-center gap-3.5 px-4 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                isActive
                  ? 'bg-blue-50/80 text-blue-600 font-semibold border-l-4 border-blue-600 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 border-l-4 border-transparent'
              }`}
            >
              <span className={isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'}>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Footer Branding & Logout */}
      <div className="p-4 border-t border-slate-200/80 bg-slate-50/40 space-y-3">
        <div className="p-3.5 rounded-xl bg-white border border-slate-200 text-[11px] text-slate-600 space-y-1 shadow-2xs">
          <p className="font-semibold text-slate-900 flex items-center gap-1.5">
            <KeyRound className="w-3.5 h-3.5 text-blue-600" />
            <span>RLS Multi-Tenant Active</span>
          </p>
          <p className="text-[10px] text-slate-500 font-normal">Database-level tenant security by NestBeans.</p>
        </div>

        {/* Dedicated Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full py-2.5 px-4 bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold text-xs rounded-xl border border-rose-200 flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          <LogOut className="w-4 h-4 text-rose-600" />
          <span>Log Out Session</span>
        </button>
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop Fixed Sidebar */}
      <div className="hidden md:flex h-screen sticky top-0 shrink-0">
        {sidebarContent}
      </div>

      {/* Mobile Backdrop & Drawer */}
      {isMobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-2xs transition-opacity"
            onClick={onCloseMobile}
          />
          {/* Slide-out Panel */}
          <div className="relative flex-1 max-w-xs w-full bg-white h-full z-50 shadow-2xl animate-fadeIn">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
