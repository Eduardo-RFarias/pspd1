package http

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"unb.br/web-server/src/grpc"
)

// Server represents the HTTP server
type Server struct {
	router       *gin.Engine
	aiClient     *grpc.AiClient
	dbClient     *grpc.DatabaseClient
	aiServerAddr string
	dbServerAddr string
	accessLogger *log.Logger
	errorLogger  *log.Logger
}

// ChatRequest represents a chat request
type ChatRequest struct {
	Token    string    `json:"token" binding:"required"`
	Messages []Message `json:"messages" binding:"required"`
}

// Message represents a chat message
type Message struct {
	Role    string `json:"role" binding:"required"`
	Content string `json:"content" binding:"required"`
}

// ChatResponse represents a chat response
type ChatResponse struct {
	Content string `json:"content"`
}

// LoginRequest represents a login request
type LoginRequest struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
}

// RegisterRequest represents a register request
type RegisterRequest struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
}

// AuthResponse represents an authentication response
type AuthResponse struct {
	Token string `json:"token"`
}

// PatientInfo represents a patient info
type PatientInfo struct {
	Name   string  `json:"name"`
	Age    int32   `json:"age"`
	Gender string  `json:"gender"`
	Weight float32 `json:"weight"`
	Height float32 `json:"height"`
}

// PatientInfoRequest represents a patient info save request
type PatientInfoRequest struct {
	Token   string      `json:"token" binding:"required"`
	Patient PatientInfo `json:"patient" binding:"required"`
}

// PatientInfoResponse represents a patient info response
type PatientInfoResponse struct {
	Success bool `json:"success"`
}

// GetPatientResponse represents a get patient response
type GetPatientResponse struct {
	Patient PatientInfo `json:"patient"`
}

// NewServer creates a new HTTP server
func NewServer(aiServerAddr, dbServerAddr string) *Server {
	// Create loggers
	accessLogger := log.New(os.Stdout, "[HTTP-ACCESS] ", log.LstdFlags)
	errorLogger := log.New(os.Stderr, "[HTTP-ERROR] ", log.LstdFlags)

	// Create router
	router := gin.New()
	router.Use(gin.Recovery())

	// Create server
	s := &Server{
		router:       router,
		aiServerAddr: aiServerAddr,
		dbServerAddr: dbServerAddr,
		accessLogger: accessLogger,
		errorLogger:  errorLogger,
	}

	// Setup routes
	s.setupRoutes()

	return s
}

// setupRoutes sets up the routes for the server
func (s *Server) setupRoutes() {
	// Add logging middleware
	s.router.Use(s.loggerMiddleware())

	// Add CORS middleware
	s.router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"*"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Content-Length", "Accept-Encoding", "X-CSRF-Token", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	// API routes
	api := s.router.Group("/api")
	{
		api.POST("/login", s.handleLogin)
		api.POST("/register", s.handleRegister)
		api.POST("/chat", s.handleChat)
		api.GET("/patient", s.handleGetPatient)
		api.POST("/patient", s.handleSavePatient)
	}
}

// initClients initializes the gRPC clients
func (s *Server) initClients() error {
	// Initialize AI client if not already initialized
	if s.aiClient == nil {
		client, err := grpc.NewAiClient(s.aiServerAddr)
		if err != nil {
			return fmt.Errorf("failed to create AI client: %v", err)
		}
		s.aiClient = client
	}

	// Initialize DB client if not already initialized
	if s.dbClient == nil {
		client, err := grpc.NewDatabaseClient(s.dbServerAddr)
		if err != nil {
			return fmt.Errorf("failed to create Database client: %v", err)
		}
		s.dbClient = client
	}

	return nil
}

// Run starts the HTTP server
func (s *Server) Run(addr string) error {
	// Initialize clients
	if err := s.initClients(); err != nil {
		return err
	}

	s.accessLogger.Printf("Starting HTTP server on %s", addr)
	return s.router.Run(addr)
}

// Close closes the server and its clients
func (s *Server) Close() {
	if s.aiClient != nil {
		s.aiClient.Close()
	}
	if s.dbClient != nil {
		s.dbClient.Close()
	}
}

// loggerMiddleware returns a gin.HandlerFunc for logging requests
func (s *Server) loggerMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		start := time.Now()
		path := c.Request.URL.Path

		// Process request
		c.Next()

		// Log access
		latency := time.Since(start)
		clientIP := c.ClientIP()
		method := c.Request.Method
		statusCode := c.Writer.Status()

		s.accessLogger.Printf("%3d | %13v | %15s | %s %s",
			statusCode,
			latency,
			clientIP,
			method,
			path,
		)
	}
}

// handleLogin handles login requests
func (s *Server) handleLogin(c *gin.Context) {
	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		s.errorLogger.Printf("Invalid login request: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	s.accessLogger.Printf("Login request for user: %s", req.Username)

	// Create context with timeout
	ctx, cancel := context.WithTimeout(context.Background(), time.Second*5)
	defer cancel()

	// Call the gRPC service
	loginInput := grpc.LoginInput{
		Username: req.Username,
		Password: req.Password,
	}

	loginOutput, err := s.dbClient.Login(ctx, loginInput)
	if err != nil {
		s.errorLogger.Printf("Login failed: %v", err)
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
		return
	}

	c.JSON(http.StatusOK, AuthResponse{
		Token: loginOutput.Token,
	})
}

// handleRegister handles registration requests
func (s *Server) handleRegister(c *gin.Context) {
	var req RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		s.errorLogger.Printf("Invalid registration request: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	s.accessLogger.Printf("Registration request for user: %s", req.Username)

	// Create context with timeout
	ctx, cancel := context.WithTimeout(context.Background(), time.Second*5)
	defer cancel()

	// Call the gRPC service
	registerInput := grpc.RegisterInput{
		Username: req.Username,
		Password: req.Password,
	}

	registerOutput, err := s.dbClient.Register(ctx, registerInput)
	if err != nil {
		s.errorLogger.Printf("Registration failed: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Registration failed"})
		return
	}

	c.JSON(http.StatusOK, AuthResponse{
		Token: registerOutput.Token,
	})
}

// handleChat handles chat requests
func (s *Server) handleChat(c *gin.Context) {
	var req ChatRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		s.errorLogger.Printf("Invalid chat request: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	// Log the newest message (the last one in the array)
	latestMessage := "No messages"
	if len(req.Messages) > 0 {
		latestMessage = req.Messages[len(req.Messages)-1].Content
	}
	s.accessLogger.Printf("Chat request with latest message: %s", latestMessage)

	// Verify the token and get patient info
	ctx, cancel := context.WithTimeout(context.Background(), time.Minute*5)
	defer cancel()

	getPatientInput := grpc.GetPatientInput{
		Token: req.Token,
	}

	getPatientOutput, err := s.dbClient.GetPatient(ctx, getPatientInput)
	if err != nil {
		s.errorLogger.Printf("Failed to get patient info: %v", err)
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token"})
		return
	}

	// Convert HTTP messages to gRPC messages
	grpcMessages := make([]grpc.Message, len(req.Messages))
	for i, msg := range req.Messages {
		grpcMessages[i] = grpc.Message{
			Role:    msg.Role,
			Content: msg.Content,
		}
	}

	// Now diagnose using the AI service with streaming
	patientInfo := grpc.PatientInfo{
		Name:   getPatientOutput.PatientInfo.Name,
		Age:    getPatientOutput.PatientInfo.Age,
		Gender: getPatientOutput.PatientInfo.Gender,
		Weight: getPatientOutput.PatientInfo.Weight,
		Height: getPatientOutput.PatientInfo.Height,
	}

	diagnosisInput := grpc.DiagnoseInput{
		PatientInfo: patientInfo,
		Messages:    grpcMessages,
	}

	// Stream the response directly to the client
	if err := s.aiClient.StreamDiagnose(ctx, c, diagnosisInput); err != nil {
		s.errorLogger.Printf("Diagnosis streaming failed: %v", err)
		// If headers haven't been sent yet, return an error response
		if !c.Writer.Written() {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Diagnosis failed"})
		}
		return
	}
}

// handleGetPatient handles get patient requests
func (s *Server) handleGetPatient(c *gin.Context) {
	token := c.Query("token")
	if token == "" {
		s.errorLogger.Printf("Missing token in get patient request")
		c.JSON(http.StatusBadRequest, gin.H{"error": "Token is required"})
		return
	}

	s.accessLogger.Printf("Get patient request with token: %s", token)

	// Create context with timeout
	ctx, cancel := context.WithTimeout(context.Background(), time.Second*5)
	defer cancel()

	// Call the gRPC service
	getPatientInput := grpc.GetPatientInput{
		Token: token,
	}

	getPatientOutput, err := s.dbClient.GetPatient(ctx, getPatientInput)
	if err != nil {
		s.errorLogger.Printf("Failed to get patient: %v", err)
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token"})
		return
	}

	c.JSON(http.StatusOK, GetPatientResponse{
		Patient: PatientInfo{
			Name:   getPatientOutput.PatientInfo.Name,
			Age:    getPatientOutput.PatientInfo.Age,
			Gender: getPatientOutput.PatientInfo.Gender,
			Weight: getPatientOutput.PatientInfo.Weight,
			Height: getPatientOutput.PatientInfo.Height,
		},
	})
}

// handleSavePatient handles save patient requests
func (s *Server) handleSavePatient(c *gin.Context) {
	var req PatientInfoRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		s.errorLogger.Printf("Invalid save patient request: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	s.accessLogger.Printf("Save patient request for: %s", req.Patient.Name)

	// Create context with timeout
	ctx, cancel := context.WithTimeout(context.Background(), time.Second*5)
	defer cancel()

	// Call the gRPC service
	savePatientInput := grpc.SavePatientInfoInput{
		Token: req.Token,
		PatientInfo: grpc.PatientInfo{
			Name:   req.Patient.Name,
			Age:    req.Patient.Age,
			Gender: req.Patient.Gender,
			Weight: req.Patient.Weight,
			Height: req.Patient.Height,
		},
	}

	savePatientOutput, err := s.dbClient.SavePatientInfo(ctx, savePatientInput)
	if err != nil {
		s.errorLogger.Printf("Failed to save patient: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save patient"})
		return
	}

	c.JSON(http.StatusOK, PatientInfoResponse{
		Success: savePatientOutput.Success,
	})
}
