# Instagram Election Monitoring Dashboard

## Setup Instructions

### Pre-requisites
- Node.js (v16+)
- MongoDB Atlas Account

### 1. Database Setup
1. Create a MongoDB cluster.
2. Copy the connection string.
3. Rename `backend/.env.example` to `backend/.env` and paste the connection URI.

### 2. Backend Setup
```bash
cd backend
npm install
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm start
```

Your React application will be accessible at http://localhost:3000 and connect dynamically to the backend at http://localhost:5000.
