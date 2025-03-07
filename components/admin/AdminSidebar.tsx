'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';
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
 * - Dark mode support
 */
export function AdminSidebar() {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const pathname = usePathname();
  
  // Close sidebar when route changes on mobile
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  return (
    <>
      {/* Mobile toggle */}
      <Button
        variant="ghost"
        className="fixed top-4 left-4 z-40 lg:hidden"
        size="icon"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        aria-label="Toggle navigation menu"
      >
        <Menu className="h-6 w-6" />
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
          'fixed top-0 left-0 z-40 h-screen w-72 border-r bg-white dark:bg-gray-800 shadow-sm transition-transform duration-300 ease-in-out lg:translate-x-0',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Sidebar Header with Logo */}
        <div className="flex h-16 items-center justify-between border-b px-6 dark:border-gray-700">
          <Link 
            href="/admin" 
            className="flex items-center space-x-2"
          >
            <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center">
              <span className="text-white font-bold text-sm">CCC</span>
            </div>
            <span className="font-semibold text-gray-900 dark:text-white">Admin</span>
          </Link>
          
          {/* Close button - mobile only */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setIsMobileOpen(false)}
            aria-label="Close navigation menu"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Navigation Links */}
        <div className="px-3 py-6">
          <div className="mb-6 px-4">
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Main
            </h3>
            <nav className="space-y-1">
              {adminNavItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'group flex items-center rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200',
                      isActive 
                        ? 'bg-primary/10 text-primary dark:bg-primary/20' 
                        : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700/50'
                    )}
                  >
                    <item.icon className={cn(
                      "mr-3 h-5 w-5 flex-shrink-0 transition-colors duration-200",
                      isActive 
                        ? 'text-primary' 
                        : 'text-gray-500 group-hover:text-gray-700 dark:text-gray-400 dark:group-hover:text-gray-300'
                    )} />
                    <span>{item.title}</span>
                    
                    {/* Active indicator */}
                    {isActive && (
                      <span className="ml-auto h-2 w-2 rounded-full bg-primary"></span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>
          
          {/* Help Section */}
          <div className="mt-auto px-4 py-4">
            <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-700/50">
              <h4 className="mb-1 text-sm font-medium text-gray-900 dark:text-white">Need Help?</h4>
              <p className="text-xs text-gray-500 dark:text-gray-400">Check our documentation or contact support</p>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-3 w-full text-xs"
                asChild
              >
                <Link href="/docs">View Documentation</Link>
              </Button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
} 