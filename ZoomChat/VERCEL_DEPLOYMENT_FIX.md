# Vercel Deployment Fix - WebRTC Signaling

## ❌ Problem
Socket.IO doesn't work on Vercel because:
- Vercel is serverless (no persistent WebSocket server)
- `/pages/api/socket.ts` only works on localhost with `next dev`
- Production needs different signaling approach

## ✅ Solution Options

### Option 1: Use Ably (Free Tier - RECOMMENDED)
```bash
npm install ably
```

Create `/src/lib/ably-signaling.ts`:
```typescript
import Ably from 'ably'

const client = new Ably.Realtime(process.env.NEXT_PUBLIC_ABLY_KEY!)

export const joinRoom = (roomId: string) => {
  const channel = client.channels.get(`room:${roomId}`)
  return channel
}

// Send offer
export const sendOffer = (channel: any, offer: RTCSessionDescriptionInit) => {
  channel.publish('offer', offer)
}

// Listen for offer
export const onOffer = (channel: any, callback: (offer: RTCSessionDescriptionInit) => void) => {
  channel.subscribe('offer', (message: any) => {
    callback(message.data)
  })
}
```

### Option 2: Deploy Separate Socket.IO Server
Deploy your Socket.IO server to:
- **Railway.app** (free tier available)
- **Render.com** (free tier available)
- **Heroku** (paid only now)

Then update `signaling.ts`:
```typescript
this.socket = io('https://your-socketio-server.railway.app', {
  path: '/socket.io',
})
```

### Option 3: Use Peer-to-Peer Signaling (PeerJS)
```bash
npm install peerjs
```

No server needed! Uses PeerServer cloud:
```typescript
import Peer from 'peerjs'

const peer = new Peer() // Auto-connects to PeerServer cloud

peer.on('open', (id) => {
  console.log('My peer ID:', id)
})

// Connect to another peer
const conn = peer.connect('other-peer-id')
```

## 🚀 Quick Fix (Use Ably)

1. Sign up at https://ably.com (free 6M messages/month)
2. Get API key
3. Add to `.env.local`:
   ```
   NEXT_PUBLIC_ABLY_KEY=your-key-here
   ```
4. Replace Socket.IO with Ably in your code

## Current Code Status
- ✅ WebRTC logic is correct
- ✅ UI works perfectly
- ❌ Signaling server (Socket.IO) won't work on Vercel
- ⚠️ Need to switch signaling method for production

## Test on Vercel
After deploying, check browser console for:
- ❌ "WebSocket connection failed"
- ❌ "Socket.IO transport error"
- ❌ "Failed to connect to /api/socket"

These confirm Socket.IO doesn't work on Vercel serverless.
