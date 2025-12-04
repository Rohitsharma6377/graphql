import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Room from '@/models/Room'

export async function PATCH(
  req: Request,
  { params }: { params: { roomId: string } }
) {
  try {
    await dbConnect()

    const room = await Room.findOneAndUpdate(
      { roomId: params.roomId },
      { active: false, updatedAt: new Date() },
      { new: true }
    )

    if (!room) {
      return NextResponse.json(
        { success: false, error: 'Room not found' },
        { status: 404 }
      )
    }

    // Emit Socket.IO event to force close room
    // This will be handled by the Socket.IO server
    global.io?.to(params.roomId).emit('force-end-room', {
      message: 'Room has been closed by admin',
    })

    return NextResponse.json({
      success: true,
      message: 'Room closed successfully',
      room,
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
