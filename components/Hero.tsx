'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';

import { Navigation } from './Navigation';

/**
 * Animation configuration for the hero section elements
 */
const animations = {
  /** Logo animation settings */
  logo: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 1, ease: 'easeOut' },
  },
  /** Content animation settings */
  content: {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.8, delay: 0.3, ease: 'easeOut' },
  },
  /** Donate button animation settings */
  button: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    transition: { duration: 0.5, delay: 0.6 },
    hover: {
      scale: 1.02,
      transition: { duration: 0.2 },
    },
    tap: { scale: 0.98 },
  },
  /** Bouncing arrow animation settings */
  arrow: {
    initial: { opacity: 0, y: -10 },
    animate: { opacity: 1, y: 10 },
    transition: {
      repeat: Infinity,
      repeatType: 'reverse' as const, // Type assertion to fix TypeScript error
      duration: 1.5,
      ease: 'easeInOut',
    },
  },
};

/**
 * The hero section component for the landing page
 *
 * @remarks
 * This component creates an animated hero section with:
 * - A full-screen gradient background
 * - Navigation menu
 * - Animated logo
 * - Mission statement
 * - Call-to-action button
 * - Bouncing scroll indicator
 *
 * All animations are handled by Framer Motion for smooth, performant transitions.
 *
 * @example
 * ```tsx
 * function LandingPage() {
 *   return (
 *     <main>
 *       <Hero />
 *       <OtherContent />
 *     </main>
 *   );
 * }
 * ```
 */
export const Hero = () => {
  return (
    // This is our main section - it takes up the whole screen and has pretty colors
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-b from-ccc-teal-dark via-ccc-teal to-ccc-teal-light text-white overflow-hidden">
      {/* Our navigation menu goes at the top */}
      <Navigation />

      {/* These are like layers of paint that make our background look fancy */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/50 via-black/20 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-ccc-teal-dark/80 via-transparent to-transparent" />

      {/* This container holds all our main content */}
      <div className="container relative z-10 mx-auto px-4 py-20">
        <div className="flex flex-col items-center justify-center space-y-16 max-w-5xl mx-auto">
          {/* Animated logo */}
          <motion.div {...animations.logo} className="w-full max-w-lg mx-auto">
            <Image
              src="/ccc-logo.svg"
              alt="Craven Cancer Classic Logo"
              width={800}
              height={400}
              className="w-full h-auto filter drop-shadow-2xl" // Add a nice shadow
            />
          </motion.div>

          {/* Event details section */}
          <motion.div {...animations.content} className="text-center space-y-4">
            {/* Event date and location */}
            <div className="inline-flex flex-col md:flex-row items-center gap-3 md:gap-6 px-6 py-3 bg-white/10 backdrop-blur-sm rounded-full">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <span className="text-lg font-medium">September 19, 2025</span>
              </div>
              <div className="hidden md:block w-px h-6 bg-white/30" />
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <span className="text-lg font-medium">New Bern Golf & CC</span>
              </div>
            </div>

            {/* Animated content section */}
            <div className="pt-4">
              {/* Our mission statement */}
              <p className="text-xl md:text-2xl font-light text-ccc-gray-light max-w-2xl mx-auto leading-relaxed">
                Join us in our mission to support cancer patients through the power of golf
              </p>
            </div>

            {/* Animated call-to-action button */}
            <motion.button
              initial={animations.button.initial}
              animate={animations.button.animate}
              transition={animations.button.transition}
              whileHover={animations.button.hover}
              whileTap={animations.button.tap}
              className="mt-8 bg-white hover:bg-ccc-gray-light text-ccc-teal-dark text-xl px-16 py-6 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 uppercase tracking-wider font-bold ring-1 ring-white/10"
            >
              Donate Now
            </motion.button>
          </motion.div>
        </div>

        {/* Animated scroll indicator */}
        <motion.div
          {...animations.arrow}
          className="fixed bottom-0 left-1/2 transform -translate-x-1/2"
        >
          {/* This is our arrow shape */}
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" className="text-white">
            <path
              d="M7 13L12 18L17 13M7 6L12 11L17 6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </motion.div>
      </div>
    </section>
  );
};
