# AI Server

A gRPC service that provides medical diagnosis using OpenAI.

## Prerequisites

- Python 3.10-3.11
- pipx (recommended for Poetry installation)

## Installation

### 1. Install pipx

```bash
pip install --user pipx
pipx ensurepath
```

You may need to restart your terminal after running `pipx ensurepath`.

### 2. Install Poetry

```bash
pipx install poetry
```

Verify your installation:

```bash
poetry --version
```

### 3. Set up the project

```bash
# Clone the repository (if you haven't already)
git clone <repository-url>
cd <repository-directory>

# Install dependencies
cd ai-server
poetry install
```

### 4. Set up environment variables

Create a `.env` file in the `ai-server` directory with your OpenAI API key:

```
OPENAI_API_KEY=your_api_key_here
```

## Running the Server

```bash
# Activate the Poetry virtual environment
poetry shell

# Start the server
python main.py
```

The server will start and listen on port 50051.

## Compile Proto Files (Development)

If you need to modify the proto definitions, you can recompile them with:

```bash
python -m grpc_tools.protoc \
  -I../proto \
  --python_out=./src/proto \
  --grpc_python_out=./src/proto \
  ../proto/ai-server.proto
```

## Server Functionality

The AI server provides medical diagnosis through a gRPC interface. It accepts patient history and symptoms, then uses OpenAI to generate a diagnosis response.

## AsyncIO Implementation

The server now uses AsyncIO for improved performance and concurrency:

- Uses gRPC's AsyncIO API to handle requests without blocking
- Leverages OpenAI's AsyncIO client for non-blocking API calls
- Provides better resource utilization and scalability
- Can handle more concurrent connections without degrading performance

