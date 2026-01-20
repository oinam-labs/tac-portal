/**
 * Auth Store with Supabase Authentication
 * Role-based authentication for Admin and Employee users
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '@/lib/supabase';
import type { Session } from '@supabase/supabase-js';
import type { UserRole } from '@/types';

// Cast to any because generated Supabase types don't include staff table
// TODO: Regenerate Supabase types to include all tables
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;

export interface StaffUser {
    id: string;
    authUserId: string;
    email: string;
    fullName: string;
    role: UserRole;
    hubId: string | null;
    hubCode: string | null;
    orgId: string;
    isActive: boolean;
}

interface AuthState {
    // State
    session: Session | null;
    user: StaffUser | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;

    // Actions
    initialize: () => Promise<void>;
    signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
    signOut: () => Promise<void>;
    clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, _get) => ({
            session: null,
            user: null,
            isAuthenticated: false,
            isLoading: true,
            error: null,

            initialize: async () => {
                try {
                    set({ isLoading: true, error: null });

                    // Get current session
                    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

                    if (sessionError) {
                        console.error('[Auth] Session error:', sessionError);
                        set({ isLoading: false, isAuthenticated: false, session: null, user: null });
                        return;
                    }

                    if (!session) {
                        set({ isLoading: false, isAuthenticated: false, session: null, user: null });
                        return;
                    }

                    // Fetch staff record linked to this auth user
                    const staffUser = await fetchStaffByAuthId(session.user.id);

                    if (!staffUser) {
                        console.warn('[Auth] No staff record found for user:', session.user.email);
                        set({ isLoading: false, isAuthenticated: false, session: null, user: null });
                        return;
                    }

                    if (!staffUser.isActive) {
                        console.warn('[Auth] Staff account is deactivated:', staffUser.email);
                        await supabase.auth.signOut();
                        set({
                            isLoading: false,
                            isAuthenticated: false,
                            session: null,
                            user: null,
                            error: 'Your account has been deactivated. Please contact an administrator.'
                        });
                        return;
                    }

                    set({
                        session,
                        user: staffUser,
                        isAuthenticated: true,
                        isLoading: false,
                        error: null
                    });

                    // Set up auth state change listener
                    supabase.auth.onAuthStateChange(async (event, newSession) => {
                        console.log('[Auth] State changed:', event);

                        if (event === 'SIGNED_OUT' || !newSession) {
                            set({ session: null, user: null, isAuthenticated: false });
                            return;
                        }

                        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
                            const staff = await fetchStaffByAuthId(newSession.user.id);
                            if (staff && staff.isActive) {
                                set({
                                    session: newSession,
                                    user: staff,
                                    isAuthenticated: true
                                });
                            }
                        }
                    });

                } catch (error) {
                    console.error('[Auth] Initialize error:', error);
                    set({ isLoading: false, isAuthenticated: false, error: 'Failed to initialize authentication' });
                }
            },

            signIn: async (email: string, password: string) => {
                try {
                    set({ isLoading: true, error: null });

                    // Authenticate with Supabase Auth
                    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
                        email,
                        password
                    });

                    if (authError) {
                        console.error('[Auth] Sign in error:', authError);
                        set({
                            isLoading: false,
                            error: authError.message === 'Invalid login credentials'
                                ? 'Invalid email or password'
                                : authError.message
                        });
                        return { success: false, error: authError.message };
                    }

                    if (!authData.session || !authData.user) {
                        set({ isLoading: false, error: 'Authentication failed' });
                        return { success: false, error: 'Authentication failed' };
                    }

                    // Fetch staff record
                    const staffUser = await fetchStaffByAuthId(authData.user.id);

                    if (!staffUser) {
                        // No staff record - sign out and show error
                        await supabase.auth.signOut();
                        set({
                            isLoading: false,
                            error: 'No staff account linked to this email. Please contact an administrator.'
                        });
                        return { success: false, error: 'No staff account found' };
                    }

                    if (!staffUser.isActive) {
                        await supabase.auth.signOut();
                        set({
                            isLoading: false,
                            error: 'Your account has been deactivated. Please contact an administrator.'
                        });
                        return { success: false, error: 'Account deactivated' };
                    }

                    // Update last login time
                    await db
                        .from('staff')
                        .update({ updated_at: new Date().toISOString() })
                        .eq('id', staffUser.id);

                    set({
                        session: authData.session,
                        user: staffUser,
                        isAuthenticated: true,
                        isLoading: false,
                        error: null
                    });

                    return { success: true };

                } catch (error) {
                    console.error('[Auth] Sign in error:', error);
                    const message = error instanceof Error ? error.message : 'Sign in failed';
                    set({ isLoading: false, error: message });
                    return { success: false, error: message };
                }
            },

            signOut: async () => {
                try {
                    set({ isLoading: true });
                    await supabase.auth.signOut();
                    set({
                        session: null,
                        user: null,
                        isAuthenticated: false,
                        isLoading: false,
                        error: null
                    });
                } catch (error) {
                    console.error('[Auth] Sign out error:', error);
                    // Force clear state even on error
                    set({
                        session: null,
                        user: null,
                        isAuthenticated: false,
                        isLoading: false
                    });
                }
            },

            clearError: () => set({ error: null })
        }),
        {
            name: 'tac-auth',
            partialize: (state) => ({
                // Only persist minimal auth state - session will be restored from Supabase
                isAuthenticated: state.isAuthenticated,
                user: state.user
            })
        }
    )
);

/**
 * Fetch staff record by Supabase Auth user ID
 */
async function fetchStaffByAuthId(authUserId: string): Promise<StaffUser | null> {
    try {
        const { data, error } = await db
            .from('staff')
            .select(`
                id,
                auth_user_id,
                email,
                full_name,
                role,
                hub_id,
                org_id,
                is_active,
                hub:hubs(code)
            `)
            .eq('auth_user_id', authUserId)
            .single();

        if (error || !data) {
            console.error('[Auth] Failed to fetch staff:', error);
            return null;
        }

        return {
            id: data.id,
            authUserId: data.auth_user_id,
            email: data.email,
            fullName: data.full_name,
            role: data.role as UserRole,
            hubId: data.hub_id,
            hubCode: data.hub?.code || null,
            orgId: data.org_id,
            isActive: data.is_active
        };
    } catch (error) {
        console.error('[Auth] fetchStaffByAuthId error:', error);
        return null;
    }
}

/**
 * Hook to check if current user has specific role(s)
 */
export function useHasRole(roles: UserRole | UserRole[]): boolean {
    const user = useAuthStore((state) => state.user);
    if (!user) return false;

    const roleArray = Array.isArray(roles) ? roles : [roles];
    return roleArray.includes(user.role);
}

/**
 * Hook to check if current user can access a module
 */
export function useCanAccessModule(module: string): boolean {
    const user = useAuthStore((state) => state.user);
    if (!user) return false;

    const moduleAccess: Record<UserRole, string[]> = {
        ADMIN: ['*'],
        MANAGER: ['*'],
        OPS: ['shipments', 'manifests', 'tracking', 'customers', 'exceptions'],
        OPS_STAFF: ['shipments', 'manifests', 'tracking', 'customers', 'exceptions'],
        WAREHOUSE_IMPHAL: ['scanning', 'inventory', 'shipments', 'exceptions'],
        WAREHOUSE_DELHI: ['scanning', 'inventory', 'shipments', 'exceptions'],
        WAREHOUSE_STAFF: ['scanning', 'inventory', 'shipments', 'exceptions'],
        INVOICE: ['finance', 'customers', 'shipments'],
        FINANCE_STAFF: ['finance', 'customers', 'shipments'],
        SUPPORT: ['shipments', 'tracking', 'customers']
    };

    const allowedModules = moduleAccess[user.role] || [];
    return allowedModules.includes('*') || allowedModules.includes(module);
}
