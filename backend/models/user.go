package models

import (
	"database/sql"
	"fmt"
)

// User represents a record in the users table.
type User struct {
	ID             int
	Username       string
	Email          string
	HashedPassword string
	Salt           string
}

// CreateUser inserts a new user into the database.
// Pre-hashed value is only passed.
func CreateUser(db *sql.DB, username, email, hashedPassword, salt string) error {
	query := `INSERT INTO users (username, email, hashed_password, salt) VALUES (?, ?, ?, ?)`
	_, err := db.Exec(query, username, email, hashedPassword, salt)
	if err != nil {
		return fmt.Errorf("failed to insert user: %w", err)
	}
	return nil
}

// GetUserByUsername retrieves a user's stored credentials by username.
// Returns (nil, nil) if the user is not found.
func GetUserByUsername(db *sql.DB, username string) (*User, error) {
	query := `SELECT id, username, email, hashed_password, salt FROM users WHERE username = ?`
	row := db.QueryRow(query, username)

	user := &User{}
	err := row.Scan(&user.ID, &user.Username, &user.Email, &user.HashedPassword, &user.Salt)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, fmt.Errorf("query error: %w", err)
	}

	return user, nil
}

// UsernameExists checks whether a username is already taken.
func UsernameExists(db *sql.DB, username string) (bool, error) {
	var count int
	err := db.QueryRow(`SELECT COUNT(*) FROM users WHERE username = ?`, username).Scan(&count)
	if err != nil {
		return false, fmt.Errorf("existence check error: %w", err)
	}
	return count > 0, nil
}

// EmailExists checks whether an email is already registered.
func EmailExists(db *sql.DB, email string) (bool, error) {
	var count int
	err := db.QueryRow(`SELECT COUNT(*) FROM users WHERE email = ?`, email).Scan(&count)
	if err != nil {
		return false, fmt.Errorf("existence check error: %w", err)
	}
	return count > 0, nil
}