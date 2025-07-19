#!/usr/bin/env python3
"""
Comprehensive Event Registration Flow Test
Specifically tests the "Failed to register for event" issue reported by user
"""

import requests
import sys
import json
from datetime import datetime, timedelta
from typing import Dict, Any, Optional

class RegistrationFlowTester:
    def __init__(self, base_url="https://ec27b79c-49a2-4c78-9908-239079600bcd.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.test_timestamp = datetime.now().strftime("%H%M%S")
        
        # Test results tracking
        self.tests_run = 0
        self.tests_passed = 0
        
        # Data storage
        self.organizer_token = None
        self.attendee_token = None
        self.venue_owner_token = None
        self.admin_token = None
        self.event_id = None
        self.venue_id = None
        self.ticket_id = None

    def log_test(self, name: str, success: bool, details: str = ""):
        """Log test results with detailed output"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name}")
        else:
            print(f"❌ {name}")
            if details:
                print(f"   Details: {details}")

    def make_request(self, method: str, endpoint: str, data: Optional[Dict] = None, 
                    token: Optional[str] = None, expected_status: int = 200) -> tuple[bool, Dict]:
        """Make HTTP request with detailed error reporting"""
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

            success = response.status_code == expected_status
            response_data = {}
            
            try:
                response_data = response.json()
            except:
                response_data = {"text": response.text, "status_code": response.status_code}

            if not success:
                print(f"   ⚠️ HTTP {response.status_code} (expected {expected_status})")
                print(f"   📄 Response: {json.dumps(response_data, indent=2)}")

            return success, response_data

        except Exception as e:
            print(f"   💥 Request failed: {str(e)}")
            return False, {"error": str(e)}

    def test_1_authentication_all_roles(self):
        """Test 1: Authentication for all user roles"""
        print("\n🔐 TEST 1: AUTHENTICATION FOR ALL USER ROLES")
        print("-" * 50)
        
        # Test organizer registration and login
        organizer_data = {
            "email": f"organizer_{self.test_timestamp}@eventsphere.com",
            "password": "SecurePass123!",
            "name": "Event Organizer",
            "role": "organizer"
        }
        
        success, response = self.make_request("POST", "auth/register", organizer_data)
        if success and "token" in response:
            self.organizer_token = response["token"]
            self.log_test("Organizer registration & JWT token", True)
        else:
            self.log_test("Organizer registration & JWT token", False, f"Response: {response}")
            
        # Test attendee registration and login
        attendee_data = {
            "email": f"attendee_{self.test_timestamp}@eventsphere.com",
            "password": "SecurePass123!",
            "name": "Event Attendee",
            "role": "attendee"
        }
        
        success, response = self.make_request("POST", "auth/register", attendee_data)
        if success and "token" in response:
            self.attendee_token = response["token"]
            self.log_test("Attendee registration & JWT token", True)
        else:
            self.log_test("Attendee registration & JWT token", False, f"Response: {response}")
            
        # Test venue owner registration
        venue_owner_data = {
            "email": f"venue_owner_{self.test_timestamp}@eventsphere.com",
            "password": "SecurePass123!",
            "name": "Venue Owner",
            "role": "venue_owner"
        }
        
        success, response = self.make_request("POST", "auth/register", venue_owner_data)
        if success and "token" in response:
            self.venue_owner_token = response["token"]
            self.log_test("Venue Owner registration & JWT token", True)
        else:
            self.log_test("Venue Owner registration & JWT token", False, f"Response: {response}")
            
        # Test admin registration
        admin_data = {
            "email": f"admin_{self.test_timestamp}@eventsphere.com",
            "password": "SecurePass123!",
            "name": "System Admin",
            "role": "admin"
        }
        
        success, response = self.make_request("POST", "auth/register", admin_data)
        if success and "token" in response:
            self.admin_token = response["token"]
            self.log_test("Admin registration & JWT token", True)
        else:
            self.log_test("Admin registration & JWT token", False, f"Response: {response}")

        # Verify JWT tokens work by getting user profiles
        for role, token in [("organizer", self.organizer_token), ("attendee", self.attendee_token), 
                           ("venue_owner", self.venue_owner_token), ("admin", self.admin_token)]:
            if token:
                success, profile = self.make_request("GET", "auth/me", token=token)
                self.log_test(f"JWT token verification for {role}", success and profile.get("role") == role)

    def test_2_venue_setup(self):
        """Test 2: Venue setup for events"""
        print("\n🏢 TEST 2: VENUE SETUP")
        print("-" * 50)
        
        if not self.venue_owner_token:
            self.log_test("Venue setup", False, "No venue owner token available")
            return
            
        venue_data = {
            "name": f"EventSphere Convention Center {self.test_timestamp}",
            "description": "A premium venue for corporate events and conferences",
            "address": "123 Business District, Tech City, TC 12345",
            "capacity": 500,
            "price_per_hour": 200.0
        }
        
        success, response = self.make_request("POST", "venues", venue_data, token=self.venue_owner_token)
        if success and "id" in response:
            self.venue_id = response["id"]
            self.log_test("Create test venue", True)
            
            # Verify venue is available for booking
            start_date = (datetime.now() + timedelta(days=1)).isoformat()
            end_date = (datetime.now() + timedelta(days=1, hours=3)).isoformat()
            
            success, availability = self.make_request("GET", 
                f"venues/{self.venue_id}/availability?start_date={start_date}&end_date={end_date}",
                token=self.venue_owner_token)
            self.log_test("Venue availability check", success and availability.get("available") == True)
        else:
            self.log_test("Create test venue", False, f"Response: {response}")

    def test_3_event_creation_flow(self):
        """Test 3: Complete event creation flow"""
        print("\n📅 TEST 3: EVENT CREATION FLOW")
        print("-" * 50)
        
        if not self.organizer_token:
            self.log_test("Event creation flow", False, "No organizer token available")
            return
            
        # Step 1: Create event with all required fields
        event_data = {
            "title": f"EventSphere Tech Conference {self.test_timestamp}",
            "description": "A comprehensive technology conference featuring the latest innovations in event management",
            "event_type": "hybrid",
            "start_date": (datetime.now() + timedelta(days=2)).isoformat(),
            "end_date": (datetime.now() + timedelta(days=2, hours=4)).isoformat(),
            "virtual_link": "https://zoom.us/j/eventsphere-tech-conf",
            "max_attendees": 300
        }
        
        # Add venue if available
        if self.venue_id:
            event_data["venue_id"] = self.venue_id
            
        success, response = self.make_request("POST", "events", event_data, token=self.organizer_token)
        if success and "id" in response:
            self.event_id = response["id"]
            self.log_test("Create complete event with all fields", True)
            
            # Step 2: Verify event is created but not published
            success, event = self.make_request("GET", f"events/{self.event_id}", token=self.organizer_token)
            is_unpublished = success and event.get("is_published") == False
            self.log_test("Event created as unpublished", is_unpublished)
            
            # Step 3: Publish the event so attendees can see it
            success, response = self.make_request("POST", f"events/{self.event_id}/publish", token=self.organizer_token)
            self.log_test("Publish event for attendees", success)
            
            # Step 4: Verify event is now published
            success, event = self.make_request("GET", f"events/{self.event_id}", token=self.organizer_token)
            is_published = success and event.get("is_published") == True
            self.log_test("Event successfully published", is_published)
            
        else:
            self.log_test("Create complete event with all fields", False, f"Response: {response}")

    def test_4_ticket_system(self):
        """Test 4: Ticket system setup and verification"""
        print("\n🎫 TEST 4: TICKET SYSTEM")
        print("-" * 50)
        
        if not self.organizer_token or not self.event_id:
            self.log_test("Ticket system", False, "Missing organizer token or event ID")
            return
            
        # Create tickets for the event
        ticket_types = [
            {"type": "early_bird", "price": 99.99, "quantity": 50},
            {"type": "regular", "price": 149.99, "quantity": 200},
            {"type": "vip", "price": 299.99, "quantity": 25}
        ]
        
        created_tickets = []
        for ticket_info in ticket_types:
            ticket_data = {
                "event_id": self.event_id,
                "ticket_type": ticket_info["type"],
                "price": ticket_info["price"],
                "quantity_available": ticket_info["quantity"]
            }
            
            success, response = self.make_request("POST", "tickets", ticket_data, token=self.organizer_token)
            if success and "id" in response:
                created_tickets.append(response)
                self.log_test(f"Create {ticket_info['type']} ticket", True)
                
                # Store regular ticket for registration test
                if ticket_info["type"] == "regular":
                    self.ticket_id = response["id"]
            else:
                self.log_test(f"Create {ticket_info['type']} ticket", False, f"Response: {response}")
        
        # Verify tickets are available via the correct endpoint
        success, tickets = self.make_request("GET", f"events/{self.event_id}/tickets", token=self.organizer_token)
        tickets_available = success and len(tickets) == len(ticket_types)
        self.log_test("Tickets available via /events/{event_id}/tickets", tickets_available)
        
        # Verify attendees can see tickets for published events
        if self.attendee_token:
            success, attendee_tickets = self.make_request("GET", f"events/{self.event_id}/tickets", token=self.attendee_token)
            self.log_test("Attendees can access tickets for published event", success and len(attendee_tickets) > 0)

    def test_5_registration_flow(self):
        """Test 5: Complete registration flow"""
        print("\n📝 TEST 5: REGISTRATION FLOW")
        print("-" * 50)
        
        if not self.attendee_token:
            self.log_test("Registration flow", False, "No attendee token available")
            return
            
        # Step 1: Attendee finds published events
        success, events = self.make_request("GET", "events", token=self.attendee_token)
        event_found = success and any(event.get("id") == self.event_id for event in events)
        self.log_test("Attendee can find published events", event_found)
        
        # Step 2: Attendee accesses specific event
        success, event = self.make_request("GET", f"events/{self.event_id}", token=self.attendee_token)
        self.log_test("Attendee can access published event details", success and event.get("id") == self.event_id)
        
        # Step 3: Attendee views available tickets
        success, tickets = self.make_request("GET", f"events/{self.event_id}/tickets", token=self.attendee_token)
        self.log_test("Attendee can view available tickets", success and len(tickets) > 0)
        
        if not self.ticket_id:
            self.log_test("Registration flow", False, "No ticket ID available for registration")
            return
            
        # Step 4: Attempt to register for event - THE CRITICAL TEST
        registration_data = {
            "event_id": self.event_id,
            "ticket_id": self.ticket_id
        }
        
        print(f"   🎯 CRITICAL TEST: POST /api/register")
        print(f"   📋 Registration Data: {json.dumps(registration_data, indent=6)}")
        
        success, response = self.make_request("POST", "register", registration_data, token=self.attendee_token)
        
        if success:
            self.log_test("✨ REGISTRATION SUCCESS - No 'Failed to register for event' error", True)
            
            # Verify registration details
            has_qr_code = "qr_code" in response and response["qr_code"].startswith("data:image/png;base64,")
            self.log_test("Registration includes QR code", has_qr_code)
            
            payment_completed = response.get("payment_status") == "completed"
            self.log_test("Payment status set to completed", payment_completed)
            
            # Step 5: Verify registration appears in attendee's list
            success, registrations = self.make_request("GET", "my-registrations", token=self.attendee_token)
            registration_found = success and any(reg.get("event_id") == self.event_id for reg in registrations)
            self.log_test("Registration appears in attendee's registration list", registration_found)
            
            # Step 6: Verify organizer can see the registration
            success, event_registrations = self.make_request("GET", f"events/{self.event_id}/registrations", token=self.organizer_token)
            organizer_sees_registration = success and len(event_registrations) > 0
            self.log_test("Organizer can see event registrations", organizer_sees_registration)
            
        else:
            self.log_test("❌ REGISTRATION FAILED - 'Failed to register for event' error reproduced", False, 
                         f"Error: {response}")
            
            # Detailed error analysis
            print(f"   🔍 ERROR ANALYSIS:")
            print(f"   📄 Full Response: {json.dumps(response, indent=6)}")
            if "detail" in response:
                print(f"   ⚠️ Error Message: {response['detail']}")

    def test_6_edge_cases_and_error_scenarios(self):
        """Test 6: Edge cases and error scenarios"""
        print("\n⚠️ TEST 6: EDGE CASES AND ERROR SCENARIOS")
        print("-" * 50)
        
        if not self.attendee_token or not self.event_id or not self.ticket_id:
            self.log_test("Edge cases test", False, "Missing required test data")
            return
            
        # Test 1: Duplicate registration (should fail)
        registration_data = {
            "event_id": self.event_id,
            "ticket_id": self.ticket_id
        }
        
        success, response = self.make_request("POST", "register", registration_data, 
                                            token=self.attendee_token, expected_status=400)
        self.log_test("Duplicate registration properly blocked", success and "already registered" in response.get("detail", "").lower())
        
        # Test 2: Invalid event ID
        invalid_registration = {
            "event_id": "invalid-event-id",
            "ticket_id": self.ticket_id
        }
        
        success, response = self.make_request("POST", "register", invalid_registration, 
                                            token=self.attendee_token, expected_status=404)
        self.log_test("Invalid event ID handled properly", success)
        
        # Test 3: Invalid ticket ID
        invalid_ticket_registration = {
            "event_id": self.event_id,
            "ticket_id": "invalid-ticket-id"
        }
        
        success, response = self.make_request("POST", "register", invalid_ticket_registration, 
                                            token=self.attendee_token, expected_status=404)
        self.log_test("Invalid ticket ID handled properly", success)
        
        # Test 4: Unauthorized registration (organizer trying to register)
        if self.organizer_token:
            success, response = self.make_request("POST", "register", registration_data, 
                                                token=self.organizer_token, expected_status=403)
            self.log_test("Unauthorized role registration blocked", success)

    def run_complete_registration_flow_test(self):
        """Run the complete registration flow test"""
        print("🎯 EVENTSPHERE REGISTRATION FLOW COMPREHENSIVE TEST")
        print("=" * 70)
        print(f"🌐 Testing against: {self.base_url}")
        print(f"⏰ Test timestamp: {self.test_timestamp}")
        print("=" * 70)
        
        try:
            self.test_1_authentication_all_roles()
            self.test_2_venue_setup()
            self.test_3_event_creation_flow()
            self.test_4_ticket_system()
            self.test_5_registration_flow()
            self.test_6_edge_cases_and_error_scenarios()
            
        except Exception as e:
            print(f"\n💥 Test suite failed with error: {str(e)}")
            import traceback
            traceback.print_exc()
            return False
        
        # Print final results
        print("\n" + "=" * 70)
        print(f"📊 FINAL TEST RESULTS: {self.tests_passed}/{self.tests_run} tests passed")
        
        if self.tests_passed == self.tests_run:
            print("🎉 ALL TESTS PASSED! Registration flow is working correctly.")
            print("✅ The 'Failed to register for event' issue has been resolved.")
            return True
        else:
            failed_tests = self.tests_run - self.tests_passed
            print(f"⚠️ {failed_tests} test(s) failed. Registration flow issues detected.")
            return False

def main():
    """Main test runner"""
    tester = RegistrationFlowTester()
    success = tester.run_complete_registration_flow_test()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())