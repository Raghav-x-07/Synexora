# Synexora — AI-Powered Student Learning & Life Intelligence Platform

Synexora is a next-generation academic operating system built on the **MERN Stack** (MongoDB, Express.js, React, Node.js) with Tailwind CSS, React Router, JSON Web Tokens (JWT), and bcryptjs.

---

## 🚀 Key Features Built

1. **Futuristic Responsive Landing Page**:
   - High-impact Hero section with glowing gradients and glassmorphism.
   - Interactive Socratic AI Preview Lab and feature breakdown.
   - Live KPI cognitive metrics showcase.
   - Clear CTAs to Get Started and Sign In.

2. **Authentication & Authorization System**:
   - **Register Page**: Account creation with full name, university, major, and real-time password strength meter.
   - **Login Page**: Secure sign in with client-side validation, error handling, loading states, and quick-fill demo buttons.
   - **JWT Stateless Authentication**: Bearer tokens stored in localStorage with automatic Axios request interceptors.
   - **Protected Routes**: `/dashboard` route protected by client-side guard and backend token verification.
   - **Password Encryption**: 10-round salted bcrypt hashing with pre-save Mongoose middleware.

3. **Student Intelligence Dashboard**:
   - Academic KPI cockpit (GPA target, Study Streaks, Weekly Focus hours, Socratic mastery index).
   - Interactive Socratic dialogue assistant.
   - Enrolled modules and exam tracker.
   - Account and profile customization.

---

## 🛠️ Architecture & Project Structure

```
Synexora/
├── backend/
│   ├── config/
│   │   └── db.js                 # MongoDB connection with auto in-memory dev fallback
│   ├── middleware/
│   │   └── authMiddleware.js     # JWT Bearer token protection middleware
│   ├── models/
│   │   └── User.js               # Mongoose User model with bcrypt encryption
│   ├── routes/
│   │   └── authRoutes.js         # /api/auth (register, login, me, profile)
│   ├── server.js                 # Express application entry point
│   ├── test-auth.js              # Automated backend auth test suite
│   ├── .env                      # Environment variables
│   ├── .env.example
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Navbar.tsx        # Dynamic navigation with auth states
    │   │   ├── Footer.tsx        # Modern footer with quick links
    │   │   └── ProtectedRoute.tsx# Client route guard
    │   ├── context/
    │   │   └── AuthContext.tsx   # React Auth state management
    │   ├── lib/
    │   │   └── api.ts            # Axios client with interceptors
    │   ├── pages/
    │   │   ├── LandingPage.tsx   # Modern futuristic landing page
    │   │   ├── LoginPage.tsx     # Student sign in
    │   │   ├── RegisterPage.tsx  # Student registration
    │   │   └── DashboardPage.tsx # Student AI cockpit
    │   ├── App.tsx               # React Router configuration
    │   ├── main.tsx              # React DOM root mounting
    │   └── index.css             # Tailwind CSS & design tokens
    ├── tailwind.config.js
    ├── vite.config.ts
    └── package.json
```

---

## ⚡ Quick Start Guide

### 1. Backend Setup

```bash
cd backend
npm install
npm start
```
*Backend runs on `http://localhost:5000`*

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```
*Frontend runs on `http://localhost:5173`*

---

## 🔒 API Endpoints

| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/health` | Service health status | Public |
| `POST` | `/api/auth/register` | Register new student account | Public |
| `POST` | `/api/auth/login` | Authenticate user & get JWT | Public |
| `GET` | `/api/auth/me` | Fetch logged-in user profile | Private (JWT) |
| `PUT` | `/api/auth/profile` | Update profile settings | Private (JWT) |

---

## 🧪 Running Automated Tests

```bash
cd backend
node test-auth.js
```
