package http

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

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
	Token    string `json:"token" binding:"required"`
	Symptoms string `json:"symptoms" binding:"required"`
}

// ChatResponse represents a chat response
type ChatResponse struct {
	Diagnosis string `json:"diagnosis"`
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

// PatientInfoRequest represents a patient info save request
type PatientInfoRequest struct {
	Token   string           `json:"token" binding:"required"`
	Patient grpc.PatientInfo `json:"patient" binding:"required"`
}

// PatientInfoResponse represents a patient info response
type PatientInfoResponse struct {
	Success bool `json:"success"`
}

// GetPatientResponse represents a get patient response
type GetPatientResponse struct {
	Patient grpc.PatientInfo `json:"patient"`
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

	// API routes
	api := s.router.Group("/api")
	{
		api.POST("/login", s.handleLogin)
		api.POST("/register", s.handleRegister)
		api.POST("/chat", s.handleChat)
		api.GET("/patient", s.handleGetPatient)
		api.POST("/patient", s.handleSavePatient)
	}

	// Serve static files from public folder
	s.router.Static("/", "./public")

	// Serve index.html for the root path
	s.router.GET("/", func(c *gin.Context) {
		c.File("./public/index.html")
	})

	// Fallback route for SPA
	s.router.NoRoute(func(c *gin.Context) {
		c.File("./public/index.html")
	})
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

		s.accessLogger.Printf("%s | %3d | %13v | %15s | %s %s",
			statusCode,
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

	s.accessLogger.Printf("Chat request with symptoms: %s", req.Symptoms)

	// Verify the token and get patient info
	ctx, cancel := context.WithTimeout(context.Background(), time.Second*5)
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

	// Now diagnose using the AI service
	diagnosisInput := grpc.DiagnoseInput{
		History: grpc.PatientHistory{
			Name:   getPatientOutput.PatientInfo.Name,
			Age:    getPatientOutput.PatientInfo.Age,
			Gender: getPatientOutput.PatientInfo.Gender,
			Weight: getPatientOutput.PatientInfo.Weight,
			Height: getPatientOutput.PatientInfo.Height,
		},
		Symptoms: req.Symptoms,
	}

	diagnosisOutput, err := s.aiClient.Diagnose(ctx, diagnosisInput)
	if err != nil {
		s.errorLogger.Printf("Diagnosis failed: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Diagnosis failed"})
		return
	}

	c.JSON(http.StatusOK, ChatResponse{
		Diagnosis: diagnosisOutput.Diagnosis,
	})
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
		Patient: getPatientOutput.PatientInfo,
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
		Token:       req.Token,
		PatientInfo: req.Patient,
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
