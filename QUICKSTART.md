# 🚀 Quick Start Guide - Crime Management System

## Prerequisites Check
- ✅ Node.js installed (v16+)
- ✅ MongoDB installed or MongoDB Atlas account
- ✅ Terminal/Command Prompt access

## 5-Minute Setup

### 1. Install Dependencies (2 minutes)

```bash
# Navigate to project
cd c:\Users\Ubaid\Desktop\crms

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 2. Start MongoDB (30 seconds)

**Option A: Local MongoDB**
```bash
mongod
```

**Option B: MongoDB Atlas**
- Update `server/.env` with your Atlas connection string

### 3. Seed Database (30 seconds)

```bash
cd server
npm run seed
```

You should see:
```
✅ MongoDB Connected
🗑️  Cleared existing data
👥 Created users
🚨 Created criminals
🔍 Created crime events
📁 Created cases

🔐 Login Credentials:
   Admin: admin / admin123
   Analyst: analyst1 / analyst123
   Agent: agent1 / agent123
```

### 4. Start the Application (1 minute)

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
```

Wait for:
```
╔═══════════════════════════════════════╗
║   🚔 Crime Management System (CMS)    ║
║   Server running on port 5000         ║
╚═══════════════════════════════════════╝
```

**Terminal 2 - Frontend:**
```bash
cd client
npm run dev
```

Wait for:
```
VITE v7.3.1  ready in XXX ms
➜  Local:   http://localhost:5173/
```

### 5. Access the System (30 seconds)

1. Open browser to `http://localhost:5173`
2. Click "Access Secure Portal"
3. Login with: **admin** / **admin123**
4. Explore the dashboard! 🎉

## What to Test

### ✅ Authentication
- Login with different roles
- Check role-based access
- Test logout

### ✅ Dashboard
- View crime statistics
- Explore interactive charts
- Check recent crimes table

### ✅ API Testing (Optional)

Get your token after login (check browser DevTools > Application > Local Storage > token)

```bash
# Get crime stats
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:5000/api/crimes/stats/overview

# Get all crimes
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:5000/api/crimes
```

## Troubleshooting

### MongoDB Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution:** Start MongoDB with `mongod` command

### Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::5000
```
**Solution:** Kill the process or change PORT in `server/.env`

### Module Not Found
```
Error: Cannot find module 'express'
```
**Solution:** Run `npm install` in the server directory

### Vite Build Error
```
Error: Failed to resolve import
```
**Solution:** Run `npm install` in the client directory

## Demo Credentials

| Role | Username | Password | Access Level |
|------|----------|----------|--------------|
| **Admin** | admin | admin123 | Full access (CRUD all) |
| **Analyst** | analyst1 | analyst123 | Create/Update crimes & cases |
| **Agent** | agent1 | agent123 | View only |

## Key Features to Demonstrate

1. **Login Flow** - Glassmorphism design with animations
2. **Dashboard** - Real-time statistics and charts
3. **Crime Feed** - Latest crime events
4. **SweetAlert2** - Beautiful notifications on login/logout
5. **Responsive Design** - Works on mobile/tablet/desktop

## Next Steps

- Explore the [README.md](file:///c:/Users/Ubaid/Desktop/crms/README.md) for full documentation
- Check [walkthrough.md](file:///C:/Users/Ubaid/.gemini/antigravity/brain/a11cc381-e1ee-43a7-8d26-bdbf3a23ba44/walkthrough.md) for detailed implementation
- Review API endpoints in README
- Test real-time features with multiple browser tabs

## Production Deployment

For production deployment:
1. Use MongoDB Atlas for database
2. Deploy backend to Heroku/Railway
3. Deploy frontend to Vercel/Netlify
4. Update environment variables
5. Change JWT secrets

---

**Ready to impress! 🎓**

Your Crime Management System is production-ready and demo-ready!
