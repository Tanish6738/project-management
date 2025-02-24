# API Testing Guide

Base URL: `http://localhost:3000/api`

## Authentication Header
All routes (except register/login) require the following header:
```
Authorization: Bearer <your-token>
```

## Testing Setup Order

1. First, create an admin user
2. Then create regular users
3. Create teams
4. Create projects
5. Create and manage tasks

## 1. User Management Tests

### 1.1 Initial Admin Setup
```json
// Register Admin (First user automatically gets admin role)
POST /users/register
{
    "name": "Admin User",
    "email": "admin@example.com",
    "password": "adminpass123"
}

// Login as Admin
POST /users/login
{
    "email": "admin@example.com",
    "password": "adminpass123"
}

// Get All Users (Admin only)
GET /users
```

### 1.2 Regular User Registration
```json
// Register Regular User
POST /users/register
{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
}

// Login as Regular User
POST /users/login
{
    "email": "john@example.com",
    "password": "password123"
}

// Logout
POST /users/logout
```

### 1.3 User Profile Management
```json
// Get Own Profile
GET /users/me

// Update Profile
PUT /users/me
{
    "name": "John Smith",
    "email": "john.smith@example.com",
    "bio": "Software Developer",
    "location": "New York"
}

// Delete Account (requires re-authentication)
DELETE /users/me
```

### 1.4 User Settings
```json
// Update Preferences
PUT /users/preferences
{
    "notifications": {
        "email": true,
        "push": true
    },
    "theme": "dark",
    "language": "en"
}

// Update Time Settings
PUT /users/time-settings
{
    "timeZone": "America/New_York",
    "workingHours": {
        "start": "09:00",
        "end": "17:00"
    }
}
```

## 2. Team Management Tests

### 2.1 Basic Team Operations
```json
// Create Team (requires authenticated user)
POST /teams
{
    "name": "Development Team",
    "description": "Main development team",
    "teamType": "department",
    "maxMembers": 50
}

// Get All Teams
GET /teams

// Get Specific Team
GET /teams/{teamId}

// Update Team (team owner only)
PUT /teams/{teamId}
{
    "name": "Development Team Alpha",
    "description": "Updated description",
    "isActive": true
}

// Delete Team (team owner only)
DELETE /teams/{teamId}
```

### 2.2 Team Member Management
```json
// Get Team Members
GET /teams/{teamId}/members

// Add Team Member (admin/owner only)
POST /teams/{teamId}/members
{
    "userId": "user123",
    "role": "member",
    "permissions": {
        "canAddProjects": true,
        "canRemoveProjects": false,
        "canViewAllProjects": true
    }
}

// Update Member Role (owner only)
PATCH /teams/{teamId}/members/{userId}/role
{
    "role": "admin"
}

// Remove Team Member (admin/owner only)
DELETE /teams/{teamId}/members/{userId}
```

### 2.3 Team Statistics
```json
// Update Team Stats
POST /teams/{teamId}/stats
{
    "completedTasks": 10,
    "pendingTasks": 5
}
```

## 3. Project Management Tests

### 3.1 Project Creation and Management
```json
// Create Project
POST /projects
{
    "title": "New Project",
    "description": "Project description",
    "projectType": "team",
    "team": "teamId",
    "priority": "high",
    "dueDate": "2024-12-31T00:00:00.000Z",
    "settings": {
        "visibility": "team",
        "allowComments": true,
        "allowGuestAccess": false
    }
}

// Get All Projects
GET /projects

// Get Project Details
GET /projects/{projectId}

// Update Project (owner/admin only)
PUT /projects/{projectId}
{
    "title": "Updated Project",
    "description": "Updated description",
    "priority": "urgent",
    "status": "active"
}

// Delete Project (owner only)
DELETE /projects/{projectId}
```

### 3.2 Project Member Management
```json
// Get Project Members
GET /projects/{projectId}/members

// Add Project Member (admin/owner only)
POST /projects/{projectId}/members
{
    "userId": "user123",
    "role": "editor",
    "permissions": {
        "canEditTasks": true,
        "canDeleteTasks": false,
        "canInviteMembers": false
    }
}

// Update Member Role (owner only)
PATCH /projects/{projectId}/members/{userId}/role
{
    "role": "admin"
}

// Remove Project Member (admin/owner only)
DELETE /projects/{projectId}/members/{userId}
```

### 3.3 Project Configuration
```json
// Update Project Settings
PUT /projects/{projectId}/settings
{
    "visibility": "private",
    "allowComments": true,
    "allowGuestAccess": false,
    "notifications": {
        "enabled": true,
        "frequency": "instant"
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
    "action": "add",
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
    "status": "pending",
    "priority": "high",
    "deadline": "2024-12-31T00:00:00.000Z",
    "isPublic": false,
    "tags": ["bug", "frontend"]
}

// Get Tasks with Filters
GET /tasks?project=projectId&status=pending&priority=high&assignedTo=userId

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
// Get Task's Subtasks
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

### 4.3 Task Time Tracking
```json
// Update Time Tracking
POST /tasks/{taskId}/time
{
    "duration": 120
}

// Add Task Watcher
POST /tasks/{taskId}/watchers
```

### 4.4 Task Views
```json
// Get Project Tasks Tree View
GET /tasks/tree?projectId=projectId

// Get Project Tasks By Status
GET /tasks/by-status?projectId=projectId

// Get Project Tasks With Details
GET /tasks/project/{projectId}/details
```

## Testing Best Practices

1. **Authentication Flow**:
   - Save the token received after login
   - Use the token in the Authorization header for subsequent requests
   - Test token expiration and logout

2. **Role-Based Access**:
   - Test with different user roles (admin, member, viewer)
   - Verify permission restrictions
   - Test unauthorized access scenarios

3. **Data Validation**:
   - Test with invalid data formats
   - Test field length restrictions
   - Test required field validation

## Common Response Codes

```json
// Success Responses
201 - Resource Created
200 - Success
204 - No Content

// Error Responses
400 - Validation Error
401 - Authentication Error
403 - Authorization Error
404 - Resource Not Found
500 - Server Error
```

## Error Response Format
```json
{
    "error": "Specific error message"
}
```
