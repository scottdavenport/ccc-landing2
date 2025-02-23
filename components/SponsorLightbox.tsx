'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

type SponsorLightboxProps = {
  isOpen: boolean;
  onClose: () => void;
  sponsor: {
    name: string;
    level: string;
    imageUrl: string;
    website?: string;
  } | null;
};

export function SponsorLightbox({ isOpen, onClose, sponsor }: SponsorLightboxProps) {
  if (!sponsor) return null;

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
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
                onClick={(e) => {
                  // Close if clicking the backdrop (not the content)
                  if (e.target === e.currentTarget) {
                    onClose();
                  }
                }}
              >
                <div 
                  className="relative flex flex-col items-center p-4 md:p-6 text-center bg-white rounded-xl shadow-2xl w-full max-w-[800px] max-h-[90vh] overflow-y-auto"
                  onClick={(e) => e.stopPropagation()} // Prevent clicks inside from closing
                >
                  <Dialog.Title className="sr-only">
                    {sponsor.name} Sponsor Details
                  </Dialog.Title>
                  <div className="w-full max-w-3xl mx-auto">
                  <Dialog.Close className="absolute right-4 top-4 rounded-full p-2 hover:bg-gray-100">
                    <X className="h-5 w-5" />
                  </Dialog.Close>
                  
                  <div className="relative w-full max-h-[50vh] aspect-[3/2] mb-6 bg-gray-50 rounded-lg overflow-hidden">
                    <Image
                      src={sponsor.imageUrl}
                      alt={`${sponsor.name} logo`}
                      fill
                      className="object-contain p-4"
                      sizes="(min-width: 800px) 800px, 90vw"
                      priority
                    />
                  </div>

                  <span 
                    className={cn(
                      "px-4 py-1.5 rounded-full text-sm font-medium mb-4",
                      sponsor.level === 'Champion' 
                        ? "bg-[#66D1FF] text-[#003D5B]"
                        : "bg-[#FFD700] text-[#8B6F00]"
                    )}
                  >
                    {sponsor.level}
                  </span>

                  {sponsor.website && (
                    <a
                      href={sponsor.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-[#003D5B] hover:text-[#66D1FF] transition-colors"
                    >
                      Visit Website
                      <svg
                        className="ml-1 h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                        />
                      </svg>
                    </a>
                  )}
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
