/**
 * Sentry Test Button Component
 * Used to verify Sentry error tracking is working correctly
 * Following official Sentry React SDK documentation patterns
 */

import React from 'react';
import * as Sentry from '@sentry/react';
import { Button } from '../ui/CyberComponents';
import { AlertTriangle, Bug, MessageSquare, Activity } from 'lucide-react';
import { captureException, captureMessage, startSpan } from '@/lib/sentry';

export const SentryTestButton: React.FC = () => {
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
                    duration: Date.now() - start
                });
            }
        );

        alert('Tracing span created! Check Sentry Performance dashboard.');
    };

    return (
        <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 p-4 bg-cyber-card border border-cyber-neon/30 rounded-lg shadow-xl max-w-xs">
            <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-5 h-5 text-yellow-500" />
                <span className="text-sm font-bold text-white">Sentry Test Controls</span>
            </div>

            <p className="text-xs text-muted-foreground mb-2">
                Test error tracking, logs, metrics & tracing
            </p>

            <Button
                onClick={handleTestError}
                variant="danger"
                size="sm"
                className="text-xs flex items-center gap-2"
            >
                <Bug className="w-3 h-3" />
                Throw Error
            </Button>

            <Button
                onClick={handleCaptureException}
                variant="secondary"
                size="sm"
                className="text-xs flex items-center gap-2"
            >
                <Bug className="w-3 h-3" />
                Capture Exception
            </Button>

            <Button
                onClick={handleCaptureMessage}
                variant="secondary"
                size="sm"
                className="text-xs flex items-center gap-2"
            >
                <MessageSquare className="w-3 h-3" />
                Capture Message
            </Button>

            <Button
                onClick={handleTestLogger}
                variant="secondary"
                size="sm"
                className="text-xs flex items-center gap-2"
            >
                <MessageSquare className="w-3 h-3" />
                Test Logger
            </Button>

            <Button
                onClick={handleTestTracing}
                variant="secondary"
                size="sm"
                className="text-xs flex items-center gap-2"
            >
                <Activity className="w-3 h-3" />
                Test Tracing
            </Button>
        </div>
    );
};
