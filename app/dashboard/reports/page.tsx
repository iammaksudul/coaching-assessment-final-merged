"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { FileText, Download, Loader2 } from "lucide-react"
import { useSession } from "@/components/auth-provider"

export default function ReportsPage() {
  const { data: session } = useSession()
  const [reports, setReports] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (session?.user?.id) fetchReports()
  }, [session])

  const fetchReports = async () => {
    try {
      const res = await fetch("/api/dashboard")
      if (res.ok) {
        const data = await res.json()
        // Filter to only completed assessments (those that can have reports)
        const completed = (data.assessments || []).filter(
          (a: any) => a.status === "COMPLETED"
        )
        setReports(completed)
      }
    } catch (error) {
      console.error("Error fetching reports:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 py-8">
      <h1 className="text-3xl font-bold">Reports</h1>
      <p className="text-muted-foreground">View and download your coachability assessment reports.</p>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Your Reports</CardTitle>
          <CardDescription>Access your completed coachability assessment reports.</CardDescription>
        </CardHeader>
        <CardContent>
          {reports.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <p className="text-muted-foreground">
                You don't have any completed reports yet. Complete a self-assessment and get at least 2 referee
                responses to generate a report.
              </p>
              <Link href="/dashboard/assessments/new" className="mt-4">
                <Button>Start Assessment</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {reports.map((report: any) => (
                <div key={report.id} className="flex items-center justify-between rounded-lg border p-4">
                  <div className="flex items-center gap-4">
                    <div className="rounded-full bg-primary/10 p-2">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">{report.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        Completed {new Date(report.updated_at || report.created_at).toLocaleDateString()} •{" "}
                        {report.referee_count || 0} referee{report.referee_count !== 1 ? "s" : ""}
                        {report.completion_rate != null && ` • ${report.completion_rate}% complete`}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/dashboard/reports/${report.id}`}>
                      <Button variant="outline">View Report</Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        const w = window.open(`/dashboard/reports/${report.id}`, '_blank')
                        if (w) {
                          w.addEventListener('load', () => setTimeout(() => w.print(), 500))
                        }
                      }}
                    >
                      <Download className="h-4 w-4" />
                      <span className="sr-only">Download PDF</span>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
