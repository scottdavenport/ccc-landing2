// Hi! 👋 This is the main page of our website. Think of it like the cover of a book!

// First, we need to bring in all the pieces we'll use to build our page
// Just like getting all your LEGO pieces before building something
import { ErrorBoundary } from '@/components/ErrorBoundary'; // A safety net if something goes wrong
import { FundsRaised } from '@/components/FundsRaised'; // Shows how much money we've raised
import { Hero } from '@/components/Hero'; // The big welcome banner at the top

import { PastWinners } from '@/components/PastWinners'; // Shows previous tournament winners
import SponsorCarousel from '@/components/SponsorCarousel'; // Shows all our helpful sponsors in a beautiful carousel

export const dynamic = 'force-dynamic';

// This is our main page - it's like putting all our LEGO pieces together
export default function HomePage() {
  return (
    // main is like a big box that holds everything
    // min-h-screen means it will be at least as tall as your screen
    <main className="min-h-screen">
      {/* We wrap each section in an ErrorBoundary - it's like having a backup plan
          if something breaks, the whole page won't break with it! */}
      <ErrorBoundary>
        <Hero /> {/* The big welcome section at the top */}
      </ErrorBoundary>
      <ErrorBoundary>
        <FundsRaised /> {/* Shows our fundraising progress */}
      </ErrorBoundary>
      <ErrorBoundary>
        <SponsorCarousel /> {/* Shows all our sponsors in an interactive carousel */}
      </ErrorBoundary>
      <ErrorBoundary>
        <PastWinners /> {/* Shows who won before */}
      </ErrorBoundary>
    </main>
  );
}
