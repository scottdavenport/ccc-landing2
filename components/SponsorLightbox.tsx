'use client';

import React from 'react';
import { CldImage } from 'next-cloudinary';
import * as Dialog from '@radix-ui/react-dialog';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';

import { cn } from '@/lib/utils';

type SponsorLightboxProps = {
  isOpen: boolean;
  onClose: () => void;
  sponsor: {
    name: string;
    level: string;
    cloudinary_public_id: string | null;
    amount: number;
    year: number;
  } | null;
};

export function SponsorLightbox({ isOpen, onClose, sponsor }: SponsorLightboxProps) {
  if (!sponsor) return null;

  return (
    <Dialog.Root open={isOpen} onOpenChange={open => !open && onClose()}>
      <AnimatePresence>
        {isOpen && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-black/80"
              />
            </Dialog.Overlay>
            <Dialog.Content asChild>
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6"
                onClick={e => {
                  // Close if clicking the backdrop (not the content)
                  if (e.target === e.currentTarget) {
                    onClose();
                  }
                }}
              >
                <div
                  className="relative flex flex-col items-center p-4 md:p-6 text-center bg-white rounded-xl shadow-2xl w-full max-w-[800px] max-h-[90vh] overflow-y-auto"
                  onClick={e => e.stopPropagation()} // Prevent clicks inside from closing
                >
                  <Dialog.Title className="sr-only">{sponsor.name} Sponsor Details</Dialog.Title>
                  <div className="w-full max-w-3xl mx-auto">
                    <Dialog.Close className="absolute right-4 top-4 rounded-full p-2 hover:bg-gray-100">
                      <X className="h-5 w-5" />
                    </Dialog.Close>

                    <div className="relative w-full max-h-[50vh] aspect-[3/2] mb-6 bg-gray-50 rounded-lg overflow-hidden">
                      {sponsor.cloudinary_public_id ? (
                        <CldImage
                          src={sponsor.cloudinary_public_id}
                          alt={`${sponsor.name} logo`}
                          fill
                          className="object-contain p-4"
                          sizes="(min-width: 800px) 800px, 90vw"
                          priority
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          No image available
                        </div>
                      )}
                    </div>

                    <span
                      className={cn(
                        'px-4 py-1.5 rounded-full text-sm font-medium mb-4',
                        sponsor.level === 'Champion'
                          ? 'bg-[#66D1FF] text-[#003D5B]'
                          : 'bg-[#FFD700] text-[#8B6F00]'
                      )}
                    >
                      {sponsor.level}
                    </span>

                    <div className="text-lg font-bold mb-2">{sponsor.name}</div>
                    <div className="text-gray-600 mb-4">
                      {sponsor.amount.toLocaleString()} - {sponsor.year}
                    </div>


                  </div>
                </div>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}
