import { createLogger, format, transports } from "winston";

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Determine log level based on environment
const level = () => {
  const env = process.env.NODE_ENV || "development";
  return env === "development" ? "debug" : "info";
};

// Define log format
const logFormat = format.combine(
  format.timestamp({ format: "YYYY-MM-DD HH:mm:ss.SSS" }),
  format.printf(
    (info) =>
      `${info.timestamp} - ${info.level.toUpperCase()} [${
        info.service || "server"
      }]: ${info.message}`
  )
);

// Create the logger
const logger = createLogger({
  level: level(),
  levels,
  format: logFormat,
  transports: [new transports.Console()],
  defaultMeta: { service: "database-server" },
});

// Create and export child loggers
export const createModuleLogger = (moduleName: string) => {
  return logger.child({ service: moduleName });
};

export default logger;
