from dotenv import load_dotenv
from src.grpc import serve

load_dotenv()

if __name__ == "__main__":
    serve(port=50051)
