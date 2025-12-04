import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import User from '@/models/User'

export async function GET(req: Request) {
  try {
    await dbConnect()

    const users = await User.find({}).select('-password').sort({ createdAt: -1 })

    const stats = {
      total: users.length,
      premium: users.filter((u) => u.role === 'premium').length,
      admins: users.filter((u) => u.role === 'admin').length,
      banned: users.filter((u) => u.banned).length,
    }

    return NextResponse.json({
      success: true,
      users,
      stats,
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
