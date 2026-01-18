"use client";

import { motion } from "@/lib/motion";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const details = [
    {
        icon: MapPin,
        title: "Head Office",
        content: "Paona Bazar, Imphal, Manipur - 795001",
        description: "Main logistics hub and coordination center."
    },
    {
        icon: Phone,
        title: "Phone Support",
        content: "+91 98620 12345",
        description: "Available Mon-Sat, 9am to 6pm IST."
    },
    {
        icon: Mail,
        title: "Email Queries",
        content: "support@taccargo.com",
        description: "We usually respond within 24 hours."
    },
    {
        icon: Clock,
        title: "Working Hours",
        content: "Mon - Sat: 9:00 AM - 6:00 PM",
        description: "Closed on Sundays and National Holidays."
    }
];

export function ContactSection() {
    return (
        <section id="contact" className="relative py-24 overflow-hidden bg-background">
            {/* Background Elements */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[100px]" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px]" />
            </div>

            <div className="container relative z-10 mx-auto px-4 md:px-6">
                <div className="text-center mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        className="inline-flex items-center justify-center px-3 py-1 mb-4 text-xs font-medium rounded-full bg-primary/10 text-primary"
                    >
                        <span>GET IN TOUCH</span>
                    </motion.div>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl"
                    >
                        We're here to help
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto"
                    >
                        Have questions about your shipment? Chat with our AI assistant or reach out to our team directly.
                    </motion.p>
                </div>

                <div className="flex justify-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl w-full"
                    >
                        {details.map((item, index) => (
                            <Card key={index} className="border-border/50 bg-background/50 backdrop-blur-sm hover:border-primary/50 transition-colors duration-300">
                                <CardContent className="p-6 space-y-3">
                                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                        <item.icon className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-foreground">{item.title}</h3>
                                        <p className="text-sm font-medium text-foreground/80 mt-1">{item.content}</p>
                                        <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{item.description}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
