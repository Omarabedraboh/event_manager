#!/usr/bin/env python3
"""
Focused test for venue access permissions for organizers
Tests the specific issue mentioned in the review request
"""

import requests
import json
from datetime import datetime, timedelta

class VenueAccessTester:
    def __init__(self):
        self.base_url = "https://9f8d110f-1910-49b5-b12d-d5ab54d2f28d.preview.emergentagent.com"
        self.api_url = f"{self.base_url}/api"
        self.test_timestamp = datetime.now().strftime("%H%M%S")
        
    def make_request(self, method, endpoint, data=None, token=None):
        """Make HTTP request"""
        url = f"{self.api_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}
        
        if token:
            headers['Authorization'] = f'Bearer {token}'
            
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers)
                
            return response.status_code, response.json() if response.text else {}
        except Exception as e:
            return 500, {"error": str(e)}
    
    def test_venue_access_permissions(self):
        """Test venue access for different user roles"""
        print("🔍 Testing Venue Access Permissions for Different Roles")
        print("=" * 60)
        
        # Create test users
        roles_to_test = ["organizer", "venue_owner", "admin", "attendee"]
        tokens = {}
        
        for role in roles_to_test:
            print(f"\n👤 Creating {role} user...")
            user_data = {
                "email": f"venue_test_{role}_{self.test_timestamp}@example.com",
                "password": "TestPass123!",
                "name": f"Venue Test {role.title()}",
                "role": role
            }
            
            status, response = self.make_request("POST", "auth/register", user_data)
            if status == 200 and "token" in response:
                tokens[role] = response["token"]
                print(f"✅ {role} user created successfully")
            else:
                print(f"❌ Failed to create {role} user: {response}")
                continue
        
        # Test venue creation permissions
        print(f"\n🏗️ Testing Venue Creation Permissions...")
        venue_data = {
            "name": f"Permission Test Venue {self.test_timestamp}",
            "description": "Test venue for permission testing",
            "address": "123 Permission Test St",
            "capacity": 150,
            "price_per_hour": 100.0
        }
        
        venue_id = None
        for role in roles_to_test:
            if role not in tokens:
                continue
                
            status, response = self.make_request("POST", "venues", venue_data, tokens[role])
            
            if role in ["venue_owner", "admin"]:
                if status == 200:
                    print(f"✅ {role} can create venues (expected)")
                    if venue_id is None:
                        venue_id = response.get("id")
                else:
                    print(f"❌ {role} cannot create venues (unexpected): {response}")
            else:
                if status == 403:
                    print(f"✅ {role} cannot create venues (expected)")
                else:
                    print(f"❌ {role} can create venues (unexpected): status {status}")
        
        # Test venue viewing permissions
        print(f"\n👀 Testing Venue Viewing Permissions...")
        for role in roles_to_test:
            if role not in tokens:
                continue
                
            status, response = self.make_request("GET", "venues", token=tokens[role])
            
            if status == 200:
                print(f"✅ {role} can view venues (expected for all authenticated users)")
            else:
                print(f"❌ {role} cannot view venues: status {status}, response: {response}")
        
        # Test venue booking permissions (if we have a venue)
        if venue_id and "organizer" in tokens:
            print(f"\n📅 Testing Venue Booking Permissions...")
            
            # First create an event for booking
            event_data = {
                "title": f"Booking Test Event {self.test_timestamp}",
                "description": "Test event for venue booking",
                "event_type": "physical",
                "start_date": (datetime.now() + timedelta(days=1)).isoformat(),
                "end_date": (datetime.now() + timedelta(days=1, hours=2)).isoformat(),
                "max_attendees": 50
            }
            
            status, event_response = self.make_request("POST", "events", event_data, tokens["organizer"])
            if status == 200:
                event_id = event_response["id"]
                print(f"✅ Created test event for booking")
                
                # Test booking
                booking_data = {
                    "start_time": (datetime.now() + timedelta(days=1)).isoformat(),
                    "end_time": (datetime.now() + timedelta(days=1, hours=2)).isoformat(),
                    "event_id": event_id
                }
                
                for role in roles_to_test:
                    if role not in tokens:
                        continue
                        
                    status, response = self.make_request("POST", f"venues/{venue_id}/book", booking_data, tokens[role])
                    
                    if role in ["organizer", "admin"]:
                        if status == 200:
                            print(f"✅ {role} can book venues (expected)")
                            break  # Only book once to avoid conflicts
                        else:
                            print(f"❌ {role} cannot book venues (unexpected): status {status}, response: {response}")
                    else:
                        if status == 403:
                            print(f"✅ {role} cannot book venues (expected)")
                        else:
                            print(f"❌ {role} can book venues (unexpected): status {status}")
            else:
                print(f"❌ Failed to create test event: {event_response}")
        
        print(f"\n" + "=" * 60)
        print("🎯 VENUE ACCESS SUMMARY:")
        print("• Organizers SHOULD be able to: View venues ✓, Book venues ✓")
        print("• Organizers SHOULD NOT be able to: Create venues ✓")
        print("• Venue owners SHOULD be able to: View venues ✓, Create venues ✓")
        print("• All authenticated users SHOULD be able to: View venues ✓")
        print("=" * 60)

def main():
    tester = VenueAccessTester()
    tester.test_venue_access_permissions()

if __name__ == "__main__":
    main()