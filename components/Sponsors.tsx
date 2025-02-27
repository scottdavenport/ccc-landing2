'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

import { SponsorLightbox } from './SponsorLightbox';

// Mock sponsor data
const sponsors = [
  {
    name: 'Tech Corp',
    level: 'Platinum',
    cloudinary_public_id: '/sponsor-placeholder.svg',
    amount: 50000,
    year: 2025,
    website: 'https://techcorp.example.com',
  },
  {
    name: 'Innovation Labs',
    level: 'Gold',
    cloudinary_public_id: '/sponsor-placeholder.svg',
    amount: 25000,
    year: 2025,
    website: 'https://innovationlabs.example.com',
  },
  {
    name: 'Future Systems',
    level: 'Silver',
    cloudinary_public_id: '/sponsor-placeholder.svg',
    amount: 10000,
    year: 2025,
    website: 'https://futuresystems.example.com',
  },
  {
    name: 'Digital Solutions',
    level: 'Bronze',
    cloudinary_public_id: '/sponsor-placeholder.svg',
    amount: 5000,
    year: 2025,
    website: 'https://digitalsolutions.example.com',
  },
];

export const Sponsors = () => {
  const [selectedSponsor, setSelectedSponsor] = useState<(typeof sponsors)[0] | null>(null);

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-3xl font-playfair text-center mb-8"
        >
          Our Sponsors
        </motion.h2>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 items-center justify-items-center"
        >
          {sponsors.map((sponsor, index) => (
            <motion.div
              key={sponsor.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="w-32 h-32 bg-white rounded-lg shadow-md flex items-center justify-center cursor-pointer hover:shadow-lg transition-all hover:scale-105"
              onClick={() => setSelectedSponsor(sponsor)}
            >
              <div className="relative w-full h-full p-4">
                <Image
                  src={sponsor.cloudinary_public_id || '/sponsor-placeholder.svg'}
                  alt={`${sponsor.name} logo`}
                  fill
                  className="object-contain"
                  sizes="128px"
                />
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      <SponsorLightbox
        isOpen={!!selectedSponsor}
        onClose={() => setSelectedSponsor(null)}
        sponsor={selectedSponsor}
      />
    </section>
  );
};
