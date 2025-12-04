'use client'

import { ApolloProvider } from '@/lib/apollo-client'
import { SessionProvider } from 'next-auth/react'
import { Toaster } from 'react-hot-toast'

export function Providers({ children }) {
  return (
    <SessionProvider>
      <ApolloProvider>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: 'rgba(255, 255, 255, 0.08)',
              backdropFilter: 'blur(20px)',
              color: '#F8FAFC',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '1rem',
              padding: '16px',
            },
            success: {
              iconTheme: {
                primary: '#10B981',
                secondary: '#F8FAFC',
              },
            },
            error: {
              iconTheme: {
                primary: '#EF4444',
                secondary: '#F8FAFC',
              },
            },
          }}
        />
      </ApolloProvider>
    </SessionProvider>
  )
}
