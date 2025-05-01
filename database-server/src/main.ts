import {
  Server,
  ServerCredentials,
  ServiceDefinition,
  UntypedServiceImplementation,
} from "@grpc/grpc-js";
import dotenv from "dotenv";
import DatabaseServiceImpl from "./grpc";
import { createModuleLogger } from "./logger";
import { DatabaseServiceService } from "./proto/database-server_grpc_pb";

// Create module logger
const moduleLogger = createModuleLogger("main");

dotenv.config();

if (!process.env.JWT_SECRET) {
  moduleLogger.error("JWT_SECRET is not set");
  throw new Error("JWT_SECRET is not set");
}

moduleLogger.info("Initializing database server");

const server = new Server();

server.addService(
  DatabaseServiceService as unknown as ServiceDefinition<UntypedServiceImplementation>,
  new DatabaseServiceImpl()
);

server.bindAsync(
  `0.0.0.0:50052`,
  ServerCredentials.createInsecure(),
  (err, port) => {
    if (err) {
      moduleLogger.error(`Failed to start gRPC server: ${err.message}`, {
        error: err,
      });
    } else {
      moduleLogger.info(`gRPC server started on port ${port}`);
    }
  }
);

moduleLogger.debug("Registering shutdown handlers");

process.on("SIGINT", () => {
  moduleLogger.info("Received SIGINT signal, shutting down");
  server.tryShutdown(() => {
    moduleLogger.info("gRPC server shutdown completed");
    process.exit(0);
  });
});

process.on("SIGTERM", () => {
  moduleLogger.info("Received SIGTERM signal, shutting down");
  server.tryShutdown(() => {
    moduleLogger.info("gRPC server shutdown completed");
    process.exit(0);
  });
});
