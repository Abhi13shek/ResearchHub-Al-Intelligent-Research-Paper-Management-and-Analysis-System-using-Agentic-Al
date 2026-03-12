#!/usr/bin/env python3
"""
Test script to verify login functionality
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import engine
from app.models import User
from backend.app.security import verify_password, get_password_hash
from sqlmodel import Session, select

def test_login():
    """Test login functionality"""
    with Session(engine) as session:
        # Get the test user
        user = session.exec(select(User).where(User.email == "test@example.com")).first()
        if not user:
            print("Test user not found!")
            return
        
        print(f"Found user: {user.email}")
        print(f"Stored hash: {user.hashed_password}")
        
        # Test password verification
        test_password = "testpassword"
        is_valid = verify_password(test_password, user.hashed_password)
        print(f"Password verification: {is_valid}")
        
        if not is_valid:
            print("Password hash is incorrect. Updating...")
            user.hashed_password = get_password_hash(test_password)
            session.add(user)
            session.commit()
            print("Password hash updated!")
        else:
            print("Password verification successful!")

if __name__ == "__main__":
    test_login()

