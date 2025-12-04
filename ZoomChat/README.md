# 💕 HeartShare - 1-on-1 Video Chat Application

A beautiful, real-time video chat application with screen sharing, system audio capture, and instant messaging. Built with Next.js, WebRTC, and Socket.IO.

## ✨ Features

- 📹 **High-Quality Video Calls**: Crystal-clear 1-on-1 video communication
- 🖥️ **Screen Sharing**: Share your entire screen, specific window, or browser tab
- 🔊 **System Audio**: Capture and share system audio when screen sharing (browser-dependent)
- 💬 **Real-time Chat**: Instant messaging with typing indicators and read receipts
- 📱 **Picture-in-Picture**: Keep your camera visible while screen sharing
- 🎨 **Beautiful UI**: Warm pink-to-sky-blue gradient theme with smooth animations
- 🔄 **WebRTC P2P**: Direct peer-to-peer connections with STUN/TURN support
- 🎛️ **Full Controls**: Mute/unmute, camera on/off, screen share toggle, end call
- 📡 **Connection Monitoring**: Real-time connection status indicators
- 🌐 **Responsive Design**: Desktop-first, responsive to mobile widths

## 🎨 Design

The application features a unique warm aesthetic with:
- **Gradient Colors**: Light pink (#ffd6e0) → Sky blue (#cfe9ff)
- **Glass Morphism**: Translucent cards with backdrop blur
- **Smooth Animations**: Framer Motion for delightful micro-interactions
- **Clean Typography**: Inter font for modern, readable text

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **WebRTC**: Native RTCPeerConnection API
- **Signaling**: Socket.IO (Next.js API Routes)
- **State Management**: React Hooks + Zustand-ready architecture

## 📋 Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- Modern browser with WebRTC support (Chrome, Firefox, Safari, Edge)
- HTTPS for production (required for getUserMedia and getDisplayMedia)
- Optional: TURN server for NAT traversal (coturn recommended)

## 🚀 Quick Start

### 1. Installation

```bash
# Navigate to the project directory
cd ZoomChat

# Install dependencies
npm install
# or
yarn install
# or
pnpm install
```

### 2. Environment Setup

The `.env.local` file is already configured with defaults:

```env
NEXT_PUBLIC_APP_NAME="HeartShare"
NEXT_PUBLIC_API_BASE="/api"
NEXT_PUBLIC_STUN="stun:stun.l.google.com:19302"
TURN_URL=turn:your-turn-server:3478
TURN_USER=turnuser
TURN_PASS=turnpass
PORT=3000
```

**For Production**: Configure your own TURN server (see TURN Server Setup below).

### 3. Run Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Test the Application

1. **Open two browser windows** (or use an incognito window)
2. In the first window:
   - Enter your name
   - Click "Generate" to create a room ID
   - Click "Start Call"
3. In the second window:
   - Enter a different name
   - **Paste the same room ID** from the first window
   - Click "Start Call"
4. **Grant camera/microphone permissions** when prompted
5. You should now see both video feeds!

## 🎯 Usage Guide

### Basic Call Controls

- **🎤 Microphone**: Toggle mute/unmute
- **📹 Camera**: Toggle video on/off
- **🖥️ Screen Share**: Start/stop screen sharing
- **🔊 System Audio**: Toggle system audio capture (before screen sharing)
- **📞 End Call**: Disconnect and return to login

### Screen Sharing with System Audio

1. **Before starting screen share**: Toggle "System Audio ON"
2. Click the **Screen Share** button
3. In the browser dialog:
   - **Chrome**: Select "Chrome Tab" or "Entire Screen", then check "Share audio"
   - **Firefox**: Limited system audio support
   - **Safari**: Tab audio supported on macOS
4. Your camera will appear as a small picture-in-picture overlay

**Browser Compatibility Notes**:
- ✅ **Chrome/Edge**: Best support for tab audio and screen audio
- ⚠️ **Firefox**: Limited system audio capture
- ⚠️ **Safari**: macOS tab audio only

### Chat Features

- **Type a message** in the chat input
- **Send** with Enter key or Send button
- **Typing indicator** shows when the other person is typing
- **Read receipts** appear when messages are viewed

## 🔧 TURN Server Setup (Optional but Recommended)

For production or restrictive NAT environments, set up a TURN server:

### Using Coturn (Recommended)

1. **Install Coturn**:
   ```bash
   # Ubuntu/Debian
   sudo apt-get update
   sudo apt-get install coturn

   # macOS
   brew install coturn
   ```

2. **Configure Coturn** (`/etc/turnserver.conf`):
   ```
   listening-port=3478
   external-ip=YOUR_PUBLIC_IP
   realm=heartshare
   user=turnuser:turnpass
   lt-cred-mech
   ```

3. **Start Coturn**:
   ```bash
   sudo turnserver -c /etc/turnserver.conf
   ```

4. **Update `.env.local`**:
   ```env
   TURN_URL=turn:YOUR_PUBLIC_IP:3478
   TURN_USER=turnuser
   TURN_PASS=turnpass
   ```

### Using a Hosted TURN Service

Alternatives to self-hosting:
- **Twilio STUN/TURN**: [https://www.twilio.com/stun-turn](https://www.twilio.com/stun-turn)
- **Xirsys**: [https://xirsys.com/](https://xirsys.com/)
- **Metered**: [https://www.metered.ca/](https://www.metered.ca/)

## 🏗️ Project Structure

```
ZoomChat/
├── app/
│   ├── globals.css              # Global styles and Tailwind imports
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Home/redirect page
│   ├── login/
│   │   └── page.tsx            # Login/room join page
│   └── chat/
│       └── page.tsx            # Main call interface
├── src/
│   ├── components/
│   │   ├── VideoPanel.tsx      # Video display (local, remote, PIP)
│   │   ├── ChatWindow.tsx      # Chat messages and input
│   │   └── CallControls.tsx    # Call control buttons
│   ├── hooks/
│   │   ├── useLocalMedia.ts    # Media devices management
│   │   └── useCallState.ts     # WebRTC call state
│   ├── lib/
│   │   ├── webrtc.ts          # WebRTC helper functions
│   │   └── signaling.ts       # Socket.IO client wrapper
│   └── types/
│       └── socket.ts          # TypeScript types
├── pages/
│   └── api/
│       └── socket.ts          # Socket.IO signaling server
├── .env.local                 # Environment variables
├── package.json
├── tailwind.config.js         # Tailwind configuration
├── tsconfig.json
└── README.md
```

## 🔬 Testing Checklist

### Basic Functionality
- [ ] Two users can join the same room
- [ ] Video streams appear within 5 seconds
- [ ] Audio is clear without echo
- [ ] Camera can be toggled on/off
- [ ] Microphone can be muted/unmuted

### Screen Sharing
- [ ] Screen share starts successfully
- [ ] Remote user sees shared screen
- [ ] Camera remains visible in PIP
- [ ] System audio is captured (when enabled)
- [ ] Screen share stops cleanly

### Chat
- [ ] Messages send and receive in real-time
- [ ] Typing indicator appears
- [ ] Read receipts update
- [ ] Message timestamps are accurate

### Connection
- [ ] Reconnection works after disconnect
- [ ] TURN relay works behind NAT
- [ ] Multiple tab/window handling

### UI/UX
- [ ] Gradient theme displays correctly
- [ ] Animations are smooth
- [ ] Responsive on different screen sizes
- [ ] Error messages are clear

## 🐛 Troubleshooting

### Camera/Microphone Not Working
- Ensure **HTTPS** in production (required by browsers)
- Check browser permissions: Settings → Privacy → Camera/Microphone
- Try a different browser
- Restart browser after granting permissions

### Screen Share No System Audio
- **Chrome**: Select "Chrome Tab" (not Entire Screen) and check "Share audio"
- **Firefox**: System audio not widely supported
- **Workaround**: Play media in a browser tab and share that tab with audio

### Connection Fails (No Video)
- Check if both users are behind strict NAT/firewall
- Configure a TURN server (see TURN Server Setup)
- Verify TURN credentials in `.env.local`
- Check browser console for WebRTC errors

### Socket.IO Connection Issues
- Ensure server is running on correct port
- Check for CORS errors in console
- Verify `/api/socket` route is accessible

## 🚀 Production Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

**Important**: Socket.IO requires a persistent WebSocket connection. For Vercel:
- Use **Vercel Serverless Functions** for HTTP
- Consider **external Socket.IO server** (Railway, Render, Fly.io) for production scale

### Railway / Render

1. Connect your GitHub repository
2. Set environment variables
3. Deploy with build command: `npm run build`
4. Start command: `npm start`

### Environment Variables for Production

```env
NEXT_PUBLIC_APP_NAME="HeartShare"
NEXT_PUBLIC_API_BASE="/api"
NEXT_PUBLIC_STUN="stun:stun.l.google.com:19302"
TURN_URL=turn:your-production-turn.com:3478
TURN_USER=your-turn-username
TURN_PASS=your-secure-turn-password
PORT=3000
NODE_ENV=production
```

## 📈 Scaling to Multi-Party

To scale beyond 1-on-1:

### Option 1: Mesh (2-4 participants)
- Each peer connects to every other peer
- Simple but doesn't scale well

### Option 2: SFU (Selective Forwarding Unit)
- **mediasoup**: [https://mediasoup.org/](https://mediasoup.org/)
- **Janus**: [https://janus.conf.meetecho.com/](https://janus.conf.meetecho.com/)
- Forwards streams from one peer to others
- Scales to 10-50 participants

### Option 3: MCU (Multipoint Control Unit)
- Mixes all streams on server
- Best quality for large calls (50+)
- Higher server costs

**TODO markers** in code indicate where SFU integration would go.

## 🔐 Security Considerations

- ✅ Use HTTPS in production (required for WebRTC)
- ✅ Validate and sanitize room IDs
- ✅ Rate-limit Socket.IO events
- ⚠️ Implement proper authentication (NextAuth, Clerk) for production
- ⚠️ Store messages in database with encryption
- ⚠️ Add room access controls (passwords, invites)

## 🤝 Contributing

Contributions welcome! Areas for improvement:
- [ ] Recording functionality
- [ ] Blur background (TensorFlow.js)
- [ ] Noise suppression
- [ ] Virtual backgrounds
- [ ] Screen annotation tools
- [ ] File sharing
- [ ] Emoji reactions

## 📄 License

MIT License - feel free to use for personal or commercial projects.

## 🙏 Acknowledgments

- **Next.js** team for the amazing framework
- **WebRTC** community for excellent documentation
- **Tailwind CSS** for utility-first styling
- **Framer Motion** for smooth animations

## 📞 Support

For issues or questions:
1. Check the Troubleshooting section
2. Review browser console for errors
3. Test with a different browser
4. Ensure TURN server is configured correctly

---

**Built with ❤️ using Next.js, TypeScript, and WebRTC**

Enjoy your video calls! 📹✨
