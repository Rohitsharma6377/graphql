# 🧪 Testing Your Ably Connection

## ✅ Setup Complete!

Your app is now using **Ably** for signaling (works on Vercel).

**Server:** Running at http://localhost:3000
**Signaling:** Ably (Vercel-compatible)
**API Key:** Configured ✓

---

## 🎯 How to Test (IMPORTANT!)

### ⚠️ Critical Rules:
1. **Use 2 DIFFERENT browsers** (Chrome + Firefox)
2. **OR use Incognito mode** in same browser
3. **Login as DIFFERENT users** (not same username)

---

## 📝 Step-by-Step Test

### **Browser 1 (Chrome):**
```
1. Open: http://localhost:3000
2. Login as: Alice
3. Click "Create Room" or paste room ID
4. Click "Join Room"
5. Allow camera/mic
6. COPY THE ROOM ID from URL
```

### **Browser 2 (Firefox or Chrome Incognito):**
```
1. Open: http://localhost:3000
2. Login as: Bob
3. PASTE the room ID from Browser 1
4. Click "Join Room"
5. Allow camera/mic
6. WAIT 2-3 seconds
```

### ✅ **Expected Result:**
- Both users see each other's video
- Green "Live" badges appear
- Console shows: "✅ Connected to Ably"
- Console shows: "🎥 Received remote track"

---

## 🔍 Check Browser Console

**Press F12** in both browsers and look for:

### **Good Signs (Working):**
```
✅ Connected to Ably: user_abc123_1234567
🚪 Joining room: room_xyz as Alice
👥 User joined: Bob ID: user_def456_7654321
🎯 I will initiate the offer (my ID is higher)
📤 Creating and sending offer...
🎥 Received remote track: video
🔌 Connection state: connected
```

### **Bad Signs (Not Working):**
```
❌ NEXT_PUBLIC_ABLY_KEY not found
❌ Failed to connect to Ably
⚠️ Ignoring self-join event (same user ID)
```

---

## 🐛 Common Issues

### Issue 1: "NEXT_PUBLIC_ABLY_KEY not found"
**Problem:** API key not loaded
**Solution:** 
```bash
# Restart the dev server
Ctrl+C (in terminal)
npm run dev
```

### Issue 2: "Both users stuck on Waiting"
**Problem:** Using same browser/same user
**Solution:** Use different browsers or incognito mode

### Issue 3: "No video streams"
**Problem:** Camera permissions or WebRTC issue
**Solution:**
- Check camera/mic permissions
- Make sure HTTPS (use Vercel for production)
- Try different browsers

### Issue 4: "Connection failed"
**Problem:** Ably client not initialized
**Solution:** Check console for Ably errors

---

## 🎥 Test Scenarios

### Test 1: Basic Video Call
- [ ] Join from Chrome as Alice
- [ ] Join from Firefox as Bob
- [ ] See each other ✓
- [ ] Hear each other ✓

### Test 2: Screen Sharing
- [ ] Click screen share button
- [ ] Select tab/window
- [ ] Other user sees shared screen ✓

### Test 3: Chat
- [ ] Type message in chat
- [ ] Other user receives instantly ✓

### Test 4: Mobile
- [ ] Open on phone (use your computer's IP)
- [ ] Find IP: `ipconfig` → IPv4 Address
- [ ] Access: `http://192.168.x.x:3000`

---

## 📊 Ably Dashboard (Optional)

Check your Ably usage:
1. Go to: https://ably.com/accounts
2. Login
3. Select your app
4. View Stats → See live connections

**Free Tier Limits:**
- 6M messages/month
- 200 simultaneous connections
- You're well within limits! ✓

---

## 🚀 Deploy to Vercel

Once local testing works:

```bash
# 1. Commit changes
git add .
git commit -m "Switch to Ably signaling"
git push

# 2. Deploy
npx vercel

# 3. Add env var on Vercel dashboard:
# NEXT_PUBLIC_ABLY_KEY = at8n-g.NNoylw:0Kihexqoq9FtVAsnYjZ1iTEDT_mZIeKDNXVLpp4z4aU

# 4. Redeploy
```

---

## 💡 Debugging Tips

### View Real-Time Logs:
**Browser Console (F12):**
- All WebRTC events logged with emojis
- Look for "Connected to Ably"
- Check for ICE candidates

### Test Ably Connection Only:
Open console and run:
```javascript
// Test if Ably key works
fetch('https://realtime.ably.io/time')
  .then(r => r.json())
  .then(d => console.log('Ably reachable:', d))
```

---

## ✅ Success Checklist

Before asking for help, verify:
- [ ] Dev server running (`npm run dev`)
- [ ] Two DIFFERENT browsers open
- [ ] Different usernames in each browser
- [ ] Console shows "Connected to Ably"
- [ ] Console shows "User joined"
- [ ] Waited 3-5 seconds for connection

---

## 🆘 Still Not Working?

**Send me these details:**

1. **Browser Console Logs** (from both browsers)
2. **What you see:** (Waiting? Error? Black screen?)
3. **Browsers used:** (Chrome + Firefox? Same browser?)
4. **Usernames:** (Alice and Bob? Or same name?)

---

**Current Status:** ✅ Server running with Ably
**Next Step:** Test with 2 different browsers!
