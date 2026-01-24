'use client';

import { Card } from '@/components/ui/apple-cards-carousel';
import { motion } from 'motion/react';

const DummyContent = ({ title, content }: { title: string; content: string }) => {
  return (
    <div className="bg-card dark:bg-muted/30 border border-border/50 p-8 md:p-14 rounded-3xl mb-4 text-left shadow-sm">
      <p className="text-muted-foreground text-base md:text-2xl font-sans max-w-3xl mx-auto leading-relaxed">
        <span className="font-bold text-foreground">{title}</span> {content}
      </p>
    </div>
  );
};

const data = [
  {
    category: 'Air Freight',
    title: 'Express Air & Next-Flight-Out.',
    src: '/air-cargo.png',
    content: (
      <DummyContent
        title="Speed Redefined."
        content="Our autonomous routing algorithms connect directly with major airlines to secure next-flight-out capability. From Imphal to New Delhi in under 6 hours, your critical cargo ignores traffic and takes to the skies."
      />
    ),
  },
  {
    category: 'Last Mile',
    title: 'Pick & Drop Service.',
    src: '/pick-n-drop.png',
    content: (
      <DummyContent
        title="Door-to-Door Precision."
        content="Seamless pickup and delivery service across Northeast India. Our dedicated fleet ensures your packages are collected from your doorstep and delivered with real-time tracking and instant notifications."
      />
    ),
  },
  {
    category: 'Surface Transport',
    title: 'High-Capacity Ground Logistics.',
    src: '/surface-cargo.png',
    content: (
      <DummyContent
        title="The Backbone of Supply."
        content="For bulk movements, our surface transport network offers unmatched capacity. Real-time telemetry, geofenced routes, and predictive maintenance ensure your bulk cargo moves with precision."
      />
    ),
  },
];

export function CoreCompetencies() {
  const cards = data.map((card, index) => <Card key={card.src} card={card} index={index} />);

  return (
    <section id="system-capability" className="w-full py-24 bg-background">
      <div className="mx-auto w-full max-w-7xl px-6 lg:px-10">
        {/* Heading */}
        <div className="max-w-2xl mb-16">
          <div className="flex items-center gap-4 mb-6">
            <div className="h-px bg-primary/30 w-12"></div>
            <span className="text-primary font-mono text-sm tracking-widest uppercase">
              System Capability // 03
            </span>
          </div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-bold text-foreground mb-6 tracking-tight font-sans"
          >
            Operating <span className="text-primary">Spectrum</span>
          </motion.h2>
          <p className="text-muted-foreground text-lg md:text-xl leading-relaxed max-w-xl">
            Multi-modal logistics infrastructure powered by autonomous systems and military-grade
            security protocols.
          </p>
        </div>

        {/* Fixed Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {cards}
        </div>
      </div>
    </section>
  );
}
