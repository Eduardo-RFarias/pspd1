from concurrent import futures

import grpc

from src.doctor_chat import DoctorChat

from .proto import ai_server_pb2, ai_server_pb2_grpc


class AiServicer(ai_server_pb2_grpc.AiServiceServicer):
    def __init__(self):
        self.doctor_chat = DoctorChat()

    def Diagnose(self, request, context):
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

        # Get the diagnosis
        diagnosis = self.doctor_chat.diagnose(history, symptoms).output_text

        # Create and return the response
        return ai_server_pb2.DiagnoseResponse(diagnosis=diagnosis)


def serve(port=50051):
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
    ai_server_pb2_grpc.add_AiServiceServicer_to_server(AiServicer(), server)
    server.add_insecure_port(f"[::]:{port}")
    server.start()
    print(f"Server started, listening on port {port}")
    server.wait_for_termination()
