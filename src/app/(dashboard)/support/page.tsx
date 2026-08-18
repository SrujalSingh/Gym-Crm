'use client';

import React from 'react';
import { Card } from '@/components/ui';
import { 
  Headphones, Mail, Phone, Globe, ShieldCheck, Rocket, 
  Code, Link2, Gauge, HardDrive 
} from 'lucide-react';

export default function SupportPage() {
  return (
    <div className="space-y-8 animate-fadeIn max-w-7xl mx-auto">
      {/* Top Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
          <Headphones className="w-7 h-7 text-blue-600" />
          <span>Support & Updates</span>
        </h1>
        <p className="text-sm text-slate-500 font-normal mt-1">
          Direct developer assistance, system customization, and maintenance status.
        </p>
      </div>

      {/* Main 2-Column Support Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Developer Support */}
        <Card className="p-8 space-y-8 flex flex-col justify-between border-slate-200/80 shadow-2xs rounded-2xl">
          <div className="space-y-6 text-center">
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-slate-900">Developer Support</h2>
              <p className="text-sm font-normal text-slate-500 max-w-sm mx-auto leading-relaxed">
                Need urgent help, server support, or custom software modifications? Connect with us directly.
              </p>
            </div>

            {/* Action Buttons Stack */}
            <div className="space-y-3 max-w-md mx-auto pt-2">
              <a 
                href="mailto:support@nestbeans.com" 
                className="w-full py-3.5 px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl shadow-sm flex items-center justify-center gap-2.5 transition-all cursor-pointer"
              >
                <Mail className="w-4.5 h-4.5" />
                <span>Email Technical Support</span>
              </a>

              <a 
                href="tel:+917439010881" 
                className="w-full py-3.5 px-6 bg-teal-700 hover:bg-teal-800 text-white font-semibold text-sm rounded-xl shadow-sm flex items-center justify-center gap-2.5 transition-all cursor-pointer"
              >
                <Phone className="w-4.5 h-4.5" />
                <span>Call: +91 74390 10881</span>
              </a>

              <a 
                href="https://nestbeans.com" 
                target="_blank" 
                rel="noreferrer"
                className="w-full py-3.5 px-6 bg-slate-100 hover:bg-slate-200/80 text-slate-700 font-semibold text-sm rounded-xl border border-slate-200 flex items-center justify-center gap-2.5 transition-all cursor-pointer"
              >
                <Globe className="w-4.5 h-4.5 text-slate-500" />
                <span>Visit Nestbeans Website</span>
              </a>
            </div>
          </div>

          {/* Active Maintenance Agreement Card */}
          <div className="p-4.5 rounded-2xl bg-emerald-50/60 border border-emerald-100 flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-700 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">Active Maintenance Agreement</p>
              <p className="text-xs text-slate-500 font-normal mt-0.5">Your system is fully monitored & protected.</p>
            </div>
          </div>
        </Card>

        {/* Right Column: Grow & Customize Your CRM */}
        <Card className="p-8 space-y-8 flex flex-col justify-between border-slate-200/80 shadow-2xs rounded-2xl">
          <div className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2.5">
                <Rocket className="w-5 h-5 text-blue-600" />
                <span>Grow & Customize Your CRM</span>
              </h2>
              <p className="text-sm font-normal text-slate-500 leading-relaxed">
                Your CRM is fully customizable. If your business workflows change or you require additional features, our development team at Nestbeans can implement them for you.
              </p>
            </div>

            {/* 2x2 Customization Features Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-1">
              {/* Custom Features */}
              <div className="flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                  <Code className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Custom Features</h4>
                  <p className="text-xs text-slate-500 font-normal mt-0.5 leading-relaxed">
                    Custom tables, statuses, pipelines, automated reports, or role permissions.
                  </p>
                </div>
              </div>

              {/* API & Integrations */}
              <div className="flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                  <Link2 className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">API & Integrations</h4>
                  <p className="text-xs text-slate-500 font-normal mt-0.5 leading-relaxed">
                    Integrate WhatsApp automation, SMS gateways, payment gates, or email marketing platforms.
                  </p>
                </div>
              </div>

              {/* Performance & Speed */}
              <div className="flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center shrink-0 mt-0.5">
                  <Gauge className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Performance & Speed</h4>
                  <p className="text-xs text-slate-500 font-normal mt-0.5 leading-relaxed">
                    Database optimization, script tuning, and caching setup to handle large customer volumes.
                  </p>
                </div>
              </div>

              {/* Server & Backups */}
              <div className="flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-cyan-50 border border-cyan-100 text-cyan-600 flex items-center justify-center shrink-0 mt-0.5">
                  <HardDrive className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Server & Backups</h4>
                  <p className="text-xs text-slate-500 font-normal mt-0.5 leading-relaxed">
                    Cloud migrations, regular database backups, SSL setups, and security patching.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Royal Blue Callout Banner */}
          <div className="p-5.5 rounded-2xl bg-blue-600 text-white space-y-1 shadow-sm">
            <p className="text-sm font-medium leading-relaxed">
              Need a feature? Write down a brief description of what you want to achieve and click on "Email Technical Support" to discuss it with our team for an estimate!
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
