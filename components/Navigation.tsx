'use client';

import { motion } from 'framer-motion';

export const Navigation = () => {
  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="fixed top-0 left-0 right-0 z-50 bg-transparent"
    >
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-end">
          <motion.a
            href="#about"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="text-white text-lg font-medium hover:text-ccc-gray-light transition-colors duration-200"
          >
            About the CCC
          </motion.a>
        </div>
      </div>
    </motion.nav>
  );
};
