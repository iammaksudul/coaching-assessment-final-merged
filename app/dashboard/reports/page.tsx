import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { FileText, Download } from "lucide-react"

// This would come from your database in a real implementation
const mockReports = [
  {
    id: "1",
    title: "Coachability Assessment - May 2023",
    createdAt: "2023-05-20T15:30:00Z",
    refereeCount: 3,
    status: "Complete",
  },
]

export default function ReportsPage() {
  // In a real implementation, this would fetch data from your API
  const reports = mockReports

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
              {reports.map((report) => (
                <div key={report.id} className="flex items-center justify-between rounded-lg border p-4">
                  <div className="flex items-center gap-4">
                    <div className="rounded-full bg-primary/10 p-2">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">{report.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        Created on {new Date(report.createdAt).toLocaleDateString()} • {report.refereeCount} referee
                        {report.refereeCount !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/dashboard/reports/${report.id}`}>
                      <Button variant="outline">View</Button>
                    </Link>
                    <Button variant="outline" size="icon">
                      <Download className="h-4 w-4" />
                      <span className="sr-only">Download</span>
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
