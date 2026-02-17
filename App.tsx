import React, { useEffect, Suspense, lazy, useState } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
  Link,
} from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster, toast } from 'sonner';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { useStore } from './store';
import { useAuthStore } from './store/authStore';
import { useIdleTimeout } from './hooks/useIdleTimeout';
import { UserRole, HubLocation } from './types';
import { Button } from './components/ui/button';
import { Card } from './components/ui/card';
import { CommandPalette } from './components/domain/CommandPalette';
import { GlobalNotificationListener } from './components/domain/GlobalNotificationListener';
import { queryClient } from './lib/query-client';
import { ArrowLeft, Eye, EyeOff, Mail, Lock, Shield, Clock, LogIn, Box } from 'lucide-react';
import { PageSkeleton } from './components/ui/skeleton';
import { AnimatedThemeToggler } from './components/ui/animated-theme-toggler';
import { ErrorBoundary } from './components/ui/error-boundary';
import { PageTransition } from './components/ui/page-transition';
import { SentryErrorBoundary, setUserContext, addBreadcrumb } from './lib/sentry';
import { ScanningProvider } from './context/ScanningProvider';
import { ScanContextProvider } from './context/ScanContext';
import { GlobalScanListener } from './components/scanning/GlobalScanListener';

// Lazy Load Pages
const Landing = lazy(() =>
  import('./pages/LandingPage').then((module) => ({ default: module.Landing }))
);
const Dashboard = lazy(() =>
  import('./pages/Dashboard').then((module) => ({ default: module.Dashboard }))
);
const Shipments = lazy(() =>
  import('./pages/Shipments').then((module) => ({ default: module.Shipments }))
);
const ShipmentDetailsPage = lazy(() =>
  import('./pages/ShipmentDetailsPage').then((module) => ({ default: module.ShipmentDetailsPage }))
);
const Finance = lazy(() =>
  import('./pages/Finance').then((module) => ({ default: module.Finance }))
);
const Analytics = lazy(() =>
  import('./pages/Analytics').then((module) => ({ default: module.Analytics }))
);
const Tracking = lazy(() =>
  import('./pages/Tracking').then((module) => ({ default: module.Tracking }))
);
const Manifests = lazy(() =>
  import('./pages/Manifests').then((module) => ({ default: module.Manifests }))
);
const Scanning = lazy(() =>
  import('./pages/Scanning').then((module) => ({ default: module.Scanning }))
);
const Inventory = lazy(() =>
  import('./pages/Inventory').then((module) => ({ default: module.Inventory }))
);
const Exceptions = lazy(() =>
  import('./pages/Exceptions').then((module) => ({ default: module.Exceptions }))
);
const Customers = lazy(() =>
  import('./pages/Customers').then((module) => ({ default: module.Customers }))
);
const Management = lazy(() =>
  import('./pages/Management').then((module) => ({ default: module.Management }))
);
const Settings = lazy(() =>
  import('./pages/Settings').then((module) => ({ default: module.Settings }))
);
const PublicTracking = lazy(() =>
  import('./pages/PublicTracking').then((module) => ({ default: module.PublicTracking }))
);
const PrintLabel = lazy(() =>
  import('./pages/PrintLabel').then((module) => ({ default: module.PrintLabel }))
);
const Notifications = lazy(() =>
  import('./pages/Notifications').then((module) => ({ default: module.Notifications }))
);
const DevUIKit = lazy(() =>
  import('./pages/DevUIKit').then((module) => ({ default: module.DevUIKit }))
);
const SentryTest = lazy(() =>
  import('./pages/SentryTest').then((module) => ({ default: module.SentryTest }))
);
const ShiftReport = lazy(() => import('./pages/ShiftReport'));
const NotFound = lazy(() => import('./pages/NotFound'));
const Messages = lazy(() =>
  import('./pages/admin/Messages').then((module) => ({ default: module.Messages }))
);
const SearchResults = lazy(() =>
  import('./pages/SearchResults').then((module) => ({ default: module.SearchResults }))
);

// Login Page Component with Supabase Auth
const Login: React.FC = () => {
  const { signIn, isAuthenticated, isLoading, error, clearError, user } = useAuthStore();
  const { login: legacyLogin, setTheme } = useStore();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      // Sync with legacy store for backward compatibility
      legacyLogin({
        id: user.id,
        email: user.email,
        name: user.fullName,
        role: user.role,
        assignedHub: (user.hubCode as HubLocation) ?? undefined,
        active: user.isActive,
        lastLogin: new Date().toISOString(),
      });
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, user, navigate, legacyLogin]);

  // Clear error when inputs change
  useEffect(() => {
    if (error) clearError();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only trigger on input changes, not on error
  }, [email, password]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error('Please enter email and password');
      return;
    }

    const result = await signIn(email, password);

    if (result.success) {
      const currentUser = useAuthStore.getState().user;
      if (currentUser) {
        // Set Sentry user context
        setUserContext({
          id: currentUser.id,
          email: currentUser.email,
          username: currentUser.fullName,
          role: currentUser.role,
        });
        addBreadcrumb('User logged in', 'auth', 'info');
        toast.success(`Welcome back, ${currentUser.fullName}!`);
      }
    } else {
      toast.error(result.error || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen antialiased selection:bg-primary/20 text-foreground font-sans">
      {/* Gradient Background — adapative to project theme */}
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-background via-muted/50 to-background dark:from-background dark:via-primary/5 dark:to-background transition-colors duration-500">
        {/* Ambient blobs using project vars */}
        <div className="absolute top-1/4 -left-20 w-[500px] h-[500px] rounded-full bg-primary/20 sm:bg-primary/10 blur-[120px] animate-pulse" />
        <div
          className="absolute bottom-1/4 -right-20 w-[400px] h-[400px] rounded-full bg-accent/20 sm:bg-accent/10 blur-[100px] animate-pulse"
          style={{ animationDelay: '2s' }}
        />
      </div>

      {/* Top Controls */}
      <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between p-5 sm:p-6">
        {/* Back Arrow */}
        <button
          onClick={() => navigate('/')}
          className="group flex items-center gap-2 rounded-full border border-border/40 bg-background/50 backdrop-blur-md px-3 py-2 text-sm font-medium text-foreground shadow-sm hover:bg-background/80 hover:border-border transition-all"
          aria-label="Back to home"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Home</span>
        </button>

        {/* Theme Toggle — Matches Landing Page Animation */}
        <AnimatedThemeToggler onThemeChange={setTheme} />
      </div>

      <main className="relative flex min-h-screen items-center justify-center p-4 sm:p-6">
        {/* Card */}
        <div className="relative z-10 w-full max-w-3xl">
          <div className="group relative overflow-hidden rounded-2xl border border-black/10 dark:border-white/10 bg-white/70 dark:bg-white/10 backdrop-blur-xl shadow-2xl shadow-black/10 dark:shadow-black/40 ring-1 ring-black/5 dark:ring-white/10 transition-all duration-300 hover:border-black/15 dark:hover:border-white/20 hover:ring-black/10 dark:hover:ring-white/20">
            {/* Top hairline */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-black/10 dark:via-white/20 to-transparent" />

            {/* Split: Image + Form */}
            <div className="relative flex flex-col sm:flex-row">
              {/* Image (Left) */}
              <div className="relative w-full sm:w-1/2 h-48 sm:h-auto min-h-[320px]">
                <img
                  src="/tac-hero-bg.jpeg"
                  alt="TAC Cargo logistics"
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-black/60 via-black/30 to-transparent" />

                {/* Overlay badge */}
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between rounded-lg border border-white/10 bg-black/30 px-3 py-2 backdrop-blur-md">
                  <div className="flex items-center gap-2 text-xs text-white/75">
                    <Box className="h-3.5 w-3.5" />
                    Secure channel
                  </div>
                  <span className="text-[11px] text-white/60">TAC v4.0</span>
                </div>
              </div>

              {/* Form (Right) */}
              <div className="p-6 sm:p-8 w-full sm:w-1/2">
                {/* Logo */}
                <div className="mb-6 flex items-center justify-between">
                  <Link to="/" className="flex items-center gap-3 group">
                    <div className="grid h-10 w-10 place-items-center text-foreground/80 dark:text-white/90 bg-black/5 dark:bg-white/10 border border-black/10 dark:border-white/15 rounded-xl shadow-sm group-hover:bg-black/10 dark:group-hover:bg-white/20 transition-colors">
                      <Box className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-sm tracking-widest text-muted-foreground dark:text-white/60">
                        TAC
                      </div>
                      <div className="text-[22px] tracking-tight font-semibold leading-tight text-foreground dark:text-white">
                        Cargo
                      </div>
                    </div>
                  </Link>
                  <div className="text-xs text-muted-foreground dark:text-white/50">v4.0</div>
                </div>

                {/* Heading */}
                <div className="mb-6">
                  <h1 className="text-[26px] font-semibold tracking-tight text-foreground dark:text-white">
                    Welcome back
                  </h1>
                  <p className="mt-1.5 text-sm text-muted-foreground dark:text-white/60">
                    Sign in to your logistics dashboard.
                  </p>
                </div>

                {/* Error */}
                {error && (
                  <div
                    data-testid="login-error-message"
                    className="mb-4 p-3 rounded-xl border border-destructive/30 bg-destructive/10 text-destructive dark:text-red-300 text-sm backdrop-blur-sm"
                  >
                    {error}
                  </div>
                )}

                {/* Form */}
                <form onSubmit={handleLogin} className="space-y-4">
                  {/* Email */}
                  <div className="space-y-2">
                    <label
                      htmlFor="login-email"
                      className="block text-sm text-foreground/80 dark:text-white/80"
                    >
                      Email
                    </label>
                    <div className="group/input relative flex items-center rounded-xl border border-black/10 dark:border-white/10 bg-black/[0.03] dark:bg-white/5 px-3 py-2.5 transition-all hover:border-black/20 dark:hover:border-white/20 focus-within:border-primary/40 dark:focus-within:border-white/25 focus-within:bg-black/[0.05] dark:focus-within:bg-white/[0.07]">
                      <Mail className="mr-2 h-4 w-4 text-muted-foreground dark:text-white/50 shrink-0" />
                      <input
                        id="login-email"
                        type="email"
                        inputMode="email"
                        autoComplete="email"
                        placeholder="you@company.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={isLoading}
                        data-testid="login-email-input"
                        className="w-full bg-transparent text-sm text-foreground dark:text-white placeholder:text-muted-foreground/60 dark:placeholder:text-white/40 focus:outline-none disabled:opacity-50"
                      />
                      <div className="pointer-events-none absolute inset-0 rounded-xl ring-0 ring-primary/0 transition-all group-focus-within/input:ring-2 group-focus-within/input:ring-primary/25" />
                    </div>
                  </div>

                  {/* Password */}
                  <div className="space-y-2">
                    <label
                      htmlFor="login-password"
                      className="block text-sm text-foreground/80 dark:text-white/80"
                    >
                      Password
                    </label>
                    <div className="group/input relative flex items-center rounded-xl border border-black/10 dark:border-white/10 bg-black/[0.03] dark:bg-white/5 px-3 py-2.5 transition-all hover:border-black/20 dark:hover:border-white/20 focus-within:border-primary/40 dark:focus-within:border-white/25 focus-within:bg-black/[0.05] dark:focus-within:bg-white/[0.07]">
                      <Lock className="mr-2 h-4 w-4 text-muted-foreground dark:text-white/50 shrink-0" />
                      <input
                        id="login-password"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="current-password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={isLoading}
                        data-testid="login-password-input"
                        className="w-full bg-transparent text-sm text-foreground dark:text-white placeholder:text-muted-foreground/60 dark:placeholder:text-white/40 focus:outline-none disabled:opacity-50"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="ml-2 grid h-8 w-8 shrink-0 place-items-center rounded-lg text-muted-foreground dark:text-white/60 hover:text-foreground dark:hover:text-white/90 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                        tabIndex={-1}
                        aria-label="Toggle password visibility"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                      <div className="pointer-events-none absolute inset-0 rounded-xl ring-0 ring-primary/0 transition-all group-focus-within/input:ring-2 group-focus-within/input:ring-primary/25" />
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="my-2 h-px bg-gradient-to-r from-transparent via-black/10 dark:via-white/10 to-transparent" />

                  {/* Submit */}
                  <div className="grid gap-3">
                    <button
                      type="submit"
                      disabled={isLoading}
                      data-testid="login-submit-button"
                      className="group relative inline-flex items-center justify-center rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/30 outline-none ring-1 ring-primary/30 transition-all hover:shadow-primary/40 hover:brightness-110 hover:saturate-125 focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <span className="absolute inset-0 -z-10 rounded-xl bg-primary/20 opacity-0 blur-xl transition-opacity group-hover:opacity-100" />
                      <LogIn className="mr-2 h-4 w-4" />
                      {isLoading ? 'Signing in...' : 'Sign in'}
                    </button>
                    <p className="text-center text-xs text-muted-foreground dark:text-white/55">
                      <button
                        type="button"
                        onClick={() => navigate('/')}
                        className="text-primary/90 hover:text-primary underline underline-offset-4 transition-colors"
                      >
                        ← Return to Home
                      </button>
                    </p>
                  </div>
                </form>
              </div>
            </div>

            {/* Bottom footer */}
            <div className="flex items-center justify-between rounded-b-2xl border-t border-black/5 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.04] px-6 py-3 text-[11px] text-muted-foreground dark:text-white/55">
              <div className="flex items-center gap-2">
                <Shield className="h-3.5 w-3.5" />
                <span>Secured access</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-3.5 w-3.5" />
                <span>Contact admin for access</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

// Protected Route Wrapper with RBAC using new Auth Store
const ProtectedRoute: React.FC<{ children: React.ReactNode; allowedRoles?: UserRole[] }> = ({
  children,
  allowedRoles,
}) => {
  const { isAuthenticated, user, isLoading } = useAuthStore();
  const location = useLocation();

  // Show loading while auth is initializing
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Verifying credentials...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    console.debug('[ProtectedRoute] Redirecting to login. State:', {
      isAuthenticated,
      user,
      isLoading,
      from: location.pathname,
    });
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if user has required role
  const hasAccess = (() => {
    // No role restriction = everyone can access
    if (!allowedRoles || allowedRoles.length === 0) return true;

    // SUPER_ADMIN has god mode
    if (user.role === 'SUPER_ADMIN') return true;

    // ADMIN and MANAGER have access to everything
    if (user.role === 'ADMIN' || user.role === 'MANAGER') return true;

    // Direct role match
    if (allowedRoles.includes(user.role)) return true;

    // Handle legacy role name mappings
    if (allowedRoles.includes('FINANCE_STAFF') && user.role === 'INVOICE') return true;
    if (allowedRoles.includes('OPS_STAFF') && user.role === 'OPS') return true;
    if (
      allowedRoles.includes('WAREHOUSE_STAFF') &&
      (user.role === 'WAREHOUSE_IMPHAL' || user.role === 'WAREHOUSE_DELHI')
    )
      return true;

    return false;
  })();

  if (!hasAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-center p-4">
        <div>
          <h1 className="text-4xl font-bold text-destructive mb-2">403 Forbidden</h1>
          <p className="text-muted-foreground mb-4">
            Your clearance level ({user?.role || 'GUEST'}) is insufficient for this sector.
          </p>
          <Link to="/dashboard" className="text-primary hover:underline">
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

// Main Layout Wrapper
const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { sidebarCollapsed } = useStore();
  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/30 transition-colors duration-300">
      <a href="#main-content" className="skip-to-content">
        Skip to content
      </a>
      <Sidebar />
      {/* On mobile (< lg), no left padding since sidebar is hidden. On desktop, apply padding based on sidebar state */}
      <div className={`transition-all duration-300 ${sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'}`}>
        <Header />
        <main
          id="main-content"
          className="p-4 md:p-5 lg:p-6 max-w-full lg:max-w-screen-2xl mx-auto"
        >
          {children}
        </main>
      </div>
      {/* Global Command Palette - ⌘K / Ctrl+K */}
      <CommandPalette />
      <GlobalNotificationListener />
    </div>
  );
};

const App: React.FC = () => {
  const { theme } = useStore();
  const { initialize } = useAuthStore();
  useIdleTimeout();

  // Initialize auth on app startup
  useEffect(() => {
    let cleanup: (() => void) | undefined;
    let mounted = true;

    initialize()
      .then((cleanupFn) => {
        if (mounted) {
          cleanup = cleanupFn;
        } else {
          // If unmounted before init finishes, call cleanup immediately
          cleanupFn();
        }
      })
      .catch((error) => {
        if (error instanceof Error && error.name === 'AbortError') return;
        console.error('[App] Auth initialization failed:', error);
      });

    // Cleanup function to unsubscribe from auth state changes
    return () => {
      mounted = false;
      if (cleanup) {
        cleanup();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty array - only run once on mount

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';

      root.classList.add(systemTheme);
      return;
    }

    root.classList.add(theme);
  }, [theme]);

  return (
    <QueryClientProvider client={queryClient}>
      <ScanningProvider>
        <ScanContextProvider>
          <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <GlobalScanListener />
            <div className="min-h-screen">
              <SentryErrorBoundary
                fallback={({ error, resetError }) => (
                  <div className="min-h-screen flex items-center justify-center bg-background p-4">
                    <Card className="max-w-lg p-8 text-center">
                      <h1 className="text-2xl font-bold text-destructive mb-4">
                        Something went wrong
                      </h1>
                      <p className="text-muted-foreground mb-6">
                        {error instanceof Error ? error.message : 'An unexpected error occurred'}
                      </p>
                      <Button onClick={resetError}>Try Again</Button>
                    </Card>
                  </div>
                )}
              >
                <Suspense
                  fallback={
                    <div className="min-h-screen flex items-center justify-center bg-background">
                      <div className="w-full max-w-7xl p-6">
                        <PageSkeleton />
                      </div>
                    </div>
                  }
                >
                  <ErrorBoundary>
                    <PageTransition>
                      <main id="main-content" tabIndex={-1} className="outline-none">
                        <Routes>
                          {/* Public Landing Page */}
                          <Route path="/" element={<Landing />} />

                          {/* Public Tracking Page */}
                          <Route path="/track" element={<PublicTracking />} />
                          <Route path="/track/:awb" element={<PublicTracking />} />

                          <Route path="/login" element={<Login />} />

                          {/* Dashboard Routes (Protected) */}
                          <Route
                            path="/dashboard"
                            element={
                              <ProtectedRoute>
                                <DashboardLayout>
                                  <Dashboard />
                                </DashboardLayout>
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/analytics"
                            element={
                              <ProtectedRoute allowedRoles={['ADMIN', 'MANAGER', 'FINANCE_STAFF']}>
                                <DashboardLayout>
                                  <Analytics />
                                </DashboardLayout>
                              </ProtectedRoute>
                            }
                          />

                          {/* Operations Routes */}
                          <Route
                            path="/search"
                            element={
                              <ProtectedRoute>
                                <DashboardLayout>
                                  <SearchResults />
                                </DashboardLayout>
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/shipments"
                            element={
                              <ProtectedRoute>
                                <DashboardLayout>
                                  <Shipments />
                                </DashboardLayout>
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/shipments/:id"
                            element={
                              <ProtectedRoute>
                                <DashboardLayout>
                                  <ShipmentDetailsPage />
                                </DashboardLayout>
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/tracking"
                            element={
                              <ProtectedRoute>
                                <DashboardLayout>
                                  <Tracking />
                                </DashboardLayout>
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/manifests"
                            element={
                              <ProtectedRoute allowedRoles={['ADMIN', 'MANAGER', 'OPS_STAFF']}>
                                <DashboardLayout>
                                  <Manifests />
                                </DashboardLayout>
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/scanning"
                            element={
                              <ProtectedRoute
                                allowedRoles={['ADMIN', 'MANAGER', 'WAREHOUSE_STAFF']}
                              >
                                <DashboardLayout>
                                  <Scanning />
                                </DashboardLayout>
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/inventory"
                            element={
                              <ProtectedRoute
                                allowedRoles={['ADMIN', 'MANAGER', 'WAREHOUSE_STAFF']}
                              >
                                <DashboardLayout>
                                  <Inventory />
                                </DashboardLayout>
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/exceptions"
                            element={
                              <ProtectedRoute
                                allowedRoles={['ADMIN', 'MANAGER', 'OPS_STAFF', 'WAREHOUSE_STAFF']}
                              >
                                <DashboardLayout>
                                  <Exceptions />
                                </DashboardLayout>
                              </ProtectedRoute>
                            }
                          />

                          {/* Business Routes */}
                          <Route
                            path="/finance"
                            element={
                              <ProtectedRoute allowedRoles={['ADMIN', 'MANAGER', 'FINANCE_STAFF']}>
                                <DashboardLayout>
                                  <Finance />
                                </DashboardLayout>
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/customers"
                            element={
                              <ProtectedRoute
                                allowedRoles={['ADMIN', 'MANAGER', 'FINANCE_STAFF', 'OPS_STAFF']}
                              >
                                <DashboardLayout>
                                  <Customers />
                                </DashboardLayout>
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/management"
                            element={
                              <ProtectedRoute allowedRoles={['ADMIN', 'MANAGER']}>
                                <DashboardLayout>
                                  <Management />
                                </DashboardLayout>
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/admin/messages"
                            element={
                              <ProtectedRoute allowedRoles={['ADMIN']}>
                                <DashboardLayout>
                                  <Messages />
                                </DashboardLayout>
                              </ProtectedRoute>
                            }
                          />

                          {/* System Routes */}
                          <Route
                            path="/settings"
                            element={
                              <ProtectedRoute>
                                <DashboardLayout>
                                  <Settings />
                                </DashboardLayout>
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/shift-report"
                            element={
                              <ProtectedRoute>
                                <DashboardLayout>
                                  <ShiftReport />
                                </DashboardLayout>
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/notifications"
                            element={
                              <ProtectedRoute>
                                <DashboardLayout>
                                  <Notifications />
                                </DashboardLayout>
                              </ProtectedRoute>
                            }
                          />
                          <Route path="/print/label/:awb" element={<PrintLabel />} />

                          {/* Dev Routes (ADMIN only) */}
                          <Route
                            path="/dev/ui-kit"
                            element={
                              <ProtectedRoute allowedRoles={['ADMIN']}>
                                <DevUIKit />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/dev/sentry"
                            element={
                              <ProtectedRoute allowedRoles={['ADMIN']}>
                                <SentryTest />
                              </ProtectedRoute>
                            }
                          />

                          {/* 404 – Not Found */}
                          <Route path="*" element={<NotFound />} />
                        </Routes>
                      </main>
                    </PageTransition>
                  </ErrorBoundary>
                </Suspense>
                <Toaster position="top-right" richColors />
              </SentryErrorBoundary>
            </div>
          </Router>
        </ScanContextProvider>
      </ScanningProvider>
    </QueryClientProvider>
  );
};

export default App;
