
import { Navbar } from "@/components/landing-new/navbar";
import { HeroSection } from "@/components/landing-new/hero-section";
import { CoreCompetencies } from "@/components/landing-new/core-competencies";
import { OperationalLogic } from "@/components/landing-new/operational-logic";
import { About } from "@/components/landing-new/about";
import { StatsCTA } from "@/components/landing-new/stats-cta";
import { ContactSection } from "@/components/landing-new/contact-section";
import { TrackingSection } from "@/components/landing-new/tracking-section";
import { TrustedBy } from "@/components/landing-new/trusted-by";
import { Footer } from "@/components/landing-new/footer";
import { TACBot } from "@/components/landing-new/tac-bot";

export function Landing() {
    return (
        <div className="min-h-screen bg-background font-sans text-foreground overflow-x-hidden">
            <Navbar />
            <main className="flex flex-col w-full">
                <HeroSection />
                <TrackingSection />
                <TrustedBy />
                <CoreCompetencies />
                <OperationalLogic />
                <About />
                <StatsCTA />
                <ContactSection />
            </main>
            <Footer />
            <TACBot />
        </div>
    );
}
