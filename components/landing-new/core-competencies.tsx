"use client";

import FluidExpandingGrid, { GalleryItem } from "@/components/ui/fluid-expanding-grid";

const items: GalleryItem[] = [
    {
        id: "air-freight",
        title: "Express Air Freight",
        subtitle: "Autonomous routing to next-flight-out for urgent payloads.",
        image: "/assets/generated/air-freight-cyber.png",
        color: "#22d3ee", // Cyan
    },
    {
        id: "secure-packaging",
        title: "Secure Packaging",
        subtitle: "Military-grade crating and biometric sealing for high-value assets.",
        image: "/assets/generated/secure-packaging-cyber.png",
        color: "#a855f7", // Purple
    },
    {
        id: "eco-delivery",
        title: "Eco Last Mile",
        subtitle: "Zero-emission electric fleet for urban delivery.",
        image: "/assets/generated/eco-delivery-cyber.png",
        color: "#4ade80", // Green
    },
    {
        id: "ground-logistics",
        title: "Ground Logistics",
        subtitle: "High-capacity surface transport with real-time telemetry.",
        image: "/assets/generated/ground-logistics-cyber.png",
        color: "#f97316", // Orange
    },
];

export function CoreCompetencies() {
    return (
        <section id="system-capability" className="relative w-full py-24 flex flex-col items-center justify-center bg-background">
            <div className="w-full max-w-7xl px-6 mb-8">
                <div className="flex items-center gap-4 mb-4">
                    <div className="h-px bg-cyber-neon/30 w-12"></div>
                    <span className="text-cyber-neon font-mono text-sm tracking-wider uppercase">System Capability // 03</span>
                </div>
                <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4 tracking-tight">
                    Operating <span className="text-cyber-neon">Spectrum</span>
                </h2>
                <p className="text-muted-foreground max-w-2xl text-lg">
                    Multi-modal logistics infrastructure powered by autonomous systems and military-grade security protocols.
                </p>
            </div>

            <FluidExpandingGrid items={items} />
        </section>
    );
}
