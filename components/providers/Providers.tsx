'use client';

import { ReactNode } from 'react';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { ClerkProvider } from '@clerk/nextjs';

import { theme } from '@/lib/mui-theme';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ClerkProvider>
      <NextThemesProvider
        attribute="class"
        defaultTheme="light"
        enableSystem={false}
        disableTransitionOnChange
        forcedTheme="light"
      >
        <MuiThemeProvider theme={theme}>{children}</MuiThemeProvider>
      </NextThemesProvider>
    </ClerkProvider>
  );
}
