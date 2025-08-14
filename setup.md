# Purple Merit Technologies - Setup Guide

## Quick Start

This guide will help you set up the complete logistics management system locally.

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- MongoDB Atlas account (or local MongoDB)

## Step 1: Clone and Setup

```bash
# Clone the repository
git clone <your-repo-url>
cd purple-merit

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

## Step 2: Database Setup

1. Create a MongoDB Atlas account at https://www.mongodb.com/atlas
2. Create a new cluster
3. Set up database access (create a user with read/write permissions)
4. Set up network access (add your IP or 0.0.0.0/0 for all IPs)
5. Get your connection string

## Step 3: Environment Configuration

### Backend (.env)
Create a `.env` file in the `backend` directory:

```env
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/purple-merit?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random
NODE_ENV=development
```

### Frontend (.env)
Create a `.env` file in the `frontend` directory:

```env
VITE_API_URL=http://localhost:5000
```

## Step 4: Database Seeding

```bash
# Navigate to backend directory
cd backend

# Seed admin user
npm run seed:admin

# Start the backend server (this will auto-seed initial data)
npm run dev
```

## Step 5: Start the Application

### Terminal 1 - Backend
```bash
cd backend
npm run dev
```

### Terminal 2 - Frontend
```bash
cd frontend
npm run dev
```

## Step 6: Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/health

## Default Login Credentials

- **Email**: admin@purplemerit.com
- **Password**: admin123

## Features Available

### Dashboard
- Real-time KPI monitoring
- Profit and efficiency metrics
- Delivery performance charts
- Fuel cost breakdown

### Simulation
- Configure simulation parameters
- Run delivery simulations
- View detailed results
- Driver assignment analysis

### Management
- **Drivers**: CRUD operations for driver management
- **Routes**: Manage delivery routes and specifications
- **Orders**: Track orders and delivery status

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - Register new user (admin only)
- `GET /api/auth/me` - Get current user profile

### Drivers
- `GET /api/drivers` - Get all drivers
- `POST /api/drivers` - Create new driver
- `PUT /api/drivers/:id` - Update driver
- `DELETE /api/drivers/:id` - Delete driver

### Routes
- `GET /api/routes` - Get all routes
- `POST /api/routes` - Create new route
- `PUT /api/routes/:id` - Update route
- `DELETE /api/routes/:id` - Delete route

### Orders
- `GET /api/orders` - Get all orders
- `POST /api/orders` - Create new order
- `PUT /api/orders/:id` - Update order
- `DELETE /api/orders/:id` - Delete order
- `PATCH /api/orders/:id/deliver` - Mark order as delivered

### Simulation
- `POST /api/simulation/run` - Run delivery simulation
- `GET /api/simulation/status` - Get system status

## Company Rules Implementation

The system implements the following business rules:

1. **Late Delivery Penalty**: ₹50 penalty for deliveries exceeding base time + 10 minutes
2. **Driver Fatigue Rule**: 30% speed reduction for drivers working >8 hours
3. **High-Value Bonus**: 10% bonus for orders >₹1000 delivered on time
4. **Fuel Cost**: ₹5/km base + ₹2/km surcharge for high traffic
5. **Efficiency Score**: (On-time deliveries / Total deliveries) × 100

## Testing

### Backend Tests
```bash
cd backend
npm test
```

### Frontend Tests
```bash
cd frontend
npm test
```

## Deployment

### Backend (Render/Railway/Heroku)
1. Connect your GitHub repository
2. Set environment variables
3. Set build command: `npm install && npm run build`
4. Set start command: `npm start`

### Frontend (Vercel/Netlify)
1. Connect your GitHub repository
2. Set build command: `npm run build`
3. Set output directory: `dist`
4. Set environment variables

### Database (MongoDB Atlas)
1. Create a production cluster
2. Set up proper security (IP whitelist, strong passwords)
3. Update connection string in production environment

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Check your connection string
   - Verify network access settings
   - Ensure database user has proper permissions

2. **JWT Secret Error**
   - Make sure JWT_SECRET is set in environment variables
   - Use a strong, random secret key

3. **CORS Issues**
   - Check frontend URL in backend CORS configuration
   - Ensure proper environment variables are set

4. **Build Errors**
   - Clear node_modules and reinstall dependencies
   - Check Node.js version compatibility
   - Verify TypeScript configuration

## Support

For issues or questions:
1. Check the console logs for error messages
2. Verify all environment variables are set correctly
3. Ensure all dependencies are installed
4. Check MongoDB connection and permissions

## Security Notes

- Change default admin credentials in production
- Use strong JWT secrets
- Configure proper CORS settings
- Set up proper MongoDB security
- Use HTTPS in production
- Regularly update dependencies
