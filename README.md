# EventSphere - Offline Event Management System

![EventSphere Logo](frontend/public/logo.svg)

**EventSphere** is a comprehensive, offline-first event management system that provides complete event lifecycle management for organizers, venues, and attendees. The application features bilingual support (English/Arabic), dark theme, and works entirely offline on your local machine.

## 🌟 Features

### Core Event Management
- **Event Creation & Management** - Create, edit, and publish events with detailed scheduling
- **Venue Management** - Manage venues with booking calendar and availability checking
- **Ticket System** - Multi-tier ticket types (Early Bird, Regular, VIP) with sales tracking
- **Registration System** - User registration with QR code generation for check-ins
- **Role-Based Access Control** - Supports organizers, attendees, speakers, sponsors, venue owners, and admins

### User Experience
- **Bilingual Support** - Full English and Arabic localization with RTL layout
- **Dark/Light Theme** - Responsive theme switching with elegant transitions
- **Professional UI** - Modern Tailwind CSS design with consistent branding
- **Responsive Design** - Works perfectly on desktop, tablet, and mobile devices

### Technical Features
- **Offline-First** - Runs completely offline with no internet dependencies
- **Real-time Updates** - Live dashboard statistics and event management
- **QR Code Generation** - Automatic QR codes for event check-ins
- **JWT Authentication** - Secure user authentication and session management
- **MongoDB Integration** - Robust data storage with efficient querying

## 🚀 Quick Start

### Prerequisites

Before running EventSphere, ensure you have the following installed:

1. **Node.js** (v16 or higher)
   - Download from: https://nodejs.org/
   - Verify installation: `node --version` and `npm --version`

2. **Python** (v3.8 or higher)
   - Download from: https://python.org/
   - Verify installation: `python --version` or `python3 --version`

3. **MongoDB** (v5.0 or higher)
   - **Ubuntu/Debian**: `sudo apt-get install mongodb`
   - **macOS**: `brew install mongodb/brew/mongodb-community`
   - **Windows**: Download from https://www.mongodb.com/try/download/community
   - Verify installation: `mongod --version`

4. **Yarn** (Package Manager)
   - Install: `npm install -g yarn`
   - Verify installation: `yarn --version`

### Installation Steps

1. **Clone or Download** the EventSphere project to your local machine

2. **Install Backend Dependencies**
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

3. **Install Frontend Dependencies**
   ```bash
   cd frontend
   yarn install
   ```

4. **Start MongoDB**
   ```bash
   # Ubuntu/Debian/macOS
   sudo systemctl start mongod
   # or
   mongod --dbpath /path/to/your/db/directory
   
   # Windows
   net start MongoDB
   ```

5. **Configure Environment Variables**
   
   The application is already configured for offline use with these settings:
   
   **Backend** (`backend/.env`):
   ```
   MONGO_URL="mongodb://localhost:27017"
   DB_NAME="test_database"
   ```
   
   **Frontend** (`frontend/.env`):
   ```
   REACT_APP_BACKEND_URL=http://localhost:8001
   WDS_SOCKET_PORT=3000
   ```

6. **Start the Application**
   
   **Option 1: Using Supervisor (Recommended)**
   ```bash
   # Start all services
   sudo supervisorctl start all
   
   # Check status
   sudo supervisorctl status
   
   # Stop all services
   sudo supervisorctl stop all
   ```
   
   **Option 2: Manual Start**
   ```bash
   # Terminal 1 - Backend
   cd backend
   uvicorn server:app --host 0.0.0.0 --port 8001 --reload
   
   # Terminal 2 - Frontend  
   cd frontend
   yarn start
   
   # Terminal 3 - MongoDB (if not running as service)
   mongod
   ```

7. **Access the Application**
   - **Frontend**: http://localhost:3000
   - **Backend API**: http://localhost:8001
   - **API Documentation**: http://localhost:8001/docs

## 🏗️ Architecture Overview

```
EventSphere Architecture
├── Frontend (React + Tailwind CSS)
│   ├── Port: 3000
│   ├── Bilingual Support (EN/AR)
│   ├── Dark/Light Theme
│   └── Responsive Design
├── Backend (FastAPI + Python)
│   ├── Port: 8001
│   ├── JWT Authentication
│   ├── Role-Based Access Control
│   └── RESTful API
└── Database (MongoDB)
    ├── Port: 27017
    ├── Collections: users, events, venues, tickets, registrations
    └── Local Storage
```

## 📋 User Roles & Permissions

### 🎯 Organizer
- Create and manage events
- Set up ticket tiers and pricing
- View registration statistics
- Manage event publishing
- Book venues for events

### 🏢 Venue Owner
- Create and manage venues
- Set venue pricing and availability
- View booking calendar
- Manage venue details

### 🎫 Attendee
- Browse and register for events
- View personal registration history
- Generate QR codes for check-ins
- Access event details

### 🎤 Speaker
- View assigned events
- Access speaker-specific features
- Manage speaker profiles

### 💼 Sponsor
- View sponsored events
- Access sponsor-specific features
- Manage sponsor profiles

### 👑 Admin
- Full system access
- Manage all users and events
- System administration
- Override permissions

## 🔧 Development & Customization

### File Structure
```
EventSphere/
├── backend/
│   ├── server.py          # Main FastAPI application
│   ├── requirements.txt   # Python dependencies
│   └── .env              # Backend configuration
├── frontend/
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── contexts/     # React contexts (Theme, Language)
│   │   ├── translations/ # Bilingual content
│   │   └── App.js       # Main React app
│   ├── public/          # Static assets
│   ├── package.json     # Frontend dependencies
│   └── .env            # Frontend configuration
├── tests/              # Test files
└── README.md          # This file
```

### Key Components

**Backend (FastAPI)**
- `server.py` - Main application with all API endpoints
- JWT authentication with role-based access control
- MongoDB integration using Motor (async driver)
- QR code generation for registrations
- CORS enabled for frontend communication

**Frontend (React)**
- `LanguageContext.js` - Bilingual support system
- `ThemeContext.js` - Dark/light theme switching
- `Navigation.js` - Main navigation with role-based menus
- `Dashboard.js` - Role-specific dashboards
- `EventWizard.js` - Step-by-step event creation
- `VenueManager.js` - Venue management interface
- `RegistrationPage.js` - Event registration with QR codes

### Adding New Features

1. **Backend API Endpoints**
   - Add new routes in `server.py`
   - Follow existing patterns for authentication and permissions
   - Update models as needed

2. **Frontend Components**
   - Create new components in `src/components/`
   - Add translations in `src/translations/index.js`
   - Update routing in `App.js`

3. **Database Changes**
   - MongoDB is schema-flexible
   - Add new collections as needed
   - Update models in `server.py`

## 🌐 Localization

EventSphere supports full bilingual operation:

### English (Default)
- Left-to-right layout
- Standard typography
- English navigation and content

### Arabic
- Right-to-left (RTL) layout
- Arabic typography with Cairo font
- Complete Arabic translations
- RTL-aware styling

### Adding New Languages

1. Add translations to `frontend/src/translations/index.js`
2. Update `LanguageContext.js` to include new language
3. Add language option to `LanguageSwitcher.js`
4. Test RTL support if needed

## 🎨 Theming

### Light Theme (Default)
- Clean, modern appearance
- High contrast for readability
- Professional color scheme

### Dark Theme
- Elegant dark interface
- Reduced eye strain
- Smooth transitions

### Customizing Themes

1. Update `frontend/src/App.css` for global styles
2. Modify `ThemeContext.js` for theme logic
3. Update component classes for theme-specific styling

## 🔒 Security Features

- **JWT Token Authentication** - Secure session management
- **Password Hashing** - Bcrypt for secure password storage
- **Role-Based Access Control** - Granular permissions
- **Input Validation** - Pydantic models for data validation
- **CORS Configuration** - Controlled cross-origin requests

## 🐛 Troubleshooting

### Common Issues

#### Backend Won't Start
```bash
# Check MongoDB connection
mongo --eval "db.runCommand('ping')"

# Check port availability
lsof -i :8001

# Check Python dependencies
pip list | grep fastapi
```

#### Frontend Won't Load
```bash
# Check Node.js version
node --version  # Should be v16+

# Clear cache and reinstall
rm -rf node_modules package-lock.json
yarn install

# Check port availability
lsof -i :3000
```

#### MongoDB Connection Issues
```bash
# Check MongoDB status
sudo systemctl status mongod

# Start MongoDB
sudo systemctl start mongod

# Check MongoDB logs
sudo journalctl -u mongod
```

#### Authentication Problems
```bash
# Check JWT tokens in browser developer tools
# Clear localStorage and cookies
# Verify backend .env configuration
```

### Performance Optimization

1. **Database Indexes**
   ```bash
   # Connect to MongoDB
   mongo
   use test_database
   
   # Add indexes for better performance
   db.events.createIndex({"organizer_id": 1})
   db.registrations.createIndex({"event_id": 1})
   db.venues.createIndex({"owner_id": 1})
   ```

2. **Frontend Optimization**
   - Enable React strict mode
   - Use production build: `yarn build`
   - Implement lazy loading for large components

## 📊 Database Schema

### Users Collection
```javascript
{
  id: "uuid",
  email: "user@example.com",
  password_hash: "hashed_password",
  role: "organizer|attendee|speaker|sponsor|venue_owner|admin",
  name: "User Name",
  created_at: "2025-01-01T00:00:00Z"
}
```

### Events Collection
```javascript
{
  id: "uuid",
  title: "Event Title",
  description: "Event Description",
  event_type: "physical|virtual|hybrid",
  start_date: "2025-01-01T00:00:00Z",
  end_date: "2025-01-01T23:59:59Z",
  venue_id: "uuid",
  virtual_link: "https://...",
  organizer_id: "uuid",
  max_attendees: 100,
  is_published: true,
  created_at: "2025-01-01T00:00:00Z"
}
```

### Venues Collection
```javascript
{
  id: "uuid",
  name: "Venue Name",
  description: "Venue Description",
  address: "Venue Address",
  capacity: 200,
  price_per_hour: 100.00,
  owner_id: "uuid",
  created_at: "2025-01-01T00:00:00Z"
}
```

## 🧪 Testing

### Manual Testing Checklist

1. **User Registration & Login**
   - [ ] Register new users with different roles
   - [ ] Login with valid credentials
   - [ ] Test invalid login attempts
   - [ ] Verify JWT token generation

2. **Event Management**
   - [ ] Create new events as organizer
   - [ ] Edit event details
   - [ ] Publish/unpublish events
   - [ ] View event statistics

3. **Venue Management**
   - [ ] Create venues as venue owner
   - [ ] Check venue availability
   - [ ] Book venues for events
   - [ ] View booking calendar

4. **Registration System**
   - [ ] Register for events as attendee
   - [ ] Generate QR codes
   - [ ] View registration history
   - [ ] Test ticket availability

5. **Bilingual Support**
   - [ ] Switch between English and Arabic
   - [ ] Verify RTL layout in Arabic
   - [ ] Test all translations
   - [ ] Check font rendering

6. **Theme Switching**
   - [ ] Toggle between light and dark themes
   - [ ] Verify theme persistence
   - [ ] Test theme in all components
   - [ ] Check accessibility

## 🔄 Backup & Restore

### Database Backup
```bash
# Create backup
mongodump --db test_database --out /path/to/backup

# Restore backup
mongorestore --db test_database /path/to/backup/test_database
```

### Application Backup
```bash
# Backup entire application
tar -czf eventsphere-backup.tar.gz /path/to/EventSphere/

# Restore application
tar -xzf eventsphere-backup.tar.gz
```

## 🆘 Support

For issues or questions:

1. **Check the troubleshooting section above**
2. **Review the console logs** in browser developer tools
3. **Check MongoDB logs** for database issues
4. **Verify all prerequisites** are properly installed
5. **Test with fresh database** if data issues occur

## 📝 License

This project is for educational and personal use. Modify and distribute as needed.

## 🎯 Future Enhancements

Potential features for future development:

- **Payment Integration** - Real payment processing
- **Email Notifications** - Event reminders and confirmations
- **Calendar Integration** - Google Calendar/Outlook sync
- **Advanced Analytics** - Detailed event performance metrics
- **Mobile App** - React Native companion app
- **API Documentation** - Enhanced OpenAPI documentation
- **Multi-tenant Support** - Multiple organization support
- **Advanced Search** - Full-text search capabilities
- **File Upload** - Event images and documents
- **Chat System** - Real-time event communication

---

**EventSphere** - Your Complete Event Universe 🌟
*Where Ideas Become Experiences*
