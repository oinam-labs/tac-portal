'use client';

import React, { useEffect, useRef } from 'react';
import { Plane, Truck, Activity, Package, AlertTriangle, Clock } from 'lucide-react';
import { cn } from '../../lib/utils';

interface CorridorVisualizationProps {
    className?: string;
}

export const CorridorVisualization: React.FC<CorridorVisualizationProps> = ({ className }) => {
    const pathRef = useRef<SVGPathElement>(null);

    // Marching ants animation via CSS
    useEffect(() => {
        const path = pathRef.current;
        if (!path) return;

        const length = path.getTotalLength();
        path.style.strokeDasharray = `${length}`;
        path.style.strokeDashoffset = `${length}`;
    }, []);

    return (
        <section id="network" className={cn('relative z-10 py-32 px-6 border-y border-cyber-border bg-cyber-bg', className)}>
            <style>{`
                @keyframes dash {
                    to { stroke-dashoffset: 0; }
                }
                @keyframes marchingAnts {
                    to { stroke-dashoffset: -20; }
                }
                @keyframes moveDot {
                    0% { offset-distance: 0%; }
                    100% { offset-distance: 100%; }
                }
                .corridor-path {
                    animation: marchingAnts 1s linear infinite;
                }
                .moving-dot {
                    offset-path: path('M 80 200 Q 280 280 520 180');
                    animation: moveDot 4s linear infinite;
                }
                .moving-dot-2 {
                    offset-path: path('M 80 200 Q 280 280 520 180');
                    animation: moveDot 4s linear infinite;
                    animation-delay: -2s;
                }
            `}</style>

            <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
                {/* Left: Content */}
                <div className="reveal-section">
                    <div className="mb-8">
                        <div className="flex items-center gap-2 mb-4 text-xs font-mono font-bold text-cyber-accent uppercase tracking-[0.2em]">
                            <span className="w-2 h-2 bg-cyber-accent rounded-full animate-pulse shadow-neon" />
                            Live Corridor
                        </div>
                        <h2 className="text-3xl md:text-5xl font-bold text-cyber-text tracking-tight mb-6 leading-[1.1]">
                            The Northeast Corridor
                        </h2>
                        <p className="text-lg text-slate-500 leading-relaxed mb-8">
                            Specialized logistics network connecting Imphal (IMF) with New Delhi (DEL) and beyond. Real-time telemetry monitoring.
                        </p>
                    </div>

                    {/* Transport Mode Cards */}
                    <div className="space-y-4 mb-8">
                        <div className="flex items-center gap-4 p-4 rounded-xl bg-cyber-surface/50 border border-cyber-border/30 hover:border-cyber-accent/50 transition-colors group">
                            <div className="p-3 rounded-xl bg-cyber-accent/10 text-cyber-accent group-hover:bg-cyber-accent group-hover:text-white transition-all">
                                <Plane className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="font-bold text-cyber-text">Air Freight</h4>
                                <p className="text-sm text-slate-500">Daily flights • 24-48h turnaround • Priority handling</p>
                            </div>
                            <div className="ml-auto text-xs font-mono text-cyber-accent bg-cyber-accent/10 px-2 py-1 rounded">ACTIVE</div>
                        </div>

                        <div className="flex items-center gap-4 p-4 rounded-xl bg-cyber-surface/50 border border-cyber-border/30 hover:border-cyber-purple/50 transition-colors group">
                            <div className="p-3 rounded-xl bg-cyber-purple/10 text-cyber-purple group-hover:bg-cyber-purple group-hover:text-white transition-all">
                                <Truck className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="font-bold text-cyber-text">Surface Linehaul</h4>
                                <p className="text-sm text-slate-500">Cost-effective • Heavy cargo • 5-7 days</p>
                            </div>
                            <div className="ml-auto text-xs font-mono text-cyber-purple bg-cyber-purple/10 px-2 py-1 rounded">ACTIVE</div>
                        </div>
                    </div>
                </div>

                {/* Right: Visualization */}
                <div className="relative reveal-section">
                    {/* Main Visualization Container */}
                    <div className="relative h-[450px] w-full bg-cyber-surface/40 backdrop-blur-xl rounded-3xl overflow-hidden border border-cyber-border/30 group">
                        {/* Network Map Background */}
                        <div className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity duration-1000">
                            <img src="/network-illustration.png" alt="Network Map" className="w-full h-full object-cover mix-blend-screen" />
                        </div>

                        {/* Grid Background */}
                        <div className="absolute inset-0 opacity-20" style={{
                            backgroundSize: '30px 30px',
                            backgroundImage: 'linear-gradient(to right, rgba(128, 128, 128, 0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(128, 128, 128, 0.1) 1px, transparent 1px)'
                        }} />

                        {/* SVG Route */}
                        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 600 400">
                            {/* Route Path with marching ants */}
                            <path
                                d="M 80 200 Q 280 280 520 180"
                                fill="none"
                                stroke="var(--color-cyber-neon, #22d3ee)"
                                strokeWidth="2"
                                strokeDasharray="10 5"
                                className="corridor-path"
                                opacity="0.6"
                            />

                            {/* Checkpoint markers */}
                            <circle cx="200" cy="245" r="4" fill="var(--color-cyber-border, #334155)" opacity="0.5" />
                            <circle cx="350" cy="230" r="4" fill="var(--color-cyber-border, #334155)" opacity="0.5" />

                            {/* Origin Node - Delhi */}
                            <circle cx="80" cy="200" r="12" fill="var(--color-cyber-neon, #22d3ee)" className="animate-pulse" opacity="0.3" />
                            <circle cx="80" cy="200" r="8" fill="var(--color-cyber-neon, #22d3ee)" />

                            {/* Destination Node - Imphal */}
                            <circle cx="520" cy="180" r="12" fill="var(--color-cyber-purple, #a855f7)" className="animate-pulse" opacity="0.3" />
                            <circle cx="520" cy="180" r="8" fill="var(--color-cyber-purple, #a855f7)" />
                        </svg>

                        {/* Moving Dots */}
                        <div className="moving-dot absolute w-3 h-3 rounded-full bg-white shadow-lg shadow-cyber-neon" />
                        <div className="moving-dot-2 absolute w-2 h-2 rounded-full bg-cyber-accent/70" />

                        {/* City Labels */}
                        <div className="absolute top-[42%] left-[8%] bg-cyber-card/90 backdrop-blur px-3 py-1.5 rounded-lg shadow-lg text-xs font-bold border border-cyber-border text-cyber-text">
                            <span className="text-cyber-neon">●</span> New Delhi
                            <span className="ml-2 text-[10px] font-mono text-slate-500">DEL</span>
                        </div>
                        <div className="absolute top-[35%] right-[8%] bg-cyber-card/90 backdrop-blur px-3 py-1.5 rounded-lg shadow-lg text-xs font-bold border border-cyber-border text-cyber-text">
                            <span className="text-cyber-purple">●</span> Imphal
                            <span className="ml-2 text-[10px] font-mono text-slate-500">IMF</span>
                        </div>

                        {/* Telemetry Panel */}
                        <div className="absolute bottom-4 left-4 right-4 bg-cyber-bg/90 backdrop-blur-xl rounded-xl border border-cyber-border/50 p-4">
                            <div className="flex items-center gap-2 text-xs font-mono text-slate-500 mb-3">
                                <Activity className="w-3 h-3 text-cyber-accent" />
                                LIVE TELEMETRY
                            </div>
                            <div className="grid grid-cols-4 gap-4">
                                <div>
                                    <div className="text-lg font-bold text-cyber-text">127</div>
                                    <div className="text-[10px] text-slate-500 uppercase">Active</div>
                                </div>
                                <div>
                                    <div className="text-lg font-bold text-cyber-accent">32h</div>
                                    <div className="text-[10px] text-slate-500 uppercase">Avg Time</div>
                                </div>
                                <div>
                                    <div className="text-lg font-bold text-cyber-success">99.1%</div>
                                    <div className="text-[10px] text-slate-500 uppercase">On-Time</div>
                                </div>
                                <div>
                                    <div className="text-lg font-bold text-amber-500">2</div>
                                    <div className="text-[10px] text-slate-500 uppercase">Exceptions</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default CorridorVisualization;
