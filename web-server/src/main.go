package main

import (
	"fmt"
	"log"
	"os"
	"os/signal"
	"syscall"

	"github.com/joho/godotenv"
	"unb.br/web-server/src/http"
)

func main() {
	// Load .env file
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
	}

	// Get server addresses from environment variables with defaults
	aiServerAddr := getEnv("AI_SERVER_ADDR", "localhost:50051")
	dbServerAddr := getEnv("DB_SERVER_ADDR", "localhost:50052")
	httpServerAddr := getEnv("HTTP_SERVER_ADDR", ":8080")

	// Print startup message
	fmt.Println("=== Medical Diagnosis Web Server ===")
	fmt.Printf("AI Server: %s\n", aiServerAddr)
	fmt.Printf("Database Server: %s\n", dbServerAddr)
	fmt.Printf("HTTP Server: %s\n", httpServerAddr)

	// Create HTTP server
	server := http.NewServer(aiServerAddr, dbServerAddr)

	// Setup graceful shutdown
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)

	// Run the server in a goroutine
	go func() {
		if err := server.Run(httpServerAddr); err != nil {
			log.Fatalf("Failed to start server: %v", err)
		}
	}()

	// Wait for interrupt signal
	<-quit
	fmt.Println("Shutting down server...")

	// Close server connections
	server.Close()
	fmt.Println("Server shutdown complete")
}

// getEnv gets an environment variable or returns a default value
func getEnv(key, defaultValue string) string {
	value := os.Getenv(key)
	if value == "" {
		return defaultValue
	}
	return value
}
