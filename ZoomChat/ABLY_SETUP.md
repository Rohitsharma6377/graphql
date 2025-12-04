# Quick Setup for Vercel Deployment

## Step 1: Get Ably API Key

1. Go to https://ably.com/signup
2. Create free account (6M messages/month free)
3. Create new app
4. Copy API key from dashboard

## Step 2: Add API Key

Create `.env.local` file:
```bash
NEXT_PUBLIC_ABLY_KEY=paste-your-key-here
```

## Step 3: Switch to Ably Version

Update your room page to use Ably hooks:

**File: `app/room/[roomId]/page.tsx`**

Change:
```typescript
import { useCallState } from '@/hooks/useCallState'
```

To:
```typescript
import { useCallState } from '@/hooks/useCallState-ably'
```

## Step 4: Deploy to Vercel

```bash
git add .
git commit -m "Switch to Ably for Vercel deployment"
git push
```

Then deploy on Vercel:
1. Add `NEXT_PUBLIC_ABLY_KEY` to Vercel environment variables
2. Redeploy

## Why Ably?

✅ **Works on Vercel** (serverless)
✅ **Free tier** (6M messages/month)
✅ **Global edge network** (low latency)
✅ **Reliable** (99.999% uptime SLA)
✅ **No server to manage**

## Alternative: Keep Socket.IO for Local Only

If you want Socket.IO for local dev and Ably for production:

```typescript
// app/room/[roomId]/page.tsx
import { useCallState as useSocketIOCall } from '@/hooks/useCallState'
import { useCallState as useAblyCall } from '@/hooks/useCallState-ably'

// Use Ably on production, Socket.IO locally
const useCallState = process.env.NODE_ENV === 'production' 
  ? useAblyCall 
  : useSocketIOCall
```
