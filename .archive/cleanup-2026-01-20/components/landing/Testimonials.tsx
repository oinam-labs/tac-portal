'use client';

import React from 'react';
import { Quote, Star } from 'lucide-react';
import { cn } from '../../lib/utils';

interface TestimonialProps {
    quote: string;
    author: string;
    role: string;
    company: string;
    metric?: string;
    featured?: boolean;
}

const TestimonialCard: React.FC<TestimonialProps> = ({ quote, author, role, company, metric, featured }) => (
    <div className={cn(
        'relative group overflow-hidden rounded-2xl border border-cyber-border/20 bg-cyber-surface/40 backdrop-blur-xl transition-all duration-500 hover:border-cyber-accent/50',
        featured ? 'p-8 md:p-10' : 'p-6'
    )}>
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-cyber-accent/5 to-cyber-purple/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

        <div className="relative z-10">
            {/* Quote icon */}
            <Quote className={cn(
                'text-cyber-accent/30 mb-4',
                featured ? 'w-10 h-10' : 'w-6 h-6'
            )} />

            {/* Quote text */}
            <p className={cn(
                'text-cyber-text leading-relaxed mb-6',
                featured ? 'text-lg md:text-xl' : 'text-sm'
            )}>
                "{quote}"
            </p>

            {/* Metric badge */}
            {metric && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-cyber-success/10 text-cyber-success text-xs font-bold mb-4">
                    <Star className="w-3 h-3 fill-current" />
                    {metric}
                </div>
            )}

            {/* Author info */}
            <div className="flex items-center gap-3 pt-4 border-t border-cyber-border/30">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyber-accent to-cyber-purple flex items-center justify-center text-white font-bold text-sm">
                    {author.charAt(0)}
                </div>
                <div>
                    <div className={cn('font-bold text-cyber-text', featured ? 'text-base' : 'text-sm')}>
                        {author}
                    </div>
                    <div className="text-xs text-muted-foreground">
                        {role}, {company}
                    </div>
                </div>
            </div>
        </div>
    </div>
);

const TESTIMONIALS: TestimonialProps[] = [
    {
        quote: "TAC Cargo transformed our supply chain to Northeast India. What used to take a week now reaches in 48 hours. Their tracking system gives us complete visibility.",
        author: "Rahul Sharma",
        role: "Supply Chain Director",
        company: "PharmaCare Ltd",
        metric: "Cut transit time by 70%",
        featured: true,
    },
    {
        quote: "Reliable corridor service with excellent tracking. Our clients in Imphal get their orders faster than ever.",
        author: "Priya Mehta",
        role: "Operations Head",
        company: "E-Mart India",
        metric: "98% on-time delivery",
        featured: false,
    },
    {
        quote: "The API integration was seamless. Now our ERP syncs automatically with their system.",
        author: "Amit Kumar",
        role: "CTO",
        company: "TechLogix",
        metric: undefined,
        featured: false,
    },
    {
        quote: "Best choice for Northeast corridor. Professional team and transparent pricing.",
        author: "Deepika Singh",
        role: "Founder",
        company: "Manipur Crafts Co",
        metric: undefined,
        featured: false,
    },
];

interface TestimonialsProps {
    className?: string;
}

export const Testimonials: React.FC<TestimonialsProps> = ({ className }) => {
    const featured = TESTIMONIALS.find(t => t.featured);
    const others = TESTIMONIALS.filter(t => !t.featured);

    return (
        <section className={cn('py-24 px-6 bg-cyber-surface/20 border-y border-cyber-border/50', className)}>
            <div className="max-w-7xl mx-auto">
                {/* Section Header */}
                <div className="text-center mb-16 reveal-section">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyber-accent/20 bg-cyber-accent/5 text-cyber-accent text-xs font-bold uppercase tracking-widest mb-6">
                        <span className="w-2 h-2 bg-cyber-accent rounded-full" />
                        Testimonials
                    </div>
                    <h2 className="text-3xl md:text-5xl font-bold text-cyber-text tracking-tight mb-4">
                        Trusted by Industry Leaders
                    </h2>
                    <p className="text-lg text-muted-foreground max-w-xl mx-auto">
                        See why operations teams across India choose TAC Cargo.
                    </p>
                </div>

                {/* Testimonials Grid */}
                <div className="grid lg:grid-cols-2 gap-6 reveal-section">
                    {/* Featured testimonial */}
                    {featured && (
                        <div className="lg:row-span-2">
                            <TestimonialCard {...featured} />
                        </div>
                    )}

                    {/* Other testimonials */}
                    <div className="space-y-6">
                        {others.map((testimonial, i) => (
                            <TestimonialCard key={i} {...testimonial} />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Testimonials;
