# 🐳 Docker Setup Guide

This guide shows how to run all services using Docker for easy setup.

## Quick Start with Docker Compose

### 1. Create docker-compose.yml

Create this file in the root of your project:

```yaml
version: '3.8'

services:
  # PostgreSQL Database
  postgres:
    image: postgres:15-alpine
    container_name: aicollab-postgres
    restart: unless-stopped
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: yourpassword
      POSTGRES_DB: aicollab
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Redis Cache
  redis:
    image: redis:7-alpine
    container_name: aicollab-redis
    restart: unless-stopped
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  # LiveKit Server
  livekit:
    image: livekit/livekit-server:latest
    container_name: aicollab-livekit
    restart: unless-stopped
    command: --dev --node-ip=127.0.0.1
    environment:
      LIVEKIT_KEYS: "devkey: secret"
    ports:
      - "7880:7880"
      - "7881:7881"
      - "7882:7882/udp"
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:7880/"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  postgres_data:
  redis_data:

networks:
  default:
    name: aicollab-network
```

### 2. Start All Services

```powershell
# Start all services
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f

# Stop all services
docker-compose down

# Stop and remove volumes (fresh start)
docker-compose down -v
```

### 3. Verify Services

```powershell
# Check PostgreSQL
docker exec -it aicollab-postgres psql -U postgres -d aicollab -c "SELECT version();"

# Check Redis
docker exec -it aicollab-redis redis-cli ping

# Check LiveKit
curl http://localhost:7880/
```

## Individual Service Setup

### PostgreSQL Only

```powershell
docker run -d \
  --name aicollab-postgres \
  -e POSTGRES_PASSWORD=yourpassword \
  -e POSTGRES_DB=aicollab \
  -p 5432:5432 \
  -v postgres_data:/var/lib/postgresql/data \
  postgres:15-alpine
```

### Redis Only

```powershell
docker run -d \
  --name aicollab-redis \
  -p 6379:6379 \
  -v redis_data:/data \
  redis:7-alpine
```

### LiveKit Only

```powershell
docker run -d \
  --name aicollab-livekit \
  -p 7880:7880 \
  -p 7881:7881 \
  -p 7882:7882/udp \
  -e LIVEKIT_KEYS="devkey: secret" \
  livekit/livekit-server \
  --dev --node-ip=127.0.0.1
```

## Environment Configuration

After starting Docker services, update your `.env` files:

### Backend (.env)
```env
DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/aicollab?schema=public"
REDIS_URL="redis://localhost:6379"
JWT_SECRET="your-super-secret-jwt-key"
LIVEKIT_API_KEY="devkey"
LIVEKIT_API_SECRET="secret"
LIVEKIT_URL="ws://localhost:7880"
PORT=4000
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_GRAPHQL_URL=http://localhost:4000/graphql
NEXT_PUBLIC_GRAPHQL_WS_URL=ws://localhost:4000/graphql
NEXT_PUBLIC_LIVEKIT_URL=ws://localhost:7880
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key
```

## Database Setup

After PostgreSQL is running:

```powershell
# Navigate to backend
cd backend

# Generate Prisma Client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# (Optional) Seed database
npm run prisma:seed

# (Optional) Open Prisma Studio
npm run prisma:studio
```

## Useful Docker Commands

### View Logs
```powershell
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f postgres
docker-compose logs -f redis
docker-compose logs -f livekit
```

### Restart Services
```powershell
# Restart all
docker-compose restart

# Restart specific service
docker-compose restart postgres
```

### Execute Commands in Containers
```powershell
# PostgreSQL
docker exec -it aicollab-postgres psql -U postgres -d aicollab

# Redis
docker exec -it aicollab-redis redis-cli
```

### Clean Up
```powershell
# Stop and remove containers
docker-compose down

# Remove volumes (WARNING: deletes data)
docker-compose down -v

# Remove images
docker-compose down --rmi all
```

## Production Deployment

For production, create `docker-compose.prod.yml`:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    restart: always
    environment:
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: ${POSTGRES_DB}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - aicollab-network

  redis:
    image: redis:7-alpine
    restart: always
    command: redis-server --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis_data:/data
    networks:
      - aicollab-network

  livekit:
    image: livekit/livekit-server:latest
    restart: always
    environment:
      LIVEKIT_KEYS: ${LIVEKIT_API_KEY}: ${LIVEKIT_API_SECRET}
    ports:
      - "7880:7880"
      - "7881:7881"
      - "7882:7882/udp"
    networks:
      - aicollab-network

  backend:
    build: ./backend
    restart: always
    depends_on:
      - postgres
      - redis
    environment:
      DATABASE_URL: ${DATABASE_URL}
      REDIS_URL: ${REDIS_URL}
      JWT_SECRET: ${JWT_SECRET}
    ports:
      - "4000:4000"
    networks:
      - aicollab-network

  frontend:
    build: ./frontend
    restart: always
    depends_on:
      - backend
    environment:
      NEXT_PUBLIC_GRAPHQL_URL: ${NEXT_PUBLIC_GRAPHQL_URL}
    ports:
      - "3000:3000"
    networks:
      - aicollab-network

volumes:
  postgres_data:
  redis_data:

networks:
  aicollab-network:
    driver: bridge
```

Deploy:
```powershell
docker-compose -f docker-compose.prod.yml up -d
```

## Troubleshooting

### Port Already in Use
```powershell
# Find process using port
netstat -ano | findstr :5432

# Kill process
taskkill /PID <PID> /F
```

### Container Won't Start
```powershell
# Check logs
docker logs aicollab-postgres

# Remove and recreate
docker-compose down
docker-compose up -d
```

### Database Connection Issues
```powershell
# Check if container is running
docker ps | findstr postgres

# Test connection
docker exec -it aicollab-postgres psql -U postgres -c "SELECT 1;"
```

### Reset Everything
```powershell
# Stop all containers
docker-compose down -v

# Remove all aicollab containers
docker rm -f $(docker ps -a -q --filter name=aicollab)

# Remove volumes
docker volume prune

# Start fresh
docker-compose up -d
```

## Health Checks

Monitor service health:

```powershell
# Check all containers
docker-compose ps

# Check specific service health
docker inspect --format='{{json .State.Health}}' aicollab-postgres
docker inspect --format='{{json .State.Health}}' aicollab-redis
docker inspect --format='{{json .State.Health}}' aicollab-livekit
```

## Backup & Restore

### Backup PostgreSQL
```powershell
docker exec aicollab-postgres pg_dump -U postgres aicollab > backup.sql
```

### Restore PostgreSQL
```powershell
docker exec -i aicollab-postgres psql -U postgres aicollab < backup.sql
```

---

**Now you have a fully containerized development environment! 🐳**
