"use client";

import { motion } from "@/lib/motion";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TrackingDialog } from "./tracking-dialog";
import MagnifiedBento from "@/components/magnified-bento";

export function HeroSection() {
    const fadeUpVariant = {
        hidden: { opacity: 0, y: 20 },
        visible: (i: number) => ({
            opacity: 1,
            y: 0,
            transition: {
                delay: i * 0.1,
                duration: 0.8,
                ease: [0.215, 0.61, 0.355, 1.0] as const,
            },
        }),
    };

    return (
        <section className="relative flex min-h-screen w-full items-center justify-center overflow-hidden py-20 md:py-32">
            {/* Background Layer - Preserved & Darkened */}
            <div className="absolute inset-0 z-0 select-none">
                <img
                    src="/tac-hero-bg.jpeg"
                    alt="TAC Cargo Background"
                    className="absolute inset-0 w-full h-full object-cover opacity-60 grayscale scale-105"
                />
                <div className="absolute inset-0 bg-background/60" /> {/* Overlay for visibility */}
                <div className="absolute inset-0 bg-grid opacity-30" />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
            </div>

            <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-12">

                    {/* Left Content */}
                    <div className="flex flex-col items-start space-y-8 lg:col-span-6">
                        <motion.div
                            custom={0}
                            initial="hidden"
                            animate="visible"
                            variants={fadeUpVariant}
                            className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 backdrop-blur-md"
                        >
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                            </span>
                            <span className="text-xs font-mono font-medium text-primary tracking-wide">
                                TRUSTED SINCE 2010 • IMPHAL ↔ DELHI CORRIDOR
                            </span>
                        </motion.div>

                        <motion.h1
                            custom={1}
                            initial="hidden"
                            animate="visible"
                            variants={fadeUpVariant}
                            className="font-sans text-4xl sm:text-6xl font-bold tracking-tighter text-foreground lg:text-8xl leading-[0.9]"
                        >
                            Tapan Associate
                            <br />
                            <span className="text-primary glow-effect">Cargo.</span>
                        </motion.h1>

                        <motion.p
                            custom={2}
                            initial="hidden"
                            animate="visible"
                            variants={fadeUpVariant}
                            className="max-w-xl text-lg text-muted-foreground leading-relaxed font-light"
                        >
                            Your trusted cargo partner for over 15 years. Air cargo, surface transport, pickup & delivery, and professional packaging — connecting Imphal and New Delhi with reliability and speed.
                        </motion.p>

                        <motion.div
                            custom={3}
                            initial="hidden"
                            animate="visible"
                            variants={fadeUpVariant}
                            className="flex flex-col sm:flex-row gap-4 w-full"
                        >
                            <Link to="/login">
                                <Button size="lg" className="rounded-full px-8 h-12 text-base font-medium shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 transition-all duration-300">
                                    Book a Shipment
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </Link>
                            <TrackingDialog trigger={
                                <Button variant="outline" size="lg" className="rounded-full px-8 h-12 text-base font-medium backdrop-blur-sm bg-background/30 hover:bg-background/50 border-border">
                                    Track Shipment
                                </Button>
                            } />
                        </motion.div>
                    </div>

                    {/* Right Content - Magnified Bento */}
                    <motion.div
                        custom={4}
                        initial="hidden"
                        animate="visible"
                        variants={fadeUpVariant}
                        className="w-full lg:col-span-6 flex justify-center lg:justify-end"
                    >
                        <MagnifiedBento />
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
