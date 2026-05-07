/**
 * Simple Logger for Traceability
 */

export enum LogLevel {
    INFO = 'INFO',
    WARN = 'WARN',
    ERROR = 'ERROR',
    DEBUG = 'DEBUG'
}

class Logger {
    private format(level: LogLevel, message: string, context?: any) {
        const timestamp = new Date().toISOString();
        const ctxStr = context ? ` | Context: ${JSON.stringify(context)}` : '';
        return `[${timestamp}] [${level}] ${message}${ctxStr}`;
    }

    info(message: string, context?: any) {
        console.log(this.format(LogLevel.INFO, message, context));
    }

    warn(message: string, context?: any) {
        console.warn(this.format(LogLevel.WARN, message, context));
    }

    error(message: string, context?: any) {
        console.error(this.format(LogLevel.ERROR, message, context));
    }

    debug(message: string, context?: any) {
        console.debug(this.format(LogLevel.DEBUG, message, context));
    }
}

export const logger = new Logger();
