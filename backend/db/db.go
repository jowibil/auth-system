package db

import (
	"database/sql"
	"fmt"
	"os"
	"time"

	_ "github.com/go-sql-driver/mysql"
)

func getDSN(withDB bool) string {
	dbUser := os.Getenv("DB_USER")
	dbPassword := os.Getenv("DB_PASSWORD")
	dbHost := os.Getenv("DB_HOST")
	dbPort := os.Getenv("DB_PORT")
	dbName := os.Getenv("DB_NAME")

	if withDB {
		return fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?parseTime=true", dbUser, dbPassword, dbHost, dbPort, dbName)
	}
	return fmt.Sprintf("%s:%s@tcp(%s:%s)/", dbUser, dbPassword, dbHost, dbPort)
}

// Connect opens a connection to the MySQL database.
func Connect() (*sql.DB, error) {
	dsnNoDB := getDSN(false)
	tempDB, err := sql.Open("mysql", dsnNoDB)
	if err != nil {
		return nil, fmt.Errorf("temporary sql.Open error: %w", err)
	}

	dbName := os.Getenv("DB_NAME")
	if dbName == "" {
		tempDB.Close()
		return nil, fmt.Errorf("DB_NAME environment variable is required but empty")
	}

	_, err = tempDB.Exec(fmt.Sprintf("CREATE DATABASE IF NOT EXISTS `%s`", dbName))
	if err != nil {
		tempDB.Close()
		return nil, fmt.Errorf("failed to create database: %w", err)
	}
	tempDB.Close()

	dsn := getDSN(true)
	database, err := sql.Open("mysql", dsn)
	if err != nil {
		return nil, fmt.Errorf("target sql.Open error: %w", err)
	}

	database.SetMaxOpenConns(25)
	database.SetMaxIdleConns(25)
	database.SetConnMaxLifetime(5 * time.Minute)

	if err := database.Ping(); err != nil {
		database.Close()
		return nil, fmt.Errorf("database ping failed: %w", err)
	}

	return database, nil
}

// Migrate creates the users table if it does not already exist.
// Stores: username, email, hashed_password, and salt.
// PEPPER is handled in-app code layer and is intentionally absent here.
func Migrate(db *sql.DB) error {
	query := `
	CREATE TABLE IF NOT EXISTS users (
		id              INT AUTO_INCREMENT PRIMARY KEY,
		username        VARCHAR(100) NOT NULL UNIQUE,
		email           VARCHAR(255) NOT NULL UNIQUE,
		hashed_password VARCHAR(255) NOT NULL,
		salt            VARCHAR(64)  NOT NULL,
		created_at      DATETIME DEFAULT CURRENT_TIMESTAMP
	);`

	_, err := db.Exec(query)
	if err != nil {
		return fmt.Errorf("failed to create users table: %w", err)
	}
	return nil
}