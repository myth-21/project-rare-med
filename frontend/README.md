# Rare Med Frontend

## Overview

Rare Med Frontend is a React-based healthcare application that enables users to search medicines, discover nearby pharmacies, view medicine availability, manage profiles, and submit medicine availability reports.

The application provides a responsive and modern user interface optimized for desktop, tablet, and mobile devices.

---

## Features

### Authentication

* User Registration
* User Login
* Google Sign In
* Google Sign Up
* JWT Authentication
* Password Reset
* Profile Management

### Medicine Search

* Search Medicines
* Medicine Details
* Manufacturer Information
* Generic Medicine Information
* Medicine Availability

### Pharmacy Locator

* Nearby Pharmacy Discovery
* Pharmacy Details
* Available Medicines
* Interactive Maps
* Location-Based Search

### Reports

* Submit Medicine Availability Reports
* View Reports

---

## Technology Stack

* React
* Vite
* Tailwind CSS
* React Router DOM
* Axios
* Framer Motion
* Lucide React
* Google Maps API / OpenStreetMap

---

## Installation

### Clone Repository

```bash
git clone <repository-url>
```

### Navigate to Frontend

```bash
cd frontend
```

### Install Dependencies

```bash
npm install
```

### Run Development Server

```bash
npm run dev
```

### Build Application

```bash
npm run build
```

### Preview Build

```bash
npm run preview
```

---

## Environment Variables

Create a `.env` file in the frontend root directory.

```env
VITE_API_URL=https://your-backend-url/api

VITE_GOOGLE_CLIENT_ID=your_google_client_id

VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

---

## Folder Structure

```text
src/

├── assets/
├── components/
├── hooks/
├── pages/
├── routes/
├── services/
├── store/
├── utils/

├── App.jsx
├── main.jsx
└── index.css
```

---

## Deployment

Recommended Platforms:

* Vercel
* Netlify
* Firebase Hosting

---

## License

This project is intended for educational and healthcare innovation purposes.
