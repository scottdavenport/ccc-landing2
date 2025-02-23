'use client';

import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import useEmblaCarousel from 'embla-carousel-react';
import type { EmblaOptionsType } from 'embla-carousel';
import AutoPlay from 'embla-carousel-autoplay';
import { cn } from '@/lib/utils';
import { SponsorLightbox } from './SponsorLightbox';
import { ChevronLeft, ChevronRight } from 'lucide-react';

type Sponsor = {
  name: string;
  level: 'Champion' | 'Eagle';
  imageUrl: string;
  year: number;
  website?: string;
};

const OPTIONS: EmblaOptionsType = {
  loop: true,
  align: 'center',
  containScroll: 'trimSnaps',
  dragFree: true,
  slidesToScroll: 1,
  inViewThreshold: 0.7,
  breakpoints: {
    '(min-width: 768px)': {
      dragFree: false
    }
  }
};

const AUTOPLAY_OPTIONS = {
  delay: 4000,
  stopOnInteraction: false,
  rootNode: (emblaRoot: HTMLElement) => emblaRoot.parentElement,
};

export default function SponsorCarousel() {
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [loading, setLoading] = useState(true);
  const [emblaRef, emblaApi] = useEmblaCarousel(OPTIONS, [AutoPlay(AUTOPLAY_OPTIONS)]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [selectedSponsor, setSelectedSponsor] = useState<Sponsor | null>(null);
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
  }, [emblaApi, onSelect]);

  useEffect(() => {
    // Create placeholder sponsors
    const placeholderSponsors: Sponsor[] = [
      {
        name: 'Champion Sponsor 1',
        level: 'Champion',
        imageUrl: '/sponsor-placeholder.svg',
        year: new Date().getFullYear(),
        website: 'https://example.com',
      },
      {
        name: 'Eagle Sponsor 1',
        level: 'Eagle',
        imageUrl: '/sponsor-placeholder.svg',
        year: new Date().getFullYear(),
        website: 'https://example.com',
      },
      {
        name: 'Champion Sponsor 2',
        level: 'Champion',
        imageUrl: '/sponsor-placeholder.svg',
        year: new Date().getFullYear(),
        website: 'https://example.com',
      },
      {
        name: 'Eagle Sponsor 2',
        level: 'Eagle',
        imageUrl: '/sponsor-placeholder.svg',
        year: new Date().getFullYear(),
        website: 'https://example.com',
      },
    ];

    setSponsors(placeholderSponsors);
    setLoading(false);
  }, []);

  if (loading) {
    return <div className="animate-pulse bg-gray-200 h-64 rounded-lg" />;
  }

  if (!sponsors.length) {
    return null;
  }

  return (
    <section className="bg-white py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center mb-12">Our Sponsors</h2>
        
        <div className="relative px-12">
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex cursor-grab active:cursor-grabbing">

            {sponsors.map((sponsor, index) => (
              <div 
                key={`${sponsor.name}-${index}`}
                className={cn(
                  "flex-[0_0_90%] sm:flex-[0_0_45%] md:flex-[0_0_30%] min-w-0 px-4",
                  "transition-all duration-300 ease-out",
                  selectedIndex === index ? 'opacity-100' : 'opacity-70'
                )}
              >
                <div 
                  className={cn(
                    "bg-white rounded-xl shadow-lg p-6 h-full",
                    "transition-all duration-300 ease-out transform",
                    selectedIndex === index ? 'shadow-xl scale-105' : 'shadow-md scale-100',
                    'hover:shadow-lg hover:scale-[1.02]'
                  )}
                >
                  <div 
                    className="relative aspect-[3/2] cursor-pointer transition-transform hover:scale-105"
                    onClick={() => setSelectedSponsor(sponsor)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && setSelectedSponsor(sponsor)}
                  >
                    <Image
                      src={sponsor.imageUrl}
                      alt={`${sponsor.name} logo`}
                      fill
                      className="object-contain p-4"
                      sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                    />
                  </div>
                  <div className="flex flex-col items-center gap-2 mt-4">
                    <h3 className="text-lg font-medium text-gray-900">{sponsor.name}</h3>
                    <span 
                      className={cn(
                        "px-4 py-1.5 rounded-full text-sm font-medium",
                        sponsor.level === 'Champion' 
                          ? "bg-blue-100 text-blue-700"
                          : "bg-amber-100 text-amber-700"
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

          {/* Navigation Dots */}
          <div className="flex justify-center gap-2 mt-6">
            {sponsors.map((_, index) => (
              <button
                key={index}
                className={cn(
                  "w-2 h-2 rounded-full transition-all duration-200",
                  selectedIndex === index 
                    ? "bg-blue-500 w-4"
                    : "bg-gray-300 hover:bg-gray-400"
                )}
                onClick={() => emblaApi?.scrollTo(index)}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>

        <SponsorLightbox
          isOpen={!!selectedSponsor}
          onClose={() => setSelectedSponsor(null)}
          sponsor={selectedSponsor}
        />
      </div>
    </section>
  );
}
