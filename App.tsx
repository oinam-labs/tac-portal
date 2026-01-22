
import React, { useEffect, Suspense, lazy, useState } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useLocation, useNavigate, Link } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster, toast } from 'sonner';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { useStore } from './store';
import { useAuthStore } from './store/authStore';
import { UserRole, HubLocation } from './types';
import { Button, Card, Input } from './components/ui/CyberComponents';
import { CommandPalette } from './components/domain/CommandPalette';
import { queryClient } from './lib/query-client';
import { ArrowLeft } from 'lucide-react';
import { PageSkeleton } from './components/ui/skeleton';
import { ErrorBoundary } from './components/ui/error-boundary';
import { PageTransition } from './components/ui/page-transition';
import { SentryErrorBoundary, setUserContext, addBreadcrumb } from './lib/sentry';

// Lazy Load Pages
const Landing = lazy(() => import('./pages/Landing').then(module => ({ default: module.Landing })));
const Dashboard = lazy(() => import('./pages/Dashboard').then(module => ({ default: module.Dashboard })));
const Shipments = lazy(() => import('./pages/Shipments').then(module => ({ default: module.Shipments })));
const Finance = lazy(() => import('./pages/Finance').then(module => ({ default: module.Finance })));
const Analytics = lazy(() => import('./pages/Analytics').then(module => ({ default: module.Analytics })));
const Tracking = lazy(() => import('./pages/Tracking').then(module => ({ default: module.Tracking })));
const Manifests = lazy(() => import('./pages/Manifests').then(module => ({ default: module.Manifests })));
const CreateManifestPage = lazy(() => import('./app/(protected)/manifests/create/page').then(module => ({ default: module.default })));
const Scanning = lazy(() => import('./pages/Scanning').then(module => ({ default: module.Scanning })));
const Inventory = lazy(() => import('./pages/Inventory').then(module => ({ default: module.Inventory })));
const Exceptions = lazy(() => import('./pages/Exceptions').then(module => ({ default: module.Exceptions })));
const Customers = lazy(() => import('./pages/Customers').then(module => ({ default: module.Customers })));
const Management = lazy(() => import('./pages/Management').then(module => ({ default: module.Management })));
const Settings = lazy(() => import('./pages/Settings').then(module => ({ default: module.Settings })));
const PublicTracking = lazy(() => import('./pages/PublicTracking').then(module => ({ default: module.PublicTracking })));
const PrintLabel = lazy(() => import('./pages/PrintLabel').then(module => ({ default: module.PrintLabel })));
const Notifications = lazy(() => import('./pages/Notifications').then(module => ({ default: module.Notifications })));
const DevUIKit = lazy(() => import('./pages/DevUIKit').then(module => ({ default: module.DevUIKit })));


// Login Page Component with Supabase Auth
const Login: React.FC = () => {
    const { signIn, isAuthenticated, isLoading, error, clearError, user } = useAuthStore();
    const { login: legacyLogin } = useStore();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

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
                lastLogin: new Date().toISOString()
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
        <div className="min-h-screen bg-cyber-bg flex items-center justify-center p-4 relative overflow-hidden">
            {/* Back Arrow */}
            <button
                onClick={() => navigate('/')}
                className="absolute top-6 left-6 z-50 p-2 text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 group"
            >
                <div className="p-2 rounded-full bg-white/10 border border-white/10 group-hover:border-cyber-neon/50 transition-all">
                    <ArrowLeft className="w-5 h-5" />
                </div>
                <span className="font-mono text-sm font-bold tracking-wide uppercase opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0">Back</span>
            </button>

            {/* Background effects */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyber-accent/10 rounded-full blur-[100px] animate-pulse"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyber-purple/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }}></div>

            <Card className="w-full max-w-md relative z-10 border-cyber-accent/30 shadow-[0_0_50px_rgba(34,211,238,0.1)]">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-cyber-neon to-cyber-purple rounded-xl mx-auto mb-4 flex items-center justify-center shadow-neon">
                        <span className="text-3xl font-bold text-foreground">T</span>
                    </div>
                    <h1 className="text-3xl font-bold text-foreground tracking-tight">TAC <span className="text-primary">CARGO</span></h1>
                    <p className="text-muted-foreground mt-2">Secure Logistics Terminal</p>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-xs font-mono text-primary mb-1 uppercase">Email</label>
                        <Input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email"
                            disabled={isLoading}
                            autoComplete="email"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-mono text-primary mb-1 uppercase">Password</label>
                        <Input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your password"
                            disabled={isLoading}
                            autoComplete="current-password"
                        />
                    </div>
                    <Button
                        type="submit"
                        className="w-full mt-4"
                        size="lg"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Signing in...' : 'Sign In'}
                    </Button>
                </form>

                <div className="mt-6 text-center text-xs text-muted-foreground font-mono">
                    <button onClick={() => navigate('/')} className="hover:text-primary transition-colors">Return to Home</button>
                </div>

                <div className="mt-4 pt-4 border-t border-border text-center text-xs text-muted-foreground">
                    <p>Contact your administrator for account access</p>
                </div>
            </Card>
        </div>
    );
};

// Protected Route Wrapper with RBAC using new Auth Store
const ProtectedRoute: React.FC<{ children: React.ReactNode; allowedRoles?: UserRole[] }> = ({ children, allowedRoles }) => {
    const { isAuthenticated, user, isLoading } = useAuthStore();
    const location = useLocation();

    // Show loading while auth is initializing
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-cyber-bg">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-cyber-neon border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Verifying credentials...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated || !user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Check if user has required role
    const hasAccess = (() => {
        // No role restriction = everyone can access
        if (!allowedRoles || allowedRoles.length === 0) return true;

        // ADMIN and MANAGER have access to everything
        if (user.role === 'ADMIN' || user.role === 'MANAGER') return true;

        // Direct role match
        if (allowedRoles.includes(user.role)) return true;

        // Handle legacy role name mappings
        if (allowedRoles.includes('FINANCE_STAFF') && user.role === 'INVOICE') return true;
        if (allowedRoles.includes('OPS_STAFF') && user.role === 'OPS') return true;
        if (allowedRoles.includes('WAREHOUSE_STAFF') &&
            (user.role === 'WAREHOUSE_IMPHAL' || user.role === 'WAREHOUSE_DELHI')) return true;

        return false;
    })();

    if (!hasAccess) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-cyber-bg text-center p-4">
                <div>
                    <h1 className="text-4xl font-bold text-red-500 mb-2">403 Forbidden</h1>
                    <p className="text-muted-foreground mb-4">Your clearance level ({user.role}) is insufficient for this sector.</p>
                    <Link to="/dashboard" className="text-primary hover:underline">Return to Dashboard</Link>
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
        <div className="min-h-screen bg-cyber-bg text-foreground font-sans selection:bg-cyber-accent/30 transition-colors duration-300">
            <a href="#main-content" className="skip-to-content">Skip to content</a>
            <Sidebar />
            <div className={`transition-all duration-300 ${sidebarCollapsed ? 'pl-20' : 'pl-64'}`}>
                <Header />
                <main id="main-content" className="p-6 max-w-[96%] mx-auto">
                    {children}
                </main>
            </div>
            {/* Global Command Palette - ⌘K / Ctrl+K */}
            <CommandPalette />
        </div>
    );
};

const App: React.FC = () => {
    const { theme } = useStore();
    const { initialize } = useAuthStore();

    // Initialize auth on app startup
    useEffect(() => {
        let cleanup: (() => void) | undefined;

        initialize().then((cleanupFn) => {
            cleanup = cleanupFn;
        });

        // Cleanup function to unsubscribe from auth state changes
        return () => {
            if (cleanup) {
                cleanup();
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Empty array - only run once on mount

    useEffect(() => {
        // Theme switching is silent - no logging needed
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
            document.documentElement.classList.remove('light');
        } else {
            document.documentElement.classList.remove('dark');
            document.documentElement.classList.add('light');
        }
    }, [theme]);

    return (
        <QueryClientProvider client={queryClient}>
            <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                {/* Skip to main content link for accessibility (WCAG 2.4.1) */}
                <a
                    href="#main-content"
                    className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                >
                    Skip to main content
                </a>
                <div className="min-h-screen">
                    <SentryErrorBoundary fallback={({ error, resetError }) => (
                        <div className="min-h-screen flex items-center justify-center bg-cyber-bg p-4">
                            <Card className="max-w-lg p-8 text-center">
                                <h1 className="text-2xl font-bold text-red-500 mb-4">Something went wrong</h1>
                                <p className="text-muted-foreground mb-6">{error instanceof Error ? error.message : 'An unexpected error occurred'}</p>
                                <Button onClick={resetError}>Try Again</Button>
                            </Card>
                        </div>
                    )}>
                        <Suspense fallback={
                            <div className="min-h-screen flex items-center justify-center bg-cyber-bg">
                                <div className="w-full max-w-7xl p-6">
                                    <PageSkeleton />
                                </div>
                            </div>
                        }>
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
                                            <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout><Dashboard /></DashboardLayout></ProtectedRoute>} />
                                            <Route path="/analytics" element={<ProtectedRoute allowedRoles={['ADMIN', 'MANAGER', 'FINANCE_STAFF']}><DashboardLayout><Analytics /></DashboardLayout></ProtectedRoute>} />

                                            {/* Operations Routes */}
                                            <Route path="/shipments" element={<ProtectedRoute><DashboardLayout><Shipments /></DashboardLayout></ProtectedRoute>} />
                                            <Route path="/tracking" element={<ProtectedRoute><DashboardLayout><Tracking /></DashboardLayout></ProtectedRoute>} />
                                            <Route path="/manifests/create" element={<ProtectedRoute allowedRoles={['ADMIN', 'MANAGER', 'OPS_STAFF']}><CreateManifestPage /></ProtectedRoute>} />
                                            <Route path="/manifests" element={<ProtectedRoute allowedRoles={['ADMIN', 'MANAGER', 'OPS_STAFF']}><DashboardLayout><Manifests /></DashboardLayout></ProtectedRoute>} />
                                            <Route path="/scanning" element={<ProtectedRoute allowedRoles={['ADMIN', 'MANAGER', 'WAREHOUSE_STAFF']}><DashboardLayout><Scanning /></DashboardLayout></ProtectedRoute>} />
                                            <Route path="/inventory" element={<ProtectedRoute allowedRoles={['ADMIN', 'MANAGER', 'WAREHOUSE_STAFF']}><DashboardLayout><Inventory /></DashboardLayout></ProtectedRoute>} />
                                            <Route path="/exceptions" element={<ProtectedRoute allowedRoles={['ADMIN', 'MANAGER', 'OPS_STAFF', 'WAREHOUSE_STAFF']}><DashboardLayout><Exceptions /></DashboardLayout></ProtectedRoute>} />

                                            {/* Business Routes */}
                                            <Route path="/finance" element={<ProtectedRoute allowedRoles={['ADMIN', 'MANAGER', 'FINANCE_STAFF']}><DashboardLayout><Finance /></DashboardLayout></ProtectedRoute>} />
                                            <Route path="/customers" element={<ProtectedRoute allowedRoles={['ADMIN', 'MANAGER', 'FINANCE_STAFF', 'OPS_STAFF']}><DashboardLayout><Customers /></DashboardLayout></ProtectedRoute>} />
                                            <Route path="/management" element={<ProtectedRoute allowedRoles={['ADMIN', 'MANAGER']}><DashboardLayout><Management /></DashboardLayout></ProtectedRoute>} />

                                            {/* System Routes */}
                                            <Route path="/settings" element={<ProtectedRoute><DashboardLayout><Settings /></DashboardLayout></ProtectedRoute>} />
                                            <Route path="/notifications" element={<ProtectedRoute><DashboardLayout><Notifications /></DashboardLayout></ProtectedRoute>} />
                                            <Route path="/print/label/:awb" element={<ProtectedRoute><PrintLabel /></ProtectedRoute>} />

                                            {/* Dev Routes (ADMIN only) */}
                                            <Route path="/dev/ui-kit" element={<ProtectedRoute allowedRoles={['ADMIN']}><DevUIKit /></ProtectedRoute>} />

                                            {/* Catch all */}
                                            <Route path="*" element={<Navigate to="/" replace />} />
                                        </Routes>
                                    </main>
                                </PageTransition>
                            </ErrorBoundary>
                        </Suspense>
                        <Toaster position="top-right" richColors />
                    </SentryErrorBoundary>
                </div>
            </Router>
        </QueryClientProvider>
    );
};

export default App;
