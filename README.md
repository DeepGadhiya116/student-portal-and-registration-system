# 🎓 Student Portal & Registration System

A centralized academic portal for students to register, manage profiles, enroll in courses, and view official campus announcements.

Built as part of **Full Stack Project #2**, satisfying all mapped Course Outcomes (**CO1 - CO5**).

---

## 📌 Project Specification Summary

| Criteria | Details |
| :--- | :--- |
| **Sr No** | **2** |
| **Project Title** | **Student Portal and Registration System** |
| **Project Description** | A centralized academic portal for students to register, manage profiles, and view announcements. |
| **Expected Technologies**| **React, Tailwind CSS, Node.js, Express, MongoDB** |
| **Key Modules** | **Form Validation**, **Profile Dashboard**, **Admin Panel** |
| **Primary API Methods** | **GET, POST, PUT** |
| **Mapped COs** | **CO1 - CO5** |

---

## 🚀 Key Modules & Features

### 1. Form Validation Module (Client & Server)
- **Live Client Feedback**: Real-time evaluation of inputs as users type or blur fields.
- **Institutional Email Validation**: RFC-compliant regex for institutional and academic emails.
- **Dynamic Password Strength Meter**: Scores password complexity (Weak, Medium, Strong) based on length, digits, and character diversity.
- **Password Confirmation Matching**: Validates matching passwords prior to submission.
- **Backend Validation Middleware (`express-validator`)**: Sanitization, format enforcement (phone format, course capacity minimums, credit limits, name lengths), returning structured error arrays mapped to individual inputs.

### 2. Profile Dashboard Module (`GET` & `PUT`)
- **Academic Summary Card**: CGPA gauge, academic standing badge (*Good Standing* vs *Academic Probation*), registered credit hours counter with dynamic visual progress bar.
- **Personal Information Record**: Contact telephone, institutional email, residential address, emergency contact, and academic bio.
- **Interactive Profile Editor (`PUT /api/students/profile`)**: Update contact info, avatar presets, address, and student bio with instant re-render.
- **Security & Password Update (`PUT /api/students/password`)**: Change account password with verification of current password and new password complexity.
- **Enrolled Courses Manager (`GET /api/students/profile`, `POST /api/courses/drop`)**: View enrolled courses, schedules, professors, and drop enrolled classes with confirmation.

### 3. Admin Panel Module (`GET`, `POST`, `PUT`)
- **Executive Analytics Dashboard (`GET /api/admin/stats`)**: Total students, active accounts, available courses, circular announcements, and total seat enrollments.
- **Student Directory & Governance**: Filter students by department and status (*Active*, *Pending*, *Suspended*). Toggle account status or update student academic details via `PUT /api/admin/students/:id/status`.
- **Course Curriculum Manager**:
  - Add new courses with full form validation via `POST /api/admin/courses`.
  - Update course details, capacity, and schedules via `PUT /api/admin/courses/:id`.
  - Delete courses via `DELETE /api/admin/courses/:id`.
- **Campus Announcement Bulletin**:
  - Broadcast circulars with category (*Academic*, *Examination*, *Event*, *Urgent*, *General*) and priority levels via `POST /api/announcements`.
  - Update notices via `PUT /api/announcements/:id`.
  - Pin important notices to the top of the student stream.

### 4. Course Registration System (`GET`, `POST`)
- **Interactive Catalog**: Browse courses filtered by academic department and real-time search.
- **Capacity & Overload Protection**: Enforces course seat maximums and a 21-credit semester overload cap.
- **One-Click Enrollment**: Seamless registration with immediate feedback.

---

## 🔑 Demo Credentials

Quick login buttons are available in the application UI, or you can use the credentials below:

### 👨‍🎓 Student Account
- **Email**: `alex.rivers@university.edu`
- **Password**: `Password123`
- **Roll / ID**: `STU-2024-001`
- **Department**: Computer Science and Engineering

### 🏛️ Dean / Administrator Account
- **Email**: `admin@university.edu`
- **Password**: `Password123`
- **Name**: `Dr. Eleanor Vance (Dean of Academics)`

*(You can also use the registration form to create any number of new student accounts).*

---

## 📡 Primary API Endpoints

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Service health status & metadata | Public |
| `POST` | `/api/auth/register` | Student registration with form validation | Public |
| `POST` | `/api/auth/login` | Student & Admin login | Public |
| `GET` | `/api/auth/me` | Fetch authenticated profile | Private |
| `GET` | `/api/students/profile` | Student dashboard overview & enrolled courses | Private (Student) |
| `PUT` | `/api/students/profile` | Update profile information with validation | Private (Student) |
| `PUT` | `/api/students/password` | Update account password | Private (Student) |
| `GET` | `/api/courses` | List all academic courses (filter by dept/search) | Public |
| `POST` | `/api/courses/register` | Register student into a course | Private (Student) |
| `POST` | `/api/courses/drop` | Drop an enrolled course | Private (Student) |
| `GET` | `/api/announcements` | Retrieve campus announcements & circulars | Public |
| `POST` | `/api/announcements` | Publish new announcement with priority/pin | Private (Admin) |
| `PUT` | `/api/announcements/:id`| Update announcement contents | Private (Admin) |
| `GET` | `/api/admin/stats` | High-level system & registration analytics | Private (Admin) |
| `GET` | `/api/admin/students` | List student directory with query filters | Private (Admin) |
| `PUT` | `/api/admin/students/:id/status` | Update student status & academic standing | Private (Admin) |
| `POST` | `/api/admin/courses` | Create new course with validation | Private (Admin) |
| `PUT` | `/api/admin/courses/:id` | Update course details and capacity | Private (Admin) |

---

## 🛠️ Project Structure

```text
student-portal/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js               # MongoDB connection + embedded MongoMemoryServer fallback
│   │   ├── middleware/
│   │   │   ├── auth.js             # JWT authentication & role-based authorization
│   │   │   └── validate.js         # Comprehensive express-validator rules
│   │   ├── models/
│   │   │   ├── Announcement.js     # Campus announcement schema
│   │   │   ├── Course.js           # Academic course catalog schema
│   │   │   └── User.js             # Student and admin schema with bcrypt hashing
│   │   ├── routes/
│   │   │   ├── adminRoutes.js      # Admin analytics, student status, courses (GET, POST, PUT)
│   │   │   ├── announcementRoutes.js # Notices & circulars (GET, POST, PUT)
│   │   │   ├── authRoutes.js       # Register, login, session (POST, GET)
│   │   │   ├── courseRoutes.js     # Course catalog and registration (GET, POST)
│   │   │   └── studentRoutes.js    # Profile dashboard and password updates (GET, PUT)
│   │   ├── utils/
│   │   │   └── seedData.js         # Initial mock database seed
│   │   └── server.js               # Express server entry point
│   ├── .env                        # Environment variables
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── admin/
    │   │   │   └── AdminPanel.jsx        # Admin suite: students, courses, announcements
    │   │   ├── announcements/
    │   │   │   └── AnnouncementsFeed.jsx # Public & pinned notices stream
    │   │   ├── auth/
    │   │   │   ├── LoginModal.jsx        # Login modal with demo autofill
    │   │   │   └── RegisterModal.jsx     # Registration with real-time form validation
    │   │   ├── common/
    │   │   │   ├── Alert.jsx             # Alert notification banners
    │   │   │   ├── FormField.jsx         # Field wrapper with live validation & error tips
    │   │   │   ├── Modal.jsx             # Reusable modal container
    │   │   │   └── Navbar.jsx            # Top navigation bar & role switcher
    │   │   ├── courses/
    │   │   │   └── CourseCatalog.jsx     # Course browser & registration
    │   │   └── dashboard/
    │   │       ├── ChangePasswordModal.jsx # Password change modal (PUT)
    │   │       ├── EditProfileModal.jsx    # Profile editor modal (PUT)
    │   │       └── ProfileDashboard.jsx    # Student profile overview card & course table
    │   ├── context/
    │   │   └── AuthContext.jsx           # Global user authentication state
    │   ├── services/
    │   │   └── api.js                    # Fetch client for GET, POST, PUT, DELETE
    │   ├── App.jsx                       # Root application view
    │   ├── index.css                     # Tailwind CSS directives
    │   └── main.jsx                      # Vite entry
    ├── index.html
    ├── package.json
    ├── tailwind.config.js
    └── vite.config.js
```

---

## 🏃 Running the Application

### 1. Backend Server (Port 5000)
```bash
cd backend
npm install
npm start
```
*Note: The backend automatically connects to local MongoDB or launches an embedded in-memory MongoDB instance with pre-seeded data if no standalone database is running.*

### 2. Frontend Application (Port 5173)
```bash
cd frontend
npm install
npm run dev
```
Open **`http://localhost:5173`** in your browser.
