'use client';

import { Calendar, FileText, Globe, Lock, TrendingUp, BarChart3, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

// Define the feature item type
type FeatureItem = {
  icon: LucideIcon;
  title: string;
  description: string;
  position?: 'left' | 'right';
  cornerStyle?: string;
};

// Create feature data arrays for left and right columns
const leftFeatures: FeatureItem[] = [
  {
    icon: Globe,
    title: 'Global Telemetry',
    description:
      'Real-time tracking across 120+ countries with millisecond precision and satellite backup.',
    position: 'left',
    cornerStyle: 'sm:translate-x-4 sm:rounded-br-[2px]',
  },
  {
    icon: FileText,
    title: 'Instant Customs',
    description: 'Automated clearance documentation generation reducing border delays by 60%.',
    position: 'left',
    cornerStyle: 'sm:-translate-x-4 sm:rounded-br-[2px]',
  },
  {
    icon: TrendingUp,
    title: 'Predictive Routing',
    description:
      'AI-driven adjustments for weather, traffic, and geopolitical events in real-time.',
    position: 'left',
    cornerStyle: 'sm:translate-x-4 sm:rounded-tr-[2px]',
  },
];

const rightFeatures: FeatureItem[] = [
  {
    icon: Lock,
    title: 'Secure Chain',
    description: 'Blockchain-verified custody logs at every node ensuring immutable audit trails.',
    position: 'right',
    cornerStyle: 'sm:-translate-x-4 sm:rounded-bl-[2px]',
  },
  {
    icon: Calendar,
    title: 'Hyper-Scale',
    description: 'Elastic capacity planning that automatically scales for peak season demands.',
    position: 'right',
    cornerStyle: 'sm:translate-x-4 sm:rounded-bl-[2px]',
  },
  {
    icon: BarChart3,
    title: 'Advanced Analytics',
    description:
      'Deep insights into supply chain performance, cost optimization, and vendor reliability.',
    position: 'right',
    cornerStyle: 'sm:-translate-x-4 sm:rounded-tl-[2px]',
  },
];

// Feature card component
const FeatureCard = ({ feature }: { feature: FeatureItem }) => {
  const Icon = feature.icon;

  return (
    <div>
      <div
        className={cn(
          'relative rounded-2xl px-6 py-6 text-sm transition-colors duration-200', // Increased padding
          'bg-secondary/40 ring-1 ring-border hover:bg-secondary/60', // Adjusted background and ring
          feature.cornerStyle
        )}
      >
        <div className="text-primary mb-4 text-3xl">
          <Icon size={32} strokeWidth={1.5} />
        </div>
        <h2 className="text-foreground mb-3 text-xl font-semibold tracking-tight">{feature.title}</h2>
        <p className="text-muted-foreground text-base leading-relaxed text-pretty">{feature.description}</p>
        {/* Decorative elements */}
        <span className="from-primary/0 via-primary/50 to-primary/0 absolute -bottom-px left-1/2 h-px w-1/2 -translate-x-1/2 bg-gradient-to-r opacity-60"></span>
        <span className="absolute inset-0 bg-[radial-gradient(40%_20%_at_50%_100%,hsl(var(--primary)/0.1)_0%,transparent_100%)] opacity-60"></span>
      </div>
    </div>
  );
};

export function OperationalLogic() {
  return (
    <section className="py-24" id="features">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="flex flex-col-reverse gap-8 md:grid md:grid-cols-3 lg:gap-12">
          {/* Left column */}
          <div className="flex flex-col gap-6">
            {leftFeatures.map((feature, index) => (
              <FeatureCard key={`left-feature-${index}`} feature={feature} />
            ))}
          </div>

          {/* Center column */}
          <div className="order-[1] mb-8 self-center sm:order-[0] md:mb-0">
            <div className="bg-secondary/50 text-foreground ring-1 ring-border/50 relative mx-auto mb-6 w-fit rounded-full px-4 py-1.5 text-sm backdrop-blur-sm">
              <span className="relative z-10 flex items-center gap-2 font-mono tracking-wide text-xs">
                02 // CORE_CAPABILITIES
              </span>
              <span className="from-primary/0 via-primary/50 to-primary/0 absolute -bottom-px left-1/2 h-px w-2/5 -translate-x-1/2 bg-gradient-to-r"></span>
            </div>
            <h2 className="text-foreground mb-4 text-center text-3xl md:text-4xl font-bold tracking-tight">
              Engineered for <br />
              <span className="text-muted-foreground">Maximum Velocity.</span>
            </h2>
            <p className="text-muted-foreground mx-auto max-w-xs text-center text-lg leading-relaxed">
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
