# Technical Documentation

## Architecture

```
Client (Next.js)
     │
     │  HTTP + Bearer token
     ▼
Express.js API
     │
     ├── /api/auth      → AuthController
     └── /api/projects  → ProjectController
                              │
                         authenticate middleware
                         authorizeOwnerOrAdmin middleware
                              │
                           SQLite DB
```

## Auth Flow

```
1. POST /api/auth/register  →  user created, role assigned
2. POST /api/auth/login     →  returns accessToken (15m) + refreshToken (7d)
3. Request with Bearer token → authenticate middleware verifies JWT
4. PUT/DELETE project       → authorizeOwnerOrAdmin checks ownership or admin role
5. POST /api/auth/refresh   →  returns new accessToken
6. POST /api/auth/logout    →  invalidates refreshToken
```

## API Reference

### Auth Endpoints

| Method | Endpoint | Auth | Body |
|---|---|---|---|
| POST | `/api/auth/register` | None | `name, email, password, role` |
| POST | `/api/auth/login` | None | `email, password` |
| POST | `/api/auth/refresh` | None | `refreshToken` |
| POST | `/api/auth/logout` | None | `refreshToken` |

### Project Endpoints

| Method | Endpoint | Auth | Access |
|---|---|---|---|
| GET | `/api/projects` | ✅ | Any authenticated user |
| GET | `/api/projects/:id` | ✅ | Any authenticated user |
| POST | `/api/projects` | ✅ | Any authenticated user |
| PUT | `/api/projects/:id` | ✅ | Owner or admin only |
| DELETE | `/api/projects/:id` | ✅ | Owner or admin only |

## Database Schema

```sql
users (
  id          INTEGER PRIMARY KEY,
  name        TEXT NOT NULL,
  email       TEXT UNIQUE NOT NULL,
  password    TEXT NOT NULL,            -- bcrypt hashed
  role        TEXT CHECK(role IN ('dev','lead','admin')),
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
)

projects (
  id          INTEGER PRIMARY KEY,
  name        TEXT NOT NULL,
  description TEXT,
  owner_id    INTEGER REFERENCES users(id),
  status      TEXT DEFAULT 'active',
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

## Modules

### `src/utils/jwt.js`
Signs and verifies JWTs. Access tokens expire in 15 minutes, refresh tokens in 7 days.

### `src/middleware/authenticate.js`
Validates `Authorization: Bearer <token>` header on every protected route. Returns 401 if missing, invalid, or expired.

### `src/middleware/authorize.js`
- `authorize(...roles)` — checks if user role is permitted
- `authorizeOwnerOrAdmin` — allows update/delete only if user owns the project or is an admin

### `src/controllers/authController.js`
Handles register, login, refresh, and logout. Refresh tokens are stored in-memory (Set) and deleted on logout.

### `src/controllers/projectController.js`
Full CRUD for projects with pagination support on list endpoint (`?page=1&limit=10`).

## Environment Variables

| Variable | Description | Example |
|---|---|---|
| `PORT` | API server port | `5000` |
| `JWT_SECRET` | Secret for signing JWTs | `your_secret_here` |
| `DB_PATH` | SQLite database file path | `./database/database.db` |

## Test Coverage

| Suite | Tests | Coverage |
|---|---|---|
| Auth | 5 | register, login, bad credentials, refresh, logout |
| Projects | 7 | auth guard, create, list, get, owner update, admin update, delete |