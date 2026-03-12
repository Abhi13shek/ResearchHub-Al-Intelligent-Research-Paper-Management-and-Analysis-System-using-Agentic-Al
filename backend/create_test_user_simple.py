#!/usr/bin/env python3
"""
Simple script to create a test user for ResearchHub AI
"""

import sqlite3
import os

def create_test_user():
    """Create a test user directly in the database"""
    db_path = "researchhub.db"
    
    if not os.path.exists(db_path):
        print("Database not found. Please start the backend server first to create the database.")
        return
    
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Check if user already exists
    cursor.execute("SELECT id FROM user WHERE email = ?", ("test@example.com",))
    if cursor.fetchone():
        print("Test user already exists!")
        print("Email: test@example.com")
        print("Password: testpassword")
        conn.close()
        return
    
    # Create test user
    cursor.execute("""
        INSERT INTO user (email, name, hashed_password, institution, created_at)
        VALUES (?, ?, ?, ?, datetime('now'))
    """, (
        "test@example.com",
        "Test User", 
        "$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8Kz8KzK",  # "testpassword"
        "Test University"
    ))
    
    conn.commit()
    conn.close()
    
    print("Test user created successfully!")
    print("Email: test@example.com")
    print("Password: testpassword")
    print("\nYou can now use these credentials to log in to the application.")

if __name__ == "__main__":
    create_test_user()
