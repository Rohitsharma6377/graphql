# 🚀 Deployment Guide - HeartShare Video Chat

## ✅ Fixed Issues:
1. ✅ CORS configuration updated to allow Vercel deployment
2. ✅ API URLs configured for production
3. ✅ WebSocket URL configured for production
4. ✅ Environment variables updated

---

## 📦 Backend Deployment (Render)

### **Environment Variables on Render:**

Add these in your Render dashboard under "Environment":

```
PORT=5000
MONGODB_URI=mongodb+srv://lavish6377289324:lavish6377289324@cluster0.83rih.mongodb.net/?appName=Cluster0
JWT_SECRET=your-super-secret-jwt-key-heartshare-video-call-2024
JWT_EXPIRE=7d
NODE_ENV=production
CLIENT_URL=https://graphql-cu7ucqxdx-rohitsharmadev6-4851s-projects.vercel.app
ADMIN_EMAIL=admin@heartshare.com
ADMIN_PASSWORD=Admin@123
```

### **Deployment Steps:**

1. **Push to GitHub**:
   ```bash
   cd server
   git add .
   git commit -m "Update CORS for Vercel deployment"
   git push
   ```

2. **Render will auto-deploy** (if connected to GitHub)
   - Or click "Manual Deploy" → "Deploy latest commit"

3. **Verify deployment**:
   - Visit: `https://graphql-iwju.onrender.com/health`
   - Should return: `{"success":true,"message":"Server is running"}`

---

## 🌐 Frontend Deployment (Vercel)

### **Environment Variables on Vercel:**

Add these in Vercel dashboard under "Settings" → "Environment Variables":

```
NEXT_PUBLIC_APP_NAME=HeartShare
NEXT_PUBLIC_API_URL=https://graphql-iwju.onrender.com/api
NEXT_PUBLIC_WS_URL=wss://graphql-iwju.onrender.com
NEXT_PUBLIC_STUN=stun:stun.l.google.com:19302
NEXT_PUBLIC_ABLY_KEY=at8n-g.NNoylw:0Kihexqoq9FtVAsnYjZ1iTEDT_mZIeKDNXVLpp4z4aU
```

### **Deployment Steps:**

1. **Push changes to GitHub**:
   ```bash
   cd ZoomChat
   git add .
   git commit -m "Update API URLs for production"
   git push
   ```

2. **Vercel will auto-deploy**
   - Or go to Vercel dashboard → "Deployments" → "Redeploy"

3. **Test the deployment**:
   - Visit: `https://graphql-cu7ucqxdx-rohitsharmadev6-4851s-projects.vercel.app`

---

## 🔧 What Was Fixed:

### **1. CORS Configuration** (server/server.js):
```javascript
// Now allows multiple origins
const allowedOrigins = [
  'http://localhost:3000',
  'https://graphql-cu7ucqxdx-rohitsharmadev6-4851s-projects.vercel.app',
  'https://graphql-rohitsharmadev6-4851s-projects.vercel.app',
  process.env.CLIENT_URL
].filter(Boolean);
```

### **2. API Client** (ZoomChat/src/lib/api.js):
- Fixed double `/api` path issue
- Now correctly uses `NEXT_PUBLIC_API_URL`

### **3. WebSocket** (ZoomChat/src/lib/ably-signaling.js):
- Already using `NEXT_PUBLIC_WS_URL`
- Will connect to `wss://graphql-iwju.onrender.com`

---

## 🧪 Testing After Deployment:

1. **Login Test**:
   - Go to login page
   - Should not see CORS errors
   - Should successfully login

2. **WebSocket Test**:
   - Join a room
   - Check browser console for WebSocket connection
   - Should see: `📡 WebSocket connected`

3. **Video Call Test**:
   - Create a room
   - Share link in incognito/different browser
   - Test camera, mic, screen share

---

## ⚠️ Important Notes:

1. **Render Free Tier** sleeps after 15 min inactivity
   - First request might be slow (cold start)
   - Consider keeping server awake with ping service

2. **WebSocket Limitations**:
   - Free tier has connection limits
   - For production, upgrade to paid plan

3. **HTTPS Required**:
   - Camera/mic requires HTTPS
   - Vercel provides HTTPS automatically
   - Render provides HTTPS automatically

---

## 📝 Next Steps:

1. Deploy backend to Render with new environment variables
2. Deploy frontend to Vercel with new environment variables
3. Test all features (login, rooms, video, chat)
4. Monitor Render logs for any errors

---

## 🐛 If Issues Persist:

1. **Check Render Logs**:
   - Go to Render dashboard
   - Click on your service
   - View "Logs" tab

2. **Check Vercel Logs**:
   - Go to Vercel dashboard
   - Click "View Function Logs"

3. **Browser Console**:
   - Open DevTools (F12)
   - Check Console tab for errors
   - Check Network tab for failed requests

---

**Your deployment is ready! Just update the environment variables on Render and redeploy.** 🚀
