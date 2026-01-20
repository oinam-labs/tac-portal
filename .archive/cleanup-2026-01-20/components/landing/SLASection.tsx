'use client';

import React from 'react';
import { Shield, FileCheck, Link2, Webhook } from 'lucide-react';
import { cn } from '../../lib/utils';

interface GuaranteeCardProps {
    icon: React.ReactNode;
    title: string;
    description: string;
    badge?: string;
}

const GuaranteeCard: React.FC<GuaranteeCardProps> = ({ icon, title, description, badge }) => (
    <div className="relative group overflow-hidden rounded-2xl border border-cyber-border/20 bg-cyber-surface/40 backdrop-blur-xl p-6 transition-all duration-500 hover:border-cyber-accent/50">
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-cyber-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

        <div className="relative z-10">
            {/* Header with icon and badge */}
            <div className="flex items-start justify-between mb-4">
                <div className="p-2.5 rounded-xl bg-cyber-bg/50 text-cyber-accent border border-cyber-border/30">
                    {icon}
                </div>
                {badge && (
                    <span className="text-[10px] font-mono font-bold text-cyber-accent uppercase tracking-wider px-2 py-1 rounded-full bg-cyber-accent/10 border border-cyber-accent/20">
                        {badge}
                    </span>
                )}
            </div>

            <h4 className="text-lg font-bold text-cyber-text mb-2">{title}</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
        </div>
    </div>
);

const GUARANTEES = [
    {
        icon: <Shield className="w-5 h-5" />,
        title: 'SLA Delivery Windows',
        description: 'Committed delivery timelines with penalty clauses for enterprise contracts.',
        badge: 'Guaranteed',
    },
    {
        icon: <FileCheck className="w-5 h-5" />,
        title: 'Insurance & Claims',
        description: 'Full transit insurance with streamlined claims processing within 72 hours.',
        badge: undefined,
    },
    {
        icon: <Link2 className="w-5 h-5" />,
        title: 'Chain of Custody',
        description: 'Complete audit trail with timestamped scans at every checkpoint.',
        badge: undefined,
    },
    {
        icon: <Webhook className="w-5 h-5" />,
        title: 'API / ERP Integration',
        description: 'REST APIs and webhooks for seamless integration with your systems.',
        badge: 'Enterprise',
    },
];

interface SLASectionProps {
    className?: string;
}

export const SLASection: React.FC<SLASectionProps> = ({ className }) => {
    return (
        <section className={cn('py-24 px-6', className)}>
            <div className="max-w-7xl mx-auto">
                {/* Section Header */}
                <div className="text-center mb-16 reveal-section">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyber-purple/20 bg-cyber-purple/5 text-cyber-purple text-xs font-bold uppercase tracking-widest mb-6">
                        <span className="w-2 h-2 bg-cyber-purple rounded-full" />
                        Enterprise Grade
                    </div>
                    <h2 className="text-3xl md:text-5xl font-bold text-cyber-text tracking-tight mb-4">
                        Our Guarantees
                    </h2>
                    <p className="text-lg text-muted-foreground max-w-xl mx-auto">
                        Enterprise-level commitments backed by SLAs and transparent operations.
                    </p>
                </div>

                {/* Cards Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 reveal-section">
                    {GUARANTEES.map((item, i) => (
                        <GuaranteeCard key={i} {...item} />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default SLASection;
