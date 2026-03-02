import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

/**
 * Get the current session, or return null if not authenticated.
 */
export async function getOptionalSession() {
  return getServerSession(authOptions)
}

/**
 * Get the current session, or throw a 401-style error if not authenticated.
 * Use this in API routes that require authentication.
 */
export async function getRequiredSession() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    throw new Error('Unauthorized')
  }
  return session
}
