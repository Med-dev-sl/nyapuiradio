# User Management System - Test Scenarios

## Prerequisites
1. Backend server running on `http://localhost:5000`
2. Frontend running on `http://localhost:3000`
3. Default admin user credentials: `admin` / `Nyapui@123`

---

## Test Scenario 1: Create User

### Steps
1. Navigate to Superadmin Dashboard
2. Login with admin credentials
3. Click on "User Management" from sidebar
4. Click "Create New User" button
5. Fill in the form:
   - Username: `jsmith`
   - Password: `SecurePass@123`
   - Full Name: `John Smith`
   - Email: `john@example.com`
   - Role: `staff`
6. Add permissions (e.g., Tasks - read only)
7. Click "Initialize New Access Profile"

### Expected Results
✅ User successfully created
✅ Toast notification: "New user account created successfully."
✅ User appears in the user list
✅ Form resets
✅ Can search for the new user by username or full name

### Error Test Cases
- **Missing username:** Error message "Username and password are required."
- **Username < 3 chars:** Error message "Username must be at least 3 characters long."
- **Password < 6 chars:** Error message "Password must be at least 6 characters long."
- **Duplicate username:** Error message "Username already exists. Please choose a different username."

---

## Test Scenario 2: Read (View) Users

### Steps
1. Login to dashboard
2. Click "User Management"
3. Observe the user list on the left sidebar
4. Search for a user by typing in the search box

### Expected Results
✅ All users are displayed in the list
✅ Users show their full name, username, and role
✅ Search filters users in real-time
✅ Users can be sorted by clicking on them
✅ Last updated user is highlighted with blue border

### Test Cases
- Search by username: `admin` (should find admin user)
- Search by full name: `John` (should find John Smith)
- Empty search: Shows all users
- Case-insensitive search: `JOHN` or `john` both work

---

## Test Scenario 3: Read User Profile

### Steps
1. In User Management, click on any user in the list
2. View user details in the right panel

### Expected Results
✅ User profile picture displays
✅ Username field shows correctly
✅ Full name and email display
✅ Current role is selected
✅ Permissions are displayed correctly
✅ All fields are read (but appear disabled until you click edit)

### Verification
- Profile picture shows avatar or initials if no picture
- Username cannot be changed to empty
- Role correctly reflects the user's access level
- Permissions matrix shows correct checkmarks

---

## Test Scenario 4: Update User

### Steps
1. Click on a user in the list (e.g., `jsmith`)
2. Modify fields:
   - Change role from `staff` to `manager`
   - Add/remove permissions
   - Update email
   - Upload new profile picture
3. Leave password field empty (to keep current password)
4. Click "Commit User Profile Changes"

### Expected Results
✅ User record updated successfully
✅ Toast notification: "User account updated successfully."
✅ Changes reflected immediately in user list
✅ Can log in with old credentials but new permissions apply

### Error Test Cases
- **Change to duplicate username:** Error "Username already exists"
- **Invalid password (< 6 chars):** Error "Password must be at least 6 characters"
- **Change role while viewing:** Permissions matrix updates

### Password Update Test
1. Select a user
2. Enter new password: `NewPassword@456`
3. Click "Commit User Profile Changes"
4. Logout and login with new password
✅ Login succeeds with new password

---

## Test Scenario 5: Delete User

### Steps
1. Click on a user to select them
2. Click the delete icon (trash can) in the user list
3. Confirm deletion in the popup window
4. Click "Delete" button

### Expected Results
✅ User is removed from the list
✅ Toast notification: "User removed from system."
✅ Search no longer finds deleted user
✅ Database no longer contains user record

### Error Test Cases
- **Attempt to delete self:** 
  - Click logout and sign in as different user
  - Try to delete previous admin account
  ✅ Error message: "This operation is not allowed"
  
- **Attempt to delete non-existent user:**
  - Manually modify URL or user ID
  ✅ Error message: "User not found"

---

## Test Scenario 6: Role-Based Access

### Steps
1. Create a `staff` user with limited permissions
2. Create another user with `manager` role
3. Create a `superuser` account
4. Login as each user and verify access

### Expected Results

**Staff User (Limited)**
✅ Can only access sections with read permission
✅ Cannot create/update/delete if permissions not granted
✅ Permission matrix is visible and can be configured
✅ Cannot access restricted modules

**Manager User**
✅ Has more access than staff
✅ Can create and update in assigned areas
✅ Still has some restrictions
✅ Permission matrix shown

**Superuser**
✅ Full system access
✅ Permission matrix shows "Full Access Granted"
✅ Cannot configure individual permissions
✅ Can access all modules

---

## Test Scenario 7: Permission Matrix

### Steps
1. Create a new `staff` user
2. In the permission matrix, enable:
   - Tasks: read, create, update (but NOT delete)
   - News: read only
   - All others: disabled
3. Save user
4. Login as that user

### Expected Results
✅ User can view Tasks section
✅ User can create new tasks
✅ User can update existing tasks
✅ User cannot delete tasks
✅ News section is read-only
✅ Other sections are hidden from sidebar
✅ Attempted access returns 403 Forbidden

### Permission Combination Tests
- **Read Only:** Only view access
- **Read + Create:** Can view and create
- **Read + Update:** Can view and modify
- **Full Access:** Read + Create + Update + Delete

---

## Test Scenario 8: Authentication & Session

### Steps
1. Login with valid credentials
2. Wait 1 minute of inactivity
3. Try to perform an action

### Expected Results
✅ Session timeout after 1 minute
✅ Redirected to login page
✅ Toast notification: "You were logged out due to inactivity."
✅ Must login again to continue

### Token Expiration Test
1. Note the login time
2. Wait 24 hours (or manually test with token tools)
3. Try to use old token to access `/api/users`

✅ Returns 401 Unauthorized
✅ Must login again to get new token

---

## Test Scenario 9: Profile Picture Upload

### Steps
1. Create a new user
2. Click on the profile picture area
3. Upload an image (recommended: small .jpg or .png)
4. Verify image size < 512KB
5. Save user

### Expected Results
✅ Image displays in profile section
✅ Image persists after save
✅ Image shows in user list
✅ Image shows in audit logs if applicable

### Error Test Cases
- **File too large (> 512KB):** Error "Profile picture exceeds 512KB"
- **Invalid format:** Browser prevents upload
- **Corrupt image:** Error handling during save

---

## Test Scenario 10: Audit Logging

### Steps
1. Create a user
2. Update a user
3. Delete a user
4. Go to "Audit Logs" section
5. Search for your actions

### Expected Results
✅ All user management actions are logged
✅ Logs show: who, what, when, and which user affected
✅ Can filter by action type
✅ Timestamps are accurate
✅ User IDs match correctly

### Audit Log Records
- `CREATE_USER`: Shows username and role created
- `UPDATE_USER`: Shows which fields changed
- `DELETE_USER`: Shows which user ID was deleted
- `UPDATE_PROFILE`: Shows when user updated own profile

---

## Test Scenario 11: Edge Cases

### Test Case 1: Special Characters in Username
```
Username: john.smith_2024
Result: ✅ Accepted (alphanumeric and _. allowed)
```

### Test Case 2: Very Long Username
```
Username: verylongusernamethatexceedsnormallength...
Result: ✅ Accepted if < database field limit
```

### Test Case 3: Unicode Characters in Full Name
```
Full Name: José María García
Result: ✅ Accepted and displayed correctly
```

### Test Case 4: HTML/Script in Bio
```
Bio: <script>alert('test')</script>
Result: ✅ Escaped and displayed as text (no XSS)
```

### Test Case 5: Rapid User Creation
```
Create 5 users in rapid succession
Result: ✅ All created successfully
```

---

## Test Scenario 12: API Testing (curl)

### Create User
```bash
curl -X POST http://localhost:5000/api/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "username": "apitest",
    "password": "ApiTest@123",
    "role": "staff",
    "full_name": "API Test User"
  }'
```
Expected: 201 Created

### Get All Users
```bash
curl -X GET http://localhost:5000/api/users \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```
Expected: 200 OK with user array

### Update User
```bash
curl -X PUT http://localhost:5000/api/users/6 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "username": "apitest_updated",
    "role": "manager"
  }'
```
Expected: 200 OK

### Delete User
```bash
curl -X DELETE http://localhost:5000/api/users/6 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```
Expected: 200 OK

### No Authentication
```bash
curl -X GET http://localhost:5000/api/users
```
Expected: 401 Unauthorized

---

## Success Checklist

After completing all test scenarios, verify:

- [ ] ✅ Create user works with validation
- [ ] ✅ Read/list users displays all users
- [ ] ✅ Update user modifies existing records
- [ ] ✅ Delete user removes records
- [ ] ✅ Role-based access control works
- [ ] ✅ Permission matrix functions correctly
- [ ] ✅ Search filters users accurately
- [ ] ✅ Profile pictures upload and display
- [ ] ✅ Session timeout works after 1 minute
- [ ] ✅ Audit logs record all actions
- [ ] ✅ Error messages are clear and helpful
- [ ] ✅ API returns correct HTTP status codes
- [ ] ✅ Database maintains data integrity
- [ ] ✅ UI is responsive and user-friendly
- [ ] ✅ No security vulnerabilities

---

## Notes

- **Database:** The system uses SQLite by default, but can use PostgreSQL via DATABASE_URL
- **Tokens:** JWT tokens last 24 hours
- **Passwords:** Never logged or exposed in responses
- **Permissions:** Empty permissions ({}) means no access
- **Superuser:** Cannot be limited; always has full access

---

## Support

If issues arise:
1. Check backend logs: `backend/` console output
2. Check browser console: Developer Tools → Console
3. Review audit logs for action history
4. Verify authentication token is valid
5. Ensure database connection is working
