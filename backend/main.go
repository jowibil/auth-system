package main

import (
	"fmt"
	"log"
	"net/http"
	"os"

	"auth-system/db"
	"auth-system/handlers"

	"github.com/joho/godotenv"
)

func main() {
	fmt.Println("===========================================")
	fmt.Println("   Secure Registration & Login System")
	fmt.Println("===========================================")

	// Load .env file
	if err := godotenv.Load(); err != nil {
		log.Println("[WARN] No .env file found, relying on system environment variables")
	}
	fmt.Println("[OK] Environment variables loaded.")

	// Connect to database
	database, err := db.Connect()
	if err != nil {
		log.Fatalf("[ERROR] Failed to connect to database: %v", err)
	}
	defer database.Close()
	fmt.Println("[OK] Connected to MySQL database.")

	// Run database schema migrations
	if err := db.Migrate(database); err != nil {
		log.Fatalf("[ERROR] Migration failed: %v", err)
	}
	fmt.Println("[OK] Database table ready.")

	// Initialize HTTP Mux
	mux := http.NewServeMux()


	registerChain := handlers.CORSMiddleware(handlers.RateLimitMiddleware(handlers.RegisterHandler(database)))
	loginChain    := handlers.CORSMiddleware(handlers.RateLimitMiddleware(handlers.LoginHandler(database)))

	mux.Handle("/api/register", registerChain)
	mux.Handle("/api/login", loginChain)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	fmt.Printf("[OK] Starting HTTP server on port :%s\n", port)
	
	if err := http.ListenAndServe(":" + port, mux); err != nil {
		log.Fatalf("[ERROR] Server failed: %v", err)
	}
}