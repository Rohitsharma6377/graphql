# 🔥 CRITICAL DEBUGGING GUIDE

## Current Issue
Both browsers show:
- **Local**: "Camera Off" or camera shows
- **Remote**: "Waiting..." (never connects)
- **Screen Share**: Not showing on remote

## Root Cause Analysis

Based on the screenshots, here's what's happening:

### Browser 1 (First to Join):
```
1. Opens room
2. Requests camera/mic
3. Joins Ably room
4. Waits for "user-joined" event
5. No other user yet → stays in waiting state
```

### Browser 2 (Second to Join):
```
1. Opens room
2. Requests camera/mic
3. Joins Ably room
4. Sends "user-joined" presence event
5. Browser 1 should receive this
6. Browser 1 should create offer
7. Browser 2 should receive offer
8. Browser 2 should create answer
9. Connection established
```

### What's Failing:
- ❌ Offer not being created
- ❌ Handlers not registered in time
- ❌ Early messages lost
- ❌ Peer connection not ready

---

## Debugging Steps

### **Step 1: Open Both Browser Consoles**

**Browser 1:**
1. Open http://localhost:3000/room/test123
2. Press F12 to open DevTools
3. Go to Console tab
4. Allow camera/mic when prompted

**Expected Console Output:**
```
🎥 ========================================
🎥 STARTING LOCAL MEDIA
🎥 ========================================
✅ Media permissions granted!
  Video tracks: 1
  Audio tracks: 1
✅ ========================================
✅ LOCAL MEDIA STARTED
✅ Video tracks: ['Integrated Camera (04f2:b680)']
✅ Audio tracks: ['Microphone Array (Realtek(R) Audio)']
✅ ========================================

🚀 ========================================
🚀 JOINING CALL
🚀 Room ID: test123
🚀 Client ID: user_abc123_1234567890
🚀 Local stream tracks: ['video: Integrated Camera', 'audio: Microphone Array']
🚀 ========================================

📡 Creating new peer connection...
➕ Adding local tracks to peer connection...
  ✅ Added video track: Integrated Camera (enabled: true)
  ✅ Added audio track: Microphone Array (enabled: true)
🔧 Setting up peer connection handlers...
✅ Setting isInCall = true
📢 Joining Ably room: test123

✅ Ably signaling connected
🎯 Registering ALL signaling event handlers...
🎯 [Ably] Registering handler for: user-joined
  ✅ Handler registered. Total handlers for user-joined : 1
🎯 [Ably] Registering handler for: user-left
🎯 [Ably] Registering handler for: offer
🎯 [Ably] Registering handler for: answer
🎯 [Ably] Registering handler for: ice-candidate

🚪 Joining room test123 as Guest
```

**If you DON'T see this**, the issue is:
- Camera/mic permissions blocked
- Local media not starting
- Hook not initializing

---

### **Step 2: Join with Browser 2**

**Browser 2 (Incognito or Different Browser):**
1. Open http://localhost:3000/room/test123
2. Press F12
3. Go to Console
4. Allow camera/mic

**Browser 1 Should Now Show:**
```
📨 [Ably] Received message: user-joined from: user_xyz789_...
  ✅ Emitting to handler
👥 User joined: Guest ID: user_xyz789_0987654321
🎯 I will initiate the offer (my ID: user_abc123_1234567890 is higher than: user_xyz789_0987654321)
📤 Creating and sending offer to: user_xyz789_0987654321
✅ Offer sent successfully
```

**Browser 2 Should Show:**
```
📨 [Ably] Received message: offer from: user_abc123_...
  ✅ Emitting to handler
📩 Received offer from: user_abc123_1234567890
📝 Setting remote description and creating answer...
📤 Sent answer
```

**Then Both Should Show:**
```
📨 [Ably] Received message: ice-candidate from: user_...
🧊 Received ICE candidate from: user_...
🧊 ICE connection state: checking
🧊 ICE connection state: connected
✅ Peer connection established!
🎥 Received remote track: video readyState: live
  Using event.streams[0]
✅ Remote stream set with 2 tracks
```

---

## Common Issues & Fixes

### Issue 1: No "user-joined" Event Received

**Symptoms:**
- Browser 2 joins
- Browser 1 doesn't log "User joined"
- No offer created

**Causes:**
1. Handlers not registered
2. Ably connection failed
3. Presence not working

**Fix:**
Check if you see this in Browser 1:
```
🎯 [Ably] Registering handler for: user-joined
  ✅ Handler registered. Total handlers for user-joined : 1
```

If NO:
- Handlers are not being registered
- Check that useCallState hook is mounting
- Check that Ably connection succeeded

---

### Issue 2: "No peer connection yet when user joined"

**Symptoms:**
```
👥 User joined: Guest ID: user_xyz789_...
⚠️ No peer connection yet when user joined, skipping offer
```

**Cause:**
- `joinCall()` not called before user joined
- Peer connection created too late

**Fix:**
- Ensure `joinCall()` is called in room page
- Check that local stream is ready
- Increase timeout in user-joined handler (currently 800ms)

---

### Issue 3: Offer Created But Not Received

**Symptoms:**
- Browser 1: "✅ Offer sent successfully"
- Browser 2: No "Received offer" message

**Cause:**
- Browser 2 handlers not registered yet
- Ably channel mismatch
- Offer buffered but not replayed

**Fix:**
Check Buffer Status in Browser 2:
```
📨 [Ably] Received message: offer from: user_abc123_...
  📦 No handler registered yet, buffering message
  📊 Buffer now has 1 messages
```

Then when handler registered:
```
🎯 [Ably] Registering handler for: offer
  🔄 First handler for this event, replaying buffered messages...
🔄 [Ably] Replaying buffered messages for: offer
  ▶️  Replaying: offer
✅ [Ably] Replayed 1 messages, 0 remaining in buffer
```

---

### Issue 4: Camera Permissions Blocked

**Symptoms:**
- "Camera Off" on local video
- Error: NotAllowedError

**Causes:**
1. User denied permissions
2. Another app using camera
3. Browser settings block

**Fixes:**

**Chrome:**
1. Click camera icon in address bar
2. Select "Always allow"
3. Refresh page

**Firefox:**
1. Click camera icon in address bar  
2. Select "Remember this decision"
3. Click "Allow"

**Safari:**
1. Safari menu → Settings
2. Websites → Camera/Microphone
3. Find your site → Allow

**Edge:**
1. Click camera icon in address bar
2. Select "Always allow"
3. Refresh page

---

### Issue 5: Watchdog Not Triggering

**Symptoms:**
- Connection stuck in "new" state
- No offer created after 2+ seconds
- No "WATCHDOG" logs

**Expected Watchdog Output:**
```
🔥 WATCHDOG: Connection stuck, forcing offer creation...
   My ID: user_abc123_1234567890
   Remote ID: user_xyz789_0987654321
   Connection state: new
   Has remote description: false
📤 WATCHDOG: Sending forced offer
```

**If Not Showing:**
- Watchdog effect not running
- `isInCall` is false
- `remotePeerId` is null

---

## Manual Testing Checklist

### ✅ Pre-Test Setup
- [ ] Server running (`npm run dev`)
- [ ] Two browsers ready (e.g., Chrome + Firefox OR Chrome + Chrome Incognito)
- [ ] DevTools console open in both
- [ ] No other apps using camera/mic

### ✅ Browser 1 Tests
- [ ] Open room URL
- [ ] See permission prompt
- [ ] Grant camera/mic access
- [ ] See local video in top-left box
- [ ] See "Connected" indicator
- [ ] Console shows "CALL SETUP COMPLETE"
- [ ] Console shows handlers registered

### ✅ Browser 2 Tests
- [ ] Open same room URL in second browser
- [ ] Grant camera/mic access
- [ ] See local video in top-left box
- [ ] Console shows "JOINING CALL"

### ✅ Connection Tests
- [ ] Browser 1 logs "User joined"
- [ ] Browser 1 logs "Creating and sending offer"
- [ ] Browser 2 logs "Received offer"
- [ ] Browser 2 logs "Sent answer"
- [ ] Browser 1 logs "Received answer"
- [ ] Both log "ICE connection state: connected"
- [ ] Both show remote video (bottom-left box)

### ✅ Screen Share Tests
- [ ] Click screen share button in Browser 1
- [ ] Select window/screen/tab
- [ ] Browser 1 top-right shows shared screen
- [ ] Browser 2 bottom-right shows remote screen
- [ ] Click stop share
- [ ] Both screens return to camera

### ✅ Chat Tests
- [ ] Type message in Browser 1
- [ ] Message appears in Browser 1 chat (once)
- [ ] Message appears in Browser 2 chat (once)
- [ ] No duplicate messages

---

## Expected Timeline

| Time | Browser 1 | Browser 2 |
|------|-----------|-----------|
| 0s | Opens room, requests permissions | - |
| 1s | Camera starts, joins call | - |
| 2s | Registers handlers, waiting for peer | - |
| 3s | - | Opens room, requests permissions |
| 4s | Receives "user-joined", creates offer | Camera starts, joins call |
| 5s | Sends offer via Ably | Receives offer, creates answer |
| 6s | Receives answer | Sends answer via Ably |
| 7s | ICE candidates exchange | ICE candidates exchange |
| 8s | **Connected! Video shows** | **Connected! Video shows** |

**Total Time**: ~5-8 seconds from Browser 2 joining to video showing

---

## If Still Not Working

### Last Resort Debugging:

1. **Check Ably Dashboard**:
   - Go to ably.com
   - Check if messages are being sent
   - Verify API key is correct

2. **Check Network Tab**:
   - Open DevTools → Network
   - Filter by "ably"
   - Look for /token endpoint (should return 200)
   - Look for WebSocket connections

3. **Check STUN Server**:
   ```javascript
   // In console:
   new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] })
   ```
   Should not throw error

4. **Test Without WebRTC**:
   - Just test Ably messaging
   - Send chat message
   - If chat works → WebRTC issue
   - If chat doesn't work → Ably issue

5. **Clear Everything**:
   ```
   - Close all browser tabs
   - Clear browser cache
   - Clear site data
   - Restart browser
   - Try again
   ```

---

## Success Criteria

When working correctly, you should see:

**Browser 1 (4-box grid):**
```
┌─────────────┬─────────────┐
│  YOU        │  YOUR       │
│  (Camera)   │  SCREEN     │
│  ON ✅      │  OFF ❌     │
├─────────────┼─────────────┤
│  REMOTE     │  REMOTE     │
│  USER       │  SCREEN     │
│  LIVE ✅    │  OFF ❌     │
└─────────────┴─────────────┘
```

**After Screen Share:**
```
┌─────────────┬─────────────┐
│  YOU        │  YOUR       │
│  (Camera)   │  SCREEN     │
│  ON ✅      │  ON ✅      │
├─────────────┼─────────────┤
│  REMOTE     │  REMOTE     │
│  USER       │  SCREEN     │
│  LIVE ✅    │  LIVE ✅    │
└─────────────┴─────────────┘
```

Both users should see each other's cameras and screens working!

---

**Next**: Follow the debugging steps above and report back what console logs you see! 🐛
