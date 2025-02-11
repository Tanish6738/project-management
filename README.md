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
