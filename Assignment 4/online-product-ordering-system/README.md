# Online Product Ordering and Management System

## Stack
Node.js, Express, MongoDB, Mongoose, EJS, express-session, bcryptjs, express-validator, Helmet.

## Setup

1. Install Node.js and MongoDB.
2. Extract the ZIP.
3. Open a terminal in the project folder.
4. Run:
   npm install
5. Check `.env`.
6. Create admin:
   npm run create-admin
7. Start:
   npm run dev
8. Open:
   http://localhost:3000

## Admin
Email: admin@gmail.com
Password: admin123

## Customer
Register through `/register`.

## REST API
GET /api/products
GET /api/products/:id
POST /api/products          (admin login required)
PUT /api/products/:id       (admin login required)
DELETE /api/products/:id    (admin login required)

## Features
- Customer registration/login
- Password hashing
- Session authentication
- Product CRUD
- Shopping cart
- Quantity and stock validation
- Checkout and orders
- Admin order management
- REST API
- MongoDB connectivity
- Middleware
- HTTP status codes
- Error handling
- Secure headers
- Async database operations
