import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Search, ScanBarcode } from 'lucide-react';
import { useStore } from '@/store';
import { Input } from '@/components/ui/input';
import { AnimatedThemeToggler } from '../ui/animated-theme-toggler';
import { NotificationBell } from '../domain/NotificationBell';
import { useScanner } from '@/context/ScanningProvider';
import { toast } from 'sonner';

export const Header: React.FC = () => {
  const { toggleSidebar, setMobileSidebarOpen, mobileSidebarOpen, setTheme } = useStore();
  const { scan } = useScanner();
  const navigate = useNavigate();

  const handleMenuClick = () => {
    // On mobile (< lg breakpoint), toggle mobile sidebar overlay
    // On desktop, collapse/expand sidebar
    if (window.innerWidth < 1024) {
      setMobileSidebarOpen(!mobileSidebarOpen);
    } else {
      toggleSidebar();
    }
  };

  const handleGlobalScan = async () => {
    try {
      const result = await scan();
      let cleanResult = result.trim();

      // If it's a URL, try to extract the last segment or query param
      if (cleanResult.startsWith('http')) {
        try {
          const url = new URL(cleanResult);
          // Check for 'id' param first
          const idParam = url.searchParams.get('id');
          if (idParam) {
            cleanResult = idParam;
          } else {
            // Fallback to last path segment
            const pathSegments = url.pathname.split('/').filter(Boolean);
            if (pathSegments.length > 0) {
              cleanResult = pathSegments[pathSegments.length - 1];
            }
          }
        } catch (e) {
          console.warn('Failed to parse scanned URL:', e);
        }
      }

      toast.success(`Scanned: ${cleanResult}`);

      // Navigate to global search with auto-redirect enabled
      if (cleanResult) {
        navigate(`/search?q=${encodeURIComponent(cleanResult)}&auto=true`);
      }
    } catch (e) {
      // User cancelled
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
          onClick={handleGlobalScan}
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
