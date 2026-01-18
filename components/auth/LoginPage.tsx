import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion } from '@/lib/motion';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Box, ArrowRight, Lock, Mail, AlertCircle, Loader2 } from 'lucide-react';
import { useStore } from '@/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

// Validation schema
const loginSchema = z.object({
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    rememberMe: z.boolean().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

// Demo credentials
const DEMO_CREDENTIALS = {
    email: 'admin@tac.com',
    password: 'admin123',
};

export const LoginPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const login = useStore((s) => s.login);

    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [loginError, setLoginError] = useState<string | null>(null);

    // Get redirect destination
    const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/dashboard';

    const form = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: DEMO_CREDENTIALS.email,
            password: DEMO_CREDENTIALS.password,
            rememberMe: true,
        },
    });

    const handleSubmit = async (data: LoginFormData) => {
        setIsLoading(true);
        setLoginError(null);

        // Simulate authentication delay
        await new Promise((resolve) => setTimeout(resolve, 800));

        // Mock authentication check
        if (data.email === DEMO_CREDENTIALS.email && data.password === DEMO_CREDENTIALS.password) {
            // Create mock user session
            login({
                id: 'admin-001',
                name: 'Tapan Admin',
                email: data.email,
                role: 'ADMIN',
                assignedHub: 'IMPHAL',
                active: true,
                lastLogin: new Date().toISOString(),
            });

            // Redirect to intended destination
            navigate(from, { replace: true });
        } else {
            setLoginError('Invalid email or password. Please try again.');
            setIsLoading(false);
        }
    };

    const fadeUpVariant = {
        hidden: { opacity: 0, y: 20 },
        visible: (i: number) => ({
            opacity: 1,
            y: 0,
            transition: {
                delay: i * 0.1,
                duration: 0.5,
                ease: [0.215, 0.61, 0.355, 1.0],
            },
        }),
    };

    return (
        <div className="min-h-screen flex bg-background">
            {/* Left Panel - Branding */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
                {/* Background */}
                <div className="absolute inset-0">
                    <img
                        src="/tac-hero-bg.jpeg"
                        alt="TAC Cargo"
                        className="absolute inset-0 w-full h-full object-cover opacity-40 grayscale"
                    />
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/80 via-primary/60 to-background/90" />
                </div>

                {/* Content */}
                <div className="relative z-10 flex flex-col justify-between p-12 w-full">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-3 group">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 backdrop-blur-md border border-white/20">
                            <Box className="h-7 w-7 text-white" />
                        </div>
                        <span className="text-2xl font-bold text-white tracking-tight">
                            Tapan Associate Cargo
                        </span>
                    </Link>

                    {/* Hero Text */}
                    <div className="space-y-6 max-w-lg">
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-4xl md:text-5xl font-bold text-white leading-tight"
                        >
                            Your Trusted
                            <br />
                            Logistics Partner
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="text-lg text-white/80"
                        >
                            Connecting Imphal and New Delhi with reliable air cargo, surface transport, and professional logistics services since 2010.
                        </motion.p>
                    </div>

                    {/* Stats */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="flex gap-8"
                    >
                        {[
                            { label: 'Active Shipments', value: '2,500+' },
                            { label: 'Years of Service', value: '15+' },
                            { label: 'Satisfied Clients', value: '10K+' },
                        ].map((stat) => (
                            <div key={stat.label} className="text-white">
                                <div className="text-3xl font-bold">{stat.value}</div>
                                <div className="text-sm text-white/70">{stat.label}</div>
                            </div>
                        ))}
                    </motion.div>
                </div>
            </div>

            {/* Right Panel - Login Form */}
            <div className="flex-1 flex items-center justify-center p-8">
                <div className="w-full max-w-md">
                    {/* Mobile Logo */}
                    <motion.div
                        custom={0}
                        initial="hidden"
                        animate="visible"
                        variants={fadeUpVariant}
                        className="flex lg:hidden items-center gap-3 justify-center mb-8"
                    >
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                            <Box className="h-6 w-6 text-primary" />
                        </div>
                        <span className="text-xl font-bold text-foreground">TAC Portal</span>
                    </motion.div>

                    {/* Form Header */}
                    <motion.div
                        custom={1}
                        initial="hidden"
                        animate="visible"
                        variants={fadeUpVariant}
                        className="text-center mb-8"
                    >
                        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                            Welcome Back
                        </h2>
                        <p className="text-muted-foreground">
                            Sign in to access your dashboard
                        </p>
                    </motion.div>

                    {/* Login Form */}
                    <motion.form
                        custom={2}
                        initial="hidden"
                        animate="visible"
                        variants={fadeUpVariant}
                        onSubmit={form.handleSubmit(handleSubmit)}
                        className="space-y-6"
                    >
                        {/* Error Alert */}
                        {loginError && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="flex items-center gap-3 p-4 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive"
                            >
                                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                                <span className="text-sm">{loginError}</span>
                            </motion.div>
                        )}

                        {/* Email Field */}
                        <div className="space-y-2">
                            <Label htmlFor="email">Email Address</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="admin@tac.com"
                                    className="pl-10 h-12"
                                    {...form.register('email')}
                                />
                            </div>
                            {form.formState.errors.email && (
                                <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
                            )}
                        </div>

                        {/* Password Field */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="password">Password</Label>
                                <Link to="/forgot-password" className="text-sm text-primary hover:underline">
                                    Forgot password?
                                </Link>
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    className="pl-10 pr-10 h-12"
                                    {...form.register('password')}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-4 w-4" />
                                    ) : (
                                        <Eye className="h-4 w-4" />
                                    )}
                                </button>
                            </div>
                            {form.formState.errors.password && (
                                <p className="text-sm text-destructive">{form.formState.errors.password.message}</p>
                            )}
                        </div>

                        {/* Remember Me */}
                        <div className="flex items-center space-x-2">
                            <Checkbox id="rememberMe" {...form.register('rememberMe')} />
                            <Label htmlFor="rememberMe" className="text-sm font-normal cursor-pointer">
                                Remember me for 30 days
                            </Label>
                        </div>

                        {/* Submit Button */}
                        <Button
                            type="submit"
                            className="w-full h-12 text-base font-medium"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Signing in...
                                </>
                            ) : (
                                <>
                                    Sign In
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </>
                            )}
                        </Button>
                    </motion.form>

                    {/* Demo Credentials Note */}
                    <motion.div
                        custom={3}
                        initial="hidden"
                        animate="visible"
                        variants={fadeUpVariant}
                        className="mt-6 p-4 rounded-lg bg-muted/50 border border-border"
                    >
                        <p className="text-xs text-muted-foreground text-center">
                            <strong>Demo Credentials:</strong> admin@tac.com / admin123
                        </p>
                    </motion.div>

                    {/* SSO Placeholder */}
                    <motion.div
                        custom={4}
                        initial="hidden"
                        animate="visible"
                        variants={fadeUpVariant}
                        className="mt-8"
                    >
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-background px-2 text-muted-foreground">
                                    Enterprise SSO
                                </span>
                            </div>
                        </div>

                        <Button
                            variant="outline"
                            className="w-full mt-4 h-12"
                            disabled
                        >
                            Sign in with Google Workspace
                        </Button>
                        <p className="text-xs text-muted-foreground text-center mt-2">
                            SSO integration coming soon
                        </p>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
