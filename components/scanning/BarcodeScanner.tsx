import { useEffect, useRef, useState, useCallback } from 'react'
import { BrowserMultiFormatReader, NotFoundException } from '@zxing/library'
import { cn } from '@/lib/utils'
import { CameraOff, RefreshCw, Volume2, VolumeX } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface BarcodeScannerProps {
  onScan: (result: string) => void
  onError?: (error: Error) => void
  active?: boolean
  className?: string
}

export function BarcodeScanner({
  onScan,
  onError,
  active = true,
  className
}: BarcodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const readerRef = useRef<BrowserMultiFormatReader | null>(null)
  const [hasCamera, setHasCamera] = useState(true)
  const [isScanning, setIsScanning] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [lastScanned, setLastScanned] = useState<string | null>(null)
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([])
  const [selectedCamera, setSelectedCamera] = useState<string>('')

  // Success beep sound
  const playBeep = useCallback(() => {
    if (!soundEnabled) return
    const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)

    oscillator.frequency.value = 1200
    oscillator.type = 'sine'
    gainNode.gain.value = 0.3

    oscillator.start()
    setTimeout(() => {
      oscillator.stop()
      audioContext.close()
    }, 100)
  }, [soundEnabled])

  // Initialize scanner
  useEffect(() => {
    if (!active) return

    const reader = new BrowserMultiFormatReader()
    readerRef.current = reader

    // Get available cameras
    reader.listVideoInputDevices()
      .then((devices) => {
        setCameras(devices)
        if (devices.length > 0) {
          // Prefer back camera on mobile
          const backCamera = devices.find(d =>
            d.label.toLowerCase().includes('back') ||
            d.label.toLowerCase().includes('rear')
          )
          setSelectedCamera(backCamera?.deviceId || devices[0].deviceId)
        } else {
          setHasCamera(false)
        }
      })
      .catch((err) => {
        console.error('Camera access error:', err)
        setHasCamera(false)
        onError?.(err)
      })

    return () => {
      reader.reset()
    }
  }, [active, onError])

  // Start scanning when camera is selected
  useEffect(() => {
    if (!selectedCamera || !videoRef.current || !readerRef.current || !active) return

    const reader = readerRef.current
    setIsScanning(true)

    reader.decodeFromVideoDevice(
      selectedCamera,
      videoRef.current,
      (result, error) => {
        if (result) {
          const text = result.getText()
          // Debounce same barcode scans
          if (text !== lastScanned) {
            setLastScanned(text)
            playBeep()
            onScan(text)

            // Reset last scanned after 2 seconds to allow re-scan
            setTimeout(() => setLastScanned(null), 2000)
          }
        }
        if (error && !(error instanceof NotFoundException)) {
          console.error('Scan error:', error)
        }
      }
    ).catch((err) => {
      console.error('Failed to start scanner:', err)
      setHasCamera(false)
      setIsScanning(false)
      onError?.(err)
    })

    return () => {
      reader.reset()
      setIsScanning(false)
    }
  }, [selectedCamera, active, onScan, onError, playBeep, lastScanned])

  const switchCamera = () => {
    const currentIndex = cameras.findIndex(c => c.deviceId === selectedCamera)
    const nextIndex = (currentIndex + 1) % cameras.length
    setSelectedCamera(cameras[nextIndex].deviceId)
  }

  if (!hasCamera) {
    return (
      <div className={cn(
        "flex flex-col items-center justify-center bg-cyber-surface/50 rounded-lg border border-white/10 p-8",
        className
      )}>
        <CameraOff className="w-16 h-16 text-muted-foreground mb-4" />
        <p className="text-muted-foreground text-center">
          Camera not available.<br />
          Use manual entry below.
        </p>
      </div>
    )
  }

  return (
    <div className={cn("relative overflow-hidden rounded-lg", className)}>
      {/* Video feed */}
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        playsInline
        muted
      />

      {/* Scanner overlay */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Corner brackets */}
        <div className="absolute inset-8 border-2 border-cyber-accent/30 rounded-lg">
          <div className="absolute top-0 left-0 w-12 h-12 border-t-4 border-l-4 border-cyber-accent rounded-tl-lg" />
          <div className="absolute top-0 right-0 w-12 h-12 border-t-4 border-r-4 border-cyber-accent rounded-tr-lg" />
          <div className="absolute bottom-0 left-0 w-12 h-12 border-b-4 border-l-4 border-cyber-accent rounded-bl-lg" />
          <div className="absolute bottom-0 right-0 w-12 h-12 border-b-4 border-r-4 border-cyber-accent rounded-br-lg" />
        </div>

        {/* Scanning line animation */}
        {isScanning && (
          <div
            className="absolute left-8 right-8 h-0.5 bg-gradient-to-r from-transparent via-red-500 to-transparent shadow-[0_0_10px_#ef4444] animate-scan"
          />
        )}

        {/* Status indicator */}
        <div className="absolute top-4 left-4 flex items-center gap-2">
          <span className={cn(
            "w-3 h-3 rounded-full",
            isScanning ? "bg-green-500 animate-pulse" : "bg-amber-500"
          )} />
          <span className="text-xs font-medium text-white bg-black/50 px-2 py-1 rounded">
            {isScanning ? 'Scanning...' : 'Initializing...'}
          </span>
        </div>

        {/* Last scan indicator */}
        {lastScanned && (
          <div className="absolute bottom-4 left-4 right-4 bg-green-500/90 text-white px-4 py-2 rounded-lg text-center font-mono text-sm animate-pulse">
            ✓ {lastScanned}
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="absolute top-4 right-4 flex gap-2 pointer-events-auto">
        {cameras.length > 1 && (
          <Button
            size="icon"
            variant="secondary"
            onClick={switchCamera}
            className="bg-black/50 hover:bg-black/70"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        )}
        <Button
          size="icon"
          variant="secondary"
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="bg-black/50 hover:bg-black/70"
        >
          {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </Button>
      </div>

      <style>{`
        @keyframes scan {
          0% { top: 15%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 85%; opacity: 0; }
        }
        .animate-scan {
          animation: scan 2s linear infinite;
        }
      `}</style>
    </div>
  )
}
