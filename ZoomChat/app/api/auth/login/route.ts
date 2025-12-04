import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import User from '@/models/User'
import bcrypt from 'bcryptjs'

export async function POST(req: Request) {
  try {
    await dbConnect()

    const { email, password } = await req.json()

    // Validation
    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() })
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Check if banned
    if (user.banned) {
      return NextResponse.json(
        { success: false, error: 'Your account has been banned' },
        { status: 403 }
      )
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password)
    if (!isValidPassword) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Return user without password
    const userWithoutPassword = {
      _id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      coins: user.coins,
      avatar: user.avatar,
      banned: user.banned,
    }

    return NextResponse.json({
      success: true,
      message: 'Login successful',
      user: userWithoutPassword,
    })
  } catch (error: any) {
    console.error('Login error:', error)
    return NextResponse.json(
      { success: false, error: 'Login failed' },
      { status: 500 }
    )
  }
}
