# 🚀 Quick Start Guide

## Prerequisites Installation

### 1. Install Node.js
Download and install Node.js 18+ from: https://nodejs.org/

Verify installation:
```powershell
node --version
npm --version
```

### 2. Install PostgreSQL
**Option A: Docker (Recommended)**
```powershell
docker run --name postgres-aicollab -e POSTGRES_PASSWORD=yourpassword -e POSTGRES_DB=aicollab -p 5432:5432 -d postgres:15
```

**Option B: Local Installation**
Download from: https://www.postgresql.org/download/windows/

Create database:
```sql
CREATE DATABASE aicollab;
```

### 3. Install Redis
**Option A: Docker (Recommended)**
```powershell
docker run --name redis-aicollab -p 6379:6379 -d redis:alpine
```

**Option B: Use Upstash (Free Tier)**
Sign up at: https://upstash.com/
Create a Redis database and use the provided URL

### 4. Install LiveKit (Docker)
```powershell
docker run --name livekit -p 7880:7880 -p 7881:7881 -p 7882:7882/udp -e LIVEKIT_KEYS="devkey: secret" livekit/livekit-server --dev --node-ip=127.0.0.1
```

## Project Setup

### Step 1: Install Frontend Dependencies
```powershell
cd frontend
npm install
```

If you encounter errors, try:
```powershell
npm install --legacy-peer-deps
```

### Step 2: Install Backend Dependencies
```powershell
cd ..\backend
npm install
```

### Step 3: Configure Environment Variables

**Frontend (.env.local):**
```env
NEXT_PUBLIC_GRAPHQL_URL=http://localhost:4000/graphql
NEXT_PUBLIC_GRAPHQL_WS_URL=ws://localhost:4000/graphql
NEXT_PUBLIC_LIVEKIT_URL=ws://localhost:7880
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=generate-a-random-secret-here
```

**Backend (.env):**
```env
DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/aicollab?schema=public"
REDIS_URL="redis://localhost:6379"
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
LIVEKIT_API_KEY="devkey"
LIVEKIT_API_SECRET="secret"
LIVEKIT_URL="ws://localhost:7880"
PORT=4000
```

### Step 4: Setup Database
```powershell
cd backend
npm run prisma:generate
npm run prisma:migrate
```

If migration fails, try:
```powershell
npx prisma migrate dev --name init
npx prisma generate
```

### Step 5: Start Development Servers

**Terminal 1 - Backend:**
```powershell
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```powershell
cd frontend
npm run dev
```

### Step 6: Open Application
Visit: http://localhost:3000

## Verify Everything Works

1. **Backend Health Check:**
   Visit: http://localhost:4000/health
   Should return: `{"status":"ok","message":"AI Video Collab Backend is running!"}`

2. **GraphQL Playground:**
   Visit: http://localhost:4000/graphql
   Try this query:
   ```graphql
   query {
     rooms {
       id
       name
     }
   }
   ```

3. **Frontend:**
   Visit: http://localhost:3000
   You should see the beautiful landing page

## Common Issues & Solutions

### Issue: "Cannot find module '@prisma/client'"
**Solution:**
```powershell
cd backend
npm run prisma:generate
```

### Issue: "Port 3000 already in use"
**Solution:**
Kill the process or change port:
```powershell
# Kill process on port 3000
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Or change port in package.json
"dev": "next dev -p 3001"
```

### Issue: "Database connection failed"
**Solution:**
1. Check if PostgreSQL is running
2. Verify DATABASE_URL in .env
3. Try connecting manually:
```powershell
psql -U postgres -h localhost -p 5432 -d aicollab
```

### Issue: "Redis connection failed"
**Solution:**
1. Check if Redis is running:
```powershell
docker ps
```
2. Restart Redis:
```powershell
docker restart redis-aicollab
```

### Issue: "GraphQL subscriptions not working"
**Solution:**
1. Check WebSocket URL is correct (ws:// not http://)
2. Ensure backend is running
3. Check browser console for errors

### Issue: "LiveKit not connecting"
**Solution:**
1. Verify Docker container is running:
```powershell
docker ps | findstr livekit
```
2. Check logs:
```powershell
docker logs livekit
```
3. Restart container:
```powershell
docker restart livekit
```

## Development Tips

### Hot Reload Issues
If changes aren't reflecting:
```powershell
# Frontend
rm -rf .next
npm run dev

# Backend
# Just restart the server (Ctrl+C then npm run dev)
```

### Database Reset
To start fresh:
```powershell
cd backend
npx prisma migrate reset
npm run prisma:migrate
```

### View Database
Use Prisma Studio:
```powershell
cd backend
npm run prisma:studio
```
Opens at: http://localhost:5555

### Check Logs
**Frontend:** Check browser console (F12)
**Backend:** Check terminal output

## Production Build

### Frontend
```powershell
cd frontend
npm run build
npm run start
```

### Backend
```powershell
cd backend
npm run start
```

## Docker Compose (Alternative Setup)

Create `docker-compose.yml` in root:
```yaml
version: '3.8'
services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_PASSWORD: yourpassword
      POSTGRES_DB: aicollab
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:alpine
    ports:
      - "6379:6379"

  livekit:
    image: livekit/livekit-server
    command: --dev --node-ip=127.0.0.1
    environment:
      LIVEKIT_KEYS: "devkey: secret"
    ports:
      - "7880:7880"
      - "7881:7881"
      - "7882:7882/udp"

volumes:
  postgres_data:
```

Start all services:
```powershell
docker-compose up -d
```

## Testing the Features

### 1. Create a Meeting
1. Go to Dashboard
2. Click "New Meeting"
3. Enter meeting name
4. Click "Create Meeting"

### 2. Test Video Call
1. Open meeting in two browser tabs
2. Check if participants appear
3. Test mute/unmute
4. Test video on/off

### 3. Test Chat
1. Open chat panel
2. Send messages
3. Check real-time updates

### 4. Test Whiteboard
1. Click whiteboard icon
2. Draw something
3. Change colors and tools
4. Test in multiple tabs

### 5. Test Document Editor
1. Click document icon
2. Start typing
3. Check real-time sync

## Need Help?

Check the main README.md for detailed documentation.

Happy Coding! 🎉
