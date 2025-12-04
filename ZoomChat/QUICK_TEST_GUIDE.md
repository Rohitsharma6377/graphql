# 🚀 QUICK TEST GUIDE

## ✅ What Was Fixed

1. **Permission System** - Auto-requests camera/mic with retry logic
2. **Connection Reliability** - Watchdog ensures connections establish
3. **Screen Sharing** - Works bidirectionally
4. **Debug Logging** - Detailed console output for troubleshooting

---

## 🧪 Quick Test (2 Minutes)

### Step 1: Start Server
```bash
npm run dev
```

### Step 2: Open Browser 1
```
http://localhost:3000/room/test123
```
- Click "Grant Access" when permission modal appears
- Allow camera/mic in browser prompt
- Should see YOUR camera in top-left box

### Step 3: Open Browser 2 (Incognito)
```
http://localhost:3000/room/test123
```
- Grant permissions
- Should see YOUR camera in top-left box

### Step 4: Wait 5-8 Seconds
- Browser 1 bottom-left should show Browser 2's camera ✅
- Browser 2 bottom-left should show Browser 1's camera ✅

### Step 5: Test Screen Share
- Click screen share button in Browser 1
- Select window/screen
- Browser 2 should see your screen in bottom-right box ✅

### Step 6: Test Chat
- Type message in Browser 1
- Should appear in both browsers ✅

---

## 🐛 If Not Working

### Open Console (F12) in BOTH Browsers

**Look for:**

✅ **SUCCESS**:
```
✅ Media permissions granted!
✅ CALL SETUP COMPLETE
🎯 Registering handler for: user-joined
👥 User joined: Guest ID: user_...
📤 Creating and sending offer
📩 Received answer
🧊 ICE connection state: connected
✅ Peer connection established!
```

❌ **FAILURE**:
```
❌ Permission denied
⚠️ No peer connection yet
❌ Error creating offer
```

---

## 📋 Checklist

Before Testing:
- [ ] Server running (`npm run dev`)
- [ ] Two different browsers ready
- [ ] No other apps using camera
- [ ] Console open (F12) in both

During Test:
- [ ] Permission modal shows
- [ ] Browser prompts for camera/mic
- [ ] Both grant permissions
- [ ] Both see own camera
- [ ] Both see "Connected" indicator
- [ ] Console shows "CALL SETUP COMPLETE"

After 5-8 Seconds:
- [ ] Both see each other's video
- [ ] Console shows "connected"
- [ ] No error messages

Screen Share:
- [ ] Click screen share button
- [ ] Select window/screen
- [ ] Remote user sees shared screen
- [ ] Stop works cleanly

Chat:
- [ ] Messages send instantly
- [ ] No duplicates
- [ ] Both users see messages

---

## 🔥 Quick Fixes

### Camera Not Starting
1. Check another app isn't using it
2. Close other browser tabs
3. Restart browser
4. Check Windows privacy settings

### Permission Denied
1. Click camera icon in address bar
2. Select "Always allow"
3. Refresh page

### Remote Video Not Showing
1. Check console for errors
2. Look for "User joined" message
3. Look for "Creating and sending offer"
4. If missing, check network connection

### Screen Share Not Working
1. Make sure you selected the right window
2. Check "Share audio" checkbox if needed
3. Look for "Screen share started" in console

---

## 📊 Expected Timeline

| Time | Event |
|------|-------|
| 0s | Open Browser 1, grant permissions |
| 2s | Camera starts, "CALL SETUP COMPLETE" |
| 3s | Open Browser 2, grant permissions |
| 5s | Browser 2 camera starts |
| 6s | "User joined" logged in Browser 1 |
| 7s | "Creating offer" in Browser 1 |
| 8s | Both browsers show "connected" |
| 9s | **Both see each other's video** ✅ |

**Total: ~9 seconds** from opening Browser 1 to video showing

---

## 💡 Pro Tips

1. **Use F12 Console**: Best way to see what's happening
2. **Test in Incognito**: Avoids permission cache issues
3. **Close Other Apps**: Zoom, Teams, etc. can block camera
4. **Wait 10 Seconds**: Some connections take a bit longer
5. **Refresh If Stuck**: Ctrl+F5 to hard refresh

---

## 📞 Need Help?

See detailed guides:
- **PERMISSION_FIXES_COMPLETE.md** - Full documentation
- **DEBUGGING_GUIDE.md** - Step-by-step troubleshooting
- **CRITICAL_FIXES_APPLIED.md** - Technical details

---

**Ready to test? Run `npm run dev` and follow the steps above!** 🚀
