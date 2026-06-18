import { redirect } from "next/navigation"

export default function EmployerPreviewPage() {
  // Redirect to the actual organization dashboard
  redirect("/organization-dashboard")
}
