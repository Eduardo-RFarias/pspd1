import { PrismaClient } from "./generated/prisma";
import { createModuleLogger } from "./logger";

const logger = createModuleLogger("prisma");

// Configure Prisma client with logging
const prisma = new PrismaClient({
  log: [
    {
      emit: "event",
      level: "query",
    },
    {
      emit: "event",
      level: "error",
    },
    {
      emit: "event",
      level: "info",
    },
    {
      emit: "event",
      level: "warn",
    },
  ],
});

// Set up logging events
prisma.$on("query", (e) => {
  logger.debug(`Query: ${e.query}`);
});

prisma.$on("info", (e) => {
  logger.info(`Prisma info: ${e.message}`);
});

prisma.$on("warn", (e) => {
  logger.warn(`Prisma warning: ${e.message}`);
});

prisma.$on("error", (e) => {
  logger.error(`Prisma error: ${e.message}`);
});

logger.info("Prisma client initialized");

export default prisma;
