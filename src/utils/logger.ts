/* eslint-disable @typescript-eslint/no-explicit-any */

type LogLevel = "info" | "warn" | "error" | "debug";

const isDevelopment = process.env.NODE_ENV === "development";

/**
 * Logger utility for consistent logging across the application
 */
export class Logger {
    private static log(level: LogLevel, message: string, data?: any) {
        if (!isDevelopment && level === "debug") {
            return; // Don't log debug in production
        }

        const timestamp = new Date().toISOString();
        const prefix = `[${timestamp}] [${level.toUpperCase()}]`;

        switch (level) {
            case "info":
                console.log(prefix, message, data || "");
                break;
            case "warn":
                console.warn(prefix, message, data || "");
                break;
            case "error":
                console.error(prefix, message, data || "");
                break;
            case "debug":
                console.debug(prefix, message, data || "");
                break;
        }
    }

    static info(message: string, data?: any) {
        this.log("info", message, data);
    }

    static warn(message: string, data?: any) {
        this.log("warn", message, data);
    }

    static error(message: string, data?: any) {
        this.log("error", message, data);
    }

    static debug(message: string, data?: any) {
        this.log("debug", message, data);
    }
}
