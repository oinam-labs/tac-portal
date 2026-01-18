
type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogEntry {
    timestamp: string;
    level: LogLevel;
    message: string;
    meta?: any;
}

class Logger {
    private logs: LogEntry[] = [];

    private log(level: LogLevel, message: string, meta?: any) {
        const entry: LogEntry = {
            timestamp: new Date().toISOString(),
            level,
            message,
            meta
        };
        this.logs.push(entry);
        
        // In production, this would send to an observability service (Datadog, Sentry, etc.)
        const style = {
            info: 'color: #22d3ee',
            warn: 'color: #facc15',
            error: 'color: #ef4444',
            debug: 'color: #94a3b8'
        };
        
        console.log(`%c[${level.toUpperCase()}] ${message}`, style[level], meta || '');
    }

    info(message: string, meta?: any) { this.log('info', message, meta); }
    warn(message: string, meta?: any) { this.log('warn', message, meta); }
    error(message: string, meta?: any) { this.log('error', message, meta); }
    debug(message: string, meta?: any) { this.log('debug', message, meta); }

    getLogs() { return this.logs; }
}

export const logger = new Logger();
