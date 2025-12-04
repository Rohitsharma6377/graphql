import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import AdminSettings from '@/models/AdminSettings'

export async function GET(req: Request) {
  try {
    await dbConnect()

    let settings = await AdminSettings.findOne()

    if (!settings) {
      settings = await AdminSettings.create({
        adsEnabled: false,
        premiumPrice: 9.99,
        maxParticipantsFree: 2,
        defaultCoinReward: 100,
      })
    }

    return NextResponse.json({
      success: true,
      settings,
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

export async function PATCH(req: Request) {
  try {
    await dbConnect()

    const data = await req.json()

    let settings = await AdminSettings.findOne()

    if (!settings) {
      settings = await AdminSettings.create(data)
    } else {
      settings = await AdminSettings.findOneAndUpdate({}, data, { new: true })
    }

    return NextResponse.json({
      success: true,
      settings,
      message: 'Settings updated successfully',
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
