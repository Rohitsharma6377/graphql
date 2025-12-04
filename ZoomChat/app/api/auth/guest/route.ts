import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { name } = await req.json()

    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Guest name is required' },
        { status: 400 }
      )
    }

    // Create guest user object (not saved to database)
    const guestUser = {
      _id: `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: name.trim(),
      email: null,
      role: 'guest',
      coins: 0,
      isGuest: true,
    }

    return NextResponse.json({
      success: true,
      message: 'Guest session created',
      user: guestUser,
    })
  } catch (error: any) {
    console.error('Guest login error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create guest session' },
      { status: 500 }
    )
  }
}
