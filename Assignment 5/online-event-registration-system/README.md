# Online Event Registration and Management System

## Setup
1. Install Node.js and MongoDB.
2. Extract the ZIP and open a terminal in the project folder.
3. Run `npm install`.
4. Make sure MongoDB is running.
5. Run `npm run create-admin`.
6. Run `npm run dev`.
7. Open http://localhost:3000

## Admin
Email: admin@gmail.com
Password: admin123

## Features
- User registration and login
- Password hashing with bcrypt
- Session management
- Event CRUD
- Event registration and cancellation
- Admin registration management
- Server-side validation
- Middleware
- GET, POST, PUT and DELETE requests
- Form and JSON request handling
- MongoDB/Mongoose
- REST APIs
- HTTP status codes
- Error handling
- Static files
- Helmet security headers

## REST API
GET /api/events
GET /api/events/:id
POST /api/events
PUT /api/events/:id
DELETE /api/events/:id
GET /api/registrations
POST /api/registrations
GET /api/registrations/:id
DELETE /api/registrations/:id
