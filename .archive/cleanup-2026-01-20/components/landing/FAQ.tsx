'use client';

import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { cn } from '../../lib/utils';

interface FAQItemProps {
    question: string;
    answer: string;
    isOpen: boolean;
    onToggle: () => void;
}

const FAQItem: React.FC<FAQItemProps> = ({ question, answer, isOpen, onToggle }) => (
    <div className="border-b border-cyber-border/30 last:border-b-0">
        <button
            onClick={onToggle}
            className="w-full py-5 flex items-center justify-between text-left group"
        >
            <span className={cn(
                'text-base font-medium transition-colors',
                isOpen ? 'text-cyber-accent' : 'text-cyber-text group-hover:text-cyber-accent'
            )}>
                {question}
            </span>
            <ChevronDown className={cn(
                'w-5 h-5 text-muted-foreground transition-transform duration-300',
                isOpen && 'rotate-180 text-cyber-accent'
            )} />
        </button>

        <div className={cn(
            'overflow-hidden transition-all duration-300',
            isOpen ? 'max-h-96 pb-5' : 'max-h-0'
        )}>
            <p className="text-sm text-muted-foreground leading-relaxed pr-8">
                {answer}
            </p>
        </div>
    </div>
);

const FAQ_DATA = [
    {
        question: "How does real-time tracking work?",
        answer: "Every package receives a unique AWB number. Our system scans packages at each checkpoint (pickup, hub entry, linehaul, destination hub, delivery). You receive instant updates via SMS/WhatsApp and can track online anytime.",
    },
    {
        question: "What is the transit time for Air vs Surface?",
        answer: "Air freight typically takes 24-48 hours for the Imphal-Delhi corridor. Surface transport takes 5-7 days but is more cost-effective for heavy or non-urgent shipments.",
    },
    {
        question: "How do I schedule a pickup?",
        answer: "You can book pickups through our dashboard, WhatsApp (+91 999 999 9999), or by calling our hotline. Enterprise customers get dedicated account managers for scheduling.",
    },
    {
        question: "What items are restricted?",
        answer: "We cannot transport hazardous materials, perishables without cold chain, live animals, currency, or illegal items. Contact us for a complete list of restricted goods.",
    },
    {
        question: "How does enterprise billing work?",
        answer: "Enterprise accounts get monthly consolidated invoicing with NET-30 terms. All invoices are GST-compliant with detailed shipment breakdowns. You can access invoices through your dashboard.",
    },
    {
        question: "What happens if my package is damaged?",
        answer: "All shipments include basic transit insurance. Report damages within 24 hours with photos. We process claims within 72 hours. Enterprise plans include enhanced coverage options.",
    },
];

interface FAQProps {
    className?: string;
}

export const FAQ: React.FC<FAQProps> = ({ className }) => {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    return (
        <section className={cn('py-24 px-6', className)}>
            <div className="max-w-3xl mx-auto">
                {/* Section Header */}
                <div className="text-center mb-12 reveal-section">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyber-accent/20 bg-cyber-accent/5 text-cyber-accent text-xs font-bold uppercase tracking-widest mb-6">
                        <HelpCircle className="w-3 h-3" />
                        FAQ
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold text-cyber-text tracking-tight mb-4">
                        Frequently Asked Questions
                    </h2>
                    <p className="text-muted-foreground">
                        Everything you need to know about our services.
                    </p>
                </div>

                {/* FAQ Accordion */}
                <div className="rounded-2xl border border-cyber-border/20 bg-cyber-surface/40 backdrop-blur-xl px-6 reveal-section">
                    {FAQ_DATA.map((item, i) => (
                        <FAQItem
                            key={i}
                            question={item.question}
                            answer={item.answer}
                            isOpen={openIndex === i}
                            onToggle={() => setOpenIndex(openIndex === i ? null : i)}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default FAQ;
