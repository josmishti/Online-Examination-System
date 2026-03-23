# Offline Online Examination System

A complete fullstack web application for conducting online examinations with role-based access control.

## Features

- **Three User Roles:**
  - **Applicant**: Register, take exams, view results
  - **Faculty**: Manage question bank
  - **Administrator**: Manage users, departments, subjects, exams, and results

- **Key Functionalities:**
  - JWT-based authentication
  - Role-based access control
  - Real-time exam interface with timer
  - Tab switch monitoring
  - Automatic result calculation
  - Question bank management
  - Notification system
  - Activity logging

## Tech Stack

### Backend
- Node.js + Express
- MySQL (local database)
- JWT Authentication
- bcryptjs for password hashing

### Frontend
- React (Vite)
- React Router
- Axios for API calls
- Recharts for analytics

## Prerequisites

- Node.js (v16 or higher)
- MySQL (running locally)
- npm or yarn

## Installation

### 1. Clone the repository

```bash
cd DBMS
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory:

```env
PORT=5000
JWT_SECRET=your-super-secret-jwt-key-change-in-production
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=examination_system
DB_PORT=3306
```

### 3. Database Setup

Make sure MySQL is running locally, then:

```bash
npm run seed
```

This will:
- Create the database
- Create all tables
- Create default admin user:
  - Email: `admin@system.local`
  - Password: `Admin@123`

### 4. Frontend Setup

```bash
cd ../frontend
npm install
```

## Running the Application

### Start Backend

```bash
cd backend
npm run dev
```

Backend will run on `http://localhost:5000`

### Start Frontend

```bash
cd frontend
npm run dev
```

Frontend will run on `http://localhost:3000`

## Default Admin Credentials

- **Email**: admin@system.local
- **Password**: Admin@123

## Project Structure

```
DBMS/
├── backend/
│   ├── config/
│   │   └── database.js
│   ├── controllers/
│   │   ├── adminController.js
│   │   ├── applicantController.js
│   │   ├── authController.js
│   │   └── facultyController.js
│   ├── middleware/
│   │   └── auth.js
│   ├── routes/
│   │   ├── admin.js
│   │   ├── applicant.js
│   │   ├── auth.js
│   │   └── faculty.js
│   ├── scripts/
│   │   └── seed.js
│   ├── utils/
│   │   └── validators.js
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── contexts/
│   │   ├── pages/
│   │   │   ├── applicant/
│   │   │   ├── faculty/
│   │   │   └── admin/
│   │   ├── services/
│   │   └── App.jsx
│   └── package.json
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register applicant
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Applicant Routes
- `GET /api/applicant/dashboard` - Get dashboard data
- `GET /api/applicant/exams` - Get available exams
- `POST /api/applicant/exams/:examId/start` - Start exam
- `GET /api/applicant/attempts/:attemptId/questions` - Get exam questions
- `POST /api/applicant/attempts/:attemptId/answers` - Save answer
- `POST /api/applicant/attempts/:attemptId/submit` - Submit exam
- `GET /api/applicant/results` - Get results
- `PUT /api/applicant/profile` - Update profile

### Faculty Routes
- `GET /api/faculty/dashboard` - Get dashboard data
- `GET /api/faculty/subjects` - Get subjects
- `POST /api/faculty/questions` - Create question
- `GET /api/faculty/questions` - Get questions
- `PUT /api/faculty/questions/:questionId` - Update question
- `DELETE /api/faculty/questions/:questionId` - Delete question

### Admin Routes
- `GET /api/admin/dashboard` - Get dashboard data
- `GET /api/admin/users` - Get users
- `POST /api/admin/users/faculty` - Create faculty
- `PUT /api/admin/users/:userId/status` - Toggle user status
- CRUD operations for departments, subjects, exams
- `GET /api/admin/results` - Get results
- `POST /api/admin/results/publish` - Publish results
- `GET /api/admin/activity-logs` - Get activity logs
- `POST /api/admin/notifications` - Create notification

## Real-time Updates

The application uses polling for real-time updates:
- Applicant dashboard: Polls every 5 seconds
- Exam interface: Updates timer every second
- Results: Polls every 5 seconds

## Security Features

- Password hashing with bcryptjs
- JWT token-based authentication
- Role-based route protection
- Tab switch monitoring during exams
- Automatic exam submission on timeout

## Notes

- All data is stored locally in MySQL
- The application is designed for localhost deployment
- Can be easily adapted for production deployment
- Registration validation: 12th marks must be >= 35%

## License

This project is for educational purposes.
