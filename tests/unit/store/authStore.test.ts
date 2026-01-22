/**
 * Unit Tests for Auth Store
 * Tests authentication logic and localStorage cleanup on logout
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock Supabase before importing the store
vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
      signInWithPassword: vi.fn(),
      signOut: vi.fn().mockResolvedValue({ error: null }),
      onAuthStateChange: vi
        .fn()
        .mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }),
    },
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
      update: vi.fn().mockReturnThis(),
    }),
  },
}));

describe('Auth Store', () => {
  let localStorageData: Record<string, string>;

  beforeEach(() => {
    // Setup localStorage mock with data
    localStorageData = {
      invoice_draft_123: JSON.stringify({ id: '123', amount: 100 }),
      shipment_456: JSON.stringify({ awb: 'AWB123' }),
      print_789: JSON.stringify({ label: 'test' }),
      label_abc: JSON.stringify({ data: 'test' }),
      'tac-auth': JSON.stringify({ isAuthenticated: true }),
      other_key: 'should_remain',
    };

    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: vi.fn((key: string) => localStorageData[key] || null),
        setItem: vi.fn((key: string, value: string) => {
          localStorageData[key] = value;
        }),
        removeItem: vi.fn((key: string) => {
          delete localStorageData[key];
        }),
        clear: vi.fn(() => {
          localStorageData = {};
        }),
        key: vi.fn((index: number) => Object.keys(localStorageData)[index] || null),
        get length() {
          return Object.keys(localStorageData).length;
        },
      },
      writable: true,
    });

    // Mock Object.keys for localStorage iteration
    vi.spyOn(Object, 'keys').mockImplementation((obj: object) => {
      if (obj === localStorage) {
        return Object.keys(localStorageData);
      }
      return Reflect.ownKeys(obj).filter((key): key is string => typeof key === 'string');
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('signOut', () => {
    it('should clear sensitive localStorage data on logout', async () => {
      // Import after mocks are set up
      const { useAuthStore } = await import('@/store/authStore');

      // Trigger signOut
      await useAuthStore.getState().signOut();

      // Verify sensitive keys were removed
      expect(localStorage.removeItem).toHaveBeenCalledWith('invoice_draft_123');
      expect(localStorage.removeItem).toHaveBeenCalledWith('shipment_456');
      expect(localStorage.removeItem).toHaveBeenCalledWith('print_789');
      expect(localStorage.removeItem).toHaveBeenCalledWith('label_abc');
      expect(localStorage.removeItem).toHaveBeenCalledWith('tac-auth');
    });

    it('should reset auth state after logout', async () => {
      const { useAuthStore } = await import('@/store/authStore');

      await useAuthStore.getState().signOut();

      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(false);
      expect(state.user).toBeNull();
      expect(state.session).toBeNull();
    });
  });

  describe('initialize', () => {
    it('should set isLoading to false after initialization', async () => {
      const { useAuthStore } = await import('@/store/authStore');

      await useAuthStore.getState().initialize();

      expect(useAuthStore.getState().isLoading).toBe(false);
    });
  });
});
