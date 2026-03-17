# Task Manager

Multi-tenant Task Management Application with React + Node.js

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Run development (server + client)
npm run dev
```

- **Client:** http://localhost:5173
- **Server:** http://localhost:3001
- **API:** http://localhost:3001/api

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18 + TypeScript + Vite |
| Backend | Node.js + Express + TypeScript |
| Database | PostgreSQL / MySQL + Prisma |
| Auth | JWT (access + refresh tokens) |
| State | React Context + Axios |

## 📁 Project Structure

```
task-app/
├── client/                    # React frontend
│   ├── src/
│   │   ├── components/       # DashboardLayout, LogoutButton, ProtectedRoute
│   │   ├── context/          # AuthContext (auth state management)
│   │   ├── pages/            # Login, Register, TasksList
│   │   ├── services/         # API client with interceptors
│   │   └── App.tsx           # Routes + ProtectedRoute
│   └── package.json
│
├── server/                    # Express backend
│   ├── src/
│   │   ├── controllers/      # Auth controller
│   │   ├── routes/           # Auth routes
│   │   ├── services/         # Auth service + validation
│   │   ├── middlewares/      # JWT auth middleware
│   │   ├── utils/            # Validation helpers
│   │   └── tests/            # Unit tests
│   └── package.json
│
└── package.json               # Workspace config
```

## ✅ Features

### Authentication
- [x] Login / Register with validation
- [x] JWT access token (15 min) + refresh token (7 days)
- [x] HttpOnly cookies for refresh token (XSS safe)
- [x] Access token in memory (not localStorage)
- [x] Protected routes (redirect to login if not authenticated)
- [x] Logout functionality

### UI/UX
- [x] Enhanced Login page with gradient background
- [x] Password visibility toggle
- [x] "Remember me" checkbox
- [x] Error handling with visual feedback
- [x] Loading states

### Dashboard
- [x] DashboardLayout with sidebar navigation
- [x] Collapsible sidebar
- [x] Header with notifications & user info
- [x] Logout button in sidebar
- [x] Tasks list with filters (ALL/TODO/IN_PROGRESS/REVIEW/DONE)
- [x] Task cards with priority & status badges

### Security (Tested)
- [x] Password validation (8+ chars, uppercase, lowercase, number, special char)
- [x] Email validation
- [x] Rate limiting (configurable)
- [x] Helmet.js for security headers
- [x] CORS configuration
- [x] Input sanitization with Zod

## 🔐 Token Storage (Best Practice)

| Token | Storage | Security |
|-------|---------|----------|
| Access Token | Memory (JavaScript variable) | ✅ XSS cannot read |
| Refresh Token | HttpOnly Cookie | ✅ JS cannot access |
| User Data | localStorage | Backup only |

**Flow:**
1. Login → Server returns accessToken + sets refreshToken cookie
2. Access token stored in memory (not localStorage)
3. Refresh page → Read user from localStorage (fast), verify with /me endpoint
4. Token expiry → Auto-refresh via cookie (no JS needed)

## 🧪 Testing

```bash
# Run all tests
npm test

# Run server tests
cd server && npm test

# Run client tests  
cd client && npm test
```

## 🔧 Environment Variables

### Server (.env)
```env
NODE_ENV=development
PORT=3001
DATABASE_URL="mysql://user:password@localhost:3306/dbname"
JWT_SECRET=your-jwt-secret-32-chars
JWT_REFRESH_SECRET=your-refresh-secret-32-chars
CLIENT_URL=http://localhost:5173
```

### Client (.env)
```env
VITE_API_URL=http://localhost:3001/api
```

## 📝 API Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | /api/auth/login | Login | ❌ |
| POST | /api/auth/register | Register | ❌ |
| POST | /api/auth/refresh | Refresh token | ❌ (cookie) |
| GET | /api/auth/me | Get current user | ✅ |
| POST | /api/auth/logout | Logout | ✅ |

## 📄 License

MIT
