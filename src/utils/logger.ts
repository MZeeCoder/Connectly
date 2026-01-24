/* eslint-disable @typescript-eslint/no-explicit-any */

type LogLevel = "info" | "warn" | "error" | "debug" | "success";

const isDevelopment = process.env.NODE_ENV === "development";

// Emoji prefixes for different log levels
const LOG_PREFIXES = {
    info: "ℹ️",
    warn: "⚠️",
    error: "❌",
    debug: "🔍",
    success: "✅",
};

// Color codes for terminal (Node.js)
const COLORS = {
    reset: "\x1b[0m",
    info: "\x1b[36m",    // Cyan
    warn: "\x1b[33m",    // Yellow
    error: "\x1b[31m",   // Red
    debug: "\x1b[35m",   // Magenta
    success: "\x1b[32m", // Green
};

/**
 * Professional Logger utility for consistent logging across the application
 * 
 * Usage:
 * Logger.info("Action", "Message", { data });
 * Logger.error("Action", "Error occurred", { error });
 * Logger.success("Action", "Completed successfully");
 */
export class Logger {
    private static formatTimestamp(): string {
        return new Date().toISOString();
    }

    private static formatMessage(level: LogLevel, action: string, message: string): string {
        const timestamp = this.formatTimestamp();
        const prefix = LOG_PREFIXES[level];
        return `[${timestamp}] ${prefix} [${level.toUpperCase()}] [${action}] ${message}`;
    }

    private static log(level: LogLevel, action: string, message: string, data?: any) {
        if (!isDevelopment && level === "debug") {
            return; // Don't log debug in production
        }

        const formattedMessage = this.formatMessage(level, action, message);
        const color = COLORS[level];

        switch (level) {
            case "info":
                console.log(color + formattedMessage + COLORS.reset, data !== undefined ? data : "");
                break;
            case "warn":
                console.warn(color + formattedMessage + COLORS.reset, data !== undefined ? data : "");
                break;
            case "error":
                console.error(color + formattedMessage + COLORS.reset, data !== undefined ? data : "");
                break;
            case "debug":
                console.debug(color + formattedMessage + COLORS.reset, data !== undefined ? data : "");
                break;
            case "success":
                console.log(color + formattedMessage + COLORS.reset, data !== undefined ? data : "");
                break;
        }
    }

    /**
     * Log informational messages
     * @param action - The action/function name (e.g., "SigninAction", "VerifyAccountPage")
     * @param message - Descriptive message
     * @param data - Optional data object to log
     */
    static info(action: string, message: string, data?: any) {
        this.log("info", action, message, data);
    }

    /**
     * Log warning messages
     */
    static warn(action: string, message: string, data?: any) {
        this.log("warn", action, message, data);
    }

    /**
     * Log error messages
     */
    static error(action: string, message: string, data?: any) {
        this.log("error", action, message, data);
    }

    /**
     * Log debug messages (only in development)
     */
    static debug(action: string, message: string, data?: any) {
        this.log("debug", action, message, data);
    }

    /**
     * Log success messages
     */
    static success(action: string, message: string, data?: any) {
        this.log("success", action, message, data);
    }

    /**
     * Log the start of an operation
     */
    static start(action: string, message: string, data?: any) {
        this.log("info", action, `🚀 START: ${message}`, data);
    }

    /**
     * Log the end of an operation
     */
    static end(action: string, message: string, data?: any) {
        this.log("success", action, `🏁 END: ${message}`, data);
    }

    /**
     * Log API request
     */
    static request(action: string, method: string, path: string, data?: any) {
        this.log("info", action, `📡 ${method} ${path}`, data);
    }

    /**
     * Log API response
     */
    static response(action: string, status: number, message: string, data?: any) {
        const level = status >= 400 ? "error" : "success";
        this.log(level, action, `📨 [${status}] ${message}`, data);
    }

    /**
     * Log database operation
     */
    static db(action: string, operation: string, table: string, data?: any) {
        this.log("debug", action, `🗄️ ${operation} on ${table}`, data);
    }

    /**
     * Log authentication operations
     */
    static auth(action: string, message: string, data?: any) {
        this.log("info", action, `🔐 ${message}`, data);
    }

    /**
     * Log middleware operations
     */
    static middleware(action: string, message: string, data?: any) {
        this.log("info", action, `⚙️ ${message}`, data);
    }

    /**
     * Log performance metrics
     */
    static performance(action: string, operation: string, durationMs: number) {
        const duration = durationMs.toFixed(2);
        this.log("debug", action, `⏱️ ${operation} took ${duration}ms`, undefined);
    }

    /**
     * Log validation errors
     */
    static validation(action: string, field: string, message: string) {
        this.log("warn", action, `🚫 Validation failed: ${field} - ${message}`, undefined);
    }

    /**
     * Create a timed logger that measures operation duration
     */
    static timer(action: string, operation: string) {
        const startTime = Date.now();
        this.start(action, operation);

        return {
            end: (message?: string) => {
                const duration = Date.now() - startTime;
                this.performance(action, operation, duration);
                if (message) {
                    this.end(action, message);
                }
            }
        };
    }
}

// Export a simpler interface for client components
export const clientLogger = {
    info: (action: string, message: string, data?: any) => {
        console.log(`ℹ️ [${action}] ${message}`, data || "");
    },
    warn: (action: string, message: string, data?: any) => {
        console.warn(`⚠️ [${action}] ${message}`, data || "");
    },
    error: (action: string, message: string, data?: any) => {
        console.error(`❌ [${action}] ${message}`, data || "");
    },
    debug: (action: string, message: string, data?: any) => {
        if (process.env.NODE_ENV === "development") {
            console.debug(`🔍 [${action}] ${message}`, data || "");
        }
    },
    success: (action: string, message: string, data?: any) => {
        console.log(`✅ [${action}] ${message}`, data || "");
    },
};
