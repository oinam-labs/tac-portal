import { useEffect, useRef, useState, useCallback } from 'react';
import { BrowserMultiFormatReader } from '@zxing/library';
import { cn } from '@/lib/utils';
import { CameraOff, RefreshCw, Volume2, VolumeX, Flashlight, FlashlightOff, ZoomIn, ZoomOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '../ui/slider';

interface BarcodeScannerProps {
  onScan: (result: string) => void;
  onError?: (error: Error) => void;
  active?: boolean;
  className?: string;
  enableTorch?: boolean;
}

export function BarcodeScanner({
  onScan,
  onError,
  active = true,
  className,
  enableTorch: initialTorch = false
}: BarcodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const readerRef = useRef<BrowserMultiFormatReader | null>(null);
  const controlsRef = useRef<any>(null);

  // Stable refs for callbacks to prevent stale closures in decode loop
  const onScanRef = useRef(onScan);
  onScanRef.current = onScan;
  const onErrorRef = useRef(onError);
  onErrorRef.current = onError;

  const [hasCamera, setHasCamera] = useState(true);
  const [isScanning, setIsScanning] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [torchEnabled, setTorchEnabled] = useState(initialTorch);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [capabilities, setCapabilities] = useState<MediaTrackCapabilities | null>(null);
  const lastScannedRef = useRef<string | null>(null);
  const lastScannedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<string>('');

  const soundEnabledRef = useRef(soundEnabled);
  soundEnabledRef.current = soundEnabled;

  // Success beep sound (uses ref to stay stable)
  const playBeep = useCallback(() => {
    if (!soundEnabledRef.current) return;
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;

      const audioContext = new AudioContextClass();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 1200;
      oscillator.type = 'sine';
      gainNode.gain.value = 0.1;

      oscillator.start();
      setTimeout(() => {
        oscillator.stop();
        audioContext.close();
      }, 100);
    } catch (e) {
      console.error("Audio playback failed", e);
    }
  }, []);

  // Initialize scanner
  useEffect(() => {
    if (!active) return;

    console.log('[BarcodeScanner] Initializing camera...', { active });
    const reader = new BrowserMultiFormatReader();
    readerRef.current = reader;

    // Get available cameras
    reader
      .listVideoInputDevices()
      .then((devices) => {
        console.log('[BarcodeScanner] Cameras found:', devices);
        setCameras(devices);
        if (devices.length > 0) {
          // Prefer back camera on mobile
          const backCamera = devices.find(
            (d) => d.label.toLowerCase().includes('back') || d.label.toLowerCase().includes('rear') || d.label.toLowerCase().includes('environment')
          );
          setSelectedCamera(backCamera?.deviceId || devices[0].deviceId);
        } else {
          setHasCamera(false);
        }
      })
      .catch((err) => {
        console.error('Camera access error:', err);
        setHasCamera(false);
        onErrorRef.current?.(err);
      });

    return () => {
      stopScanning();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  const stopScanning = () => {
    if (controlsRef.current) {
      controlsRef.current.stop();
      controlsRef.current = null;
    }
    if (readerRef.current) {
      readerRef.current.reset();
    }
    setIsScanning(false);
  };

  // Start scanning when camera is selected
  useEffect(() => {
    if (!selectedCamera || !videoRef.current || !readerRef.current || !active) return;

    const reader = readerRef.current;

    // Stop previous scan if any
    if (controlsRef.current) {
      controlsRef.current.stop();
    }

    setIsScanning(true);

    const constraints: MediaStreamConstraints = {
      video: {
        deviceId: selectedCamera,
        facingMode: 'environment', // Prefer back camera
        width: { ideal: 1280 },
        height: { ideal: 720 },
        // @ts-ignore - advanced constraints for zoom/torch
        advanced: [{ zoom: zoomLevel }, { torch: torchEnabled }]
      }
    };

    reader.decodeFromConstraints(
      constraints,
      videoRef.current,
      (result, _error) => {
        if (result) {
          const text = result.getText();
          console.log('[BarcodeScanner] Decoded text:', text);
          // Debounce: skip if same barcode scanned within 2s
          if (text !== lastScannedRef.current) {
            console.log('[BarcodeScanner] Valid new scan (not debounced):', text);
            lastScannedRef.current = text;
            playBeep();
            onScanRef.current(text);
            // Reset debounce after 2s
            if (lastScannedTimerRef.current) clearTimeout(lastScannedTimerRef.current);
            lastScannedTimerRef.current = setTimeout(() => { lastScannedRef.current = null; }, 2000);
          }
        }
      }
    ).then((controls: any) => {
      controlsRef.current = controls;

      // Get capabilities for zoom/torch
      const track = videoRef.current?.srcObject instanceof MediaStream
        ? videoRef.current.srcObject.getVideoTracks()[0]
        : null;

      if (track) {
        setCapabilities(track.getCapabilities());
      }
    }).catch(err => {
      console.error("Decode error", err);
      setIsScanning(false);
      onErrorRef.current?.(err);
    });

    return () => {
      // Cleanup handled by main effect
    };
    // Only re-init when camera selection or active state changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCamera, active]);

  // Apply track constraints when zoom/torch changes without restarting stream
  useEffect(() => {
    const track = videoRef.current?.srcObject instanceof MediaStream
      ? videoRef.current.srcObject.getVideoTracks()[0]
      : null;

    if (track && isScanning) {
      try {
        track.applyConstraints({
          advanced: [{
            // @ts-ignore
            torch: torchEnabled,
            zoom: zoomLevel
          }]
        }).catch(e => console.warn("Failed to apply constraints", e));
      } catch (e) {
        console.warn("Constraints error", e);
      }
    }
  }, [torchEnabled, zoomLevel, isScanning]);

  const switchCamera = () => {
    const currentIndex = cameras.findIndex((c) => c.deviceId === selectedCamera);
    const nextIndex = (currentIndex + 1) % cameras.length;
    setSelectedCamera(cameras[nextIndex].deviceId);
  };

  const handleZoomChange = (value: number[]) => {
    setZoomLevel(value[0]);
  };

  const toggleTorch = () => {
    setTorchEnabled(!torchEnabled);
  };

  if (!hasCamera) {
    return (
      <div
        className={cn(
          'flex flex-col items-center justify-center bg-card/50 rounded-lg border border-white/10 p-8',
          className
        )}
      >
        <CameraOff className="w-16 h-16 text-muted-foreground mb-4" />
        <p className="text-muted-foreground text-center">
          Camera not available.
          <br />
          Use manual entry below.
        </p>
      </div>
    );
  }

  // @ts-ignore - check for specific capabilities
  const supportsTorch = capabilities?.torch || false;
  // @ts-ignore
  const supportsZoom = capabilities?.zoom || false;
  // @ts-ignore
  const minZoom = capabilities?.zoom?.min || 1;
  // @ts-ignore
  const maxZoom = capabilities?.zoom?.max || 3;


  return (
    <div className={cn('relative overflow-hidden rounded-lg bg-black', className)}>
      <video ref={videoRef} className="w-full h-full object-cover" playsInline muted />

      {/* Overlay */}
      <div className="absolute inset-0 pointer-events-none">
<<<<<<< HEAD
        {/* Safe Area / Frame */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border-2 border-primary/50 rounded-lg shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]">
          <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary -ml-[2px] -mt-[2px]" />
          <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary -mr-[2px] -mt-[2px]" />
          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary -ml-[2px] -mb-[2px]" />
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary -mr-[2px] -mb-[2px]" />

          {/* Laser Line */}
          {isScanning && (
            <div className="absolute top-1/2 left-2 right-2 h-0.5 bg-red-500 shadow-[0_0_8px_rgba(255,0,0,0.8)] animate-pulse" />
          )}
        </div>

        {/* Status */}
        <div className="absolute top-4 left-4 right-16 flex items-center justify-between pointer-events-auto">
          <div className="bg-black/60 backdrop-blur-md text-white text-xs px-3 py-1.5 rounded-full flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${isScanning ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`} />
            {isScanning ? 'Scanning active' : 'Initializing...'}
=======
        {/* Corner brackets */}
        <div className="absolute inset-8 border-2 border-primary/30 rounded-lg">
          <div className="absolute top-0 left-0 w-12 h-12 border-t-4 border-l-4 border-primary rounded-tl-lg" />
          <div className="absolute top-0 right-0 w-12 h-12 border-t-4 border-r-4 border-primary rounded-tr-lg" />
          <div className="absolute bottom-0 left-0 w-12 h-12 border-b-4 border-l-4 border-primary rounded-bl-lg" />
          <div className="absolute bottom-0 right-0 w-12 h-12 border-b-4 border-r-4 border-primary rounded-br-lg" />
        </div>

        {/* Scanning line animation */}
        {isScanning && (
          <div className="absolute left-8 right-8 h-0.5 bg-gradient-to-r from-transparent via-status-error to-transparent shadow-[0_0_10px_var(--color-status-error)] animate-scan" />
        )}

        {/* Status indicator */}
        <div className="absolute top-4 left-4 flex items-center gap-2">
          <span
            className={cn(
              'w-3 h-3 rounded-full',
              isScanning ? 'bg-status-success animate-pulse' : 'bg-status-warning'
            )}
          />
          <span className="text-xs font-medium text-white bg-black/50 px-2 py-1 rounded">
            {isScanning ? 'Scanning...' : 'Initializing...'}
          </span>
        </div>

        {/* Last scan indicator */}
        {lastScanned && (
          <div className="absolute bottom-4 left-4 right-4 bg-status-success/90 text-white px-4 py-2 rounded-lg text-center font-mono text-sm animate-pulse">
            ✓ {lastScanned}
>>>>>>> origin/chore/full-project-review-feb-2026
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="absolute bottom-6 inset-x-0 flex flex-col items-center gap-4 pointer-events-auto px-4">

        {/* Zoom Slider */}
        {supportsZoom && (
          <div className="w-full max-w-xs flex items-center gap-2 bg-black/40 backdrop-blur rounded-full px-3 py-1">
            <ZoomOut className="w-4 h-4 text-white" />
            <Slider
              value={[zoomLevel]}
              min={minZoom}
              max={maxZoom}
              step={0.1}
              onValueChange={handleZoomChange}
              className="flex-1"
            />
            <ZoomIn className="w-4 h-4 text-white" />
          </div>
        )}

        <div className="flex items-center gap-3">
          {cameras.length > 1 && (
            <Button size="icon" variant="secondary" className="rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md" onClick={switchCamera}>
              <RefreshCw className="w-5 h-5" />
            </Button>
          )}

          {supportsTorch && (
            <Button
              size="icon"
              variant={torchEnabled ? "default" : "secondary"}
              className={`rounded-full backdrop-blur-md ${torchEnabled ? 'bg-yellow-500 text-black hover:bg-yellow-400' : 'bg-white/10 text-white hover:bg-white/20'}`}
              onClick={toggleTorch}
            >
              {torchEnabled ? <Flashlight className="w-5 h-5" /> : <FlashlightOff className="w-5 h-5" />}
            </Button>
          )}

          <Button
            size="icon"
            variant="secondary"
            className="rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md"
            onClick={() => setSoundEnabled(!soundEnabled)}
          >
            {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </Button>
        </div>
      </div>
    </div>
  );
}
