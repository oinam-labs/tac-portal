
import React, { useEffect, Suspense, lazy } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { useStore } from './store';
import { User, UserRole } from './types';
import { Button, Card, Input } from './components/ui/CyberComponents';
import { CommandPalette } from './components/domain/CommandPalette';
import { queryClient } from './lib/query-client';
import { ArrowLeft } from 'lucide-react';
import { PageSkeleton } from './components/ui/skeleton';
import { ErrorBoundary } from './components/ui/error-boundary';

// Lazy Load Pages
const Landing = lazy(() => import('./pages/Landing').then(module => ({ default: module.Landing })));
const Dashboard = lazy(() => import('./pages/Dashboard').then(module => ({ default: module.Dashboard })));
const Shipments = lazy(() => import('./pages/Shipments').then(module => ({ default: module.Shipments })));
const Finance = lazy(() => import('./pages/Finance').then(module => ({ default: module.Finance })));
const Analytics = lazy(() => import('./pages/Analytics').then(module => ({ default: module.Analytics })));
const Tracking = lazy(() => import('./pages/Tracking').then(module => ({ default: module.Tracking })));
const Manifests = lazy(() => import('./pages/Manifests').then(module => ({ default: module.Manifests })));
const Scanning = lazy(() => import('./pages/Scanning').then(module => ({ default: module.Scanning })));
const Inventory = lazy(() => import('./pages/Inventory').then(module => ({ default: module.Inventory })));
const Exceptions = lazy(() => import('./pages/Exceptions').then(module => ({ default: module.Exceptions })));
const Customers = lazy(() => import('./pages/Customers').then(module => ({ default: module.Customers })));
const Management = lazy(() => import('./pages/Management').then(module => ({ default: module.Management })));
const Settings = lazy(() => import('./pages/Settings').then(module => ({ default: module.Settings })));
const PublicTracking = lazy(() => import('./pages/PublicTracking').then(module => ({ default: module.PublicTracking })));
const PrintLabel = lazy(() => import('./pages/PrintLabel').then(module => ({ default: module.PrintLabel })));

// Simple Login Page Component
const Login: React.FC = () => {
    const { login, isAuthenticated } = useStore();
    const navigate = useNavigate();

    // Redirect if already authenticated
    useEffect(() => {
        if (isAuthenticated) {
            navigate('/dashboard', { replace: true });
        }
    }, [isAuthenticated, navigate]);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        // Mock login
        const mockUser: User = {
            id: 'u1',
            email: 'admin@taccargo.com',
            name: 'Admin User',
            role: 'ADMIN',
            assignedHub: 'IMPHAL',
            active: true,
            lastLogin: new Date().toISOString()
        };
        login(mockUser);
        navigate('/dashboard');
    };

    return (
        <div className="min-h-screen bg-cyber-bg flex items-center justify-center p-4 relative overflow-hidden">
            {/* Back Arrow */}
            <button
                onClick={() => navigate('/')}
                className="absolute top-6 left-6 z-50 p-2 text-slate-500 hover:text-cyber-neon transition-colors flex items-center gap-2 group"
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
                        <span className="text-3xl font-bold text-slate-900 dark:text-white">T</span>
                    </div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">TAC <span className="text-cyber-neon">CARGO</span></h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-2">Secure Logistics Terminal</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-xs font-mono text-cyber-neon mb-1 uppercase">Operator ID</label>
                        <Input type="email" defaultValue="admin@taccargo.com" placeholder="Enter ID" />
                    </div>
                    <div>
                        <label className="block text-xs font-mono text-cyber-neon mb-1 uppercase">Passkey</label>
                        <Input type="password" defaultValue="password" placeholder="Enter Passkey" />
                    </div>
                    <Button className="w-full mt-4" size="lg">Initialize Session</Button>
                </form>

                <div className="mt-6 text-center text-xs text-slate-500 font-mono">
                    <button onClick={() => navigate('/')} className="hover:text-cyber-neon transition-colors">Return to Home</button>
                </div>
            </Card>
        </div>
    );
};

// Protected Route Wrapper with RBAC
const ProtectedRoute: React.FC<{ children: React.ReactNode; allowedRoles?: UserRole[] }> = ({ children, allowedRoles }) => {
    const { isAuthenticated, user } = useStore();
    const location = useLocation();

    if (!isAuthenticated || !user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-cyber-bg text-center p-4">
                <div>
                    <h1 className="text-4xl font-bold text-red-500 mb-2">403 Forbidden</h1>
                    <p className="text-slate-400 mb-4">Your clearance level ({user.role}) is insufficient for this sector.</p>
                    <a href="#/dashboard" className="text-cyber-neon hover:underline">Return to Dashboard</a>
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
        <div className="min-h-screen bg-cyber-bg text-slate-900 dark:text-slate-200 font-sans selection:bg-cyber-accent/30 transition-colors duration-300">
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

    useEffect(() => {
        console.log('[Theme] Switching to:', theme);
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
            document.documentElement.classList.remove('light');
        } else {
            document.documentElement.classList.remove('dark');
            document.documentElement.classList.add('light');
        }
        console.log('[Theme] HTML classes:', document.documentElement.className);
    }, [theme]);

    return (
        <QueryClientProvider client={queryClient}>
            <Router>
                <div className="min-h-screen">
                    <Suspense fallback={
                        <div className="min-h-screen flex items-center justify-center bg-cyber-bg">
                            <div className="w-full max-w-7xl p-6">
                                <PageSkeleton />
                            </div>
                        </div>
                    }>
                        <ErrorBoundary>
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
                                <Route path="/print/label/:awb" element={<ProtectedRoute><PrintLabel /></ProtectedRoute>} />

                                {/* Catch all */}
                                <Route path="*" element={<Navigate to="/" replace />} />
                            </Routes>
                        </ErrorBoundary>
                    </Suspense>
                    <Toaster position="top-right" richColors />
                </div>
            </Router>
        </QueryClientProvider>
    );
};

export default App;
