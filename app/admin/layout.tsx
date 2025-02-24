import type { Metadata } from 'next';
import { ConnectionStatus } from '@/components/admin/ConnectionStatus';
import { CloudinaryStatus } from '@/components/admin/CloudinaryStatus';

export const metadata: Metadata = {
  title: 'CCC Admin',
  description: 'Admin dashboard for CCC',
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              CCC Admin
            </h1>
            <div className="flex items-center space-x-4">
              <ConnectionStatus />
              <CloudinaryStatus />
            </div>
          </div>
        </div>
      </header>
      <main>
        <div className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
}
