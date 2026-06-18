import { getServerSession } from "next-auth/next"
import { getUserById } from "@/lib/db"

/**
 * Unified auth: checks x-user-id header first, then NextAuth session.
 * Returns { id, email, name, role } or null.
 */
export async function getAuthUser(req?: Request): Promise<{ id: string; email?: string; name?: string; role?: string } | null> {
  // 1. Check x-user-id header
  if (req) {
    const userId = req.headers.get("x-user-id")
    if (userId && userId !== "undefined" && userId !== "null") {
      try {
        const user = await getUserById(userId)
        if (user) return user
      } catch {
        // fall through
      }
      // If user not found in DB but ID looks valid, return minimal
      return { id: userId }
    }
  }

  // 2. Fallback to NextAuth session
  try {
    const session = await getServerSession()
    if (session?.user?.id) return session.user as any
  } catch {
    // NextAuth not configured
  }

  return null
}
