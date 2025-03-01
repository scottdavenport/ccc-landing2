'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginRedirect() {
  const router = useRouter();
  
  useEffect(() => {
    // Redirect to the Clerk login page
    router.replace('/admin/login/sign-in');
  }, [router]);
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-ccc-teal py-12 px-4 sm:px-6 lg:px-8">
      <div className="glass-card max-w-md w-full p-8 rounded-lg space-y-8 text-center">
        <p>Redirecting to login page...</p>
      </div>
    </div>
  );
} 