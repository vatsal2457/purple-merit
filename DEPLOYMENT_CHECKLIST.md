# Deployment Checklist - Vercel + Render

## ✅ Pre-deployment Checklist

### Backend (Render)
- [ ] Push code to GitHub
- [ ] Create MongoDB Atlas cluster
- [ ] Get MongoDB connection string
- [ ] Generate JWT secret: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`

### Frontend (Vercel)
- [ ] Install Vercel CLI: `npm i -g vercel`
- [ ] Prepare environment variables

## 🚀 Deployment Steps

### Step 1: Deploy Backend on Render
1. Go to [render.com](https://render.com)
2. Sign in and connect GitHub
3. Click "New +" → "Web Service"
4. Select your repository
5. Configure:
   - **Name**: `purple-merit-backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Plan**: Free
6. Add Environment Variables:
   - `MONGODB_URI`: Your MongoDB Atlas connection string
   - `JWT_SECRET`: Your generated secret
   - `NODE_ENV`: `production`
7. Deploy and copy the URL (e.g., `https://purple-merit-backend.onrender.com`)

### Step 2: Seed Database
```bash
cd backend
# Update your local .env with the same values as Render
npm run seed:admin
npm run seed:manager
```

### Step 3: Deploy Frontend on Vercel
1. Create `frontend/.env.production`:
   ```env
   VITE_API_URL=https://your-backend-url.onrender.com
   ```
2. Deploy:
   ```bash
   cd frontend
   vercel
   ```
3. Set environment variable in Vercel dashboard:
   - `VITE_API_URL`: Your backend Render URL

## 🔗 Final URLs
- Frontend: `https://your-frontend-url.vercel.app`
- Backend: `https://your-backend-url.onrender.com`
- Login: manager@purplemerit.com / password123

## 🐛 Troubleshooting
- **CORS errors**: Update backend CORS in `backend/src/index.ts`
- **Database connection**: Check MongoDB Atlas network access
- **Build errors**: Check TypeScript compilation locally first
