'use client';

import { ArrowRight } from 'lucide-react';
import { TrackingDialog } from './tracking-dialog';
import { ModernGlobe } from './modern-globe';
import { HeroOverlays } from './hero-overlays';
import { LightRays } from '@/components/ui/light-rays';
import { Button } from '@/components/ui/button';
import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { BookingDialog } from '@/components/bookings/BookingDialog';

// ... existing imports

export function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const globeRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Timeline for entrance sequence
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      // 1. Globe Entrance (Already handled by Framer Motion internal to the component, but we can sequence the container)
      // Actually, removing GSAP animation on the globe container since the component animates itself
      // Just fading it in slightly to sync
      tl.fromTo(globeRef.current, { y: 20 }, { y: 0, duration: 1.5 });

      // 2. Text Stagger Reveal
      tl.fromTo(
        textRef.current?.children || [],
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, stagger: 0.2 },
        '-=1.2'
      );

      // 3. CTA Reveal
      tl.fromTo(
        ctaRef.current,
        { y: 10, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6 },
        '-=0.4'
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <main
      id="home"
      ref={containerRef}
      className="relative min-h-[85vh] flex flex-col items-center justify-center overflow-hidden pt-32 pb-12 w-full"
    >
      {/* Background elements */}
      <LightRays />
      <HeroOverlays />
      {/* 1. Globe Integration (Top, Compact) */}
      <div ref={globeRef} className="relative z-10 mb-6 w-full flex justify-center">
        <ModernGlobe className="w-64 h-64 md:w-80 md:h-80" />
      </div>

      {/* 2. Hero Content */}
      <div className="relative z-20 text-center max-w-5xl px-6">
        <div ref={textRef} className="space-y-6 mb-12">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-gray-900 to-gray-600 dark:from-white dark:to-white/60 py-2">
            Global Logistics <span className="text-primary">Redefined</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Experience the future of freight forwarding with real-time tracking, instant bookings,
            and seamless global connectivity.
          </p>
        </div>

        {/* CTAs */}
        <div
          ref={ctaRef}
          className="flex flex-col md:flex-row items-center justify-center gap-4 opacity-0"
        >
          {/* Primary CTA */}
          <Button
            size="lg"
            className="px-8 font-medium group"
            onClick={() => setBookingDialogOpen(true)}
          >
            Book Shipment
            <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Button>

          {/* Secondary CTA */}
          <TrackingDialog
            trigger={
              <Button variant="outline" size="lg" className="px-8 font-medium">
                Track Cargo
              </Button>
            }
          />
        </div>
      </div>

      <BookingDialog open={bookingDialogOpen} onOpenChange={setBookingDialogOpen} />
    </main>
  );
}
