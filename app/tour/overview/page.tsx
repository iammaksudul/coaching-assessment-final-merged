import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft, BarChart3 } from "lucide-react"

export default function TourOverviewPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <BarChart3 className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">Coaching Digs</span>
          </div>
          <Button variant="outline" asChild>
            <Link href="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Link>
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Platform Tour</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Explore the key features of our coachability assessment platform
          </p>
        </div>

        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle>Tour Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-gray-100 rounded-lg p-8 text-center">
              <p className="text-gray-600 mb-4">
                Screenshots and detailed explanations will be added here to showcase the platform features.
              </p>
              <p className="text-sm text-gray-500">This page is ready for screenshot uploads and content.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <Button asChild className="h-16">
                <Link href="/tour/individual-dashboard">
                  <div className="text-center">
                    <div className="font-semibold">Individual Dashboard</div>
                    <div className="text-sm opacity-75">Personal development tracking</div>
                  </div>
                </Link>
              </Button>

              <Button asChild variant="outline" className="h-16">
                <Link href="/tour/employer-dashboard">
                  <div className="text-center">
                    <div className="font-semibold">Employer Dashboard</div>
                    <div className="text-sm opacity-75">Team management & analytics</div>
                  </div>
                </Link>
              </Button>

              <Button asChild variant="outline" className="h-16">
                <Link href="/tour/assessment-process">
                  <div className="text-center">
                    <div className="font-semibold">Assessment Process</div>
                    <div className="text-sm opacity-75">12-domain evaluation</div>
                  </div>
                </Link>
              </Button>

              <Button asChild variant="outline" className="h-16">
                <Link href="/tour/reports-analytics">
                  <div className="text-center">
                    <div className="font-semibold">Reports & Analytics</div>
                    <div className="text-sm opacity-75">Insights & recommendations</div>
                  </div>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
