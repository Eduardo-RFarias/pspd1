package grpc

import (
	"context"
	"log"
	"time"

	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"
	pb "unb.br/web-server/src/proto"
)

// PatientInfo represents a patient's information
type PatientInfo struct {
	Name   string
	Age    int32
	Gender string
	Weight float32
	Height float32
}

// LoginInput represents the input for the Login method
type LoginInput struct {
	Username string
	Password string
}

// LoginOutput represents the output from the Login method
type LoginOutput struct {
	Token string
}

// RegisterInput represents the input for the Register method
type RegisterInput struct {
	Username string
	Password string
}

// RegisterOutput represents the output from the Register method
type RegisterOutput struct {
	Token string
}

// SavePatientInfoInput represents the input for the SavePatientInfo method
type SavePatientInfoInput struct {
	Token       string
	PatientInfo PatientInfo
}

// SavePatientInfoOutput represents the output from the SavePatientInfo method
type SavePatientInfoOutput struct {
	Success bool
}

// GetPatientInput represents the input for the GetPatient method
type GetPatientInput struct {
	Token string
}

// GetPatientOutput represents the output from the GetPatient method
type GetPatientOutput struct {
	PatientInfo PatientInfo
}

// DatabaseClient handles the communication with the Database gRPC server
type DatabaseClient struct {
	conn   *grpc.ClientConn
	client pb.DatabaseServiceClient
}

// NewDatabaseClient creates a new Database gRPC client
func NewDatabaseClient(serverAddr string) (*DatabaseClient, error) {
	// Set up a connection to the server
	conn, err := grpc.NewClient(serverAddr, grpc.WithTransportCredentials(insecure.NewCredentials()))
	if err != nil {
		return nil, err
	}

	// Create a new client
	client := pb.NewDatabaseServiceClient(conn)
	return &DatabaseClient{
		conn:   conn,
		client: client,
	}, nil
}

// Close closes the client connection
func (c *DatabaseClient) Close() error {
	return c.conn.Close()
}

// Login authenticates a user and returns a token
func (c *DatabaseClient) Login(ctx context.Context, input LoginInput) (*LoginOutput, error) {
	// Create a context with timeout if none was provided
	if ctx == nil {
		var cancel context.CancelFunc
		ctx, cancel = context.WithTimeout(context.Background(), time.Second*10)
		defer cancel()
	}

	// Convert the input to the protobuf format
	req := &pb.LoginRequest{
		Username: input.Username,
		Password: input.Password,
	}

	// Send the request to the server
	resp, err := c.client.Login(ctx, req)
	if err != nil {
		log.Printf("Failed to login: %v", err)
		return nil, err
	}

	// Convert the response to the output format
	return &LoginOutput{
		Token: resp.Token,
	}, nil
}

// Register creates a new user and returns a token
func (c *DatabaseClient) Register(ctx context.Context, input RegisterInput) (*RegisterOutput, error) {
	// Create a context with timeout if none was provided
	if ctx == nil {
		var cancel context.CancelFunc
		ctx, cancel = context.WithTimeout(context.Background(), time.Second*10)
		defer cancel()
	}

	// Convert the input to the protobuf format
	req := &pb.RegisterRequest{
		Username: input.Username,
		Password: input.Password,
	}

	// Send the request to the server
	resp, err := c.client.Register(ctx, req)
	if err != nil {
		log.Printf("Failed to register: %v", err)
		return nil, err
	}

	// Convert the response to the output format
	return &RegisterOutput{
		Token: resp.Token,
	}, nil
}

// SavePatientInfo saves a patient's information
func (c *DatabaseClient) SavePatientInfo(ctx context.Context, input SavePatientInfoInput) (*SavePatientInfoOutput, error) {
	// Create a context with timeout if none was provided
	if ctx == nil {
		var cancel context.CancelFunc
		ctx, cancel = context.WithTimeout(context.Background(), time.Second*10)
		defer cancel()
	}

	// Convert the input to the protobuf format
	req := &pb.SavePatientInfoRequest{
		Token: input.Token,
		PatientInfo: &pb.PatientInfo{
			Name:   input.PatientInfo.Name,
			Age:    input.PatientInfo.Age,
			Gender: input.PatientInfo.Gender,
			Weight: input.PatientInfo.Weight,
			Height: input.PatientInfo.Height,
		},
	}

	// Send the request to the server
	resp, err := c.client.SavePatientInfo(ctx, req)
	if err != nil {
		log.Printf("Failed to save patient info: %v", err)
		return nil, err
	}

	// Convert the response to the output format
	return &SavePatientInfoOutput{
		Success: resp.Success,
	}, nil
}

// GetPatient retrieves a patient's information
func (c *DatabaseClient) GetPatient(ctx context.Context, input GetPatientInput) (*GetPatientOutput, error) {
	// Create a context with timeout if none was provided
	if ctx == nil {
		var cancel context.CancelFunc
		ctx, cancel = context.WithTimeout(context.Background(), time.Second*10)
		defer cancel()
	}

	// Convert the input to the protobuf format
	req := &pb.GetPatientRequest{
		Token: input.Token,
	}

	// Send the request to the server
	resp, err := c.client.GetPatient(ctx, req)
	if err != nil {
		log.Printf("Failed to get patient: %v", err)
		return nil, err
	}

	// Convert the response to the output format
	return &GetPatientOutput{
		PatientInfo: PatientInfo{
			Name:   resp.PatientInfo.Name,
			Age:    resp.PatientInfo.Age,
			Gender: resp.PatientInfo.Gender,
			Weight: resp.PatientInfo.Weight,
			Height: resp.PatientInfo.Height,
		},
	}, nil
}
