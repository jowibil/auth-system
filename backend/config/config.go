package config

import (
	"log"
	"os"
)


func GetPepper() string {
	pepper := os.Getenv("PEPPER")
	if pepper == "" {
		log.Fatal("[ERROR] PEPPER environment variable is not set. Check your .env file.")
	}
	return pepper
}

func GetAllowedOrigin() string {
	origin := os.Getenv("ALLOWED_ORIGIN")
	if origin == "" {
		return "*"
	}
	return origin
}