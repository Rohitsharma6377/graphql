# 🚀 Complete Vercel Deployment Guide

## ✅ Your App is Ready for Vercel!

I've verified everything - your codebase **builds successfully** and is ready to deploy.

---

## 📋 Pre-Deployment Checklist

### ✅ Already Done:
- [x] Ably package installed (`npm install ably`)
- [x] Ably signaling client created (`src/lib/ably-signaling.ts`)
- [x] Ably hook created (`src/hooks/useCallState-ably.ts`)
- [x] TypeScript errors fixed
- [x] Build tested successfully ✓
- [x] Ably API key added to `.env.local`

### 📝 Your Current Ably Key:
```
NEXT_PUBLIC_ABLY_KEY=at8n-g.NNoylw:0Kihexqoq9FtVAsnYjZ1iTEDT_mZIeKDNXVLpp4z4aU
```

---

## 🎯 Deployment Steps

### Option 1: Use Ably (Recommended for Vercel)

#### Step 1: Switch to Ably in Room Page

**File: `app/room/[roomId]/page.tsx`**

Find line 13:
```typescript
import { useCallState } from '@/hooks/useCallState'
```

**Change to:**
```typescript
import { useCallState } from '@/hooks/useCallState-ably'
```

#### Step 2: Deploy to Vercel

```bash
# Push to GitHub
git add .
git commit -m "Switch to Ably for Vercel deployment"
git push origin main

# Or deploy directly
npx vercel
```

#### Step 3: Add Environment Variable on Vercel

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add:
   - **Name:** `NEXT_PUBLIC_ABLY_KEY`
   - **Value:** `at8n-g.NNoylw:0Kihexqoq9FtVAsnYjZ1iTEDT_mZIeKDNXVLpp4z4aU`
   - **Environment:** Production, Preview, Development (all three)
3. Click "Save"
4. Redeploy

#### Step 4: Test

Visit your Vercel URL and check browser console for:
```
✅ Connected to Ably: user_xxxxx_123456
🚪 Joining room: room_xyz as Alice
```

---

### Option 2: Keep Socket.IO (Deploy Separately)

If you prefer Socket.IO, you need to deploy the signaling server separately:

#### Deploy Socket.IO to Railway

1. **Create `server.js` in root:**
```javascript
const { Server } = require('socket.io')
const http = require('http')

const httpServer = http.createServer()
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
})

// Copy all socket logic from pages/api/socket.ts

httpServer.listen(process.env.PORT || 3001)
console.log('Socket.IO server running on port', process.env.PORT || 3001)
```

2. **Deploy to Railway.app:**
   - Sign up at https://railway.app
   - New Project → Deploy from GitHub
   - Add your repo
   - Railway will auto-detect Node.js
   - Get deployment URL (e.g., `socketio-server.railway.app`)

3. **Update `src/lib/signaling.ts`:**
```typescript
this.socket = io('https://socketio-server.railway.app', {
  path: '/socket.io',
})
```

4. **Deploy Next.js to Vercel** (without changing hook)

---

## 🧪 Testing Your Deployment

### Local Test (Before Deploy)
```bash
npm run build
npm start
```
Open http://localhost:3000 - should work!

### Production Test (After Deploy)

1. **Open Vercel URL in Chrome:**
   - Login as "Alice"
   - Create room
   - Copy room ID

2. **Open same URL in Firefox:**
   - Login as "Bob"
   - Paste room ID
   - Join room

3. **Check for connection:**
   - Should see each other's video
   - Green "Live" badges
   - Chat works

---

## 🔍 Troubleshooting

### Issue: "NEXT_PUBLIC_ABLY_KEY not found"

**Solution:** Add environment variable on Vercel dashboard

### Issue: "Connection failed"

**Check:**
1. Browser console for errors
2. Vercel function logs
3. Ably dashboard for connection stats

### Issue: "No video/audio"

**Check:**
1. HTTPS is required for WebRTC (Vercel auto-provides)
2. Browser permissions granted
3. Different browsers/devices (not same user twice)

---

## 📊 What Works Where

| Feature | Localhost (Socket.IO) | Vercel (Ably) |
|---------|----------------------|---------------|
| Video Calls | ✅ | ✅ |
| Screen Share | ✅ | ✅ |
| Chat | ✅ | ✅ |
| Real-time | ✅ | ✅ |
| Signaling | Socket.IO | Ably |
| Cost | Free | Free (6M msg/month) |

---

## 💰 Ably Free Tier Limits

- **6 million messages/month** FREE
- **200 simultaneous connections**
- **99.999% uptime SLA**
- **Global edge network**

For 1-on-1 video chat:
- ~1000 messages per 10-minute call
- Can handle **6000 calls/month** on free tier! 🎉

---

## 🚀 Quick Deploy Command

```bash
# One command to deploy
git add . && git commit -m "Deploy with Ably" && git push && npx vercel --prod
```

---

## ✅ Final Checklist

Before deploying:
- [ ] Changed import to `useCallState-ably` in room page
- [ ] Added `NEXT_PUBLIC_ABLY_KEY` to Vercel env vars
- [ ] Tested build locally (`npm run build`)
- [ ] Pushed to GitHub
- [ ] Deployed to Vercel
- [ ] Tested with 2 different browsers

---

## 📱 Your Live App Will Be

**URL:** `https://your-app-name.vercel.app`

**Features:**
- ✅ 1-on-1 video calls
- ✅ Screen sharing with audio
- ✅ Real-time chat
- ✅ Emoji reactions
- ✅ Beautiful UI
- ✅ Mobile responsive
- ✅ Works on Vercel! 🎉

---

**Need help?** Check browser console and Vercel function logs!
