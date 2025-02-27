import type { Metadata } from 'next';

import { AdminHeader } from '@/components/admin/AdminHeader';

export const metadata: Metadata = {
  title: 'CCC Admin',
  description: 'Admin dashboard for CCC',
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader />
      <main>
        <div className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">{children}</div>
      </main>
    </div>
  );
}
