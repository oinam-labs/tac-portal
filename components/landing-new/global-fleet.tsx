'use client';

import FluidExpandingGrid from '@/components/ui/fluid-expanding-grid';
import { FadeUp } from '@/components/motion/FadeUp';

const fleetItems = [
    {
        id: 'air-freight',
        title: 'Air Domination',
        subtitle: 'Strategic heavy-lift capabilities for urgent global deployment.',
        image: '/fleet-manifest1.png',
        color: 'var(--color-feature-air)', // Emerald/Primary
    },
    {
        id: 'surface-transport',
        title: 'Surface Grid',
        subtitle: 'High-density ground logistics network with autonomous handoffs.',
        image: '/fleet-manifest2.png',
        color: 'var(--color-feature-ground)', // Amber/Accent
    },
    {
        id: 'last-mile',
        title: 'Precision Drop',
        subtitle: 'Urban tactical delivery systems for final-mile execution.',
        image: '/fleet-manifest3.png',
        color: 'var(--color-feature-delivery)', // Sky Blue
    },
    {
        id: 'global-hub',
        title: 'Command Nodes',
        subtitle: '24/7 automated sorting facilities with AI-driven routing.',
        image: '/fleet-manifest4.png',
        color: 'var(--color-primary)', // Purple/Secondary
    },
];

export function GlobalFleet() {
    return (
        <section id="global-fleet" className="py-24 bg-muted/20 relative overflow-hidden">
            {/* Technical Background Grid */}
            <div className="absolute inset-0 z-0 opacity-10 pointer-events-none"
                style={{
                    backgroundImage: 'radial-gradient(circle at center, var(--border) 1px, transparent 1px)',
                    backgroundSize: '40px 40px'
                }}
            />

            <div className="container mx-auto px-4 relative z-10">
                <FadeUp>
                    <div className="text-center mb-16">
                        <div className="inline-flex items-center gap-2 font-mono text-xs text-primary/80 border border-primary/20 px-4 py-1.5 rounded-full uppercase tracking-widest bg-background/50 backdrop-blur-sm">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                            /// FLEET_MANIFEST_V4.0
                        </div>
                        <h2 className="text-4xl md:text-5xl font-bold mt-6 mb-4">
                            Global <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Logistics Assets</span>
                        </h2>
                        <p className="text-muted-foreground max-w-2xl mx-auto">
                            A multi-modal network engineered for speed, reliability, and security across every terrain.
                        </p>
                    </div>
                </FadeUp>

                <div className="h-[600px] w-full">
                    <FluidExpandingGrid items={fleetItems} />
                </div>
            </div>
        </section>
    );
}
