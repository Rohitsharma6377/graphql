// Singleton Ably client to prevent multiple connections
// Vercel-compatible with token auth

import Ably from 'ably'

let ablyClientInstance: Ably.Realtime | null = null

export function getAblyClient(): Ably.Realtime {
  // Only create on client side
  if (typeof window === 'undefined') {
    throw new Error('Ably client can only be created on client side')
  }

  if (!ablyClientInstance) {
    console.log('🔧 Creating new Ably client instance')

    ablyClientInstance = new Ably.Realtime({
      authUrl: '/api/ably/token',
      authMethod: 'GET',
      // Auto-reconnect settings
      disconnectedRetryTimeout: 15000,
      suspendedRetryTimeout: 30000,
      autoConnect: true,
    })

    // Connection event handlers
    ablyClientInstance.connection.on('connected', () => {
      console.log('✅ Ably singleton connected')
    })

    ablyClientInstance.connection.on('disconnected', () => {
      console.warn('⚠️ Ably singleton disconnected')
    })

    ablyClientInstance.connection.on('failed', (error) => {
      console.error('❌ Ably singleton failed:', error)
    })

    // Mobile keep-alive fix
    ablyClientInstance.connection.once('connected', () => {
      try {
        const transport = (ablyClientInstance as any).connection.connectionManager.activeProtocol?.transport
        if (transport && transport.sendChannel) {
          transport.sendChannel({
            action: 16,
            keepAliveInterval: 30000,
          })
          console.log('📱 Mobile keep-alive enabled (singleton)')
        }
      } catch (err) {
        // Ignore
      }
    })
  }

  return ablyClientInstance
}

export function disconnectAblyClient(): void {
  if (ablyClientInstance) {
    console.log('🔌 Disconnecting Ably singleton')
    ablyClientInstance.close()
    ablyClientInstance = null
  }
}

// Cleanup on window unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    disconnectAblyClient()
  })
}
