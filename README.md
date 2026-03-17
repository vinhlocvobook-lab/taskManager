# Task Manager

Multi-tenant Task Management Application with React + Node.js

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Node.js + Express + TypeScript
- **Database**: PostgreSQL + Prisma
- **Authentication**: JWT
- **State**: React Query + Zustand

## Features

- Multi-tenant architecture
- Task management (CRUD)
- Team collaboration
- Role-based access control
- Real-time updates (planned)

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 14+

### Installation

```bash
# Install dependencies
npm install

# Setup environment variables
cp server/.env.example server/.env
# Edit server/.env with your database credentials

# Setup database
cd server
npm run db:generate
npm run db:push

# Start development
npm run dev
```

### Running the App

- Frontend: http://localhost:5173
- Backend: http://localhost:3001

## Project Structure

```
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/   # Reusable components
│   │   ├── pages/        # Page components
│   │   ├── hooks/        # Custom hooks
│   │   ├── services/    # API calls
│   │   ├── stores/      # State management
│   │   ├── types/       # TypeScript types
│   │   └── utils/       # Utility functions
│   └── ...
│
├── server/                # Express backend
│   ├── src/
│   │   ├── controllers/  # Request handlers
│   │   ├── middlewares/ # Express middlewares
│   │   ├── services/    # Business logic
│   │   ├── routes/      # Route definitions
│   │   ├── types/       # TypeScript types
│   │   └── utils/       # Utility functions
│   ├── prisma/          # Database schema
│   └── ...
│
└── package.json          # Workspace root
```

## License

MIT