import asyncio
import logging
import signal

import grpc

from src.doctor_chat import DoctorChat
from src.logging_config import configure_logging

from .proto import ai_server_pb2, ai_server_pb2_grpc


class AiServicer(ai_server_pb2_grpc.AiServiceServicer):
    def __init__(self):
        self.logger = logging.getLogger(__name__)
        self.logger.info("Initializing AI Servicer")
        self.doctor_chat = DoctorChat()

    async def Diagnose(self, request, context):
        try:
            client_ip = context.peer()
            self.logger.info(f"Received diagnosis request from {client_ip}")

            # Format history from the request
            history_obj = request.history
            history = f"""
                Nome: {history_obj.name}
                Idade: {history_obj.age}
                Sexo: {history_obj.gender}
                Peso: {history_obj.weight}kg
                Altura: {history_obj.height}cm
            """

            symptoms = request.symptoms
            self.logger.debug(f"Symptoms provided: {symptoms[:100]}...")

            # Get the diagnosis - now using await
            diagnosis = (await self.doctor_chat.diagnose(history, symptoms)).output_text
            self.logger.info(f"Diagnosis generated successfully for client {client_ip}")

            # Create and return the response
            return ai_server_pb2.DiagnoseResponse(diagnosis=diagnosis)

        except Exception as e:
            self.logger.error(f"Error in Diagnose method: {str(e)}", exc_info=True)
            context.set_code(grpc.StatusCode.INTERNAL)
            context.set_details(f"Internal server error occurred: {str(e)}")
            return ai_server_pb2.DiagnoseResponse(diagnosis="")


async def serve(port=50051):
    # Configure logging
    configure_logging()

    logger = logging.getLogger(__name__)

    # Create the async server
    server = grpc.aio.server()
    ai_server_pb2_grpc.add_AiServiceServicer_to_server(AiServicer(), server)
    server_address = f"[::]:{port}"
    server.add_insecure_port(server_address)

    # Start the server
    await server.start()
    logger.info(f"Async server started, listening on port {port}")

    # Set up signal handling for graceful shutdown
    async def shutdown():
        logger.info("Shutting down server...")
        # Let the server stop gracefully
        await server.stop(10)
        logger.info("Server stopped")

    # Add signal handlers
    for sig in (signal.SIGINT, signal.SIGTERM):
        loop = asyncio.get_running_loop()
        loop.add_signal_handler(sig, lambda: asyncio.create_task(shutdown()))

    # Wait until server is terminated
    await server.wait_for_termination()
