# User Management System - Complete Guide

## Overview
The Nyapui Radio application has a fully functional user management system that supports all CRUD (Create, Read, Update, Delete) operations with role-based access control and granular permissions.

## Architecture

### Backend (Node.js/Express)
**Location:** `backend/server.js` and `backend/db.js`

#### Database Schema
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL,
  permissions TEXT,
  full_name TEXT,
  user_email TEXT,
  bio TEXT,
  profile_picture TEXT
);
```

#### API Endpoints

##### 1. **Authentication**
- **POST** `/api/auth/login`
  - Request: `{ username, password }`
  - Response: `{ token, user: { id, username, role, permissions, full_name, user_email, bio, profile_picture } }`
  - Returns JWT token valid for 24 hours

- **GET** `/api/auth/me` (Authenticated)
  - Returns current logged-in user details

- **PUT** `/api/auth/me` (Authenticated)
  - Request: `{ full_name, user_email, bio, profile_picture }`
  - Updates user's own profile

##### 2. **User Management (CRUD)**

**CREATE - POST** `/api/users` (Authenticated)
```json
Request:
{
  "username": "jsmith",
  "password": "SecurePass123",
  "role": "staff|manager|superuser",
  "full_name": "John Smith",
  "user_email": "john@example.com",
  "bio": "Station manager",
  "profile_picture": "base64_image_data",
  "permissions": {
    "tasks": { "read": true, "create": true, "update": true, "delete": false }
  }
}

Response (201):
{
  "id": 5,
  "username": "jsmith",
  "role": "staff"
}
```

**Validations:**
- Username: Required, minimum 3 characters, must be unique
- Password: Required (for new users), minimum 6 characters
- Role: Required, must be one of: "staff", "manager", "superuser"
- Profile picture: Maximum 512KB

**Error Codes:**
- `400` - Missing required fields or validation failed
- `409` - Username already exists
- `500` - Server error

---

**READ - GET** `/api/users` (Authenticated)
```
Response (200):
[
  {
    "id": 1,
    "username": "admin",
    "role": "superuser",
    "full_name": "Admin User",
    "user_email": "admin@example.com",
    "bio": "System Administrator",
    "profile_picture": null,
    "permissions": {}
  },
  {
    "id": 5,
    "username": "jsmith",
    "role": "staff",
    "full_name": "John Smith",
    "user_email": "john@example.com",
    "bio": "Station manager",
    "profile_picture": "base64_image_data",
    "permissions": {
      "tasks": { "read": true, "create": true, "update": true, "delete": false }
    }
  }
]
```

---

**UPDATE - PUT** `/api/users/:id` (Authenticated)
```json
Request:
{
  "username": "jsmith_updated",
  "password": "NewPassword456",  // Optional - omit to keep current password
  "role": "manager",
  "full_name": "John Smith Updated",
  "user_email": "john.smith@example.com",
  "bio": "Senior Station Manager",
  "profile_picture": "base64_image_data",
  "permissions": {
    "tasks": { "read": true, "create": true, "update": true, "delete": true }
  }
}

Response (200):
{
  "message": "User updated successfully"
}
```

**Validations:**
- Cannot change username to one that already exists
- Password (if provided): minimum 6 characters
- All other validations same as CREATE

**Error Codes:**
- `400` - Validation failed
- `404` - User not found
- `409` - New username already exists
- `500` - Server error

---

**DELETE - DELETE** `/api/users/:id` (Authenticated)
```
Response (200):
{
  "message": "User deleted successfully"
}
```

**Protections:**
- Users cannot delete their own account
- Returns `400` error if attempting self-deletion
- Returns `404` if user doesn't exist

---

### Frontend (React)
**Location:** `src/components/superadmin/dashboard.js`

#### User Management Component Features

1. **User List (Sidebar)**
   - Displays all users in the system
   - Search functionality by username or full name
   - Visual indicators for user role
   - Quick access to user details

2. **User Form (Main Area)**
   - Profile picture upload (max 512KB)
   - Basic information (username, password, full name)
   - Account configuration (role selection)
   - Permission matrix for granular access control

3. **Available Roles**
   - `staff`: Limited access, can be assigned specific permissions
   - `manager`: Enhanced access level, can manage certain resources
   - `superuser`: Full system access, unrestricted

4. **Permission Matrix**
   - Allows granular control over user access
   - Permissions per system section: read, create, update, delete
   - Applies to all modules: tasks, broadcasts, programs, news, podcasts, etc.
   - Superusers automatically have full access

#### Frontend Functions

**handleUserSubmit()**
- Handles both CREATE and UPDATE operations
- Validates input before submission
- Shows success/error messages
- Refreshes user list after operation

**handleUserDelete()**
- Confirms deletion with user
- Prevents accidental deletions
- Updates list after successful deletion

**toggleUserPermission()**
- Manages permission checkbox states
- Dynamic permission building

**handleUserImageUpload()**
- Converts image to base64
- Validates file size (max 512KB)

**fetchUsers()**
- Loads all users from API
- Called on component mount and after CRUD operations

---

## Validation Rules

### Field Validations

| Field | Validation | Notes |
|-------|-----------|-------|
| Username | 3+ chars, unique | Case-sensitive |
| Password | 6+ chars | Required for new users only |
| Role | staff, manager, superuser | Required |
| Full Name | Any length | Optional |
| Email | Any format | Optional, no validation |
| Bio | Any length | Optional |
| Profile Picture | Max 512KB | Optional, base64 encoded |
| Permissions | JSON object | Automatically formatted |

### Default Values
- Role: `staff`
- Permissions: `{}` (empty - no access)
- Profile Picture: `null`

---

## Security Features

1. **Authentication**
   - JWT tokens with 24-hour expiration
   - Bearer token validation on all endpoints
   - Session timeout after 1 minute of inactivity

2. **Password Security**
   - SHA-256 hashing
   - Minimum 6 characters required
   - Password field excluded from responses

3. **Authorization**
   - Role-based access control (RBAC)
   - Granular permission matrix
   - Audit logging of all operations

4. **Data Protection**
   - Unique username constraint
   - Self-deletion prevention
   - Input validation on all fields

---

## Audit Logging

All user management actions are logged in the `audit_logs` table:
- User creation
- User updates
- User deletion
- Login attempts

Log entry includes:
- User performing action
- Action type
- Details of change
- Target user ID
- Timestamp

---

## Error Handling

### Frontend Error Messages
- Validation errors before submission
- HTTP status-based error handling
- User-friendly error descriptions
- Toast notifications for feedback

### Backend Error Responses

| Status | Scenario | Example |
|--------|----------|---------|
| 200 | Success (GET, PUT, DELETE) | User updated successfully |
| 201 | Success (POST) | New user created |
| 400 | Bad request/validation | "Username must be 3+ characters" |
| 401 | Unauthorized/Not authenticated | "Authentication required" |
| 404 | Resource not found | "User not found" |
| 409 | Conflict/Duplicate | "Username already exists" |
| 500 | Server error | "Error creating user" |

---

## Default Admin Credentials

**Username:** `admin`
**Password:** `Nyapui@123`
**Role:** `superuser`

These can be overridden with environment variables:
- `SUPERUSER_NAME`
- `SUPERUSER_PASSWORD`

---

## Testing the System

### Test Cases

#### 1. Create New User
```bash
curl -X POST http://localhost:5000/api/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "username": "testuser",
    "password": "TestPass123",
    "role": "staff",
    "full_name": "Test User"
  }'
```

#### 2. Read All Users
```bash
curl http://localhost:5000/api/users \
  -H "Authorization: Bearer <token>"
```

#### 3. Update User
```bash
curl -X PUT http://localhost:5000/api/users/5 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "username": "testuser",
    "role": "manager",
    "full_name": "Updated Test User"
  }'
```

#### 4. Delete User
```bash
curl -X DELETE http://localhost:5000/api/users/5 \
  -H "Authorization: Bearer <token>"
```

---

## Common Issues and Solutions

### Issue: "Username already exists"
**Solution:** Choose a different username that hasn't been used before

### Issue: "Password must be at least 6 characters"
**Solution:** Ensure password is minimum 6 characters long

### Issue: "User not found"
**Solution:** Verify the user ID is correct and the user hasn't been deleted

### Issue: "You cannot delete your own account"
**Solution:** Ask another admin to delete your account, or delete a different user first

### Issue: Authentication fails
**Solution:** Ensure token is valid and not expired (tokens last 24 hours)

---

## Best Practices

1. **Username Management**
   - Use descriptive usernames (e.g., jsmith for John Smith)
   - Keep usernames lowercase for consistency
   - Avoid special characters

2. **Password Management**
   - Ensure strong passwords (mix of letters, numbers, symbols)
   - Don't share passwords
   - Change default admin password immediately

3. **Permission Management**
   - Grant minimum necessary permissions
   - Review permissions regularly
   - Don't give staff full delete access unless needed

4. **Audit Trail**
   - Review audit logs regularly
   - Investigate unusual activities
   - Archive logs periodically

---

## Summary

The user management system is production-ready with:
✅ Full CRUD operations
✅ Role-based access control
✅ Granular permission system
✅ Input validation
✅ Error handling
✅ Audit logging
✅ Security features
✅ Responsive UI

All validations have been enhanced with proper error handling and user feedback.
