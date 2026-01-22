'use client';

import { Carousel, Card } from '@/components/ui/apple-cards-carousel';
import { motion } from 'motion/react';

const DummyContent = ({ title, content }: { title: string; content: string }) => {
  return (
    <div className="bg-[#F5F5F7] dark:bg-neutral-800 p-8 md:p-14 rounded-3xl mb-4 text-left">
      <p className="text-neutral-600 dark:text-neutral-400 text-base md:text-2xl font-sans max-w-3xl mx-auto">
        <span className="font-bold text-neutral-700 dark:text-neutral-200">{title}</span> {content}
      </p>
      {/* Placeholder for content specific images if needed in generic layout */}
    </div>
  );
};

const data = [
  {
    category: 'Air Freight',
    title: 'Express Air & Next-Flight-Out.',
    src: '/assets/generated/air-freight-cyber.png',
    content: (
      <DummyContent
        title="Speed Redefined."
        content="Our autonomous routing algorithms connect directly with major airlines to secure next-flight-out capability. From Imphal to New Delhi in under 6 hours, your critical cargo ignores traffic and takes to the skies."
      />
    ),
  },
  {
    category: 'Security',
    title: 'Military-Grade Secure Packaging.',
    src: '/assets/generated/secure-packaging-cyber.png',
    content: (
      <DummyContent
        title="Uncompromised Protection."
        content="We treat every package like a diplomatic pouch. Featuring biometric sealing, shock-absorbent composite materials, and real-time tamper alerts. Your high-value assets arrive exactly as they left."
      />
    ),
  },
  {
    category: 'Sustainability',
    title: 'Zero-Emission Eco Delivery.',
    src: '/assets/generated/eco-delivery-cyber.png',
    content: (
      <DummyContent
        title="Green Logistics."
        content="Our last-mile fleet is 100% electric. We are committed to reducing the carbon footprint of logistics without sacrificing speed. Sustainable delivery for a better tomorrow."
      />
    ),
  },
  {
    category: 'Surface Transport',
    title: 'High-Capacity Ground Logistics.',
    src: '/assets/generated/ground-logistics-cyber.png',
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
    <section id="system-capability" className="w-full py-20 bg-background overflow-hidden">
      <div className="mx-auto w-full max-w-7xl px-6 lg:px-10">
        {/* Heading */}
        <div className="max-w-2xl mb-12">
          <div className="flex items-center gap-4 mb-4">
            <div className="h-px bg-primary/30 w-12"></div>
            <span className="text-primary font-mono text-sm tracking-wider uppercase">
              System Capability // 03
            </span>
          </div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-bold text-foreground mb-4 tracking-tight font-sans"
          >
            Operating <span className="text-primary">Spectrum</span>
          </motion.h2>
          <p className="text-muted-foreground text-lg">
            Multi-modal logistics infrastructure powered by autonomous systems and military-grade
            security protocols.
          </p>
        </div>

        {/* Slider */}
        <div className="relative">
          <Carousel items={cards} />
        </div>
      </div>
    </section>
  );
}
