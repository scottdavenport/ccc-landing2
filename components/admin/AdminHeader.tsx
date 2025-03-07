'use client';

import { UserButton } from '@clerk/nextjs';
import { ConnectionStatus } from '@/components/admin/ConnectionStatus';
import { Bell, Moon, Sun, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState, useEffect } from 'react';

export function AdminHeader() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Handle theme toggle
  useEffect(() => {
    setIsMounted(true);
    const isDark = document.documentElement.classList.contains('dark');
    setIsDarkMode(isDark);
  }, []);

  const toggleTheme = () => {
    if (isMounted) {
      const newMode = !isDarkMode;
      setIsDarkMode(newMode);
      document.documentElement.classList.toggle('dark');
      localStorage.setItem('theme', newMode ? 'dark' : 'light');
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full border-b bg-white dark:border-gray-700 dark:bg-gray-800 lg:pl-72">
      <div className="flex flex-1 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left side - Title (visible on mobile) and Search */}
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white lg:hidden">CCC Admin</h1>
          
          <div className="hidden md:flex relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
            <Input 
              type="search" 
              placeholder="Search..." 
              className="w-64 rounded-md border-gray-200 bg-white pl-8 text-sm text-gray-900 focus:border-primary focus:ring-primary dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
            />
          </div>
        </div>

        {/* Right side - Status indicators, notifications, theme toggle, user button */}
        <div className="flex items-center space-x-3">
          <div className="hidden md:flex items-center space-x-3">
            <ConnectionStatus type="neon" />
            <ConnectionStatus type="cloudinary" />
          </div>
          
          <Button variant="ghost" size="icon" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
            <Bell className="h-5 w-5" />
            <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">3</span>
            <span className="sr-only">Notifications</span>
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleTheme} 
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            {isDarkMode ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
            <span className="sr-only">Toggle theme</span>
          </Button>
          
          <div className="relative">
            <UserButton 
              afterSignOutUrl="/" 
              appearance={{
                elements: {
                  userButtonAvatarBox: "h-8 w-8 rounded-full border-2 border-gray-200 dark:border-gray-700"
                }
              }}
            />
          </div>
        </div>
      </div>
    </header>
  );
}
