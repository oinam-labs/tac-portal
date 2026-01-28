import React, { useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  BarChart2,
  Map,
  ScanLine,
  CreditCard,
  Settings,
  Box,
  AlertTriangle,
  Users,
  Layers,
  ClipboardList,
  Briefcase,
} from 'lucide-react';
import { useStore } from '../../store';
import { UserRole } from '../../types';
import { UserProfile } from './UserProfile';

interface NavItemDef {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
  roles?: UserRole[]; // If undefined, accessible by all
}

interface NavGroupDef {
  title: string;
  items: NavItemDef[];
}

const NAV_GROUPS: NavGroupDef[] = [
  {
    title: 'Overview',
    items: [
      { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
      {
        label: 'Analytics',
        icon: BarChart2,
        path: '/analytics',
        roles: ['ADMIN', 'MANAGER', 'FINANCE_STAFF'],
      },
    ],
  },
  {
    title: 'Operations',
    items: [
      { label: 'Shipments', icon: Box, path: '/shipments' },
      { label: 'Tracking', icon: Map, path: '/tracking' },
      {
        label: 'Manifests',
        icon: ClipboardList,
        path: '/manifests',
        roles: ['ADMIN', 'MANAGER', 'OPS_STAFF'],
      },
      {
        label: 'Scanning',
        icon: ScanLine,
        path: '/scanning',
        roles: ['ADMIN', 'MANAGER', 'WAREHOUSE_STAFF'],
      },
      {
        label: 'Inventory',
        icon: Layers,
        path: '/inventory',
        roles: ['ADMIN', 'MANAGER', 'WAREHOUSE_STAFF'],
      },
      {
        label: 'Exceptions',
        icon: AlertTriangle,
        path: '/exceptions',
        roles: ['ADMIN', 'MANAGER', 'OPS_STAFF', 'WAREHOUSE_STAFF'],
      },
    ],
  },
  {
    title: 'Business',
    items: [
      {
        label: 'Invoices',
        icon: CreditCard,
        path: '/finance',
        roles: ['ADMIN', 'MANAGER', 'FINANCE_STAFF'],
      },
      {
        label: 'Customers',
        icon: Users,
        path: '/customers',
        roles: ['ADMIN', 'MANAGER', 'FINANCE_STAFF', 'OPS_STAFF'],
      },
      { label: 'Management', icon: Briefcase, path: '/management', roles: ['ADMIN', 'MANAGER'] },
    ],
  },
  {
    title: 'System',
    items: [{ label: 'Settings', icon: Settings, path: '/settings' }],
  },
];

export const Sidebar: React.FC = () => {
  const { sidebarCollapsed, mobileSidebarOpen, setMobileSidebarOpen, user } = useStore();
  const location = useLocation();

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileSidebarOpen(false);
  }, [location.pathname, setMobileSidebarOpen]);

  const hasAccess = (allowedRoles?: UserRole[]) => {
    if (!allowedRoles) return true;
    if (!user) return false;
    // ADMIN and MANAGER have access to everything
    if (user.role === 'ADMIN' || user.role === 'MANAGER') return true;
    return allowedRoles.includes(user.role);
  };

  return (
    <>
      {/* Mobile overlay backdrop */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
          aria-hidden="true"
        />
      )}
      <aside
        className={`fixed left-0 top-0 h-full bg-sidebar border-r border-sidebar-border transition-all duration-300 z-50 flex flex-col
          ${sidebarCollapsed ? 'w-20' : 'w-64'}
          ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
        `}
      >
        {/* Logo Area */}
        <div className="h-16 flex items-center px-5 border-b border-sidebar-border bg-sidebar/50">
          <div className="flex items-center justify-center shrink-0">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground shadow-sm">
              <span className="font-bold text-lg leading-none">T</span>
            </div>
          </div>
          {!sidebarCollapsed && (
            <span className="ml-3 font-bold text-lg tracking-tight text-foreground flex flex-col leading-none">
              <span className="text-foreground">TAC Cargo</span>
              <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mt-0.5">Enterprise</span>
            </span>
          )}
        </div>

        {/* Nav Items */}
        <nav className="flex-1 px-3 py-6 space-y-8 overflow-y-auto">
          {NAV_GROUPS.map((group, groupIndex) => {
            const visibleItems = group.items.filter((item) => hasAccess(item.roles));

            if (visibleItems.length === 0) return null;

            return (
              <div key={groupIndex}>
                {!sidebarCollapsed && group.title && (
                  <div className="px-4 mb-3 text-[10px] font-bold text-muted-foreground/70 uppercase tracking-widest">
                    {group.title}
                  </div>
                )}
                <div className="space-y-1">
                  {visibleItems.map((item) => (
                    <NavLink
                      key={item.label}
                      to={item.path}
                      title={sidebarCollapsed ? item.label : ''}
                      data-testid={`nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                      aria-label={item.label}
                      className={({ isActive }) => `
                      flex items-center px-3 py-2 text-sm transition-all duration-200 group rounded-md
                      ${isActive
                          ? 'bg-primary text-primary-foreground font-medium shadow-sm'
                          : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground font-normal'
                        }
                    `}
                    >
                      {({ isActive }) => (
                        <>
                          <item.icon
                            className={`w-4 h-4 shrink-0 transition-colors duration-200 ${sidebarCollapsed ? 'mx-auto' : 'mr-3'} ${isActive ? 'text-primary-foreground' : 'text-muted-foreground group-hover:text-foreground'}`}
                            aria-hidden="true"
                          />
                          {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
                        </>
                      )}
                    </NavLink>
                  ))}
                </div>
              </div>
            );
          })}
        </nav>

        {/* Footer / User */}
        <div className="p-4 border-t border-cyber-border">
          <UserProfile collapsed={sidebarCollapsed} />
        </div>
      </aside>
    </>
  );
};
