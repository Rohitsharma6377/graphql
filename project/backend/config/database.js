import { PrismaClient } from '@prisma/client'
import { PubSub } from 'graphql-subscriptions'

// Singleton instances
let prismaInstance = null
let pubsubInstance = null

export const getPrisma = () => {
  if (!prismaInstance) {
    prismaInstance = new PrismaClient()
  }
  return prismaInstance
}

export const getPubSub = () => {
  if (!pubsubInstance) {
    pubsubInstance = new PubSub()
  }
  return pubsubInstance
}

export const prisma = getPrisma()
export const pubsub = getPubSub()
