from fastapi import FastAPI, APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timedelta
import jwt
import bcrypt
import qrcode
import io
import base64
from enum import Enum

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT Configuration
JWT_SECRET = "event_management_secret_key_2025"
JWT_ALGORITHM = "HS256"
security = HTTPBearer()

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Enums
class UserRole(str, Enum):
    ORGANIZER = "organizer"
    ATTENDEE = "attendee"
    SPEAKER = "speaker"
    SPONSOR = "sponsor"
    VENUE_OWNER = "venue_owner"
    ADMIN = "admin"

class EventType(str, Enum):
    PHYSICAL = "physical"
    VIRTUAL = "virtual"
    HYBRID = "hybrid"

class TicketType(str, Enum):
    EARLY_BIRD = "early_bird"
    REGULAR = "regular"
    VIP = "vip"

# Models
class User(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: str
    password_hash: str
    role: UserRole
    name: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

class UserCreate(BaseModel):
    email: str
    password: str
    role: UserRole
    name: str

class UserLogin(BaseModel):
    email: str
    password: str

class Event(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    description: str
    event_type: EventType
    start_date: datetime
    end_date: datetime
    venue_id: Optional[str] = None
    virtual_link: Optional[str] = None
    organizer_id: str
    max_attendees: int = 100
    created_at: datetime = Field(default_factory=datetime.utcnow)
    is_published: bool = False

class EventCreate(BaseModel):
    title: str
    description: str
    event_type: EventType
    start_date: datetime
    end_date: datetime
    venue_id: Optional[str] = None
    virtual_link: Optional[str] = None
    max_attendees: int = 100

class Venue(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: str
    address: str
    capacity: int
    price_per_hour: float
    owner_id: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

class VenueCreate(BaseModel):
    name: str
    description: str
    address: str
    capacity: int
    price_per_hour: float

class VenueBooking(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    venue_id: str
    event_id: str
    start_time: datetime
    end_time: datetime
    status: str = "confirmed"
    total_cost: float
    created_at: datetime = Field(default_factory=datetime.utcnow)

class Ticket(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    event_id: str
    ticket_type: TicketType
    price: float
    quantity_available: int
    quantity_sold: int = 0
    created_at: datetime = Field(default_factory=datetime.utcnow)

class TicketCreate(BaseModel):
    event_id: str
    ticket_type: TicketType
    price: float
    quantity_available: int

class Registration(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    event_id: str
    attendee_id: str
    ticket_id: str
    registration_date: datetime = Field(default_factory=datetime.utcnow)
    payment_status: str = "pending"
    qr_code: Optional[str] = None

class RegistrationCreate(BaseModel):
    event_id: str
    ticket_id: str

# Utility Functions
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_jwt_token(user_id: str, role: str) -> str:
    payload = {
        "user_id": user_id,
        "role": role,
        "exp": datetime.utcnow() + timedelta(hours=24)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def verify_jwt_token(token: str) -> Dict[str, Any]:
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    payload = verify_jwt_token(token)
    user = await db.users.find_one({"id": payload["user_id"]})
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return User(**user)

def generate_qr_code(data: str) -> str:
    qr = qrcode.QRCode(version=1, box_size=10, border=5)
    qr.add_data(data)
    qr.make(fit=True)
    
    img = qr.make_image(fill_color="black", back_color="white")
    buffer = io.BytesIO()
    img.save(buffer, format='PNG')
    img_str = base64.b64encode(buffer.getvalue()).decode()
    return f"data:image/png;base64,{img_str}"

# Authentication Routes
@api_router.post("/auth/register")
async def register_user(user_data: UserCreate):
    # Check if user exists
    existing_user = await db.users.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create user
    hashed_password = hash_password(user_data.password)
    user = User(
        email=user_data.email,
        password_hash=hashed_password,
        role=user_data.role,
        name=user_data.name
    )
    
    await db.users.insert_one(user.dict())
    token = create_jwt_token(user.id, user.role.value)
    
    return {"token": token, "user": {"id": user.id, "email": user.email, "role": user.role, "name": user.name}}

@api_router.post("/auth/login")
async def login_user(login_data: UserLogin):
    user = await db.users.find_one({"email": login_data.email})
    if not user or not verify_password(login_data.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_jwt_token(user["id"], user["role"])
    return {"token": token, "user": {"id": user["id"], "email": user["email"], "role": user["role"], "name": user["name"]}}

@api_router.get("/auth/me")
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    return {"id": current_user.id, "email": current_user.email, "role": current_user.role, "name": current_user.name}

# Event Routes
@api_router.post("/events", response_model=Event)
async def create_event(event_data: EventCreate, current_user: User = Depends(get_current_user)):
    if current_user.role not in [UserRole.ORGANIZER, UserRole.ADMIN]:
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    
    event = Event(**event_data.dict(), organizer_id=current_user.id)
    await db.events.insert_one(event.dict())
    return event

@api_router.get("/events", response_model=List[Event])
async def get_events(current_user: User = Depends(get_current_user)):
    if current_user.role == UserRole.ORGANIZER:
        events = await db.events.find({"organizer_id": current_user.id}).to_list(1000)
    else:
        events = await db.events.find({"is_published": True}).to_list(1000)
    return [Event(**event) for event in events]

@api_router.get("/events/{event_id}", response_model=Event)
async def get_event(event_id: str, current_user: User = Depends(get_current_user)):
    event = await db.events.find_one({"id": event_id})
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    return Event(**event)

@api_router.put("/events/{event_id}")
async def update_event(event_id: str, event_data: EventCreate, current_user: User = Depends(get_current_user)):
    event = await db.events.find_one({"id": event_id})
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    if event["organizer_id"] != current_user.id and current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    
    await db.events.update_one({"id": event_id}, {"$set": event_data.dict()})
    updated_event = await db.events.find_one({"id": event_id})
    return Event(**updated_event)

@api_router.post("/events/{event_id}/publish")
async def publish_event(event_id: str, current_user: User = Depends(get_current_user)):
    event = await db.events.find_one({"id": event_id})
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    if event["organizer_id"] != current_user.id and current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    
    await db.events.update_one({"id": event_id}, {"$set": {"is_published": True}})
    return {"message": "Event published successfully"}

# Venue Routes
@api_router.post("/venues", response_model=Venue)
async def create_venue(venue_data: VenueCreate, current_user: User = Depends(get_current_user)):
    if current_user.role not in [UserRole.VENUE_OWNER, UserRole.ADMIN]:
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    
    venue = Venue(**venue_data.dict(), owner_id=current_user.id)
    await db.venues.insert_one(venue.dict())
    return venue

@api_router.get("/venues", response_model=List[Venue])
async def get_venues(current_user: User = Depends(get_current_user)):
    if current_user.role == UserRole.VENUE_OWNER:
        venues = await db.venues.find({"owner_id": current_user.id}).to_list(1000)
    else:
        venues = await db.venues.find().to_list(1000)
    return [Venue(**venue) for venue in venues]

@api_router.get("/venues/{venue_id}/availability")
async def check_venue_availability(venue_id: str, start_date: str, end_date: str, current_user: User = Depends(get_current_user)):
    # Check for conflicting bookings
    conflicts = await db.venue_bookings.find({
        "venue_id": venue_id,
        "$or": [
            {"start_time": {"$lte": end_date}, "end_time": {"$gte": start_date}}
        ]
    }).to_list(1000)
    
    return {"available": len(conflicts) == 0, "conflicts": len(conflicts)}

class VenueBookingRequest(BaseModel):
    start_time: datetime
    end_time: datetime
    event_id: str

@api_router.post("/venues/{venue_id}/book")
async def book_venue(venue_id: str, booking_request: VenueBookingRequest, current_user: User = Depends(get_current_user)):
    if current_user.role not in [UserRole.ORGANIZER, UserRole.ADMIN]:
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    
    # Check availability
    conflicts = await db.venue_bookings.find({
        "venue_id": venue_id,
        "$or": [
            {"start_time": {"$lte": booking_request.end_time}, "end_time": {"$gte": booking_request.start_time}}
        ]
    }).to_list(1000)
    
    if conflicts:
        raise HTTPException(status_code=400, detail="Venue not available for selected time")
    
    # Get venue details for cost calculation
    venue = await db.venues.find_one({"id": venue_id})
    if not venue:
        raise HTTPException(status_code=404, detail="Venue not found")
    
    duration_hours = (booking_request.end_time - booking_request.start_time).total_seconds() / 3600
    total_cost = duration_hours * venue["price_per_hour"]
    
    booking = VenueBooking(
        venue_id=venue_id,
        event_id=booking_request.event_id,
        start_time=booking_request.start_time,
        end_time=booking_request.end_time,
        total_cost=total_cost
    )
    
    await db.venue_bookings.insert_one(booking.dict())
    return booking

# Ticket Routes
@api_router.post("/tickets", response_model=Ticket)
async def create_ticket(ticket_data: TicketCreate, current_user: User = Depends(get_current_user)):
    if current_user.role not in [UserRole.ORGANIZER, UserRole.ADMIN]:
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    
    # Verify event ownership
    event = await db.events.find_one({"id": ticket_data.event_id})
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    if event["organizer_id"] != current_user.id and current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    
    ticket = Ticket(**ticket_data.dict())
    await db.tickets.insert_one(ticket.dict())
    return ticket

@api_router.get("/events/{event_id}/tickets", response_model=List[Ticket])
async def get_event_tickets(event_id: str, current_user: User = Depends(get_current_user)):
    tickets = await db.tickets.find({"event_id": event_id}).to_list(1000)
    return [Ticket(**ticket) for ticket in tickets]

# Registration Routes
@api_router.post("/register")
async def register_for_event(registration_data: RegistrationCreate, current_user: User = Depends(get_current_user)):
    if current_user.role not in [UserRole.ATTENDEE, UserRole.ADMIN]:
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    
    # Check if already registered
    existing_registration = await db.registrations.find_one({
        "event_id": registration_data.event_id,
        "attendee_id": current_user.id
    })
    if existing_registration:
        raise HTTPException(status_code=400, detail="Already registered for this event")
    
    # Check ticket availability
    ticket = await db.tickets.find_one({"id": registration_data.ticket_id})
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    
    if ticket["quantity_sold"] >= ticket["quantity_available"]:
        raise HTTPException(status_code=400, detail="Ticket sold out")
    
    # Create registration with QR code
    registration = Registration(
        event_id=registration_data.event_id,
        attendee_id=current_user.id,
        ticket_id=registration_data.ticket_id,
        payment_status="completed"  # Mock payment for MVP
    )
    
    # Generate QR code
    qr_data = f"EVENT:{registration_data.event_id}|USER:{current_user.id}|REG:{registration.id}"
    registration.qr_code = generate_qr_code(qr_data)
    
    await db.registrations.insert_one(registration.dict())
    
    # Update ticket sold count
    await db.tickets.update_one(
        {"id": registration_data.ticket_id},
        {"$inc": {"quantity_sold": 1}}
    )
    
    return registration

@api_router.get("/my-registrations")
async def get_my_registrations(current_user: User = Depends(get_current_user)):
    registrations = await db.registrations.find({"attendee_id": current_user.id}).to_list(1000)
    result = []
    
    for reg in registrations:
        # Convert ObjectId to string if needed
        if "_id" in reg:
            del reg["_id"]
            
        event = await db.events.find_one({"id": reg["event_id"]})
        if event and "_id" in event:
            del event["_id"]
            
        ticket = await db.tickets.find_one({"id": reg["ticket_id"]})
        if ticket and "_id" in ticket:
            del ticket["_id"]
            
        result.append({
            **reg,
            "event": event,
            "ticket": ticket
        })
    
    return result

@api_router.get("/events/{event_id}/registrations")
async def get_event_registrations(event_id: str, current_user: User = Depends(get_current_user)):
    # Check event ownership
    event = await db.events.find_one({"id": event_id})
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    if event["organizer_id"] != current_user.id and current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    
    registrations = await db.registrations.find({"event_id": event_id}).to_list(1000)
    result = []
    
    for reg in registrations:
        # Convert ObjectId to string if needed
        if "_id" in reg:
            del reg["_id"]
            
        user = await db.users.find_one({"id": reg["attendee_id"]})
        if user and "_id" in user:
            del user["_id"]
            
        ticket = await db.tickets.find_one({"id": reg["ticket_id"]})
        if ticket and "_id" in ticket:
            del ticket["_id"]
            
        result.append({
            **reg,
            "attendee": {"name": user["name"], "email": user["email"]} if user else None,
            "ticket": ticket
        })
    
    return result

# Dashboard Routes
@api_router.get("/dashboard/stats")
async def get_dashboard_stats(current_user: User = Depends(get_current_user)):
    stats = {}
    
    if current_user.role == UserRole.ORGANIZER:
        events_count = await db.events.count_documents({"organizer_id": current_user.id})
        published_events = await db.events.count_documents({"organizer_id": current_user.id, "is_published": True})
        
        # Get all event IDs for this organizer
        organizer_events = await db.events.find({"organizer_id": current_user.id}, {"id": 1}).to_list(1000)
        event_ids = [event["id"] for event in organizer_events]
        
        total_registrations = await db.registrations.count_documents({
            "event_id": {"$in": event_ids}
        })
        
        stats = {
            "total_events": events_count,
            "published_events": published_events,
            "total_registrations": total_registrations,
            "revenue": 0  # Will be calculated based on ticket sales
        }
    
    elif current_user.role == UserRole.ATTENDEE:
        my_registrations = await db.registrations.count_documents({"attendee_id": current_user.id})
        upcoming_events = await db.events.count_documents({
            "start_date": {"$gte": datetime.utcnow()},
            "is_published": True
        })
        
        stats = {
            "my_registrations": my_registrations,
            "upcoming_events": upcoming_events
        }
    
    elif current_user.role == UserRole.VENUE_OWNER:
        my_venues = await db.venues.count_documents({"owner_id": current_user.id})
        
        # Get all venue IDs for this owner
        owner_venues = await db.venues.find({"owner_id": current_user.id}, {"id": 1}).to_list(1000)
        venue_ids = [venue["id"] for venue in owner_venues]
        
        bookings = await db.venue_bookings.count_documents({
            "venue_id": {"$in": venue_ids}
        })
        
        stats = {
            "total_venues": my_venues,
            "total_bookings": bookings
        }
    
    return stats

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()