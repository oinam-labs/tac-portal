import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { NavItem, User } from '../types';

interface AppState {
    user: User | null;
    currentNav: NavItem;
    sidebarCollapsed: boolean;
    isAuthenticated: boolean;
    theme: 'dark' | 'light';
    login: (user: User) => void;
    logout: () => void;
    setNav: (nav: NavItem) => void;
    toggleSidebar: () => void;
    toggleTheme: () => void;
}

export const useStore = create<AppState>()(
    persist(
        (set) => ({
            user: null,
            currentNav: NavItem.DASHBOARD,
            sidebarCollapsed: false,
            isAuthenticated: false, // Set to true to bypass login for dev if needed
            theme: 'dark',
            login: (user) => set({ user, isAuthenticated: true }),
            logout: () => set({ user: null, isAuthenticated: false }),
            setNav: (nav) => set({ currentNav: nav }),
            toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
            toggleTheme: () => set((state) => ({ theme: state.theme === 'dark' ? 'light' : 'dark' })),
        }),
        {
            name: 'tac-storage',
            partialize: (state) => ({
                user: state.user,
                isAuthenticated: state.isAuthenticated,
                theme: state.theme,
                sidebarCollapsed: state.sidebarCollapsed
            }),
        }
    )
);