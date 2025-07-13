#!/usr/bin/env python3
"""
Comprehensive Backend API Testing for Event Management System
Tests all endpoints with different user roles and scenarios
"""

import requests
import sys
import json
from datetime import datetime, timedelta
from typing import Dict, Any, Optional

class EventManagementAPITester:
    def __init__(self, base_url="https://71e2e852-b2f7-48b5-8610-a3981c8caca7.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.tokens = {}  # Store tokens for different users
        self.users = {}   # Store user data
        self.events = {}  # Store created events
        self.venues = {}  # Store created venues
        self.tickets = {} # Store created tickets
        self.tests_run = 0
        self.tests_passed = 0
        
        # Test data
        self.test_timestamp = datetime.now().strftime("%H%M%S")

    def log_test(self, name: str, success: bool, details: str = ""):
        """Log test results"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name}")
        else:
            print(f"❌ {name} - {details}")

    def make_request(self, method: str, endpoint: str, data: Optional[Dict] = None, 
                    token: Optional[str] = None, expected_status: int = 200) -> tuple[bool, Dict]:
        """Make HTTP request with error handling"""
        url = f"{self.api_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}
        
        if token:
            headers['Authorization'] = f'Bearer {token}'

        try:
            if method == 'GET':
                response = requests.get(url, headers=headers)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers)

            success = response.status_code == expected_status
            response_data = {}
            
            try:
                response_data = response.json()
            except:
                response_data = {"text": response.text}

            if not success:
                print(f"   Status: {response.status_code}, Expected: {expected_status}")
                print(f"   Response: {response_data}")

            return success, response_data

        except Exception as e:
            print(f"   Request failed: {str(e)}")
            return False, {"error": str(e)}

    def test_user_registration_and_login(self):
        """Test user registration and login for all roles"""
        print("\n🔐 Testing Authentication System...")
        
        roles = ["organizer", "attendee", "venue_owner", "speaker", "sponsor", "admin"]
        
        for role in roles:
            # Test Registration
            user_data = {
                "email": f"test_{role}_{self.test_timestamp}@example.com",
                "password": "TestPass123!",
                "name": f"Test {role.title()}",
                "role": role
            }
            
            success, response = self.make_request("POST", "auth/register", user_data, expected_status=200)
            self.log_test(f"Register {role}", success)
            
            if success and "token" in response:
                self.tokens[role] = response["token"]
                self.users[role] = response["user"]
                
                # Test getting user profile
                success, profile = self.make_request("GET", "auth/me", token=self.tokens[role])
                self.log_test(f"Get {role} profile", success and profile.get("role") == role)
            
            # Test Login
            login_data = {"email": user_data["email"], "password": user_data["password"]}
            success, response = self.make_request("POST", "auth/login", login_data, expected_status=200)
            self.log_test(f"Login {role}", success and "token" in response)

    def test_venue_management(self):
        """Test venue creation and management"""
        print("\n🏢 Testing Venue Management...")
        
        if "venue_owner" not in self.tokens:
            print("❌ No venue_owner token available")
            return

        # Test venue creation
        venue_data = {
            "name": f"Test Venue {self.test_timestamp}",
            "description": "A beautiful test venue for events",
            "address": "123 Test Street, Test City",
            "capacity": 200,
            "price_per_hour": 150.0
        }
        
        success, response = self.make_request("POST", "venues", venue_data, 
                                            token=self.tokens["venue_owner"], expected_status=200)
        self.log_test("Create venue", success)
        
        if success and "id" in response:
            venue_id = response["id"]
            self.venues["test_venue"] = response
            
            # Test getting venues
            success, venues = self.make_request("GET", "venues", token=self.tokens["venue_owner"])
            self.log_test("Get venues", success and len(venues) > 0)
            
            # Test venue availability check
            start_date = (datetime.now() + timedelta(days=1)).isoformat()
            end_date = (datetime.now() + timedelta(days=1, hours=2)).isoformat()
            
            success, availability = self.make_request("GET", 
                f"venues/{venue_id}/availability?start_date={start_date}&end_date={end_date}",
                token=self.tokens["venue_owner"])
            self.log_test("Check venue availability", success and availability.get("available") == True)

    def test_event_management(self):
        """Test event creation and management"""
        print("\n📅 Testing Event Management...")
        
        if "organizer" not in self.tokens:
            print("❌ No organizer token available")
            return

        # Test event creation
        event_data = {
            "title": f"Test Event {self.test_timestamp}",
            "description": "A comprehensive test event",
            "event_type": "hybrid",
            "start_date": (datetime.now() + timedelta(days=2)).isoformat(),
            "end_date": (datetime.now() + timedelta(days=2, hours=3)).isoformat(),
            "virtual_link": "https://zoom.us/test-meeting",
            "max_attendees": 100
        }
        
        # Add venue if available
        if "test_venue" in self.venues:
            event_data["venue_id"] = self.venues["test_venue"]["id"]
        
        success, response = self.make_request("POST", "events", event_data, 
                                            token=self.tokens["organizer"], expected_status=200)
        self.log_test("Create event", success)
        
        if success and "id" in response:
            event_id = response["id"]
            self.events["test_event"] = response
            
            # Test getting events
            success, events = self.make_request("GET", "events", token=self.tokens["organizer"])
            self.log_test("Get organizer events", success and len(events) > 0)
            
            # Test getting specific event
            success, event = self.make_request("GET", f"events/{event_id}", token=self.tokens["organizer"])
            self.log_test("Get specific event", success and event.get("id") == event_id)
            
            # Test event publishing
            success, response = self.make_request("POST", f"events/{event_id}/publish", 
                                                token=self.tokens["organizer"])
            self.log_test("Publish event", success)
            
            # Test event update
            update_data = {**event_data, "title": f"Updated Test Event {self.test_timestamp}"}
            success, response = self.make_request("PUT", f"events/{event_id}", update_data,
                                                token=self.tokens["organizer"])
            self.log_test("Update event", success)

    def test_ticket_management(self):
        """Test ticket creation and management"""
        print("\n🎫 Testing Ticket Management...")
        
        if "organizer" not in self.tokens or "test_event" not in self.events:
            print("❌ No organizer token or test event available")
            return

        event_id = self.events["test_event"]["id"]
        ticket_types = ["early_bird", "regular", "vip"]
        prices = [50.0, 75.0, 150.0]
        
        for ticket_type, price in zip(ticket_types, prices):
            ticket_data = {
                "event_id": event_id,
                "ticket_type": ticket_type,
                "price": price,
                "quantity_available": 50
            }
            
            success, response = self.make_request("POST", "tickets", ticket_data,
                                                token=self.tokens["organizer"], expected_status=200)
            self.log_test(f"Create {ticket_type} ticket", success)
            
            if success and "id" in response:
                self.tickets[ticket_type] = response
        
        # Test getting event tickets
        success, tickets = self.make_request("GET", f"events/{event_id}/tickets",
                                           token=self.tokens["organizer"])
        self.log_test("Get event tickets", success and len(tickets) > 0)

    def test_registration_system(self):
        """Test event registration system"""
        print("\n📝 Testing Registration System...")
        
        if "attendee" not in self.tokens or "regular" not in self.tickets:
            print("❌ No attendee token or tickets available")
            return

        event_id = self.events["test_event"]["id"]
        ticket_id = self.tickets["regular"]["id"]
        
        # Test event registration
        registration_data = {
            "event_id": event_id,
            "ticket_id": ticket_id
        }
        
        success, response = self.make_request("POST", "register", registration_data,
                                            token=self.tokens["attendee"], expected_status=200)
        self.log_test("Register for event", success and "qr_code" in response)
        
        if success:
            # Test getting my registrations
            success, registrations = self.make_request("GET", "my-registrations",
                                                     token=self.tokens["attendee"])
            self.log_test("Get my registrations", success and len(registrations) > 0)
            
            # Test getting event registrations (as organizer)
            success, event_registrations = self.make_request("GET", f"events/{event_id}/registrations",
                                                           token=self.tokens["organizer"])
            self.log_test("Get event registrations", success and len(event_registrations) > 0)

    def test_dashboard_stats(self):
        """Test dashboard statistics for different roles"""
        print("\n📊 Testing Dashboard Statistics...")
        
        for role in ["organizer", "attendee", "venue_owner"]:
            if role in self.tokens:
                success, stats = self.make_request("GET", "dashboard/stats", token=self.tokens[role])
                self.log_test(f"Get {role} dashboard stats", success and isinstance(stats, dict))

    def test_venue_booking(self):
        """Test venue booking system"""
        print("\n🏢 Testing Venue Booking...")
        
        if "organizer" not in self.tokens or "test_venue" not in self.venues or "test_event" not in self.events:
            print("❌ Missing required data for venue booking test")
            return

        venue_id = self.venues["test_venue"]["id"]
        event_id = self.events["test_event"]["id"]
        
        # Test venue booking
        booking_data = {
            "start_time": (datetime.now() + timedelta(days=1)).isoformat(),
            "end_time": (datetime.now() + timedelta(days=1, hours=2)).isoformat(),
            "event_id": event_id
        }
        
        success, response = self.make_request("POST", f"venues/{venue_id}/book", booking_data,
                                            token=self.tokens["organizer"], expected_status=200)
        self.log_test("Book venue", success and "total_cost" in response)

    def test_error_handling(self):
        """Test error handling scenarios"""
        print("\n⚠️ Testing Error Handling...")
        
        # Test unauthorized access
        success, response = self.make_request("GET", "events", expected_status=401)
        self.log_test("Unauthorized access blocked", not success)
        
        # Test invalid event ID
        if "organizer" in self.tokens:
            success, response = self.make_request("GET", "events/invalid-id", 
                                                token=self.tokens["organizer"], expected_status=404)
            self.log_test("Invalid event ID handled", not success)
        
        # Test duplicate registration
        if "attendee" in self.tokens and "test_event" in self.events and "regular" in self.tickets:
            registration_data = {
                "event_id": self.events["test_event"]["id"],
                "ticket_id": self.tickets["regular"]["id"]
            }
            success, response = self.make_request("POST", "register", registration_data,
                                                token=self.tokens["attendee"], expected_status=400)
            self.log_test("Duplicate registration blocked", not success)

    def run_all_tests(self):
        """Run all test suites"""
        print("🚀 Starting Event Management System API Tests")
        print(f"Testing against: {self.base_url}")
        print("=" * 60)
        
        try:
            self.test_user_registration_and_login()
            self.test_venue_management()
            self.test_event_management()
            self.test_ticket_management()
            self.test_registration_system()
            self.test_dashboard_stats()
            self.test_venue_booking()
            self.test_error_handling()
            
        except Exception as e:
            print(f"\n💥 Test suite failed with error: {str(e)}")
            return False
        
        # Print final results
        print("\n" + "=" * 60)
        print(f"📊 Test Results: {self.tests_passed}/{self.tests_run} tests passed")
        
        if self.tests_passed == self.tests_run:
            print("🎉 All tests passed! Backend API is working correctly.")
            return True
        else:
            print(f"⚠️ {self.tests_run - self.tests_passed} tests failed. Check the issues above.")
            return False

def main():
    """Main test runner"""
    tester = EventManagementAPITester()
    success = tester.run_all_tests()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())