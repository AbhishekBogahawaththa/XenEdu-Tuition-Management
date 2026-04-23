# Tuition Class Management System

## Overview

The **Tuition Class Management System** is a modern full-stack web application developed as a university group project. Built using **React 19**, **Vite**, **Node.js**, **Express**, and **MongoDB**, it demonstrates core full-stack development concepts including **component-based architecture**, **REST API design**, **role-based access control**, **client-side routing**, and **AI-powered chatbot integration via the Gemini API**. The system provides dedicated dashboards for Admins, Tutors, Students, and Parents — each with tailored features for managing tuition class operations efficiently.

📄 **For setup instructions, see the [Getting Started](#getting-started) section below**

### Key Features


- **Role-Based Access**:
  - **Admin**: Full control over students, tutors, subjects, fees, and enrollment.
  - **Tutor**: Access to personal portal with attendance, study materials, and messages.
  - **Student**: View enrolled subjects, attendance, and academic progress.
  - **Parent**: Monitor child's performance, attendance, and fee status.
- **Student Management**: Enroll, update, and manage student records stored in MongoDB.
- **Attendance Management**: Track and manage attendance across classes and subjects.
- **Fee & Enrollment Tracking**: Handle fee payments and subject enrollments with database persistence.
- **Subject Management**: Manage subjects and class assignments.
- **Messaging System**: Built-in messaging between users.
- **FAQ System**: Manually curated Frequently Asked Questions for users.
- **AI Chatbot**: Integrated intelligent chatbot powered by the **Google Gemini API** for real-time user assistance.
- **Responsive UI**: Fully responsive design using Tailwind CSS v4.

### Project Objectives

- Apply **component-based architecture** using React 19 functional components and hooks.
- Implement **role-based routing** for multi-user access using React Router DOM.
- Build a **RESTful backend API** using Node.js and Express connected to MongoDB.
- Integrate **Google Gemini API** for AI-powered chatbot functionality.
- Demonstrate **responsive UI design** with Tailwind CSS utility classes.
- Build a clean, maintainable **modular project structure** suitable for team collaboration.

---

## Technologies

### Frontend
| Technology | Usage |
|------------|-------|
| React 19 | Frontend Framework |
| Vite 7 | Build Tool |
| Tailwind CSS v4 | Styling |
| React Router DOM v7 | Client-side Routing |
| Lucide React | Icons |
| ESLint v9 | Code Linting |

### Backend
| Technology | Usage |
|------------|-------|
| Node.js | Runtime Environment |
| Express.js | REST API Framework |
| MongoDB | Database |
| Mongoose | MongoDB ODM |
| Google Gemini API | AI Chatbot Integration |

---

## Project Structure

```
TutionClassManagmentSystem/
├── frontend/
│   ├── src/
│   │   ├── assets/                        # Static assets (images, icons)
│   │   ├── components/
│   │   │   └── TutorChatbot.jsx           # AI chatbot component (Gemini API)
│   │   ├── dashboard/
│   │   │   ├── AdminDashboard.jsx         # Admin main dashboard
│   │   │   ├── EnrollmentPage.jsx         # Student enrollment management
│   │   │   ├── ParentDashboard.jsx        # Parent portal dashboard
│   │   │   ├── StudentDashboard.jsx       # Student portal dashboard
│   │   │   ├── SubjectsPage.jsx           # Subject management page
│   │   │   └── TutorDashboard.jsx         # Tutor portal dashboard
│   │   ├── home/                          # Landing / home page
│   │   ├── login/                         # Login page (role-based)
│   │   ├── pages/                         # Additional pages (FAQ, etc.)
│   │   ├── App.jsx                        # Root component & route definitions
│   │   ├── index.css                      # Global styles
│   │   └── main.jsx                       # Application entry point
│   ├── public/                            # Public static files
│   ├── index.html                         # HTML entry point
│   ├── vite.config.js                     # Vite configuration
│   ├── eslint.config.js                   # ESLint configuration
│   └── package.json                       # Frontend dependencies
├── backend/
│   ├── models/                            # Mongoose data models
│   │   ├── Student.js                     # Student schema
│   │   ├── Tutor.js                       # Tutor schema
│   │   ├── Subject.js                     # Subject schema
│   │   ├── Attendance.js                  # Attendance schema
│   │   ├── Fee.js                         # Fee & payment schema
│   │   └── Enrollment.js                  # Enrollment schema
│   ├── routes/                            # Express API routes
│   │   ├── studentRoutes.js               # Student CRUD endpoints
│   │   ├── tutorRoutes.js                 # Tutor endpoints
│   │   ├── subjectRoutes.js               # Subject endpoints
│   │   ├── attendanceRoutes.js            # Attendance endpoints
│   │   ├── feeRoutes.js                   # Fee & payment endpoints
│   │   └── chatbotRoutes.js               # Gemini AI chatbot endpoint
│   ├── controllers/                       # Route handler logic
│   ├── config/
│   │   └── db.js                          # MongoDB connection config
│   ├── .env                               # Environment variables
│   ├── server.js                          # Express server entry point
│   └── package.json                       # Backend dependencies
├── .gitignore
└── README.md                              # This file
```

---

## System Architecture

The application follows the **MVC (Model-View-Controller)** pattern across a full-stack setup:

- **Model**: Mongoose schemas define data structures stored in MongoDB (`Student`, `Tutor`, `Fee`, `Attendance`, etc.).
- **View**: React JSX components render the UI for each role (Admin, Tutor, Student, Parent).
- **Controller**: Express route handlers process API requests and return responses to the frontend.

### Data Flow

1. **Login**: User selects a role and logs in via the Login page.
2. **Routing**: React Router DOM redirects to the appropriate dashboard based on role.
3. **API Calls**: React components fetch data from the Express REST API.
4. **Database**: Express controllers query MongoDB via Mongoose and return JSON responses.
5. **Chatbot**: The Gemini API endpoint receives user messages and returns AI-generated responses in real time.

### Example Workflow: Student Checking Attendance

1. A student logs in and is redirected to `/student-portal`.
2. `StudentDashboard.jsx` renders and makes a `GET` request to `/api/attendance/:studentId`.
3. The Express `attendanceRoutes.js` handles the request and queries MongoDB.
4. Attendance records are returned as JSON and displayed in the dashboard.

### Example Workflow: Using the AI Chatbot

1. A tutor opens the chatbot via `TutorChatbot.jsx`.
2. The user types a query which is sent to `/api/chatbot` via a `POST` request.
3. The Express backend forwards the message to the **Google Gemini API**.
4. The AI-generated response is returned and displayed in the chat interface.

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- npm v9 or higher
- [MongoDB](https://www.mongodb.com/) (local or MongoDB Atlas)
- Google Gemini API Key

### Backend Setup

```bash
# 1. Navigate to the backend folder
cd TutionClassManagmentSystem/backend

# 2. Install dependencies
npm install

# 3. Create a .env file and add your credentials
MONGO_URI=your_mongodb_connection_string
GEMINI_API_KEY=your_gemini_api_key
PORT=5000

# 4. Start the backend server
node server.js
```

### Frontend Setup

```bash
# 1. Navigate to the frontend folder
cd TutionClassManagmentSystem/frontend

# 2. Install dependencies
npm install

# 3. Start the development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start frontend development server |
| `npm run build` | Build frontend for production |
| `npm run preview` | Preview the production build |
| `npm run lint` | Run ESLint checks |

---

## Limitations

- **No Authentication Middleware**: Role-based login is currently UI-level only, without JWT or session-based server-side validation.
- **No Input Validation**: Backend routes do not yet have full input sanitization and validation middleware.

---

## Future Enhancements

- Implement secure **JWT-based authentication** for protected API routes.
- Add **input validation** using libraries like Joi or express-validator.
- Expand the **AI Chatbot** capabilities with conversation history and context awareness.
- Implement **real-time notifications** using WebSockets or Socket.io.
- Deploy the application using **Docker** and a cloud provider (AWS / Render / Vercel).

---

## Contributors

- Bogahawaththa P.B.P.A
- Madubhashini D.V.S
- Senevirathne R.M.K.A
- Sewmini A.D.B
- K.A.D. Kaveesha

---

## License

Educational Use Only License

This project was developed as part of a university group project and is intended strictly for **educational purposes only**.

Permission is hereby granted to use, copy, and modify this project for **non-commercial, educational use** only.  
Commercial use, distribution, or derivative commercial work based on this project is **strictly prohibited**.

This project is provided "as is" without warranty of any kind, express or implied, including but not limited to the warranties of merchantability or fitness for a particular purpose. In no event shall the authors be held liable for any claim, damages, or other liability arising from the use of this project.

For any use beyond the scope of this license, please contact the authors for permission.
