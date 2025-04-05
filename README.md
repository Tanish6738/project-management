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
- Advanced analytics and reporting

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
        ├── api/            # API service layer
        ├── App/            # Main application components
        │   ├── Context/    # React context providers
        │   ├── Elements/   # Reusable UI elements
        │   ├── Layout/     # Layout components
        │   └── Pages/      # Application pages
        ├── assets/         # Images and static assets
        ├── LandingPage/    # Landing page components
        ├── lib/            # Utility functions
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

### User Management
- **User Registration & Authentication**: Secure signup and login with JWT tokens
- **User Profiles**: Customizable user profiles with avatars, bios, and contact information
- **Role-Based Access Control**: Different permissions for admins, managers, and regular users
- **User Preferences**: Personalized settings for notifications, themes, and language
- **Time Zone Settings**: Configure working hours and time zone for accurate reporting
- **Invitation System**: Send and manage invitations to join projects or teams

### Team Management
- **Team Creation & Organization**: Create departments or project-based teams
- **Team Member Management**: Add, remove, and assign roles to team members
- **Team Statistics**: Track team performance and productivity metrics
- **Permission Management**: Configure granular permissions for team members
- **Team Projects**: Manage multiple projects within a team

### Project Management
- **Project Creation**: Create personal or team-based projects
- **Project Workflows**: Customizable project workflows with up to 10 stages
- **Project Settings**: Configure visibility, notifications, and access permissions
- **Tags & Categorization**: Organize projects with tags and categories
- **Project Analytics**: Track project progress, completion rates, and team workload
- **Project Templates**: Save and reuse project configurations
- **Project Archiving**: Archive completed projects while preserving data

### Task Management
- **Task Creation & Assignment**: Create tasks and assign them to team members
- **Task Hierarchies**: Organize work with parent tasks and subtasks
- **Task Dependencies**: Set up dependencies between related tasks
- **Task Prioritization**: Assign priority levels to focus on important work
- **Deadlines & Reminders**: Set due dates and receive reminders
- **Task Status Tracking**: Monitor progress through customizable status workflows
- **Task Watchers**: Subscribe to task updates without being assigned
- **Advanced Task Views**: Tree view, kanban boards, and status-based grouping

### Comments & Collaboration
- **Task Comments**: Discuss work directly on task pages
- **Comment Threads**: Organize discussions with threaded replies
- **Mentions**: Tag team members to notify them about important information
- **Rich Text Formatting**: Format comments with markdown-style syntax

### Time Tracking
- **Time Logging**: Record time spent on tasks manually or with timers
- **Time Reports**: Generate detailed time reports by user, project, or team
- **Billable Hours**: Mark time as billable or non-billable
- **Time Approvals**: Review and approve submitted time entries
- **Export Options**: Export time data for invoicing or analysis

### File Management
- **File Attachments**: Upload files to projects and tasks
- **File Previews**: Preview supported file types directly in the browser
- **File Organization**: Organize attachments by project or task
- **Secure Storage**: Safely store and manage access to uploaded files

### Analytics & Reporting
- **Project Analytics**: Track project progress and completion rates
- **Team Performance**: Monitor team productivity and workload
- **Task Distribution**: Analyze task distribution by status and priority
- **Time Reports**: Generate detailed time usage reports
- **Custom Dashboards**: Personalized views with relevant metrics

### User Interface
- **Responsive Design**: Works on desktop and mobile devices
- **Advanced Animations**: Smooth, interactive UI experiences with GSAP and Framer Motion
- **Custom UI Components**: Including animated cards, interactive elements
- **Dark/Light Themes**: Multiple visual themes for comfortable viewing
- **Accessibility Features**: Designed for keyboard navigation and screen readers

### Security & Auditing
- **Secure Authentication**: JWT-based authentication with token refresh
- **Role-Based Access**: Control permissions based on user roles
- **Audit Logging**: Track important system changes and actions
- **Data Validation**: Comprehensive input validation and sanitization
- **Password Security**: Secure password hashing and account recovery

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
