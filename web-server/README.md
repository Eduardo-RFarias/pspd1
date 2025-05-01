# Installing Go, Protocol Buffers, and Generating gRPC Stubs on Linux x64

## 1. Install Go

Download and install Go:

```sh
# Download the latest Go release
wget https://go.dev/dl/go1.22.2.linux-amd64.tar.gz

# Extract it to /usr/local
sudo rm -rf /usr/local/go && sudo tar -C /usr/local -xzf go1.22.2.linux-amd64.tar.gz

# Add Go to your PATH
echo 'export PATH=$PATH:/usr/local/go/bin:$HOME/go/bin' >> ~/.profile
source ~/.profile
```

Verify installation:
```sh
go version
```

## 2. Install Protocol Buffer Compiler (protoc)

Choose one of these methods:

### Using apt (Debian/Ubuntu):
```sh
sudo apt update
sudo apt install -y protobuf-compiler
protoc --version  # Ensure version is 3+
```

### Using pre-compiled binary:
```sh
# Download the latest protoc binary
PB_REL="https://github.com/protocolbuffers/protobuf/releases"
curl -LO $PB_REL/download/v30.2/protoc-30.2-linux-x86_64.zip

# Extract to $HOME/.local
mkdir -p $HOME/.local
unzip protoc-30.2-linux-x86_64.zip -d $HOME/.local

# Add to PATH
echo 'export PATH="$PATH:$HOME/.local/bin"' >> ~/.profile
source ~/.profile

# Verify installation
protoc --version
```

## 3. Install Go plugins for protoc

```sh
# Install Go protocol compiler plugins
go install google.golang.org/protobuf/cmd/protoc-gen-go@latest
go install google.golang.org/grpc/cmd/protoc-gen-go-grpc@latest

# Update PATH
export PATH="$PATH:$(go env GOPATH)/bin"
```

## 4. Generating gRPC Stubs

1. Create a `.proto` file with your service definition, for example:

```protobuf
// example.proto
syntax = "proto3";

option go_package = "example/service";

package service;

// The service definition
service Greeter {
  // Sends a greeting
  rpc SayHello (HelloRequest) returns (HelloReply) {}
}

// The request message
message HelloRequest {
  string name = 1;
}

// The response message
message HelloReply {
  string message = 1;
}
```

2. Generate the gRPC code from your `.proto` file:

**Important**: Run these commands from the project root directory to generate Go files in web-server/proto directory.

```sh
# For a specific proto file (e.g., auth.proto)
protoc -I./proto \
    --go_out=./web-server/src/proto --go_opt=paths=source_relative \
    --go-grpc_out=./web-server/src/proto --go-grpc_opt=paths=source_relative \
    ./proto/auth.proto
```

To compile all proto files in the proto directory:

```sh
# For all proto files
protoc -I./proto \
    --go_out=./web-server/src/proto --go_opt=paths=source_relative \
    --go-grpc_out=./web-server/src/proto --go-grpc_opt=paths=source_relative \
    ./proto/*.proto
```

This will generate in the web-server/proto directory:
- `auth.pb.go`: Contains code for serializing/deserializing your message types
- `auth_grpc.pb.go`: Contains the gRPC client and server code

Now you can start building your gRPC client and server applications using the generated code!
