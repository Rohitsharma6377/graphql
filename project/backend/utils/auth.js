import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { JWT_CONFIG } from '../config/constants.js'

/**
 * Hash a password using bcrypt
 * @param {string} password - Plain text password
 * @returns {Promise<string>} Hashed password
 */
export const hashPassword = async (password) => {
  return await bcrypt.hash(password, 10)
}

/**
 * Compare password with hash
 * @param {string} password - Plain text password
 * @param {string} hash - Hashed password
 * @returns {Promise<boolean>} True if passwords match
 */
export const comparePassword = async (password, hash) => {
  return await bcrypt.compare(password, hash)
}

/**
 * Generate JWT token for user
 * @param {object} user - User object with id
 * @returns {string} JWT token
 */
export const generateToken = (user) => {
  return jwt.sign({ id: user.id }, JWT_CONFIG.SECRET, { 
    expiresIn: JWT_CONFIG.EXPIRES_IN 
  })
}

/**
 * Generate password reset token
 * @param {object} user - User object with id
 * @returns {string} Reset token
 */
export const generateResetToken = (user) => {
  return jwt.sign(
    { id: user.id, type: 'reset' }, 
    JWT_CONFIG.SECRET, 
    { expiresIn: JWT_CONFIG.RESET_TOKEN_EXPIRES }
  )
}

/**
 * Verify JWT token
 * @param {string} token - JWT token
 * @returns {object} Decoded token payload
 */
export const verifyToken = (token) => {
  return jwt.verify(token, JWT_CONFIG.SECRET)
}

/**
 * Extract user from JWT token
 * @param {string} token - JWT token (with or without 'Bearer ' prefix)
 * @returns {object|null} User object or null
 */
export const getUserFromToken = (token) => {
  try {
    if (!token) return null
    
    // Remove 'Bearer ' prefix if present
    const cleanToken = token.replace('Bearer ', '')
    
    const decoded = verifyToken(cleanToken)
    return { id: decoded.id }
  } catch (error) {
    return null
  }
}
