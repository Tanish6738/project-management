# API Testing Guide

Base URL: `http://localhost:3000/api`

## Authentication Header
All routes (except register/login) require the following header:
```
Authorization: Bearer <your-token>
```

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
// Create Project
POST /projects
{
    "title": "New Project",
    "description": "Project description",
    "projectType": "team",      // "team" or "personal"
    "team": "teamId",          // required if projectType is "team"
    "priority": "high",        // "low", "medium", "high", "urgent"
    "dueDate": "2024-12-31T00:00:00.000Z"
}

// Get All Projects
GET /projects

// Get Project Details
GET /projects/{projectId}

// Update Project
PUT /projects/{projectId}
{
    "title": "Updated Project",
    "description": "Updated description",
    "priority": "urgent",
    "status": "active"         // "active", "archived", "completed"
}

// Delete Project
DELETE /projects/{projectId}
```

### 3.2 Project Member Management
```json
// Get Project Members
GET /projects/{projectId}/members

// Add Project Member
POST /projects/{projectId}/members
{
    "userId": "user123",
    "role": "editor"    // "admin", "editor", "viewer", "member"
}

// Update Member Role - Owner only
PATCH /projects/{projectId}/members/{userId}/role
{
    "role": "admin"
}

// Remove Project Member
DELETE /projects/{projectId}/members/{userId}
```

### 3.3 Project Settings and Configuration
```json
// Update Project Settings
PUT /projects/{projectId}/settings
{
    "visibility": "private",        // "public", "private", "team"
    "allowComments": true,
    "allowGuestAccess": false,
    "notifications": {
        "enabled": true,
        "frequency": "instant"      // "instant", "daily", "weekly"
    }
}

// Update Project Workflow
PUT /projects/{projectId}/workflow
{
    "workflow": ["Todo", "In Progress", "Review", "Done"]
}

// Manage Project Tags
POST /projects/{projectId}/tags
{
    "action": "add",               // "add" or "remove"
    "tags": ["frontend", "urgent"]
}
```

## 4. Task Management Tests

### 4.1 Task Operations
```json
// Create Task
POST /tasks
{
    "project": "projectId",
    "title": "New Task",
    "description": "Task description",
    "assignedTo": "userId",
    "status": "pending",           // "pending", "in-progress", "completed"
    "priority": "high",            // "low", "medium", "high"
    "deadline": "2024-12-31T00:00:00.000Z",
    "isPublic": false,
    "tags": ["bug", "frontend"]
}

// Get All Tasks
GET /tasks
// Optional query params: project, status, priority, assignedTo

// Get Task Details
GET /tasks/{taskId}

// Update Task
PUT /tasks/{taskId}
{
    "title": "Updated Task",
    "status": "in-progress",
    "priority": "high"
}

// Delete Task
DELETE /tasks/{taskId}
```

### 4.2 Subtask Management
```json
// Get All Subtasks
GET /tasks/{taskId}/subtasks

// Create Subtask
POST /tasks/{taskId}/subtasks
{
    "title": "New Subtask",
    "description": "Subtask description",
    "assignedTo": "userId",
    "status": "pending",
    "priority": "medium"
}

// Update Subtask
PUT /tasks/{taskId}/subtasks/{subtaskId}
{
    "title": "Updated Subtask",
    "status": "completed"
}

// Delete Subtask
DELETE /tasks/{taskId}/subtasks/{subtaskId}

// Reorder Subtasks
PUT /tasks/{taskId}/subtasks-order
{
    "order": ["subtask1Id", "subtask2Id", "subtask3Id"]
}
```

### 4.3 Task Time Tracking and Watchers
```json
// Update Time Tracking
POST /tasks/{taskId}/time
{
    "duration": 120    // minutes
}

// Add Task Watcher
POST /tasks/{taskId}/watchers
```

### 4.4 Project Task Views
```json
// Get Project Tasks Tree View
GET /tasks/tree?projectId=projectId

// Get Project Tasks By Status
GET /tasks/by-status?projectId=projectId

// Get Project Tasks With Details
GET /tasks/project/{projectId}/details
```

## Validation Rules

1. Projects:
   - Title: 3-100 characters
   - Description: max 500 characters
   - Valid member roles: ["admin", "editor", "viewer", "member"]
   - Valid project types: ["personal", "team"]
   - Valid status values: ["active", "archived", "completed"]
   - Valid priority values: ["low", "medium", "high", "urgent"]
   - Workflow stages: 1-10 stages

2. Tasks:
   - Title: max 200 characters
   - Valid status values: ["pending", "in-progress", "completed"]
   - Valid priority values: ["low", "medium", "high"]
   - Deadline must be a future date
   - Subtasks must have a parent task
   - Time tracking duration must be positive number

## Response Examples

### Success Responses
```json
// Successful Creation (201)
{
    "_id": "recordId",
    ...requestData,
    "createdAt": "2024-01-20T10:00:00.000Z",
    "updatedAt": "2024-01-20T10:00:00.000Z"
}

// Successful Update (200)
{
    "message": "Resource updated successfully",
    "data": {
        "_id": "recordId",
        ...updatedData
    }
}

// Successful Deletion (200)
{
    "message": "Resource deleted successfully"
}
```

### Error Responses
```json
// Validation Error (400)
{
    "error": "Validation error message"
}

// Authentication Error (401)
{
    "error": "Not authenticated"
}

// Authorization Error (403)
{
    "error": "Not authorized to perform this action"
}

// Not Found Error (404)
{
    "error": "Resource not found"
}

// Server Error (500)
{
    "error": "Internal server error"
}
```
