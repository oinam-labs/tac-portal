'use client';

import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { TrackingDialog } from './tracking-dialog';
import { ModernGlobe } from './modern-globe';
import { HeroOverlays } from './hero-overlays';
import { LightRays } from '@/components/ui/light-rays';
import { Button } from '@/components/ui/button';
import { useEffect, useRef } from 'react';
import gsap from 'gsap';

export function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const globeRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Timeline for entrance sequence
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      // 1. Globe Entrance (Already handled by Framer Motion internal to the component, but we can sequence the container)
      // Actually, removing GSAP animation on the globe container since the component animates itself
      // Just fading it in slightly to sync
      tl.fromTo(globeRef.current,
        { y: 20 },
        { y: 0, duration: 1.5 }
      );

      // 2. Text Stagger Reveal
      tl.fromTo(textRef.current?.children || [],
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, stagger: 0.2 },
        "-=1.2"
      );

      // 3. CTA Reveal
      tl.fromTo(ctaRef.current,
        { y: 10, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6 },
        "-=0.4"
      );

    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <main id="home" ref={containerRef} className="relative min-h-[85vh] flex flex-col items-center justify-center overflow-hidden pt-32 pb-12 w-full">

      {/* Background Elements */}
      {/* Ambient Center Glow (Subtler) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/05 dark:bg-primary/20 rounded-full blur-[80px] pointer-events-none z-0"></div>

      {/* Light Rays - Deep Dive Implementation */}
      <LightRays
        className="opacity-100 dark:opacity-80 z-0 mix-blend-screen"
        count={20}
        speed={3}
        color="rgba(255, 255, 255, 0.4)"
      />

      {/* Technical Overlays */}
      <HeroOverlays />

      {/* 1. Globe Integration (Top, Compact) */}
      <div ref={globeRef} className="relative z-10 mb-6 w-full flex justify-center">
        <ModernGlobe className="w-64 h-64 md:w-80 md:h-80" />
      </div>

      {/* 2. Hero Content */}
      <div className="relative z-20 text-center max-w-5xl px-6">

        {/* Text Container */}
        <div ref={textRef}>
          {/* Main Headline - Tip Top Typography */}
          <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold tracking-tight leading-[1.1] mb-6 text-foreground drop-shadow-sm font-sans max-w-4xl mx-auto">
            Connecting Northeast India to the World
          </h1>

          {/* Subheadline */}
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto font-normal leading-relaxed mb-8 font-sans">
            Advanced logistics solutions ensuring secure custody, real-time tracking, and operational transparency for every shipment.
          </p>
        </div>

        {/* CTAs */}
        <div ref={ctaRef} className="flex flex-col md:flex-row items-center justify-center gap-4 opacity-0">
          {/* Primary CTA */}
          <Link to="/login">
            <Button size="lg" className="rounded-full px-8 font-medium group">
              Book Shipment
              <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>

          {/* Secondary CTA */}
          <TrackingDialog
            trigger={
              <Button variant="outline" size="lg" className="rounded-full px-8 font-medium">
                Track Cargo
              </Button>
            }
          />
        </div>
      </div>
    </main>
  );
}
