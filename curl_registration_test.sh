#!/bin/bash
# EventSphere Registration Flow - Detailed CURL Commands
# This script demonstrates the complete working registration flow

API_URL="https://9188a822-213b-4464-95ad-4107bf6d16dc.preview.emergentagent.com/api"
TIMESTAMP=$(date +%H%M%S)

echo "🎯 EVENTSPHERE REGISTRATION FLOW - CURL COMMANDS DEMONSTRATION"
echo "=============================================================="
echo "API URL: $API_URL"
echo "Timestamp: $TIMESTAMP"
echo ""

# Step 1: Register Organizer
echo "🔐 STEP 1: REGISTER ORGANIZER"
echo "curl -X POST $API_URL/auth/register \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -d '{"
echo "    \"email\": \"organizer_$TIMESTAMP@eventsphere.com\","
echo "    \"password\": \"SecurePass123!\","
echo "    \"name\": \"Event Organizer\","
echo "    \"role\": \"organizer\""
echo "  }'"
echo ""

ORGANIZER_RESPONSE=$(curl -s -X POST "$API_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"organizer_$TIMESTAMP@eventsphere.com\",
    \"password\": \"SecurePass123!\",
    \"name\": \"Event Organizer\",
    \"role\": \"organizer\"
  }")

ORGANIZER_TOKEN=$(echo $ORGANIZER_RESPONSE | jq -r '.token')
echo "✅ Organizer Response: $ORGANIZER_RESPONSE"
echo "🔑 Organizer Token: $ORGANIZER_TOKEN"
echo ""

# Step 2: Register Attendee
echo "🔐 STEP 2: REGISTER ATTENDEE"
echo "curl -X POST $API_URL/auth/register \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -d '{"
echo "    \"email\": \"attendee_$TIMESTAMP@eventsphere.com\","
echo "    \"password\": \"SecurePass123!\","
echo "    \"name\": \"Event Attendee\","
echo "    \"role\": \"attendee\""
echo "  }'"
echo ""

ATTENDEE_RESPONSE=$(curl -s -X POST "$API_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"attendee_$TIMESTAMP@eventsphere.com\",
    \"password\": \"SecurePass123!\",
    \"name\": \"Event Attendee\",
    \"role\": \"attendee\"
  }")

ATTENDEE_TOKEN=$(echo $ATTENDEE_RESPONSE | jq -r '.token')
echo "✅ Attendee Response: $ATTENDEE_RESPONSE"
echo "🔑 Attendee Token: $ATTENDEE_TOKEN"
echo ""

# Step 3: Create Event as Organizer
echo "📅 STEP 3: CREATE EVENT AS ORGANIZER"
echo "curl -X POST $API_URL/events \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -H 'Authorization: Bearer $ORGANIZER_TOKEN' \\"
echo "  -d '{"
echo "    \"title\": \"EventSphere Tech Conference $TIMESTAMP\","
echo "    \"description\": \"A comprehensive technology conference\","
echo "    \"event_type\": \"hybrid\","
echo "    \"start_date\": \"$(date -d '+2 days' -Iseconds)\","
echo "    \"end_date\": \"$(date -d '+2 days +4 hours' -Iseconds)\","
echo "    \"virtual_link\": \"https://zoom.us/j/eventsphere-tech-conf\","
echo "    \"max_attendees\": 300"
echo "  }'"
echo ""

EVENT_RESPONSE=$(curl -s -X POST "$API_URL/events" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ORGANIZER_TOKEN" \
  -d "{
    \"title\": \"EventSphere Tech Conference $TIMESTAMP\",
    \"description\": \"A comprehensive technology conference\",
    \"event_type\": \"hybrid\",
    \"start_date\": \"$(date -d '+2 days' -Iseconds)\",
    \"end_date\": \"$(date -d '+2 days +4 hours' -Iseconds)\",
    \"virtual_link\": \"https://zoom.us/j/eventsphere-tech-conf\",
    \"max_attendees\": 300
  }")

EVENT_ID=$(echo $EVENT_RESPONSE | jq -r '.id')
echo "✅ Event Response: $EVENT_RESPONSE"
echo "🎫 Event ID: $EVENT_ID"
echo ""

# Step 4: Publish Event
echo "📢 STEP 4: PUBLISH EVENT"
echo "curl -X POST $API_URL/events/$EVENT_ID/publish \\"
echo "  -H 'Authorization: Bearer $ORGANIZER_TOKEN'"
echo ""

PUBLISH_RESPONSE=$(curl -s -X POST "$API_URL/events/$EVENT_ID/publish" \
  -H "Authorization: Bearer $ORGANIZER_TOKEN")

echo "✅ Publish Response: $PUBLISH_RESPONSE"
echo ""

# Step 5: Create Tickets
echo "🎫 STEP 5: CREATE TICKETS"
echo "curl -X POST $API_URL/tickets \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -H 'Authorization: Bearer $ORGANIZER_TOKEN' \\"
echo "  -d '{"
echo "    \"event_id\": \"$EVENT_ID\","
echo "    \"ticket_type\": \"regular\","
echo "    \"price\": 149.99,"
echo "    \"quantity_available\": 200"
echo "  }'"
echo ""

TICKET_RESPONSE=$(curl -s -X POST "$API_URL/tickets" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ORGANIZER_TOKEN" \
  -d "{
    \"event_id\": \"$EVENT_ID\",
    \"ticket_type\": \"regular\",
    \"price\": 149.99,
    \"quantity_available\": 200
  }")

TICKET_ID=$(echo $TICKET_RESPONSE | jq -r '.id')
echo "✅ Ticket Response: $TICKET_RESPONSE"
echo "🎟️ Ticket ID: $TICKET_ID"
echo ""

# Step 6: Attendee Views Published Events
echo "👀 STEP 6: ATTENDEE VIEWS PUBLISHED EVENTS"
echo "curl -X GET $API_URL/events \\"
echo "  -H 'Authorization: Bearer $ATTENDEE_TOKEN'"
echo ""

EVENTS_RESPONSE=$(curl -s -X GET "$API_URL/events" \
  -H "Authorization: Bearer $ATTENDEE_TOKEN")

echo "✅ Events Response: $EVENTS_RESPONSE"
echo ""

# Step 7: Attendee Views Event Tickets
echo "🎟️ STEP 7: ATTENDEE VIEWS EVENT TICKETS"
echo "curl -X GET $API_URL/events/$EVENT_ID/tickets \\"
echo "  -H 'Authorization: Bearer $ATTENDEE_TOKEN'"
echo ""

TICKETS_RESPONSE=$(curl -s -X GET "$API_URL/events/$EVENT_ID/tickets" \
  -H "Authorization: Bearer $ATTENDEE_TOKEN")

echo "✅ Tickets Response: $TICKETS_RESPONSE"
echo ""

# Step 8: THE CRITICAL TEST - REGISTER FOR EVENT
echo "🎯 STEP 8: THE CRITICAL TEST - REGISTER FOR EVENT"
echo "curl -X POST $API_URL/register \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -H 'Authorization: Bearer $ATTENDEE_TOKEN' \\"
echo "  -d '{"
echo "    \"event_id\": \"$EVENT_ID\","
echo "    \"ticket_id\": \"$TICKET_ID\""
echo "  }'"
echo ""

REGISTRATION_RESPONSE=$(curl -s -X POST "$API_URL/register" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ATTENDEE_TOKEN" \
  -d "{
    \"event_id\": \"$EVENT_ID\",
    \"ticket_id\": \"$TICKET_ID\"
  }")

echo "✅ Registration Response: $REGISTRATION_RESPONSE"

# Check if registration was successful
if echo "$REGISTRATION_RESPONSE" | jq -e '.qr_code' > /dev/null; then
    echo ""
    echo "🎉 SUCCESS! Registration completed successfully!"
    echo "✅ QR Code generated"
    echo "✅ Payment status: $(echo $REGISTRATION_RESPONSE | jq -r '.payment_status')"
    echo "✅ Registration ID: $(echo $REGISTRATION_RESPONSE | jq -r '.id')"
else
    echo ""
    echo "❌ FAILED! Registration failed with error:"
    echo "$REGISTRATION_RESPONSE"
fi

echo ""

# Step 9: Verify Registration in Attendee's List
echo "📋 STEP 9: VERIFY REGISTRATION IN ATTENDEE'S LIST"
echo "curl -X GET $API_URL/my-registrations \\"
echo "  -H 'Authorization: Bearer $ATTENDEE_TOKEN'"
echo ""

MY_REGISTRATIONS_RESPONSE=$(curl -s -X GET "$API_URL/my-registrations" \
  -H "Authorization: Bearer $ATTENDEE_TOKEN")

echo "✅ My Registrations Response: $MY_REGISTRATIONS_RESPONSE"
echo ""

echo "=============================================================="
echo "🏁 REGISTRATION FLOW TEST COMPLETE"
echo "=============================================================="