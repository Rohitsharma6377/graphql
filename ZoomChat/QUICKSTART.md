# Quick Start Guide

## Setup in 3 Steps

### 1️⃣ Install Dependencies
```bash
npm install
```

### 2️⃣ Start Development Server
```bash
npm run dev
```

### 3️⃣ Open Two Browser Windows
- Window 1: http://localhost:3000
- Window 2: http://localhost:3000 (or incognito)

## First Call Test

1. **Window 1**:
   - Name: "Alice"
   - Click "Generate" → Copy the room ID
   - Click "Start Call"
   - Allow camera/mic when prompted

2. **Window 2**:
   - Name: "Bob"
   - Paste the room ID from Window 1
   - Click "Start Call"
   - Allow camera/mic when prompted

3. **You should see each other! 🎉**

## Key Features to Test

### Screen Sharing with Audio
1. Toggle "System Audio ON" before sharing
2. Click screen share button
3. Select "Chrome Tab" and check "Share audio"
4. Play a YouTube video in that tab
5. Other person should hear the audio!

### Chat
- Type messages in the chat panel
- See typing indicators
- Messages appear instantly

### Controls
- 🎤 Mute/unmute microphone
- 📹 Turn camera on/off
- 🖥️ Start/stop screen sharing
- 📞 End call

## Troubleshooting

**No video?**
- Check browser permissions
- Try Chrome/Edge (best WebRTC support)
- Ensure HTTPS for production

**Connection fails?**
- Both users behind strict NAT?
- Set up TURN server (see README)

**No system audio?**
- Use Chrome browser
- Share a Chrome Tab (not entire screen)
- Check "Share audio" in dialog

## Next Steps

- Read the full [README.md](README.md)
- Configure TURN server for production
- Deploy to Vercel or Railway

---

**Need help?** Check the Troubleshooting section in README.md
