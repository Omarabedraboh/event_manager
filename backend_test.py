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
    def __init__(self, base_url="https://9f8d110f-1910-49b5-b12d-d5ab54d2f28d.preview.emergentagent.com"):
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

    def test_event_access_control_bug_fixes(self):
        """Test specific bug fixes for event access control"""
        print("\n🔒 Testing Event Access Control Bug Fixes...")
        
        if "organizer" not in self.tokens or "attendee" not in self.tokens:
            print("❌ Missing required tokens for access control test")
            return
        
        # Create an unpublished event as organizer
        unpublished_event_data = {
            "title": f"Unpublished Event {self.test_timestamp}",
            "description": "This event should not be visible to attendees",
            "event_type": "physical",
            "start_date": (datetime.now() + timedelta(days=3)).isoformat(),
            "end_date": (datetime.now() + timedelta(days=3, hours=2)).isoformat(),
            "max_attendees": 50
        }
        
        success, response = self.make_request("POST", "events", unpublished_event_data, 
                                            token=self.tokens["organizer"], expected_status=200)
        self.log_test("Create unpublished event", success)
        
        if not success:
            return
            
        unpublished_event_id = response["id"]
        
        # Test 1: Organizer can access their own unpublished event
        success, event = self.make_request("GET", f"events/{unpublished_event_id}", 
                                         token=self.tokens["organizer"], expected_status=200)
        self.log_test("Organizer can access own unpublished event", success and event.get("id") == unpublished_event_id)
        
        # Test 2: Attendee cannot access unpublished event (should get 404)
        success, response = self.make_request("GET", f"events/{unpublished_event_id}", 
                                            token=self.tokens["attendee"], expected_status=404)
        self.log_test("Attendee cannot access unpublished event (404)", success and response.get("detail") == "Event not found")
        
        # Test 3: Attendee cannot see unpublished events in events list
        success, events = self.make_request("GET", "events", token=self.tokens["attendee"])
        unpublished_visible = any(event.get("id") == unpublished_event_id for event in events)
        self.log_test("Unpublished event not in attendee events list", success and not unpublished_visible)
        
        # Test 4: Publish the event and verify attendee can now access it
        success, response = self.make_request("POST", f"events/{unpublished_event_id}/publish", 
                                            token=self.tokens["organizer"])
        self.log_test("Publish event", success)
        
        if success:
            # Test 5: Attendee can now access published event
            success, event = self.make_request("GET", f"events/{unpublished_event_id}", 
                                             token=self.tokens["attendee"], expected_status=200)
            self.log_test("Attendee can access published event", success and event.get("id") == unpublished_event_id)
            
            # Test 6: Published event appears in attendee events list
            success, events = self.make_request("GET", "events", token=self.tokens["attendee"])
            published_visible = any(event.get("id") == unpublished_event_id for event in events)
            self.log_test("Published event visible in attendee events list", success and published_visible)
        
        # Test 7: Admin can access all events (if admin token exists)
        if "admin" in self.tokens:
            success, event = self.make_request("GET", f"events/{unpublished_event_id}", 
                                             token=self.tokens["admin"], expected_status=200)
            self.log_test("Admin can access any event", success and event.get("id") == unpublished_event_id)

    def test_ticket_creation_schema_bug_fixes(self):
        """Test specific bug fixes for ticket creation schema"""
        print("\n🎫 Testing Ticket Creation Schema Bug Fixes...")
        
        if "organizer" not in self.tokens or "test_event" not in self.events:
            print("❌ No organizer token or test event available")
            return

        event_id = self.events["test_event"]["id"]
        
        # Test 1: Correct ticket creation schema (event_id, ticket_type, price, quantity_available)
        correct_ticket_data = {
            "event_id": event_id,
            "ticket_type": "regular",
            "price": 99.99,
            "quantity_available": 100
        }
        
        success, response = self.make_request("POST", "tickets", correct_ticket_data,
                                            token=self.tokens["organizer"], expected_status=200)
        self.log_test("Create ticket with correct schema", success and "id" in response)
        
        if success:
            # Verify the created ticket has correct fields
            ticket = response
            schema_correct = (
                ticket.get("event_id") == event_id and
                ticket.get("ticket_type") == "regular" and
                ticket.get("price") == 99.99 and
                ticket.get("quantity_available") == 100 and
                ticket.get("quantity_sold") == 0
            )
            self.log_test("Ticket created with correct schema fields", schema_correct)
            
            # Store this ticket for later tests
            self.tickets["schema_test"] = ticket

    def test_event_tickets_endpoint_bug_fixes(self):
        """Test specific bug fixes for /events/{event_id}/tickets endpoint"""
        print("\n🎟️ Testing Event Tickets Endpoint Bug Fixes...")
        
        if "organizer" not in self.tokens or "test_event" not in self.events:
            print("❌ No organizer token or test event available")
            return

        event_id = self.events["test_event"]["id"]
        
        # Test 1: /events/{event_id}/tickets endpoint works correctly
        success, tickets = self.make_request("GET", f"events/{event_id}/tickets",
                                           token=self.tokens["organizer"], expected_status=200)
        self.log_test("GET /events/{event_id}/tickets endpoint works", success and isinstance(tickets, list))
        
        if success:
            # Test 2: Endpoint returns tickets for the correct event
            all_tickets_correct_event = all(ticket.get("event_id") == event_id for ticket in tickets)
            self.log_test("All returned tickets belong to correct event", all_tickets_correct_event)
            
            # Test 3: Attendee can also access tickets for published events
            if "attendee" in self.tokens:
                success, attendee_tickets = self.make_request("GET", f"events/{event_id}/tickets",
                                                           token=self.tokens["attendee"], expected_status=200)
                self.log_test("Attendee can access tickets for published event", success and isinstance(attendee_tickets, list))

    def test_registration_workflow_bug_fixes(self):
        """Test event registration workflow with bug fixes"""
        print("\n📋 Testing Registration Workflow Bug Fixes...")
        
        if "attendee" not in self.tokens or "test_event" not in self.events:
            print("❌ Missing attendee token or test event")
            return
        
        event_id = self.events["test_event"]["id"]
        
        # First ensure we have tickets for this event
        if "schema_test" not in self.tickets:
            print("❌ No test ticket available for registration")
            return
            
        ticket_id = self.tickets["schema_test"]["id"]
        
        # Test 1: Registration with correct event and ticket IDs
        registration_data = {
            "event_id": event_id,
            "ticket_id": ticket_id
        }
        
        success, response = self.make_request("POST", "register", registration_data,
                                            token=self.tokens["attendee"], expected_status=200)
        self.log_test("Registration with correct IDs works", success and "qr_code" in response)
        
        if success:
            # Test 2: Registration includes QR code
            has_qr_code = "qr_code" in response and response["qr_code"].startswith("data:image/png;base64,")
            self.log_test("Registration includes valid QR code", has_qr_code)
            
            # Test 3: Registration appears in attendee's registrations
            success, registrations = self.make_request("GET", "my-registrations",
                                                     token=self.tokens["attendee"])
            registration_found = any(reg.get("event_id") == event_id for reg in registrations)
            self.log_test("Registration appears in attendee's list", success and registration_found)

    def run_bug_fix_tests(self):
        """Run specific bug fix tests"""
        print("🔧 Starting Bug Fix Verification Tests")
        print(f"Testing against: {self.base_url}")
        print("=" * 60)
        
        try:
            # First run basic setup
            self.test_user_registration_and_login()
            self.test_venue_management()
            self.test_event_management()
            
            # Then run specific bug fix tests
            self.test_event_access_control_bug_fixes()
            self.test_ticket_creation_schema_bug_fixes()
            self.test_event_tickets_endpoint_bug_fixes()
            self.test_registration_workflow_bug_fixes()
            
        except Exception as e:
            print(f"\n💥 Bug fix test suite failed with error: {str(e)}")
            return False
        
        # Print final results
        print("\n" + "=" * 60)
        print(f"📊 Bug Fix Test Results: {self.tests_passed}/{self.tests_run} tests passed")
        
        if self.tests_passed == self.tests_run:
            print("🎉 All bug fix tests passed! Issues have been resolved.")
            return True
        else:
            print(f"⚠️ {self.tests_run - self.tests_passed} tests failed. Some issues remain.")
            return False
        """Test error handling scenarios"""
        print("\n⚠️ Testing Error Handling...")
        
        # Test unauthorized access
        success, response = self.make_request("GET", "events", expected_status=401)
        self.log_test("Unauthorized access blocked", not success)
        
        # Test invalid event ID
        if "organizer" in self.tokens:
            success, response = self.make_request("GET", "events/invalid-id", 
                                                token=self.tokens["organizer"], expected_status=404)
            print(f"   Invalid event ID test - Success: {success}, Response: {response}")
            self.log_test("Invalid event ID handled", success)
        
        # Test duplicate registration
        if "attendee" in self.tokens and "test_event" in self.events and "regular" in self.tickets:
            registration_data = {
                "event_id": self.events["test_event"]["id"],
                "ticket_id": self.tickets["regular"]["id"]
            }
            success, response = self.make_request("POST", "register", registration_data,
                                                token=self.tokens["attendee"], expected_status=400)
            print(f"   Duplicate registration test - Success: {success}, Response: {response}")
            self.log_test("Duplicate registration blocked", success)

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
    
    # Run bug fix tests specifically
    success = tester.run_bug_fix_tests()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())