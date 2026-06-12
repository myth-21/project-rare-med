# Rare Med

## Overview

Rare Med is a full-stack healthcare platform designed to help users locate medicines, discover nearby pharmacies, track medicine availability, and contribute availability reports.

The platform combines medicine discovery, pharmacy location services, user authentication, location-based search, and reporting capabilities into a single modern healthcare solution.

Rare Med aims to reduce the difficulty of finding medicines by helping users identify pharmacies where specific medicines are available.

---

## Key Features

### User Authentication

* User Registration
* User Login
* Google Sign In
* Google Sign Up
* JWT Authentication
* Password Reset
* Profile Management
* Profile Photo Upload

### Medicine Discovery

* Search Medicines
* View Medicine Details
* Medicine Availability Tracking
* Manufacturer Information
* Generic Medicine Information
* Medicine Categories
* Realistic Medicine Images

### Pharmacy Locator

* Location-Based Pharmacy Search
* Nearby Pharmacy Discovery
* Interactive Maps
* Pharmacy Details
* Pharmacy Contact Information
* Available Medicines by Pharmacy

### Reports System

* Submit Medicine Availability Reports
* View Availability Reports
* Community-Based Updates

### Notifications

* Availability Notifications

### User Dashboard

* Profile Management
* Saved Medicines
* Search History
* Recent Activity

---

## Technology Stack

### Frontend

* React
* Vite
* Tailwind CSS
* React Router DOM
* Axios
* Framer Motion
* Lucide React

### Backend

* Node.js
* Express.js
* MongoDB
* Mongoose

### Authentication

* JWT Authentication
* Google OAuth
* bcryptjs

### Maps

* Google Maps API
* OpenStreetMap Fallback

### File Uploads

* Multer

---

## System Architecture

```text
Rare Med

Frontend (React + Vite)
        │
        ▼
REST API (Express.js)
        │
        ▼
MongoDB Database
        │
        ▼
Google OAuth
Google Maps
```

---

## Project Structure

```text
Rare-Med/

├── frontend/
│
│   ├── public/
│   ├── src/
│   │
│   ├── assets/
│   ├── components/
│   ├── pages/
│   ├── services/
│   ├── hooks/
│   ├── store/
│   ├── routes/
│   ├── utils/
│   │
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
│
│
├── backend/
│
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── utils/
│   │
│   └── server.js
│
└── README.md
```

---

## Installation

### Clone Repository

```bash
git clone https://github.com/your-username/rare-med.git
```

### Navigate to Project

```bash
cd rare-med
```

---

# Frontend Setup

### Navigate to Frontend

```bash
cd frontend
```

### Install Dependencies

```bash
npm install
```

### Start Development Server

```bash
npm run dev
```

### Build Production Version

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

---

# Backend Setup

### Navigate to Backend

```bash
cd backend
```

### Install Dependencies

```bash
npm install
```

### Start Development Server

```bash
npm run dev
```

### Start Production Server

```bash
npm start
```

---

## Frontend Dependencies

```bash
npm install react-router-dom axios
npm install framer-motion lucide-react

npm install @react-google-maps/api

npm install leaflet react-leaflet
```

---

## Backend Dependencies

```bash
npm install express
npm install mongoose
npm install dotenv
npm install cors
npm install bcryptjs
npm install jsonwebtoken
npm install passport
npm install passport-google-oauth20
npm install multer
npm install express-validator
```

Development Dependency:

```bash
npm install -D nodemon
```

---

## Environment Variables

### Frontend

Create:

```text
frontend/.env
```

```env
VITE_API_URL=https://your-backend-domain.com/api

VITE_GOOGLE_CLIENT_ID=your_google_client_id

VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

---

### Backend

Create:

```text
backend/.env
```

```env
PORT=5000

MONGO_URI=your_mongodb_connection_string

JWT_SECRET=your_jwt_secret

CLIENT_URL=https://your-frontend-domain.com

ADMIN_EMAIL=admin@raremed.com
ADMIN_PASSWORD=Admin@123

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

```

---

## Database Models

### User

```text
name
email
password
googleId
profilePicture
phoneNumber
city
state
savedMedicines
createdAt
```

### Medicine

```text
name
genericName
manufacturer
category
description
image
availability
```

### Pharmacy

```text
name
image
address
city
state
phone
latitude
longitude
medicines[]
```

### Report

```text
medicine
pharmacy
status
notes
submittedBy
submittedAt
```

---

## API Endpoints

### Authentication

```http
POST /api/auth/register

POST /api/auth/login

POST /api/auth/google

POST /api/auth/forgot-password

POST /api/auth/reset-password
```

### Medicines

```http
GET /api/medicines

GET /api/medicines/:id
```

### Pharmacies

```http
GET /api/pharmacies

GET /api/pharmacies/:id
```

### Reports

```http
GET /api/reports

POST /api/reports
```

---

## Maps and Location Services

Rare Med supports:

* Current User Location Detection
* Nearby Pharmacy Discovery
* Interactive Maps
* Pharmacy Location Markers
* Directions Integration
* Medicine Availability Locations

Users can allow location access to view pharmacies closest to their current location.

---

## Authentication Flow

### Email Authentication

```text
Register
→ Login
→ Dashboard
```

### Google Authentication

```text
Google Sign In
→ Authentication Successful
→ JWT Generated
→ Dashboard Access
```

---

## Search Features

Users can search medicines using:

* Medicine Name
* Generic Name
* Manufacturer

Features:

* Autocomplete
* Suggestions
* Partial Matching
* Case-Insensitive Search

---

## Deployment

### Frontend

Recommended Platforms:

* Vercel
* Netlify
* Firebase Hosting

### Backend

Recommended Platforms:

* Render
* Railway
* AWS
* DigitalOcean

### Database

* MongoDB Atlas

---

## Security

The application implements:

* JWT Authentication
* Protected Routes
* Secure API Communication
* Password Hashing
* Google OAuth Authentication
* Environment Variable Protection

---

## Future Enhancements

* Medicine Availability Alerts
* Advanced Pharmacy Filtering
* Medicine Reservation System
* AI-Based Medicine Recommendations
* Multi-Language Support
* Pharmacy Verification System

---

## Project Status

Production Ready

Implemented Modules:

* Authentication
* Google OAuth
* Medicine Search
* Pharmacy Locator
* Interactive Maps
* Reports System
* Profile Management
* Responsive Design
* Email Notifications

---

## License

This project is developed for educational, research, and healthcare innovation purposes.

All trademarks, pharmacy names, medicine names, and third-party brands belong to their respective owners.
