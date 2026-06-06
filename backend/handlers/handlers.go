package handlers

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"os"
	"strings"
	"sync"
	"time"

	"auth-system/models"
	"auth-system/security"
	"auth-system/config"

	"golang.org/x/time/rate"
)

// --- Rate Limiter Infrastructure ---

type clientLimiter struct {
	limiter  *rate.Limiter
	lastSeen time.Time
}

var (
	clientsMu sync.Mutex
	clients   = make(map[string]*clientLimiter)
)

// init cleanup worker prevents memory leaks from stale IP entries
func init() {
	go func() {
		for {
			time.Sleep(1 * time.Minute)
			clientsMu.Lock()
			for ip, client := range clients {
				if time.Since(client.lastSeen) > 3*time.Minute {
					delete(clients, ip)
				}
			}
			clientsMu.Unlock()
		}
	}()
}

// RateLimitMiddleware restricts a single remote IP address to 5 authentication attempts per minute
func RateLimitMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Extract IP safely (Assumes standard networking; adjust if behind an explicit reverse proxy like Nginx)
		ip := r.RemoteAddr
		if priorIP := r.Header.Get("X-Forwarded-For"); priorIP != "" {
			ip = strings.Split(priorIP, ",")[0]
		}

		clientsMu.Lock()
		v, exists := clients[ip]
		if !exists {
			// Limit: 5 requests maximum bursting capacity, refills at 5 tokens per 60 seconds (1 token every 12 seconds)
			v = &clientLimiter{
				limiter: rate.NewLimiter(rate.Every(12*time.Second), 5),
			}
			clients[ip] = v
		}
		v.lastSeen = time.Now()
		clientsMu.Unlock()

		if !v.limiter.Allow() {
			writeJSON(w, http.StatusTooManyRequests, response{false, "Too many registration or login attempts. Please wait."})
			return
		}

		next.ServeHTTP(w, r)
	})
}

// --- CORS Middleware ---

func CORSMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		allowedOrigin := config.GetAllowedOrigin()
		w.Header().Set("Access-Control-Allow-Origin", AllowedOrigin)
		w.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}

		next.ServeHTTP(w, r)
	})
}

type registerRequest struct {
	Username string `json:"username"`
	Email    string `json:"email"`
	Password string `json:"password"`
}

type loginRequest struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

type response struct {
	Success bool   `json:"success"`
	Message string `json:"message"`
}

func writeJSON(w http.ResponseWriter, status int, payload response) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(payload)
}

func isValidEmail(email string) bool {
	return strings.Contains(email, "@") && strings.Contains(email, ".")
}

// POST /api/register
func RegisterHandler(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			writeJSON(w, http.StatusMethodNotAllowed, response{false, "Method not allowed"})
			return
		}

		var body registerRequest
		if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
			writeJSON(w, http.StatusBadRequest, response{false, "Invalid request body"})
			return
		}

		if body.Username == "" || body.Email == "" || body.Password == "" {
			writeJSON(w, http.StatusBadRequest, response{false, "Username, email, and password are required"})
			return
		}
		if !isValidEmail(body.Email) {
			writeJSON(w, http.StatusBadRequest, response{false, "Invalid email format"})
			return
		}
		
		// Upgraded security checkpoint using the new validation script
		if !security.IsPasswordComplex(body.Password) {
			writeJSON(w, http.StatusBadRequest, response{false, "Password must be at least 12 characters and contain an uppercase letter and a special character"})
			return
		}

		usernameExists, err := models.UsernameExists(db, body.Username)
		if err != nil {
			writeJSON(w, http.StatusInternalServerError, response{false, "Database error"})
			return
		}
		if usernameExists {
			writeJSON(w, http.StatusConflict, response{false, "Username already taken"})
			return
		}

		emailExists, err := models.EmailExists(db, body.Email)
		if err != nil {
			writeJSON(w, http.StatusInternalServerError, response{false, "Database error"})
			return
		}
		if emailExists {
			writeJSON(w, http.StatusConflict, response{false, "Email already registered"})
			return
		}

		salt, err := security.GenerateSalt()
		if err != nil {
			writeJSON(w, http.StatusInternalServerError, response{false, "Could not generate salt"})
			return
		}

		// Fixed connection assignment to accept your new Argon2id (string, error) layout
		hashedPassword, err := security.HashPassword(body.Password, salt)
		if err != nil {
			writeJSON(w, http.StatusInternalServerError, response{false, "Encryption error encountered"})
			return
		}

		if err := models.CreateUser(db, body.Username, body.Email, hashedPassword, salt); err != nil {
			writeJSON(w, http.StatusInternalServerError, response{false, "Failed to create user"})
			return
		}

		writeJSON(w, http.StatusCreated, response{true, "Registration successful"})
	}
}

// POST /api/login
func LoginHandler(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			writeJSON(w, http.StatusMethodNotAllowed, response{false, "Method not allowed"})
			return
		}

		var body loginRequest
		if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
			writeJSON(w, http.StatusBadRequest, response{false, "Invalid request body"})
			return
		}

		if body.Username == "" || body.Password == "" {
			writeJSON(w, http.StatusBadRequest, response{false, "Username and password are required"})
			return
		}

		user, err := models.GetUserByUsername(db, body.Username)
		if err != nil {
			writeJSON(w, http.StatusInternalServerError, response{false, "Database error"})
			return
		}

		if user == nil || !security.VerifyPassword(body.Password, user.Salt, user.HashedPassword) {
			writeJSON(w, http.StatusUnauthorized, response{false, "Invalid Username or Password"})
			return
		}

		writeJSON(w, http.StatusOK, response{true, "Login Successful"})
	}
}