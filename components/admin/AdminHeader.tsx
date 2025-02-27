'use client';

import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';

import { CloudinaryStatus } from '@/components/admin/CloudinaryStatus';
import { ConnectionStatus } from '@/components/admin/ConnectionStatus';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth';

export function AdminHeader() {
  const { signOut } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await signOut();
      // Clear any client-side cache
      if (typeof window !== 'undefined') {
        window.localStorage.clear();
        window.sessionStorage.clear();
        // Clear any cookies by setting them to expire
        document.cookie.split(';').forEach(cookie => {
          document.cookie = cookie
            .replace(/^ +/, '')
            .replace(/=.*/, `=;expires=${new Date().toUTCString()};path=/`);
        });
      }
      // Redirect to login page
      router.push('/admin/login');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  return (
    <header className="bg-white shadow">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">CCC Admin</h1>
          <div className="flex items-center space-x-4">
            <ConnectionStatus />
            <CloudinaryStatus />
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleLogout}
              className="flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
