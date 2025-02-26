'use client';

import React, { useCallback, useEffect, useState } from 'react';
import type { EmblaOptionsType, EmblaCarouselType } from 'embla-carousel';
import AutoPlay from 'embla-carousel-autoplay';
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import { cn } from '@/lib/utils';
import { SponsorLightbox } from './SponsorLightbox';
import { DotButton, useDotButton } from './EmblaCarouselDotButton';

import { supabase } from '@/lib/supabase/client';
import { CldImage } from 'next-cloudinary';

import '@/styles/embla-carousel.css';

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

        <div className="sponsor-embla embla">
          <div className="embla__viewport" ref={emblaRef}>
            <div className="embla__container">
              {sponsors.map((sponsor, index) => (
                <div
                  key={`${sponsor.name}-${index}`}
                  className="embla__slide"
                >
                  <div className="sponsor-slide h-full">
                    <div 
                      className={cn(
                        'sponsor-slide__content',
                        selectedIndex === index 
                          ? 'shadow-xl scale-105 border-2 border-blue-500/20' 
                          : 'shadow-md scale-100 border border-gray-100'
                      )}
                    >
                      <div
                        className="sponsor-slide__image-container cursor-pointer group"
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
                      
                      <div className="sponsor-slide__details">
                        <h3 className="sponsor-slide__name">{sponsor.name}</h3>
                        <span
                          className={cn(
                            'sponsor-slide__level',
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

          {/* Controls */}
          <div className="embla__controls mt-8">
            <div className="flex space-x-4">
              <button
                onClick={scrollPrev}
                disabled={!canScrollPrev}
                className={cn(
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
            </div>

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

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="sponsor-embla__progress">
              <div
                className="sponsor-embla__progress__bar"
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
