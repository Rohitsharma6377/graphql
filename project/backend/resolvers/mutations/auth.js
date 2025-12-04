import { prisma } from '../../config/database.js'
import { hashPassword, comparePassword, generateToken, generateResetToken, verifyToken } from '../../utils/auth.js'

/**
 * User signup mutation
 */
export const signup = async (_, { email, name, password }) => {
  const hashedPassword = await hashPassword(password)
  const user = await prisma.user.create({
    data: {
      email,
      name,
      password: hashedPassword,
    },
  })
  const token = generateToken(user)
  return { token, user }
}

/**
 * User login mutation
 */
export const login = async (_, { email, password }) => {
  const user = await prisma.user.findUnique({ where: { email } })
  
  if (!user) {
    throw new Error('User not found')
  }
  
  const valid = await comparePassword(password, user.password)
  if (!valid) {
    throw new Error('Invalid password')
  }
  
  const token = generateToken(user)
  return { token, user }
}

/**
 * Request password reset
 */
export const requestPasswordReset = async (_, { email }) => {
  const user = await prisma.user.findUnique({ where: { email } })
  
  if (!user) {
    // Don't reveal if user exists
    return { success: true, message: 'If an account exists, a reset link has been sent.' }
  }
  
  const resetToken = generateResetToken(user)
  
  // TODO: Send email with resetToken
  console.log(`Password reset token for ${email}: ${resetToken}`)
  
  return { success: true, message: 'If an account exists, a reset link has been sent.' }
}

/**
 * Reset password with token
 */
export const resetPassword = async (_, { token, newPassword }) => {
  try {
    const decoded = verifyToken(token)
    if (decoded.type !== 'reset') {
      throw new Error('Invalid token')
    }
    
    const hashedPassword = await hashPassword(newPassword)
    const user = await prisma.user.update({
      where: { id: decoded.id },
      data: { password: hashedPassword },
    })
    
    const authToken = generateToken(user)
    return { token: authToken, user }
  } catch (error) {
    throw new Error('Invalid or expired reset token')
  }
}

/**
 * Update user status
 */
export const updateUserStatus = async (_, { status }, { user }) => {
  if (!user) throw new Error('Not authenticated')
  
  return await prisma.user.update({
    where: { id: user.id },
    data: { status },
  })
}

export const authMutations = {
  signup,
  login,
  requestPasswordReset,
  resetPassword,
  updateUserStatus,
}
