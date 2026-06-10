# Shipyard Internship Task — Authentication & Authorization

**Candidate:** Aflaha A  
**Task:** Authentication & Authorization (Task 2)  
**Stack:** Next.js · Express.js · SQLite

---

## Overview

JWT-based authentication with role-based access control (RBAC). Users are assigned roles (`dev`, `lead`, `admin`) at registration. Project routes are protected — only authenticated users can access them, and only owners or admins can update or delete.

## Project Structure

```
├── backend/        # Express.js API
├── frontend/       # Next.js UI
└── README.md
```

## Quick Start

### Backend
```bash
cd backend
npm install
cp .env.example .env    # set your JWT_SECRET
npm run seed            # create sample users & projects
npm run dev             # runs on http://localhost:5000
```

### Frontend
```bash
cd frontend
npm install
# create .env.local with: NEXT_PUBLIC_API_URL=http://localhost:5000/api
npm run dev             # runs on http://localhost:3000
```

## Sample Accounts

| Email | Password | Role |
|---|---|---|
| admin@shipyard.dev | admin123 | admin |
| lead@shipyard.dev | lead123 | lead |
| dev@shipyard.dev | dev123 | dev |

## Running Tests

```bash
cd backend
npm test        # 12 tests — auth + project endpoints
```
