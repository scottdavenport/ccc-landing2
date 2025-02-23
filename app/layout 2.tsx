import './globals.css'
import type { Metadata } from 'next'
import { Navigation } from '@/components/Navigation'

export const metadata: Metadata = {
  title: 'CCC Landing',
  description: 'Competitive Coding Championship - Where coding meets competition',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-background text-text-primary">
        <Navigation />
        {children}
      </body>
    </html>
  )
}
