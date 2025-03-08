import './globals.css';
import '@/styles/embla-carousel.css';

import { Inter } from 'next/font/google';
import { Providers } from '@/app/providers';
import type { Metadata } from 'next';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Coastal Carolina Classic',
  description: 'Coastal Carolina Classic Golf Tournament',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
