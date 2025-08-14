# Deployment Guide - Purple Merit Technologies

## Prerequisites

1. **MongoDB Atlas Database**
   - Create a free MongoDB Atlas account
   - Create a new cluster
   - Get your connection string

2. **Vercel Account (Frontend)**
   - Sign up at [vercel.com](https://vercel.com)
   - Install Vercel CLI: `npm i -g vercel`

3. **Render Account (Backend)**
   - Sign up at [render.com](https://render.com)
   - Connect your GitHub account

## Step 1: Deploy Backend on Render

### 1.1 Prepare Repository
1. Push your code to GitHub
2. Ensure your repository is public or connected to Render

### 1.2 Deploy to Render
1. Go to [render.com](https://render.com) and sign in
2. Click "New +" and select "Web Service"
3. Connect your GitHub repository
4. Configure the service:
   - **Name**: `purple-merit-backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Plan**: Free

### 1.3 Set Environment Variables
In Render dashboard, go to Environment and add:
- `MONGODB_URI`: Your MongoDB Atlas connection string
- `JWT_SECRET`: A strong secret key (generate with: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`)
- `NODE_ENV`: `production`

### 1.4 Deploy and Get URL
1. Click "Create Web Service"
2. Wait for deployment to complete
3. Copy your Render URL (e.g., `https://purple-merit-backend.onrender.com`)

### 1.5 Seed Database
```bash
# Update your local .env with Render URL
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_secret
NODE_ENV=production

# Run seed scripts
cd backend
npm run seed:admin
npm run seed:manager
```

## Step 2: Deploy Frontend on Vercel

### 2.1 Update API URL
Create `frontend/.env.production`:
```env
VITE_API_URL=https://your-backend-url.onrender.com
```

### 2.2 Deploy to Vercel
```bash
cd frontend
vercel
```

### 2.3 Set Environment Variables
In Vercel dashboard, set:
- `VITE_API_URL`: Your backend Render URL

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
- Backend: `https://your-backend-url.onrender.com`
- Database: MongoDB Atlas (your cluster URL)
