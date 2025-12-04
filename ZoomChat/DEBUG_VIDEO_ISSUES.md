# 🐛 Video Issues - Debugging Guide

## ✅ **Fixes Applied**

### 1. ✅ **Fixed: Duplicate Messages**
**Problem:** Messages appearing twice in chat

**Fix:** Added duplicate detection by checking message ID before adding to state
```typescript
if (prev.some(m => m.id === message.id)) {
  console.log('⚠️ Duplicate message detected, ignoring')
  return prev
}
```

### 2. ✅ **Fixed: Sender Not Seeing Own Messages**
**Problem:** First user sends message, but doesn't see it in their own chat

**Fix:** Add message to local state immediately when sending
```typescript
// Add to local state immediately for sender
setMessages((prev) => [...prev, message])

// Then send to other users via Ably
ablySignaling.sendMessage(roomId, text, username, timestamp)
```

### 3. ✅ **Enhanced: Video Stream Logging**
**Added detailed logging to help debug camera/screen issues:**
- Video track count
- Audio track count
- Track labels (camera name, screen share type)
- Track state (enabled/disabled)
- Track readyState (live/ended)

---

## 🎥 **How to Debug Video Issues**

### **Step 1: Open Browser Console (F12)**

Both users should have console open to see logs.

### **Step 2: Expected Console Logs**

#### **When Camera Turns On:**
```
🎥 Setting local video stream
  Video tracks: 1 ['Integrated Camera (enabled, live)']
  Audio tracks: 1 ['Microphone Array (enabled, live)']
```

#### **When Remote User Connects:**
```
🎥 Setting remote video stream
  Video tracks: 1 ['Integrated Camera (enabled, live)']
  Audio tracks: 1 ['Microphone Array (enabled, live)']
  Is screen share? false (label: integrated camera)
```

#### **When Screen Sharing:**
```
🖥️ Setting local screen stream
🎥 Setting remote video stream
  Video tracks: 1 ['screen:0:0 (enabled, live)']
  Audio tracks: 0 []
  Is screen share? true (label: screen:0:0)
  Routing to remote screen ref
```

---

## 🔍 **Common Issues & Solutions**

### **Issue 1: Camera Shows "Off" But Permission Granted**

**Symptoms:**
- Green "Connected" badge
- "Camera Off" in local video box
- Console shows: `Video tracks: 0 []`

**Causes:**
1. No physical camera on device
2. Camera in use by another app
3. Camera disabled in system settings

**Solutions:**
```powershell
# Check if camera exists
Get-PnpDevice -Class Camera

# Kill apps using camera
Get-Process | Where-Object {$_.Name -match "zoom|teams|skype"} | Stop-Process -Force

# Test camera in Windows
start microsoft.windows.camera:
```

**Quick Test:**
Open browser console and run:
```javascript
navigator.mediaDevices.getUserMedia({ video: true })
  .then(stream => {
    console.log('✅ Camera works!', stream.getVideoTracks())
    stream.getTracks().forEach(t => t.stop())
  })
  .catch(err => console.error('❌ Camera error:', err))
```

---

### **Issue 2: Screen Share Shows Black**

**Symptoms:**
- "Live" badge on screen share box
- Black screen instead of content
- Console shows: `Video tracks: 1 ['screen:...' (enabled, live)]`

**Possible Causes:**
1. Selected wrong window/screen
2. Browser permission issue
3. DRM-protected content (Netflix, etc.)
4. Hardware acceleration issue

**Solutions:**

1. **Try different screen/window:**
   - Click screen share button again
   - Select "Entire Screen" instead of "Window"
   - Or select different application window

2. **Check browser permissions:**
   - Chrome: `chrome://settings/content/screenshare`
   - Allow screen capture for your site

3. **Disable hardware acceleration:**
   - Chrome: Settings → System → Use hardware acceleration (turn OFF)
   - Restart browser

4. **Test screen share:**
   ```javascript
   navigator.mediaDevices.getDisplayMedia({ video: true })
     .then(stream => {
       console.log('✅ Screen share works!', stream.getVideoTracks())
       // Preview it
       const video = document.createElement('video')
       video.srcObject = stream
       video.play()
       document.body.appendChild(video)
     })
     .catch(err => console.error('❌ Screen share error:', err))
   ```

---

### **Issue 3: Remote User Shows "Waiting..."**

**Symptoms:**
- User 1 sees their camera working
- User 2 shows "Waiting..."
- Console shows: `Video tracks: 0 []` on remote

**Causes:**
1. WebRTC connection not established
2. Firewall blocking media streams
3. STUN/ICE failure (no candidates gathered)

**Debug Steps:**

1. **Check WebRTC connection:**
   Look for these console logs on BOTH users:
   ```
   ✅ Set local description (offer)
   ✅ Set remote description (answer)
   🧊 Sending ICE candidate
   🔌 Connection state: connected
   🎥 Received remote track: video
   ```

2. **If missing "Received remote track":**
   - Firewall is blocking media
   - NAT traversal failed
   - Need TURN server (not just STUN)

3. **Test on same network:**
   - Both devices on same WiFi
   - Should work without STUN/TURN
   - If fails, check browser compatibility

4. **Check ICE candidates:**
   Open console and run:
   ```javascript
   const pc = new RTCPeerConnection({
     iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
   })
   pc.onicecandidate = e => console.log('ICE:', e.candidate)
   pc.createOffer().then(o => pc.setLocalDescription(o))
   
   // Should see candidates within 3 seconds
   // If no candidates, network is blocking WebRTC
   ```

---

### **Issue 4: Video Freezes/Stutters**

**Symptoms:**
- Video connects but freezes
- Audio continues working
- Network seems fine

**Causes:**
1. Poor network bandwidth
2. CPU overload
3. Too many tracks (screen + camera simultaneously)

**Solutions:**

1. **Check network quality:**
   ```javascript
   // In browser console
   const pc = peerConnectionRef.current
   const stats = await pc.getStats()
   stats.forEach(stat => {
     if (stat.type === 'inbound-rtp' && stat.kind === 'video') {
       console.log('Bandwidth:', stat.bytesReceived, 'bytes')
       console.log('Packets lost:', stat.packetsLost)
       console.log('Frame rate:', stat.framesPerSecond)
     }
   })
   ```

2. **Reduce video quality:**
   Edit `src/hooks/useLocalMedia.ts`:
   ```typescript
   const stream = await navigator.mediaDevices.getUserMedia({
     video: {
       width: { ideal: 640 },  // Reduce from 1280
       height: { ideal: 480 }, // Reduce from 720
       frameRate: { ideal: 15 } // Reduce from 30
     },
     audio: true
   })
   ```

3. **Close other apps:**
   - Close Zoom, Teams, Discord
   - Close Chrome tabs
   - Check Task Manager for CPU usage

---

## 🧪 **Testing Checklist**

### **Before Testing:**
- [ ] Dev server running (`npm run dev`)
- [ ] Two different browsers OR incognito mode
- [ ] Camera/mic permissions granted
- [ ] Console open (F12) in both browsers

### **Test 1: Basic Connection**
- [ ] User 1 creates room
- [ ] User 2 joins same room
- [ ] Both see "Connected" green badge
- [ ] Console shows: `✅ Peer connection established!`

### **Test 2: Video Streams**
- [ ] User 1 sees own camera (not "Camera Off")
- [ ] User 2 sees User 1's camera (not "Waiting...")
- [ ] User 1 sees User 2's camera (not "Waiting...")
- [ ] Console shows: `🎥 Received remote track: video`

### **Test 3: Audio**
- [ ] User 1 speaks, User 2 hears
- [ ] User 2 speaks, User 1 hears
- [ ] Console shows: `🎥 Received remote track: audio`

### **Test 4: Screen Share**
- [ ] User 1 starts screen share
- [ ] User 1 sees "Live" on "Your Screen" box
- [ ] User 2 sees User 1's screen in "Remote User's Screen" box
- [ ] Console shows: `Is screen share? true`

### **Test 5: Chat**
- [ ] User 1 sends message: "Hello"
- [ ] User 1 sees "Hello" in their chat (right side)
- [ ] User 2 sees "Hello" in their chat (left side)
- [ ] User 2 replies: "Hi"
- [ ] No duplicate messages

---

## 📝 **Expected Console Output (Full Test)**

### **User 1 (Creator):**
```
🚀 Connecting to Ably...
✅ Connected to Ably: user_abc123_1234567
🚪 Joining room: room_xyz as Alice
🎥 Setting local video stream
  Video tracks: 1 ['Integrated Camera (enabled, live)']
  Audio tracks: 1 ['Microphone (enabled, live)']
👥 User joined: Bob ID: user_def456_7654321
🎯 I will initiate the offer (my ID is higher)
📤 Creating and sending offer...
✅ Set local description (offer)
📩 Received answer from: user_def456_7654321
✅ Set remote description (answer)
🧊 Sending ICE candidate
🔌 Connection state: connected
✅ Peer connection established!
🎥 Received remote track: video
🎥 Setting remote video stream
  Video tracks: 1 ['Integrated Camera (enabled, live)']
  Audio tracks: 1 ['Microphone (enabled, live)']
  Is screen share? false (label: integrated camera)
💬 New message: Hello
```

### **User 2 (Joiner):**
```
🚀 Connecting to Ably...
✅ Connected to Ably: user_def456_7654321
🚪 Joining room: room_xyz as Bob
🎥 Setting local video stream
  Video tracks: 1 ['Integrated Camera (enabled, live)']
  Audio tracks: 1 ['Microphone (enabled, live)']
👤 Existing user: Alice
👥 User joined: Alice ID: user_abc123_1234567
⏳ Waiting for other peer to initiate
📩 Received offer from: user_abc123_1234567
📝 Creating answer...
✅ Set remote description (offer)
✅ Set local description (answer)
📤 Sent answer to room
🧊 Sending ICE candidate
🔌 Connection state: connected
✅ Peer connection established!
🎥 Received remote track: video
🎥 Setting remote video stream
  Video tracks: 1 ['Integrated Camera (enabled, live)']
  Audio tracks: 1 ['Microphone (enabled, live)']
  Is screen share? false (label: integrated camera)
💬 New message: Hello
```

---

## 🚀 **Quick Fixes Summary**

| Issue | Quick Fix |
|-------|-----------|
| Duplicate messages | ✅ Fixed in code |
| Sender's message not showing | ✅ Fixed in code |
| Camera shows "Off" | Check if camera exists, close other apps |
| Screen share black | Select different window, check DRM content |
| Remote shows "Waiting" | Check WebRTC connection, firewall, STUN |
| Video freezes | Reduce quality, close other apps |
| No audio | Check browser permissions, unmute |

---

## 📞 **Need More Help?**

1. **Copy full console logs** from both users
2. **Take screenshot** of the video room
3. **Note which browser** and version you're using
4. **Describe exact steps** that cause the issue

**Pro Tip:** Test with **Phone + Computer** on same WiFi - phone cameras always work! 📱
