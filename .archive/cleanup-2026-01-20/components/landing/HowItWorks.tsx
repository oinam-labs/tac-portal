'use client';

import React from 'react';
import { ClipboardCheck, Scan, Truck } from 'lucide-react';
import { cn } from '../../lib/utils';

interface StepProps {
    number: number;
    icon: React.ReactNode;
    title: string;
    description: string;
    isLast?: boolean;
}

const Step: React.FC<StepProps> = ({ number, icon, title, description, isLast }) => (
    <div className="relative flex flex-col items-center text-center group">
        {/* Connecting Line */}
        {!isLast && (
            <div className="hidden md:block absolute top-8 left-[calc(50%+3rem)] w-[calc(100%-6rem)] h-px bg-gradient-to-r from-cyber-accent/50 via-cyber-border/30 to-cyber-accent/50" />
        )}

        {/* Step Number + Icon + Image */}
        <div className="relative mb-6">
            <div className="w-16 h-16 rounded-2xl bg-cyber-surface border border-cyber-border/50 flex items-center justify-center text-cyber-accent shadow-lg group-hover:border-cyber-accent/50 group-hover:shadow-neon transition-all duration-500 relative z-10">
                {icon}
            </div>
            <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-cyber-accent text-white text-xs font-bold flex items-center justify-center shadow-lg z-20">
                {number}
            </div>

            {/* Decorative Concept Image (Only for specific steps) */}
            {title === 'Corridor Delivery' && (
                <img src="/truck-illustration.png" alt="Truck" className="absolute -bottom-8 -right-12 w-32 h-auto opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none z-0" />
            )}
            {title === 'Scan & Manifest' && (
                <img src="/drone-illustration.png" alt="Drone" className="absolute -top-12 -left-16 w-24 h-auto opacity-0 group-hover:opacity-60 transition-opacity duration-700 pointer-events-none z-0" />
            )}
        </div>

        {/* Content */}
        <h4 className="text-lg font-bold text-cyber-text mb-2">{title}</h4>
        <p className="text-sm text-muted-foreground max-w-[200px] leading-relaxed">{description}</p>
    </div>
);

const STEPS = [
    {
        icon: <ClipboardCheck className="w-6 h-6" />,
        title: 'Book Pickup',
        description: 'Schedule a doorstep pickup online or via WhatsApp. No packaging needed.',
    },
    {
        icon: <Scan className="w-6 h-6" />,
        title: 'Scan & Manifest',
        description: 'Your package is scanned, documented, and enters our tracked corridor system.',
    },
    {
        icon: <Truck className="w-6 h-6" />,
        title: 'Corridor Delivery',
        description: 'Real-time tracking until doorstep delivery with digital proof of receipt.',
    },
];

interface HowItWorksProps {
    className?: string;
}

export const HowItWorks: React.FC<HowItWorksProps> = ({ className }) => {
    return (
        <section className={cn('py-24 px-6 bg-cyber-surface/20 border-y border-cyber-border/50', className)}>
            <div className="max-w-5xl mx-auto">
                {/* Section Header */}
                <div className="text-center mb-16 reveal-section">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyber-accent/20 bg-cyber-accent/5 text-cyber-accent text-xs font-bold uppercase tracking-widest mb-6">
                        <span className="w-2 h-2 bg-cyber-accent rounded-full" />
                        Process
                    </div>
                    <h2 className="text-3xl md:text-5xl font-bold text-cyber-text tracking-tight mb-4">
                        How It Works
                    </h2>
                    <p className="text-lg text-muted-foreground max-w-xl mx-auto">
                        From booking to delivery in three simple steps. Transparent, tracked, and reliable.
                    </p>
                </div>

                {/* Steps Grid */}
                <div className="grid md:grid-cols-3 gap-12 md:gap-8 reveal-section">
                    {STEPS.map((step, i) => (
                        <Step
                            key={i}
                            number={i + 1}
                            icon={step.icon}
                            title={step.title}
                            description={step.description}
                            isLast={i === STEPS.length - 1}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default HowItWorks;
