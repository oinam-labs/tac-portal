'use client';

import * as React from 'react';
import { Link } from 'react-router-dom';
import { Box, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from '@/lib/motion';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import { AnimatedThemeToggler } from '@/components/ui/animated-theme-toggler';

export function Navbar() {
  const [mounted, setMounted] = React.useState(false);
  const [isOpen, setIsOpen] = React.useState(false);
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const navLinks = [
    { name: 'Platform', href: '#platform' },
    { name: 'Solutions', href: '#solutions' },
    { name: 'Resources', href: '#resources' },
    { name: 'Contact', href: '#contact' },
  ];

  return (
    <nav className="fixed top-0 z-50 w-full border-b border-border/40 bg-background/60 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group mr-8 relative z-50">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors duration-300">
            <Box className="h-5 w-5 text-primary fill-current transition-transform duration-300 group-hover:scale-110" />
          </div>
          <span className="text-foreground text-xl font-sans font-bold tracking-tight group-hover:text-primary transition-colors duration-300">
            TAC
          </span>
        </Link>

        {/* Desktop Navigation - Premium Interactive Style */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link, index) => (
            <a
              key={link.name}
              href={link.href}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              className="relative px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              <AnimatePresence>
                {hoveredIndex === index && (
                  <motion.span
                    className="absolute inset-0 rounded-full bg-muted/50 dark:bg-muted/30"
                    layoutId="hoverBackground"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                  />
                )}
              </AnimatePresence>
              <span className="relative z-10">{link.name}</span>
            </a>
          ))}
        </div>

        {/* Right Actions */}
        <div className="hidden md:flex items-center gap-4">
          <div className="px-2">
            <AnimatedThemeToggler />
          </div>
          <div className="w-px h-6 bg-border/60" /> {/* Subtle separator */}
          <Link to="/login">
            <Button className="rounded-full px-6 font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all duration-300">
              Login
            </Button>
          </Link>
        </div>

        {/* Mobile Menu */}
        <div className="flex items-center gap-4 md:hidden">
          <AnimatedThemeToggler />
          {mounted && (
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full hover:bg-muted/50">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent
                side="right"
                className="w-[300px] border-l border-border bg-background/95 backdrop-blur-2xl p-0"
              >
                <div className="flex flex-col h-full">
                  <div className="h-20 flex items-center justify-between px-6 border-b border-border/50">
                    <span className="font-sans font-bold text-lg">Menu</span>
                    <SheetClose asChild>
                      <Button variant="ghost" size="icon" className="rounded-full -mr-2">
                        <X className="h-4 w-4" />
                      </Button>
                    </SheetClose>
                  </div>
                  <div className="flex flex-col py-4">
                    {navLinks.map((link) => (
                      <a
                        key={link.name}
                        href={link.href}
                        onClick={() => setIsOpen(false)}
                        className="flex items-center h-14 px-8 text-base font-medium text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors border-l-2 border-transparent hover:border-primary"
                      >
                        {link.name}
                      </a>
                    ))}
                  </div>
                  <div className="p-6 mt-auto">
                    <Button
                      className="w-full rounded-full h-12 text-base font-medium shadow-lg shadow-primary/20"
                      onClick={() => (window.location.href = '/login')}
                    >
                      Login
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          )}
        </div>
      </div>
    </nav>
  );
}
