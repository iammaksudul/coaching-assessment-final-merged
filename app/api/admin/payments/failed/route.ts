import { NextResponse } from "next/server"
import { getAuthUser } from "@/lib/get-auth-user"
import { sql } from "@/lib/db"

export async function GET(req: Request) {
  try {
    const user = await getAuthUser(req)
    if (!user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const failedPayments = await sql`
      SELECT
        pa.id, pa.subscription_id, pa.amount, pa.currency, pa.status,
        pa.failure_code, pa.failure_message, pa.attempted_at, pa.next_retry_at, pa.retry_count,
        s.stripe_customer_id, s.organization_id,
        o.name as organization_name, o.billing_email as customer_email,
        (SELECT name FROM users u JOIN organization_users ou ON u.id = ou.user_id WHERE ou.organization_id = o.id LIMIT 1) as customer_name
      FROM payment_attempts pa
      JOIN subscriptions s ON pa.subscription_id = s.id
      LEFT JOIN organizations o ON s.organization_id = o.id
      WHERE pa.status IN ('failed', 'FAILED', 'requires_action')
      ORDER BY pa.attempted_at DESC
      LIMIT 50
    `
    return NextResponse.json({ failedPayments: failedPayments || [] })
  } catch (error) {
    console.error("Error fetching failed payments:", error)
    return NextResponse.json({ failedPayments: [] })
  }
}
