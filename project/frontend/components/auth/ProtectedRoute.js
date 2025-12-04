'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { LoadingSpinner } from '@/components/ui/Loading'

export function ProtectedRoute({ children }) {
  const router = useRouter()
  const { data: session, status } = useSession()

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status, router])

  if (status === 'loading') {
    return <LoadingSpinner fullScreen />
  }

  if (status === 'unauthenticated') {
    return null
  }

  return <>{children}</>
}
