import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Search, ScanBarcode } from 'lucide-react';
import { useStore } from '@/store';
import { Input } from '@/components/ui/input';
import { AnimatedThemeToggler } from '../ui/animated-theme-toggler';
import { NotificationBell } from '../domain/NotificationBell';
import { useScanner } from '@/context/useScanner';

export const Header: React.FC = () => {
  const { toggleSidebar, setMobileSidebarOpen, mobileSidebarOpen, setTheme } = useStore();
  const { scan } = useScanner();
  const navigate = useNavigate();

  const handleMenuClick = () => {
    if (window.innerWidth < 1024) {
      setMobileSidebarOpen(!mobileSidebarOpen);
    } else {
      toggleSidebar();
    }
  };

  const handleManualScan = async () => {
    try {
      const result = await scan();
      const cleanResult = result.trim().toUpperCase();
      if (!cleanResult) return;

      // Route to invoice page for shipment barcodes (TAC...)
      if (cleanResult.startsWith('TAC')) {
        navigate(`/finance?awb=${encodeURIComponent(cleanResult)}`);
        return;
      }

      // Route to manifests page for manifest barcodes (MAN...)
      if (cleanResult.startsWith('MAN')) {
        navigate(`/manifests?search=${encodeURIComponent(cleanResult)}`);
        return;
      }

      // Unknown format → general search
      navigate(`/search?q=${encodeURIComponent(cleanResult)}`);
    } catch (e) {
      console.debug('Scan cancelled');
    }
  };

  return (
    <header className="h-16 bg-background/80 backdrop-blur-md border-b border-border sticky top-0 z-40 px-4 lg:px-6 flex items-center justify-between transition-colors duration-300">
      <div className="flex items-center gap-4">
        <button
          onClick={handleMenuClick}
          className="p-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
          aria-label="Toggle menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="hidden md:flex items-center relative w-64">
          <Search className="w-4 h-4 absolute left-3 text-muted-foreground" />
          <Input
            aria-label="Search shipments, invoices"
            placeholder="Search shipments, invoices..."
            className="pl-9 py-1.5 text-sm bg-background border-input focus:ring-2 focus:ring-ring focus:border-input transition-all"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                const target = e.target as HTMLInputElement;
                if (target.value.trim()) {
                  navigate(`/search?q=${encodeURIComponent(target.value.trim())}`);
                }
              }
            }}
          />
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        <button
          onClick={handleManualScan}
          className="p-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
          aria-label="Scan QR/Barcode"
          title="Scan QR/Barcode"
        >
          <ScanBarcode className="w-5 h-5" />
        </button>

        <AnimatedThemeToggler
          className="text-muted-foreground hover:text-primary hover:bg-primary/10"
          duration={500}
          onThemeChange={setTheme}
        />

        <NotificationBell />
      </div>
    </header>
  );
};
