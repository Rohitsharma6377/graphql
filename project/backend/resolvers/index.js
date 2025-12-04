/**
 * Main Resolvers Index
 * Combines all resolver modules into a single export
 */

import { queries } from './queries.js'
import { authMutations } from './mutations/auth.js'
import { roomMutations } from './mutations/room.js'
import { messageMutations } from './mutations/message.js'
import { documentMutations } from './mutations/document.js'
import { realtimeMutations } from './mutations/realtime.js'
import { mediaMutations } from './mutations/media.js'
import { subscriptions } from './subscriptions.js'
import { fieldResolvers } from './fieldResolvers.js'

export const resolvers = {
  Query: queries,
  
  Mutation: {
    // Auth mutations
    ...authMutations,
    
    // Room mutations
    ...roomMutations,
    
    // Message mutations
    ...messageMutations,
    
    // Document mutations
    ...documentMutations,
    
    // Real-time mutations
    ...realtimeMutations,
    
    // Media mutations (whiteboard, recording, transcript)
    ...mediaMutations,
  },
  
  Subscription: subscriptions,
  
  // Field resolvers
  ...fieldResolvers,
}
