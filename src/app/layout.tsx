import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '@/app/globals.css';
import { AuthProvider } from '@/lib/context/AuthContext';
import { TenantProvider } from '@/lib/context/TenantContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'NestBeans Multi-Tenant Gym CRM SaaS',
  description: 'Production-ready modern Gym CRM SaaS platform with database-level multi-tenant RLS isolation.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="light">
      <body className={`${inter.className} bg-slate-50 text-slate-900 antialiased min-h-screen selection:bg-emerald-600 selection:text-white`}>
        <AuthProvider>
          <TenantProvider>
            {children}
          </TenantProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
