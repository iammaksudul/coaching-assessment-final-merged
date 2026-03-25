import { NextResponse } from "next/server"
import { getAuthUser } from "@/lib/get-auth-user"
import { sql } from "@/lib/db"

export async function POST(request: Request) {
  try {
    const session = { user: await getAuthUser(request) }

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is admin
    const user = await sql`
      SELECT role FROM users WHERE id = ${session.user.id}
    `

    if (!user[0] || user[0].role !== "ADMIN") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    const { subscriptionId, days, notes } = await request.json()

    // Extend grace period
    await sql`
      UPDATE subscriptions 
      SET grace_period_ends_at = CURRENT_TIMESTAMP + INTERVAL '${days} days'
      WHERE stripe_subscription_id = ${subscriptionId}
    `

    // Log admin action
    await sql`
      INSERT INTO admin_actions (admin_user_id, target_subscription_id, action_type, action_details, notes)
      VALUES (${session.user.id}, ${subscriptionId}, 'extend_grace', ${JSON.stringify({ days })}, ${notes || null})
    `

    return NextResponse.json({
      success: true,
      message: `Grace period extended by ${days} days`,
    })
  } catch (error) {
    console.error("Error extending grace period:", error)
    return NextResponse.json({ error: "Failed to extend grace period" }, { status: 500 })
  }
}
