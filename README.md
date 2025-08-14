# Purple Merit Technologies - Logistics Management System

## Project Overview

This is a comprehensive logistics management system that helps companies optimize their delivery operations through simulation and real-time monitoring. The application provides:

- **Dashboard**: Real-time KPI monitoring including profit, efficiency, delivery performance, and fuel costs
- **Simulation Engine**: Advanced delivery simulation with configurable parameters
- **Management Interface**: CRUD operations for drivers, routes, and orders
- **Analytics**: Visual charts and reports for data-driven decision making

## Tech Stack

### Frontend
- **React 18** with Hooks
- **TypeScript** for type safety
- **Vite** for build tooling
- **React Router** for navigation
- **Recharts** for data visualization
- **Tailwind CSS** for styling
- **Axios** for API communication
- **React Hook Form** for form handling

### Backend
- **Node.js** with Express.js
- **TypeScript** for type safety
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **bcrypt** for password hashing
- **CORS** for cross-origin requests
- **Joi** for data validation

### Database
- **MongoDB Atlas** (cloud-hosted)

### Deployment
- **Frontend**: Vercel
- **Backend**: Render
- **Database**: MongoDB Atlas

## Project Structure

```
purple-merit/
├── frontend/          # React application
├── backend/           # Node.js API server
├── data/              # Initial data files
└── README.md          # This file
```

## Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- MongoDB Atlas account

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the backend directory with the following variables:
```env
PORT=5000
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_secret_key
NODE_ENV=development
```

4. Start the development server:
```bash
npm run dev
```

The backend will be available at `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the frontend directory:
```env
VITE_API_URL=http://localhost:5000
```

4. Start the development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

## Environment Variables

### Backend (.env)
- `PORT`: Server port (default: 5000)
- `MONGODB_URI`: MongoDB Atlas connection string
- `JWT_SECRET`: Secret key for JWT token generation
- `NODE_ENV`: Environment (development/production)

### Frontend (.env)
- `VITE_API_URL`: Backend API URL

## API Documentation

### Authentication Endpoints

#### POST /api/auth/login
Login with manager credentials
```json
{
  "email": "manager@purplemerit.com",
  "password": "password123"
}
```

#### POST /api/auth/register
Register new manager (admin only)
```json
{
  "name": "Manager Name",
  "email": "manager@purplemerit.com",
  "password": "password123"
}
```

### Driver Endpoints

#### GET /api/drivers
Get all drivers

#### POST /api/drivers
Create new driver
```json
{
  "name": "Driver Name",
  "currentShiftHours": 8,
  "pastWeekHours": 40
}
```

#### PUT /api/drivers/:id
Update driver

#### DELETE /api/drivers/:id
Delete driver

### Route Endpoints

#### GET /api/routes
Get all routes

#### POST /api/routes
Create new route
```json
{
  "routeId": "R001",
  "distance": 25.5,
  "trafficLevel": "Medium",
  "baseTime": 45
}
```

### Order Endpoints

#### GET /api/orders
Get all orders

#### POST /api/orders
Create new order
```json
{
  "orderId": "O001",
  "value": 1500,
  "assignedRoute": "R001",
  "deliveryTimestamp": "2024-01-15T10:00:00Z"
}
```

### Simulation Endpoint

#### POST /api/simulation/run
Run delivery simulation
```json
{
  "availableDrivers": 5,
  "startTime": "08:00",
  "maxHoursPerDay": 10
}
```

Response:
```json
{
  "totalProfit": 12500,
  "efficiencyScore": 85.5,
  "onTimeDeliveries": 17,
  "lateDeliveries": 3,
  "fuelCost": 1250,
  "penalties": 150,
  "bonuses": 500
}
```

## Company Rules Implementation

1. **Late Delivery Penalty**: ₹50 penalty for deliveries exceeding base time + 10 minutes
2. **Driver Fatigue Rule**: 30% speed reduction for drivers working >8 hours
3. **High-Value Bonus**: 10% bonus for orders >₹1000 delivered on time
4. **Fuel Cost**: ₹5/km base + ₹2/km surcharge for high traffic
5. **Efficiency Score**: (On-time deliveries / Total deliveries) × 100

## Deployment Instructions

### Backend Deployment (Render)

1. Connect your GitHub repository to Render
2. Create a new Web Service
3. Set build command: `npm install && npm run build`
4. Set start command: `npm start`
5. Add environment variables in Render dashboard
6. Deploy

### Frontend Deployment (Vercel)

1. Connect your GitHub repository to Vercel
2. Set build command: `npm run build`
3. Set output directory: `dist`
4. Add environment variables in Vercel dashboard
5. Deploy

### Database Setup (MongoDB Atlas)

1. Create MongoDB Atlas account
2. Create new cluster
3. Set up database access (username/password)
4. Set up network access (IP whitelist)
5. Get connection string and add to environment variables

## Testing

Run backend tests:
```bash
cd backend
npm test
```

Run frontend tests:
```bash
cd frontend
npm test
```

## Features

- ✅ Responsive design (desktop & mobile)
- ✅ Real-time dashboard with charts
- ✅ Simulation engine with configurable parameters
- ✅ CRUD operations for all entities
- ✅ JWT authentication
- ✅ Data validation and error handling
- ✅ MongoDB integration
- ✅ CORS configuration
- ✅ Environment variable management
- ✅ Unit tests
- ✅ Deployment ready

## Live Deployment Links

- **Frontend**: [Vercel Deployment URL]
- **Backend**: [Render Deployment URL]
- **API Documentation**: [Swagger/Postman Collection]

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

This project is proprietary to Purple Merit Technologies.
