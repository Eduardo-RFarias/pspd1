package main

import (
	"context"
	"fmt"
	"log"
	"time"

	"unb.br/web-server/src/grpc"
)

func testAiClient() {
	// Create a new AI client
	client, err := grpc.NewAiClient("localhost:50051")
	if err != nil {
		log.Fatalf("Failed to create AI client: %v", err)
	}
	defer client.Close()

	// Create a sample diagnosis request
	input := grpc.DiagnoseInput{
		History: grpc.PatientHistory{
			Name:   "John Doe",
			Age:    42,
			Gender: "male",
			Weight: 75.5,
			Height: 180.0,
		},
		Symptoms: "fever, headache, fatigue",
	}

	// Create a context with timeout
	ctx, cancel := context.WithTimeout(context.Background(), time.Second*5)
	defer cancel()

	// Send the request
	fmt.Println("Sending diagnosis request...")
	output, err := client.Diagnose(ctx, input)
	if err != nil {
		log.Fatalf("Diagnosis failed: %v", err)
	}

	// Print the result
	fmt.Printf("Diagnosis result: %s\n", output.Diagnosis)
}

func testDatabaseClient() {
	// Create a new Database client
	client, err := grpc.NewDatabaseClient("localhost:50052")
	if err != nil {
		log.Fatalf("Failed to create Database client: %v", err)
	}
	defer client.Close()

	// Test registration
	fmt.Println("\nTesting registration...")
	registerInput := grpc.RegisterInput{
		Username: "testuser",
		Password: "testpass",
	}

	ctx, cancel := context.WithTimeout(context.Background(), time.Second*5)
	defer cancel()

	registerOutput, err := client.Register(ctx, registerInput)
	if err != nil {
		log.Fatalf("Registration failed: %v", err)
	}
	fmt.Printf("Registration successful. Token: %s\n", registerOutput.Token)

	// Test login
	fmt.Println("\nTesting login...")
	loginInput := grpc.LoginInput{
		Username: "testuser",
		Password: "testpass",
	}

	loginOutput, err := client.Login(ctx, loginInput)
	if err != nil {
		log.Fatalf("Login failed: %v", err)
	}
	fmt.Printf("Login successful. Token: %s\n", loginOutput.Token)

	// Test saving patient info
	fmt.Println("\nTesting save patient info...")
	saveInput := grpc.SavePatientInfoInput{
		Token: loginOutput.Token,
		PatientInfo: grpc.PatientInfo{
			Name:   "John Doe",
			Age:    42,
			Gender: "male",
			Weight: 75.5,
			Height: 180.0,
		},
	}

	saveOutput, err := client.SavePatientInfo(ctx, saveInput)
	if err != nil {
		log.Fatalf("Saving patient info failed: %v", err)
	}
	fmt.Printf("Save patient info result: %v\n", saveOutput.Success)

	// Test getting patient info
	fmt.Println("\nTesting get patient info...")
	getInput := grpc.GetPatientInput{
		Token: loginOutput.Token,
	}

	getOutput, err := client.GetPatient(ctx, getInput)
	if err != nil {
		log.Fatalf("Getting patient info failed: %v", err)
	}

	patient := getOutput.PatientInfo
	fmt.Printf("Retrieved patient: Name=%s, Age=%d, Gender=%s, Weight=%.1f, Height=%.1f\n",
		patient.Name, patient.Age, patient.Gender, patient.Weight, patient.Height)
}

func main() {
	// Test AI client
	fmt.Println("=== Testing AI Client ===")
	testAiClient()

	// Test Database client
	fmt.Println("\n=== Testing Database Client ===")
	testDatabaseClient()
}
