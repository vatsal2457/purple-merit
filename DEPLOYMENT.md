# Deployment Guide - Purple Merit Technologies

## Prerequisites

1. **MongoDB Atlas Database**
   - Create a free MongoDB Atlas account
   - Create a new cluster
   - Get your connection string

2. **Vercel Account**
   - Sign up at [vercel.com](https://vercel.com)
   - Install Vercel CLI: `npm i -g vercel`

## Step 1: Deploy Backend

### 1.1 Prepare Backend
```bash
cd backend
npm run build
```

### 1.2 Deploy to Vercel
```bash
cd backend
vercel
```

### 1.3 Set Environment Variables
After deployment, go to your Vercel dashboard and set these environment variables:

- `MONGODB_URI`: Your MongoDB Atlas connection string
- `JWT_SECRET`: A strong secret key (generate with: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`)
- `NODE_ENV`: `production`

### 1.4 Seed Database
```bash
# Get your backend URL from Vercel dashboard
vercel env pull .env.production.local
npm run seed:admin
npm run seed:manager
```

## Step 2: Deploy Frontend

### 2.1 Update API URL
Create `frontend/.env.production`:
```env
VITE_API_URL=https://your-backend-url.vercel.app
```

### 2.2 Deploy to Vercel
```bash
cd frontend
vercel
```

### 2.3 Set Environment Variables
In Vercel dashboard, set:
- `VITE_API_URL`: Your backend Vercel URL

## Step 3: Update CORS (if needed)

If you get CORS errors, update the backend CORS configuration in `backend/src/index.ts` with your actual frontend URL.

## Step 4: Test Deployment

1. Visit your frontend URL
2. Login with:
   - Email: `manager@purplemerit.com`
   - Password: `password123`

## Troubleshooting

### Common Issues:

1. **CORS Errors**
   - Update CORS origins in backend
   - Check environment variables

2. **Database Connection**
   - Verify MongoDB Atlas connection string
   - Check network access settings

3. **Build Errors**
   - Ensure all dependencies are in package.json
   - Check TypeScript compilation

### Environment Variables Reference:

**Backend (.env):**
```env
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/purple-merit
JWT_SECRET=your_super_secret_jwt_key_here
NODE_ENV=production
```

**Frontend (.env.production):**
```env
VITE_API_URL=https://your-backend-url.vercel.app
```

## Live URLs

After deployment, update these in your README.md:
- Frontend: `https://your-frontend-url.vercel.app`
- Backend: `https://your-backend-url.vercel.app`
- Database: MongoDB Atlas (your cluster URL)
