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
    amount: number;
    cloudinary_public_id: string | null;
    year: number;
    website?: string;
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
                className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm"
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
                  className="relative w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all"
                  onClick={e => e.stopPropagation()} // Prevent clicks inside from closing
                >
                  <div className="absolute top-3 right-3">
                    <Dialog.Close className="rounded-full p-1.5 text-gray-400 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <X className="h-5 w-5" />
                    </Dialog.Close>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="relative aspect-square bg-gray-50 rounded-xl overflow-hidden">
                      {sponsor.cloudinary_public_id ? (
                        <CldImage
                          src={sponsor.cloudinary_public_id}
                          alt={`${sponsor.name} logo`}
                          fill
                          className="object-contain p-8"
                          sizes="(min-width: 768px) 50vw, 100vw"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          No image available
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col justify-center">
                      <Dialog.Title className="text-2xl font-bold leading-6 text-gray-900 mb-2">
                        {sponsor.name}
                      </Dialog.Title>
                      
                      <div className="flex items-center gap-3 mb-6">
                        <span
                          className={cn(
                            'px-3 py-1 rounded-full text-sm font-medium',
                            sponsor.level === 'Champion'
                              ? 'bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 border border-blue-200'
                              : 'bg-gradient-to-r from-amber-50 to-amber-100 text-amber-700 border border-amber-200'
                          )}
                        >
                          {sponsor.level}
                        </span>
                        
                        <span className="bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 border border-gray-200 px-3 py-1 rounded-full text-sm font-medium">
                          {sponsor.year}
                        </span>
                      </div>
                      
                      <div className="mb-6">
                        <div className="text-sm font-medium text-gray-500 mb-1">Sponsorship Amount</div>
                        <div className="text-3xl font-bold text-gray-900">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(sponsor.amount)}</div>
                      </div>
                      
                      <div className="mb-6">
                        <div className="text-sm font-medium text-gray-500 mb-1">About this Sponsor</div>
                        <p className="text-gray-700">
                          {sponsor.name} has been a valued {sponsor.level.toLowerCase()} sponsor since {sponsor.year}. 
                          Their generous contribution helps make our community events possible.
                        </p>
                      </div>
                      
                      {sponsor.website && (
                        <div className="mb-6">
                          <div className="text-sm font-medium text-gray-500 mb-1">Website</div>
                          <a 
                            href={sponsor.website} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-blue-600 hover:underline"
                          >
                            {sponsor.website.replace(/^https?:\/\//, '')}
                          </a>
                        </div>
                      )}
                      
                      <div className="flex flex-col sm:flex-row gap-3 mt-auto">
                        <button
                          type="button"
                          className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                          onClick={onClose}
                        >
                          Visit Website
                        </button>
                        <Dialog.Close className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2">
                          Close
                        </Dialog.Close>
                      </div>
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
