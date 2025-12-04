import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Room from '@/models/Room'

export async function GET(
  req: Request,
  { params }: { params: { roomId: string } }
) {
  try {
    await dbConnect()

    const room = await Room.findOne({ roomId: params.roomId })
      .populate('host', 'name email avatar role')
      .populate('participants.userId', 'name email avatar role')

    if (!room) {
      return NextResponse.json(
        { success: false, error: 'Room not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      room,
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
