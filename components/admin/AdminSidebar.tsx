'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Menu } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { adminNavItems } from '@/lib/constants/admin-nav';

/**
 * AdminSidebar component provides navigation for the admin section
 * 
 * @component
 * @example
 * ```tsx
 * // In your admin layout
 * export default function AdminLayout({ children }: { children: React.ReactNode }) {
 *   return (
 *     <div>
 *       <AdminSidebar />
 *       {children}
 *     </div>
 *   );
 * }
 * ```
 * 
 * Features:
 * - Responsive design with mobile toggle
 * - Active state highlighting
 * - Smooth transitions
 * - Accessible navigation
 */
export function AdminSidebar() {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      {/* Mobile toggle */}
      <Button
        variant="ghost"
        className="fixed top-4 left-4 z-40 lg:hidden"
        size="icon"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        <Menu className="h-6 w-6" />
        <span className="sr-only">Toggle navigation menu</span>
      </Button>

      {/* Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 z-30 h-screen w-64 border-r bg-background transition-transform duration-200 ease-in-out lg:translate-x-0',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-16 items-center border-b px-6">
          <Link href="/admin" className="font-semibold">
            CCC Admin
          </Link>
        </div>

        <nav className="space-y-1 px-3 py-4">
          {adminNavItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'group flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground',
                  isActive ? 'bg-accent text-accent-foreground' : 'text-muted-foreground'
                )}
                onClick={() => setIsMobileOpen(false)}
              >
                <item.icon className="mr-3 h-5 w-5" />
                <span>{item.title}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
} 