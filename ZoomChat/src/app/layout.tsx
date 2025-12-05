import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import ThemeProvider from '@/components/ThemeProvider'
import { AuthProvider } from '@/contexts/AuthContext'
import PermissionRequest from '@/components/PermissionRequest'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'ZoomChat - Professional Video Conferencing',
  description: 'Blazing-fast video conferencing powered by Zustand + Ably + WebRTC',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <ThemeProvider>
            <PermissionRequest />
            {children}
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
