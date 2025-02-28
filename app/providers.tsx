'use client';

import { ClerkProvider } from '@clerk/nextjs';
import { ReactNode } from 'react';
import { Toaster } from '@/components/ui/toaster';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ClerkProvider>
      {children}
      <Toaster />
    </ClerkProvider>
  );
} 