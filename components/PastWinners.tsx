'use client';

import { motion } from "framer-motion";

const winners = [
  {
    year: 2023,
    name: "John Smith",
    score: 68,
    achievement: "Tournament Champion",
  },
  {
    year: 2023,
    name: "Sarah Johnson",
    score: 70,
    achievement: "Runner-up",
  },
  {
    year: 2023,
    name: "Michael Williams",
    score: 71,
    achievement: "Third Place",
  },
];

export const PastWinners = () => {
  return (
    <section className="py-20 bg-gradient-to-b from-white to-muted">
      <div className="container">
        <h2 className="text-3xl md:text-4xl font-serif text-center mb-12">Past Winners</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {winners.map((winner, index) => (
            <motion.div
              key={winner.name}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="glass-card rounded-lg p-6 text-center hover-lift"
            >
              <div className="mb-4">
                <span className="text-5xl font-serif text-primary">{winner.score}</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">{winner.name}</h3>
              <p className="text-muted-foreground mb-2">{winner.achievement}</p>
              <span className="text-sm text-accent font-medium">{winner.year}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
