# QR Identitiy & User Management System

Implemented for the Crime Management System (CMS) Academic Project.

## Features
- **Strict RBAC**: Admin-only user creation and credential management. Admins themselves are restricted to standard username/password login to prevent session hijacking via physical media.
- **QR Digital ID Cards**: Secure, time-bound, and revocable login credentials for Analysts and Agents.
- **Webcam Authentication**: Analysts and Agents login by scanning their physical or digital ID cards.
- **Session Tracking**: Automatic device logging and session auditing.

## Setup & Demo Instructions

### 1. Requirements
Ensure `qrcode.react` and `html5-qrcode` are installed in the `client` directory:
```bash
cd client
npm install qrcode.react html5-qrcode
```

### 2. Administrator Access
1.  Login as **Admin** using traditional credentials.
2.  Navigate to **User Management** in the sidebar.
3.  Click **Onboard Personnel** to create a new Analyst or Agent.
4.  Optionally, click the **QR Icon** on an existing user to **Issue/Regenerate** their ID card.
5.  **ID Card Preview**: A printable/downloadable card will appear with the user's details and the unique QR token.

### 3. QR Login Flow
1.  Navigate to the **Login Page**.
2.  Select **Login with Digital ID Card**.
3.  Grant **Webcam permissions** when prompted.
4.  Hold the generated QR code (from step 2) in front of the camera.
5.  The system will extract the payload, validate it against the backend, and grant access.

## Security Design
- **One-Time/Rotating Tokens**: Tokens can be configured to rotate after use or expire automatically.
- **Salted Hashing**: QR tokens are stored as salted bcrypt hashes in the database.
- **Access Revocation**: Admins can immediately invalidate any ID card via the "Revoke" button.
- **Academic Disclaimer**: The system illustrates secure credential exchange using standard MERN technologies.

```javascript
// Sample QR Payload Structure
{
  "userId": "64f3a...",
  "token": "a1b2c3d4e5...",
  "expiry": "2026-02-23T...",
  "role": "analyst"
}
```
