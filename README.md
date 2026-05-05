# Secure E-Commerce API

A production-ready Node.js REST API built with Express and MongoDB featuring JWT authentication, role-based access control, atomic stock management with transactions, and full input validation.

---

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Auth**: JWT (access + refresh tokens)
- **Validation**: Joi
- **Security**: bcryptjs, express-rate-limit

---

## Setup Instructions

### Prerequisites

- Node.js >= 18.x
- MongoDB >= 6.x (local or Atlas) — **must be a replica set for transactions**

### 1. Clone & Install

```bash
git clone <repo-url>
cd ecommerce-api
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` with your values:

```env
PORT=3000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/ecommerce
JWT_ACCESS_SECRET=change_this_to_a_long_random_string
JWT_REFRESH_SECRET=change_this_to_another_long_random_string
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
BCRYPT_SALT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
```

> ⚠️ **Important**: MongoDB transactions require a replica set. For local dev, start MongoDB as a replica set or use MongoDB Atlas.

### 3. Start the Server

```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

---

## Project Structure

```
src/
├── config/
│   └── db.js                  # MongoDB connection
├── controllers/
│   ├── authController.js
│   ├── productController.js
│   └── orderController.js
├── services/
│   ├── authService.js
│   ├── productService.js
│   └── orderService.js
├── models/
│   ├── User.js
│   ├── Product.js
│   └── Order.js
├── middleware/
│   ├── authMiddleware.js      # JWT verification
│   ├── roleMiddleware.js      # RBAC
│   ├── rateLimiter.js
│   ├── validate.js            # Joi validation factory
│   └── errorHandler.js        # Global error handler + AppError class
├── routes/
│   ├── authRoutes.js
│   ├── productRoutes.js
│   └── orderRoutes.js
├── utils/
│   ├── tokenUtils.js
│   └── responseUtils.js
├── validators/
│   ├── authValidator.js
│   ├── productValidator.js
│   └── orderValidator.js
├── app.js
└── server.js
```

---

## API Reference

All responses follow this format:

```json
{
  "success": true | false,
  "message": "...",
  "data": { ... }
}
```

---

### Auth Routes — `/api/auth`

| Method | Endpoint    | Auth     | Description                     |
|--------|-------------|----------|---------------------------------|
| POST   | `/register` | None     | Register a new user             |
| POST   | `/login`    | None     | Login and receive tokens        |
| POST   | `/refresh`  | None     | Refresh access token            |
| POST   | `/logout`   | Bearer   | Invalidate refresh token        |
| GET    | `/me`       | Bearer   | Get current user profile        |

#### POST `/api/auth/register`
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass1"
}
```

#### POST `/api/auth/login`
```json
{
  "email": "john@example.com",
  "password": "SecurePass1"
}
```
Response includes `accessToken` and `refreshToken`.

#### POST `/api/auth/refresh`
```json
{
  "refreshToken": "<refresh_token>"
}
```

---

### Product Routes — `/api/products`

| Method | Endpoint  | Auth        | Role  | Description              |
|--------|-----------|-------------|-------|--------------------------|
| GET    | `/`       | None        | —     | List all active products |
| GET    | `/:id`    | None        | —     | Get product by ID        |
| POST   | `/`       | Bearer      | Admin | Create product           |
| PATCH  | `/:id`    | Bearer      | Admin | Update product           |
| DELETE | `/:id`    | Bearer      | Admin | Soft-delete product      |

#### Query params for `GET /api/products`
- `category` — filter by category (case-insensitive)
- `page` — page number (default: 1)
- `limit` — results per page (default: 20)

#### POST/PATCH `/api/products` body
```json
{
  "name": "Wireless Headphones",
  "description": "Noise cancelling over-ear headphones",
  "price": 149.99,
  "stock": 50,
  "category": "Electronics"
}
```

---

### Order Routes — `/api/orders`

| Method | Endpoint  | Auth   | Role  | Description               |
|--------|-----------|--------|-------|---------------------------|
| POST   | `/`       | Bearer | User  | Place a new order         |
| GET    | `/my`     | Bearer | User  | Get own order history     |
| GET    | `/:id`    | Bearer | Any   | Get order by ID           |
| GET    | `/`       | Bearer | Admin | Get all orders            |

#### POST `/api/orders` body
```json
{
  "items": [
    { "productId": "664f1b2e...", "quantity": 2 },
    { "productId": "664f1b3a...", "quantity": 1 }
  ]
}
```

#### Query params for `GET /api/orders` (admin)
- `status` — filter by order status (`pending`, `confirmed`, `shipped`, `delivered`, `cancelled`)
- `page`, `limit`

---

## Security Notes

- Passwords hashed with bcrypt (12 rounds)
- Refresh tokens stored in DB; invalidated on logout
- Sensitive fields (`passwordHash`, `refreshToken`) never exposed in responses
- All inputs validated and sanitized via Joi
- Stock deduction uses atomic `$inc` with session transactions to prevent race conditions
- Price captured at order time (`priceAtPurchase`) — not recalculated from current price
- Rate limiting: 100 req/15min globally, 20 req/15min on auth endpoints

---

## Creating an Admin User

Register normally, then update the role directly in MongoDB:

```js
db.users.updateOne({ email: "admin@example.com" }, { $set: { role: "admin" } })
```
