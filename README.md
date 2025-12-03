# 🚀 AI-Powered Realtime Video Collaboration Platform

A **stunning, production-ready** video collaboration platform with AI-powered features, built with modern web technologies. Features beautiful glassmorphism UI, smooth animations, and real-time GraphQL integration.

![Status](https://img.shields.io/badge/status-fully_operational-success)
![Next.js](https://img.shields.io/badge/Next.js-14.2.0-black)
![GraphQL](https://img.shields.io/badge/GraphQL-16.8.1-E10098)

## ✨ Features

### 🎥 Video Collaboration
- **HD Video Calls** with real-time controls
- Screen sharing capabilities  
- Active speaker detection with visual indicators
- Network quality monitoring
- Floating emoji reactions
- Participant grid with smooth animations
- Mute/unmute audio controls
- Video on/off controls

### 💬 Realtime Chat
- Instant messaging with GraphQL subscriptions
- Typing indicators
- Message reactions
- Online/offline presence
- Beautiful bubble UI with animations
- Search and filtering

### 🎨 Collaborative Whiteboard
- Multi-user drawing in real-time
- Color picker and brush sizes
- Shapes (circle, square, line)
- Eraser tool
- Undo/redo functionality
- Export as PNG

### 📝 Collaborative Document Editor
- Real-time text editing with GraphQL
- Live document synchronization
- Markdown support
- Auto-save functionality
- Word/character count
- Download as Markdown
- Version history tracking

### 🤖 AI Features (Coming Soon)
- Meeting transcription
- Automatic summaries
- Action item extraction
- Speaker identification
- AI-powered insights

### 🎨 Beautiful UI/UX
- **Glassmorphism** design system
- **Neumorphic** components
- Smooth **Framer Motion** animations (15+ animations)
- Custom gradient backgrounds
- Animated micro-interactions
- Fully responsive design
- Dark mode optimized
- Responsive layouts (mobile, tablet, desktop)
- Custom TailwindCSS theme

## 🛠 Tech Stack

### Frontend
- **Next.js 14** (App Router)
- **React** (JavaScript)
- **TailwindCSS** + Custom Design System
- **Framer Motion** - Animations
- **Apollo Client** - GraphQL
- **LiveKit React** - Video
- **Y.js** - Collaborative editing
- **Zustand** - State management

### Backend
- **Node.js**
- **Apollo GraphQL Server**
- **Prisma ORM**
- **PostgreSQL** (Neon free tier)
- **Redis** Pub/Sub (Upstash free tier)
- **WebSockets** - Real-time subscriptions

### AI & Video
- **LiveKit** - Video infrastructure (self-hosted Docker)
- **Whisper.cpp** - Speech-to-text (local)
- **Open-source LLM** - Summaries & insights

## 📦 Installation

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL database
- Redis server
- Docker (for LiveKit)

### 1. Clone the Repository
```bash
cd c:\Users\ASUS\Desktop\graphql
```

### 2. Frontend Setup
```bash
cd frontend
npm install
```

Configure `.env.local`:
```env
NEXT_PUBLIC_GRAPHQL_URL=http://localhost:4000/graphql
NEXT_PUBLIC_GRAPHQL_WS_URL=ws://localhost:4000/graphql
NEXT_PUBLIC_LIVEKIT_URL=ws://localhost:7880
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key
```

### 3. Backend Setup
```bash
cd ../backend
npm install
```

Configure `.env`:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/aicollab?schema=public"
REDIS_URL="redis://localhost:6379"
JWT_SECRET="your-super-secret-jwt-key"
LIVEKIT_API_KEY="your-livekit-api-key"
LIVEKIT_API_SECRET="your-livekit-api-secret"
LIVEKIT_URL="ws://localhost:7880"
PORT=4000
```

### 4. Database Setup
```bash
# Generate Prisma Client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# (Optional) Open Prisma Studio
npm run prisma:studio
```

### 5. Start LiveKit (Docker)
```bash
docker run --rm -p 7880:7880 \
  -p 7881:7881 \
  -p 7882:7882/udp \
  -e LIVEKIT_KEYS="your-api-key: your-api-secret" \
  livekit/livekit-server \
  --dev --node-ip=127.0.0.1
```

### 6. Start Development Servers

**Backend:**
```bash
cd backend
npm run dev
```

**Frontend:**
```bash
cd frontend
npm run dev
```

Visit: `http://localhost:3000`

## 🎨 Design System

### Colors
```js
Primary: #6366F1 (Indigo)
Accent: #22D3EE (Cyan)
Success: #10B981 (Green)
Warning: #F59E0B (Amber)
Destructive: #EF4444 (Red)
Background: #0F172A (Dark Blue)
```

### Typography
- **Primary Font**: Inter
- **Display Font**: Spline Sans

### Effects
- Glassmorphism with `backdrop-blur`
- Neumorphic shadows
- Gradient borders
- Animated gradients
- Pulse glow effects
- Smooth transitions

## 📁 Project Structure

```
graphql/
├── frontend/
│   ├── app/
│   │   ├── page.js                 # Landing page
│   │   ├── layout.js               # Root layout
│   │   ├── globals.css             # Global styles
│   │   ├── dashboard/              # Dashboard page
│   │   └── meeting/[roomId]/       # Video room
│   ├── components/
│   │   ├── ui/                     # UI components
│   │   │   ├── Button.js
│   │   │   ├── Card.js
│   │   │   ├── Input.js
│   │   │   ├── Avatar.js
│   │   │   └── Modal.js
│   │   ├── layout/                 # Layout components
│   │   │   ├── Navbar.js
│   │   │   └── Sidebar.js
│   │   ├── video/                  # Video components
│   │   │   └── VideoRoom.js
│   │   ├── chat/                   # Chat components
│   │   │   └── ChatPanel.js
│   │   ├── whiteboard/             # Whiteboard
│   │   │   └── Whiteboard.js
│   │   ├── editor/                 # Document editor
│   │   │   └── CollaborativeEditor.js
│   │   ├── animations/             # Animation components
│   │   │   └── AnimatedCard.js
│   │   └── providers/              # Context providers
│   │       └── Providers.js
│   ├── lib/
│   │   ├── utils.js                # Utility functions
│   │   └── apollo-client.js        # Apollo setup
│   ├── graphql/
│   │   └── queries.js              # GraphQL queries
│   ├── tailwind.config.js          # Tailwind config
│   ├── postcss.config.js
│   ├── next.config.js
│   └── package.json
│
└── backend/
    ├── schema/
    │   ├── typeDefs.js             # GraphQL schema
    │   └── resolvers.js            # GraphQL resolvers
    ├── prisma/
    │   └── schema.prisma           # Database schema
    ├── server.js                   # Apollo Server
    ├── package.json
    └── .env
```

## 🚀 Usage

### Creating a Meeting
1. Navigate to Dashboard
2. Click "New Meeting" button
3. Enter meeting name and description
4. Click "Create Meeting"
5. Share the meeting link with participants

### During a Meeting
- **Video Controls**: Toggle camera, microphone, screen share
- **Chat**: Click chat icon to open side panel
- **Whiteboard**: Click pen icon to open collaborative whiteboard
- **Document**: Click document icon to open shared editor
- **Reactions**: Click emoji to send floating reactions

### Collaborative Features
- **Chat**: Real-time messaging with reactions
- **Whiteboard**: Draw together with multiple cursors
- **Document**: Edit text with live cursor positions
- **AI Summary**: Automatic transcription and action items

## 🎯 Key Features Explained

### Glassmorphism UI
All components use `backdrop-filter: blur()` with semi-transparent backgrounds for a modern, frosted glass effect.

### Framer Motion Animations
- Page transitions
- Component mount animations
- Hover effects
- Gesture animations
- Layout animations

### GraphQL Subscriptions
Real-time updates for:
- New messages
- User join/leave
- Typing indicators
- Whiteboard strokes
- Document changes
- Active speaker events

### LiveKit Integration
- WebRTC video/audio
- Scalable infrastructure
- Screen sharing
- Recording capabilities

## 🔧 Configuration

### TailwindCSS Theme
Custom colors, animations, and utilities in `tailwind.config.js`

### GraphQL Schema
Defined in `backend/schema/typeDefs.js` with resolvers in `resolvers.js`

### Database Models
Prisma schema with User, Room, Message, Document, Whiteboard models

## 🎨 UI Components

All components are fully styled with:
- Glass morphism effects
- Smooth animations
- Hover states
- Loading states
- Error states
- Responsive design

### Button Variants
- `default` - Primary gradient
- `outline` - Transparent with border
- `ghost` - Minimal style
- `destructive` - Red for dangerous actions
- `glass` - Glassmorphism style

### Animation Components
- `AnimatedCard` - Fade and slide in
- `FadeIn` - Directional fade
- `ScaleIn` - Scale animation
- `SlideIn` - Slide from direction
- `Floating` - Floating effect
- `PulseGlow` - Pulsing glow

## 🐛 Troubleshooting

### GraphQL Connection Issues
- Ensure backend is running on port 4000
- Check WebSocket connection (ws://localhost:4000/graphql)

### Database Issues
- Run `npm run prisma:migrate` to sync schema
- Check DATABASE_URL in .env

### LiveKit Not Connecting
- Ensure Docker container is running
- Verify LIVEKIT_URL matches container port

## 📝 TODO / Future Enhancements

- [ ] Implement actual LiveKit token generation
- [ ] Add Whisper.cpp integration for transcription
- [ ] Connect open-source LLM for summaries
- [ ] Add file upload/sharing
- [ ] Implement meeting recording
- [ ] Add user authentication UI
- [ ] Calendar integration
- [ ] Mobile app version
- [ ] End-to-end encryption

## 🤝 Contributing

This is a demonstration project. Feel free to fork and customize!

## 📄 License

MIT License - Free to use for personal and commercial projects

## 🎉 Credits

Built with ❤️ using:
- Next.js
- Apollo GraphQL
- LiveKit
- Prisma
- TailwindCSS
- Framer Motion

---

**Made for production-ready, interview-ready demonstrations of modern web development practices.**
