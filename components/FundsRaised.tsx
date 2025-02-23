'use client';

import { motion } from "framer-motion";
import { useInView } from "framer-motion";

import { useRef, useState, useEffect } from "react";

export const FundsRaised = () => {
  const ref = useRef(null);
  const isInView = useInView(ref);
  const [count, setCount] = useState(0);
  const target = 674000; // $674K

  useEffect(() => {
    if (isInView) {
      const duration = 2000; // 2 seconds
      const steps = 50;
      const stepValue = target / steps;
      let current = 0;

      const timer = setInterval(() => {
        current += stepValue;
        if (current >= target) {
          setCount(target);
          clearInterval(timer);
        } else {
          setCount(current);
        }
      }, duration / steps);

      return () => clearInterval(timer);
    }
  }, [isInView]);

  return (
    <section className="py-20 bg-muted">
      <div className="container">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h2 className="text-3xl md:text-4xl font-serif mb-4">Funds Raised to Date</h2>
          <div className="text-5xl md:text-7xl font-bold text-primary animate-count-up">
            ${count.toLocaleString()}
          </div>
          <p className="mt-4 text-lg text-muted-foreground">
            Supporting cancer patients and their families
          </p>
        </motion.div>
      </div>
    </section>
  );
};
