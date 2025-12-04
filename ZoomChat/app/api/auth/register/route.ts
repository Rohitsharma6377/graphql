import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import User from '@/models/User'
import bcrypt from 'bcryptjs'
import mongoose from 'mongoose'

export async function POST(req: Request) {
  try {
    await dbConnect()

    // Fix database indexes if needed (auto-fix for username_1 index issue)
    try {
      const db = mongoose.connection.db
      if (db) {
        const usersCollection = db.collection('users')
        const indexes = await usersCollection.indexes()
        const hasUsernameIndex = indexes.some(idx => idx.name === 'username_1')
        
        if (hasUsernameIndex) {
          console.log('Dropping old username_1 index...')
          await usersCollection.dropIndex('username_1')
          console.log('✓ Dropped username_1 index')
        }
      }
    } catch (indexError: any) {
      console.log('Index check/drop info:', indexError.message)
    }

    const { name, email, password } = await req.json()

    // Validation
    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, error: 'All fields are required' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 6 characters' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() })
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'Email already registered' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: 'user',
      banned: false,
      coins: 100,
    })

    // Return user without password
    const userWithoutPassword = {
      _id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      coins: user.coins,
      avatar: user.avatar,
    }

    return NextResponse.json({
      success: true,
      message: 'Registration successful',
      user: userWithoutPassword,
    })
  } catch (error: any) {
    console.error('Registration error:', error)
    
    // Provide more specific error messages
    if (error.code === 11000) {
      if (error.keyPattern?.email) {
        return NextResponse.json(
          { success: false, error: 'Email already registered' },
          { status: 400 }
        )
      }
      // Handle username index issue
      if (error.keyPattern?.username) {
        return NextResponse.json(
          { success: false, error: 'Database index issue. Please refresh and try again.' },
          { status: 500 }
        )
      }
      return NextResponse.json(
        { success: false, error: 'Duplicate entry detected. Please try again.' },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { success: false, error: 'Registration failed. Please try again.' },
      { status: 500 }
    )
  }
}
