# 🚨 CRITICAL FIXES NEEDED - Complete Guide

## ❌ Current Problems:

1. **Wrong Backend URL**: Calling `https://heartshare.onrender.com` instead of `https://graphql-iwju.onrender.com`
2. **500 Error**: Backend on Render doesn't have updated code
3. **Redirect Loop**: After creating room → redirects to guest login
4. **Missing Token**: Token not persisting properly

---

## ✅ COMPLETE FIX (Do in Order):

### **FIX 1: Update Vercel Environment Variables** ⚡ URGENT

1. Go to: https://vercel.com/dashboard
2. Click your `graphql` or `ZoomChat` project  
3. Click **Settings** → **Environment Variables**
4. Delete or update these variables:

| Variable | OLD (Wrong) | NEW (Correct) |
|----------|-------------|---------------|
| `NEXT_PUBLIC_API_URL` | `https://heartshare.onrender.com/api` | `https://graphql-iwju.onrender.com/api` |
| `NEXT_PUBLIC_WS_URL` | `wss://heartshare.onrender.com` | `wss://graphql-iwju.onrender.com` |

5. **Apply to**: Production, Preview, Development (check all 3)
6. Click **Save**
7. Go to **Deployments** tab
8. Click **"..."** on latest deployment → **Redeploy**

---

### **FIX 2: Upload Backend Code to GitHub**

Your Render backend needs these updated files:

#### **Method A: GitHub Web Interface (No Git Required)**

**Upload File 1: `server/routes/rooms.js`**
1. Go to: https://github.com/Rohitsharma6377/graphql
2. Click `server` → `routes` → `rooms.js`
3. Click pencil icon (Edit)
4. Delete all content
5. Copy from: `C:\Users\ASUS\Desktop\graphql\server\routes\rooms.js`
6. Paste into GitHub
7. Commit message: "Fix rooms route - make public"
8. Click "Commit changes"

**Upload File 2: `server/controllers/authController.js`**
1. Go to `server` → `controllers` → `authController.js`
2. Click pencil icon
3. Replace with content from: `C:\Users\ASUS\Desktop\graphql\server\controllers\authController.js`
4. Commit message: "Fix auth responses"
5. Commit

**Upload File 3: `server/render.yaml`**
1. Go to `server` folder
2. Click "Add file" → "Upload files"
3. Upload: `C:\Users\ASUS\Desktop\graphql\server\render.yaml`
4. Commit message: "Add render config"
5. Commit

**Render will auto-deploy in 2-3 minutes.**

---

### **FIX 3: Fix Redirect Loop in Frontend**

The issue is that after creating a room or logging in, it redirects back to guest login. Let me check the redirect logic:

This is likely in the room creation or auth flow. The app should:
- After login → redirect to `/chat`
- After creating room → redirect to `/room/[roomId]`
- NOT redirect to `/auth/guest`

---

## 🧪 Testing After Fixes:

### **Test 1: Check Vercel Env Vars**
```
1. Open browser console on https://graphql-blue.vercel.app
2. Type: console.log(process.env.NEXT_PUBLIC_API_URL)
3. Should show: https://graphql-iwju.onrender.com/api
```

### **Test 2: Check Backend**
```powershell
# Test rooms endpoint (should work after Render deploy)
Invoke-WebRequest -Uri "https://graphql-iwju.onrender.com/api/rooms"
```

### **Test 3: Full Flow**
```
1. Visit: https://graphql-blue.vercel.app/auth/login
2. Login or click "Continue as Guest"
3. Should see /chat page with room list (NO 500 error)
4. Click "Create Room"
5. Enter room name
6. Should redirect to /room/[id] (NOT /auth/guest)
7. Should join room successfully
```

---

## 📊 Quick Checklist:

- [ ] Update `NEXT_PUBLIC_API_URL` on Vercel
- [ ] Update `NEXT_PUBLIC_WS_URL` on Vercel
- [ ] Redeploy Vercel
- [ ] Upload `server/routes/rooms.js` to GitHub
- [ ] Upload `server/controllers/authController.js` to GitHub
- [ ] Upload `server/render.yaml` to GitHub
- [ ] Wait for Render to deploy (2-3 min)
- [ ] Test: https://graphql-iwju.onrender.com/api/rooms
- [ ] Test: https://graphql-blue.vercel.app/chat
- [ ] Create room → Should stay in room (no redirect)

---

## 🔴 Priority Order:

1. **MOST URGENT**: Update Vercel env vars (takes 2 minutes)
2. **SECOND**: Upload backend files to GitHub (takes 5 minutes)
3. **THIRD**: Test everything works

---

## 💡 Why These Errors Happen:

**Wrong URL (`heartshare.onrender.com`):**
- Vercel has old environment variable
- Frontend builds with wrong API URL

**500 Error:**
- Render backend has old code
- Missing updated routes/auth controllers

**Redirect Loop:**
- Auth flow redirects incorrectly
- Need to check redirect logic in auth pages

---

**Start with Vercel env vars - that's the quickest fix!** 🎯
