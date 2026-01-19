
import React from 'react';
import { Menu, Search } from 'lucide-react';
import { useStore } from '../../store';
import { Input } from '../ui/CyberComponents';
import { AnimatedThemeToggler } from '../ui/animated-theme-toggler';
import { NotificationBell } from '../domain/NotificationBell';

export const Header: React.FC = () => {
    const { toggleSidebar } = useStore();

    return (
        <header className="h-16 bg-cyber-bg/80 backdrop-blur-md border-b border-cyber-border sticky top-0 z-40 px-6 flex items-center justify-between transition-colors duration-300">
            <div className="flex items-center gap-4">
                <button
                    onClick={toggleSidebar}
                    className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:text-cyber-neon hover:bg-cyber-accent/10 transition-colors"
                >
                    <Menu className="w-5 h-5" />
                </button>
                <div className="hidden md:flex items-center relative w-64">
                    <Search className="w-4 h-4 absolute left-3 text-slate-500" />
                    <Input
                        placeholder="Search shipments, invoices..."
                        className="pl-9 py-1.5 text-sm bg-cyber-surface/50"
                    />
                </div>
            </div>

            <div className="flex items-center gap-4">
                <AnimatedThemeToggler
                    className="text-slate-500 dark:text-slate-400 hover:text-cyber-neon hover:bg-cyber-accent/10"
                    duration={500}
                />

                <NotificationBell />
            </div>
        </header>
    );
};
