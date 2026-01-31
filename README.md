# Crime Management System (CMS)

## 🚔 Overview

A production-ready, intelligence-inspired Crime Management System built with the MERN stack. This system features role-based access control, real-time updates, geospatial analytics, and interactive dashboards designed to emulate high-level architectural characteristics of global intelligence agencies.

## 🎯 Features

### Core Functionality
- ✅ **Role-Based Access Control (RBAC)** - Admin, Analyst, and Agent roles
- ✅ **JWT Authentication** - Secure token-based authentication with refresh tokens
- ✅ **Real-time Updates** - Socket.IO integration for live crime alerts
- ✅ **Geospatial Queries** - MongoDB 2dsphere indexes for location-based searches
- ✅ **Comprehensive Audit Logging** - Track all user actions
- ✅ **Advanced Analytics** - Crime statistics, trends, and visualizations
- ✅ **Risk Scoring Algorithm** - Automated criminal risk assessment
- ✅ **Interactive Dashboards** - Beautiful, responsive UI with charts and maps

### Intelligence-Inspired Features
- 🔍 Pattern Detection (Crime clustering)
- 📊 Predictive Analytics
- 🗺️ Crime Heatmaps
- 🔗 Relationship Mapping
- 📈 Trend Analysis
- ⚡ Real-time Alerts
- 📢 **Most Wanted Feed** - Live sync from FBI & INTERPOL public APIs

## 🛠️ Tech Stack

### Backend
- **Node.js** + **Express.js** - Server framework
- **MongoDB** + **Mongoose** - Database with geospatial support
- **Socket.IO** - Real-time bidirectional communication
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Helmet** + **CORS** - Security
- **Express Rate Limit** - API protection

### Frontend
- **React 18** - UI library
- **Vite** - Build tool
- **Redux Toolkit** - State management
- **React Router** - Navigation
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **Recharts** - Data visualization
- **SweetAlert2** - Beautiful alerts
- **Axios** - HTTP client

## 📁 Project Structure

```
crms/
├── client/                 # React frontend
│   ├── src/
│   │   ├── pages/         # Page components
│   │   ├── components/    # Reusable components
│   │   ├── store/         # Redux store & slices
│   │   ├── services/      # API services
│   │   └── utils/         # Utility functions
│   ├── .env               # Environment variables
│   └── package.json
│
├── server/                # Node.js backend
│   ├── models/           # Mongoose schemas
│   ├── controllers/      # Route controllers
│   ├── routes/           # API routes
│   ├── middleware/       # Custom middleware
│   ├── config/           # Configuration files
│   ├── services/         # Business logic
│   ├── .env              # Environment variables
│   ├── index.js          # Server entry point
│   ├── seed.js           # Database seeder
│   └── package.json
│
└── README.md             # This file
```

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v16 or higher)
- **MongoDB** (v5 or higher) - Running locally or MongoDB Atlas
- **npm** or **yarn**

### Installation

1. **Clone the repository**
   ```bash
   cd crms
   ```

2. **Install server dependencies**
   ```bash
   cd server
   npm install
   ```

3. **Install client dependencies**
   ```bash
   cd ../client
   npm install
   ```

4. **Configure environment variables**

   **Server (.env)**
   ```env
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/crms
   JWT_SECRET=your_super_secret_jwt_key_change_in_production
   JWT_REFRESH_SECRET=your_refresh_secret_key_change_in_production
   JWT_EXPIRE=7d
   JWT_REFRESH_EXPIRE=30d
   NODE_ENV=development
   CLIENT_URL=http://localhost:5173
   ```

   **Client (.env)**
   ```env
   VITE_API_URL=http://localhost:5000/api
   VITE_SOCKET_URL=http://localhost:5000
   ```

5. **Seed the database**
   ```bash
   cd server
   npm run seed
   ```

   This will create:
   - 3 users (admin, analyst1, agent1)
   - 3 criminals with various profiles
   - 5 crime events
   - 2 cases

### Running the Application

1. **Start MongoDB** (if running locally)
   ```bash
   mongod
   ```

2. **Start the backend server**
   ```bash
   cd server
   npm run dev
   ```
   Server will run on `http://localhost:5000`

3. **Start the frontend** (in a new terminal)
   ```bash
   cd client
   npm run dev
   ```
   Client will run on `http://localhost:5173`

4. **Access the application**
   - Open browser to `http://localhost:5173`
   - Use demo credentials to login

## 🔐 Demo Credentials

| Role | Username | Password |
|------|----------|----------|
| Admin | `admin` | `admin123` |
| Analyst | `analyst1` | `analyst123` |
| Agent | `agent1` | `agent123` |

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/refresh` - Refresh token

### Criminals
- `GET /api/criminals` - Get all criminals (with pagination & filters)
- `GET /api/criminals/:id` - Get single criminal
- `POST /api/criminals` - Create criminal (Admin/Analyst)
- `PUT /api/criminals/:id` - Update criminal (Admin/Analyst)
- `DELETE /api/criminals/:id` - Delete criminal (Admin only)
- `POST /api/criminals/:id/calculate-risk` - Calculate risk score

### Crime Events
- `GET /api/crimes` - Get all crimes (with pagination & filters)
- `GET /api/crimes/:id` - Get single crime
- `POST /api/crimes` - Create crime event
- `PUT /api/crimes/:id` - Update crime event
- `DELETE /api/crimes/:id` - Delete crime (Admin only)
- `GET /api/crimes/near/:lng/:lat/:distance` - Geospatial query
- `GET /api/crimes/stats/overview` - Get crime statistics

### Cases
- `GET /api/cases` - Get all cases
- `GET /api/cases/:id` - Get single case
- `POST /api/cases` - Create case (Admin/Analyst)
- `PUT /api/cases/:id` - Update case
- `POST /api/cases/:id/timeline` - Add timeline event
- `POST /api/cases/:id/updates` - Add case update

### Most Wanted (Public)
- `GET /api/public/most-wanted` - Get all most wanted (with pagination & filters)
- `GET /api/public/most-wanted/search` - Search criminals
- `GET /api/public/most-wanted/:id` - Get single criminal
- `GET /api/public/most-wanted/source/:agency` - Filter by agency

## 🎨 UI Features

- **Dark Intelligence Theme** - Cyberpunk-inspired design
- **Glassmorphism Effects** - Modern glass-like panels
- **Smooth Animations** - Framer Motion transitions
- **Responsive Design** - Mobile-first approach
- **Interactive Charts** - Real-time data visualization
- **SweetAlert2 Notifications** - Beautiful, themed alerts

## 🔒 Security Features

- Password hashing with bcrypt
- JWT with refresh tokens
- Rate limiting on API endpoints
- Helmet.js security headers
- CORS configuration
- Comprehensive audit logging
- Role-based authorization
- Input validation

## 📊 Database Models

- **User** - Authentication and roles
- **Criminal** - Criminal profiles with risk scoring
- **CrimeEvent** - Crime incidents with geolocation
- **Case** - Investigation cases with timelines
- **Relationship** - Entity relationship mapping
- **AuditLog** - System activity tracking

## 🧪 Testing

The system includes:
- Comprehensive seed data
- API endpoint testing capability
- Real-time Socket.IO testing
- Role-based access testing

## 📝 Future Enhancements

- [ ] Advanced crime mapping with Leaflet/Mapbox
- [ ] NLP-based case summarization
- [ ] Pattern detection algorithms
- [ ] Export functionality (PDF reports)
- [ ] Mobile app integration
- [ ] Multi-language support
- [ ] Advanced search with Elasticsearch

## 👨‍💻 Development

### Available Scripts

**Server:**
- `npm run dev` - Start development server with nodemon
- `npm start` - Start production server
- `npm run seed` - Seed database with dummy data

**Client:**
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## 📄 License

This project is for educational purposes as a Final Year Project.

## 🤝 Contributing

This is an academic project. For suggestions or improvements, please contact the project team.

## 📧 Support

For issues or questions, please refer to the project documentation or contact the development team.

---

**Built with ❤️ for Final Year Project**
