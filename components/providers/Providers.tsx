'use client';

import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { ReactNode } from 'react';
import { AuthProvider } from '@/lib/auth';
import { theme } from '@/lib/mui-theme';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <AuthProvider>
      <NextThemesProvider
        attribute="class"
        defaultTheme="light"
        enableSystem={false}
        disableTransitionOnChange
        forcedTheme="light"
      >
        <MuiThemeProvider theme={theme}>
          {children}
        </MuiThemeProvider>
      </NextThemesProvider>
    </AuthProvider>
  );
}
