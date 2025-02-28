'use client';

import { UserButton } from '@clerk/nextjs';
import { ConnectionStatus } from '@/components/admin/ConnectionStatus';

export function AdminHeader() {
  return (
    <header className="bg-white shadow">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">CCC Admin</h1>
          <div className="flex items-center space-x-4">
            <ConnectionStatus type="neon" />
            <ConnectionStatus type="cloudinary" />
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </div>
    </header>
  );
}
