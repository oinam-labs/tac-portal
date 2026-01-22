'use client';

import { QRCodeCanvas } from 'qrcode.react';
// import { useTheme } from "next-themes";
import { useEffect, useState } from 'react';

// Mock useTheme if not available, or use a context.
// For now, simple mock or assume light/dark from class.
const useTheme = () => {
  // This is a simplification. Ideally import from your theme provider.
  // If you have a custom theme hook, use it.
  // Assuming 'dark' class on html element is the source of truth for now,
  // but this hook needs to be reactive.
  // For this port, we'll default to 'dark' heavy since it's a cyber theme.
  return { resolvedTheme: 'dark' };
};

interface ThemeAwareQRCodeProps {
  value: string;
  size?: number;
  className?: string;
  bgColor?: string;
  fgColor?: string;
  level?: 'L' | 'M' | 'Q' | 'H';
  'aria-label'?: string;
}

/**
 * Theme-aware QR Code wrapper component
 */
export function ThemeAwareQRCode({
  value,
  size = 64,
  className,
  bgColor,
  fgColor,
  level = 'M',
  'aria-label': ariaLabel,
}: ThemeAwareQRCodeProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const getThemeColors = () => {
    if (!mounted || typeof globalThis === 'undefined') {
      return { bg: '#ffffff', fg: '#0a0a0a' };
    }

    // Hardcoded cyber colors for now to match the design aesthetics
    if (resolvedTheme === 'dark') {
      return { bg: '#0a0a0a', fg: '#fafafa' };
    }
    return { bg: '#ffffff', fg: '#0a0a0a' };
  };

  const colors = getThemeColors();

  if (!mounted) {
    return <div className={className} style={{ width: size, height: size }} aria-hidden="true" />;
  }

  return (
    <QRCodeCanvas
      value={value}
      size={size}
      bgColor={bgColor || colors.bg}
      fgColor={fgColor || colors.fg}
      level={level}
      className={className}
      role="img"
      aria-label={ariaLabel || `QR code for: ${value}`}
    />
  );
}
