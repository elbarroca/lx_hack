#!/usr/bin/env python3
import requests
import json

BASE_URL = "http://localhost:8000"

def test_root():
    print("🧪 Testing root endpoint...")
    response = requests.get(f"{BASE_URL}/")
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")
    print()

def test_data():
    print("🧪 Testing test-data endpoint...")
    response = requests.get(f"{BASE_URL}/test-data")
    print(f"Status: {response.status_code}")
    data = response.json()
    print(f"Users: {len(data['users'])}")
    print(f"Meetings: {len(data['meetings'])}")
    print(f"Transcripts: {len(data['transcripts'])}")
    print(f"Participants: {len(data['participants'])}")
    print()

def test_email_endpoint():
    print("🧪 Testing craft-email endpoint with user_email...")
    payload = {"user_email": "test@example.com"}
    response = requests.post(f"{BASE_URL}/craft-email", json=payload)
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    print()

if __name__ == "__main__":
    try:
        test_root()
        test_data()
        test_email_endpoint()
    except requests.exceptions.ConnectionError:
        print("❌ Server is not running! Please start the FastAPI server first.")
    except Exception as e:
        print(f"❌ Error: {e}") 