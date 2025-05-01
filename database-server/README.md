# Database Server

A gRPC service that provides database functionality for user authentication and patient management.

## Prerequisites

- Node.js 16+ 
- npm or yarn

## Installation

### 1. Clone the repository

```bash
git clone <repository-url>
cd <repository-directory>/database-server
```

### 2. Install dependencies

```bash
npm install
# or
yarn install
```

### 3. Set up environment variables

Create a `.env` file in the `database-server` directory:

```
JWT_SECRET=your_jwt_secret_here
```

### 4. Initialize the database

```bash
# Reset the database if needed
npm run reset
# or
yarn reset

# Run migrations
npm run migrate
# or
yarn migrate
```

## Running the Server

```bash
# Start the server
npm run start
# or
yarn start
```

The server will start and listen on port 50052.

## Server Functionality

The database server provides the following functionality through a gRPC interface:

- User authentication (login and registration)
- Patient information management (save and retrieve)
- JWT-based authentication

## Project Structure

- **prisma/schema.prisma**: Database schema definition
- **src/main.ts**: Main server entry point
- **src/grpc.ts**: gRPC service implementation
- **src/logger.ts**: Logging configuration
- **src/proto/**: Protocol buffer definitions and generated code

## Database Schema

The server uses SQLite with the following models:

- **User**: Stores authentication information
- **Patient**: Stores patient medical information linked to a user 