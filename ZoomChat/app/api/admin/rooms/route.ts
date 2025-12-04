import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Room from '@/models/Room'

export async function GET(req: Request) {
  try {
    await dbConnect()

    const rooms = await Room.find({ active: true })
      .populate('host', 'name email avatar')
      .populate('participants.userId', 'name email avatar')
      .sort({ createdAt: -1 })

    const stats = {
      total: rooms.length,
      totalParticipants: rooms.reduce((sum, room) => sum + room.participants.length, 0),
    }

    return NextResponse.json({
      success: true,
      rooms,
      stats,
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
