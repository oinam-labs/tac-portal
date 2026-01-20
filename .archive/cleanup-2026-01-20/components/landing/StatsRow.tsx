'use client';

import React from 'react';
import { Package, TrendingUp, Clock, Award } from 'lucide-react';
import { cn } from '../../lib/utils';

interface StatCardProps {
    icon: React.ReactNode;
    value: string;
    label: string;
    trend?: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, value, label, trend }) => (
    <div className="relative group overflow-hidden rounded-2xl border border-cyber-border/20 bg-cyber-surface/40 backdrop-blur-xl p-6 transition-all duration-500 hover:border-cyber-accent/50 hover:shadow-neon">
        {/* Hover gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-cyber-accent/5 to-cyber-purple/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

        <div className="relative z-10">
            <div className="flex items-start justify-between mb-4">
                <div className="p-2.5 rounded-xl bg-cyber-bg/50 text-cyber-accent border border-cyber-border/30">
                    {icon}
                </div>
                {trend && (
                    <span className="text-[10px] font-mono font-bold text-cyber-success uppercase tracking-wider px-2 py-1 rounded-full bg-cyber-success/10">
                        {trend}
                    </span>
                )}
            </div>

            <div className="text-3xl md:text-4xl font-bold text-cyber-text tracking-tight mb-1">
                {value}
            </div>
            <div className="text-xs font-medium text-muted-foreground uppercase tracking-widest">
                {label}
            </div>
        </div>
    </div>
);

const STATS = [
    { icon: <Package className="w-5 h-5" />, value: '10K+', label: 'Packages Monthly', trend: '+12%' },
    { icon: <TrendingUp className="w-5 h-5" />, value: '98.7%', label: 'Scan Reliability', trend: undefined },
    { icon: <Clock className="w-5 h-5" />, value: '24-48h', label: 'Air Corridor', trend: undefined },
    { icon: <Award className="w-5 h-5" />, value: 'SLA', label: 'Enterprise Support', trend: undefined },
];

interface StatsRowProps {
    className?: string;
}

export const StatsRow: React.FC<StatsRowProps> = ({ className }) => {
    return (
        <section className={cn('py-16 px-6', className)}>
            <div className="max-w-7xl mx-auto">
                {/* Section Label */}
                <div className="flex items-center justify-center gap-2 mb-8 text-xs font-mono font-bold text-muted-foreground uppercase tracking-[0.2em]">
                    <span className="w-8 h-px bg-cyber-border" />
                    Trusted by Operations Teams
                    <span className="w-8 h-px bg-cyber-border" />
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 reveal-section">
                    {STATS.map((stat, i) => (
                        <StatCard key={i} {...stat} />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default StatsRow;
