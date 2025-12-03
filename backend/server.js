import { ApolloServer } from '@apollo/server'
import { expressMiddleware } from '@apollo/server/express4'
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer'
import { createServer } from 'http'
import { makeExecutableSchema } from '@graphql-tools/schema'
import { WebSocketServer } from 'ws'
import { useServer } from 'graphql-ws/lib/use/ws'
import express from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
import { typeDefs } from './schema/typeDefs.js'
import { resolvers } from './schema/resolvers.js'

dotenv.config()

const app = express()
const httpServer = createServer(app)

// Create GraphQL schema
const schema = makeExecutableSchema({ typeDefs, resolvers })

// WebSocket server for subscriptions
const wsServer = new WebSocketServer({
  server: httpServer,
  path: '/graphql',
})

const serverCleanup = useServer({ schema }, wsServer)

// Apollo Server setup
const server = new ApolloServer({
  schema,
  plugins: [
    ApolloServerPluginDrainHttpServer({ httpServer }),
    {
      async serverWillStart() {
        return {
          async drainServer() {
            await serverCleanup.dispose()
          },
        }
      },
    },
  ],
})

await server.start()

// Middleware to extract user from JWT
const getUserFromToken = (token) => {
  if (!token) return null
  try {
    return jwt.verify(token, process.env.JWT_SECRET)
  } catch (error) {
    return null
  }
}

app.use(
  '/graphql',
  cors({
    origin: ['http://localhost:3000', 'http://localhost:4000'],
    credentials: true,
  }),
  bodyParser.json(),
  expressMiddleware(server, {
    context: async ({ req }) => {
      const token = req.headers.authorization?.replace('Bearer ', '') || ''
      const user = getUserFromToken(token)
      return { user }
    },
  })
)

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'AI Video Collab Backend is running!' })
})

// LiveKit token endpoint
app.post('/api/livekit/token', async (req, res) => {
  const { roomName, participantName } = req.body
  
  // This is a placeholder - you'll need to implement actual LiveKit token generation
  // using the livekit-server-sdk package
  res.json({
    token: 'placeholder-livekit-token',
    url: process.env.LIVEKIT_URL
  })
})

const PORT = process.env.PORT || 4000

httpServer.listen(PORT, () => {
  console.log(`
  🚀 Server ready!
  
  📡 GraphQL endpoint: http://localhost:${PORT}/graphql
  🔌 WebSocket endpoint: ws://localhost:${PORT}/graphql
  💚 Health check: http://localhost:${PORT}/health
  
  🎨 GraphQL Playground available at: http://localhost:${PORT}/graphql
  `)
})
