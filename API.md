# Service Marketplace - API Documentation

## Base URL

```
http://localhost:3000/api
```

> Note: This document covers the core endpoints. Additional endpoints exist for admin, notifications, disputes, and uploads.

## Authentication

The app uses a **httpOnly auth cookie** for browser sessions. For external clients, you can also pass a JWT via the `Authorization` header:

```
Authorization: Bearer <token>
```

Login/register set the cookie automatically. The JSON response still includes a token for API clients.

---

## Authentication Endpoints

### POST `/auth/register`

Register a new account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword",
  "name": "John Doe"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user-id",
      "name": "John Doe",
      "email": "user@example.com"
    },
    "token": "jwt-token"
  },
  "message": "Registered successfully"
}
```

### POST `/auth/login`

Login to existing account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

### POST `/auth/logout`

Clears the auth cookie.

**Response (200):**
```json
{
  "success": true,
  "data": { "loggedOut": true }
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user-id",
      "name": "John Doe",
      "email": "user@example.com"
    },
    "token": "jwt-token"
  }
}
```

### GET `/auth/me`

Get current authenticated user. Requires authentication.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "user-id",
    "name": "John Doe",
    "email": "user@example.com",
    "role": "USER",
    "profile": { ... },
    "sellerProfile": { ... }
  }
}
```

---

## Services Endpoints

### GET `/services/search`

Search and filter services. No authentication required.

**Query Parameters:**
- `search`: String - Search in title/description
- `category`: String - Filter by category ID
- `priceMin`: Number - Minimum price
- `priceMax`: Number - Maximum price
- `sortBy`: String - `newest`, `popular`, `price-asc`, `price-desc`
- `page`: Number - Page number (default: 1)
- `limit`: Number - Items per page (default: 10)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "services": [ ... ],
    "total": 50,
    "page": 1,
    "limit": 10,
    "totalPages": 5
  }
}
```

### GET `/services/[id]`

Get service details. No authentication required.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "service-id",
    "title": "Web Development",
    "description": "Custom web apps",
    "price": 5000,
    "images": ["url1", "url2"],
    "user": { ... },
    "category": { ... },
    "reviews": [ ... ]
  }
}
```

### POST `/services`

Create a new service. Requires authentication.

**Request Body:**
```json
{
  "title": "Web Development",
  "description": "Full stack web development services",
  "price": 5000,
  "categoryId": "category-id",
  "images": ["https://example.com/image.jpg"]
}
```

**Response (201):**
```json
{
  "success": true,
  "data": { ... },
  "message": "Service created"
}
```

### PUT `/services/[id]`

Update a service. Requires authentication and ownership.

**Request Body:** (Same as POST, all fields optional)

**Response (200):**
```json
{
  "success": true,
  "data": { ... }
}
```

### DELETE `/services/[id]`

Delete a service. Requires authentication and ownership.

**Response (200):**
```json
{
  "success": true,
  "message": "Service deleted"
}
```

---

## Utility

### GET `/health`

Simple health check.

**Response (200):**
```json
{
  "success": true,
  "data": { "status": "ok" }
}
```

## Categories Endpoints

### GET `/categories`

Get all service categories. No authentication required.

**Response (200):**
```json
{
  "success": true,
  "data": [
    { "id": "1", "name": "Web Development", "slug": "web-development" },
    { "id": "2", "name": "Design", "slug": "design" }
  ]
}
```

---

## Orders Endpoints

### POST `/orders/create`

Create a new order. Requires authentication.

**Request Body:**
```json
{
  "items": [
    { "serviceId": "service-id", "quantity": 1 }
  ],
  "sellerId": "seller-id",
  "paymentMethodId": "stripe-payment-method-id"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": { ... },
  "message": "Order created"
}
```

### GET `/orders`

Get user's orders. Requires authentication.

**Query Parameters:**
- `type`: String - `buyer` or `seller` (default: buyer)
- `page`: Number (default: 1)
- `limit`: Number (default: 10)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "orders": [ ... ],
    "total": 25,
    "page": 1,
    "limit": 10,
    "totalPages": 3
  }
}
```

### GET `/orders/[id]`

Get order details. Requires authentication (buyer or seller).

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "order-id",
    "status": "PAID",
    "totalAmount": 5000,
    "commissionAmount": 500,
    "sellerAmount": 4500,
    "buyer": { ... },
    "seller": { ... },
    "items": [ ... ]
  }
}
```

### PUT `/orders/[id]`

Update order status. Requires authentication and seller ownership.

**Request Body:**
```json
{
  "status": "IN_PROGRESS"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": { ... }
}
```

---

## Messaging Endpoints

### GET `/conversations`

Get user's conversations. Requires authentication.

**Query Parameters:**
- `page`: Number (default: 1)
- `limit`: Number (default: 20)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "conversations": [ ... ],
    "total": 10,
    "page": 1,
    "limit": 20,
    "totalPages": 1
  }
}
```

### GET `/conversations/[id]`

Get messages in conversation. Requires authentication.

**Query Parameters:**
- `page`: Number (default: 1)
- `limit`: Number (default: 50)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "messages": [ ... ],
    "total": 100,
    "page": 1,
    "limit": 50,
    "totalPages": 2
  }
}
```

### POST `/conversations/[id]`

Send message in conversation. Requires authentication.

**Request Body:**
```json
{
  "content": "Hello, how are you?",
  "orderId": "order-id-optional"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "message-id",
    "content": "Hello, how are you?",
    "fromUser": { ... },
    "createdAt": "2024-01-15T10:30:00Z"
  },
  "message": "Message sent"
}
```

---

## Reviews Endpoints

### POST `/reviews`

Create a review. Requires authentication (buyer only).

**Request Body:**
```json
{
  "orderId": "order-id",
  "rating": 5,
  "comment": "Great service!"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": { ... },
  "message": "Review created"
}
```

---

## User Endpoints

### GET `/users/[id]`

Get user profile. No authentication required.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "user-id",
    "name": "John Doe",
    "email": "john@example.com",
    "avatar": "https://...",
    "bio": "Web developer",
    "profile": { ... },
    "sellerProfile": { ... }
  }
}
```

### PUT `/users/[id]`

Update user profile. Requires authentication and ownership.

**Request Body:**
```json
{
  "name": "Jane Doe",
  "bio": "Full stack developer",
  "avatar": "https://...",
  "phone": "+1234567890",
  "address": "123 Main St",
  "city": "New York",
  "state": "NY",
  "postalCode": "10001",
  "country": "US"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": { ... }
}
```

---

## Seller Endpoints

### POST `/seller/onboard`

Onboard as seller and create Stripe Connect account. Requires authentication.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "stripeAccountId": "acct_...",
    "onboardingUrl": "https://connect.stripe.com/..."
  }
}
```

### GET `/seller/earnings`

Get seller earnings. Requires authentication.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "totalEarnings": 15000,
    "totalOrders": 10,
    "pendingOrders": 2,
    "completedOrders": 8
  }
}
```

---

## Admin Endpoints

### GET `/admin/stats`

Get platform statistics. Requires authentication and ADMIN role.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "totalOrders": 500,
    "totalRevenue": 50000,
    "totalUsers": 200
  }
}
```

---

## Error Response Format

```json
{
  "success": false,
  "error": "Error message"
}
```

## Status Codes

- `200` - OK
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Server Error

---

## Rate Limiting

Currently no rate limiting. Recommended for production:
- 100 requests/minute per IP
- 1000 requests/minute per authenticated user
