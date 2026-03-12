#!/usr/bin/env python3
"""
Script to create a test user for ResearchHub AI
Run this script to create a test user that you can use to log in
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import engine
from app.models import User
from backend.app.security import get_password_hash
from sqlmodel import Session

def create_test_user():
    """Create a test user for login"""
    with Session(engine) as session:
        # Check if test user already exists
        existing_user = session.query(User).filter(User.email == "test@example.com").first()
        if existing_user:
            print("Test user already exists!")
            print(f"Email: {existing_user.email}")
            print("Password: testpassword")
            return
        
        # Create new test user with a simple password hash
        test_user = User(
            email="test@example.com",
            name="Test User",
            hashed_password="$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8Kz8KzK",  # "testpassword"
            institution="Test University"
        )
        
        session.add(test_user)
        session.commit()
        session.refresh(test_user)
        
        print("✅ Test user created successfully!")
        print(f"Email: {test_user.email}")
        print("Password: testpassword")
        print("\nYou can now use these credentials to log in to the application.")

if __name__ == "__main__":
    create_test_user()
