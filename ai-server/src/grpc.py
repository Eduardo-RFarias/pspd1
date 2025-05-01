import logging
import signal
import sys
from concurrent import futures

import grpc

from src.doctor_chat import DoctorChat
from src.logging_config import configure_logging

from .proto import ai_server_pb2, ai_server_pb2_grpc


class AiServicer(ai_server_pb2_grpc.AiServiceServicer):
    def __init__(self):
        self.logger = logging.getLogger(__name__)
        self.logger.info("Initializing AI Servicer")
        self.doctor_chat = DoctorChat()

    def Diagnose(self, request, context):
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

            # Get the diagnosis
            diagnosis = self.doctor_chat.diagnose(history, symptoms).output_text
            self.logger.info(f"Diagnosis generated successfully for client {client_ip}")

            # Create and return the response
            return ai_server_pb2.DiagnoseResponse(diagnosis=diagnosis)

        except Exception as e:
            self.logger.error(f"Error in Diagnose method: {str(e)}", exc_info=True)
            context.set_code(grpc.StatusCode.INTERNAL)
            context.set_details(f"Internal server error occurred: {str(e)}")
            return ai_server_pb2.DiagnoseResponse(diagnosis="")


def serve(port=50051):
    # Configure logging
    configure_logging()

    logger = logging.getLogger(__name__)

    # Create the server
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
    ai_server_pb2_grpc.add_AiServiceServicer_to_server(AiServicer(), server)
    server.add_insecure_port(f"[::]:{port}")

    # Start the server
    server.start()
    logger.info(f"Server started, listening on port {port}")

    # Set up signal handlers for graceful shutdown
    def handle_shutdown(signum, frame):
        logger.info(f"Received shutdown signal: {signum}")
        logger.info("Gracefully stopping server...")

        # Stop the server gracefully
        # Give 10 seconds for requests to complete
        server.stop(10)
        logger.info("Server stopped")
        sys.exit(0)

    # Register signal handlers
    signal.signal(signal.SIGINT, handle_shutdown)  # Ctrl+C
    signal.signal(signal.SIGTERM, handle_shutdown)  # kill or systemd

    # Wait for termination
    server.wait_for_termination()
