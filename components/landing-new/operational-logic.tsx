"use client";

import {
    Calendar,
    FileText,
    Globe,
    Lock,
    TrendingUp,
    BarChart3,
    LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Define the feature item type
type FeatureItem = {
    icon: LucideIcon;
    title: string;
    description: string;
    position?: "left" | "right";
    cornerStyle?: string;
};

// Create feature data arrays for left and right columns
const leftFeatures: FeatureItem[] = [
    {
        icon: Globe,
        title: "Global Telemetry",
        description:
            "Real-time tracking across 120+ countries with millisecond precision and satellite backup.",
        position: "left",
        cornerStyle: "sm:translate-x-4 sm:rounded-br-[2px]",
    },
    {
        icon: FileText,
        title: "Instant Customs",
        description:
            "Automated clearance documentation generation reducing border delays by 60%.",
        position: "left",
        cornerStyle: "sm:-translate-x-4 sm:rounded-br-[2px]",
    },
    {
        icon: TrendingUp,
        title: "Predictive Routing",
        description:
            "AI-driven adjustments for weather, traffic, and geopolitical events in real-time.",
        position: "left",
        cornerStyle: "sm:translate-x-4 sm:rounded-tr-[2px]",
    },
];

const rightFeatures: FeatureItem[] = [
    {
        icon: Lock,
        title: "Secure Chain",
        description:
            "Blockchain-verified custody logs at every node ensuring immutable audit trails.",
        position: "right",
        cornerStyle: "sm:-translate-x-4 sm:rounded-bl-[2px]",
    },
    {
        icon: Calendar,
        title: "Hyper-Scale",
        description:
            "Elastic capacity planning that automatically scales for peak season demands.",
        position: "right",
        cornerStyle: "sm:translate-x-4 sm:rounded-bl-[2px]",
    },
    {
        icon: BarChart3,
        title: "Advanced Analytics",
        description:
            "Deep insights into supply chain performance, cost optimization, and vendor reliability.",
        position: "right",
        cornerStyle: "sm:-translate-x-4 sm:rounded-tl-[2px]",
    },
];

// Feature card component
const FeatureCard = ({ feature }: { feature: FeatureItem }) => {
    const Icon = feature.icon;

    return (
        <div>
            <div
                className={cn(
                    "relative rounded-2xl px-4 pt-4 pb-4 text-sm",
                    "bg-secondary/50 ring-border ring",
                    feature.cornerStyle
                )}
            >
                <div className="text-primary mb-3 text-[2rem]">
                    <Icon />
                </div>
                <h2 className="text-foreground mb-2.5 text-2xl">{feature.title}</h2>
                <p className="text-muted-foreground text-base text-pretty">
                    {feature.description}
                </p>
                {/* Decorative elements */}
                <span className="from-primary/0 via-primary to-primary/0 absolute -bottom-px left-1/2 h-px w-1/2 -translate-x-1/2 bg-gradient-to-r opacity-60"></span>
                <span className="absolute inset-0 bg-[radial-gradient(30%_5%_at_50%_100%,hsl(var(--primary)/0.15)_0%,transparent_100%)] opacity-60"></span>
            </div>
        </div>
    );
};

export function OperationalLogic() {
    return (
        <section className="pt-20 pb-8" id="features">
            <div className="mx-6 max-w-[1120px] pt-2 pb-16 max-[300px]:mx-4 min-[1150px]:mx-auto">
                <div className="flex flex-col-reverse gap-6 md:grid md:grid-cols-3">
                    {/* Left column */}
                    <div className="flex flex-col gap-6">
                        {leftFeatures.map((feature, index) => (
                            <FeatureCard key={`left-feature-${index}`} feature={feature} />
                        ))}
                    </div>

                    {/* Center column */}
                    <div className="order-[1] mb-6 self-center sm:order-[0] md:mb-0">
                        <div className="bg-secondary text-foreground ring-border relative mx-auto mb-4.5 w-fit rounded-full rounded-bl-[2px] px-4 py-2 text-sm ring">
                            <span className="relative z-1 flex items-center gap-2">
                                02 // CORE_CAPABILITIES
                            </span>
                            <span className="from-primary/0 via-primary to-primary/0 absolute -bottom-px left-1/2 h-px w-2/5 -translate-x-1/2 bg-gradient-to-r"></span>
                            <span className="absolute inset-0 bg-[radial-gradient(30%_40%_at_50%_100%,hsl(var(--primary)/0.25)_0%,transparent_100%)]"></span>
                        </div>
                        <h2 className="text-foreground mb-2 text-center text-2xl sm:mb-2.5 md:text-[2rem] font-bold tracking-tight">
                            Engineered for <br />
                            <span className="text-muted-foreground">Maximum Velocity.</span>
                        </h2>
                        <p className="text-muted-foreground mx-auto max-w-[18rem] text-center text-pretty">
                            A logistics stack built to handle the complexity of modern global supply chains.
                        </p>
                    </div>

                    {/* Right column */}
                    <div className="flex flex-col gap-6">
                        {rightFeatures.map((feature, index) => (
                            <FeatureCard key={`right-feature-${index}`} feature={feature} />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
