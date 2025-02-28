'use client';

import { ClerkProvider } from '@clerk/nextjs';
import { ReactNode } from 'react';

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  return <ClerkProvider>{children}</ClerkProvider>;
} 