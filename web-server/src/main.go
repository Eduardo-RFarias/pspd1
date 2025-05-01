package main

import (
	"fmt"
	"log"
	"os"
	"os/signal"
	"syscall"

	"unb.br/web-server/src/http"
)

func main() {
	// Define server addresses
	aiServerAddr := "localhost:50051"
	dbServerAddr := "localhost:50052"
	httpServerAddr := ":8080"

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
