# 🚀 QUICK START GUIDE - New Features

## 🎯 For Developers

### **Using the Advanced Call Hook**

```typescript
'use client'

import { useAdvancedCall } from '@/hooks/useAdvancedCall'
import ParticipantGrid from '@/components/call/ParticipantGrid'
import ControlsHost from '@/components/call/ControlsHost'

export default function GroupCallPage({ params }: { params: { roomId: string } }) {
  const {
    isInCall,
    participants,
    localParticipant,
    connectionQuality,
    callDuration,
    joinCall,
    leaveCall,
    toggleAudio,
    toggleVideo,
    toggleScreenShare,
    promoteToSpeaker,
    demoteToViewer,
  } = useAdvancedCall('mesh') // or 'broadcast' for large groups

  const handleJoin = async () => {
    await joinCall(params.roomId, 'YourUsername', 'host', true)
  }

  return (
    <div className="call-page">
      {!isInCall ? (
        <button onClick={handleJoin}>Join Call</button>
      ) : (
        <>
          <ParticipantGrid 
            participants={participants}
            localParticipant={localParticipant}
          />
          
          <ControlsHost
            participants={participants}
            onPromote={promoteToSpeaker}
            onDemote={demoteToViewer}
            onMute={(userId) => {/* Send mute command */}}
            onKick={(userId) => {/* Kick user */}}
            onEndCall={leaveCall}
          />
        </>
      )}
    </div>
  )
}
```

---

### **Adding Premium Features**

```typescript
import PremiumModal from '@/components/monetization/PremiumModal'
import { AdBanner, AdFloating } from '@/components/monetization/AdBanner'

export default function Page() {
  const [showPremium, setShowPremium] = useState(false)
  const user = { isPremium: false } // Get from your auth

  return (
    <>
      {/* Show ads only for non-premium users */}
      <AdBanner slot="1234567890" isPremium={user.isPremium} />
      <AdFloating isPremium={user.isPremium} />

      {/* Premium upgrade button */}
      <button onClick={() => setShowPremium(true)}>
        Upgrade to Premium
      </button>

      <PremiumModal
        isOpen={showPremium}
        onClose={() => setShowPremium(false)}
        onSubscribe={async (planId) => {
          // Handle Stripe payment
          const res = await fetch('/api/stripe/checkout', {
            method: 'POST',
            body: JSON.stringify({ planId }),
          })
          const { url } = await res.json()
          window.location.href = url
        }}
      />
    </>
  )
}
```

---

### **Using Coin Wallet**

```typescript
import CoinWallet, { BuyCoinsModal } from '@/components/monetization/CoinWallet'

export default function WalletPage() {
  const [balance, setBalance] = useState(100)
  const [showBuyCoins, setShowBuyCoins] = useState(false)

  return (
    <>
      <CoinWallet
        balance={balance}
        onBuyCoins={() => setShowBuyCoins(true)}
        onSendGift={(gift) => {
          // Send gift via signaling
          setBalance(prev => prev - gift.cost)
        }}
      />

      <BuyCoinsModal
        isOpen={showBuyCoins}
        onClose={() => setShowBuyCoins(false)}
        onPurchase={async (coins, price) => {
          // Process payment
          const res = await fetch('/api/stripe/buy-coins', {
            method: 'POST',
            body: JSON.stringify({ coins, price }),
          })
          // Update balance after successful payment
        }}
      />
    </>
  )
}
```

---

### **Adding Debug Panel**

```typescript
import DebugPanel from '@/components/debug/DebugPanel'

// Add anywhere in your app (bottom-right corner)
export default function App() {
  return (
    <>
      {/* Your app */}
      
      {/* Debug panel (only in development) */}
      {process.env.NODE_ENV === 'development' && <DebugPanel />}
    </>
  )
}
```

---

### **Using Connection Quality Monitor**

```typescript
import { useConnectionQuality, ConnectionQualityIndicator } from '@/hooks/useConnectionQuality'

export default function CallPage() {
  const { quality, startMonitoring, stopMonitoring } = useConnectionQuality()

  useEffect(() => {
    if (peerConnection) {
      startMonitoring(peerConnection)
    }

    return () => stopMonitoring()
  }, [peerConnection])

  return (
    <div>
      {/* Show quality indicator */}
      <ConnectionQualityIndicator quality={quality} />

      {/* Show detailed stats */}
      <div>
        <p>Latency: {quality.latency}ms</p>
        <p>Packet Loss: {quality.packetLoss}%</p>
        <p>Quality: {quality.level}</p>
      </div>
    </div>
  )
}
```

---

### **Mobile Optimizations**

```typescript
import { mobileOptimizations } from '@/lib/mobile/optimizations'

export default function VideoComponent() {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (!videoRef.current) return

    // Configure video for mobile
    if (mobileOptimizations.isMobile()) {
      mobileOptimizations.configureMobileVideo(videoRef.current)
    }

    // Force play with retry
    videoRef.current.srcObject = stream
    mobileOptimizations.forceVideoPlay(videoRef.current)

    // Apply mobile fixes globally
    mobileOptimizations.applyMobileVideoFixes()

    // Keep screen awake during call
    const wakeLock = new mobileOptimizations.WakeLock()
    wakeLock.request()

    return () => {
      wakeLock.release()
    }
  }, [stream])

  return <video ref={videoRef} />
}
```

---

## 📋 API Endpoints to Implement

### **Admin Endpoints**

```typescript
// app/api/admin/users/route.ts
export async function GET() {
  // Return all users with stats
  return Response.json({
    users: [...],
    stats: { total, premium, admins, banned }
  })
}

// app/api/admin/user/[id]/role/route.ts
export async function PUT(req, { params }) {
  const { role } = await req.json()
  // Update user role in database
  return Response.json({ success: true })
}

// app/api/admin/user/[id]/ban/route.ts
export async function PUT(req, { params }) {
  const { banned } = await req.json()
  // Ban/unban user in database
  return Response.json({ success: true })
}
```

---

### **Monetization Endpoints**

```typescript
// app/api/stripe/checkout/route.ts
import Stripe from 'stripe'

export async function POST(req: Request) {
  const { planId } = await req.json()
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    line_items: [{
      price: planId === 'monthly' ? 'price_monthly' : 'price_yearly',
      quantity: 1,
    }],
    success_url: `${process.env.NEXT_PUBLIC_URL}/success`,
    cancel_url: `${process.env.NEXT_PUBLIC_URL}/cancel`,
  })

  return Response.json({ url: session.url })
}

// app/api/stripe/buy-coins/route.ts
export async function POST(req: Request) {
  const { coins, price } = await req.json()
  
  // Create Stripe payment intent
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(price * 100),
    currency: 'usd',
    metadata: { coins },
  })

  return Response.json({ clientSecret: paymentIntent.client_secret })
}

// app/api/stripe/webhook/route.ts
export async function POST(req: Request) {
  const sig = req.headers.get('stripe-signature')!
  const event = stripe.webhooks.constructEvent(body, sig, webhookSecret)

  if (event.type === 'checkout.session.completed') {
    // Grant premium access
  }

  if (event.type === 'payment_intent.succeeded') {
    // Add coins to user balance
  }

  return Response.json({ received: true })
}
```

---

## 🎨 Styling Reference

### **Tailwind Classes Used**

```css
/* Gradients */
bg-gradient-to-r from-purple-600 to-blue-600
bg-gradient-to-br from-purple-900 to-blue-900

/* Cards */
bg-gray-900 border border-gray-800 rounded-lg

/* Buttons */
bg-blue-600 hover:bg-blue-700 text-white rounded

/* Premium badge */
bg-yellow-500 text-black px-2 py-0.5 rounded text-xs

/* Grid layouts */
grid grid-cols-3 gap-4
```

---

## 🔑 Feature Flags

Control features via environment variables:

```bash
NEXT_PUBLIC_ENABLE_ADS=true
NEXT_PUBLIC_ENABLE_PREMIUM=true
NEXT_PUBLIC_ENABLE_COINS=true
NEXT_PUBLIC_ENABLE_DEBUG=false  # Only in dev
NEXT_PUBLIC_MAX_PARTICIPANTS=50
```

Usage:

```typescript
const showAds = process.env.NEXT_PUBLIC_ENABLE_ADS === 'true'
const maxParticipants = parseInt(process.env.NEXT_PUBLIC_MAX_PARTICIPANTS || '50')
```

---

## 📱 Mobile Testing Checklist

- [ ] Test on iPhone Safari
- [ ] Test on Android Chrome
- [ ] Test portrait/landscape orientation
- [ ] Test network switch (WiFi ↔ Cellular)
- [ ] Test low battery mode
- [ ] Test background/foreground transitions
- [ ] Test screen lock during call
- [ ] Test multiple tabs open

---

## 🐛 Troubleshooting

### **Video not showing on mobile:**
```typescript
// Ensure video element is properly configured
mobileOptimizations.configureMobileVideo(videoElement)
await mobileOptimizations.forceVideoPlay(videoElement)
```

### **Autoplay blocked:**
```typescript
// Use muted autoplay or user gesture
videoElement.muted = true
await videoElement.play()
```

### **Connection quality poor:**
```typescript
// Check network type and adjust constraints
const constraints = mobileOptimizations.getAdaptiveConstraints()
const stream = await navigator.mediaDevices.getUserMedia(constraints)
```

### **Screen staying awake:**
```typescript
const wakeLock = new mobileOptimizations.WakeLock()
await wakeLock.request()
```

---

## 🚀 Deployment Checklist

- [ ] Set all environment variables in Vercel
- [ ] Test Ably token endpoint works
- [ ] Configure Stripe webhooks
- [ ] Set up Google AdSense
- [ ] Test payment flow end-to-end
- [ ] Enable production error tracking
- [ ] Set up analytics
- [ ] Test on production domain

---

## 📊 Monitoring

### **What to Monitor:**

1. **Connection Success Rate:** Should be >95%
2. **ICE Failure Rate:** Should be <5%
3. **Average Connection Time:** Should be <3 seconds
4. **Packet Loss:** Should be <2%
5. **User Complaints:** Track support tickets

### **Debug Panel Usage:**

```typescript
// Enable debug mode
ablySignaling.enableDebug(true)

// Access debug page
window.location.href = '/debug'

// Export logs
// Click "Export" button in debug panel
```

---

**Need Help?** Check REFACTOR_REPORT.md for full technical details.
