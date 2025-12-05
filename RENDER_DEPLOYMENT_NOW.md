# 🚀 RENDER DEPLOYMENT - IMMEDIATE ACTIONS NEEDED

## ⚠️ YOUR LIVE API: https://graphql-iwju.onrender.com/

---

## 📋 STEP-BY-STEP INSTRUCTIONS:

### **1. Go to Render Dashboard**
Visit: https://dashboard.render.com/

### **2. Find Your Service**
- Click on your service: `graphql-iwju` or similar name

### **3. Click "Environment" Tab**

### **4. Add/Update These Environment Variables:**

```
PORT=5000
MONGODB_URI=mongodb+srv://lavish6377289324:lavish6377289324@cluster0.83rih.mongodb.net/?appName=Cluster0
JWT_SECRET=your-super-secret-jwt-key-heartshare-video-call-2024
JWT_EXPIRE=7d
NODE_ENV=production
CLIENT_URL=https://graphql-blue.vercel.app
ADMIN_EMAIL=admin@heartshare.com
ADMIN_PASSWORD=Admin@123
```

### **5. Click "Save Changes"**

Render will **automatically redeploy** with new settings!

---

## ✅ WHAT WILL BE FIXED:

1. ✅ CORS will allow `https://graphql-blue.vercel.app`
2. ✅ Backend will accept requests from your Vercel deployment
3. ✅ Login will work
4. ✅ All API calls will work

---

## 🔄 ALTERNATIVE: Manual Deploy

If environment variables don't trigger deploy:

1. Go to "Manual Deploy" tab
2. Click "Clear build cache & deploy"
3. Wait 2-3 minutes for deployment

---

## 🧪 TEST AFTER DEPLOYMENT:

1. Visit: `https://graphql-iwju.onrender.com/health`
   - Should show: `{"success":true,"message":"Server is running"}`

2. Visit your Vercel app: `https://graphql-blue.vercel.app`
   - Try to login
   - Should work without CORS errors!

---

## ⚡ FILES ALREADY UPDATED LOCALLY:

✅ `server/server.js` - CORS now allows:
   - `https://graphql-blue.vercel.app`
   - `https://*.vercel.app` (all Vercel deployments)
   - localhost:3000

✅ `server/.env` - CLIENT_URL updated to Vercel URL

---

## 📤 UPLOAD TO RENDER (If not using Git):

If your Render service is **NOT** connected to GitHub:

### **Option A: Connect to GitHub (Recommended)**
1. Push code to GitHub repo
2. In Render dashboard → Settings
3. Connect GitHub repository
4. Enable "Auto-Deploy"

### **Option B: Manual Upload**
1. Zip your `server` folder
2. Render doesn't support zip upload - **USE GITHUB!**

---

## 🎯 RECOMMENDED: CONNECT GITHUB

1. Create GitHub repo (if not exists)
2. In `server` folder, run:
   ```bash
   git init
   git add .
   git commit -m "Update CORS for Vercel"
   git branch -M main
   git remote add origin YOUR_GITHUB_REPO_URL
   git push -u origin main
   ```

3. In Render:
   - Settings → Connect Repository
   - Select your repo
   - Branch: `main`
   - Build Command: `npm install`
   - Start Command: `npm start`

---

## 🆘 IF YOU SEE ERRORS:

**"No 'Access-Control-Allow-Origin' header"**
→ Environment variables not updated yet. Wait for redeploy.

**"Service Unavailable"**
→ Render is deploying. Wait 2-3 minutes.

**"Connection refused"**
→ Check Render logs for errors.

---

## 📞 QUICK FIX NOW:

**Just update the environment variables on Render and save!**

The code is already updated locally. Render just needs the new `CLIENT_URL` environment variable.

---

**Current Status:**
- ✅ Frontend: `https://graphql-blue.vercel.app`
- ✅ Backend: `https://graphql-iwju.onrender.com`
- ⏳ Waiting: Render environment variable update

**Time to fix: 2 minutes** ⏱️
