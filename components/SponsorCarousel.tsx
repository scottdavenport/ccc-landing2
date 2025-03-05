'use client';

import React, { useCallback, useEffect, useState } from 'react';
import type { EmblaOptionsType, EmblaCarouselType } from 'embla-carousel';
import AutoPlay from 'embla-carousel-autoplay';
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import { cn } from '@/lib/utils';
import { SponsorLightbox } from './SponsorLightbox';
import { DotButton, useDotButton } from './EmblaCarouselDotButton';

import { CldImage } from 'next-cloudinary';
import { SponsorWithLevel } from '@/types/sponsors';

import '@/styles/embla-carousel.css';

const OPTIONS: EmblaOptionsType = {
  loop: true,
  align: 'center',
  containScroll: 'trimSnaps',
  dragFree: true,
  skipSnaps: false,
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
  website_url: string | null;
  year: number;
};

export default function SponsorCarousel() {
  const [sponsors, setSponsors] = useState<TransformedSponsor[]>([]);
  const [loading, setLoading] = useState(true);
  const [emblaRef, emblaApi] = useEmblaCarousel(OPTIONS, [AutoPlay(AUTOPLAY_OPTIONS)]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [selectedSponsor, setSelectedSponsor] = useState<TransformedSponsor | null>(null);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  const onNavButtonClick = useCallback((emblaApi: EmblaCarouselType) => {
    const autoplay = emblaApi?.plugins()?.autoplay;
    if (!autoplay) return;

    const resetOrStop =
      autoplay.options.stopOnInteraction === false
        ? autoplay.reset
        : autoplay.stop;

    resetOrStop();
  }, []);

  const { scrollSnaps, onDotButtonClick } = useDotButton(
    emblaApi,
    onNavButtonClick
  );

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
        
        const response = await fetch('/api/sponsors');
        if (!response.ok) {
          throw new Error(`Error fetching sponsors: ${response.status}`);
        }
        
        const data = await response.json();

        if (!data || data.length === 0) {
          console.log('No sponsors found');
          return;
        }

        console.log('Fetched sponsors:', data);

        // Transform the data to match the component's needs
        const transformedSponsors = data.map((sponsor: SponsorWithLevel) => ({
          name: sponsor.name,
          level: sponsor.level_name || sponsor.level,
          amount: sponsor.level_amount || (sponsor.sponsor_levels?.amount || 0),
          cloudinary_public_id: sponsor.cloudinary_public_id || null,
          website_url: sponsor.website_url || null,
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

        <div className="relative w-full overflow-hidden">
          <div className="embla">
            <div className="embla__viewport overflow-hidden" ref={emblaRef}>
              <div className="embla__container flex gap-6">
                {sponsors.map((sponsor, index) => (
                  <div 
                    key={`${sponsor.name}-${index}`} 
                    className={cn(
                      "embla__slide flex-shrink-0 w-60 sm:w-80 md:w-96 lg:w-[28rem] transition-all duration-300",
                      selectedIndex === index ? "scale-105" : "scale-100"
                    )}
                  >
                    <div className="h-full p-4">
                      <div 
                        className={cn(
                          "relative h-full rounded-xl bg-white shadow-md p-6 transition-all duration-300",
                          selectedIndex === index ? "shadow-xl border-2 border-blue-500/20" : "border border-gray-100"
                        )}
                      >
                        <div
                          className="relative aspect-square cursor-pointer group mb-4"
                          onClick={() => setSelectedSponsor(sponsor)}
                          role="button"
                          tabIndex={0}
                          onKeyDown={e => e.key === 'Enter' && setSelectedSponsor(sponsor)}
                        >
                          {sponsor.cloudinary_public_id ? (
                            <CldImage
                              src={`sponsors/${sponsor.cloudinary_public_id}`}
                              alt={`${sponsor.name} logo`}
                              fill
                              className="object-contain bg-white rounded-lg p-4 transition-all duration-300 group-hover:scale-105"
                              sizes="(max-width: 640px) 60vw, (max-width: 768px) 80vw, (max-width: 1024px) 96vw, 28rem"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400 bg-white rounded-lg">
                              No image available
                            </div>
                          )}
                        </div>
                        
                        <div className="absolute top-2 right-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-3 py-1 rounded-lg text-sm font-semibold shadow-md">
                          ${sponsor.amount.toLocaleString()}
                        </div>
                        
                        <div className="text-center">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2 truncate">{sponsor.name}</h3>
                          <span
                            className={cn(
                              'inline-block px-3 py-1 rounded-full text-sm font-medium',
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
                  </div>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={scrollPrev}
            disabled={!canScrollPrev}
            className={cn(
              'absolute left-2 top-1/2 -translate-y-1/2 z-10',
              'w-10 h-10 rounded-full bg-white/90 shadow-lg',
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
              'absolute right-2 top-1/2 -translate-y-1/2 z-10',
              'w-10 h-10 rounded-full bg-white/90 shadow-lg',
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
        </div>

        <div className="flex justify-center mt-6">
          <div className="embla__dots">
            {scrollSnaps.map((_, index) => (
              <DotButton
                key={index}
                onClick={() => onDotButtonClick(index)}
                className={cn(
                  'embla__dot',
                  index === selectedIndex ? 'embla__dot--selected' : ''
                )}
              />
            ))}
          </div>
        </div>

        <div className="mt-4 text-center">
          <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-medium text-gray-400">
            {sponsors.length} {sponsors.length === 1 ? 'Sponsor' : 'Sponsors'}
          </span>
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
