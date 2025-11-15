# Store Rating Platform - Backend

A robust Express.js backend API for a store rating and management platform with role-based access control and Supabase integration.

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL (via Supabase)
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcrypt
- **Environment Management**: dotenv
- **CORS**: Express CORS middleware

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client Layer                              │
│                    (React Frontend App)                           │
└────────────────────────────┬──────────────────────────────────────┘
                             │ HTTP/REST
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Express Server                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Routes     │  │  Middleware  │  │ Controllers  │          │
│  │  - Auth      │  │  - Auth      │  │  - Auth      │          │
│  │  - Users     │  │  - Validate  │  │  - Users     │          │
│  │  - Stores    │  │  - CORS      │  │  - Stores    │          │
│  │  - Ratings   │  └──────────────┘  │  - Ratings   │          │
│  └──────────────┘                    └──────────────┘          │
└────────────────────────────┬──────────────────────────────────────┘
                             │ Supabase Client
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Supabase (PostgreSQL)                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                       │
│  │  users   │  │  stores  │  │ ratings  │                       │
│  └──────────┘  └──────────┘  └──────────┘                       │
└─────────────────────────────────────────────────────────────────┘
```

## Project Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── database.js        # Supabase client configuration
│   │   └── supabase.js        # Alternative Supabase setup
│   ├── controllers/
│   │   ├── authController.js  # Authentication logic
│   │   ├── userController.js  # User management operations
│   │   ├── storeController.js # Store CRUD operations
│   │   └── ratingController.js # Rating submission & retrieval
│   ├── middleware/
│   │   ├── auth.js            # JWT verification & role checks
│   │   └── validation.js      # Input validation middleware
│   ├── routes/
│   │   ├── auth.js            # Authentication endpoints
│   │   ├── users.js           # User management routes
│   │   ├── stores.js          # Store management routes
│   │   └── ratings.js         # Rating routes
│   └── app.js                 # Express app configuration
├── server.js                  # Entry point
├── database.sql               # Database schema
├── .env                       # Environment variables
└── package.json               # Dependencies
```

## Database Schema

### Users Table
```sql
users (
  id UUID PRIMARY KEY,
  name VARCHAR(60),
  email VARCHAR(255) UNIQUE,
  password VARCHAR(255),
  address VARCHAR(400),
  role VARCHAR(50), -- system_admin, store_owner, normal_user
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

### Stores Table
```sql
stores (
  id UUID PRIMARY KEY,
  name VARCHAR(60),
  email VARCHAR(255),
  address VARCHAR(400),
  owner_id UUID REFERENCES users(id),
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

### Ratings Table
```sql
ratings (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  store_id UUID REFERENCES stores(id),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  UNIQUE(user_id, store_id)
)
```

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - User login

### Users
- `GET /api/users` - Get all users (Admin only)
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create new user (Admin only)
- `PUT /api/users/password` - Update password

### Stores
- `GET /api/stores` - Get all stores (with search & sort)
- `GET /api/stores/:id` - Get store details
- `POST /api/stores` - Create store (Admin only)

### Ratings
- `POST /api/ratings` - Submit/update rating
- `GET /api/ratings/store/:storeId` - Get store ratings
- `GET /api/ratings/store/:storeId/user` - Get user's rating for store

## Environment Variables

Create a `.env` file in the backend directory:

```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

PORT=5000
NODE_ENV=production

JWT_SECRET=your_secure_jwt_secret_key_here
JWT_EXPIRE=7d

API_URL=http://localhost:5000
CLIENT_URL=http://localhost:5173
```

## Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Supabase account

### Steps

1. **Clone the repository**
```bash
git clone <repository-url>
cd store-rating-web/backend
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure Supabase**
   - Create a new project on Supabase
   - Run the `database.sql` script in Supabase SQL Editor
   - Copy your project URL and API keys

4. **Set up environment variables**
   - Copy `.env.example` to `.env` (or create new)
   - Fill in your Supabase credentials
   - Generate a secure JWT secret

5. **Start the server**
```bash
npm start
```

Server will run on `http://localhost:5000`

## Development

```bash
npm run dev
```

## Role-Based Access Control

The system implements three user roles:

### System Admin (`system_admin`)
- Full access to all features
- Can create users and stores
- View all users and stores
- Access admin dashboard

### Store Owner (`store_owner`)
- View their own store statistics
- See ratings for their store
- View user details who rated their store
- Cannot create stores or users

### Normal User (`normal_user`)
- Browse and search stores
- Submit ratings (1-5 stars)
- Modify their own ratings
- View store details

## Security Features

- **Password Hashing**: bcrypt with salt rounds
- **JWT Authentication**: Secure token-based auth
- **Role-based Authorization**: Middleware protection
- **Input Validation**: Request data sanitization
- **CORS Configuration**: Controlled cross-origin access
- **SQL Injection Prevention**: Parameterized queries via Supabase

## Data Flow

```
User Registration Flow:
1. Client sends user data → /api/auth/signup
2. Validate input (name, email, password)
3. Hash password with bcrypt
4. Insert user into database
5. Generate JWT token
6. Return token + user info

Rating Submission Flow:
1. Authenticated user sends rating → /api/ratings
2. Verify JWT token
3. Check if rating exists (update) or new (insert)
4. Save rating to database
5. Update store's average rating
6. Return success response

Store Owner Dashboard:
1. Owner logs in with JWT
2. Fetch stores where owner_id = user_id
3. Calculate average rating from ratings table
4. Fetch all ratings with user details
5. Display statistics and user list
```

## Error Handling

The API returns consistent error responses:

```json
{
  "error": "Error message description"
}
```

Common HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

## Testing

Use tools like Postman or Thunder Client to test endpoints:

1. Register a user
2. Login to get JWT token
3. Add token to Authorization header: `Bearer <token>`
4. Test protected routes

## Deployment Considerations

- Set `NODE_ENV=production` in production
- Use strong JWT secrets (minimum 32 characters)
- Configure CORS for your production domain
- Enable HTTPS for secure communication
- Set up proper logging and monitoring
- Use environment-specific configurations

## Performance Optimizations

- Database indexes on frequently queried fields
- Connection pooling via Supabase
- Efficient query patterns (avoid N+1)
- Proper error handling to prevent crashes

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a pull request

## License

MIT License - See LICENSE file for details

## Support

For issues or questions, please open an issue on the repository.
