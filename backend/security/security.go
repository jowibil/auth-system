package security

import (
	"crypto/rand"
	"crypto/subtle"
	"encoding/hex"
	"fmt"
	"log"
	"os"

	"golang.org/x/crypto/argon2"
)

// Recommended OWASP Argon2id Parameter Profiles
const (
	argonMemory      = 64 * 1024 // 64 MB
	argonIterations  = 3
	argonParallelism = 2
	argonKeyLength   = 32        // 256-bit output hash (matches your 64-char hex output)
)

// getPepper reads the PEPPER value from the environment.
// The .env file is loaded by main.go before this is ever called.
// If PEPPER is missing, the server refuses to start — a missing pepper
// would silently break all password verification.
func getPepper() string {
	pepper := os.Getenv("PEPPER")
	if pepper == "" {
		log.Fatal("[ERROR] PEPPER environment variable is not set. Check your .env file.")
	}
	return pepper
}

// GenerateSalt creates a cryptographically random 32-byte salt
// and returns it as a 64-character hex string.
// Each user gets a UNIQUE salt so that identical passwords produce different hashes.
func GenerateSalt() (string, error) {
	saltBytes := make([]byte, 32)

	_, err := rand.Read(saltBytes)
	if err != nil {
		return "", fmt.Errorf("failed to generate salt: %w", err)
	}

	return hex.EncodeToString(saltBytes), nil
}

// HashPassword computes an Argon2id cryptographic hash of the password.
//
// Construction: Argon2id( (password || pepper), salt )
//
// Pepper is read from the PEPPER environment variable (in .env).
// Not stored in the DB.
func HashPassword(password, salt string) (string, error) {
	pepper := getPepper()

	// Convert your 64-character hex salt string back to raw bytes for Argon2 internal processing
	saltBytes, err := hex.DecodeString(salt)
	if err != nil {
		return "", fmt.Errorf("failed to decode hex salt: %w", err)
	}

	// Combine the password and secret system pepper as the input payload
	secretPayload := append([]byte(password), []byte(pepper)...)

	// Compute the raw Argon2id byte hash
	hashBytes := argon2.IDKey(
		secretPayload,
		saltBytes,
		argonIterations,
		argonMemory,
		argonParallelism,
		argonKeyLength,
	)

	return hex.EncodeToString(hashBytes), nil
}

// VerifyPassword re-hashes the provided password with the stored salt
// and compares the result against the stored hash.
// Uses ConstantTimeCompare to protect against timing attacks.
func VerifyPassword(inputPassword, storedSalt, storedHash string) bool {
	computedHash, err := HashPassword(inputPassword, storedSalt)
	if err != nil {
		return false
	}

	computedBytes, err1 := hex.DecodeString(computedHash)
	storedBytes, err2 := hex.DecodeString(storedHash)
	if err1 != nil || err2 != nil {
		return false
	}

	// Subtle ConstantTimeCompare ensures execution takes the exact same duration 
	// regardless of whether the hashes match, preventing timing side-channel attacks.
	return subtle.ConstantTimeCompare(computedBytes, storedBytes) == 1
}

// IsPasswordComplex checks if the password meets security requirements:
// Minimum 12 characters, at least 1 uppercase letter, and at least 1 special character.
func IsPasswordComplex(password string) bool {
	if len(password) < 12 {
		return false
	}

	var hasUpper, hasSpecial bool
	for _, ch := range password {
		switch {
		case ch >= 'A' && ch <= 'Z':
			hasUpper = true
		case (ch >= '!' && ch <= '/') || (ch >= ':' && ch <= '@') || (ch >= '[' && ch <= '`') || (ch >= '{' && ch <= '~'):
			hasSpecial = true
		}
		// Early break optimization if conditions are already satisfied
		if hasUpper && hasSpecial {
			return true
		}
	}

	return hasUpper && hasSpecial
}