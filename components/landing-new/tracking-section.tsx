import { useState } from 'react';
import { motion } from '@/lib/motion';
import { MapPin, FileText, Search, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { PackageTrackerCard } from '@/components/ui/tracker-card';
import { toast } from 'sonner';
import { getTrackingInfo, TrackingData } from '@/lib/tracking-service';

// --- Components ---

const formatStatus = (status: string): string => {
  return status.replace(/_/g, ' ').toUpperCase();
};

export function TrackingSection() {
  const [trackingMode, setTrackingMode] = useState<'gps' | 'custody'>('gps');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [trackingData, setTrackingData] = useState<TrackingData | null>(null);

  const handleSearch = async () => {
    if (!trackingNumber.trim()) return;
    setIsSearching(true);
    setShowResult(false);
    setTrackingData(null);

    const result = await getTrackingInfo(trackingNumber.trim());

    if (result.success && result.data) {
      setTrackingData(result.data);
      setShowResult(true);
    } else {
      toast.error(result.error || 'Shipment not found. Please check the AWB number.');
    }
    setIsSearching(false);
  };

  return (
    <section id="tracking" className="bg-background relative overflow-hidden py-24">
      {/* Background grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] bg-[size:24px_24px]" />

      {/* Ambient Glow */}
      <div className="bg-primary/5 pointer-events-none absolute top-1/2 left-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[100px]" />

      <div className="relative z-10 container mx-auto px-4">
        <div className="mx-auto max-w-3xl">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-10 space-y-4 text-center"
          >
            <h2 className="text-3xl font-bold tracking-tight md:text-5xl text-foreground">
              Global Tracking <span className="text-primary">Protocol</span>
            </h2>
            <p className="text-muted-foreground text-lg font-light">
              Real-time telemetry for your high-value consignments.
            </p>
          </motion.div>

          {/* Tracking Input Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="border-border bg-card/40 shadow-sm rounded-xl p-0 transition-all sm:p-8 border backdrop-blur-xl"
          >
            {/* Tabs */}
            <div className="mb-8 flex justify-center">
              <Tabs
                defaultValue="gps"
                value={trackingMode}
                onValueChange={(v: string) => setTrackingMode(v as 'gps' | 'custody')}
                className="w-auto"
              >
                <TabsList className="bg-secondary/50 grid w-full grid-cols-2">
                  <TabsTrigger value="gps" className="flex items-center gap-2 px-6">
                    <MapPin className="h-4 w-4" />
                    GPS Telemetry
                  </TabsTrigger>
                  <TabsTrigger value="custody" className="flex items-center gap-2 px-6">
                    <FileText className="h-4 w-4" />
                    Chain of Custody
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* Input Group */}
            <div className="mx-auto flex max-w-2xl flex-col items-stretch gap-3 sm:flex-row">
              <div className="group relative flex-1">
                <Search className="text-muted-foreground group-focus-within:text-primary absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 transition-colors" />
                <Input
                  placeholder="ENTER AWB NUMBER (E.G. TAC-02531)"
                  className="border-input bg-background/50 focus-visible:border-primary h-14 rounded-sm pl-10 font-mono transition-all focus-visible:border-2 focus-visible:ring-0"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSearch();
                  }}
                />
              </div>
              <Button
                size="lg"
                className="h-14 shrink-0 rounded-sm px-8 font-bold"
                onClick={handleSearch}
                disabled={isSearching || !trackingNumber}
                aria-label={isSearching ? 'Searching shipment' : 'Trace shipment'}
              >
                {isSearching ? <Loader2 className="h-5 w-5 animate-spin" /> : 'TRACE'}
              </Button>
            </div>

            {/* Recent Queries - Scrollable */}
            <div className="mt-8 flex flex-col gap-2">
              <span className="text-muted-foreground px-1 font-mono text-[10px]">
                Recent Access:
              </span>
              <div className="flex items-center gap-3 overflow-x-auto px-4 pb-2 -mx-4 scrollbar-hide">
                {[
                  'TAC882190',
                  'TAC-02531',
                  'DEL-98234',
                  'IMP-45621',
                  'BOM-88219',
                  'NYC-10293',
                  'LHR-99283',
                ].map((example) => (
                  <button
                    key={example}
                    type="button"
                    className="hover:bg-primary/10 hover:text-primary hover:border-primary/50 shrink-0 cursor-pointer rounded-sm px-3 py-1.5 font-mono text-[10px] transition-all border border-border inline-flex items-center"
                    onClick={() => setTrackingNumber(example)}
                  >
                    {example}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Status Indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6 }}
            className="mt-8 text-center"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-1.5 backdrop-blur-sm">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              <span className="font-mono text-[10px] font-semibold text-emerald-500">
                SATELLITE UPLINK ACTIVE
              </span>
            </div>
          </motion.div>

          {/* Tracking Result Modal */}
          <Dialog open={showResult && !!trackingData} onOpenChange={setShowResult}>
            <DialogContent
              className="border-none bg-transparent p-0 shadow-none sm:max-w-md w-full"
              aria-describedby={undefined}
            >
              <DialogTitle className="sr-only">
                Tracking Information for {trackingData?.shipment.reference}
              </DialogTitle>
              {trackingData && (
                <PackageTrackerCard
                  status={formatStatus(trackingData.shipment.status)}
                  packageNumber={trackingData.shipment.reference}
                  destination={`${trackingData.shipment.origin} -> ${trackingData.shipment.destination}`}
                  destinationFlag={
                    <span className="text-xl" role="img" aria-label="India flag">
                      🇮🇳
                    </span>
                  }
                  date={
                    trackingData.events.length > 0
                      ? `Last update: ${new Date(trackingData.events[0].created_at).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}`
                      : 'Awaiting updates'
                  }
                  qrCodeValue={`https://tac.logistics/track/${encodeURIComponent(trackingData.shipment.reference)}`}
                />
              )}
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </section>
  );
}
