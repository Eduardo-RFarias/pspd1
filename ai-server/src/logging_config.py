import logging
import os
import sys


def configure_logging(log_level=None):
    """
    Configure logging for the application.

    Args:
        log_level: The logging level. Defaults to INFO if not specified or from environment.
    """
    if log_level is None:
        log_level = os.environ.get("LOG_LEVEL", "INFO").upper()

    # Configure root logger
    root_logger = logging.getLogger()
    root_logger.setLevel(log_level)

    # Clear any existing handlers
    for handler in root_logger.handlers[:]:
        root_logger.removeHandler(handler)

    # Console handler
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(log_level)
    console_formatter = logging.Formatter(
        "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    )
    console_handler.setFormatter(console_formatter)

    # Add handler
    root_logger.addHandler(console_handler)

    # Configure OpenAI httpx logging
    httpx_logger = logging.getLogger("httpx")
    httpx_logger.setLevel(logging.INFO)
    httpcore_logger = logging.getLogger("httpcore")
    httpcore_logger.setLevel(logging.INFO)
    openai_logger = logging.getLogger("openai")
    openai_logger.setLevel(logging.INFO)

    # Suppress specific loggers if needed
    # logging.getLogger("some_noisy_module").setLevel(logging.WARNING)

    logging.info("Logging configured successfully")
