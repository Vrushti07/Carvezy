# Carvezy

**Carvezy** is a modern, safety-first carpooling and shared-cab platform designed to make daily commuting more affordable, secure, and community-driven. The platform focuses on verified identities, gender-aware safety controls, transparent ride management, intelligent ride matching, and real-time travel monitoring.

---

## Features

### Authentication & Verification

* Email/Phone OTP authentication
* JWT-based secure sessions
* Identity verification
* Profile verification
* Community-based user onboarding

### Ride Management

* Create rides
* Search rides
* Book seats
* Cancel bookings
* Ride lifecycle tracking
* Atomic seat reservation

### Safety Features

* Gender-based ride visibility
* Community-restricted rides
* SOS emergency system
* Emergency contact alerts
* Ride audit logging
* Privacy-first communication

### Real-Time Tracking

* Live location sharing
* Real-time ride updates
* ETA calculation
* Driver and rider tracking

### Fare Management

* Distance-based fare calculation
* Shared fare distribution
* Dynamic seat pricing
* Fare bargaining and negotiation

### Shared Cab Pooling

* Multiple riders per ride
* Route optimization
* Seat availability management
* Automatic fare splitting

### Communication

* In-app messaging
* Ride notifications
* Booking updates
* Emergency alerts

---

# System Architecture

```
Frontend (Mobile/Web)
        │
        ▼
Node.js + Express Backend
        │
 ┌──────┼──────┐
 ▼      ▼      ▼
Postgres Redis Socket.io
        │
        ▼
External Services
(Maps, SMS, Push Notifications)
```

---

# Tech Stack

## Frontend

* React Native / Flutter
* Tailwind CSS / Native UI Components

## Backend

* Node.js
* Express.js

## Database

* PostgreSQL

## Caching

* Redis

## Authentication

* JWT
* OTP Verification

## Real-Time Services

* Socket.io

## Maps & Location

* Google Maps API
* Mapbox API

## Notifications

* Firebase Cloud Messaging (FCM)
* SMS Gateway (Twilio/Fast2SMS)

## Logging & Monitoring

* Winston
* Morgan

---

# Ride Lifecycle

```
CREATED
   ↓
DISCOVERABLE
   ↓
BOOKED
   ↓
IN_PROGRESS
   ↓
COMPLETED
```

Additional states:

```
CANCELLED
EXPIRED
```

---

# Ride Discovery & Matching

Carvezy matches users based on:

* Source and destination
* Route overlap
* Ride timings
* Available seats
* Gender preferences
* Community tags
* Driver ratings

Matching priority:

```
Community Match
      +
Route Match
      +
Driver Rating
      +
Time Compatibility
```

---

# SOS Workflow

### Online Mode

```
User Presses SOS
        ↓
REST API Trigger
        ↓
Socket.io Broadcast
        ↓
Emergency Contacts Alerted
        ↓
Admin Dashboard Notified
        ↓
Event Logged
```

### Low-Network Mode

```
User Presses SOS
        ↓
SMS Generated
        ↓
Emergency Contacts Receive SMS
        ↓
SMS Gateway Webhook
        ↓
Node.js Backend Processes SOS
        ↓
Ride Flagged For Emergency
```

---

# Security Features

* JWT Authentication
* OTP Verification
* Password Hashing
* Input Validation
* Role-Based Access Control
* Audit Logging
* Rate Limiting
* Secure API Middleware

---

# Database Entities

## User

* userId
* name
* gender
* community
* verificationStatus

## Ride

* rideId
* driverId
* source
* destination
* seatsAvailable
* status

## Booking

* bookingId
* rideId
* riderId
* fare
* bookingStatus

## SOSLog

* sosId
* rideId
* userId
* location
* timestamp

---

# Installation

### Clone Repository

```bash
git clone https://github.com/your-username/carvezy.git

cd carvezy
```

### Install Dependencies

```bash
npm install
```

### Configure Environment Variables

Create a `.env` file:

```env
PORT=5000

DATABASE_URL=

JWT_SECRET=

REDIS_URL=

GOOGLE_MAPS_API_KEY=

SMS_API_KEY=
```

### Start Development Server

```bash
npm run dev
```

### Production

```bash
npm start
```

---

# Future Enhancements

* AI-based ride recommendations
* Fraud detection system
* Carbon footprint tracking
* Voice-based SOS
* Corporate ride networks
* EV ride support
* Dynamic pricing engine
* Predictive ride demand analytics


