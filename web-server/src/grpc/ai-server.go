package grpc

import (
	"context"
	"log"
	"time"

	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"
	pb "unb.br/web-server/src/proto"
)

// PatientHistory represents the medical history of a patient
type PatientHistory struct {
	Name   string
	Age    int32
	Gender string
	Weight float32
	Height float32
}

// DiagnoseInput represents the input for the Diagnose method
type DiagnoseInput struct {
	History  PatientHistory
	Symptoms string
}

// DiagnoseOutput represents the output from the Diagnose method
type DiagnoseOutput struct {
	Diagnosis string
}

// AiClient handles the communication with the AI gRPC server
type AiClient struct {
	conn   *grpc.ClientConn
	client pb.AiServiceClient
}

// NewAiClient creates a new AI gRPC client
func NewAiClient(serverAddr string) (*AiClient, error) {
	// Set up a connection to the server
	conn, err := grpc.NewClient(serverAddr, grpc.WithTransportCredentials(insecure.NewCredentials()))
	if err != nil {
		return nil, err
	}

	// Create a new client
	client := pb.NewAiServiceClient(conn)
	return &AiClient{
		conn:   conn,
		client: client,
	}, nil
}

// Close closes the client connection
func (c *AiClient) Close() error {
	return c.conn.Close()
}

// Diagnose sends a diagnosis request to the AI server
func (c *AiClient) Diagnose(ctx context.Context, input DiagnoseInput) (*DiagnoseOutput, error) {
	// Create a context with timeout if none was provided
	if ctx == nil {
		var cancel context.CancelFunc
		ctx, cancel = context.WithTimeout(context.Background(), time.Second*10)
		defer cancel()
	}

	// Convert the input to the protobuf format
	req := &pb.DiagnoseRequest{
		History: &pb.History{
			Name:   input.History.Name,
			Age:    input.History.Age,
			Gender: input.History.Gender,
			Weight: input.History.Weight,
			Height: input.History.Height,
		},
		Symptoms: input.Symptoms,
	}

	// Send the request to the server
	resp, err := c.client.Diagnose(ctx, req)
	if err != nil {
		log.Printf("Failed to diagnose: %v", err)
		return nil, err
	}

	// Convert the response to the output format
	return &DiagnoseOutput{
		Diagnosis: resp.Diagnosis,
	}, nil
}
