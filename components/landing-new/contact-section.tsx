'use client';

import { useState } from 'react';
import { motion } from '@/lib/motion';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

import { Label } from '@/components/ui/label';
<<<<<<< HEAD
import { Check, Loader2, Send, AlertCircle } from 'lucide-react';
import { FadeUp } from '@/components/motion/FadeUp';
import { StaggerChildren } from '@/components/motion/StaggerChildren';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
=======
import { Check, Loader2, Send } from 'lucide-react';
import { FadeUp } from '@/components/motion/FadeUp';
import { StaggerChildren } from '@/components/motion/StaggerChildren';
>>>>>>> origin/chore/full-project-review-feb-2026

export function ContactSection() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
<<<<<<< HEAD
  const [error, setError] = useState<string | null>(null);
=======
>>>>>>> origin/chore/full-project-review-feb-2026

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const { error: insertError } = await supabase
        .from('contact_messages')
        .insert({
          name,
          phone,
          message,
          status: 'unread'
        });

      if (insertError) throw insertError;

      setName('');
      setPhone('');
      setMessage('');
      setIsSubmitted(true);
      toast.success('Message sent successfully!');

      setTimeout(() => {
        setIsSubmitted(false);
      }, 5000);
    } catch (err: any) {
      console.error('Error submitting form:', err);
      setError(err.message || 'Failed to send message. Please try again.');
      toast.error('Failed to send message.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="relative w-full overflow-hidden py-24 lg:py-32 bg-background">
      <div className="relative z-10 container mx-auto px-4 md:px-6">
        <FadeUp className="bg-card border border-border/50 mx-auto max-w-5xl overflow-hidden rounded-3xl shadow-2xl shadow-primary/5">
          <div className="grid lg:grid-cols-2">

            {/* Left: Content & Image */}
            <div className="relative p-10 lg:p-14 bg-muted/50 border-r border-border/50 flex flex-col justify-between overflow-hidden">
              {/* Technical Grid Pattern */}
              <div className="absolute inset-0 opacity-[0.03] bg-[url('/assets/grid-pattern.svg')] bg-repeat pointer-events-none" style={{ backgroundSize: '20px 20px' }} />

              <div className="relative z-10">
                <FadeUp delay={0.1}>
                  <div className="inline-flex items-center gap-2 font-mono text-xs text-primary/80 border border-primary/20 px-4 py-1.5 rounded-full uppercase tracking-widest bg-background/50 backdrop-blur-sm mb-6">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                    CONTACT_CHANNEL_OPEN
                  </div>
                  <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-foreground mb-4">
                    Ready to <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Get Started?</span>
                  </h2>
                  <p className="text-muted-foreground text-lg leading-relaxed max-w-sm">
                    Our logistics experts are ready to optimize your supply chain. Reach out for a custom quote or consultation.
                  </p>
                </FadeUp>
              </div>

              <FadeUp delay={0.3} className="hidden lg:block relative mt-10 z-10">
                <div className="relative z-10 transform transition-transform hover:scale-105 duration-500">
                  <img
                    src="/contact.png"
                    alt="Contact Support"
                    className="w-full max-w-[320px] mx-auto object-contain drop-shadow-2xl grayscale hover:grayscale-0 transition-all duration-500"
                  />
                </div>
                {/* Glow behind image */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-primary/20 blur-[60px] rounded-full -z-10" />
              </FadeUp>
            </div>

            {/* Right: Form */}
            <div className="p-10 lg:p-14 bg-card/50 backdrop-blur-sm">
              <form onSubmit={handleSubmit} className="space-y-6">
                <StaggerChildren staggerDelay={0.1} initialDelay={0.2} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-foreground/80 font-medium font-mono text-xs uppercase tracking-wider">Full Name</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="ENTER YOUR NAME"
                      required
<<<<<<< HEAD
                      className="h-12 bg-background border-border/60 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all font-medium rounded-none"
=======
                      className="h-12 bg-background border-border/60 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all font-medium"
>>>>>>> origin/chore/full-project-review-feb-2026
                    />
                  </div>

                  <div className="space-y-2">
<<<<<<< HEAD
                    <Label htmlFor="phone" className="text-foreground/80 font-medium font-mono text-xs uppercase tracking-wider">WhatsApp Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="ENTER WHATSAPP NUMBER (e.g., +1234567890)"
                      required
                      className="h-12 bg-background border-border/60 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all font-medium rounded-none"
=======
                    <Label htmlFor="email" className="text-foreground/80 font-medium font-mono text-xs uppercase tracking-wider">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="ENTER YOUR EMAIL"
                      required
                      className="h-12 bg-background border-border/60 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all font-medium"
>>>>>>> origin/chore/full-project-review-feb-2026
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message" className="text-foreground/80 font-medium font-mono text-xs uppercase tracking-wider">Message</Label>
                    <Textarea
                      id="message"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="TELL US ABOUT YOUR SHIPMENT NEEDS..."
                      required
<<<<<<< HEAD
                      className="min-h-[160px] resize-none bg-background border-border/60 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all font-medium rounded-none"
=======
                      className="min-h-[160px] resize-none bg-background border-border/60 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all font-medium"
>>>>>>> origin/chore/full-project-review-feb-2026
                    />
                  </div>
                </StaggerChildren>

<<<<<<< HEAD
                {error && (
                  <div className="flex items-center gap-2 text-destructive text-sm bg-destructive/10 p-3 rounded-none border border-destructive/20">
                    <AlertCircle className="h-4 w-4" />
                    <span>{error}</span>
                  </div>
                )}

=======
>>>>>>> origin/chore/full-project-review-feb-2026
                <FadeUp delay={0.5} className="pt-2">
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      size="lg"
<<<<<<< HEAD
                      className="w-full h-12 text-base font-bold shadow-lg shadow-primary/20 rounded-none"
=======
                      className="w-full h-12 text-base font-bold shadow-lg shadow-primary/20 rounded-xl"
>>>>>>> origin/chore/full-project-review-feb-2026
                    >
                      {isSubmitting ? (
                        <span className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          TRANSMITTING...
                        </span>
                      ) : isSubmitted ? (
                        <span className="flex items-center gap-2">
                          <Check className="h-4 w-4" />
                          MESSAGE SENT
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          SEND MESSAGE
                          <Send className="h-4 w-4" />
                        </span>
                      )}
                    </Button>
                  </motion.div>
                </FadeUp>
              </form>
            </div>
          </div>
        </FadeUp>
      </div>
    </section>
  );
}
