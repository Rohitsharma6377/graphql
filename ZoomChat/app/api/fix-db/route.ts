import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import mongoose from 'mongoose'

export async function GET() {
  try {
    await dbConnect()

    const db = mongoose.connection.db
    if (!db) {
      return NextResponse.json(
        { success: false, error: 'Database connection not established' },
        { status: 500 }
      )
    }

    const usersCollection = db.collection('users')

    // Get current indexes
    const indexes = await usersCollection.indexes()
    const indexNames = indexes.map(i => i.name)

    console.log('Current indexes:', indexNames)

    // Drop username_1 index if it exists
    if (indexNames.includes('username_1')) {
      await usersCollection.dropIndex('username_1')
      return NextResponse.json({
        success: true,
        message: 'Dropped username_1 index successfully',
        remainingIndexes: (await usersCollection.indexes()).map(i => i.name)
      })
    }

    return NextResponse.json({
      success: true,
      message: 'No problematic indexes found',
      currentIndexes: indexNames
    })
  } catch (error: any) {
    console.error('Error fixing indexes:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error.message,
        note: 'Try running: db.users.dropIndex("username_1") in MongoDB shell'
      },
      { status: 500 }
    )
  }
}
