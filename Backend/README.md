# Rare Med Backend

## Overview

Rare Med Backend is a Node.js and Express.js REST API that powers authentication, medicine management, pharmacy management, report submission, notifications, and location-based pharmacy discovery.

The backend provides secure API endpoints and integrates with MongoDB for data storage.

---

## Features

### Authentication

* User Registration
* User Login
* JWT Authentication
* Google OAuth
* Password Reset
* Profile Management

### Medicine Management

* Medicine Search
* Medicine Availability
* Medicine Details

### Pharmacy Management

* Pharmacy Information
* Nearby Pharmacy Discovery
* Pharmacy Medicine Listings

### Reports

* Submit Availability Reports
* Retrieve Reports

### Notifications

* Welcome Email
* Password Reset Email
* Availability Notifications

---

## Technology Stack

* Node.js
* Express.js
* MongoDB
* Mongoose
* JWT
* bcryptjs
* Passport Google OAuth
* Nodemailer
* Multer
* Express Validator

---

## Installation

### Navigate to Backend

```bash
cd backend
```

### Install Dependencies

```bash
npm install
```

### Run Development Server

```bash
npm run dev
```

### Run Production Server

```bash
npm start
```

---

## Required Dependencies

```bash
npm install express mongoose dotenv cors bcryptjs jsonwebtoken
npm install passport passport-google-oauth20
npm install nodemailer
npm install multer
npm install express-validator
npm install
```

Development Dependency:

```bash
npm install -D nodemon
```

---

## Environment Variables

Create a `.env` file in the backend root directory.

```env
PORT=5000

MONGO_URI=your_mongodb_connection_string

JWT_SECRET=your_jwt_secret

CLIENT_URL=https://your-frontend-url

ADMIN_EMAIL=admin@raremed.com
ADMIN_PASSWORD=Admin@123

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email
SMTP_PASS=your_app_password
```

---

## API Endpoints

### Authentication

```text
POST /api/auth/register
POST /api/auth/login
POST /api/auth/google
POST /api/auth/forgot-password
POST /api/auth/reset-password
```

### Medicines

```text
GET /api/medicines
GET /api/medicines/:id
```

### Pharmacies

```text
GET /api/pharmacies
GET /api/pharmacies/:id
```

### Reports

```text
GET /api/reports
POST /api/reports
```

---

## Folder Structure

```text
backend/

├── config/
├── controllers/
├── middleware/
├── models/
├── routes/
├── services/
├── utils/

└── server.js
```

---

## Deployment

Recommended Platforms:

* Render
* Railway
* AWS
* DigitalOcean

Database:

* MongoDB Atlas

---

## License

This project is intended for educational and healthcare innovation purposes.
