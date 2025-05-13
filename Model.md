# Backend Data Models Overview

This document provides a detailed explanation of all Mongoose schemas/models used in the backend, as per the production-grade, multi-tenant, RBAC-enabled architecture. Each section includes schema structure, property types, and relationships to other models.

---

## Organization
- **Purpose:** Represents a company or tenant. All user, project, and data access is scoped by `organizationId` to ensure tenant isolation.
- **Schema:**
  - `name` (String, required): Name of the organization.
  - `domain` (String, optional): Domain for the organization.
  - `createdAt` (Date, default: now): Creation timestamp.
- **Relationships:**
  - Referenced by: `User`, `Project`, `RoleAssignment`, `Contact`, `Deal`, `FieldDefinition`, `FormTemplate`, `FormRequest`, `CommLog`, `Integration`, etc.
- **Notes:** All major entities reference `organizationId` for strict data segregation. Index on `name` for fast lookup.

## User
- **Purpose:** Represents an individual user. Supports multi-organization membership and role-based access control (RBAC).
- **Schema:**
  - `name` (String, required)
  - `email` (String, required, unique)
  - `passwordHash` (String, required)
  - `clerkUserId` (String, optional): For Clerk integration.
  - `organizationId` (ObjectId, ref: Organization): Primary org for single-org users.
  - `roles` (Array): [{ organizationId, roleName }]
  - `lastLogin`, `createdAt`, `updatedAt` (Date)
- **Relationships:**
  - Referenced by: `RoleAssignment`, `Project` (as owner/member), `Task` (as assignee), `Comment`, `Attachment`, `FormRequest`, `Approval`, etc.
- **Notes:** Indexes on `email` and `organizationId`. Used in conjunction with `RoleAssignment` for RBAC.

## RoleAssignment
- **Purpose:** Assigns a specific role to a user within an organization, enabling fine-grained RBAC.
- **Schema:**
  - `userId` (ObjectId, ref: User, required)
  - `organizationId` (ObjectId, ref: Organization, required)
  - `role` (String, required): e.g., Admin, Editor, Viewer
  - `createdAt` (Date)
- **Relationships:**
  - Links `User` and `Organization` for RBAC.
- **Notes:** Allows users to have different roles in different organizations. Index on `(userId, organizationId)`.

## Project
- **Purpose:** Represents a project within an organization. Projects have members, an owner, and are the parent for tasks.
- **Schema:**
  - `name`, `description` (String)
  - `organizationId` (ObjectId, ref: Organization, required)
  - `ownerId` (ObjectId, ref: User, required)
  - `memberIds` (Array of ObjectId, ref: User)
  - `startDate`, `endDate` (Date)
  - `status`, `priority` (String)
  - `createdAt`, `updatedAt` (Date)
- **Relationships:**
  - Has many `Task`, `ChatRoom`, `File`, `Expense`, `Checklist`.
  - Members and owner are `User` references.
- **Notes:** Compound indexes on `(organizationId, ownerId)` and `memberIds`.

## Task
- **Purpose:** Represents a task or subtask within a project. Supports unlimited nesting, dependencies, Gantt/timeline, and budget tracking.
- **Schema:**
  - `projectId` (ObjectId, ref: Project, required)
  - `parentId` (ObjectId, ref: Task, optional): For subtasks.
  - `ancestors` (Array of ObjectId): Materialized path for fast subtree queries.
  - `title`, `description`, `status`, `priority` (String)
  - `assigneeId` (ObjectId, ref: User)
  - `startDate`, `endDate`, `duration`, `baselineStart`, `baselineEnd` (Date/Number)
  - `dependsOn` (Array of ObjectId, ref: Task)
  - `estimateHours`, `actualHours`, `estimateCost`, `actualCost`, `currency` (Number/String)
  - `customFields` (Array)
  - `createdAt`, `updatedAt` (Date)
- **Relationships:**
  - Belongs to `Project`.
  - Can have parent/child `Task` (self-referencing for subtasks).
  - Has many `Comment`, `Attachment`, `Checklist`, `AISuggestion`, `Expense`, `File`.
  - References `User` as assignee.
- **Notes:** Indexes on `(projectId, parentId)`, `ancestors`, `assigneeId`, and `dueDate`.

## Comment
- **Purpose:** Stores comments on tasks, supporting threaded replies and multi-tenancy.
- **Schema:**
  - `task` (ObjectId, ref: Task, required)
  - `user` (ObjectId, ref: User, required)
  - `content` (String, required)
  - `replies` (Array of ObjectId, ref: Comment): For threads.
  - `organizationId` (ObjectId, ref: Organization)
  - `createdAt`, `updatedAt` (Date)
- **Relationships:**
  - Belongs to `Task` and `User`.
  - Supports threaded replies (self-referencing).
- **Notes:** Indexes on `task`, `user`, and `organizationId`.

## Attachment
- **Purpose:** Stores file attachments for tasks.
- **Schema:**
  - `task` (ObjectId, ref: Task, required)
  - `filename`, `filepath`, `fileType`, `fileSize` (String/Number)
  - `uploadedBy` (ObjectId, ref: User)
  - `organizationId` (ObjectId, ref: Organization)
  - `createdAt`, `updatedAt` (Date)
- **Relationships:**
  - Belongs to `Task` and `User`.
- **Notes:** Indexes on `task`, `uploadedBy`, and `organizationId`.

## FieldDefinition
- **Purpose:** Defines custom fields that can be attached to tasks or projects.
- **Schema:**
  - `organizationId` (ObjectId, ref: Organization, required)
  - `projectId` (ObjectId, ref: Project, optional)
  - `name`, `type`, `options`, `required` (String/Array/Boolean)
  - `createdAt`, `updatedAt` (Date)
- **Relationships:**
  - Belongs to `Organization`, optionally to `Project`.
- **Notes:** Indexes on `(organizationId, projectId)`.

## FormTemplate
- **Purpose:** Defines templates for intake forms or custom workflows.
- **Schema:**
  - `organizationId` (ObjectId, ref: Organization, required)
  - `name` (String)
  - `fields` (Array): [{ id, label, type, options, required }]
  - `createdBy` (ObjectId, ref: User)
  - `createdAt` (Date)
- **Relationships:**
  - Belongs to `Organization` and `User` (creator).
  - Used by `FormRequest`.
- **Notes:** Index on `organizationId`.

## FormRequest
- **Purpose:** Stores submissions of intake forms.
- **Schema:**
  - `templateId` (ObjectId, ref: FormTemplate, required)
  - `organizationId` (ObjectId, ref: Organization, required)
  - `submittedBy` (ObjectId, ref: User)
  - `data` (Object): Field values.
  - `status` (String): pending, approved, denied
  - `assignedTo` (ObjectId, ref: User)
  - `createdAt`, `updatedAt` (Date)
- **Relationships:**
  - Belongs to `FormTemplate`, `Organization`, and `User` (submitter/assignee).
- **Notes:** Indexes on `(organizationId, templateId)`.

## Contact
- **Purpose:** CRM contact entity.
- **Schema:**
  - `organizationId` (ObjectId, ref: Organization, required)
  - `name`, `email`, `phone`, `company`, `ownerId`, `source` (String/ObjectId)
  - `createdAt`, `updatedAt` (Date)
- **Relationships:**
  - Belongs to `Organization`.
  - Owner is a `User`.
  - Referenced by `Deal`, `CommLog`.
- **Notes:** Index on `organizationId`.

## Deal
- **Purpose:** CRM deal or pipeline entity.
- **Schema:**
  - `organizationId` (ObjectId, ref: Organization, required)
  - `name` (String)
  - `contactId` (ObjectId, ref: Contact)
  - `value`, `currency`, `stage`, `assignedTo` (Number/String/ObjectId)
  - `createdAt` (Date)
- **Relationships:**
  - Belongs to `Organization` and `Contact`.
  - Assigned to `User`.
  - Referenced by `CommLog`.
- **Notes:** Indexes on `(organizationId, contactId)`.

## CommLog
- **Purpose:** Logs communications (calls, emails, meetings) for CRM.
- **Schema:**
  - `organizationId` (ObjectId, ref: Organization, required)
  - `contactId` (ObjectId, ref: Contact)
  - `dealId` (ObjectId, ref: Deal)
  - `type` (String): Communication type
  - `timestamp` (Date)
  - `notes` (String)
  - `createdBy` (ObjectId, ref: User)
- **Relationships:**
  - Belongs to `Organization`, `Contact`, `Deal`, and `User` (creator).
- **Notes:** Indexes on `(organizationId, contactId, dealId)`.

## Integration
- **Purpose:** Stores third-party integration configuration (e.g., Slack, GitHub).
- **Schema:**
  - `organizationId` (ObjectId, ref: Organization, required)
  - `type` (String): Integration type
  - `credentials` (Object): Tokens/secrets (encrypted)
  - `config` (Object): Integration-specific config
  - `enabled` (Boolean)
  - `lastSync` (Date)
- **Relationships:**
  - Belongs to `Organization`.
  - Referenced by `SyncLog`.
- **Notes:** Indexes on `(organizationId, type)`.

## SyncLog
- **Purpose:** Logs actions and results of integration syncs.
- **Schema:**
  - `integrationId` (ObjectId, ref: Integration, required)
  - `action` (String)
  - `status` (String)
  - `timestamp` (Date)
  - `details` (String/Object)
- **Relationships:**
  - Belongs to `Integration`.
- **Notes:** Indexes on `(integrationId, timestamp)`.

## AISuggestion
- **Purpose:** Stores AI-generated labels, summaries, or suggestions for tasks.
- **Schema:**
  - `taskId` (ObjectId, ref: Task, required)
  - `type` (String): Suggestion type
  - `content` (String): AI-generated content
  - `generatedAt` (Date)
- **Relationships:**
  - Belongs to `Task`.
- **Notes:** Indexes on `(taskId, type)`.

## File
- **Purpose:** Stores files with versioning for proofing and approval.
- **Schema:**
  - `projectId` (ObjectId, ref: Project)
  - `taskId` (ObjectId, ref: Task)
  - `filename` (String)
  - `mimeType` (String)
  - `currentVersion` (Number)
  - `versions` (Array): [{ versionNumber, uploadedBy (User), url, uploadDate }]
  - `createdAt` (Date)
- **Relationships:**
  - Belongs to `Project` and/or `Task`.
  - Has many `Approval` (per version).
- **Notes:** Indexes on `(projectId, taskId)`.

## Approval
- **Purpose:** Tracks approvals or rejections for file versions.
- **Schema:**
  - `fileId` (ObjectId, ref: File, required)
  - `versionNumber` (Number, required)
  - `reviewerId` (ObjectId, ref: User, required)
  - `status` (String): Approval status
  - `comments` (String)
  - `reviewedAt` (Date)
- **Relationships:**
  - Belongs to `File` (specific version) and `User` (reviewer).
- **Notes:** Indexes on `(fileId, versionNumber, reviewerId)`.

## Expense
- **Purpose:** Tracks expenses or time entries for budget management.
- **Schema:**
  - `projectId` (ObjectId, ref: Project)
  - `taskId` (ObjectId, ref: Task)
  - `amount` (Number)
  - `description` (String)
  - `date` (Date)
  - `createdBy` (ObjectId, ref: User)
  - `currency` (String)
- **Relationships:**
  - Belongs to `Project`, `Task`, and `User` (creator).
- **Notes:** Indexes on `(projectId, taskId)`.

## Checklist
- **Purpose:** Stores checklists/action cards for tasks.
- **Schema:**
  - `taskId` (ObjectId, ref: Task, required)
  - `items` (Array): [{ text, done (Boolean) }]
  - `createdAt` (Date)
- **Relationships:**
  - Belongs to `Task`.
- **Notes:** Index on `taskId`.

## ChatRoom
- **Purpose:** Real-time chat rooms scoped to projects.
- **Schema:**
  - `projectId` (ObjectId, ref: Project, required)
  - `name` (String)
  - `memberIds` (Array of ObjectId, ref: User)
  - `createdAt`, `updatedAt` (Date)
- **Relationships:**
  - Belongs to `Project`.
  - Members are `User` references.
  - Has many `Message`.
- **Notes:** Index on `projectId`.

## Message
- **Purpose:** Stores messages in chat rooms, supports attachments.
- **Schema:**
  - `roomId` (ObjectId, ref: ChatRoom, required)
  - `senderId` (ObjectId, ref: User, required)
  - `content` (String)
  - `attachments` (Array): Attachment metadata
  - `createdAt` (Date)
- **Relationships:**
  - Belongs to `ChatRoom` and `User` (sender).
- **Notes:** Indexes on `(roomId, createdAt)`.

---

**General Notes:**
- All models use `timestamps` for auditing.
- Indexes are added on `organizationId` and other frequently queried fields for performance and multi-tenancy.
- The design enforces strict tenant isolation and RBAC at the data model level.
- Relationships are managed via ObjectId references, enabling population and efficient querying.
- Many-to-many and parent-child relationships are supported via arrays of ObjectIds and self-referencing fields (e.g., `Task`, `Comment`).
