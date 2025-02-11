# API Testing Guide

Base URL: `http://localhost:3000/api`

## 1. User Management Tests

### 1.1 User Authentication
```json
// Register - Requires name (min 2 chars), valid email, password (min 6 chars)
POST /users/register
{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
}

// Login - Requires valid email and password
POST /users/login
{
    "email": "john@example.com",
    "password": "password123"
}

// Logout - Requires auth token
POST /users/logout
```

### 1.2 Profile Management
```json
// Get Profile - Requires auth token
GET /users/me

// Update Profile - Optional fields, requires auth token
PUT /users/me
{
    "name": "John Smith",
    "email": "john.smith@example.com",
    "bio": "Software Developer",
    "location": "New York"
}

// Delete Account - Requires auth token
DELETE /users/me
```

### 1.3 User Preferences
```json
// Update Preferences - Requires auth token
PUT /users/preferences
{
    "notifications": true,
    "theme": "dark",
    "language": "en"
}

// Update Time Settings - Requires auth token
PUT /users/time-settings
{
    "timeZone": "America/New_York",
    "workingHours": {
        "start": "09:00",
        "end": "17:00"
    }
}

// Manage Invites - Requires auth token
POST /users/invites
{
    "inviteId": "invite123",
    "action": "accept",
    "type": "project"
}
```

## 2. Team Management Tests

### 2.1 Team Operations
```json
// Create Team - Requires name (2-50 chars), optional description
POST /teams
{
    "name": "Development Team",
    "description": "Main development team",
    "teamType": "department"
}

// Get All Teams - Requires auth token
GET /teams

// Get Team Details - Requires auth token
GET /teams/{teamId}

// Update Team - Optional fields, requires auth token
PUT /teams/{teamId}
{
    "name": "Development Team Alpha",
    "description": "Updated description",
    "isActive": true
}

// Delete Team - Requires auth token
DELETE /teams/{teamId}
```

### 2.2 Team Member Management
```json
// Get Team Members - Requires auth token
GET /teams/{teamId}/members

// Add Team Member - Requires userId and optional role
POST /teams/{teamId}/members
{
    "userId": "user123",
    "role": "member"
}

// Update Member Role - Requires userId and role
PATCH /teams/{teamId}/members/{userId}/role
{
    "role": "admin"
}

// Remove Team Member - Requires auth token
DELETE /teams/{teamId}/members/{userId}
```

### 2.3 Team Statistics and Projects
```json
// Update Team Stats - Requires auth token
POST /teams/{teamId}/stats
{
    "completedTasks": 10,
    "pendingTasks": 5
}

// Add Project to Team - Requires auth token
POST /teams/{teamId}/projects
{
    "projectId": "project123"
}
```

## 3. Project Management Tests

### 3.1 Project Operations
```json
// Create Project - Requires title (3-100 chars), projectType
POST /projects
{
    "title": "E-commerce Platform",
    "description": "New e-commerce platform development",
    "projectType": "team",
    "team": "team123",
    "priority": "high",
    "dueDate": "2024-12-31T00:00:00.000Z"
}

// Get All Projects - Requires auth token
GET /projects

// Get Project Details - Requires auth token
GET /projects/{projectId}

// Update Project - Optional fields, requires auth token
PUT /projects/{projectId}
{
    "title": "E-commerce Platform v2",
    "status": "active",
    "priority": "urgent"
}

// Delete Project - Requires auth token
DELETE /projects/{projectId}
```

### 3.2 Project Member Management
```json
// Get Project Members - Requires auth token
GET /projects/{projectId}/members

// Add Project Member - Requires userId and optional role
POST /projects/{projectId}/members
{
    "userId": "user123",
    "role": "member"
}

// Update Member Role - Requires userId and role
PATCH /projects/{projectId}/members/{userId}/role
{
    "role": "admin"
}

// Remove Project Member - Requires auth token
DELETE /projects/{projectId}/members/{userId}
```

### 3.3 Project Configuration
```json
// Update Project Settings - Requires auth token
PUT /projects/{projectId}/settings
{
    "visibility": "private",
    "allowComments": true
}

// Update Project Workflow - Requires auth token
PUT /projects/{projectId}/workflow
{
    "stages": ["Todo", "In Progress", "Review", "Done"]
}

// Manage Project Tags - Requires auth token
POST /projects/{projectId}/tags
{
    "action": "add",
    "tags": ["frontend", "urgent"]
}
```

## Important Notes:

1. Authentication:
   - All routes (except register/login) require Authorization header
   - Format: `Authorization: Bearer <your-token>`

2. Validation Rules:
   - Names: 2-50 characters
   - Project titles: 3-100 characters
   - Descriptions: max 500 characters
   - Emails: must be valid format
   - Passwords: minimum 6 characters
   - Valid roles: ["admin", "member", "viewer"]
   - Valid project types: ["personal", "team"]
   - Valid team types: ["department", "project", "custom"]
   - Valid priorities: ["low", "medium", "high", "urgent"]

3. Error Handling:
   - 400: Validation errors
   - 401: Unauthorized
   - 403: Forbidden
   - 404: Resource not found
   - 500: Server error
