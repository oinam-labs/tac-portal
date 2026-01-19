import React from 'react';
import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    BarChart2,
    Map,
    ScanLine,
    CreditCard,
    Settings,
    LogOut,
    Box,
    AlertTriangle,
    Users,
    Layers,
    ClipboardList,
    Briefcase,
    MapPin
} from 'lucide-react';
import { useStore } from '../../store';
import { UserRole } from '../../types';
import { HUBS } from '../../lib/constants';

interface NavItemDef {
    label: string;
    icon: React.ComponentType<any>;
    path: string;
    roles?: UserRole[]; // If undefined, accessible by all
}

interface NavGroupDef {
    title: string;
    items: NavItemDef[];
}

const NAV_GROUPS: NavGroupDef[] = [
    {
        title: "Overview",
        items: [
            { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
            { label: 'Analytics', icon: BarChart2, path: '/analytics', roles: ['ADMIN', 'MANAGER', 'FINANCE_STAFF'] },
        ]
    },
    {
        title: "Operations",
        items: [
            { label: 'Shipments', icon: Box, path: '/shipments' },
            { label: 'Tracking', icon: Map, path: '/tracking' },
            { label: 'Manifests', icon: ClipboardList, path: '/manifests', roles: ['ADMIN', 'MANAGER', 'OPS_STAFF'] },
            { label: 'Scanning', icon: ScanLine, path: '/scanning', roles: ['ADMIN', 'MANAGER', 'WAREHOUSE_STAFF'] },
            { label: 'Inventory', icon: Layers, path: '/inventory', roles: ['ADMIN', 'MANAGER', 'WAREHOUSE_STAFF'] },
            { label: 'Exceptions', icon: AlertTriangle, path: '/exceptions', roles: ['ADMIN', 'MANAGER', 'OPS_STAFF', 'WAREHOUSE_STAFF'] },
        ]
    },
    {
        title: "Business",
        items: [
            { label: 'Invoices', icon: CreditCard, path: '/finance', roles: ['ADMIN', 'MANAGER', 'FINANCE_STAFF'] },
            { label: 'Customers', icon: Users, path: '/customers', roles: ['ADMIN', 'MANAGER', 'FINANCE_STAFF', 'OPS_STAFF'] },
            { label: 'Management', icon: Briefcase, path: '/management', roles: ['ADMIN', 'MANAGER'] },
        ]
    },
    {
        title: "System",
        items: [
            { label: 'Settings', icon: Settings, path: '/settings' },
        ]
    }
];

export const Sidebar: React.FC = () => {
    const { logout, sidebarCollapsed, user } = useStore();

    const hasAccess = (allowedRoles?: UserRole[]) => {
        if (!allowedRoles) return true;
        if (!user) return false;
        // ADMIN and MANAGER have access to everything
        if (user.role === 'ADMIN' || user.role === 'MANAGER') return true;
        return allowedRoles.includes(user.role);
    };

    // Safe hub name lookup with fallback
    const userHub = (() => {
        if (!user?.assignedHub) return 'Global HQ';
        const hub = HUBS[user.assignedHub as keyof typeof HUBS];
        return hub?.name || user.assignedHub || 'Global HQ';
    })();

    return (
        <aside className={`fixed left-0 top-0 h-full bg-cyber-surface/95 border-r border-cyber-border backdrop-blur-xl transition-all duration-300 z-50 flex flex-col ${sidebarCollapsed ? 'w-20' : 'w-64'}`}>
            {/* Logo Area */}
            <div className="h-16 flex items-center px-6 border-b border-cyber-border">
                <div className="w-8 h-8 rounded bg-gradient-to-br from-cyber-neon to-cyber-purple flex items-center justify-center shrink-0 shadow-neon">
                    <span className="font-bold text-white text-lg">T</span>
                </div>
                {!sidebarCollapsed && (
                    <span className="ml-3 font-bold text-xl tracking-tight text-slate-900 dark:text-white">
                        TAC <span className="text-cyber-neon">CARGO</span>
                    </span>
                )}
            </div>

            {/* Nav Items */}
            <nav className="flex-1 py-6 px-3 space-y-6 overflow-y-auto">
                {NAV_GROUPS.map((group, groupIndex) => {
                    const visibleItems = group.items.filter(item => hasAccess(item.roles));

                    if (visibleItems.length === 0) return null;

                    return (
                        <div key={groupIndex}>
                            {!sidebarCollapsed && group.title && (
                                <div className="px-3 mb-2 text-xs font-mono text-slate-500 uppercase tracking-wider">
                                    {group.title}
                                </div>
                            )}
                            <div className="space-y-1">
                                {visibleItems.map((item) => (
                                    <NavLink
                                        key={item.label}
                                        to={item.path}
                                        title={sidebarCollapsed ? item.label : ''}
                                        className={({ isActive }) => `
                                            flex items-center px-3 py-2 rounded-lg transition-all duration-200 group
                                            ${isActive
                                                ? 'bg-cyber-accent/10 text-cyber-neon shadow-[0_0_15px_rgba(34,211,238,0.1)] border border-cyber-neon/20'
                                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-black/5 dark:hover:bg-white/5'}
                                        `}
                                    >
                                        <item.icon className={`w-5 h-5 ${sidebarCollapsed ? 'mx-auto' : 'mr-3'}`} />
                                        {!sidebarCollapsed && <span className="font-medium text-sm">{item.label}</span>}
                                    </NavLink>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </nav>

            {/* Footer / User */}
            <div className="p-4 border-t border-cyber-border">
                {!sidebarCollapsed && user && (
                    <div className="mb-3 px-2">
                        <div className="text-xs font-mono text-slate-500 uppercase">Logged in as</div>
                        <div className="text-sm font-bold text-slate-900 dark:text-white truncate">{user.name}</div>
                        <div className="text-xs text-cyber-accentHover dark:text-cyber-neon truncate mb-1">{user.role}</div>

                        <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-2 bg-slate-100 dark:bg-white/5 p-1.5 rounded">
                            <MapPin className="w-3 h-3" />
                            <span className="truncate">{userHub}</span>
                        </div>
                    </div>
                )}
                <button
                    onClick={logout}
                    className={`flex items-center w-full px-3 py-2 rounded-lg text-slate-600 dark:text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition-colors ${sidebarCollapsed ? 'justify-center' : ''}`}
                >
                    <LogOut className="w-5 h-5" />
                    {!sidebarCollapsed && <span className="ml-3 text-sm font-medium">Sign Out</span>}
                </button>
            </div>
        </aside>
    );
};
