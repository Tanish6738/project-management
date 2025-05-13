# Project Management API Testing Guide with Expected Responses

This guide provides step-by-step tests for all backend APIs with expected responses for each request.

## Setup Postman Environment

1. Create a new environment in Postman named "Project Management"
2. Add the following variables:
   - `baseUrl`: `http://localhost:3000/api`
   - `adminToken`: (leave empty for now)
   - `memberToken`: (leave empty for now)
   - `adminId`: (leave empty for now)
   - `memberId`: (leave empty for now)
   - `teamId`: (leave empty for now)
   - `projectId`: (leave empty for now)
   - `taskId`: (leave empty for now)
   - `subtaskId`: (leave empty for now)
   - `commentId`: (leave empty for now)
   - `attachmentId`: (leave empty for now)
   - `timeLogId`: (leave empty for now)

## Testing Sequence with Expected Responses

### 1. User Authentication

#### 1.1 Register Admin User
```
POST {{baseUrl}}/users/register
Content-Type: application/json

{
    "name": "Admin User",
    "email": "admin@example.com",
    "password": "Admin123!"
}
```

**Expected Response** (Status: 201 Created):
```json
{
    "user": {
        "_id": "60d5ec9af682727af44378a1", // This will be a unique ID
        "name": "Admin User",
        "email": "admin@example.com",
        "role": "admin",
        "createdAt": "2023-10-25T14:23:10.123Z",
        "updatedAt": "2023-10-25T14:23:10.123Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." // Long JWT token
}
```
*Save the user._id to `adminId` and token to `adminToken` environment variables*

#### 1.2 Login as Admin
```
POST {{baseUrl}}/users/login
Content-Type: application/json

{
    "email": "admin@example.com",
    "password": "Admin123!"
}
```

**Expected Response** (Status: 200 OK):
```json
{
    "user": {
        "_id": "60d5ec9af682727af44378a1",
        "name": "Admin User",
        "email": "admin@example.com",
        "role": "admin",
        "createdAt": "2023-10-25T14:23:10.123Z",
        "updatedAt": "2023-10-25T14:23:10.123Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." // Long JWT token
}
```
*Update the token in the `adminToken` environment variable*

#### 1.3 Register Regular Member
```
POST {{baseUrl}}/users/register
Content-Type: application/json

{
    "name": "Team Member",
    "email": "member@example.com",
    "password": "Member123!"
}
```

**Expected Response** (Status: 201 Created):
```json
{
    "user": {
        "_id": "60d5ec9af682727af44378a2", // Different ID
        "name": "Team Member",
        "email": "member@example.com",
        "role": "user", // Regular user role
        "createdAt": "2023-10-25T14:25:30.123Z",
        "updatedAt": "2023-10-25T14:25:30.123Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." // Different JWT token
}
```
*Save the user._id to `memberId` environment variable*

#### 1.4 Login as Regular Member
```
POST {{baseUrl}}/users/login
Content-Type: application/json

{
    "email": "member@example.com",
    "password": "Member123!"
}
```

**Expected Response** (Status: 200 OK):
```json
{
    "user": {
        "_id": "60d5ec9af682727af44378a2",
        "name": "Team Member",
        "email": "member@example.com",
        "role": "user",
        "createdAt": "2023-10-25T14:25:30.123Z",
        "updatedAt": "2023-10-25T14:25:30.123Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." // JWT token
}
```
*Save the token to `memberToken` environment variable*

#### 1.5 Test Token Refresh Mechanism
```
POST {{baseUrl}}/auth/refresh-token
Authorization: Bearer {{adminToken}}
Content-Type: application/json

{
    "oldToken": "{{adminToken}}"
}
```

**Expected Response** (Status: 200 OK):
```json
{
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...", // New JWT token
    "user": {
        "_id": "60d5ec9af682727af44378a1",
        "name": "Admin User",
        "email": "admin@example.com",
        "role": "admin"
        // Other user properties
    }
}
```
*Update the `adminToken` with the new token*

### 2. User Profile and Preferences

#### 2.1 Get Admin Profile
```
GET {{baseUrl}}/users/me
Authorization: Bearer {{adminToken}}
```

**Expected Response** (Status: 200 OK):
```json
{
    "_id": "60d5ec9af682727af44378a1",
    "name": "Admin User",
    "email": "admin@example.com",
    "role": "admin",
    "createdAt": "2023-10-25T14:23:10.123Z",
    "updatedAt": "2023-10-25T14:23:10.123Z",
    "preferences": {
        "notifications": {
            "email": true,
            "push": false
        },
        "theme": "light",
        "language": "en"
    }
}
```

#### 2.2 Update Admin Profile
```
PUT {{baseUrl}}/users/me
Authorization: Bearer {{adminToken}}
Content-Type: application/json

{
    "name": "Admin Manager",
    "bio": "Project Management System Administrator",
    "location": "New York"
}
```

**Expected Response** (Status: 200 OK):
```json
{
    "_id": "60d5ec9af682727af44378a1",
    "name": "Admin Manager", // Updated name
    "email": "admin@example.com",
    "bio": "Project Management System Administrator", // New field
    "location": "New York", // New field
    "role": "admin",
    "createdAt": "2023-10-25T14:23:10.123Z",
    "updatedAt": "2023-10-25T14:30:20.123Z" // Updated timestamp
}
```

#### 2.3 Update Admin Preferences
```
PUT {{baseUrl}}/users/preferences
Authorization: Bearer {{adminToken}}
Content-Type: application/json

{
    "notifications": {
        "email": true,
        "push": true
    },
    "theme": "dark",
    "language": "en"
}
```

**Expected Response** (Status: 200 OK):
```json
{
    "preferences": {
        "notifications": {
            "email": true,
            "push": true
        },
        "theme": "dark",
        "language": "en"
    },
    "message": "Preferences updated successfully"
}
```

#### 2.4 Update Admin Time Settings
```
PUT {{baseUrl}}/users/time-settings
Authorization: Bearer {{adminToken}}
Content-Type: application/json

{
    "timeZone": "America/New_York",
    "workingHours": {
        "start": "09:00",
        "end": "17:00"
    }
}
```

**Expected Response** (Status: 200 OK):
```json
{
    "timeSettings": {
        "timeZone": "America/New_York",
        "workingHours": {
            "start": "09:00",
            "end": "17:00"
        }
    },
    "message": "Time settings updated successfully"
}
```

#### 2.5 Search Users
```
GET {{baseUrl}}/users/search?query=admin
Authorization: Bearer {{adminToken}}
```
**Expected Response** (Status: 200 OK):
```json
[
    {
        "_id": "60d5ec9af682727af44378a1",
        "name": "Admin User",
        "email": "admin@example.com",
        "role": "admin"
        // ...other user fields...
    }
]
```

#### 2.6 Notification Settings
```
GET {{baseUrl}}/users/notifications/settings
Authorization: Bearer {{adminToken}}
```
**Expected Response** (Status: 200 OK):
```json
{
    "email": true,
    "push": true,
    "frequency": "daily"
}
```

```
PUT {{baseUrl}}/users/notifications/settings
Authorization: Bearer {{adminToken}}
Content-Type: application/json

{
    "email": false,
    "push": true,
    "frequency": "instant"
}
```
**Expected Response** (Status: 200 OK):
```json
{
    "message": "Notification settings updated successfully"
}
```

#### 2.7 User Notifications
```
GET {{baseUrl}}/users/notifications
Authorization: Bearer {{adminToken}}
```
**Expected Response** (Status: 200 OK):
```json
[
    {
        "_id": "notif-id",
        "message": "Task assigned to you",
        "isRead": false,
        "createdAt": "2025-04-25T10:00:00.000Z"
    }
]
```

```
PUT {{baseUrl}}/users/notifications/{{notificationId}}/read
Authorization: Bearer {{adminToken}}
```
**Expected Response** (Status: 200 OK):
```json
{
    "message": "Notification marked as read"
}
```

```
PUT {{baseUrl}}/users/notifications/read-all
Authorization: Bearer {{adminToken}}
```
**Expected Response** (Status: 200 OK):
```json
{
    "message": "All notifications marked as read"
}
```

#### 2.8 Work Hours
```
GET {{baseUrl}}/users/work-hours
Authorization: Bearer {{adminToken}}
```
**Expected Response** (Status: 200 OK):
```json
{
    "start": "09:00",
    "end": "17:00"
}
```

```
POST {{baseUrl}}/users/work-hours
Authorization: Bearer {{adminToken}}
Content-Type: application/json

{
    "start": "08:00",
    "end": "16:00"
}
```
**Expected Response** (Status: 200 OK):
```json
{
    "message": "Work hours updated successfully"
}
```

#### 2.9 Manage Invitations
```
POST {{baseUrl}}/users/invites
Authorization: Bearer {{adminToken}}
Content-Type: application/json

{
    "inviteId": "invitation-id",
    "action": "accept",
    "type": "project"
}
```
**Expected Response** (Status: 200 OK):
```json
{
    "message": "Invitation accepted"
}
```

### 3. Team Management

#### 3.1 Create Team
```
POST {{baseUrl}}/teams
Authorization: Bearer {{adminToken}}
Content-Type: application/json

{
    "name": "Development Team",
    "description": "Main development team for the project",
    "teamType": "department",
    "maxMembers": 10
}
```

**Expected Response** (Status: 201 Created):
```json
{
    "_id": "60d5ec9af682727af44378b1", // Team ID
    "name": "Development Team",
    "description": "Main development team for the project",
    "teamType": "department",
    "owner": "60d5ec9af682727af44378a1", // Admin ID
    "maxMembers": 10,
    "members": [
        {
            "user": "60d5ec9af682727af44378a1",
            "role": "admin",
            "status": "active",
            "permissions": {
                "canAddProjects": true,
                "canRemoveProjects": true,
                "canViewAllProjects": true
            },
            "_id": "60d5ec9af682727af44378c1" // Member entry ID
        }
    ],
    "isActive": true,
    "createdAt": "2023-10-25T14:35:10.123Z",
    "updatedAt": "2023-10-25T14:35:10.123Z"
}
```
*Save the _id to `teamId` environment variable*

#### 3.2 Get All Teams
```
GET {{baseUrl}}/teams
Authorization: Bearer {{adminToken}}
```

**Expected Response** (Status: 200 OK):
```json
[
    {
        "_id": "60d5ec9af682727af44378b1",
        "name": "Development Team",
        "description": "Main development team for the project",
        "teamType": "department",
        "owner": {
            "_id": "60d5ec9af682727af44378a1",
            "name": "Admin Manager",
            "email": "admin@example.com"
        },
        "maxMembers": 10,
        "members": [
            // Member details
        ],
        "isActive": true,
        "createdAt": "2023-10-25T14:35:10.123Z",
        "updatedAt": "2023-10-25T14:35:10.123Z"
    }
]
```

#### 3.3 Get Team Details
```
GET {{baseUrl}}/teams/{{teamId}}
Authorization: Bearer {{adminToken}}
```

**Expected Response** (Status: 200 OK):
```json
{
    "_id": "60d5ec9af682727af44378b1",
    "name": "Development Team",
    "description": "Main development team for the project",
    "teamType": "department",
    "owner": {
        "_id": "60d5ec9af682727af44378a1",
        "name": "Admin Manager",
        "email": "admin@example.com"
    },
    "maxMembers": 10,
    "members": [
        {
            "user": {
                "_id": "60d5ec9af682727af44378a1",
                "name": "Admin Manager",
                "email": "admin@example.com"
            },
            "role": "admin",
            "status": "active",
            "permissions": {
                "canAddProjects": true,
                "canRemoveProjects": true,
                "canViewAllProjects": true
            },
            "_id": "60d5ec9af682727af44378c1"
        }
    ],
    "projects": [],
    "isActive": true,
    "createdAt": "2023-10-25T14:35:10.123Z",
    "updatedAt": "2023-10-25T14:35:10.123Z"
}
```

#### 3.4 Add Team Member
```
POST {{baseUrl}}/teams/{{teamId}}/members
Authorization: Bearer {{adminToken}}
Content-Type: application/json

{
    "userId": "{{memberId}}",
    "role": "member",
    "permissions": {
        "canAddProjects": true,
        "canRemoveProjects": false,
        "canViewAllProjects": true
    }
}
```

**Expected Response** (Status: 200 OK):
```json
{
    "_id": "60d5ec9af682727af44378b1",
    "name": "Development Team",
    "description": "Main development team for the project",
    "teamType": "department",
    "owner": "60d5ec9af682727af44378a1",
    "maxMembers": 10,
    "members": [
        {
            "user": "60d5ec9af682727af44378a1",
            "role": "admin",
            "status": "active",
            "permissions": {
                "canAddProjects": true,
                "canRemoveProjects": true,
                "canViewAllProjects": true
            },
            "_id": "60d5ec9af682727af44378c1"
        },
        {
            "user": "60d5ec9af682727af44378a2", // New member
            "role": "member",
            "status": "active",
            "permissions": {
                "canAddProjects": true,
                "canRemoveProjects": false,
                "canViewAllProjects": true
            },
            "invitedBy": "60d5ec9af682727af44378a1",
            "_id": "60d5ec9af682727af44378c2"
        }
    ],
    "isActive": true,
    "updatedAt": "2023-10-25T14:40:10.123Z"
}
```

#### 3.5 Get Team Members
```
GET {{baseUrl}}/teams/{{teamId}}/members
Authorization: Bearer {{adminToken}}
```

**Expected Response** (Status: 200 OK):
```json
[
    {
        "user": {
            "_id": "60d5ec9af682727af44378a1",
            "name": "Admin Manager",
            "email": "admin@example.com",
            "avatar": null
        },
        "role": "admin",
        "status": "active",
        "permissions": {
            "canAddProjects": true,
            "canRemoveProjects": true,
            "canViewAllProjects": true
        },
        "_id": "60d5ec9af682727af44378c1"
    },
    {
        "user": {
            "_id": "60d5ec9af682727af44378a2",
            "name": "Team Member",
            "email": "member@example.com",
            "avatar": null
        },
        "role": "member",
        "status": "active",
        "permissions": {
            "canAddProjects": true,
            "canRemoveProjects": false,
            "canViewAllProjects": true
        },
        "invitedBy": "60d5ec9af682727af44378a1",
        "_id": "60d5ec9af682727af44378c2"
    }
]
```

#### 3.6 Update Team Member Role
```
PATCH {{baseUrl}}/teams/{{teamId}}/members/{{memberId}}/role
Authorization: Bearer {{adminToken}}
Content-Type: application/json

{
    "role": "admin"
}
```

**Expected Response** (Status: 200 OK):
```json
{
    "_id": "60d5ec9af682727af44378b1",
    "name": "Development Team",
    "description": "Main development team for the project",
    "teamType": "department",
    "owner": "60d5ec9af682727af44378a1",
    "maxMembers": 10,
    "members": [
        // Admin details
        {
            "user": "60d5ec9af682727af44378a2",
            "role": "admin", // Updated role
            "status": "active",
            "permissions": {
                "canAddProjects": true,
                "canRemoveProjects": false,
                "canViewAllProjects": true
            },
            "invitedBy": "60d5ec9af682727af44378a1",
            "_id": "60d5ec9af682727af44378c2"
        }
    ],
    "isActive": true,
    "updatedAt": "2023-10-25T14:45:10.123Z"
}
```

#### 3.7 Update Team
```
PUT {{baseUrl}}/teams/{{teamId}}
Authorization: Bearer {{adminToken}}
Content-Type: application/json

{
    "name": "Development Team Alpha",
    "description": "Main development team - Alpha Division",
    "isActive": true
}
```

**Expected Response** (Status: 200 OK):
```json
{
    "_id": "60d5ec9af682727af44378b1",
    "name": "Development Team Alpha", // Updated name
    "description": "Main development team - Alpha Division", // Updated description
    "teamType": "department",
    "owner": "60d5ec9af682727af44378a1",
    "maxMembers": 10,
    "members": [
        // Team members
    ],
    "isActive": true,
    "createdAt": "2023-10-25T14:35:10.123Z",
    "updatedAt": "2023-10-25T14:50:10.123Z"
}
```

#### 3.8 Update Team Statistics
```
POST {{baseUrl}}/teams/{{teamId}}/stats
Authorization: Bearer {{adminToken}}
```

**Expected Response** (Status: 200 OK):
```json
{
    "taskStats": {
        "totalTasks": 0,
        "completedTasks": 0,
        "pendingTasks": 0,
        "lastUpdated": "2023-10-25T14:55:10.123Z"
    },
    "message": "Team task statistics updated successfully"
}
```

#### 3.9 Team Permissions
```
GET {{baseUrl}}/teams/{{teamId}}/permissions
Authorization: Bearer {{adminToken}}
```
**Expected Response** (Status: 200 OK):
```json
{
    "canAddProjects": true,
    "canRemoveProjects": true,
    "canViewAllProjects": true
}
```

```
PUT {{baseUrl}}/teams/{{teamId}}/permissions
Authorization: Bearer {{adminToken}}
Content-Type: application/json

{
    "canAddProjects": false,
    "canRemoveProjects": true,
    "canViewAllProjects": true
}
```
**Expected Response** (Status: 200 OK):
```json
{
    "message": "Team permissions updated successfully"
}
```

#### 3.10 Add Project to Team
```
POST {{baseUrl}}/teams/{{teamId}}/projects
Authorization: Bearer {{adminToken}}
Content-Type: application/json

{
    "projectId": "{{projectId}}"
}
```
**Expected Response** (Status: 200 OK):
```json
{
    "message": "Project added to team"
}
```

### 4. Project Management

#### 4.1 Create Project
```
POST {{baseUrl}}/projects
Authorization: Bearer {{adminToken}}
Content-Type: application/json

{
    "title": "E-commerce Platform",
    "description": "Building a new e-commerce platform with user authentication and payment gateway",
    "projectType": "team",
    "team": "{{teamId}}",
    "priority": "high",
    "dueDate": "2023-12-31T00:00:00.000Z",
    "settings": {
        "visibility": "team",
        "allowComments": true,
        "allowGuestAccess": false,
        "notifications": {
            "enabled": true,
            "frequency": "daily"
        }
    }
}
```

**Expected Response** (Status: 201 Created):
```json
{
    "_id": "60d5ec9af682727af44378d1", // Project ID
    "title": "E-commerce Platform",
    "description": "Building a new e-commerce platform with user authentication and payment gateway",
    "projectType": "team",
    "team": "60d5ec9af682727af44378b1",
    "owner": "60d5ec9af682727af44378a1",
    "priority": "high",
    "dueDate": "2023-12-31T00:00:00.000Z",
    "status": "active",
    "settings": {
        "visibility": "team",
        "allowComments": true,
        "allowGuestAccess": false,
        "notifications": {
            "enabled": true,
            "frequency": "daily"
        }
    },
    "members": [
        {
            "user": "60d5ec9af682727af44378a1",
            "role": "admin",
            "permissions": {
                "canEditTasks": true,
                "canDeleteTasks": true,
                "canInviteMembers": true
            },
            "addedBy": "60d5ec9af682727af44378a1",
            "_id": "60d5ec9af682727af44378e1"
        }
    ],
    "workflow": ["To Do", "In Progress", "Done"],
    "tags": [],
    "createdAt": "2023-10-25T15:00:10.123Z",
    "updatedAt": "2023-10-25T15:00:10.123Z"
}
```
*Save the _id to `projectId` environment variable*

#### 4.2 Get All Projects
```
GET {{baseUrl}}/projects
Authorization: Bearer {{adminToken}}
```

**Expected Response** (Status: 200 OK):
```json
[
    {
        "_id": "60d5ec9af682727af44378d1",
        "title": "E-commerce Platform",
        "description": "Building a new e-commerce platform with user authentication and payment gateway",
        "projectType": "team",
        "team": "60d5ec9af682727af44378b1",
        "owner": {
            "_id": "60d5ec9af682727af44378a1",
            "name": "Admin Manager",
            "email": "admin@example.com"
        },
        "priority": "high",
        "dueDate": "2023-12-31T00:00:00.000Z",
        "status": "active",
        "members": [
            // Project members
        ],
        "tags": [],
        "createdAt": "2023-10-25T15:00:10.123Z",
        "updatedAt": "2023-10-25T15:00:10.123Z"
    }
]
```

#### 4.3 Get Project Details
```
GET {{baseUrl}}/projects/{{projectId}}
Authorization: Bearer {{adminToken}}
```

**Expected Response** (Status: 200 OK):
```json
{
    "_id": "60d5ec9af682727af44378d1",
    "title": "E-commerce Platform",
    "description": "Building a new e-commerce platform with user authentication and payment gateway",
    "projectType": "team",
    "team": {
        "_id": "60d5ec9af682727af44378b1",
        "name": "Development Team Alpha"
    },
    "owner": {
        "_id": "60d5ec9af682727af44378a1",
        "name": "Admin Manager",
        "email": "admin@example.com"
    },
    "priority": "high",
    "dueDate": "2023-12-31T00:00:00.000Z",
    "status": "active",
    "settings": {
        "visibility": "team",
        "allowComments": true,
        "allowGuestAccess": false,
        "notifications": {
            "enabled": true,
            "frequency": "daily"
        }
    },
    "members": [
        {
            "user": {
                "_id": "60d5ec9af682727af44378a1",
                "name": "Admin Manager",
                "email": "admin@example.com"
            },
            "role": "admin",
            "permissions": {
                "canEditTasks": true,
                "canDeleteTasks": true,
                "canInviteMembers": true
            },
            "addedBy": "60d5ec9af682727af44378a1",
            "_id": "60d5ec9af682727af44378e1"
        }
    ],
    "workflow": ["To Do", "In Progress", "Done"],
    "tags": [],
    "createdAt": "2023-10-25T15:00:10.123Z",
    "updatedAt": "2023-10-25T15:00:10.123Z"
}
```

#### 4.4 Add Project Member
```
POST {{baseUrl}}/projects/{{projectId}}/members
Authorization: Bearer {{adminToken}}
Content-Type: application/json

{
    "userId": "{{memberId}}",
    "role": "editor",
    "permissions": {
        "canEditTasks": true,
        "canDeleteTasks": false,
        "canInviteMembers": false
    }
}
```

**Expected Response** (Status: 200 OK):
```json
{
    "_id": "60d5ec9af682727af44378d1",
    "title": "E-commerce Platform",
    "description": "Building a new e-commerce platform with user authentication and payment gateway",
    "members": [
        // Admin member
        {
            "user": "60d5ec9af682727af44378a2",
            "role": "editor",
            "permissions": {
                "canEditTasks": true,
                "canDeleteTasks": false,
                "canInviteMembers": false
            },
            "addedBy": "60d5ec9af682727af44378a1",
            "_id": "60d5ec9af682727af44378e2"
        }
    ],
    // Other project details
    "updatedAt": "2023-10-25T15:10:10.123Z"
}
```

#### 4.5 Get Project Members
```
GET {{baseUrl}}/projects/{{projectId}}/members
Authorization: Bearer {{adminToken}}
```

**Expected Response** (Status: 200 OK):
```json
[
    {
        "user": {
            "_id": "60d5ec9af682727af44378a1",
            "name": "Admin Manager",
            "email": "admin@example.com",
            "avatar": null
        },
        "role": "admin",
        "permissions": {
            "canEditTasks": true,
            "canDeleteTasks": true,
            "canInviteMembers": true
        },
        "addedBy": "60d5ec9af682727af44378a1",
        "_id": "60d5ec9af682727af44378e1"
    },
    {
        "user": {
            "_id": "60d5ec9af682727af44378a2",
            "name": "Team Member",
            "email": "member@example.com",
            "avatar": null
        },
        "role": "editor",
        "permissions": {
            "canEditTasks": true,
            "canDeleteTasks": false,
            "canInviteMembers": false
        },
        "addedBy": "60d5ec9af682727af44378a1",
        "_id": "60d5ec9af682727af44378e2"
    }
]
```

#### 4.6 Update Project Settings
```
PUT {{baseUrl}}/projects/{{projectId}}/settings
Authorization: Bearer {{adminToken}}
Content-Type: application/json

{
    "visibility": "private",
    "allowComments": true,
    "allowGuestAccess": false,
    "notifications": {
        "enabled": true,
        "frequency": "instant"
    }
}
```

**Expected Response** (Status: 200 OK):
```json
{
    "settings": {
        "visibility": "private",
        "allowComments": true,
        "allowGuestAccess": false,
        "notifications": {
            "enabled": true,
            "frequency": "instant"
        }
    },
    "message": "Project settings updated successfully"
}
```

#### 4.7 Update Project Workflow
```
PUT {{baseUrl}}/projects/{{projectId}}/workflow
Authorization: Bearer {{adminToken}}
Content-Type: application/json

{
    "workflow": ["Backlog", "To Do", "In Progress", "QA", "Done"]
}
```

**Expected Response** (Status: 200 OK):
```json
{
    "workflow": ["Backlog", "To Do", "In Progress", "QA", "Done"],
    "message": "Project workflow updated successfully"
}
```

#### 4.8 Manage Project Tags
```
POST {{baseUrl}}/projects/{{projectId}}/tags
Authorization: Bearer {{adminToken}}
Content-Type: application/json

{
    "action": "add",
    "tags": ["frontend", "backend", "database", "ui/ux"]
}
```

**Expected Response** (Status: 200 OK):
```json
{
    "tags": ["frontend", "backend", "database", "ui/ux"],
    "message": "Tags added successfully"
}
```

#### 4.9 Update Project
```
PUT {{baseUrl}}/projects/{{projectId}}
Authorization: Bearer {{adminToken}}
Content-Type: application/json

{
    "title": "E-commerce Platform v2",
    "priority": "urgent",
    "status": "active"
}
```

**Expected Response** (Status: 200 OK):
```json
{
    "_id": "60d5ec9af682727af44378d1",
    "title": "E-commerce Platform v2", // Updated title
    "description": "Building a new e-commerce platform with user authentication and payment gateway",
    "projectType": "team",
    "team": "60d5ec9af682727af44378b1",
    "owner": "60d5ec9af682727af44378a1",
    "priority": "urgent", // Updated priority
    "dueDate": "2023-12-31T00:00:00.000Z",
    "status": "active",
    // Other project details
    "updatedAt": "2023-10-25T15:25:10.123Z"
}
```

#### 4.10 Project Statistics
```
GET {{baseUrl}}/projects/{{projectId}}/stats
Authorization: Bearer {{adminToken}}
```
**Expected Response** (Status: 200 OK):
```json
{
    "totalTasks": 10,
    "completedTasks": 5,
    "pendingTasks": 5,
    "progress": 50
}
```

#### 4.11 Project Activity Log
```
GET {{baseUrl}}/projects/{{projectId}}/activity
Authorization: Bearer {{adminToken}}
```
**Expected Response** (Status: 200 OK):
```json
[
    {
        "action": "created",
        "user": "Admin Manager",
        "timestamp": "2025-04-25T10:00:00.000Z",
        "details": "Project created"
    }
]
```

### 5. Task Management

#### 5.1 Create Parent Task
```
POST {{baseUrl}}/tasks
Authorization: Bearer {{adminToken}}
Content-Type: application/json

{
    "project": "{{projectId}}",
    "title": "Implement Authentication System",
    "description": "Create login, registration, and user management system",
    "status": "pending",
    "priority": "high",
    "deadline": "2023-11-30T00:00:00.000Z",
    "tags": ["backend", "auth"]
}
```

**Expected Response** (Status: 201 Created):
```json
{
    "_id": "60d5ec9af682727af44378f1", // Task ID
    "project": "60d5ec9af682727af44378d1",
    "title": "Implement Authentication System",
    "description": "Create login, registration, and user management system",
    "status": "In Progress",
    "priority": "high",
    "deadline": "2023-11-30T00:00:00.000Z",
    "tags": ["backend", "auth"],
    "createdBy": "60d5ec9af682727af44378a1",
    "lastUpdatedBy": "60d5ec9af682727af44378a1",
    "isSubtask": false,
    "subtasks": [],
    "comments": [],
    "attachments": [],
    "watchers": [],
    "createdAt": "2023-10-25T15:30:10.123Z",
    "updatedAt": "2023-10-25T15:30:10.123Z"
}
```
*Save the _id to `taskId` environment variable*

#### 5.2 Add Time Tracking to Task
```
POST {{baseUrl}}/tasks/{{taskId}}/time
Authorization: Bearer {{adminToken}}
Content-Type: application/json

{
    "duration": 120
}
```

**Expected Response** (Status: 200 OK):
```json
{
    "timeTracking": {
        "timeSpent": [
            {
                "user": "60d5ec9af682727af44378a1",
                "duration": 120,
                "date": "2023-10-25T15:35:10.123Z",
                "_id": "60d5ec9af682727af44378g1"
            }
        ],
        "actual": 120
    },
    "message": "Time tracking updated successfully"
}
```

#### 5.3 Add Admin as Task Watcher
```
POST {{baseUrl}}/tasks/{{taskId}}/watchers
Authorization: Bearer {{adminToken}}
```

**Expected Response** (Status: 200 OK):
```json
{
    "message": "Added to task watchers",
    "watchers": ["60d5ec9af682727af44378a1"]
}
```

#### 5.4 Create Subtask
```
POST {{baseUrl}}/tasks/{{taskId}}/subtasks
Authorization: Bearer {{adminToken}}
Content-Type: application/json

{
    "title": "Implement Login Form",
    "description": "Create form with email, password fields and validation",
    "status": "To Do",
    "priority": "medium",
    "assignedTo": "{{memberId}}"
}
```

**Expected Response** (Status: 201 Created):
```json
{
    "_id": "60d5ec9af682727af44378f2", // Subtask ID
    "title": "Implement Login Form",
    "description": "Create form with email, password fields and validation",
    "status": "To Do",
    "priority": "medium",
    "project": "60d5ec9af682727af44378d1",
    "parentTask": "60d5ec9af682727af44378f1",
    "assignedTo": "60d5ec9af682727af44378a2",
    "isSubtask": true,
    "createdBy": "60d5ec9af682727af44378a1",
    "lastUpdatedBy": "60d5ec9af682727af44378a1",
    "subtasks": [],
    "comments": [],
    "attachments": [],
    "watchers": [],
    "createdAt": "2023-10-25T15:40:10.123Z",
    "updatedAt": "2023-10-25T15:40:10.123Z"
}
```
*Save the _id to `subtaskId` environment variable*

#### 5.5 Create Additional Subtasks
```
POST {{baseUrl}}/tasks/{{taskId}}/subtasks
Authorization: Bearer {{adminToken}}
Content-Type: application/json

{
    "title": "Implement Registration Form",
    "description": "Create registration form with all required fields",
    "status": "To Do",
    "priority": "medium"
}
```

**Expected Response** (Status: 201 Created):
```json
{
    "_id": "60d5ec9af682727af44378f3", // Another Subtask ID
    "title": "Implement Registration Form",
    "description": "Create registration form with all required fields",
    "status": "To Do",
    "priority": "medium",
    "project": "60d5ec9af682727af44378d1",
    "parentTask": "60d5ec9af682727af44378f1",
    "isSubtask": true,
    "createdBy": "60d5ec9af682727af44378a1",
    "lastUpdatedBy": "60d5ec9af682727af44378a1",
    // Other fields
}
```

```
POST {{baseUrl}}/tasks/{{taskId}}/subtasks
Authorization: Bearer {{adminToken}}
Content-Type: application/json

{
    "title": "Implement Password Reset",
    "description": "Create password reset functionality",
    "status": "To Do",
    "priority": "low"
}
```

**Expected Response** (Status: 201 Created):
```json
{
    "_id": "60d5ec9af682727af44378f4", // Another Subtask ID
    "title": "Implement Password Reset",
    "description": "Create password reset functionality",
    "status": "To Do",
    "priority": "low",
    "project": "60d5ec9af682727af44378d1",
    "parentTask": "60d5ec9af682727af44378f1",
    "isSubtask": true,
    // Other fields
}
```

#### 5.6 Get All Subtasks
```
GET {{baseUrl}}/tasks/{{taskId}}/subtasks
Authorization: Bearer {{adminToken}}
```

**Expected Response** (Status: 200 OK):
```json
[
    {
        "_id": "60d5ec9af682727af44378f2",
        "title": "Implement Login Form",
        "description": "Create form with email, password fields and validation",
        "status": "To Do",
        "priority": "medium",
        "assignedTo": {
            "_id": "60d5ec9af682727af44378a2",
            "name": "Team Member",
            "email": "member@example.com"
        },
        "createdBy": {
            "_id": "60d5ec9af682727af44378a1",
            "name": "Admin Manager"
        },
        // Other fields
    },
    {
        "_id": "60d5ec9af682727af44378f3",
        "title": "Implement Registration Form",
        // Other fields
    },
    {
        "_id": "60d5ec9af682727af44378f4",
        "title": "Implement Password Reset",
        // Other fields
    }
]
```

#### 5.7 Update Subtask
```
PUT {{baseUrl}}/tasks/{{taskId}}/subtasks/{{subtaskId}}
Authorization: Bearer {{adminToken}}
Content-Type: application/json

{
    "title": "Implement Login Form with Validation",
    "status": "In Progress"
}
```

**Expected Response** (Status: 200 OK):
```json
{
    "_id": "60d5ec9af682727af44378f2",
    "title": "Implement Login Form with Validation", // Updated title
    "description": "Create form with email, password fields and validation",
    "status": "In Progress", // Updated status
    "priority": "medium",
    "assignedTo": "60d5ec9af682727af44378a2",
    "lastUpdatedBy": "60d5ec9af682727af44378a1",
    // Other fields
    "updatedAt": "2023-10-25T15:50:10.123Z"
}
```

#### 5.8 Reorder Subtasks
```
PUT {{baseUrl}}/tasks/{{taskId}}/subtasks-order
Authorization: Bearer {{adminToken}}
Content-Type: application/json

{
    "order": ["60d5ec9af682727af44378f3", "60d5ec9af682727af44378f2", "60d5ec9af682727af44378f4"]
}
```

**Expected Response** (Status: 200 OK):
```json
{
    "message": "Subtask order updated successfully",
    "order": ["60d5ec9af682727af44378f3", "60d5ec9af682727af44378f2", "60d5ec9af682727af44378f4"]
}
```

#### 5.9 Test Advanced Task Views

##### 5.9.1 Task Tree View
```
GET {{baseUrl}}/tasks/tree?projectId={{projectId}}
Authorization: Bearer {{adminToken}}
```

**Expected Response** (Status: 200 OK):
```json
[
    {
        "_id": "60d5ec9af682727af44378f1",
        "title": "Implement Authentication System",
        "status": "In Progress",
        "priority": "high",
        "assignedTo": null,
        "deadline": "2023-11-30T00:00:00.000Z",
        "progress": 33, // Calculated based on subtasks
        "children": [
            {
                "_id": "60d5ec9af682727af44378f3",
                "title": "Implement Registration Form",
                "status": "To Do",
                "priority": "medium",
                "assignedTo": null,
                "deadline": null,
                "progress": 0
            },
            {
                "_id": "60d5ec9af682727af44378f2",
                "title": "Implement Login Form with Validation",
                "status": "In Progress",
                "priority": "medium",
                "assignedTo": {
                    "_id": "60d5ec9af682727af44378a2",
                    "name": "Team Member",
                    "email": "member@example.com",
                    "avatar": null
                },
                "deadline": null,
                "progress": 50
            },
            {
                "_id": "60d5ec9af682727af44378f4",
                "title": "Implement Password Reset",
                "status": "To Do",
                "priority": "low",
                "assignedTo": null,
                "deadline": null,
                "progress": 0
            }
        ]
    }
]
```

##### 5.9.2 Tasks By Status
```
GET {{baseUrl}}/tasks/by-status?projectId={{projectId}}
Authorization: Bearer {{adminToken}}
```

**Expected Response** (Status: 200 OK):
```json
{
    "workflow": ["Backlog", "To Do", "In Progress", "QA", "Done"],
    "tasksByStatus": {
        "Backlog": [],
        "To Do": [
            // Tasks in To Do state
        ],
        "In Progress": [
            {
                "_id": "60d5ec9af682727af44378f1",
                "title": "Implement Authentication System",
                // Task details
                "subtasks": [
                    // References to subtasks
                ]
            }
        ],
        "QA": [],
        "Done": []
    }
}
```

##### 5.9.3 Project Tasks Details
```
GET {{baseUrl}}/tasks/project/{{projectId}}/details
Authorization: Bearer {{adminToken}}
```

**Expected Response** (Status: 200 OK):
```json
{
    "projectId": "60d5ec9af682727af44378d1",
    "statistics": {
        "totalTasks": 1,
        "totalSubtasks": 3,
        "completedTasks": 0,
        "completedSubtasks": 0,
        "tasksByPriority": {
            "high": 1
        },
        "tasksByStatus": {
            "Backlog": 0,
            "To Do": 0,
            "In Progress": 1,
            "QA": 0,
            "Done": 0
        }
    },
    "tasks": [
        {
            "_id": "60d5ec9af682727af44378f1",
            "title": "Implement Authentication System",
            // Detailed task info
            "subtasks": [
                // Detailed subtask info
            ],
            "totalSubtasks": 3,
            "completedSubtasks": 0,
            "progress": 33
        }
    ]
}
```

#### 5.10 Get Tasks with Filters
```
GET {{baseUrl}}/tasks?project={{projectId}}&status=In Progress&priority=high
Authorization: Bearer {{adminToken}}
```

**Expected Response** (Status: 200 OK):
```json
[
    {
        "_id": "60d5ec9af682727af44378f1",
        "title": "Implement Authentication System",
        "description": "Create login, registration, and user management system",
        "status": "In Progress",
        "priority": "high",
        "assignedTo": null,
        "createdBy": {
            "_id": "60d5ec9af682727af44378a1",
            "name": "Admin Manager"
        },
        "parentTask": null,
        // Other task details
    }
]
```

#### 5.11 Get Specific Task Details
```
GET {{baseUrl}}/tasks/{{taskId}}
Authorization: Bearer {{adminToken}}
```

**Expected Response** (Status: 200 OK):
```json
{
    "_id": "60d5ec9af682727af44378f1",
    "project": "60d5ec9af682727af44378d1",
    "title": "Implement Authentication System",
    "description": "Create login, registration, and user management system",
    "status": "In Progress",
    "priority": "high",
    "deadline": "2023-11-30T00:00:00.000Z",
    "tags": ["backend", "auth"],
    "createdBy": {
        "_id": "60d5ec9af682727af44378a1",
        "name": "Admin Manager"
    },
    "lastUpdatedBy": "60d5ec9af682727af44378a1",
    "subtasks": [
        // Subtask references
    ],
    "comments": [],
    "attachments": [],
    "watchers": [
        {
            "_id": "60d5ec9af682727af44378a1",
            "name": "Admin Manager",
            "email": "admin@example.com"
        }
    ],
    "timeTracking": {
        "timeSpent": [
            {
                "user": "60d5ec9af682727af44378a1",
                "duration": 120,
                "date": "2023-10-25T15:35:10.123Z",
                "_id": "60d5ec9af682727af44378g1"
            }
        ],
        "actual": 120
    },
    "createdAt": "2023-10-25T15:30:10.123Z",
    "updatedAt": "2023-10-25T15:50:10.123Z"
}
```

### 6. Comment Management

#### 6.1 Create Comment on Task

```
POST {{baseUrl}}/comments/task/{{taskId}}
Authorization: Bearer {{adminToken}}
Content-Type: application/json

{
    "content": "This is a test comment on the authentication system task."
}
```

**Expected Response** (Status: 201 Created):
```json
{
    "_id": "60d5ec9af682727af44378g1", 
    "task": "60d5ec9af682727af44378f1",
    "user": {
        "_id": "60d5ec9af682727af44378a1",
        "name": "Admin Manager",
        "email": "admin@example.com"
    },
    "content": "This is a test comment on the authentication system task.",
    "replies": [],
    "createdAt": "2023-10-25T16:00:10.123Z",
    "updatedAt": "2023-10-25T16:00:10.123Z"
}
```
*Save the _id to `commentId` environment variable*

#### 6.2 Get Task Comments

```
GET {{baseUrl}}/comments/task/{{taskId}}
Authorization: Bearer {{adminToken}}
```

**Expected Response** (Status: 200 OK):
```json
[
    {
        "_id": "60d5ec9af682727af44378g1",
        "task": "60d5ec9af682727af44378f1",
        "user": {
            "_id": "60d5ec9af682727af44378a1",
            "name": "Admin Manager",
            "email": "admin@example.com"
        },
        "content": "This is a test comment on the authentication system task.",
        "replies": [],
        "createdAt": "2023-10-25T16:00:10.123Z",
        "updatedAt": "2023-10-25T16:00:10.123Z"
    }
]
```

#### 6.3 Update Comment

```
PUT {{baseUrl}}/comments/{{commentId}}
Authorization: Bearer {{adminToken}}
Content-Type: application/json

{
    "content": "Updated comment with more information about the authentication system task."
}
```

**Expected Response** (Status: 200 OK):
```json
{
    "_id": "60d5ec9af682727af44378g1",
    "task": "60d5ec9af682727af44378f1",
    "user": {
        "_id": "60d5ec9af682727af44378a1",
        "name": "Admin Manager",
        "email": "admin@example.com"
    },
    "content": "Updated comment with more information about the authentication system task.",
    "replies": [],
    "createdAt": "2023-10-25T16:00:10.123Z",
    "updatedAt": "2023-10-25T16:05:10.123Z"
}
```

#### 6.4 Add Comment Reply

```
POST {{baseUrl}}/comments/{{commentId}}/replies
Authorization: Bearer {{memberToken}}
Content-Type: application/json

{
    "content": "I have a question about this task. Can we discuss it in the next meeting?"
}
```

**Expected Response** (Status: 201 Created):
```json
{
    "_id": "60d5ec9af682727af44378g2", 
    "task": "60d5ec9af682727af44378f1",
    "user": {
        "_id": "60d5ec9af682727af44378a2",
        "name": "Team Member",
        "email": "member@example.com"
    },
    "content": "I have a question about this task. Can we discuss it in the next meeting?",
    "createdAt": "2023-10-25T16:10:10.123Z",
    "updatedAt": "2023-10-25T16:10:10.123Z"
}
```

#### 6.5 Get Comment Replies

```
GET {{baseUrl}}/comments/{{commentId}}/replies
Authorization: Bearer {{adminToken}}
```

**Expected Response** (Status: 200 OK):
```json
[
    {
        "_id": "60d5ec9af682727af44378g2",
        "task": "60d5ec9af682727af44378f1",
        "user": {
            "_id": "60d5ec9af682727af44378a2",
            "name": "Team Member",
            "email": "member@example.com"
        },
        "content": "I have a question about this task. Can we discuss it in the next meeting?",
        "createdAt": "2023-10-25T16:10:10.123Z",
        "updatedAt": "2023-10-25T16:10:10.123Z"
    }
]
```

### 7. Attachment Management

#### 7.1 Upload Attachment to Task

```
POST {{baseUrl}}/attachments/task/{{taskId}}
Authorization: Bearer {{adminToken}}
Content-Type: multipart/form-data
Body: form-data
Key: file, Value: [Select a file]
```

**Expected Response** (Status: 201 Created):
```json
{
    "_id": "60d5ec9af682727af44378h1", 
    "task": "60d5ec9af682727af44378f1",
    "filename": "test-document.pdf",
    "filepath": "uploads/7f8d95e2-1a3c-4a78-b56a-1234567890.pdf",
    "fileType": "application/pdf",
    "fileSize": 45678,
    "uploadedBy": "60d5ec9af682727af44378a1",
    "createdAt": "2023-10-25T16:15:10.123Z",
    "updatedAt": "2023-10-25T16:15:10.123Z"
}
```
*Save the _id to `attachmentId` environment variable*

#### 7.2 Get Task Attachments

```
GET {{baseUrl}}/attachments/task/{{taskId}}
Authorization: Bearer {{adminToken}}
```

**Expected Response** (Status: 200 OK):
```json
[
    {
        "_id": "60d5ec9af682727af44378h1",
        "task": "60d5ec9af682727af44378f1",
        "filename": "test-document.pdf",
        "filepath": "uploads/7f8d95e2-1a3c-4a78-b56a-1234567890.pdf",
        "fileType": "application/pdf",
        "fileSize": 45678,
        "uploadedBy": {
            "_id": "60d5ec9af682727af44378a1",
            "name": "Admin Manager",
            "email": "admin@example.com"
        },
        "createdAt": "2023-10-25T16:15:10.123Z",
        "updatedAt": "2023-10-25T16:15:10.123Z"
    }
]
```

#### 7.3 Download a Specific Attachment

```
GET {{baseUrl}}/attachments/{{attachmentId}}
Authorization: Bearer {{adminToken}}
```

**Expected Response** (Status: 200 OK):
*File download*

### 8. Time Tracking

#### 8.1 Log Time on Task

```
POST {{baseUrl}}/timelogs/task/{{taskId}}
Authorization: Bearer {{adminToken}}
Content-Type: application/json

{
    "timeSpent": 120,
    "description": "Researching authentication libraries and setting up initial structure",
    "startTime": "2023-10-25T14:00:00.000Z",
    "endTime": "2023-10-25T16:00:00.000Z",
    "billable": true
}
```

**Expected Response** (Status: 201 Created):
```json
{
    "_id": "60d5ec9af682727af44378i1", 
    "task": "60d5ec9af682727af44378f1",
    "user": {
        "_id": "60d5ec9af682727af44378a1",
        "name": "Admin Manager",
        "email": "admin@example.com"
    },
    "timeSpent": 120,
    "description": "Researching authentication libraries and setting up initial structure",
    "startTime": "2023-10-25T14:00:00.000Z",
    "endTime": "2023-10-25T16:00:00.000Z",
    "billable": true,
    "status": "completed",
    "createdAt": "2023-10-25T16:20:10.123Z",
    "updatedAt": "2023-10-25T16:20:10.123Z"
}
```
*Save the _id to `timeLogId` environment variable*

#### 8.2 Get Task Time Logs

```
GET {{baseUrl}}/timelogs/task/{{taskId}}
Authorization: Bearer {{adminToken}}
```

**Expected Response** (Status: 200 OK):
```json
{
    "logs": [
        {
            "_id": "60d5ec9af682727af44378i1",
            "task": "60d5ec9af682727af44378f1",
            "user": {
                "_id": "60d5ec9af682727af44378a1",
                "name": "Admin Manager",
                "email": "admin@example.com"
            },
            "timeSpent": 120,
            "description": "Researching authentication libraries and setting up initial structure",
            "startTime": "2023-10-25T14:00:00.000Z",
            "endTime": "2023-10-25T16:00:00.000Z",
            "billable": true,
            "status": "completed",
            "createdAt": "2023-10-25T16:20:10.123Z",
            "updatedAt": "2023-10-25T16:20:10.123Z"
        }
    ],
    "totalTime": 120,
    "count": 1
}
```

#### 8.3 Update a Time Log Entry

```
PUT {{baseUrl}}/timelogs/{{timeLogId}}
Authorization: Bearer {{adminToken}}
Content-Type: application/json

{
    "timeSpent": 150,
    "description": "Researching authentication libraries, implementing initial structure, and testing"
}
```

**Expected Response** (Status: 200 OK):
```json
{
    "_id": "60d5ec9af682727af44378i1",
    "task": "60d5ec9af682727af44378f1",
    "user": {
        "_id": "60d5ec9af682727af44378a1",
        "name": "Admin Manager",
        "email": "admin@example.com"
    },
    "timeSpent": 150,
    "description": "Researching authentication libraries, implementing initial structure, and testing",
    "startTime": "2023-10-25T14:00:00.000Z",
    "endTime": "2023-10-25T16:00:00.000Z",
    "billable": true,
    "status": "completed",
    "createdAt": "2023-10-25T16:20:10.123Z",
    "updatedAt": "2023-10-25T16:25:10.123Z"
}
```

#### 8.4 Get User's Time Logs

```
GET {{baseUrl}}/timelogs/user?startDate=2023-10-01&endDate=2023-10-31
Authorization: Bearer {{adminToken}}
```

**Expected Response** (Status: 200 OK):
```json
{
    "logs": [
        {
            "_id": "60d5ec9af682727af44378i1",
            "task": {
                "_id": "60d5ec9af682727af44378f1",
                "title": "Implement Authentication System",
                "project": {
                    "_id": "60d5ec9af682727af44378d1",
                    "title": "E-commerce Platform v2"
                }
            },
            "timeSpent": 150,
            "description": "Researching authentication libraries, implementing initial structure, and testing",
            "startTime": "2023-10-25T14:00:00.000Z",
            "endTime": "2023-10-25T16:00:00.000Z",
            "createdAt": "2023-10-25T16:20:10.123Z"
        }
    ],
    "logsByDay": [
        {
            "date": "2023-10-25",
            "logs": [],
            "totalTime": 150
        }
    ],
    "totalTime": 150,
    "count": 1
}
```

#### 8.5 Get Project Time Reports

```
GET {{baseUrl}}/timelogs/project/{{projectId}}/report?groupBy=user
Authorization: Bearer {{adminToken}}
```

**Expected Response** (Status: 200 OK):
```json
{
    "logs": [],
    "summary": {
        "totalTime": 150,
        "billableTime": 150,
        "nonBillableTime": 0
    },
    "grouped": [
        {
            "user": {
                "_id": "60d5ec9af682727af44378a1",
                "name": "Admin Manager",
                "email": "admin@example.com"
            },
            "logs": [],
            "totalTime": 150,
            "billableTime": 150
        }
    ]
}
```

### 9. Task Notifications

#### 9.1 Check Task with Notifications 

```
GET {{baseUrl}}/tasks/{{taskId}}
Authorization: Bearer {{adminToken}}
```

**Expected Response** (Status: 200 OK):
```json
{
    "_id": "60d5ec9af682727af44378f1",
    "notifications": [
        {
            "user": "60d5ec9af682727af44378a1",
            "message": "Task \"Implement Authentication System\" was updated",
            "action": "update",
            "actorUser": "60d5ec9af682727af44378a1",
            "isRead": false,
            "createdAt": "2023-10-25T16:30:10.123Z"
        }
    ],
    "updatedAt": "2023-10-25T15:50:10.123Z"
}
```

### 10. Testing Role-Based Access Control

#### 10.1 Member Tests
*Switch to using the member token for these requests*

```
GET {{baseUrl}}/projects/{{projectId}}
Authorization: Bearer {{memberToken}}
```

**Expected Response** (Status: 200 OK):
```json
{
    "_id": "60d5ec9af682727af44378d1",
    "title": "E-commerce Platform v2",
    // Project details as seen by a team member
}
```

```
GET {{baseUrl}}/tasks/{{taskId}}
Authorization: Bearer {{memberToken}}
```

**Expected Response** (Status: 200 OK):
```json
{
    "_id": "60d5ec9af682727af44378f1",
    "title": "Implement Authentication System",
    // Task details as seen by a team member
}
```

```
PUT {{baseUrl}}/tasks/{{taskId}}/subtasks/{{subtaskId}}
Authorization: Bearer {{memberToken}}
Content-Type: application/json

{
    "status": "completed"
}
```

**Expected Response** (Status: 200 OK):
```json
{
    "_id": "60d5ec9af682727af44378f2",
    "title": "Implement Login Form with Validation",
    "status": "completed", // Updated status
    // Other task details
}
```

```
POST {{baseUrl}}/tasks/{{taskId}}/time
Authorization: Bearer {{memberToken}}
Content-Type: application/json

{
    "duration": 60
}
```

**Expected Response** (Status: 200 OK):
```json
{
    "timeTracking": {
        "timeSpent": [
            // Previous time entry
            {
                "user": "60d5ec9af682727af44378a2",
                "duration": 60,
                "date": "2023-10-25T16:30:10.123Z",
                "_id": "60d5ec9af682727af44378g2"
            }
        ],
        "actual": 180 // Total time (120 + 60)
    },
    "message": "Time tracking updated successfully"
}
```

#### 10.2 Permission Tests
*Try operations that should be restricted*

```
PUT {{baseUrl}}/projects/{{projectId}}/workflow
Authorization: Bearer {{memberToken}}
Content-Type: application/json

{
    "workflow": ["Backlog", "To Do", "In Progress", "Review", "Done"]
}
```

**Expected Response** (Status: 403 Forbidden):
```json
{
    "error": "Insufficient project permissions. Required role: admin"
}
```

```
DELETE {{baseUrl}}/projects/{{projectId}}
Authorization: Bearer {{memberToken}}
```

**Expected Response** (Status: 403 Forbidden):
```json
{
    "error": "Project not found or unauthorized"
}
```

### 11. Cleanup Tests

#### 11.1 Delete Time Log

```
DELETE {{baseUrl}}/timelogs/{{timeLogId}}
Authorization: Bearer {{adminToken}}
```

**Expected Response** (Status: 200 OK):
```json
{
    "message": "Time log deleted successfully"
}
```

#### 11.2 Delete Attachment

```
DELETE {{baseUrl}}/attachments/{{attachmentId}}
Authorization: Bearer {{adminToken}}
```

**Expected Response** (Status: 200 OK):
```json
{
    "message": "Attachment deleted successfully"
}
```

#### 11.3 Delete Comment

```
DELETE {{baseUrl}}/comments/{{commentId}}
Authorization: Bearer {{adminToken}}
```

**Expected Response** (Status: 200 OK):
```json
{
    "message": "Comment deleted successfully"
}
```

#### 11.4 Remove Task Watcher
```
DELETE {{baseUrl}}/tasks/{{taskId}}/watchers
Authorization: Bearer {{adminToken}}
```

**Expected Response** (Status: 200 OK):
```json
{
    "message": "Removed from task watchers",
    "watchers": []
}
```

#### 11.5 Delete Subtask
```
DELETE {{baseUrl}}/tasks/{{taskId}}/subtasks/{{subtaskId}}
Authorization: Bearer {{adminToken}}
```

**Expected Response** (Status: 200 OK):
```json
{
    "message": "Subtask deleted successfully"
}
```

#### 11.6 Delete Task
```
DELETE {{baseUrl}}/tasks/{{taskId}}
Authorization: Bearer {{adminToken}}
```

**Expected Response** (Status: 200 OK):
```json
{
    "message": "Task deleted successfully"
}
```

#### 11.7 Remove Project Member
```
DELETE {{baseUrl}}/projects/{{projectId}}/members/{{memberId}}
Authorization: Bearer {{adminToken}}
```

**Expected Response** (Status: 200 OK):
```json
{
    "_id": "60d5ec9af682727af44378d1",
    "title": "E-commerce Platform v2",
    "members": [
        // Only admin remains
    ],
    // Other project details
}
```

#### 11.8 Delete Project
```
DELETE {{baseUrl}}/projects/{{projectId}}
Authorization: Bearer {{adminToken}}
```

**Expected Response** (Status: 200 OK):
```json
{
    "message": "Project deleted successfully"
}
```

#### 11.9 Remove Team Member
```
DELETE {{baseUrl}}/teams/{{teamId}}/members/{{memberId}}
Authorization: Bearer {{adminToken}}
```

**Expected Response** (Status: 200 OK):
```json
{
    "_id": "60d5ec9af682727af44378b1",
    "name": "Development Team Alpha",
    "members": [
        // Only admin remains
    ],
    // Other team details
}
```

#### 11.10 Delete Team
```
DELETE {{baseUrl}}/teams/{{teamId}}
Authorization: Bearer {{adminToken}}
```

**Expected Response** (Status: 200 OK):
```json
{
    "message": "Team deleted successfully"
}
```

#### 11.11 Logout
```
POST {{baseUrl}}/users/logout
Authorization: Bearer {{adminToken}}
```

**Expected Response** (Status: 200 OK):
```json
{
    "message": "Logged out successfully"
}
```

```
POST {{baseUrl}}/users/logout
Authorization: Bearer {{memberToken}}
```

**Expected Response** (Status: 200 OK):
```json
{
    "message": "Logged out successfully"
}
```

## Tips for Debugging Common Issues

1. **JWT Token Expired**
   - Error: `{ "error": "Token expired", "refreshRequired": true }`
   - Solution: Use the refresh token endpoint

2. **Authentication Failure**
   - Error: `{ "error": "Sorry, I can't assist with that.