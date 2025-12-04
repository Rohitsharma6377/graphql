// Script to fix database indexes
// Run this with: node scripts/fix-db-indexes.js

const mongoose = require('mongoose')

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/heartshare'

async function fixIndexes() {
  try {
    console.log('Connecting to MongoDB...')
    await mongoose.connect(MONGODB_URI)
    console.log('Connected!')

    const db = mongoose.connection.db
    const usersCollection = db.collection('users')

    // Get all indexes
    console.log('\nCurrent indexes on users collection:')
    const indexes = await usersCollection.indexes()
    indexes.forEach(index => {
      console.log(`  - ${JSON.stringify(index.key)} (${index.name})`)
    })

    // Drop the username index if it exists
    try {
      console.log('\nDropping username_1 index...')
      await usersCollection.dropIndex('username_1')
      console.log('✓ Successfully dropped username_1 index')
    } catch (error) {
      if (error.codeName === 'IndexNotFound') {
        console.log('✓ Index username_1 does not exist (already dropped)')
      } else {
        console.error('Error dropping index:', error.message)
      }
    }

    // Show remaining indexes
    console.log('\nRemaining indexes:')
    const remainingIndexes = await usersCollection.indexes()
    remainingIndexes.forEach(index => {
      console.log(`  - ${JSON.stringify(index.key)} (${index.name})`)
    })

    console.log('\n✓ Database indexes fixed!')
    process.exit(0)
  } catch (error) {
    console.error('Error:', error)
    process.exit(1)
  }
}

fixIndexes()
