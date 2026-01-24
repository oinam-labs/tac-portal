'use client';

import { ArrowRight, Package, Clock, ShieldCheck } from 'lucide-react';
import { motion } from '@/lib/motion';

export function StatsCTA() {
  return (
    <section className="bg-background relative w-full overflow-hidden border-t border-border/40 py-20 lg:py-24">
      <div className="relative z-10 container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mb-16 flex flex-col gap-10 lg:flex-row lg:items-center lg:justify-between text-center lg:text-left">
          <div className="max-w-2xl mx-auto lg:mx-0">
            <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">
              Serving You for <span className="text-primary">15+ Years</span>
            </h2>
            <p className="text-muted-foreground mt-4 text-xl font-light max-w-lg mx-auto lg:mx-0">
              From Imphal to New Delhi and back — we deliver your cargo with care, speed, and
              reliability.
            </p>
          </div>

          <div className="pt-4 mx-auto lg:mx-0">
            <a
              href="#"
              className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20 inline-flex items-center gap-2 rounded-full px-8 py-4 text-base font-bold transition-all hover:scale-105"
            >
              Get a Quote
              <ArrowRight className="h-5 w-5" />
            </a>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Stat 1 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-card dark:bg-muted/30 border border-border/50 rounded-3xl p-8 text-center hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
          >
            <div className="bg-primary/10 text-primary w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-6 ring-1 ring-primary/20">
              <Package className="w-7 h-7" />
            </div>
            <div className="text-5xl font-bold text-foreground mb-2 tracking-tight">50k+</div>
            <p className="text-muted-foreground font-medium">Shipments Delivered</p>
          </motion.div>

          {/* Stat 2 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="bg-card dark:bg-muted/30 border border-border/50 rounded-3xl p-8 text-center hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-500/5 transition-all duration-300"
          >
            <div className="bg-emerald-500/10 text-emerald-500 w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-6 ring-1 ring-emerald-500/20">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div className="text-5xl font-bold text-foreground mb-2 tracking-tight">99%</div>
            <p className="text-muted-foreground font-medium">Safe Arrival Rate</p>
          </motion.div>

          {/* Stat 3 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="bg-card dark:bg-muted/30 border border-border/50 rounded-3xl p-8 text-center hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/5 transition-all duration-300"
          >
            <div className="bg-blue-500/10 text-blue-500 w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-6 ring-1 ring-blue-500/20">
              <Clock className="w-7 h-7" />
            </div>
            <div className="text-5xl font-bold text-foreground mb-2 tracking-tight">48h</div>
            <p className="text-muted-foreground font-medium">Imphal ↔ Delhi</p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
