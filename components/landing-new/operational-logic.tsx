"use client";

import {
    Calendar,
    FileText,
    Globe,
    Lock,
    TrendingUp,
} from "lucide-react";

import { BentoCard, BentoGrid } from "@/components/ui/bento-grid";

const features = [
    {
        Icon: Globe,
        name: "Global Telemetry",
        description: "Real-time tracking across 120+ countries with millisecond precision.",
        href: "#",
        cta: "View Coverage",
        background: <img className="absolute -top-20 -right-20 opacity-60 pointer-events-none" />,
        className: "lg:row-start-1 lg:row-end-4 lg:col-start-2 lg:col-end-3",
    },
    {
        Icon: FileText,
        name: "Instant Customs",
        description: "Automated clearance documentation generation.",
        href: "#",
        cta: "Learn more",
        background: <img className="absolute -top-20 -right-20 opacity-60 pointer-events-none" />,
        className: "lg:col-start-1 lg:col-end-2 lg:row-start-1 lg:row-end-3",
    },
    {
        Icon: TrendingUp,
        name: "Predictive Routing",
        description: "AI-driven adjustments for weather and traffic.",
        href: "#",
        cta: "See algorithms",
        background: <img className="absolute -top-20 -right-20 opacity-60 pointer-events-none" />,
        className: "lg:col-start-1 lg:col-end-2 lg:row-start-3 lg:row-end-4",
    },
    {
        Icon: Lock,
        name: "Secure Chain",
        description: "Blockchain-verified custody logs at every node.",
        href: "#",
        cta: "Security protocols",
        background: <img className="absolute -top-20 -right-20 opacity-60 pointer-events-none" />,
        className: "lg:col-start-3 lg:col-end-3 lg:row-start-1 lg:row-end-2",
    },
    {
        Icon: Calendar,
        name: "Hyper-Scale",
        description: "Elastic capacity for peak season demands.",
        href: "#",
        cta: "Capacity planning",
        background: <img className="absolute -top-20 -right-20 opacity-60 pointer-events-none" />,
        className: "lg:col-start-3 lg:col-end-3 lg:row-start-2 lg:row-end-4",
    },
];

export function OperationalLogic() {
    return (
        <section className="bg-background relative py-24 mb-12">
            <div className="max-w-7xl mx-auto px-6 mb-12">
                <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-mono text-primary mb-6">
                    02 // CORE_CAPABILITIES
                </div>
                <h2 className="text-4xl md:text-5xl font-bold tracking-tighter text-foreground mb-6">
                    Engineered for <br />
                    <span className="text-muted-foreground">Maximum Velocity.</span>
                </h2>
            </div>
            <div className="max-w-7xl mx-auto px-6">
                <BentoGrid className="lg:grid-rows-3">
                    {features.map((feature) => (
                        <BentoCard
                            key={feature.name}
                            name={feature.name}
                            className={feature.className}
                            background={feature.background}
                            Icon={feature.Icon}
                            description={feature.description}
                            href={feature.href}
                            cta={feature.cta}
                        />
                    ))}
                </BentoGrid>
            </div>
        </section>
    );
}
