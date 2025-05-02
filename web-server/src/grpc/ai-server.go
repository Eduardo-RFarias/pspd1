package grpc

import (
	"context"
	"io"
	"log"
	"time"

	"github.com/gin-gonic/gin"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"
	pb "unb.br/web-server/src/proto"
)

// PatientInfo represents the patient information
type PatientInfoForPrompt struct {
	Name   string
	Age    int32
	Gender string
	Weight float32
	Height float32
}

// Message represents a chat message between user and assistant
type Message struct {
	Role    string
	Content string
}

// DiagnoseInput represents the input for the Diagnose method
type DiagnoseInput struct {
	PatientInfo PatientInfo
	Messages    []Message
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

// StreamDiagnose streams a diagnosis response to the Gin context
func (c *AiClient) StreamDiagnose(ctx context.Context, ginCtx *gin.Context, input DiagnoseInput) error {
	// Create a context with timeout if none was provided
	if ctx == nil {
		var cancel context.CancelFunc
		ctx, cancel = context.WithTimeout(context.Background(), time.Minute*5)
		defer cancel()
	}

	// Convert the patient info to protobuf format
	patientInfo := &pb.PatientInfoForPrompt{
		Name:   input.PatientInfo.Name,
		Age:    input.PatientInfo.Age,
		Gender: input.PatientInfo.Gender,
		Weight: input.PatientInfo.Weight,
		Height: input.PatientInfo.Height,
	}

	// Convert the messages to protobuf format
	pbMessages := make([]*pb.Message, len(input.Messages))
	for i, msg := range input.Messages {
		pbMessages[i] = &pb.Message{
			Role:    msg.Role,
			Content: msg.Content,
		}
	}

	// Create the request
	req := &pb.DiagnoseRequest{
		PatientInfo: patientInfo,
		Messages:    pbMessages,
	}

	// Configure gin to stream the response
	ginCtx.Header("Content-Type", "text/plain")
	ginCtx.Header("X-Content-Type-Options", "nosniff")
	ginCtx.Status(200)

	// Stream the response
	stream, err := c.client.Diagnose(ctx, req)
	if err != nil {
		log.Printf("Failed to start diagnosis stream: %v", err)
		return err
	}

	// Read from the stream and write to the response
	for {
		resp, err := stream.Recv()
		if err == io.EOF {
			// End of stream
			break
		}
		if err != nil {
			log.Printf("Error receiving from stream: %v", err)
			return err
		}

		// Write the content chunk to the response
		_, err = ginCtx.Writer.Write([]byte(resp.Content))
		if err != nil {
			log.Printf("Error writing to response: %v", err)
			return err
		}

		// Flush to ensure the client receives data immediately
		ginCtx.Writer.Flush()
	}

	return nil
}
