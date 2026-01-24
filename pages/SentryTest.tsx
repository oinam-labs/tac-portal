/**
 * Sentry Test Page
 * Dedicated dev page for testing Sentry error tracking, logs, metrics & tracing
 * Access via /dev/sentry route (hidden from regular users)
 */

import React from 'react';
import * as Sentry from '@sentry/react';
import { Button, Card } from '../components/ui/CyberComponents';
import { AlertTriangle, Bug, MessageSquare, Activity, ArrowLeft, Shield } from 'lucide-react';
import { captureException, captureMessage, startSpan } from '../lib/sentry';
import { useNavigate } from 'react-router-dom';

export const SentryTest: React.FC = () => {
    const navigate = useNavigate();

    /**
     * Test error boundary - throws an error that Sentry will capture
     * Official pattern from Sentry docs
     */
    const handleTestError = () => {
        // Send a log before throwing the error (using Sentry.logger directly)
        Sentry.logger.info('User triggered test error', {
            action: 'test_error_button_click',
            timestamp: new Date().toISOString(),
        });
        throw new Error('This is your first error!');
    };

    /**
     * Test manual exception capture with try-catch
     */
    const handleCaptureException = () => {
        try {
            // Simulate an error in a try-catch block
            const error = new Error('Test exception captured manually');
            captureException(error);
            Sentry.logger.info('Manual exception captured', { method: 'captureException' });
            alert('Exception captured! Check Sentry dashboard.');
        } catch (err) {
            console.error(err);
        }
    };

    /**
     * Test message capture
     */
    const handleCaptureMessage = () => {
        captureMessage('Test message from TAC Portal', 'info');
        Sentry.logger.info('Message captured via captureMessage');
        alert('Message captured! Check Sentry dashboard.');
    };

    /**
     * Test all logger levels with structured logging
     * Using logger.fmt for template literal variables
     */
    const handleTestLogger = () => {
        const userId = 'test-user-123';
        const orderId = 'order_456';

        // Using Sentry.logger directly as per official docs
        Sentry.logger.trace('Starting database connection', { database: 'shipments' });
        Sentry.logger.debug(Sentry.logger.fmt`Cache miss for user: ${userId}`);
        Sentry.logger.info('Updated profile', { profileId: 345, action: 'test' });
        Sentry.logger.warn('Rate limit reached for endpoint', {
            endpoint: '/api/shipments/',
            isEnterprise: false,
        });
        Sentry.logger.error('Failed to process payment', {
            orderId,
            amount: 99.99,
        });
        Sentry.logger.fatal('Database connection pool exhausted', {
            database: 'users',
            activeConnections: 100,
        });

        alert('All log levels sent! Check Sentry Logs dashboard.');
    };

    /**
     * Test custom span for performance tracing
     * Following official docs pattern
     */
    const handleTestTracing = () => {
        startSpan(
            {
                op: 'ui.click',
                name: 'Test Button Click',
            },
            (span) => {
                // Add attributes to the span
                span.setAttribute('config', 'test-config');
                span.setAttribute('metric', 'test-metric');

                // Simulate some work
                const start = Date.now();
                while (Date.now() - start < 100) {
                    // Busy wait to simulate work
                }

                Sentry.logger.info('Span completed', {
                    spanName: 'Test Button Click',
                    duration: Date.now() - start,
                });
            }
        );

        alert('Tracing span created! Check Sentry Performance dashboard.');
    };

    return (
        <div className="min-h-screen bg-cyber-bg flex items-center justify-center p-4 relative overflow-hidden">
            {/* Back Arrow */}
            <button
                onClick={() => navigate('/dashboard')}
                className="absolute top-6 left-6 z-50 p-2 text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 group"
            >
                <div className="p-2 rounded-full bg-white/10 border border-white/10 group-hover:border-cyber-neon/50 transition-all">
                    <ArrowLeft className="w-5 h-5" />
                </div>
                <span className="font-mono text-sm font-bold tracking-wide uppercase opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0">
                    Dashboard
                </span>
            </button>

            {/* Background effects */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-yellow-500/10 rounded-full blur-[100px] animate-pulse"></div>
            <div
                className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-red-500/10 rounded-full blur-[100px] animate-pulse"
                style={{ animationDelay: '1s' }}
            ></div>

            <Card className="w-full max-w-md relative z-10 border-yellow-500/30 shadow-[0_0_50px_rgba(234,179,8,0.1)] p-6">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 rounded-xl bg-yellow-500/20 border border-yellow-500/30">
                        <Shield className="w-6 h-6 text-yellow-500" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-foreground tracking-tight">Sentry Test Panel</h1>
                        <p className="text-xs text-muted-foreground">Developer tools for error tracking verification</p>
                    </div>
                </div>

                <div className="flex items-center gap-2 mb-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                    <AlertTriangle className="w-4 h-4 text-yellow-500" />
                    <span className="text-xs text-yellow-500/90">
                        These actions will send data to Sentry. Use for testing only.
                    </span>
                </div>

                <div className="space-y-3">
                    <div className="border-b border-border/50 pb-2 mb-3">
                        <h2 className="text-xs font-mono text-muted-foreground uppercase tracking-wide">Error Capture</h2>
                    </div>

                    <Button
                        onClick={handleTestError}
                        variant="danger"
                        size="sm"
                        className="w-full text-sm flex items-center justify-center gap-2"
                    >
                        <Bug className="w-4 h-4" />
                        Throw Uncaught Error
                    </Button>

                    <Button
                        onClick={handleCaptureException}
                        variant="secondary"
                        size="sm"
                        className="w-full text-sm flex items-center justify-center gap-2"
                    >
                        <Bug className="w-4 h-4" />
                        Capture Exception (Try-Catch)
                    </Button>

                    <div className="border-b border-border/50 pb-2 mb-3 mt-6">
                        <h2 className="text-xs font-mono text-muted-foreground uppercase tracking-wide">Logging & Messages</h2>
                    </div>

                    <Button
                        onClick={handleCaptureMessage}
                        variant="secondary"
                        size="sm"
                        className="w-full text-sm flex items-center justify-center gap-2"
                    >
                        <MessageSquare className="w-4 h-4" />
                        Capture Message
                    </Button>

                    <Button
                        onClick={handleTestLogger}
                        variant="secondary"
                        size="sm"
                        className="w-full text-sm flex items-center justify-center gap-2"
                    >
                        <MessageSquare className="w-4 h-4" />
                        Test All Log Levels
                    </Button>

                    <div className="border-b border-border/50 pb-2 mb-3 mt-6">
                        <h2 className="text-xs font-mono text-muted-foreground uppercase tracking-wide">Performance</h2>
                    </div>

                    <Button
                        onClick={handleTestTracing}
                        variant="secondary"
                        size="sm"
                        className="w-full text-sm flex items-center justify-center gap-2"
                    >
                        <Activity className="w-4 h-4" />
                        Create Performance Span
                    </Button>

                    <div className="border-b border-border/50 pb-2 mb-3 mt-6">
                        <h2 className="text-xs font-mono text-muted-foreground uppercase tracking-wide">User Feedback</h2>
                    </div>

                    <Button
                        onClick={async () => {
                            // Get the feedback integration and create a form
                            const feedback = Sentry.getFeedback();
                            if (feedback) {
                                const form = await feedback.createForm();
                                form.appendToDom();
                                form.open();
                            } else {
                                alert('Feedback integration not found. Make sure Sentry is initialized with feedbackIntegration.');
                            }
                        }}
                        variant="primary"
                        size="sm"
                        className="w-full text-sm flex items-center justify-center gap-2"
                    >
                        <Bug className="w-4 h-4" />
                        Report a Bug
                    </Button>
                </div>

                <div className="mt-6 pt-4 border-t border-border text-center text-xs text-muted-foreground">
                    <p className="font-mono">Route: <code className="text-primary">/dev/sentry</code></p>
                </div>
            </Card>
        </div>
    );
};
