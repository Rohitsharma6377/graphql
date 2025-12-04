import Ably from 'ably'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const apiKey = process.env.ABLY_API_KEY || process.env.NEXT_PUBLIC_ABLY_KEY

    if (!apiKey) {
      console.error('❌ ABLY_API_KEY not found in environment variables')
      return NextResponse.json(
        { error: 'Ably API key not configured' },
        { status: 500 }
      )
    }

    // Create REST client (serverless-safe)
    const client = new Ably.Rest({ key: apiKey })

    // Create token request with 1 hour TTL
    const tokenRequest = await client.auth.createTokenRequest({
      ttl: 3600 * 1000, // 1 hour
      capability: {
        '*': ['publish', 'subscribe', 'presence'], // All channels, all capabilities
      },
    })

    return NextResponse.json(tokenRequest)
  } catch (error) {
    console.error('❌ Error creating Ably token:', error)
    return NextResponse.json(
      { error: 'Failed to create token' },
      { status: 500 }
    )
  }
}
