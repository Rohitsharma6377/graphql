# Emoji Feature Testing Guide

## Quick Test Steps

1. **Start the development server:**
   ```bash
   cd C:\Users\ASUS\Desktop\graphql\ZoomChat
   npm run dev
   ```

2. **Open TWO browser windows:**
   - Window 1: `http://localhost:3000`
   - Window 2: `http://localhost:3000`

3. **Join the same room in both windows:**
   - Enter username in Window 1 (e.g., "Alice")
   - Enter username in Window 2 (e.g., "Bob")
   - Use the SAME room ID in both (e.g., "test123")

4. **Test emoji sending:**
   - In Window 1, click the 😊 button in the chat area
   - Select any emoji (e.g., ❤️)
   - **You should see:**
     - Emoji falls in Window 1 (your screen)
     - Emoji falls in Window 2 (partner's screen)
     - Notification appears in Window 2 saying "Alice sent a reaction"

## Debug Checklist

Open browser console (F12) and check for these logs:

### When you click an emoji:
```
👆 Emoji clicked: ❤️
📤 Sending emoji: ❤️ to room: test123
```

### When emoji is received:
```
🎉 Received emoji: ❤️ from Alice id: socket-id-timestamp
✨ Triggering falling animation for: ❤️
🎨 FallingEmojis received: [{id: "...", emoji: "❤️", timestamp: ...}]
```

### After 4 seconds:
```
⏰ Clearing emojis after animation
```

## Troubleshooting

### Issue: Emoji button not visible
- **Solution:** Scroll down in the chat panel to see the input area at the bottom

### Issue: Emojis not falling
- **Check:** Browser console for errors
- **Verify:** Both users are in the SAME room ID
- **Ensure:** Socket.IO server is running (check terminal for "Emoji in [room] from [user]")

### Issue: Only seeing emojis on one screen
- **Check:** Network tab to verify Socket.IO connection (should show websocket)
- **Refresh:** Both browser windows

### Issue: No animation visible
- **Check:** Z-index - emojis render at z-50, make sure nothing is blocking them
- **Try:** Different emoji categories

## Expected Behavior

✅ **Correct:** Large emoji (6xl size) falls from top to bottom with rotation
✅ **Correct:** Animation lasts exactly 4 seconds
✅ **Correct:** Both screens show the same emoji simultaneously
✅ **Correct:** Notification appears on partner's screen (not yours)
✅ **Correct:** Multiple emojis can be sent rapidly

## Server Log Check

In your terminal running `npm run dev`, you should see:
```
Emoji in test123 from Alice: ❤️
```

This confirms the server received and broadcast the emoji.
