# API Testing Guide

Base URL: `http://localhost:3000/api`

## Authentication Header
For all authenticated routes, include this header:
```
Authorization: Bearer <your-token>
```

## 1. Authentication System

### 1.1 User Registration and Authentication
```json
// Register a new user
POST /users/register
{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "Password123"
}

// Login
POST /users/login
{
    "email": "john@example.com",
    "password": "Password123"
}

// Refresh token
POST /auth/refresh-token
{
    "oldToken": "your-expired-token"
}

// Logout
POST /users/logout
```

### 1.2 User Profile and Settings
```json
// Get user profile
GET /users/me

// Update profile
PUT /users/me
{
    "name": "John Smith",
    "bio": "Software Developer",
    "location": "New York"
}

// Update user preferences
PUT /users/preferences
{
    "notifications": {
        "email": true,
        "push": false
    },
    "theme": "dark",
    "language": "en"
}

// Update time settings
PUT /users/time-settings
{
    "timeZone": "America/New_York",
    "workingHours": {
        "start": "09:00",
        "end": "17:00"
    }
}

// Delete account
DELETE /users/me
```

### 1.3 Invitation Management
```json
// Manage project/team invitations
POST /users/invites
{
    "inviteId": "invitation-id",
    "action": "accept", // or "reject"
    "type": "project" // or "team"
}
```

## 2. Team Management System

### 2.1 Team CRUD Operations
```json
// Create team
POST /teams
{
    "name": "Development Team",
    "description": "Main development team",
    "teamType": "department",
    "maxMembers": 10
}

// Get all teams
GET /teams

// Get specific team
GET /teams/{teamId}

// Update team
PUT /teams/{teamId}
{
    "name": "Development Team Alpha",
    "description": "Updated description",
    "isActive": true
}

// Delete team
DELETE /teams/{teamId}
```

### 2.2 Team Member Management
```json
// Get team members
GET /teams/{teamId}/members

// Add team member
POST /teams/{teamId}/members
{
    "userId": "user-id",
    "role": "member",
    "permissions": {
        "canAddProjects": true,
        "canRemoveProjects": false,
        "canViewAllProjects": true
    }
}

// Update member role
PATCH /teams/{teamId}/members/{userId}/role
{
    "role": "admin"
}

// Remove team member
DELETE /teams/{teamId}/members/{userId}
```

### 2.3 Team Statistics and Projects
```json
// Update team statistics
POST /teams/{teamId}/stats

// Add project to team
POST /teams/{teamId}/projects
{
    "projectId": "project-id"
}
```

## 3. Project Management System

### 3.1 Project CRUD Operations
```json
// Create project
POST /projects
{
    "title": "E-commerce Website",
    "description": "Build an e-commerce website with shopping cart",
    "projectType": "team",
    "team": "team-id", // required if projectType is "team"
    "priority": "high",
    "dueDate": "2023-12-31T00:00:00.000Z",
    "settings": {
        "visibility": "team",
        "allowComments": true,
        "allowGuestAccess": false
    }
}

// Get all projects
GET /projects

// Get specific project
GET /projects/{projectId}

// Update project
PUT /projects/{projectId}
{
    "title": "E-commerce Website v2",
    "priority": "urgent",
    "status": "active"
}

// Delete project
DELETE /projects/{projectId}
```

### 3.2 Project Member Management
```json
// Get project members
GET /projects/{projectId}/members

// Add project member
POST /projects/{projectId}/members
{
    "userId": "user-id",
    "role": "editor",
    "permissions": {
        "canEditTasks": true,
        "canDeleteTasks": false,
        "canInviteMembers": false
    }
}

// Update member role
PATCH /projects/{projectId}/members/{userId}/role
{
    "role": "admin"
}

// Remove project member
DELETE /projects/{projectId}/members/{userId}
```

### 3.3 Project Configuration and Settings
```json
// Update project settings
PUT /projects/{projectId}/settings
{
    "visibility": "private",
    "allowComments": true,
    "allowGuestAccess": false,
    "notifications": {
        "enabled": true,
        "frequency": "daily"
    }
}

// Update project workflow
PUT /projects/{projectId}/workflow
{
    "workflow": ["Backlog", "To Do", "In Progress", "QA", "Done"]
}

// Manage project tags
POST /projects/{projectId}/tags
{
    "action": "add",
    "tags": ["frontend", "urgent", "bug"]
}
```

## 4. Task Management System

### 4.1 Basic Task Operations
```json
// Create task
POST /tasks
{
    "project": "project-id",
    "title": "Implement login functionality",
    "description": "Create login form and authentication logic",
    "assignedTo": "user-id",
    "status": "pending",
    "priority": "high",
    "deadline": "2023-11-30T00:00:00.000Z",
    "tags": ["frontend", "auth"]
}

// Get all tasks with filters
GET /tasks?project=projectId&status=pending&priority=high&assignedTo=userId

// Get task details
GET /tasks/{taskId}

// Update task
PUT /tasks/{taskId}
{
    "title": "Implement login and registration",
    "status": "in-progress",
    "priority": "high",
    "deadline": "2023-12-15T00:00:00.000Z"
}

// Delete task
DELETE /tasks/{taskId}
```

### 4.2 Subtask Management
```json
// Get task's subtasks
GET /tasks/{taskId}/subtasks

// Create subtask
POST /tasks/{taskId}/subtasks
{
    "title": "Create login form UI",
    "description": "Implement React form with validation",
    "assignedTo": "user-id",
    "priority": "medium"
}

// Update subtask
PUT /tasks/{taskId}/subtasks/{subtaskId}
{
    "title": "Create login form UI with Material UI",
    "status": "completed"
}

// Delete subtask
DELETE /tasks/{taskId}/subtasks/{subtaskId}

// Reorder subtasks
PUT /tasks/{taskId}/subtasks-order
{
    "order": ["subtask1-id", "subtask2-id", "subtask3-id"]
}
```

### 4.3 Time Tracking and Watchers
```json
// Add time to task
POST /tasks/{taskId}/time
{
    "duration": 120 // minutes
}

// Add yourself as task watcher
POST /tasks/{taskId}/watchers

// Remove yourself as task watcher
DELETE /tasks/{taskId}/watchers
```

### 4.4 Task Advanced Views
```json
// Get task tree view
GET /tasks/tree?projectId=projectId

// Get tasks grouped by status
GET /tasks/by-status?projectId=projectId

// Get detailed project tasks
GET /tasks/project/{projectId}/details
```

## 5. Testing Recommended Sequences

### 5.1 User Registration and Setup
1. Register an Admin user (first user is automatically admin)
2. Login as Admin
3. Update Admin preferences and time settings
4. Register regular user accounts

### 5.2 Team Setup
1. Create a team as Admin
2. Add team members
3. Update team member roles
4. Test team statistics endpoint

### 5.3 Project Workflow
1. Create a project (team or personal)
2. Add project members
3. Configure project settings and workflow
4. Add project tags
5. Update project member roles

### 5.4 Task Management Workflow
1. Create parent tasks
2. Add subtasks to parent tasks
3. Update task statuses
4. Track time on tasks
5. Add task watchers
6. Reorder subtasks
7. Test advanced task views (tree, by-status, details)

## 6. Error Response Format
All error responses follow this format:
```json
{
    "status": "error",
    "message": "Error description",
    "errors": [] // Optional array of validation errors
}
```

## 7. Authentication Notes
- Token expiration: 7 days
- When token expires, use refresh token endpoint
- Role-based access control is enforced on endpoints
- Invalid tokens return 401 Unauthorized
- Insufficient permissions return 403 Forbidden
