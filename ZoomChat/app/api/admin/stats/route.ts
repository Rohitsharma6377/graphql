import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import User from '@/models/User'
import Room from '@/models/Room'

export async function GET(req: Request) {
  try {
    await dbConnect()

    const [
      totalUsers,
      premiumUsers,
      activeRooms,
      bannedUsers,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'premium' }),
      Room.countDocuments({ active: true }),
      User.countDocuments({ banned: true }),
    ])

    // Get new users in last 7 days
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const newUsers = await User.countDocuments({
      createdAt: { $gte: sevenDaysAgo },
    })

    return NextResponse.json({
      success: true,
      stats: {
        totalUsers,
        premiumUsers,
        activeRooms,
        bannedUsers,
        newUsers,
        earnings: premiumUsers * 9.99, // Mock earnings
      },
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
