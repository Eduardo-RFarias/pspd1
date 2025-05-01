import asyncio
import logging
import os

from dotenv import load_dotenv
from src.grpc import serve
from src.logging_config import configure_logging

# Load environment variables
load_dotenv()


async def main():
    # Configure logging
    log_level = os.environ.get("LOG_LEVEL", "INFO")
    configure_logging(log_level)

    logger = logging.getLogger(__name__)
    logger.info("Starting AI Server application")

    # Get port from environment or use default
    port = int(os.environ.get("GRPC_PORT", 50051))

    # Start async gRPC server
    await serve(port=port)


if __name__ == "__main__":
    # Run the async main function
    asyncio.run(main())
