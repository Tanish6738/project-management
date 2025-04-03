# Project Management Application

A comprehensive full-stack project management solution with team collaboration, task tracking, time logging, and file attachment capabilities.

## 📋 Overview

This application provides a complete project management system with the following features:
- User authentication and authorization
- Team management
- Project creation and tracking
- Task management with assignments
- Comments and discussions
- File attachments
- Time logging and reporting

## 🏗️ Project Structure

```
project-management/
├── Backend/                # Node.js/Express backend
│   ├── config/             # Database configuration
│   ├── controllers/        # API controllers
│   ├── middlewares/        # Auth & validation middlewares
│   ├── models/             # MongoDB schemas
│   ├── routes/             # API routes
│   ├── app.js              # Express application setup
│   └── server.js           # Server entry point
│
└── Frontend/               # React/Vite frontend
    ├── public/             # Static files
    └── src/                # Source code
        ├── ani/            # Animations & UI components
        ├── assets/         # Images and static assets
        ├── blocks/         # Reusable UI blocks
        ├── LandingPage/    # Landing page components
        └── Routes/         # Application routing
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd Backend
```

2. Install dependencies:
```bash
npm install
```

3. Start the server:
```bash
npm start
```

The backend server will run at `http://localhost:3000`.

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd Frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend development server will typically run at `http://localhost:5173`.

## 🔌 API Documentation

Base URL: `http://localhost:3000/api`

The API includes endpoints for:

- **User Management**: Registration, authentication, profile management
- **Team Management**: Create teams, add/remove members, update team details
- **Project Management**: Create projects, assign to teams, track progress
- **Task Management**: Create tasks, assign to users, update status
- **Comments**: Discussion threads for projects and tasks
- **Attachments**: Upload and manage files
- **Time Logging**: Track time spent on tasks and projects

For detailed API endpoint documentation, see the [API Testing Guide](./postman-testing-guide-with-responses.md).

## 🔐 Authentication

The application uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-token>
```

## 🧪 Testing

For complete testing instructions, refer to:
- [API Testing Guide](./postman-testing-guide-with-responses.md)
- [Test Guide](./test-guide.md)

## 💻 Technologies

### Backend
- Node.js
- Express.js
- MongoDB
- JWT Authentication

### Frontend
- React 19
- Vite
- React Router
- Framer Motion
- GSAP (Animations)
- TailwindCSS

## 📱 Features

- **Responsive Design**: Works on desktop and mobile devices
- **Real-time Updates**: Instant notifications for changes
- **Role-based Access Control**: Different permissions for admins and regular users
- **Advanced Animations**: Smooth, interactive UI experience
- **Time Tracking**: Log and report time spent on tasks
- **File Management**: Upload and organize project files
- **Custom UI Components**: Including animated elements and interactive cards

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License.

# API Testing Guide
 
Base URL: `http://localhost:3000/api`

## 1. User Authentication Tests

### 1.1 Register User (Admin)
```json
POST /users/register
{
    "name": "Admin User",
    "email": "admin@example.com",
    "password": "Admin123!"
}
```

### 1.2 Login as Admin
```json
POST /users/login
{
    "email": "admin@example.com",
    "password": "Admin123!"
}
```
Save the returned token for subsequent requests.

### 1.3 Register Regular User
```json
POST /users/register
{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "John123!"
}
```

## 2. Team Management Tests

### 2.1 Create Team
```json
POST /teams
{
    "name": "Development Team",
    "description": "Main development team",
    "teamType": "department"
}
```
Save the returned teamId.

### 2.2 Get All Teams
```json
GET /teams
```

### 2.3 Add Team Member
```json
POST /teams/{teamId}/members
{
    "userId": "<john's-user-id>",
    "role": "member"
}
```

### 2.4 Get Team Members
```json
GET /teams/{teamId}/members
```

### 2.5 Update Team
```json
PUT /teams/{teamId}
{
    "name": "Development Team Alpha",
    "description": "Main development team - Alpha Division"
}
```

## 3. Project Management Tests

### 3.1 Create Project
```json
POST /projects
{
    "title": "E-commerce Platform",
    "description": "Building a new e-commerce platform",
    "projectType": "team",
    "team": "<team-id>",
    "priority": "high",
    "dueDate": "2024-12-31T00:00:00.000Z"
}
```
Save the returned projectId.

### 3.2 Get All Projects
```json
GET /projects
```

### 3.3 Add Project Member
```json
POST /projects/{projectId}/members
{
    "userId": "<john's-user-id>",
    "role": "member"
}
```

### 3.4 Get Project Members
```json
GET /projects/{projectId}/members
```

### 3.5 Update Project
```json
PUT /projects/{projectId}
{
    "title": "E-commerce Platform v2",
    "status": "active",
    "priority": "urgent"
}
```

## 4. Cleanup Tests

### 4.1 Remove Project Member
```json
DELETE /projects/{projectId}/members/{userId}
```

### 4.2 Delete Project
```json
DELETE /projects/{projectId}
```

### 4.3 Remove Team Member
```json
DELETE /teams/{teamId}/members/{userId}
```

### 4.4 Delete Team
```json
DELETE /teams/{teamId}
```

### 4.5 Delete User
```json
DELETE /users/me
```

### 4.6 Logout
```json
POST /users/logout
```

## Important Notes:

1. Replace placeholders:
   - `{teamId}` with actual team ID from create team response
   - `{projectId}` with actual project ID from create project response
   - `{userId}` with actual user ID from registration response

2. Headers Required:
   - Content-Type: application/json
   - Authorization: Bearer <your-token>

3. Testing Sequence:
   - Always test authentication endpoints first
   - Create resources before trying to modify them
   - Clean up resources in reverse order of creation
