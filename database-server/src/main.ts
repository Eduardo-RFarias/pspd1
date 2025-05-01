import {
  Server,
  ServerCredentials,
  ServiceDefinition,
  UntypedServiceImplementation,
} from "@grpc/grpc-js";
import dotenv from "dotenv";
import DatabaseServiceImpl from "./grpc";
import { DatabaseServiceService } from "./proto/database-server_grpc_pb";

dotenv.config();

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET is not set");
}

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
      console.error("Failed to start gRPC server:", err);
    } else {
      console.log(`gRPC server started on port ${port}`);
    }
  }
);

process.on("SIGINT", () => {
  server.tryShutdown(() => {
    console.log("gRPC server shutdown");
  });
});

process.on("SIGTERM", () => {
  server.tryShutdown(() => {
    console.log("gRPC server shutdown");
  });
});
