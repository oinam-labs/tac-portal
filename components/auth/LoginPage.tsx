import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from '@/lib/motion';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Eye, EyeOff, Box, ArrowRight, Lock, Mail, AlertCircle, Loader2,
  Shield, Fingerprint, Package, Clock, ShieldCheck
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CountUp } from '@/components/motion/CountUp';

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

const STATS = [
  { icon: Package, label: 'Shipments', value: 50, suffix: 'k+' },
  { icon: ShieldCheck, label: 'Safe Rate', value: 99.9, suffix: '%', decimals: 1 },
  { icon: Clock, label: 'Avg Transit', value: 48, suffix: 'h' },
];

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, isLoading: authLoading, error: authError, clearError } = useAuthStore();

  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Sync auth error to local state
  React.useEffect(() => {
    if (authError) {
      setLoginError(authError);
    }
  }, [authError]);

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
    setIsSubmitting(true);
    setLoginError(null);
    clearError();

    try {
      const result = await signIn(data.email, data.password);

      if (result.success) {
        navigate(from, { replace: true });
      } else {
        const errorMessage = result.error === 'No staff account found'
          ? 'Contact your administrator for account access.'
          : result.error === 'Account deactivated'
            ? 'Your account has been deactivated. Contact your administrator.'
            : result.error || 'Invalid email or password. Please try again.';
        setLoginError(errorMessage);
      }
    } catch {
      setLoginError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-background font-sans selection:bg-primary/30">
      {/* Left Panel - Tactical Branding */}
      <div className="hidden lg:flex lg:w-[45%] relative overflow-hidden">
        {/* Hero Background Image */}
        <img
          src="/tac-hero-bg.jpeg"
          alt="TAC Cargo logistics"
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]" />
        {/* Gradient vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30" />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-10 w-full">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
          >
            <Link to="/" className="flex items-center gap-3 group w-fit">
              <div className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 group-hover:bg-primary/20 transition-colors duration-300">
                <Box className="h-6 w-6 text-primary fill-primary/20 transition-transform duration-300 group-hover:scale-110" />
              </div>
              <div className="flex flex-col">
                <span className="text-foreground text-lg font-sans font-bold tracking-tight leading-none group-hover:text-primary transition-colors duration-300">
                  TAC Cargo
                </span>
                <span className="text-[10px] text-muted-foreground font-mono tracking-widest uppercase">
                  Global Logistics
                </span>
              </div>
            </Link>
          </motion.div>

          {/* Hero Content */}
          <div className="space-y-8 max-w-md">
            {/* Tactical Badge */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 backdrop-blur-sm px-4 py-1.5 text-xs font-mono text-primary"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              SYS_ONLINE // V4.0
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.7 }}
              className="text-4xl xl:text-5xl font-bold text-foreground leading-tight tracking-tight"
            >
              Your Trusted
              <br />
              <span className="text-primary">Logistics Partner</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-muted-foreground text-base leading-relaxed"
            >
              Connecting Imphal and New Delhi with reliable air cargo, surface transport, and
              professional logistics solutions since 2010.
            </motion.p>
          </div>

          {/* Stats Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="grid grid-cols-3 gap-4"
          >
            {STATS.map((stat, i) => (
              <div
                key={stat.label}
                className="group relative bg-card/40 backdrop-blur-xl border border-border/50 rounded-2xl p-5 text-center hover:border-primary/30 transition-all duration-300 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative z-10">
                  <stat.icon className="w-5 h-5 text-primary mx-auto mb-3 opacity-60" />
                  <div className="text-2xl font-bold text-foreground font-mono mb-1">
                    <CountUp to={stat.value} suffix={stat.suffix} duration={2} decimals={stat.decimals} />
                  </div>
                  <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-widest">
                    {stat.label}
                  </p>
                </div>
                {/* Corner Tag */}
                <div className="absolute top-2 right-2 font-mono text-[8px] text-muted-foreground/40 opacity-0 group-hover:opacity-100 transition-opacity">
                  OBJ_{String(i + 1).padStart(2, '0')}
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8 relative overflow-hidden">
        {/* Subtle Grid Background */}
        <div className="absolute inset-0 z-0 pointer-events-none bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:48px_48px] opacity-[0.06]" />

        <div className="w-full max-w-md relative z-10">
          {/* Mobile Logo */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex lg:hidden items-center gap-3 justify-center mb-8"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 border border-primary/20">
              <Box className="h-6 w-6 text-primary" />
            </div>
            <span className="text-xl font-bold text-foreground">TAC Cargo</span>
          </motion.div>

          {/* Glassmorphic Form Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="bg-card/50 backdrop-blur-xl border border-border/60 rounded-2xl p-8 shadow-xl shadow-black/5"
          >
            {/* Tactical Status Bar */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-border/50">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-primary opacity-60" />
                <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">
                  Secure Auth
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-status-success animate-pulse shadow-[0_0_6px_var(--color-status-success)]" />
                <span className="font-mono text-[10px] text-status-success uppercase tracking-wider">
                  Channel Open
                </span>
              </div>
            </div>

            {/* Form Header */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-foreground mb-1">Welcome Back</h2>
              <p className="text-sm text-muted-foreground">Sign in to access your command center</p>
            </div>

            {/* Login Form */}
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-5"
            >
              {/* Error Alert */}
              <AnimatePresence>
                {loginError && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <Alert variant="destructive" data-testid="login-error-message">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{loginError}</AlertDescription>
                    </Alert>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
                  <Input
                    id="email"
                    type="email"
                    data-testid="login-email-input"
                    placeholder="admin@tac.com"
                    className="pl-10 h-12 bg-background/80 border-border/60 focus:border-primary/50 focus:ring-primary/20 transition-all"
                    autoComplete="email"
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
                  <Label htmlFor="password" className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                    Password
                  </Label>
                  <Link to="/forgot-password" className="text-xs text-primary hover:underline font-medium">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    data-testid="login-password-input"
                    placeholder="••••••••"
                    className="pl-10 pr-10 h-12 bg-background/80 border-border/60 focus:border-primary/50 focus:ring-primary/20 transition-all"
                    autoComplete="current-password"
                    {...form.register('password')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-foreground transition-colors"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {form.formState.errors.password && (
                  <p className="text-sm text-destructive">{form.formState.errors.password.message}</p>
                )}
              </div>

              {/* Remember Me */}
              <div className="flex items-center space-x-2">
                <Checkbox id="rememberMe" {...form.register('rememberMe')} />
                <Label htmlFor="rememberMe" className="text-sm font-normal cursor-pointer text-muted-foreground">
                  Remember me for 30 days
                </Label>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                data-testid="login-submit-button"
                className="relative w-full h-12 text-base font-semibold rounded-xl overflow-hidden shadow-lg shadow-primary/20 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-primary/30 active:scale-[0.98] group"
                disabled={isSubmitting || authLoading}
              >
                <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                {isSubmitting || authLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Authenticating...
                  </>
                ) : (
                  <>
                    <Fingerprint className="mr-2 h-4 w-4" />
                    Authenticate
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </Button>
            </form>

            {/* Demo Credentials */}
            <div className="mt-5 p-3 rounded-xl bg-muted/30 border border-border/40">
              <p className="text-[11px] text-muted-foreground text-center font-mono">
                <span className="text-primary/60">DEMO:</span> admin@tac.com / admin123
              </p>
            </div>
          </motion.div>

          {/* SSO Section */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-6"
          >
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border/40" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-background px-3 text-muted-foreground font-mono uppercase tracking-widest text-[10px]">
                  Enterprise SSO
                </span>
              </div>
            </div>

            <Button
              variant="outline"
              className="w-full mt-4 h-11 rounded-xl border-border/50 text-muted-foreground hover:text-foreground hover:border-border transition-all"
              disabled
            >
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="none">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Sign in with Google Workspace
            </Button>
            <p className="text-[10px] text-muted-foreground/60 text-center mt-2 font-mono uppercase tracking-wider">
              // Integration pending
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
