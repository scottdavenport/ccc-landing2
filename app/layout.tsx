import './globals.css';
import '@/styles/embla-carousel.css';

import { Inter } from 'next/font/google';

import { Providers } from '@/components/providers/Providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Craven Cancer Classic',
  description: 'Charity Golf Tournament',
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
