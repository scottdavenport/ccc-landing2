'use client';

import React, { useCallback, useEffect, useState } from 'react';
import type { EmblaOptionsType } from 'embla-carousel';
import AutoPlay from 'embla-carousel-autoplay';
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import { cn } from '@/lib/utils';
import { SponsorLightbox } from './SponsorLightbox';


import { supabase } from '@/lib/supabase/client';
import { CldImage } from 'next-cloudinary';

const OPTIONS: EmblaOptionsType = {
  loop: true,
  align: 'center',
  containScroll: 'trimSnaps',
  dragFree: true,
  skipSnaps: true,
  inViewThreshold: 0.7,
  slidesToScroll: 1,
  duration: 20,
  breakpoints: {
    '(max-width: 640px)': { dragFree: true },
    '(min-width: 641px)': { dragFree: true },
  },
};

const AUTOPLAY_OPTIONS = {
  delay: 3500,
  stopOnInteraction: true,
  stopOnMouseEnter: true,
  rootNode: (emblaRoot: HTMLElement) => emblaRoot.parentElement,
};

type TransformedSponsor = {
  name: string;
  level: string;
  amount: number;
  cloudinary_public_id: string | null;
  year: number;
};

export default function SponsorCarousel() {
  const [sponsors, setSponsors] = useState<TransformedSponsor[]>([]);
  const [loading, setLoading] = useState(true);
  const [emblaRef, emblaApi] = useEmblaCarousel(OPTIONS, [AutoPlay(AUTOPLAY_OPTIONS)]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [parallaxValues, setParallaxValues] = useState<number[]>([]);
  const [selectedSponsor, setSelectedSponsor] = useState<TransformedSponsor | null>(null);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();

    const updateScrollState = () => {
      setCanScrollPrev(emblaApi.canScrollPrev());
      setCanScrollNext(emblaApi.canScrollNext());

      // Update scroll progress
      const progress = Math.max(0, Math.min(1, emblaApi.scrollProgress()));
      setScrollProgress(progress * 100);

      // Update parallax values
      try {
        const scrollSnap = emblaApi.scrollSnapList();
        const location = emblaApi.scrollProgress();

        const styles = sponsors.map((_, index) => {
          const slidePosition = scrollSnap[index] || 0;
          const distance = Math.abs(location - slidePosition);
          return Math.min(1, Math.max(0, 1 - distance * 2)) * 50;
        });

        setParallaxValues(styles);
      } catch (error) {
        console.error('Error calculating parallax:', error);
        setParallaxValues(sponsors.map(() => 0));
      }
    };

    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
    emblaApi.on('select', updateScrollState);
    emblaApi.on('reInit', updateScrollState);

    // Initialize scroll state
    updateScrollState();

    return () => {
      emblaApi.off('select', updateScrollState);
      emblaApi.off('reInit', updateScrollState);
    };
  }, [emblaApi, onSelect, sponsors]);

  useEffect(() => {
    async function fetchSponsors() {
      try {
        console.log('Fetching sponsors...');
        const { data, error } = await supabase
          .schema('api')
          .from('sponsors')
          .select(`
            *,
            sponsor_levels (
              name,
              amount
            )
          `)
          .order('year', { ascending: false });

        if (error) {
          console.error('Supabase error:', error.message);
          console.error('Error details:', error);
          return;
        }

        if (!data || data.length === 0) {
          console.log('No sponsors found');
          return;
        }

        console.log('Fetched sponsors:', data);

        // Transform the data to match the component's needs
        const transformedSponsors = data.map(sponsor => ({
          name: sponsor.name,
          level: sponsor.sponsor_levels.name,
          amount: sponsor.sponsor_levels.amount,
          cloudinary_public_id: sponsor.cloudinary_public_id || null,
          year: sponsor.year
        }));

        setSponsors(transformedSponsors);
      } catch (error) {
        console.error('Error fetching sponsors:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchSponsors();
  }, []);

  // Debug: Log sponsors state changes
  useEffect(() => {
    console.log('Current sponsors:', sponsors);
  }, [sponsors]);

  if (loading) {
    return (
      <div className="bg-white py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12 animate-pulse bg-gray-200 h-10 w-64 mx-auto rounded" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse bg-gray-200 h-64 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!sponsors.length) {
    return null;
  }

  return (
    <div className="bg-white py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center mb-12">Our Sponsors</h2>

        <div className="relative px-12">
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex cursor-grab active:cursor-grabbing">
              {sponsors.map((sponsor, index) => (
                <div
                  key={`${sponsor.name}-${index}`}
                  className={cn(
                    'flex-[0_0_100%] sm:flex-[0_0_50%] lg:flex-[0_0_33.33%] min-w-0 px-4',
                    'transition-all duration-500 ease-out',
                    selectedIndex === index ? 'opacity-100 scale-100' : 'opacity-80 scale-95'
                  )}
                >
                  <div
                    className={cn(
                      'bg-white rounded-xl shadow-lg p-6 h-full',
                      'transition-all duration-500 ease-out transform',
                      selectedIndex === index
                        ? 'shadow-xl scale-105 border-2 border-blue-500/20'
                        : 'shadow-md scale-100 border border-gray-100',
                      'hover:shadow-lg hover:scale-[1.02] hover:border-blue-500/10'
                    )}
                  >
                    <div
                      className="relative aspect-square cursor-pointer overflow-hidden rounded-xl bg-white p-6 group"
                      style={{
                        transform: parallaxValues[index] !== undefined
                          ? `scale(${1 + parallaxValues[index] * 0.001}) rotate(${parallaxValues[index] * 0.05}deg)`
                          : 'none',
                        transition: 'transform 0.3s ease-out'
                      }}
                      onClick={() => setSelectedSponsor(sponsor)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={e => e.key === 'Enter' && setSelectedSponsor(sponsor)}
                    >
                      <div className="relative w-full h-full">
                        {sponsor.cloudinary_public_id ? (
                          <CldImage
                            src={sponsor.cloudinary_public_id}
                            alt={`${sponsor.name} logo`}
                            fill
                            className="object-contain p-4 transition-all duration-500 ease-out group-hover:scale-110 group-hover:rotate-[-2deg] motion-safe:animate-float"
                            sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            No image available
                          </div>
                        )}
                      </div>
                      <div className="absolute top-2 right-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-3 py-1 rounded-lg text-sm font-semibold shadow-md">
                        {sponsor.amount.toLocaleString()}
                      </div>
                      <div className="absolute bottom-2 left-2 bg-gradient-to-r from-gray-800 to-gray-900 text-white px-3 py-1 rounded-lg text-sm font-semibold shadow-md">
                        {sponsor.level}
                      </div>
                    </div>
                    <div className="flex flex-col items-center gap-3 mt-6">
                      <h3 className="text-lg font-semibold text-gray-900 text-center">{sponsor.name}</h3>
                      <span
                        className={cn(
                          'px-4 py-1.5 rounded-full text-sm font-medium',
                          'shadow-sm border transition-colors duration-300',
                          sponsor.level === 'Champion'
                            ? 'bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 border-blue-200'
                            : 'bg-gradient-to-r from-amber-50 to-amber-100 text-amber-700 border-amber-200'
                        )}
                      >
                        {sponsor.level}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Scroll Buttons */}
          <button
            onClick={scrollPrev}
            disabled={!canScrollPrev}
            className={cn(
              'absolute left-0 top-1/2 -translate-y-1/2 z-10',
              'w-10 h-10 rounded-full bg-white shadow-lg',
              'flex items-center justify-center',
              'transition-all duration-300 ease-out',
              'hover:bg-white hover:scale-110',
              'disabled:opacity-50 disabled:pointer-events-none',
              'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
            )}
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-6 h-6 text-gray-700" />
          </button>

          <button
            onClick={scrollNext}
            disabled={!canScrollNext}
            className={cn(
              'absolute right-0 top-1/2 -translate-y-1/2 z-10',
              'w-10 h-10 rounded-full bg-white shadow-lg',
              'flex items-center justify-center',
              'transition-all duration-300 ease-out',
              'hover:bg-white hover:scale-110',
              'disabled:opacity-50 disabled:pointer-events-none',
              'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
            )}
            aria-label="Next slide"
          >
            <ChevronRight className="w-6 h-6 text-gray-700" />
          </button>

          {/* Progress Bar */}
          <div className="mt-8 px-4">
            <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 transition-all duration-300 ease-out rounded-full"
                style={{ width: `${scrollProgress}%` }}
              />
            </div>
            <div className="flex justify-between items-center mt-2 text-sm text-gray-500">
              <span>{selectedIndex + 1} of {sponsors.length}</span>
              <button
                onClick={() => emblaApi?.scrollTo(0)}
                className="text-blue-500 hover:text-blue-600 font-medium"
              >
                Reset
              </button>
            </div>
          </div>
        </div>

        <SponsorLightbox
          isOpen={!!selectedSponsor}
          onClose={() => setSelectedSponsor(null)}
          sponsor={selectedSponsor}
        />
      </div>
    </div>
  );
}
